const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#0b0b0f",
    frame: false,
    show: false,

    // A PARTE QUE IMPORTA
    icon: "./icon.png",


    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
    },
  });

  mainWindow.loadURL("https://arcstudio.online");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  const sendMaximizeState = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        "win:maximize-change",
        mainWindow.isMaximized()
      );
    }
  };

  const sendFullscreenState = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        "win:fullscreen-change",
        mainWindow.isFullScreen()
      );
    }
  };

  mainWindow.on("maximize", sendMaximizeState);
  mainWindow.on("unmaximize", sendMaximizeState);
  mainWindow.on("enter-full-screen", sendFullscreenState);
  mainWindow.on("leave-full-screen", sendFullscreenState);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC
ipcMain.handle("win:is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.on("win:toggle-maximize", () => {
  if (!mainWindow) return;
  mainWindow.isMaximized()
    ? mainWindow.unmaximize()
    : mainWindow.maximize();
});

ipcMain.on("win:minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("win:close", () => {
  if (mainWindow) mainWindow.close();
});
