import { trilaterate } from "./trilateration.js";
import { Map } from "./Map.js";

window.onload = main;

const m = [
  { x: +0, y: +1, c: "#F00", n: "N" },
  { x: +1, y: +0, c: "#0F0", n: "E" },
  { x: +0, y: -1, c: "#00F", n: "S" },
  { x: -1, y: +0, c: "#F0F", n: "W" },
];
let app, vm, map;

async function main() {
  map = new Map("canvas1");
  window.addEventListener("resize", resizeCanvas, false);
  initVue();
  vm.callStartCalc();
  resizeCanvas();
}

function initVue() {
  app = Vue.createApp({
    data() {
      return {
        input: {
          depth: 0,
          beacon: [
            { d: 1000, use: true },
            { d: 1500, use: true },
            { d: 1000, use: true },
            { d: 1000, use: true },
          ],
          distTo: [
            1000,
            1500,
            1000,
            1000,
          ],
          numScale: 2,
        },
        output: {
          pos: {
            x: 0,
            y: 0,
            z: 0,
          },
        }
      }
    },
    methods: {
      callStartCalc() {
        let data = {
          depth: this.input.depth,
          beacons: [],
          numScale: this.input.numScale
        };
        for (let i = 0; i < m.length; i++) {
          data.beacons[i] = {
            pos: {
              x: m[i].x * this.input.beacon[i].d,
              y: m[i].y * this.input.beacon[i].d,
              z: 0,
            },
            r: this.input.distTo[i],
            rxy: cathetus(this.input.distTo[i], this.input.depth),
            c: m[i].c,
            n: m[i].n + this.input.beacon[i].d,
            use: this.input.beacon[i].use
          };
        }
        startCalc(data, this.output);
      },
    },
    computed: {
      getLastModified() {
        return document.lastModified;
      }
    },
    watch: {
      input: {
        handler(newValue, oldValue) {
          localStorage.setItem("input", JSON.stringify(this.input));
          this.callStartCalc();
        },
        deep: true
      },
    },
    mounted() {
      let storedInput = JSON.parse(localStorage.getItem("input"));
      if (storedInput !== null)
        Object.assign(this.input, storedInput);
    }
  })
  vm = app.mount('#app')
}

function resizeCanvas() {
  let canvas = document.getElementById("canvas1");
  let parent = canvas.parentElement;
  canvas.width = parent.offsetWidth;
  let h = Math.max(canvas.width * 0.5, window.innerHeight - canvas.offsetTop - 50);
  canvas.height = h;
  map.update();
}

function startCalc(data, output) {
  let spheres = [];
  for (let i = 0; i < 4; i++) {
    if (data.beacons[i].use) {
      spheres.push({ pos: data.beacons[i].pos, r: data.beacons[i].r });
    }
  }
  output.pos = calculate(spheres, data.depth);
  drawResults(data, output);
}

function calculate(spheres, depth) {
  const circles = [];
  for (let i = 0; i < spheres.length; i++) {
    circles.push({ pos: spheres[i].pos, r: cathetus(spheres[i].r, depth) });
  }
  if (circles.length == 3) {
    let rc = radicalCenter(circles);
    return { x: rc.x, y: rc.y, z: -depth };
  } else if (circles.length == 4) {
    let rcs = { x: 0, y: 0 };
    for (let i = 0; i < 4; i++) {
      let circles2 = [];
      for (let j = 0; j < circles.length; j++) {
        if (j != i) {
          circles2.push(circles[j]);
        }
      }
      let rc = radicalCenter(circles2);
      rcs.x += rc.x;
      rcs.y += rc.y;
    }
    rcs.x = rcs.x / 4;
    rcs.y = rcs.y / 4;
    return { x: rcs.x, y: rcs.y, z: -depth };
  }
}

function drawResults(data, output) {
  map.numScale = data.numScale;
  map.beacons = data.beacons;
  map.positions.length = 0;
  if (output.pos != undefined) {
    map.positions.push({ x: output.pos.x, y: output.pos.y, z: -data.depth });
  }
  map.update();
}

function snTrilaterate(p1, p2, p3) {
  let p4 = snTrilaterateOnce(p1, p2, p3);
  if (p4 === null) {
    let p4s = [];
    for (let j = 0; j < 10; j++) {
      let p = 0.01 * j;
      for (let i = 0; i < 1000; i++) {
        let q = 0;
        q = 1 + (Math.random() - 0.5) * p;
        let pp1 = { x: p1.x, y: p1.y, z: p1.z, r: p1.r * q };
        q = 1 + (Math.random() - 0.5) * p;
        let pp2 = { x: p2.x, y: p2.y, z: p2.z, r: p2.r * q };
        q = 1 + (Math.random() - 0.5) * p;
        let pp3 = { x: p3.x, y: p3.y, z: p3.z, r: p3.r * q };
        p4 = snTrilaterateOnce(pp1, pp2, pp3);
        if (p4 !== null)
          p4s.push(p4);
      }
      if (p4s.length > 0) {
        let x = 0;
        let y = 0;
        for (let i = 0; i < p4s.length; i++) {
          x += p4s[i].x;
          y += p4s[i].y;
        }
        x = x / p4s.length;
        y = y / p4s.length;
        let p4 = { x: x, y: y, z: 0 };
        return p4;
      }
    }
  }
  return p4;
}

function snTrilaterateOnce(p1, p2, p3) {
  let p4 = trilaterate(p1, p2, p3);
  if (p4 instanceof Array) {
    if (p4[0].z <= 0) {
      return p4[0];
    } else {
      return p4[1];
    }
  } else {
    return p4;
  }
}

function initArray(arr, len, first = 0, delta = 0) {
  arr.length = len;
  arr.fill(0);
  if (delta > 0) {
    for (let i = 0, j = first; i < arr.length; i++, j += delta) {
      arr[i] = j;
    }
  }
}

function undefineObjectProperties(obj) {
  if (obj instanceof Array) {
    obj.length = 0;
  } else {
    for (const property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof (obj[property]) == 'object') {
          undefineObjectProperties(obj[property])
        } else {
          obj[property] = undefined;
        }
      }
    }
  }
}

function cathetus(c, a) {
  return Math.sqrt(c ** 2 - a ** 2);
}

const determinant = m =>
  m.length == 1 ?
    m[0][0] :
    m.length == 2 ?
      m[0][0] * m[1][1] - m[0][1] * m[1][0] :
      m[0].reduce((r, e, i) =>
        r + (-1) ** (i + 2) * e * determinant(m.slice(1).map(c =>
          c.filter((_, j) => i != j))), 0);

function radicalCenter(circles) {
  if (circles.length == 3) {
    const i = [1, 1, 1];
    const a = [];
    const b = [];
    const c = [];
    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i];
      a.push(-2 * circle.pos.x);
      b.push(-2 * circle.pos.y);
      c.push(circle.pos.x ** 2 + circle.pos.y ** 2 - circle.r ** 2);
    }
    const deta = determinant([
      i,
      b,
      c,
    ]);
    const detb = determinant([
      a,
      i,
      c,
    ]);
    const detc = determinant([
      a,
      b,
      i,
    ]);
    return { x: deta / detc, y: detb / detc };
  }
}