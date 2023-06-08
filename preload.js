const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  handleFiles: (callback) => ipcRenderer.on("open-files", callback),
  handleDirectory: (callback) => ipcRenderer.on("open-directory", callback),
  invokeReadID3: (root, file) => ipcRenderer.invoke("read-ID3", root, file),
  invokeSetID3: (root, file, tags) =>
    ipcRenderer.invoke("set-ID3", root, file, tags),
  invokeReadCue: (root, file) => ipcRenderer.invoke("read-cue", root, file),
  invokeSetCue: (root, file, content) =>
    ipcRenderer.invoke("set-cue", root, file, content),
});
