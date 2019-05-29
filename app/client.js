const { ipcRenderer } = require("electron");

class Logger {
  constructor() {
    this.el = document.createElement("pre");
    this.el.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    this.el.style.color = "white";
    document.body.appendChild(this.el);
  }

  log(log) {
    this.el.innerHTML += `${log}\n`;
  }
}

class MessageSender {
  constructor() {
    this.input = document.getElementById("message");
    this.sendBtn = document.getElementById("send");
    this.input.addEventListener("keypress", e => {
      if (e.keyCode === 13 && this.input.value) {
        this.send()
      }
    });
    this.sendBtn.addEventListener("click", () => {
      this.send();
    });
  }

  send() {
    this.cb(this.input.value);
    this.input.value = "";
  }

  onSend(cb) {
    this.cb = cb;
  }

  focus() {
    this.input.style.display = "inline";
    this.input.focus();
  }

  blur() {
    this.input.style.display = "none";
  }
}

(function() {
  const sender = new MessageSender();
  sender.onSend(m => ipcRenderer.send("message", m));
})();
