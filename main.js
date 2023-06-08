const { app, BrowserWindow } = require("electron");
const { renderMenu } = require("./menu");
const { registerIpcMain } = require("./ipcMain");
const path = require("path");

function createWindow() {
  registerIpcMain();
  const win = new BrowserWindow({
    width: 1366,
    height: 665,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  renderMenu(win);
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("ready", () => {});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
