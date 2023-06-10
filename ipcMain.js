const { ipcMain } = require("electron");
const {
  getID3,
  setID3,
  readDir,
  getCueMsg,
  setCueMsg,
  deleteFile,
  getAbsolutePath,
} = require("./utils/util.js");
const nodePath = require("node:path");

function registerIpcMain(window) {
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
  ipcMain.handle("get-path", async (event, root, file) => {
    return getAbsolutePath(root, file);
  });
  ipcMain.handle("rm-file", async (event, root, file, refresh) => {
    return deleteFile(root, file).then(async () => {
      if (refresh) {
        const fileList = await readDir(root, (item) =>
          [".mp3", ".wav", ".wma", ".flac", ".ogg", ".aac"].includes(
            nodePath.extname(item)
          )
        );
        window.webContents.send("open-directory", root, fileList);
      }
    });
  });
}

exports.registerIpcMain = registerIpcMain;
