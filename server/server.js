const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const db = require("./db");
const { readSettings, writeSettings } = require("./paths");

const rootDir = path.resolve(__dirname, "..");

// Nap bien moi truong tu file .env (neu co) truoc khi doc cau hinh.
try {
  process.loadEnvFile(path.join(rootDir, ".env"));
} catch {
  // Khong co .env cung khong sao, van chay duoc cac chuc nang khong can AI.
}

const port = Number(process.env.PORT || 5173);

// Cac vi tri TeX pho bien tren Mac va Windows, ghep them PATH he thong.
const texCandidates = [
  "/Library/TeX/texbin",
  "/usr/local/texlive/2025/bin/universal-darwin",
  "/usr/local/bin",
  "/opt/homebrew/bin",
  "C:\\\\texlive\\\\2025\\\\bin\\\\windows",
  "C:\\\\Program Files\\\\MiKTeX\\\\miktex\\\\bin\\\\x64"
];
const texPath = [...texCandidates, process.env.PATH || ""].join(path.delimiter);

// API key/model: uu tien bien moi truong, sau do toi settings.json (man hinh Cai dat trong app).
const settings = readSettings();
let geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || settings.geminiApiKey || "";
let geminiModel = process.env.GEMINI_MODEL || settings.geminiModel || "gemini-2.5-flash";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req, limit = 120_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Payload qua lon."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function runCommand(command, args, cwd, timeoutMs = 18_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, PATH: texPath },
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`${command} vuot qua thoi gian cho.`));
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString("utf8");
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString("utf8");
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`${command} thoat voi ma ${code}\n${stdout}\n${stderr}`));
    });
  });
}

function buildPreviewDocument(tikzCode) {
  return String.raw`\documentclass[border=3mm,varwidth]{standalone}
\usepackage[utf8]{vietnam}
\usepackage{mathptmx}
\usepackage{amsmath,amssymb}
\def\pgfsysdriver{pgfsys-dvisvgm.def}
\usepackage{tikz,tkz-euclide,tikz-3dplot,tkz-tab}
\usepackage{pgfplots}
\usetikzlibrary{arrows,intersections,angles,quotes,patterns,shapes.geometric}
\pgfplotsset{compat=1.9}
\newenvironment{ex}{}{}
\providecommand{\loigiai}[1]{}
\providecommand{\choice}[4]{}
\providecommand{\True}{}
\begin{document}
${tikzCode}
\end{document}
`;
}

// Cache ket qua compile theo noi dung code -> tra ngay lap tuc khi preview lai code giong het.
const previewCache = new Map();
const PREVIEW_CACHE_MAX = 50;

function cacheGet(key) {
  if (!previewCache.has(key)) return null;
  const value = previewCache.get(key);
  // Dua len dau (LRU don gian).
  previewCache.delete(key);
  previewCache.set(key, value);
  return value;
}

function cacheSet(key, value) {
  previewCache.set(key, value);
  if (previewCache.size > PREVIEW_CACHE_MAX) {
    previewCache.delete(previewCache.keys().next().value);
  }
}

async function renderTikzToSvg(tikzCode) {
  const workDir = await fsp.mkdtemp(path.join(os.tmpdir(), "mathbank-tikz-"));
  try {
    const dviFile = path.join(workDir, "preview.dvi");
    const svgFile = path.join(workDir, "preview.svg");
    await fsp.writeFile(path.join(workDir, "preview.tex"), buildPreviewDocument(tikzCode), "utf8");
    await runCommand(
      "latex",
      ["-no-shell-escape", "-interaction=nonstopmode", "-halt-on-error", "preview.tex"],
      workDir
    );
    await runCommand("dvisvgm", ["--no-fonts", "--exact", "--output=preview.svg", dviFile], workDir);
    return await fsp.readFile(svgFile, "utf8");
  } finally {
    await fsp.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function compileTikz(req, res) {
  try {
    const rawBody = await readBody(req);
    const payload = JSON.parse(rawBody || "{}");
    const tikzCode = String(payload.tikzCode || "").trim();

    if (!tikzCode) {
      sendJson(res, 400, { error: "Chua co code TikZ." });
      return;
    }

    if (tikzCode.length > 50_000) {
      sendJson(res, 400, { error: "Code TikZ qua dai de preview nhanh." });
      return;
    }

    const cacheKey = crypto.createHash("sha256").update(tikzCode).digest("hex");
    const cached = cacheGet(cacheKey);
    if (cached) {
      sendJson(res, 200, { svg: cached, cached: true });
      return;
    }

    const svg = await renderTikzToSvg(tikzCode);
    cacheSet(cacheKey, svg);
    sendJson(res, 200, { svg });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Khong compile duoc TikZ." });
  }
}

// Compile thu mot hinh nho luc khoi dong de "lam nong" cache cua TeX/he dieu hanh,
// giup lan preview dau tien cua nguoi dung khong bi giat.
async function warmUpLatex() {
  try {
    await renderTikzToSvg(
      "\\begin{center}\\begin{tikzpicture}\\draw (0,0)--(1,1);\\end{tikzpicture}\\end{center}"
    );
    console.log("Da lam nong LaTeX, preview se nhanh hon.");
  } catch {
    // Khong sao neu warm-up that bai (vi du chua cai LaTeX).
  }
}

const analyzePrompt = String.raw`Ban la chuyen gia hinh hoc va LaTeX TikZ cho giao vien Toan Viet Nam.
Hay phan tich ki anh hinh Toan duoc cung cap va sinh code TikZ ve lai chinh xac hinh do.

Quy tac bat buoc:
- Bien dich bang pdfLaTeX. KHONG dung fontspec, KHONG dung XeLaTeX/LuaLaTeX, KHONG dung package la.
- Chi duoc dung cac goi: tikz, tkz-euclide, tikz-3dplot, tkz-tab, pgfplots va cac thu vien tikz pho bien (arrows, intersections, angles, quotes, patterns, shapes.geometric).
- Uu tien tkz-euclide cho hinh hoc phang, pgfplots cho do thi ham so, tkz-tab cho bang bien thien/xet dau, tikz thuan neu hinh don gian.
- Code sach, ngan, de sua. Nhan diem ro rang, hinh can doi de in.
- KHONG them du kien khong co trong anh. Neu khong chac, ghi vao warnings.
- Uoc luong toa do tuong doi de dung lai hinh cho giong anh nhat co the.
- Net ve day: luon dung tuy chon "line width=1pt" o moi truong tikzpicture (da co san trong khung mau). Cac duong chinh co the dung "thick" hoac line width >= 1pt.

QUY TAC VE CHU/TEXT trong hinh (rat quan trong, neu sai se loi bien dich):
- MOI chu, nhan, cau, chu thich PHAI nam BEN TRONG moi truong tikzpicture, dat bang \node tai dung vi tri nhin thay trong anh.
- TUYET DOI KHONG dat chu roi (caption) o giua \end{tikzpicture} va \end{center}, cung khong de chu ngoai tikzpicture.
- Chep lai chu tieng Viet CHINH XAC tung ky tu va dau (vi du: Duong cao, Dinh parabol, Dien tich...). Giu nguyen dau tieng Viet.
- PHAI ESCAPE ky tu dac biet LaTeX khi nam trong text (neu khong se loi): viet \% \& \# \_ \{ \} thay vi % & # _ { }. Vi du "Chiem 50% dien tich" PHAI viet "Chiem 50\% dien tich".
- Chi so duoi/tren va cong thuc Toan PHAI dat trong $...$ (vi du $x_1$, $a^2$, $\frac12$). KHONG de _ hay ^ tran ngoai math.
- Neu trong pgfplots, dung \node[anchor=...] at (axis cs:x,y) {...} de dat chu o dung toa do du lieu.
- Trong tkz-euclide dung \tkzLabelPoint / \node de dat chu, khong de chu lo ra ngoai.

QUY TAC VE DUONG CONG MUOT (rat quan trong - dung de bi gay khuc):
- Voi do thi ham so quen thuoc (parabol, bac ba, bac bon, $1/x$, sin, cos, mu, log...): UU TIEN ve bang BIEU THUC, uoc luong he so tu hinh:
  \addplot[red, thick, smooth, domain=a:b, samples=100] {bieu_thuc};
- Neu BUOC phai dung danh sach diem (coordinates) vi khong ro ham: BAT BUOC them "smooth" va lay nhieu diem o khuc cong:
  \addplot[red, thick, smooth] coordinates {(x1,y1) (x2,y2) ...};
- Voi TikZ thuan: dung \draw[smooth, thick] plot coordinates {...}; hoac \draw[thick] (A) to[out=.., in=..] (B); KHONG noi diem bang doan thang.
- CHI ve gay khuc (khong smooth) khi hinh that su la duong gap khuc/da giac. Duong tron, cung, parabol... phai cong muot.

QUY TAC DAT TEN DUONG/HAM/MIEN (vd y=f(x), (C), (P), (d)):
- Dat ten o DAU BEN PHAI cua duong, bang \node[right] (hoac [above right]) tai diem cuoi ben phai cua duong, KHONG de nhan de len duong.
- Vi du voi do thi: \node[right] at (<diem cuoi phai cua duong>) {$y=f(x)$};
- Voi pgfplots co the dung: \addplot[...] {expr} node[pos=1, right] {$y=f(x)$};
- Giu nguyen ten nhin thay trong anh (vd $y=f'(x)$, $(C)$, $(P)$).

Dinh dang tikz_code BAT BUOC dung khung sau (KHONG co bat ky chu nao ngoai tikzpicture):
\begin{center}
\begin{tikzpicture}[scale=0.9, line width=1pt, line join=round, line cap=round, >=stealth]
% toan bo noi dung, ke ca chu, deu o trong day
\end{tikzpicture}
\end{center}

Tra ve dung JSON theo schema da yeu cau.`;

function extractInlineImage(dataUrl) {
  const raw = String(dataUrl || "").trim();
  const match = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  // Cho phep gui base64 thuan, mac dinh coi la PNG.
  return { mimeType: "image/png", data: raw };
}

// Goi Gemini voi cac part da dung san, ep tra ve JSON theo schema, parse va tra object.
async function generateGeminiJson(parts, responseSchema, temperature = 0.2) {
  const requestBody = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature,
      responseMimeType: "application/json",
      responseSchema
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": geminiApiKey
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Gemini phan hoi qua lau, da huy.");
    }
    throw new Error(`Khong goi duoc Gemini: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Gemini bao loi: ${detail}`);
  }

  const candidate = payload?.candidates?.[0];
  const textPart = candidate?.content?.parts?.map((part) => part.text || "").join("") || "";
  if (!textPart.trim()) {
    const blockReason = payload?.promptFeedback?.blockReason;
    throw new Error(blockReason ? `Gemini tu choi yeu cau (${blockReason}).` : "Gemini khong tra ve noi dung.");
  }

  try {
    return JSON.parse(textPart);
  } catch {
    // Du phong: thu cat khoi JSON dau tien trong chuoi.
    const start = textPart.indexOf("{");
    const end = textPart.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(textPart.slice(start, end + 1));
    }
    throw new Error("Gemini tra ve khong phai JSON hop le.");
  }
}

async function callGemini(imageDataUrl, figureTypeHint) {
  const { mimeType, data } = extractInlineImage(imageDataUrl);
  if (!data) {
    throw new Error("Anh dau vao trong.");
  }

  const hintLine = figureTypeHint
    ? `Goi y loai hinh tu nguoi dung: ${figureTypeHint}.`
    : "Khong co goi y loai hinh, hay tu nhan dien.";

  const parsed = await generateGeminiJson(
    [
      { text: `${analyzePrompt}\n\n${hintLine}` },
      { inline_data: { mime_type: mimeType, data } }
    ],
    {
      type: "object",
      properties: {
        figure_type: { type: "string" },
        tikz_code: { type: "string" },
        confidence: { type: "number" },
        warnings: { type: "array", items: { type: "string" } }
      },
      required: ["tikz_code"]
    }
  );

  const tikzCode = String(parsed.tikz_code || "").trim();
  if (!tikzCode) {
    throw new Error("Gemini khong sinh duoc code TikZ.");
  }

  return {
    figureType: String(parsed.figure_type || "").trim(),
    tikzCode,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : null,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : []
  };
}

const fixPrompt = String.raw`Ban la chuyen gia LaTeX TikZ cho giao vien Toan Viet Nam.
Ban nhan duoc code TikZ hien tai, yeu cau chinh sua cua nguoi dung, va co the kem anh goc.
Hay cap nhat code TikZ theo dung yeu cau.

Quy tac bat buoc:
- CHI sua dung phan duoc yeu cau, giu nguyen cac phan khac.
- Giu khung \begin{center}...\end{center} va \begin{tikzpicture}...\end{tikzpicture}.
- Bien dich bang pdfLaTeX. KHONG fontspec, KHONG package la. Chi dung: tikz, tkz-euclide, tikz-3dplot, tkz-tab, pgfplots va thu vien tikz pho bien.
- KHONG them du kien khong co trong yeu cau hoac anh goc.
- MOI chu/nhan phai nam BEN TRONG tikzpicture (dat bang \node), KHONG de chu roi giua \end{tikzpicture} va \end{center}. Giu nguyen dau tieng Viet, chinh xac tung ky tu.
- PHAI escape ky tu dac biet trong text: \% \& \# \_ ; chi so/cong thuc dat trong $...$. Giu net ve "line width=1pt". Ten duong/ham (vd $y=f(x)$) dat o dau ben phai duong bang \node[right].
- Neu co log loi bien dich, hay sua dung loi do (thuong do ky tu dac biet chua escape, thieu $, hoac thua/thieu dau ngoac).
- Duong cong phai MUOT: them "smooth" vao \addplot/\draw plot coordinates, hoac ve bang bieu thuc \addplot[smooth,domain=a:b,samples=100]{...}. Khong noi diem bang doan thang tru khi la duong gap khuc.
- Tra ve toan bo code TikZ moi (day du), khong chi tra phan thay doi.
- change_note: mot cau ngan tieng Viet mo ta da sua gi.`;

async function callGeminiFix(currentTikz, userInstruction, imageDataUrl) {
  const parts = [
    {
      text: `${fixPrompt}\n\nCode TikZ hien tai:\n${currentTikz}\n\nYeu cau chinh sua: ${userInstruction}`
    }
  ];

  if (imageDataUrl) {
    const { mimeType, data } = extractInlineImage(imageDataUrl);
    if (data) {
      parts.push({ text: "Anh goc de doi chieu:" });
      parts.push({ inline_data: { mime_type: mimeType, data } });
    }
  }

  const parsed = await generateGeminiJson(parts, {
    type: "object",
    properties: {
      tikz_code: { type: "string" },
      change_note: { type: "string" },
      warnings: { type: "array", items: { type: "string" } }
    },
    required: ["tikz_code"]
  });

  const tikzCode = String(parsed.tikz_code || "").trim();
  if (!tikzCode) {
    throw new Error("Gemini khong tra ve code da sua.");
  }

  return {
    tikzCode,
    changeNote: String(parsed.change_note || "").trim(),
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : []
  };
}

async function analyzeImage(req, res) {
  try {
    if (!geminiApiKey) {
      sendJson(res, 503, {
        error: "Chua cau hinh GEMINI_API_KEY. Them key vao file .env roi khoi dong lai server."
      });
      return;
    }

    const rawBody = await readBody(req, 16_000_000);
    const payload = JSON.parse(rawBody || "{}");
    const imageBase64 = payload.imageBase64 || payload.image_base64 || "";
    const figureTypeHint = payload.figureTypeHint || payload.figure_type_hint || "";

    if (!imageBase64) {
      sendJson(res, 400, { error: "Chua co anh de phan tich." });
      return;
    }

    const result = await callGemini(imageBase64, figureTypeHint);
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Khong phan tich duoc anh." });
  }
}

async function fixTikz(req, res) {
  try {
    if (!geminiApiKey) {
      sendJson(res, 503, {
        error: "Chua cau hinh GEMINI_API_KEY. Them key vao file .env roi khoi dong lai server."
      });
      return;
    }

    const rawBody = await readBody(req, 16_000_000);
    const payload = JSON.parse(rawBody || "{}");
    const currentTikz = String(payload.currentTikz || payload.current_tikz_code || "").trim();
    const userInstruction = String(payload.userInstruction || payload.user_instruction || "").trim();
    const imageBase64 = payload.imageBase64 || payload.image_base64 || "";

    if (!currentTikz) {
      sendJson(res, 400, { error: "Chua co code TikZ de sua." });
      return;
    }
    if (!userInstruction) {
      sendJson(res, 400, { error: "Chua co yeu cau chinh sua." });
      return;
    }

    const result = await callGeminiFix(currentTikz, userInstruction, imageBase64);
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Khong sua duoc code." });
  }
}

async function listAssetsHandler(req, res) {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    const items = db.listAssets({
      q: url.searchParams.get("q") || "",
      grade: url.searchParams.get("grade") || ""
    });
    sendJson(res, 200, { items });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Khong doc duoc thu vien." });
  }
}

async function getAssetHandler(req, res, id) {
  try {
    const asset = db.getAsset(id);
    if (!asset) {
      sendJson(res, 404, { error: "Khong tim thay hinh." });
      return;
    }
    sendJson(res, 200, { asset });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Loi doc hinh." });
  }
}

async function createAssetHandler(req, res) {
  try {
    const rawBody = await readBody(req, 16_000_000);
    const payload = JSON.parse(rawBody || "{}");
    if (!String(payload.tikzCode || payload.tikz_code || "").trim()) {
      sendJson(res, 400, { error: "Chua co code TikZ de luu." });
      return;
    }
    const asset = db.createAsset(payload);
    sendJson(res, 201, { asset });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Khong luu duoc hinh." });
  }
}

async function deleteAssetHandler(req, res, id) {
  try {
    const ok = db.deleteAsset(id);
    sendJson(res, ok ? 200 : 404, ok ? { deleted: id } : { error: "Khong tim thay hinh." });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Khong xoa duoc hinh." });
  }
}

async function saveSettingsHandler(req, res) {
  try {
    const rawBody = await readBody(req, 200_000);
    const payload = JSON.parse(rawBody || "{}");

    if (typeof payload.geminiApiKey === "string") {
      geminiApiKey = payload.geminiApiKey.trim();
    }
    if (payload.geminiModel) {
      geminiModel = String(payload.geminiModel).trim();
    }

    const current = readSettings();
    writeSettings({ ...current, geminiApiKey, geminiModel });
    sendJson(res, 200, { aiReady: Boolean(geminiApiKey), model: geminiModel });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Khong luu duoc cai dat." });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${port}`);
  const requestPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.resolve(rootDir, `.${requestPath}`);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const nonce = crypto.randomBytes(8).toString("hex");
    res.writeHead(200, {
      "content-type": mimeTypes[extension] || "application/octet-stream",
      "x-mathbank-request": nonce
    });
    fs.createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/config") {
    sendJson(res, 200, { aiReady: Boolean(geminiApiKey), model: geminiModel, storage: db.backendKind });
    return;
  }

  if (req.method === "POST" && req.url === "/api/settings") {
    saveSettingsHandler(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/analyze") {
    analyzeImage(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/fix") {
    fixTikz(req, res);
    return;
  }

  const assetMatch = req.url.match(/^\/api\/assets\/([\w-]+)(?:\?.*)?$/);
  if (req.method === "GET" && assetMatch) {
    getAssetHandler(req, res, assetMatch[1]);
    return;
  }
  if (req.method === "DELETE" && assetMatch) {
    deleteAssetHandler(req, res, assetMatch[1]);
    return;
  }
  if (req.method === "GET" && req.url.startsWith("/api/assets")) {
    listAssetsHandler(req, res);
    return;
  }
  if (req.method === "POST" && req.url === "/api/assets") {
    createAssetHandler(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/preview") {
    compileTikz(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

function startServer(listenPort = port) {
  return new Promise((resolve) => {
    server.listen(listenPort, () => {
      const actualPort = server.address().port;
      console.log(`MathBank TikZ Studio dang chay tai http://localhost:${actualPort}`);
      console.log(
        geminiApiKey
          ? `AI Vision: bat (model ${geminiModel})`
          : "AI Vision: tat (chua co API key — vao Cai dat de nhap)"
      );
      warmUpLatex();
      resolve({ server, port: actualPort });
    });
  });
}

module.exports = { startServer };

// Chay truc tiep bang `npm start` thi tu listen; khi Electron require thi no goi startServer.
if (require.main === module) {
  startServer();
}
