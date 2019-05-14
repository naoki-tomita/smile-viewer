const { app, BrowserWindow } = require("electron");
const { join } = require("path");

function createWindow () {
  const { screen } = require("electron");
  const size = screen.getPrimaryDisplay().size;
  win = new BrowserWindow({
    x: 0, y: 0,
    width: size.width,
    height: size.height,
    frame: false,
    show: true,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.setIgnoreMouseEvents(true);
  win.maximize();
  win.loadFile(join(__dirname, "./index.html"));
  app.on("browser-window-focus", () => {
    // console.log("focus");
    win.webContents.send("focus");
    win.setIgnoreMouseEvents(false);
  });
  app.on("browser-window-blur", () => {
    // console.log("blur");
    win.webContents.send("blur");
    win.setIgnoreMouseEvents(true);
  });
}

app.on("ready", createWindow);
