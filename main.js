const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const { renderMenu } = require("./menu");
const path = require("path");

function createWindow() {
  ipcMain.on("update-files", (event, value) => {
    console.log(value);
  });
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

app.on("open-file", (event, path) => {
  console.log("app on open file", path);
});

app.on("ready", () => {
  console.log(Menu.getApplicationMenu());
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
