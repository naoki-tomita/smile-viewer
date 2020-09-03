const { ipcRenderer } = require("electron");
class Logger {
  constructor() {
    this.el = document.createElement("pre");
    this.el.style.backgroundColor = "#444";
    this.el.style.color = "white";
    document.body.appendChild(this.el);
  }

  log(log) {
    this.el.innerHTML += `${log}\n`;
  }
}

const logger = new Logger();
ipcRenderer.on("log", (_, log) => logger.log(log));
