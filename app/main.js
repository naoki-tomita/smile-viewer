const { app, BrowserWindow, ipcMain } = require("electron");
const WebSocket = require("ws");
const { join } = require("path");

class MessageClient {
  constructor() { this.ws = new WebSocket(process.env.WS || "ws://ws-smile-server.herokuapp.com"); }
  onOpen(cb) { this.ws.on("open", cb); }
  onError(cb) { this.ws.on("error", cb); }
  onMessage(cb) { this.ws.on("message", cb); }
  onClose(cb) { this.ws.on("close", cb); }
  smile(msg) { this.ws.send(msg); }
}

const client = new MessageClient();

function createSmileWindow () {
  const { screen } = require("electron");
  const size = screen.getPrimaryDisplay().size;
  const win = new BrowserWindow({
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
  win.loadFile(join(__dirname, "./screen.html"));

  client.onMessage(message => win.webContents.send("message", message));
}

function createSmileClientWindow() {
  const win = new BrowserWindow({
    title: "smile client",
    width: 520, height: 72,
    frame: true,
    hasShadow: false,
    transparent: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile(join(__dirname, "./client.html"));
  ipcMain.on("message", (_, message) => client.smile(message));
  // win.webContents.openDevTools();
}

app.on("ready", () => {
  // createSmileClientWindow();
  createSmileWindow();
});
