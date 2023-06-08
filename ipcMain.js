const { ipcMain } = require("electron");
const { getID3, setID3, getCueMsg, setCueMsg } = require("./utils/util.js");

function registerIpcMain() {
  ipcMain.handle("read-ID3", async (event, root, file) => {
    return getID3(root, file);
  });
  ipcMain.handle("set-ID3", async (event, root, file, tags) => {
    return setID3(root, file, tags);
  });
  ipcMain.handle("set-cue", async (event, root, file, content) => {
    return setCueMsg(root, file, content);
  });
  ipcMain.handle("read-cue", async (event, root, file) => {
    return getCueMsg(root, file);
  });
}

exports.registerIpcMain = registerIpcMain;
