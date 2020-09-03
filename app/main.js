const { app, BrowserWindow, ipcMain, Menu, Tray } = require("electron");
const WebSocket = require("ws");
const { join } = require("path");

class Observable {
  constructor() {
    this.cbs = {};
  }

  on(type, cb) {
    this.cbs[type] = [...(this.cbs[type] || []), cb];
  }

  emit(type, ...args) {
    this.cbs[type].forEach(it => it(...args));
  }
}

const _console = global.console;
let logger;
const console = {
  log(...params) {
    logger?.webContents?.send("log", params.join(", "));
    _console.log(...params);
  }
}

class MessageClient extends Observable {
  constructor() {
    super();
    console.log(`connecting to ${process.env.WS || "ws://ws-smile-server.herokuapp.com"}`);
    this.connect();
  }

  connect() {
    this.ws?.removeAllListeners();
    this.ws = new WebSocket(process.env.WS || "ws://ws-smile-server.herokuapp.com");
    this.ws.once("open", () => console.log("connected"));
    this.ws.once("error", () => console.log("failed to connect."));
    this.ws.once("close", () => setTimeout(() => {
      console.log(`reconnecting...`);
      this.connect();
    }, 2000));
    this.ws.on("message", (data) => this.emit("message", data))
  }

  onMessage(cb) { this.on("message", cb); }
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
    webPreferences: { nodeIntegration: true },
  });
  win.setIgnoreMouseEvents(true);
  win.maximize();
  app.dock.hide();
  win.setAlwaysOnTop(true, "floating");
  win.setVisibleOnAllWorkspaces(true);
  win.fullScreenable = false;
  app.dock.show();
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

function createLoggerWindow() {
  logger = new BrowserWindow({
    width: 200, height: 400,
    // frame: false,
    hasShadow: false,
    transparent: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  logger.loadFile(join(__dirname, "./logger.html"));
}

app.allowRendererProcessReuse = true;
app.on("ready", () => {
  // createSmileClientWindow();
  createSmileWindow();
  // createLoggerWindow();

  const tray = new Tray(join(__dirname, "./smile.png"));
  tray.setToolTip('This is my application.')
  tray.on("click", () => createLoggerWindow());
});
