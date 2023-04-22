const { app, BrowserWindow, Menu } = require("electron");
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
  const menu = renderMenu(win);
  Menu.setApplicationMenu(menu);
  win.loadURL("http://192.168.1.189:4200/music");
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("ready", () => {});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
