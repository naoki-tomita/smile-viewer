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
    titleBarStyle: "hidden",
    fullscreen: true,
    fullscreenWindowTitle: false,
  });
  win.setIgnoreMouseEvents(true);
  // win.maximize();
  win.loadFile(join(__dirname, "./index.html"));
}

app.on("ready", createWindow);
