const { ipcRenderer } = require("electron");

class MessageSender {
  constructor() {
    this.input = document.getElementById("message");
    this.sendBtn = document.getElementById("send");
    this.input.addEventListener("keypress", e => e.keyCode === 13 && this.input.value && this.send());
    this.sendBtn.addEventListener("click", () => this.send());
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

  enabled() {
    this.sendBtn.disabled = false;
  }
}

(function() {
  const sender = new MessageSender();
  sender.onSend(m => ipcRenderer.send("message", m));
})();
