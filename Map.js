
export class Map {
  constructor(elementId) {
    this.elementId = elementId;
    // this.grabContext();
    this.pxInUnit = 1;
    this.numScale = 2;
    this.bgColor = "#f7fbff";
    this.positions = [];
  }

  grabContext() {
    this.canvas = document.getElementById(this.elementId);
    this.ctx = this.canvas.getContext("2d");
  }

  setScale(x, y) {
    this.grabContext();
    let maxx = Math.max(...this.positions.map(o => Math.abs(o.x)))
    let maxy = Math.max(...this.positions.map(o => Math.abs(o.y)))
    let sx = Math.ceil(maxx * 1.1 * 2 / this.canvas.width);
    let sy = Math.ceil(maxy * 1.1 * 2 / this.canvas.height);
    this.pxInUnit = Math.max(1, sx, sy);
    if (this.pxInUnit != this.pxInUnit) {
      this.pxInUnit = 1;
    }
  }

  update() {
    this.bgColor = (this.positions.length > 0) ? "#f7fbff" : "#ffeeee";
    if (this.positions.length > 0) {
      this.setScale();
    }
    this.setupGrid();
    this.drawBeacons();
    this.drawPositions();
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
    this.ctx.lineWidth = 1;
    let fontHeight = 14;
    this.ctx.font = `bold ${fontHeight}px Verdana`;
    let cnt = 0;
    for (let i = 0; i < this.beacons.length; i++) {
      const beacon = this.beacons[i];
      const pos = beacon.pos;
      this.ctx.fillStyle = beacon.c;
      this.ctx.strokeStyle = beacon.c;
      this.square(pos.x, pos.y, 5);
      if (beacon.use && cnt < 3) {
        this.circle(pos.x, pos.y, beacon.rxy);
        let rxys = +(beacon.rxy / this.numScale).toFixed(1);
        this.drawText(`${beacon.n}: [${rxys}]`, (this.positions.length > 0 && this.positions[0].x < 0) ? this.xMax : this.xMin, this.yMax - 20 - cnt * fontHeight, false);
        cnt += 1;
      }
      this.drawText(beacon.n, pos.x, pos.y);


    }
  }

  drawPositions() {
    this.ctx.lineWidth = 1;
    this.ctx.font = 'bold 14px Verdana';
    this.ctx.fillStyle = "#000";
    for (let i = 0; i < this.positions.length; i++) {
      const pos = this.positions[i];
      this.square(pos.x, pos.y, 5);
      let x = +pos.x.toFixed(1);
      let y = +pos.y.toFixed(1);
      let z = +pos.z.toFixed(1);
      let xs = +(pos.x / this.numScale).toFixed(1);
      let ys = +(pos.y / this.numScale).toFixed(1);
      this.drawText(`${x}, ${y}, ${z}\n[${xs}, ${ys}]`, pos.x, pos.y);
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