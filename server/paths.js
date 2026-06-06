const fs = require("node:fs");
const path = require("node:path");

// Khi dong goi Electron, thu muc app la read-only nen du lieu phai luu o
// thu muc rieng cua nguoi dung (Electron truyen qua MATHBANK_DATA_DIR).
// Khi chay `npm start` thuong thi luu vao storage/ trong project.
const dataDir = process.env.MATHBANK_DATA_DIR
  ? path.resolve(process.env.MATHBANK_DATA_DIR)
  : path.resolve(__dirname, "..", "storage");

fs.mkdirSync(dataDir, { recursive: true });

const settingsPath = path.join(dataDir, "settings.json");

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch {
    return {};
  }
}

function writeSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8");
}

module.exports = { dataDir, settingsPath, readSettings, writeSettings };
