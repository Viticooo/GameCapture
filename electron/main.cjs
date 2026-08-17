const { app, BrowserWindow, Menu, globalShortcut, ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const devUrl = "http://localhost:5173";
const devMode = !app.isPackaged;

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    frame: false,
    backgroundColor: "#000000",
    title: "GameCapture",
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  const notifyFullscreen = () => {
    mainWindow.webContents.send("fullscreen-changed", mainWindow.isFullScreen());
  };
  mainWindow.on("enter-full-screen", notifyFullscreen);
  mainWindow.on("leave-full-screen", notifyFullscreen);

  // F11 alterna pantalla completa (funciona en Windows y Linux)
  mainWindow.webContents.on("before-input-event", (_event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      _event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  // Escape sale de pantalla completa
  mainWindow.webContents.on("before-input-event", (_event, input) => {
    if (input.type === "keyDown" && input.key === "Escape") {
      if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
      }
    }
  });

  // Permitir redimensionar con el mouse incluso con frame:false
  mainWindow.on("resize", notifyFullscreen);

  if (devMode) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

  if (process.platform === "win32") {
    app.commandLine.appendSwitch("disable-frame-rate-limit");
  }
  app.commandLine.appendSwitch("disable-lcd-text");

  globalShortcut.register("F11", () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  // ---- IPC: controles de ventana desde el renderer ----
  ipcMain.handle("toggle-fullscreen", () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  ipcMain.handle("set-size", (_event, w, h) => {
    if (mainWindow) {
      if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false);
      mainWindow.setMinimumSize(320, 200);
      mainWindow.setSize(w, h, true);
    }
  });

  ipcMain.handle("minimize", () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.handle("close", () => {
    if (mainWindow) mainWindow.close();
  });

  // Guardar captura de pantalla (base64) en la carpeta Imágenes
  ipcMain.handle("save-png", async (_event, base64) => {
    const win = mainWindow;
    if (!win) return false;
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "Guardar captura de pantalla",
      defaultPath: path.join(
        app.getPath("pictures"),
        `gamecapture-${new Date().toISOString().replace(/[:.]/g, "-")}.png`
      ),
      filters: [{ name: "PNG", extensions: ["png"] }],
    });
    if (canceled || !filePath) return false;
    fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
    return true;
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});