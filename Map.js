
export class Map {
  constructor(elementId) {
    this.elementId = elementId;
    // this.grabContext();
    this.pxInUnit = 1;
    this.bgColor = "#f7fbff";
  }

  grabContext() {
    this.canvas = document.getElementById(this.elementId);
    this.ctx = this.canvas.getContext("2d");
  }

  setScale(x, y) {
    this.grabContext();
    let sx = Math.ceil(Math.abs(x) * 1.1 * 2 / this.canvas.width);
    let sy = Math.ceil(Math.abs(y) * 1.1 * 2 / this.canvas.height);
    this.pxInUnit = Math.max(1, sx, sy);
  }

  update() {
    this.bgColor = (this.pos.x != null) ? "#f7fbff" : "#ffeeee";
    if (this.pos.x != null) {
      this.setScale(this.pos.x, this.pos.y);
    }
    this.setupGrid();
    this.drawBeacons();
    this.drawPosition();
  }

  setupGrid() {
    this.grabContext();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    let x0 = Math.floor(this.canvas.width / 2) + 0.5;
    let y0 = Math.floor(this.canvas.height / 2) + 0.5;
    this.ctx.setTransform(1, 0, 0, -1, x0, y0);
    let xMin = -x0;
    let yMin = -y0;
    let xMax = this.canvas.width - x0;
    let yMax = this.canvas.height - y0;

    // this.ctx.scale(1 / this.scale, 1 / this.scale);

    let cellSize = 10;

    let cellsX = Math.floor(this.canvas.width / cellSize);
    let cellsY = Math.floor(this.canvas.height / cellSize);

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#e9e9e9";
    for (let i = -cellsX; i <= cellsX; i++) {
      let x = cellSize * i;
      this.line(x, yMin, x, yMax);
    }
    for (let i = -cellsY; i <= cellsY; i++) {
      let y = cellSize * i;
      this.line(xMin, y, xMax, y);
    }
    this.ctx.strokeStyle = "#000000";
    this.line(0, yMin, 0, yMax);
    this.line(xMin, 0, xMax, 0);
  }

  drawBeacons() {
    this.ctx.lineWidth = 0.5;
    let cnt = 0;
    for (let i = 0; i < this.beacons.length; i++) {
      let p = this.beacons[i];
      this.ctx.fillStyle = p.c;
      this.ctx.strokeStyle = p.c;
      this.square(p.x, p.y, 5);
      if (this.beacons[i].use && cnt < 3) {
        this.circle(p.x, p.y, p.r);
        cnt += 1;
      }
      this.ctx.font = '12px Times';
      this.drawText(p.n, p.x + 3, p.y + 3);
    }
  }

  drawPosition() {
    this.ctx.lineWidth = 1;
    if (this.pos != null) {
      this.ctx.fillStyle = "#000";
      this.square(this.pos.x, this.pos.y, 7);
      let x = Math.round(this.pos.x);
      let y = Math.round(this.pos.y);
      let z = -Math.round(this.pos.z);
      this.drawText(`${x},${y} (${z})`, this.pos.x + 3, this.pos.y + 3);
    }
  }

  line(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  square(x, y, a) {
    let s = this.scale(x, y);
    s.x = Math.round(s.x);
    s.y = Math.round(s.y);
    this.ctx.fillRect(s.x - a / 2, s.y - a / 2, a, a);
  }

  circle(x, y, r) {
    let s = this.scale(x, y);
    this.ctx.beginPath();
    this.ctx.arc(s.x, s.y, r / this.pxInUnit, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  drawText(text, x, y) {
    let s = this.scale(x, y);
    this.ctx.save();
    this.ctx.scale(1, -1);
    this.ctx.fillText(text, s.x, -s.y);
    this.ctx.restore();
  }

  scale(x, y) {
    return { x: x / this.pxInUnit, y: y / this.pxInUnit };
  }

}