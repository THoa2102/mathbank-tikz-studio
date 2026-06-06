const path = require("node:path");
const { app, BrowserWindow, shell } = require("electron");

// Du lieu (DB + API key) phai luu o thu muc nguoi dung vi thu muc app la read-only khi dong goi.
// Phai dat TRUOC khi require server (paths.js doc bien nay luc nap module).
process.env.MATHBANK_DATA_DIR = app.getPath("userData");

const { startServer } = require("../server/server");

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
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  // Mo link ngoai bang trinh duyet he thong thay vi trong app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
