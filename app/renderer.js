const { ipcRenderer } = require("electron");

class Logger {
  constructor() {
    this.el = document.createElement("pre");
    document.body.appendChild(this.el);
  }

  log(log) {
    this.el.innerHTML += `${log}\n`;
  }
}

class MessageClient {
  constructor() { this.ws = new WebSocket('ws://localhost:8080/'); }
  onOpen(cb) { this.ws.addEventListener("open", cb); }
  onError(cb) { this.ws.addEventListener("error", cb); }
  onMessage(cb) { this.ws.addEventListener("message", cb); }
  onClose(cb) { this.ws.addEventListener("close", cb); }
  send(msg) { this.ws.send(msg); }
}

class SmileView {
  constructor() {
    this.el = document.createElement("div");
    this.el.style.position = "absolute";
    this.el.style.top = 0;
    this.el.style.bottom = 0;
    this.el.style.right = 0;
    this.el.style.left = 0;
    document.body.appendChild(this.el);
    this.items = [];
  }

  smile(text) {
    const item = new SmileItem(text);
    this.el.appendChild(item.el);
    this.items.push(item);
  }

  update() {
    this.items.forEach(item => {
      item.move(-8);
      if (item.isDestroyed()) {
        this.el.removeChild(item.el);
      }
    });
    this.items = this.items.filter(item => !item.isDestroyed());
  }
}

function getTextWidth(text) {
  const tmp = document.createElement("span");
  tmp.innerText = text;
  tmp.style.fontSize = "72px";
  tmp.style.visibility = 'hidden';
  document.body.appendChild(tmp);
  const width = tmp.offsetWidth;
  document.body.removeChild(tmp);
  return width;
}

class SmileItem {
  constructor(text) {
    this.el = document.createElement("div");
    this.x = window.innerWidth;
    this.y = Math.random() * (window.innerHeight - 72);
    this.el.style.position = "absolute";
    this.width = getTextWidth(text);
    this.el.innerHTML = this.createHtml(text, this.width);
    this.updateTransform();
  }

  createHtml(text, width) {
    return `
      <svg width="${width + 30}">
        <text
          x="15" y="72"
          stroke-width="15px"
          stroke-linejoin="round"
          paint-order="stroke"
          style="font-size: 72px; stroke: white; fill: black;"
        >
          ${text}
        </text>
      </svg>
    `;
  }

  move(dx, dy) {
    this.x = this.x + (dx || 0);
    this.y = this.y + (dy || 0);
    this.updateTransform();
  }

  updateTransform() {
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  isDestroyed() {
    return this.x <= -this.width;
  }
}

class MessageSender {
  constructor() {
    this.el = document.createElement("input");
    this.el.style.position = "absolute";
    this.el.style.top = 0;
    this.el.style.width = "100%";
    this.el.addEventListener("keypress", e => {
      if (e.keyCode === 13 && this.el.value) {
        this.cb(this.el.value);
        this.el.value = "";
      }
    });
    document.body.appendChild(this.el);
    this.el.focus();
  }

  onSend(cb) {
    this.cb = cb;
  }

  focus() {
    this.el.style.display = "inline";
    this.el.focus();
  }

  blur() {
    this.el.style.display = "none";
  }
}

(function() {
  const client = new MessageClient();
  const view = new SmileView();
  const sender = new MessageSender();

  client.onMessage(e => view.smile(e.data));
  sender.onSend(m => client.send(m));

  ipcRenderer.on("focus", () => sender.focus());
  ipcRenderer.on("blur", () => sender.blur());

  function loop() {
    view.update();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
