const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  toggleFullscreen: () => ipcRenderer.invoke("toggle-fullscreen"),
  setSize: (w, h) => ipcRenderer.invoke("set-size", w, h),
  minimize: () => ipcRenderer.invoke("minimize"),
  close: () => ipcRenderer.invoke("close"),
  savePng: (base64) => ipcRenderer.invoke("save-png", base64),
  onFullscreenChange: (cb) => {
    const listener = (_e, value) => cb(value);
    ipcRenderer.on("fullscreen-changed", listener);
    return () => ipcRenderer.removeListener("fullscreen-changed", listener);
  },
});