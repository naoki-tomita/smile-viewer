const { ipcRenderer } = require("electron");

class Logger {
  constructor() {
    this.el = document.createElement("pre");
    this.el.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    this.el.style.color = "white";
    document.body.appendChild(this.el);
  }

  log(log) {
    this.el.innerText = `${log}\n${this.el.innerText}`.split("\n").slice(0, 30).join("\n");
  }
}

// const logger = new Logger();

const width = window.innerWidth;
const differentialWidthPerSecond = width / 3;
class SmileView {
  constructor() {
    /** @type {HTMLElement} */
    this.el = document.createElement("div");
    this.el.style.position = "absolute";
    this.el.style.top = 0;
    this.el.style.bottom = 0;
    this.el.style.right = 0;
    this.el.style.left = 0;
    document.body.appendChild(this.el);
    /** @type {SmileItem[]} */
    this.items = [];
    /** @type {number} */
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
  return context.measureText(text).width;
}

class SmileItem {
  constructor(text, color = "black", speed = "normal") {
    this.el = document.createElement("div");
    this.x = window.innerWidth;
    this.y = Math.random() * (window.innerHeight - 72);
    this.el.style.position = "absolute";
    this.width = getTextWidth(text) + 30; // padding left, right: 30.
    this.el.appendChild(this.createSmileElement(text, color, this.width));
    this.updateTransform();
  }

  createSmileElement(text, color, width) {
    const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    textEl.append(text);
    textEl.setAttribute("x", "15");
    textEl.setAttribute("y", "72");
    textEl.setAttribute("stroke-width", "15px");
    textEl.setAttribute("stroke-linejoin", "round");
    textEl.setAttribute("paint-order", "stroke");
    textEl.style.font = "72px sans-serif";
    textEl.style.stroke = "white";
    textEl.style.fill = color;
    svgEl.setAttribute("width", width);
    svgEl.append(textEl);
    return svgEl;
  }

  /**
   * @param {number} dx
   * @param {number} dy
   */
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
