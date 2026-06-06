const { contextBridge, ipcRenderer } = require("electron");

// Cau noi an toan giua trang web (renderer) va tien trinh chinh (main).
contextBridge.exposeInMainWorld("mathbankDesktop", {
  isDesktop: true,
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
  checkForUpdates: () => ipcRenderer.invoke("app:checkForUpdates")
});
