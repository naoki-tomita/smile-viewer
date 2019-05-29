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

const width = window.innerWidth;
const differentialWidthPerSecond = width / 5;
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
    this.lastTime = Date.now();
  }

  smile(text) {
    const item = new SmileItem(text);
    this.el.appendChild(item.el);
    this.items.push(item);
  }

  update() {
    const now = Date.now();
    const clearanceTime = now - this.lastTime;
    const differentialOfPositionX = (clearanceTime / 1000) * differentialWidthPerSecond;
    this.items.forEach(item => {
      item.move(-differentialOfPositionX);
      if (item.isDestroyed()) {
        this.el.removeChild(item.el);
      }
    });
    this.items = this.items.filter(item => !item.isDestroyed());
    this.lastTime = now;
  }
}

const canvas = document.createElement("canvas");
function getTextWidth(text) {
  const context = canvas.getContext("2d")
  context.font = "72px sans-serif";
  return context.measureText(text).width + 30;
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
      <svg width="${width}">
        <text
          x="15" y="72"
          stroke-width="15px"
          stroke-linejoin="round"
          paint-order="stroke"
          style="font: 72px sans-serif; stroke: white; fill: black;"
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

(function() {
  const view = new SmileView();
  ipcRenderer.on("message", (_, message) => view.smile(message));

  function loop() {
    view.update();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
