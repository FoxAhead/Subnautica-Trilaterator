
export class Map {
  constructor(elementId) {
    this.elementId = elementId;
    // this.grabContext();
    this.pxInUnit = 1;
    this.numScale = 2;
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
    this.xMin = -x0;
    this.yMin = -y0;
    this.xMax = this.canvas.width - x0;
    this.yMax = this.canvas.height - y0;

    // this.ctx.scale(1 / this.scale, 1 / this.scale);

    let cellSize = 10;

    let cellsX = Math.floor(this.canvas.width / cellSize);
    let cellsY = Math.floor(this.canvas.height / cellSize);

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#e9e9e9";
    for (let i = -cellsX; i <= cellsX; i++) {
      let x = cellSize * i;
      this.line(x, this.yMin, x, this.yMax);
    }
    for (let i = -cellsY; i <= cellsY; i++) {
      let y = cellSize * i;
      this.line(this.xMin, y, this.xMax, y);
    }
    this.ctx.strokeStyle = "#000000";
    this.line(0, this.yMin, 0, this.yMax);
    this.line(this.xMin, 0, this.xMax, 0);
  }

  drawBeacons() {
    this.ctx.lineWidth = 0.5;
    let cnt = 0;
    for (let i = 0; i < this.beacons.length; i++) {
      const beacon = this.beacons[i];
      let p = beacon;
      this.ctx.fillStyle = p.c;
      this.ctx.strokeStyle = p.c;
      this.square(p.x, p.y, 5);
      if (beacon.use && cnt < 3) {
        this.circle(p.x, p.y, p.r);
        let rflat = Math.round(Math.sqrt(beacon.r ** 2 - this.pos.z ** 2) / this.numScale);
        this.drawText(`${beacon.n}: [${rflat}]`, (this.pos.x < 0) ? this.xMax : this.xMin, this.yMax - 20 - cnt * 10, false);
        cnt += 1;
      }
      this.ctx.font = '12px Times';
      this.drawText(p.n, p.x, p.y);


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
      this.drawText(`${x},${y},${z}\n[${y / this.numScale},${x / this.numScale}]`, this.pos.x, this.pos.y);
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

  drawText(text, x, y, doScale = true) {
    let s = (doScale) ? this.scale(x, y) : { x: x, y: y };
    let metrics = this.ctx.measureText(text);
    let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    let lines = text.split('\n');
    this.ctx.save();
    this.ctx.scale(1, -1);
    this.ctx.textAlign = (s.x < 0) ? "left" : "right";
    let dx = (s.x < 0) ? 5 : -5;
    // this.ctx.textBaseline = (s.y < 0) ? "bottom" : "top";
    for (let i = 0; i < lines.length; i++) {
      this.ctx.fillText(lines[i], s.x + dx, -(s.y - i * actualHeight));
    }
    this.ctx.restore();
  }

  scale(x, y) {
    return { x: x / this.pxInUnit, y: y / this.pxInUnit };
  }

}