const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  handleFiles: (callback) => ipcRenderer.on("update-files", callback),
});
