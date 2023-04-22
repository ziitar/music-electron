const { ipcMain } = require("electron");
const { getID3 } = require("./util");

function registerIpcMain() {
  ipcMain.handle("read-ID3", async (event, root, file) => {
    return getID3(root, file);
  });
}

exports.registerIpcMain = registerIpcMain;
