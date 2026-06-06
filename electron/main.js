const path = require("node:path");
const https = require("node:https");
const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");

// Du lieu (DB + API key) phai luu o thu muc nguoi dung vi thu muc app la read-only khi dong goi.
// Phai dat TRUOC khi require server (paths.js doc bien nay luc nap module).
process.env.MATHBANK_DATA_DIR = app.getPath("userData");

const { startServer } = require("../server/server");

const REPO = { owner: "THoa2102", repo: "mathbank-tikz-studio" };
const RELEASES_URL = `https://github.com/${REPO.owner}/${REPO.repo}/releases/latest`;

let mainWindow;

async function createWindow() {
  // Cong 0 = he dieu hanh cap mot cong trong tu do, tranh dung do.
  const { port } = await startServer(0);

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: "MathBank TikZ AI Studio",
    backgroundColor: "#f1f5f9",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Tu kiem tra cap nhat sau khi mo app (im lang neu khong co ban moi).
  setTimeout(() => checkForUpdates(false), 3000);
}

// So sanh phien ban dang "1.2.3" > "1.2.0" ?
function isNewer(remote, local) {
  const a = String(remote).replace(/^v/, "").split(".").map(Number);
  const b = String(local).replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

function fetchLatestTag() {
  return new Promise((resolve, reject) => {
    https
      .get(
        {
          host: "api.github.com",
          path: `/repos/${REPO.owner}/${REPO.repo}/releases/latest`,
          headers: { "User-Agent": "MathBank-TikZ-Studio", Accept: "application/vnd.github+json" }
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(data).tag_name || "");
            } catch (error) {
              reject(error);
            }
          });
        }
      )
      .on("error", reject);
  });
}

// Tren Windows: tu tai + cai (electron-updater). Tren Mac (app chua ky so):
// chi bao co ban moi roi mo trang tai.
async function checkForUpdates(manual) {
  if (process.platform === "win32") {
    autoUpdater.autoDownload = true;
    try {
      const result = await autoUpdater.checkForUpdates();
      if (manual && !(result && result.updateInfo && isNewer(result.updateInfo.version, app.getVersion()))) {
        dialog.showMessageBox(mainWindow, {
          type: "info",
          message: "Bạn đang dùng phiên bản mới nhất.",
          buttons: ["OK"]
        });
      }
    } catch (error) {
      if (manual) {
        dialog.showMessageBox(mainWindow, { type: "warning", message: `Không kiểm tra được cập nhật: ${error.message}`, buttons: ["OK"] });
      }
    }
    return;
  }

  // macOS / khac
  try {
    const tag = await fetchLatestTag();
    if (tag && isNewer(tag, app.getVersion())) {
      const choice = await dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "Có bản cập nhật",
        message: `Đã có phiên bản ${tag} (bạn đang dùng v${app.getVersion()}).`,
        detail: "Tải bản mới về và cài đè lên bản cũ. Dữ liệu của bạn được giữ nguyên.",
        buttons: ["Tải bản mới", "Để sau"],
        defaultId: 0,
        cancelId: 1
      });
      if (choice.response === 0) shell.openExternal(RELEASES_URL);
    } else if (manual) {
      dialog.showMessageBox(mainWindow, { type: "info", message: "Bạn đang dùng phiên bản mới nhất.", buttons: ["OK"] });
    }
  } catch (error) {
    if (manual) {
      dialog.showMessageBox(mainWindow, { type: "warning", message: `Không kiểm tra được cập nhật: ${error.message}`, buttons: ["OK"] });
    }
  }
}

// Khi tai xong ban moi tren Windows -> hoi khoi dong lai de cai.
autoUpdater.on("update-downloaded", (info) => {
  dialog
    .showMessageBox(mainWindow, {
      type: "info",
      title: "Đã tải bản cập nhật",
      message: `Bản ${info.version} đã tải xong.`,
      detail: "Khởi động lại app để hoàn tất cài đặt?",
      buttons: ["Khởi động lại ngay", "Để sau"],
      defaultId: 0,
      cancelId: 1
    })
    .then((r) => {
      if (r.response === 0) autoUpdater.quitAndInstall();
    });
});

ipcMain.handle("app:getVersion", () => app.getVersion());
ipcMain.handle("app:checkForUpdates", () => checkForUpdates(true));

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
