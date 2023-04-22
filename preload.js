const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  handleFiles: (callback) => ipcRenderer.on("open-files", callback),
  handleDirectory: (callback) => ipcRenderer.on("open-directory", callback),
  invokeReadID3: (root, file) => ipcRenderer.invoke("read-ID3", root, file),
});
