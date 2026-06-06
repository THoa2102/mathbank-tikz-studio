const templates = {
  triangle: {
    figureType: "plane_geometry",
    name: "Tam giác có đường cao",
    canvas: { width: 7.2, height: 4.8, unit: "cm" },
    points: [
      { id: "A", x: 0.4, y: 0.4, labelPosition: "below left" },
      { id: "B", x: 6.2, y: 0.4, labelPosition: "below right" },
      { id: "C", x: 2.2, y: 4.0, labelPosition: "above" },
      { id: "H", x: 2.2, y: 0.4, labelPosition: "below" }
    ],
    segments: [
      { from: "A", to: "B", style: "solid" },
      { from: "B", to: "C", style: "solid" },
      { from: "C", to: "A", style: "solid" },
      { from: "C", to: "H", style: "dashed" }
    ],
    circles: [],
    marks: [
      { type: "right_angle", at: "H", toward: ["A", "C"], size: 0.28 }
    ],
    labels: [
      { text: "$h$", x: 2.42, y: 2.1 }
    ]
  },
  circle: {
    figureType: "plane_geometry",
    name: "Đường tròn và dây cung",
    canvas: { width: 7.2, height: 5.2, unit: "cm" },
    points: [
      { id: "O", x: 3.4, y: 2.5, labelPosition: "below" },
      { id: "A", x: 1.1, y: 1.1, labelPosition: "below left" },
      { id: "B", x: 5.7, y: 1.1, labelPosition: "below right" },
      { id: "C", x: 4.45, y: 4.45, labelPosition: "above right" }
    ],
    segments: [
      { from: "A", to: "B", style: "solid" },
      { from: "O", to: "C", style: "dashed" },
      { from: "A", to: "C", style: "solid" },
      { from: "B", to: "C", style: "solid" }
    ],
    circles: [
      { center: "O", radius: 2.7, style: "solid" }
    ],
    marks: [],
    labels: [
      { text: "$R$", x: 4.15, y: 3.6 }
    ]
  },
  parabola: {
    figureType: "coordinate_graph",
    name: "Trục tọa độ và parabol",
    canvas: { width: 7.2, height: 5.2, unit: "cm" },
    axes: {
      xMin: -3,
      xMax: 3,
      yMin: -1,
      yMax: 4,
      originLabel: "O"
    },
    plots: [
      { expression: "0.5*x*x - 0.5", domain: [-2.8, 2.8], samples: 80, label: "$y=\\frac12x^2-\\frac12$" }
    ],
    points: [
      { id: "A", x: -2, y: 1.5, labelPosition: "above left" },
      { id: "B", x: 2, y: 1.5, labelPosition: "above right" }
    ],
    segments: [
      { from: "A", to: "B", style: "dashed" }
    ],
    circles: [],
    marks: [],
    labels: []
  }
};

const dom = {
  imageInput: document.querySelector("#imageInput"),
  sourceImage: document.querySelector("#sourceImage"),
  emptyDropState: document.querySelector("#emptyDropState"),
  dropZone: document.querySelector("#dropZone"),
  pasteImageButton: document.querySelector("#pasteImageButton"),
  contrastButton: document.querySelector("#contrastButton"),
  monoButton: document.querySelector("#monoButton"),
  clearImageButton: document.querySelector("#clearImageButton"),
  figureTemplate: document.querySelector("#figureTemplate"),
  generatorNote: document.querySelector("#generatorNote"),
  analyzeButton: document.querySelector("#analyzeButton"),
  aiStatus: document.querySelector("#aiStatus"),
  aiReport: document.querySelector("#aiReport"),
  generateButton: document.querySelector("#generateButton"),
  compileButton: document.querySelector("#compileButton"),
  saveButton: document.querySelector("#saveButton"),
  copyButton: document.querySelector("#copyButton"),
  exportButton: document.querySelector("#exportButton"),
  resetModelButton: document.querySelector("#resetModelButton"),
  reloadLibraryButton: document.querySelector("#reloadLibraryButton"),
  exportLibraryButton: document.querySelector("#exportLibraryButton"),
  assetForm: document.querySelector("#assetForm"),
  assetTitle: document.querySelector("#assetTitle"),
  assetGrade: document.querySelector("#assetGrade"),
  assetChapter: document.querySelector("#assetChapter"),
  assetLesson: document.querySelector("#assetLesson"),
  assetDifficulty: document.querySelector("#assetDifficulty"),
  librarySearch: document.querySelector("#librarySearch"),
  filterGrade: document.querySelector("#filterGrade"),
  browserPreview: document.querySelector("#browserPreview"),
  compiledPreview: document.querySelector("#compiledPreview"),
  previewStatus: document.querySelector("#previewStatus"),
  undoButton: document.querySelector("#undoButton"),
  redoButton: document.querySelector("#redoButton"),
  inspector: document.querySelector("#inspector"),
  inspId: document.querySelector("#inspId"),
  inspDeselect: document.querySelector("#inspDeselect"),
  inspX: document.querySelector("#inspX"),
  inspY: document.querySelector("#inspY"),
  inspLabelPos: document.querySelector("#inspLabelPos"),
  inspVisible: document.querySelector("#inspVisible"),
  editHint: document.querySelector("#editHint"),
  tikzCode: document.querySelector("#tikzCode"),
  sceneJson: document.querySelector("#sceneJson"),
  libraryList: document.querySelector("#libraryList"),
  chatLog: document.querySelector("#chatLog"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  chatSend: document.querySelector("#chatSend"),
  clearChatButton: document.querySelector("#clearChatButton"),
  exportModal: document.querySelector("#exportModal"),
  exportClose: document.querySelector("#exportClose"),
  wrapMode: document.querySelector("#wrapMode"),
  qTypeGroup: document.querySelector("#qTypeGroup"),
  qType: document.querySelector("#qType"),
  questionGroup: document.querySelector("#questionGroup"),
  qContent: document.querySelector("#qContent"),
  choiceGroup: document.querySelector("#choiceGroup"),
  tfGroup: document.querySelector("#tfGroup"),
  shortGroup: document.querySelector("#shortGroup"),
  shortAns: document.querySelector("#shortAns"),
  solGroup: document.querySelector("#solGroup"),
  solContent: document.querySelector("#solContent"),
  exportOutput: document.querySelector("#exportOutput"),
  exportCopy: document.querySelector("#exportCopy"),
  exportDownload: document.querySelector("#exportDownload"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsModal: document.querySelector("#settingsModal"),
  settingsClose: document.querySelector("#settingsClose"),
  settingsApiKey: document.querySelector("#settingsApiKey"),
  settingsModel: document.querySelector("#settingsModel"),
  settingsStatus: document.querySelector("#settingsStatus"),
  settingsSave: document.querySelector("#settingsSave"),
  updateBlock: document.querySelector("#updateBlock"),
  appVersion: document.querySelector("#appVersion"),
  checkUpdateButton: document.querySelector("#checkUpdateButton"),
  toast: document.querySelector("#toast")
};

let state = {
  scene: cloneTemplate("triangle"),
  currentImageName: "",
  currentImageDataUrl: "",
  compiledObjectUrl: null,
  aiReady: false,
  chat: [],
  selectedPointId: null,
  history: [],
  historyIndex: -1,
  dragging: null,
  imageFilters: {
    contrast: false,
    mono: false
  }
};

function cloneTemplate(key) {
  return structuredClone(templates[key] || templates.triangle);
}

function pointMap(scene) {
  return new Map((scene.points || []).map((point) => [point.id, point]));
}

function labelTikzPosition(position) {
  const allowed = new Set([
    "above",
    "below",
    "left",
    "right",
    "above left",
    "above right",
    "below left",
    "below right"
  ]);
  return allowed.has(position) ? position : "above";
}

function tikzStyle(style) {
  if (style === "dashed") return "[dashed]";
  if (style === "thick") return "[thick]";
  return "";
}

function formatNumber(value) {
  return Number(value).toFixed(2).replace(/\.?0+$/, "");
}

function buildTikz(scene) {
  if (scene.figureType === "coordinate_graph") {
    return buildGraphTikz(scene);
  }

  const points = pointMap(scene);
  const lines = [
    "\\begin{center}",
    "\\begin{tikzpicture}[scale=0.9, line join=round, line cap=round, >=stealth]"
  ];

  for (const point of scene.points || []) {
    lines.push(`\\coordinate (${point.id}) at (${formatNumber(point.x)},${formatNumber(point.y)});`);
  }

  for (const circle of scene.circles || []) {
    const center = points.get(circle.center);
    if (center) {
      lines.push(`\\draw${tikzStyle(circle.style)} (${circle.center}) circle (${formatNumber(circle.radius)});`);
    }
  }

  for (const segment of scene.segments || []) {
    if (points.has(segment.from) && points.has(segment.to)) {
      lines.push(`\\draw${tikzStyle(segment.style)} (${segment.from})--(${segment.to});`);
    }
  }

  for (const mark of scene.marks || []) {
    if (mark.type === "right_angle" && points.has(mark.at)) {
      const [leftPoint, topPoint] = mark.toward || [];
      lines.push(`\\pic [draw, angle radius=${formatNumber(mark.size || 0.28)}cm] {right angle=${leftPoint || "A"}--${mark.at}--${topPoint || "C"}};`);
    }
  }

  for (const point of scene.points || []) {
    if (point.visible === false) continue;
    const position = labelTikzPosition(point.labelPosition);
    lines.push(`\\fill (${point.id}) circle (1.2pt) node[${position}] {$${point.id}$};`);
  }

  for (const label of scene.labels || []) {
    lines.push(`\\node at (${formatNumber(label.x)},${formatNumber(label.y)}) {${label.text}};`);
  }

  lines.push("\\end{tikzpicture}");
  lines.push("\\end{center}");
  return lines.join("\n");
}

function buildGraphTikz(scene) {
  const axes = scene.axes || { xMin: -3, xMax: 3, yMin: -1, yMax: 4 };
  const points = pointMap(scene);
  const lines = [
    "\\begin{center}",
    "\\begin{tikzpicture}[scale=0.9, line join=round, line cap=round, >=stealth]",
    `\\draw[->] (${axes.xMin},0)--(${axes.xMax + 0.25},0) node[below] {$x$};`,
    `\\draw[->] (0,${axes.yMin})--(0,${axes.yMax + 0.25}) node[left] {$y$};`,
    `\\node[below left] at (0,0) {$${axes.originLabel || "O"}$};`
  ];

  for (const plot of scene.plots || []) {
    const [from, to] = plot.domain || [axes.xMin, axes.xMax];
    lines.push(`\\draw[domain=${formatNumber(from)}:${formatNumber(to)}, samples=${plot.samples || 80}, smooth, thick] plot (\\x,{${toTikzExpression(plot.expression)}});`);
    if (plot.label) {
      lines.push(`\\node[right] at (${formatNumber(to - 0.75)},${formatNumber(evaluateExpression(plot.expression, to - 0.75))}) {${plot.label}};`);
    }
  }

  for (const point of scene.points || []) {
    lines.push(`\\coordinate (${point.id}) at (${formatNumber(point.x)},${formatNumber(point.y)});`);
  }

  for (const segment of scene.segments || []) {
    if (points.has(segment.from) && points.has(segment.to)) {
      lines.push(`\\draw${tikzStyle(segment.style)} (${segment.from})--(${segment.to});`);
    }
  }

  for (const point of scene.points || []) {
    if (point.visible === false) continue;
    const position = labelTikzPosition(point.labelPosition);
    lines.push(`\\fill (${point.id}) circle (1.2pt) node[${position}] {$${point.id}$};`);
  }

  lines.push("\\end{tikzpicture}");
  lines.push("\\end{center}");
  return lines.join("\n");
}

// Tach rieng moi truong tikzpicture tu code (bo lop \begin{center} ben ngoai neu co).
function extractPicture(code) {
  const match = String(code || "").match(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/);
  return match ? match[0] : String(code || "").trim();
}

function centerBlock(picture) {
  return `\\begin{center}\n${picture}\n\\end{center}`;
}

// Sinh doan code da boc theo cau hinh trong modal.
function buildWrappedCode() {
  const picture = extractPicture(dom.tikzCode.value);
  const mode = dom.wrapMode.value;

  if (mode === "center") {
    return centerBlock(picture);
  }

  if (mode === "immini") {
    const question = dom.qContent.value.trim() || "Nội dung câu hỏi...";
    return `\\immini{\n${question}\n}{\n${picture}\n}`;
  }

  // mode === "ex"
  const lines = ["\\begin{ex}"];
  const question = dom.qContent.value.trim();
  if (question) lines.push(question);
  lines.push(...centerBlock(picture).split("\n"));

  const qType = dom.qType.value;
  if (qType === "choice") {
    const correct = Number(document.querySelector('input[name="correctChoice"]:checked')?.value ?? 0);
    lines.push("\\choice");
    document.querySelectorAll(".opt-input[data-choice]").forEach((input, index) => {
      const text = input.value.trim();
      lines.push(`{${index === correct ? "\\True " : ""}${text}}`);
    });
  } else if (qType === "choiceTF") {
    lines.push("\\choiceTF");
    document.querySelectorAll(".tf-input[data-tf]").forEach((input, index) => {
      const text = input.value.trim();
      const checked = document.querySelector(`input[type="checkbox"][data-tf="${index}"]`)?.checked;
      lines.push(`{${checked ? "\\True " : ""}${text}}`);
    });
  } else if (qType === "shortans") {
    lines.push(`\\shortans[oly]{${dom.shortAns.value.trim()}}`);
  }

  lines.push("\\loigiai{", dom.solContent.value.trim(), "}");
  lines.push("\\end{ex}");
  return lines.join("\n");
}

// Tao tai lieu .tex hoan chinh, bien dich duoc voi goi ex_test.
function buildTexDocument(body) {
  return `\\documentclass[12pt]{article}
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amssymb}
\\usepackage{tikz,tkz-euclide,tikz-3dplot,tkz-tab}
\\usepackage{pgfplots}
\\usetikzlibrary{arrows,intersections,angles,quotes,patterns,shapes.geometric}
\\pgfplotsset{compat=1.9}
\\usepackage{ex_test}
\\begin{document}
${body}
\\end{document}
`;
}

function downloadTex(filename, content) {
  const blob = new Blob([content], { type: "text/x-tex;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function updateExportGroups() {
  const mode = dom.wrapMode.value;
  const isEx = mode === "ex";
  const qType = dom.qType.value;

  dom.qTypeGroup.hidden = !isEx;
  dom.questionGroup.hidden = mode === "center";
  dom.solGroup.hidden = !isEx;
  dom.choiceGroup.hidden = !(isEx && qType === "choice");
  dom.tfGroup.hidden = !(isEx && qType === "choiceTF");
  dom.shortGroup.hidden = !(isEx && qType === "shortans");
}

function updateExportOutput() {
  updateExportGroups();
  dom.exportOutput.value = buildWrappedCode();
}

function openExport() {
  if (!dom.tikzCode.value.trim()) {
    showToast("Chưa có code TikZ để đóng gói.");
    return;
  }
  updateExportOutput();
  dom.exportModal.hidden = false;
}

function closeExport() {
  dom.exportModal.hidden = true;
}

async function exportLibraryTex() {
  const params = new URLSearchParams();
  const q = dom.librarySearch.value.trim();
  if (q) params.set("q", q);
  if (dom.filterGrade.value) params.set("grade", dom.filterGrade.value);

  try {
    const response = await fetch(`/api/assets?${params.toString()}`);
    const data = await response.json();
    const items = data.items || [];
    if (!items.length) {
      showToast("Thư viện trống, chưa có gì để xuất.");
      return;
    }
    const body = items
      .map((item) => `% ${item.title}\n${centerBlock(extractPicture(item.tikz_code || ""))}`)
      .join("\n\n\\bigskip\n\n");
    downloadTex("mathbank-tikz-library.tex", buildTexDocument(body));
    showToast(`Đã xuất ${items.length} hình ra .tex.`);
  } catch {
    showToast("Không xuất được thư viện.");
  }
}

function evaluateExpression(expression, x) {
  if (!/^[0-9xX+\-*/().\s]+$/.test(expression)) return 0;
  try {
    return Function("x", `"use strict"; return (${expression.replaceAll("X", "x")});`)(x);
  } catch {
    return 0;
  }
}

function toTikzExpression(expression) {
  return String(expression || "0").replace(/\b[xX]\b/g, "\\x");
}

function sceneToSvg(scene) {
  const width = scene.canvas?.width || 7;
  const height = scene.canvas?.height || 5;
  const margin = 0.45;
  const minX = scene.figureType === "coordinate_graph" ? scene.axes.xMin - margin : -margin;
  const minY = scene.figureType === "coordinate_graph" ? scene.axes.yMin - margin : -margin;
  const viewWidth = scene.figureType === "coordinate_graph" ? scene.axes.xMax - scene.axes.xMin + margin * 2 : width + margin * 2;
  const viewHeight = scene.figureType === "coordinate_graph" ? scene.axes.yMax - scene.axes.yMin + margin * 2 : height + margin * 2;
  const points = pointMap(scene);

  const parts = [
    `<svg viewBox="${minX} ${-minY - viewHeight} ${viewWidth} ${viewHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(scene.name)}">`,
    '<g transform="scale(1,-1)" fill="none" stroke="#17202a" stroke-width="0.035" stroke-linecap="round" stroke-linejoin="round">'
  ];

  if (scene.figureType === "coordinate_graph") {
    const axes = scene.axes;
    parts.push(`<path d="M ${axes.xMin} 0 L ${axes.xMax + 0.18} 0" marker-end="url(#arrow)" />`);
    parts.push(`<path d="M 0 ${axes.yMin} L 0 ${axes.yMax + 0.18}" marker-end="url(#arrow)" />`);
    for (const plot of scene.plots || []) {
      parts.push(`<path d="${plotPath(plot)}" stroke="#b45309" stroke-width="0.045" />`);
    }
  }

  for (const circle of scene.circles || []) {
    const center = points.get(circle.center);
    if (center) {
      parts.push(`<circle cx="${center.x}" cy="${center.y}" r="${circle.radius}" ${strokeDash(circle.style)} />`);
    }
  }

  for (const segment of scene.segments || []) {
    const from = points.get(segment.from);
    const to = points.get(segment.to);
    if (from && to) {
      parts.push(`<path d="M ${from.x} ${from.y} L ${to.x} ${to.y}" ${strokeDash(segment.style)} />`);
    }
  }

  for (const mark of scene.marks || []) {
    if (mark.type === "right_angle") {
      const at = points.get(mark.at);
      const [leftId, topId] = mark.toward || [];
      const left = points.get(leftId);
      const top = points.get(topId);
      if (at && left && top) {
        const size = mark.size || 0.28;
        const xDir = Math.sign(left.x - at.x) || -1;
        const yDir = Math.sign(top.y - at.y) || 1;
        parts.push(`<path d="M ${at.x + xDir * size} ${at.y} L ${at.x + xDir * size} ${at.y + yDir * size} L ${at.x} ${at.y + yDir * size}" />`);
      }
    }
  }

  parts.push("</g>");
  parts.push('<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#17202a"/></marker></defs>');
  parts.push(`<g font-family="serif" font-size="0.34" fill="#17202a">`);

  if (scene.figureType === "coordinate_graph") {
    const axes = scene.axes;
    parts.push(textSvg(axes.xMax + 0.12, -0.28, "x"));
    parts.push(textSvg(-0.28, axes.yMax + 0.16, "y"));
    parts.push(textSvg(-0.24, -0.22, axes.originLabel || "O"));
  }

  for (const point of scene.points || []) {
    const offset = labelOffset(point.labelPosition);
    const selected = point.id === state.selectedPointId;
    if (point.visible !== false) {
      if (selected) {
        parts.push(`<circle cx="${point.x}" cy="${-point.y}" r="0.16" fill="none" stroke="#2563eb" stroke-width="0.03" />`);
      }
      parts.push(`<circle cx="${point.x}" cy="${-point.y}" r="0.045" fill="#17202a" />`);
      parts.push(textSvg(point.x + offset.x, point.y + offset.y, point.id));
    }
    parts.push(`<circle class="hit-point" data-point-id="${escapeHtml(point.id)}" cx="${point.x}" cy="${-point.y}" r="0.22" fill="transparent" style="cursor:grab" />`);
  }

  for (const label of scene.labels || []) {
    parts.push(textSvg(label.x, label.y, label.text.replaceAll("$", "")));
  }

  for (const plot of scene.plots || []) {
    if (plot.label) {
      const domain = plot.domain || [-3, 3];
      const x = domain[1] - 0.75;
      parts.push(textSvg(x + 0.2, evaluateExpression(plot.expression, x), plot.label.replaceAll("$", "").replace("\\frac12", "1/2")));
    }
  }

  parts.push("</g></svg>");
  return parts.join("");
}

function textSvg(x, y, text) {
  return `<text x="${x}" y="${-y}" text-anchor="middle">${escapeHtml(text)}</text>`;
}

function plotPath(plot) {
  const [from, to] = plot.domain || [-3, 3];
  const samples = plot.samples || 80;
  const points = [];
  for (let index = 0; index <= samples; index += 1) {
    const x = from + ((to - from) * index) / samples;
    const y = evaluateExpression(plot.expression, x);
    points.push(`${index === 0 ? "M" : "L"} ${formatNumber(x)} ${formatNumber(y)}`);
  }
  return points.join(" ");
}

function labelOffset(position) {
  const offset = {
    "above": { x: 0, y: 0.28 },
    "below": { x: 0, y: -0.22 },
    "left": { x: -0.25, y: 0 },
    "right": { x: 0.25, y: 0 },
    "above left": { x: -0.25, y: 0.24 },
    "above right": { x: 0.27, y: 0.24 },
    "below left": { x: -0.27, y: -0.22 },
    "below right": { x: 0.27, y: -0.22 }
  };
  return offset[position] || offset.above;
}

function strokeDash(style) {
  return style === "dashed" ? 'stroke-dasharray="0.12 0.12"' : "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Cap nhat code/JSON/SVG/inspector tu state.scene (khong dong vao lich su).
function renderScene() {
  dom.sceneJson.value = JSON.stringify(state.scene, null, 2);
  dom.tikzCode.value = buildTikz(state.scene);
  renderBrowserPreview();
  updateInspector();
  updateEditHint();
}

function renderAll() {
  renderScene();
  setPreviewStatus("Chưa compile", "");
}

function renderBrowserPreview() {
  dom.browserPreview.innerHTML = sceneToSvg(state.scene);
  hideCompiledPreview();
}

function updateSceneFromJson() {
  try {
    const nextScene = JSON.parse(dom.sceneJson.value);
    state.scene = nextScene;
    if (state.selectedPointId && !findPoint(state.selectedPointId)) {
      state.selectedPointId = null;
    }
    renderScene();
    recordHistory();
    showToast("Đã cập nhật mô hình hình học.");
  } catch {
    showToast("JSON hình học chưa hợp lệ.");
  }
}

// ----- Chinh tuong tac tren preview (Tuan 7-8) -----

function findPoint(id) {
  return (state.scene.points || []).find((point) => point.id === id) || null;
}

function hasEditableModel() {
  return Array.isArray(state.scene.points) && state.scene.points.length > 0;
}

function updateEditHint() {
  dom.editHint.textContent = hasEditableModel()
    ? "Bấm vào một điểm để chọn, kéo để di chuyển. Mọi thay đổi tự sinh lại TikZ."
    : "Hình này không có mô hình điểm để chỉnh tương tác (vd hình AI sinh trực tiếp). Hãy dùng panel “Sửa bằng lệnh AI”.";
}

function updateInspector() {
  const point = state.selectedPointId ? findPoint(state.selectedPointId) : null;
  if (!point) {
    dom.inspector.hidden = true;
    return;
  }
  dom.inspector.hidden = false;
  dom.inspId.textContent = point.id;
  dom.inspX.value = point.x;
  dom.inspY.value = point.y;
  dom.inspLabelPos.value = point.labelPosition || "above";
  dom.inspVisible.checked = point.visible !== false;
}

function selectPoint(id) {
  state.selectedPointId = id;
  renderBrowserPreview();
  updateInspector();
}

function deselectPoint() {
  state.selectedPointId = null;
  renderBrowserPreview();
  updateInspector();
}

function applyInspectorEdit() {
  const point = findPoint(state.selectedPointId);
  if (!point) return;
  const x = Number(dom.inspX.value);
  const y = Number(dom.inspY.value);
  if (Number.isFinite(x)) point.x = x;
  if (Number.isFinite(y)) point.y = y;
  point.labelPosition = dom.inspLabelPos.value;
  point.visible = dom.inspVisible.checked;
  renderScene();
  recordHistory();
}

function svgElement() {
  return dom.browserPreview.querySelector("svg");
}

function clientToScene(svg, clientX, clientY) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const user = pt.matrixTransform(ctm.inverse());
  return { x: user.x, y: -user.y };
}

function roundCoord(value) {
  return Math.round(value * 20) / 20;
}

function onPreviewPointerDown(event) {
  const hit = event.target.closest(".hit-point");
  if (!hit) return;
  event.preventDefault();
  const id = hit.dataset.pointId;
  selectPoint(id);
  state.dragging = { id, moved: false };
  window.addEventListener("pointermove", onPreviewPointerMove);
  window.addEventListener("pointerup", onPreviewPointerUp);
}

function onPreviewPointerMove(event) {
  if (!state.dragging) return;
  const svg = svgElement();
  if (!svg) return;
  const point = findPoint(state.dragging.id);
  const coords = clientToScene(svg, event.clientX, event.clientY);
  if (!point || !coords) return;
  point.x = roundCoord(coords.x);
  point.y = roundCoord(coords.y);
  state.dragging.moved = true;
  renderScene();
}

function onPreviewPointerUp() {
  window.removeEventListener("pointermove", onPreviewPointerMove);
  window.removeEventListener("pointerup", onPreviewPointerUp);
  if (state.dragging?.moved) {
    recordHistory();
  }
  state.dragging = null;
}

// ----- Lich su (undo/redo) -----

function recordHistory() {
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(structuredClone(state.scene));
  if (state.history.length > 60) state.history.shift();
  state.historyIndex = state.history.length - 1;
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  dom.undoButton.disabled = state.historyIndex <= 0;
  dom.redoButton.disabled = state.historyIndex >= state.history.length - 1;
}

function undo() {
  if (state.historyIndex <= 0) return;
  state.historyIndex -= 1;
  state.scene = structuredClone(state.history[state.historyIndex]);
  if (state.selectedPointId && !findPoint(state.selectedPointId)) {
    state.selectedPointId = null;
  }
  renderScene();
  setPreviewStatus("Chưa compile", "");
  updateUndoRedoButtons();
}

function redo() {
  if (state.historyIndex >= state.history.length - 1) return;
  state.historyIndex += 1;
  state.scene = structuredClone(state.history[state.historyIndex]);
  if (state.selectedPointId && !findPoint(state.selectedPointId)) {
    state.selectedPointId = null;
  }
  renderScene();
  setPreviewStatus("Chưa compile", "");
  updateUndoRedoButtons();
}

function setPreviewStatus(text, tone) {
  dom.previewStatus.textContent = text;
  dom.previewStatus.className = `status-pill ${tone || ""}`.trim();
}

function hideCompiledPreview() {
  if (state.compiledObjectUrl) {
    URL.revokeObjectURL(state.compiledObjectUrl);
    state.compiledObjectUrl = null;
  }
  dom.compiledPreview.hidden = true;
  dom.compiledPreview.removeAttribute("src");
  dom.browserPreview.hidden = false;
}

async function compilePreview() {
  const tikzCode = dom.tikzCode.value.trim();
  if (!tikzCode) {
    showToast("Chưa có code TikZ.");
    return;
  }

  setPreviewStatus("Đang compile", "");
  dom.compileButton.disabled = true;

  try {
    const response = await fetch("/api/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tikzCode })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Compile lỗi.");
    }

    const blob = new Blob([payload.svg], { type: "image/svg+xml" });
    hideCompiledPreview();
    state.compiledObjectUrl = URL.createObjectURL(blob);
    dom.compiledPreview.src = state.compiledObjectUrl;
    dom.compiledPreview.hidden = false;
    dom.browserPreview.hidden = true;
    setPreviewStatus("Đã compile", "ok");
  } catch (error) {
    setPreviewStatus("Compile lỗi", "error");
    renderBrowserPreview();
    showToast(error.message || "Không compile được TikZ.");
  } finally {
    dom.compileButton.disabled = false;
  }
}

async function checkAiConfig() {
  try {
    const response = await fetch("/api/config");
    const payload = await response.json();
    state.aiReady = Boolean(payload.aiReady);
    if (payload.model) dom.settingsModel.value = payload.model;
    if (state.aiReady) {
      setAiStatus(`AI sẵn sàng · ${payload.model || "gemini"}`, "ok");
    } else {
      setAiStatus("Chưa cấu hình AI", "error");
    }
  } catch {
    state.aiReady = false;
    setAiStatus("Không kết nối được server", "error");
  }
}

function openSettings() {
  dom.settingsStatus.hidden = true;
  dom.settingsApiKey.value = "";
  dom.settingsModal.hidden = false;
  dom.settingsApiKey.focus();
}

function closeSettings() {
  dom.settingsModal.hidden = true;
}

// Chi chay khi mo bang app desktop (Electron) — co cau noi window.mathbankDesktop.
async function initDesktop() {
  const desktop = window.mathbankDesktop;
  if (!desktop?.isDesktop) return;

  dom.updateBlock.hidden = false;
  try {
    const version = await desktop.getVersion();
    dom.appVersion.textContent = `v${version}`;
  } catch {
    dom.appVersion.textContent = "?";
  }

  dom.checkUpdateButton.addEventListener("click", async () => {
    dom.checkUpdateButton.disabled = true;
    dom.checkUpdateButton.textContent = "Đang kiểm tra…";
    try {
      await desktop.checkForUpdates();
    } finally {
      dom.checkUpdateButton.disabled = false;
      dom.checkUpdateButton.textContent = "Kiểm tra cập nhật";
    }
  });
}

async function saveSettings() {
  const body = { geminiModel: dom.settingsModel.value };
  const key = dom.settingsApiKey.value.trim();
  // Chi gui key khi nguoi dung co nhap (de trong = giu key cu).
  if (key) body.geminiApiKey = key;

  dom.settingsSave.disabled = true;
  try {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Lưu lỗi.");

    state.aiReady = Boolean(payload.aiReady);
    setAiStatus(state.aiReady ? `AI sẵn sàng · ${payload.model}` : "Chưa cấu hình AI", state.aiReady ? "ok" : "error");
    dom.settingsStatus.innerHTML = state.aiReady
      ? '<span class="ai-tag ok">Đã lưu. AI sẵn sàng.</span>'
      : '<span class="ai-tag error">Đã lưu model, nhưng chưa có API key.</span>';
    dom.settingsStatus.hidden = false;
    dom.settingsApiKey.value = "";
    showToast("Đã lưu cài đặt.");
  } catch (error) {
    dom.settingsStatus.innerHTML = `<span class="ai-tag error">${escapeHtml(error.message)}</span>`;
    dom.settingsStatus.hidden = false;
  } finally {
    dom.settingsSave.disabled = false;
  }
}

function setAiStatus(text, tone) {
  dom.aiStatus.textContent = text;
  dom.aiStatus.className = `status-pill ${tone || ""}`.trim();
}

function renderAiReport(result) {
  const parts = [];
  if (result.figureType) {
    parts.push(`<span class="ai-tag">${escapeHtml(result.figureType)}</span>`);
  }
  if (typeof result.confidence === "number") {
    const percent = Math.round(result.confidence * 100);
    const tone = percent >= 75 ? "ok" : percent >= 45 ? "" : "error";
    parts.push(`<span class="ai-tag ${tone}">Độ tin cậy ${percent}%</span>`);
  }
  let html = parts.length ? `<div class="ai-tags">${parts.join("")}</div>` : "";
  if (result.warnings && result.warnings.length) {
    html += `<ul class="ai-warnings">${result.warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }
  dom.aiReport.innerHTML = html || '<span class="ai-tag ok">AI đã sinh code.</span>';
  dom.aiReport.hidden = false;
}

async function analyzeWithAI() {
  if (!state.currentImageDataUrl) {
    showToast("Chưa có ảnh để phân tích.");
    return;
  }

  setAiStatus("Đang phân tích ảnh…", "");
  dom.analyzeButton.disabled = true;
  dom.aiReport.hidden = true;

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageBase64: state.currentImageDataUrl,
        figureTypeHint: dom.figureTemplate.value
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Phân tích lỗi.");
    }

    dom.tikzCode.value = payload.tikzCode;
    dom.sceneJson.value = JSON.stringify(
      {
        figureType: payload.figureType || "ai_generated",
        source: "gemini",
        note: "Code do AI sinh trực tiếp từ ảnh. Sửa trong ô Code TikZ rồi compile.",
        confidence: payload.confidence,
        warnings: payload.warnings || []
      },
      null,
      2
    );
    renderAiReport(payload);
    setAiStatus("AI đã sinh code", "ok");
    showToast("AI đã sinh TikZ. Đang compile preview…");
    await compilePreview();
  } catch (error) {
    setAiStatus("Phân tích lỗi", "error");
    showToast(error.message || "Không phân tích được ảnh.");
  } finally {
    dom.analyzeButton.disabled = false;
  }
}

function renderChat() {
  if (!state.chat.length) {
    dom.chatLog.innerHTML = '<p class="chat-empty">Gõ lệnh để AI sửa code TikZ hiện tại.<br>VD: "đưa nhãn C lên cao hơn", "đổi đường tròn thành nét mảnh".</p>';
    return;
  }

  dom.chatLog.innerHTML = state.chat
    .map((message) => {
      const classes = ["chat-msg", message.role];
      if (message.tone === "error") classes.push("error");
      if (message.pending) classes.push("pending");
      return `<div class="${classes.join(" ")}">${escapeHtml(message.text)}</div>`;
    })
    .join("");
  dom.chatLog.scrollTop = dom.chatLog.scrollHeight;
}

function pushChat(role, text, options = {}) {
  const message = { role, text, ...options };
  state.chat.push(message);
  renderChat();
  return message;
}

async function sendCorrection() {
  const instruction = dom.chatInput.value.trim();
  if (!instruction) return;

  const currentTikz = dom.tikzCode.value.trim();
  if (!currentTikz) {
    showToast("Chưa có code TikZ để sửa.");
    return;
  }

  dom.chatInput.value = "";
  pushChat("user", instruction);
  const pending = pushChat("ai", "Đang sửa…", { pending: true });
  dom.chatSend.disabled = true;
  dom.chatInput.disabled = true;

  try {
    const response = await fetch("/api/fix", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentTikz,
        userInstruction: instruction,
        imageBase64: state.currentImageDataUrl || ""
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Sửa lỗi.");
    }

    dom.tikzCode.value = payload.tikzCode;
    let note = payload.changeNote || "Đã cập nhật code TikZ.";
    if (payload.warnings && payload.warnings.length) {
      note += `\n⚠ ${payload.warnings.join("; ")}`;
    }
    pending.text = note;
    pending.pending = false;
    renderChat();
    showToast("AI đã sửa code. Đang compile…");
    await compilePreview();
  } catch (error) {
    pending.text = error.message || "Không sửa được code.";
    pending.pending = false;
    pending.tone = "error";
    renderChat();
  } finally {
    dom.chatSend.disabled = false;
    dom.chatInput.disabled = false;
    dom.chatInput.focus();
  }
}

function clearChat() {
  state.chat = [];
  renderChat();
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.append(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

function loadImageFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("File không phải ảnh.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    dom.sourceImage.src = reader.result;
    dom.sourceImage.hidden = false;
    dom.emptyDropState.hidden = true;
    state.currentImageName = file.name || "clipboard-image";
    state.currentImageDataUrl = reader.result;
    showToast("Đã nhận ảnh đầu vào.");
  };
  reader.readAsDataURL(file);
}

async function pasteImageFromClipboard() {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find((type) => type.startsWith("image/"));
      if (imageType) {
        const blob = await item.getType(imageType);
        loadImageFile(new File([blob], "clipboard-image.png", { type: imageType }));
        return;
      }
    }
    showToast("Clipboard chưa có ảnh.");
  } catch {
    showToast("Trình duyệt chưa cho phép đọc ảnh clipboard.");
  }
}

function clearImage() {
  dom.imageInput.value = "";
  dom.sourceImage.removeAttribute("src");
  dom.sourceImage.hidden = true;
  dom.emptyDropState.hidden = false;
  state.currentImageName = "";
  state.currentImageDataUrl = "";
  dom.aiReport.hidden = true;
  state.imageFilters.contrast = false;
  state.imageFilters.mono = false;
  applyImageFilters();
}

function applyImageFilters() {
  dom.sourceImage.classList.toggle("contrast", state.imageFilters.contrast);
  dom.sourceImage.classList.toggle("mono", state.imageFilters.mono);
}

async function saveAsset(event) {
  if (event) event.preventDefault();

  const tikzCode = dom.tikzCode.value.trim();
  if (!tikzCode) {
    showToast("Chưa có code TikZ để lưu.");
    return;
  }

  const payload = {
    title: dom.assetTitle.value.trim() || state.scene.name || "Hình TikZ",
    grade: dom.assetGrade.value ? Number(dom.assetGrade.value) : null,
    chapter: dom.assetChapter.value.trim(),
    lesson: dom.assetLesson.value.trim(),
    difficulty: dom.assetDifficulty.value,
    figureType: state.scene.figureType || "",
    tikzCode,
    sceneJson: dom.sceneJson.value,
    imageDataUrl: state.currentImageDataUrl || ""
  };

  try {
    const response = await fetch("/api/assets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Lưu lỗi.");
    }
    dom.assetTitle.value = "";
    showToast("Đã lưu vào thư viện.");
    loadLibrary();
  } catch (error) {
    showToast(error.message || "Không lưu được hình.");
  }
}

async function loadLibrary() {
  const params = new URLSearchParams();
  const q = dom.librarySearch.value.trim();
  if (q) params.set("q", q);
  if (dom.filterGrade.value) params.set("grade", dom.filterGrade.value);

  try {
    const response = await fetch(`/api/assets?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Đọc thư viện lỗi.");
    }
    renderLibrary(data.items || []);
  } catch (error) {
    dom.libraryList.innerHTML = `<div class="library-item"><strong>Không tải được thư viện</strong><span>${escapeHtml(error.message)}</span></div>`;
  }
}

function renderLibrary(items) {
  if (!items.length) {
    dom.libraryList.innerHTML = '<div class="library-item"><strong>Chưa có hình đã lưu</strong><span>Lưu hình hiện tại bằng nút "Lưu vào thư viện".</span></div>';
    return;
  }

  dom.libraryList.innerHTML = items
    .map((item) => {
      const date = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at));
      const meta = [
        item.grade ? `Lớp ${item.grade}` : "",
        item.chapter,
        item.lesson,
        item.difficulty
      ]
        .filter(Boolean)
        .join(" · ");
      return `
      <article class="library-item" data-id="${item.id}">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(meta || item.figure_type || "Hình")} · ${date}</span>
        <div class="library-actions">
          <button class="ghost-button" data-action="load" type="button">Nạp</button>
          <button class="ghost-button" data-action="copy" type="button">Copy</button>
          <button class="ghost-button danger" data-action="delete" type="button">Xóa</button>
        </div>
      </article>
    `;
    })
    .join("");
}

async function handleLibraryAction(event) {
  const button = event.target.closest("button[data-action]");
  const itemElement = event.target.closest(".library-item[data-id]");
  if (!button || !itemElement) return;

  const id = itemElement.dataset.id;
  const action = button.dataset.action;

  if (action === "copy") {
    try {
      const response = await fetch(`/api/assets/${id}`);
      const data = await response.json();
      await copyText(data.asset?.tikz_code || "");
      showToast("Đã copy code TikZ.");
    } catch {
      showToast("Không copy được code.");
    }
    return;
  }

  if (action === "load") {
    try {
      const response = await fetch(`/api/assets/${id}`);
      const data = await response.json();
      const asset = data.asset;
      if (!asset) throw new Error("Không tìm thấy hình.");

      dom.tikzCode.value = asset.tikz_code || "";
      dom.sceneJson.value = asset.scene_json || "{}";
      try {
        state.scene = JSON.parse(asset.scene_json || "{}");
      } catch {
        // scene_json co the la ghi chu cua AI, khong phai scene chuan — bo qua.
      }

      if (asset.image_data_url) {
        dom.sourceImage.src = asset.image_data_url;
        dom.sourceImage.hidden = false;
        dom.emptyDropState.hidden = true;
        state.currentImageDataUrl = asset.image_data_url;
        state.currentImageName = asset.title || "";
      }

      hideCompiledPreview();
      dom.assetTitle.value = asset.title || "";
      dom.assetGrade.value = asset.grade || "";
      dom.assetChapter.value = asset.chapter || "";
      dom.assetLesson.value = asset.lesson || "";
      dom.assetDifficulty.value = asset.difficulty || "";

      state.selectedPointId = null;
      if (hasEditableModel()) {
        renderScene();
        recordHistory();
      } else {
        // Giu nguyen code TikZ goc (vd hinh AI sinh) — chi co the sua bang lenh.
        renderBrowserPreview();
        updateInspector();
        updateEditHint();
      }
      showToast("Đã nạp hình. Bấm Compile để xem preview.");
    } catch (error) {
      showToast(error.message || "Không nạp được hình.");
    }
    return;
  }

  if (action === "delete") {
    try {
      const response = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Xóa lỗi.");
      showToast("Đã xóa hình khỏi thư viện.");
      loadLibrary();
    } catch {
      showToast("Không xóa được hình.");
    }
  }
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    dom.toast.classList.remove("show");
  }, 2200);
}

dom.imageInput.addEventListener("change", (event) => {
  loadImageFile(event.target.files?.[0]);
});

dom.dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dom.dropZone.classList.add("dragover");
});

dom.dropZone.addEventListener("dragleave", () => {
  dom.dropZone.classList.remove("dragover");
});

dom.dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dom.dropZone.classList.remove("dragover");
  loadImageFile(event.dataTransfer.files?.[0]);
});

document.addEventListener("paste", (event) => {
  const file = [...(event.clipboardData?.files || [])].find((entry) => entry.type.startsWith("image/"));
  if (file) {
    loadImageFile(file);
  }
});

dom.pasteImageButton.addEventListener("click", pasteImageFromClipboard);
dom.clearImageButton.addEventListener("click", clearImage);
dom.contrastButton.addEventListener("click", () => {
  state.imageFilters.contrast = !state.imageFilters.contrast;
  applyImageFilters();
});
dom.monoButton.addEventListener("click", () => {
  state.imageFilters.mono = !state.imageFilters.mono;
  applyImageFilters();
});

dom.analyzeButton.addEventListener("click", analyzeWithAI);

dom.generateButton.addEventListener("click", () => {
  state.scene = cloneTemplate(dom.figureTemplate.value);
  if (dom.generatorNote.value.trim()) {
    state.scene.note = dom.generatorNote.value.trim();
  }
  state.selectedPointId = null;
  renderAll();
  recordHistory();
  showToast("Đã sinh code TikZ từ mô hình.");
});

dom.figureTemplate.addEventListener("change", () => {
  state.scene = cloneTemplate(dom.figureTemplate.value);
  state.selectedPointId = null;
  renderAll();
  recordHistory();
});

dom.resetModelButton.addEventListener("click", () => {
  state.scene = cloneTemplate(dom.figureTemplate.value);
  state.selectedPointId = null;
  renderAll();
  recordHistory();
});

dom.sceneJson.addEventListener("blur", updateSceneFromJson);

dom.compileButton.addEventListener("click", compilePreview);
dom.saveButton.addEventListener("click", saveAsset);
dom.copyButton.addEventListener("click", async () => {
  await copyText(dom.tikzCode.value);
  showToast("Đã copy code TikZ.");
});

dom.settingsButton.addEventListener("click", openSettings);
dom.settingsClose.addEventListener("click", closeSettings);
dom.settingsSave.addEventListener("click", saveSettings);
dom.settingsModal.addEventListener("click", (event) => {
  if (event.target === dom.settingsModal) closeSettings();
});

dom.exportButton.addEventListener("click", openExport);
dom.exportClose.addEventListener("click", closeExport);
dom.exportModal.addEventListener("click", (event) => {
  if (event.target === dom.exportModal) closeExport();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!dom.exportModal.hidden) closeExport();
  if (!dom.settingsModal.hidden) closeSettings();
});

dom.wrapMode.addEventListener("change", updateExportOutput);
dom.qType.addEventListener("change", updateExportOutput);
dom.exportModal.addEventListener("input", (event) => {
  if (event.target.closest(".modal-body") && event.target !== dom.exportOutput) {
    updateExportOutput();
  }
});

dom.exportCopy.addEventListener("click", async () => {
  await copyText(dom.exportOutput.value);
  showToast("Đã copy code đã đóng gói.");
});
dom.exportDownload.addEventListener("click", () => {
  downloadTex("mathbank-cau-hoi.tex", buildTexDocument(dom.exportOutput.value));
  showToast("Đã tải file .tex.");
});

dom.libraryList.addEventListener("click", handleLibraryAction);
dom.assetForm.addEventListener("submit", saveAsset);
dom.reloadLibraryButton.addEventListener("click", loadLibrary);
dom.exportLibraryButton.addEventListener("click", exportLibraryTex);
dom.filterGrade.addEventListener("change", loadLibrary);

let librarySearchTimer;
dom.librarySearch.addEventListener("input", () => {
  clearTimeout(librarySearchTimer);
  librarySearchTimer = setTimeout(loadLibrary, 300);
});

dom.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendCorrection();
});

dom.chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendCorrection();
  }
});

dom.clearChatButton.addEventListener("click", clearChat);

// Editor tuong tac
dom.browserPreview.addEventListener("pointerdown", onPreviewPointerDown);
dom.undoButton.addEventListener("click", undo);
dom.redoButton.addEventListener("click", redo);
dom.inspDeselect.addEventListener("click", deselectPoint);
dom.inspX.addEventListener("change", applyInspectorEdit);
dom.inspY.addEventListener("change", applyInspectorEdit);
dom.inspLabelPos.addEventListener("change", applyInspectorEdit);
dom.inspVisible.addEventListener("change", applyInspectorEdit);

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    if (document.activeElement?.matches("input, textarea, select")) return;
    event.preventDefault();
    if (event.shiftKey) redo();
    else undo();
  }
});

renderChat();
renderAll();
recordHistory();
loadLibrary();
checkAiConfig();
initDesktop();
