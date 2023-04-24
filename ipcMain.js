const { ipcMain } = require("electron");
const { getID3, setID3, setID3WithNodeID3 } = require("./util.js");

function registerIpcMain() {
  ipcMain.handle("read-ID3", async (event, root, file) => {
    return getID3(root, file);
  });
  ipcMain.handle("set-ID3", async (event, root, file, tags) => {
    console.log(root, file, JSON.stringify(tags));
    return setID3(root, file, tags);
  });
}

exports.registerIpcMain = registerIpcMain;
