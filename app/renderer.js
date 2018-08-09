class Logger {
  constructor() {
    this.el = document.createElement("pre");
    document.appendChild(this.el);
  }

  log(log) {
    this.el.innerHTML += `${log}\n`;
  }
}

class MessageClient {
  constructor() {
    this.ws = new WebSocket('ws://localhost:8080/');
  }
  onOpen(cb) {
    this.ws.addEventListener("open", cb);
  }

  onError(cb) {
    this.ws.addEventListener("error", cb);
  }

  onMessage(cb) {
    this.ws.addEventListener("message", cb);
  }

  onClose(cb) {
    this.ws.addEventListener("close", cb);
  }

  send(msg) {
    this.ws.send(msg);
  }
}

class SmileView {
  constructor() {
    this.el = document.createElement("div");
    this.el.style.position = "relative";
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
    this.items.forEach(item => item.move(-5));
  }
}

class SmileItem {
  constructor(text) {
    this.el = document.createElement("div");
    this.x = window.innerWidth;
    this.y = Math.random() * (window.innerHeight - 32);
    this.el.style.position = "absolute";
    this.el.style.fontSize = "32px";
    this.el.style.color = "black";
    this.el.style.textShadow = `1px 1px 0 white, -1px 1px 0 white, 1px -1px 0 white, -1px -1px 0 white`;
    this.el.innerText = text;
    this.updateTransform();
  }

  move(dx, dy) {
    this.x = this.x > 0 ? this.x + (dx || 0) : window.innerWidth;
    this.y = this.y > 0 ? this.y + (dy || 0) : window.innerHeight;
    this.updateTransform();
  }

  updateTransform() {
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
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
}

function main() {
  const client = new MessageClient();
  const view = new SmileView();
  const sender = new MessageSender();
  client.onMessage(e => view.smile(e.data));
  sender.onSend(m => client.send(m));
  function loop() {
    view.update();
    requestAnimationFrame(loop);
  }
  loop();
}

main();