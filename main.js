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
  initVue();
  vm.callStartCalc();
}

function initVue() {
  app = Vue.createApp({
    data() {
      return {
        input: {
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
        let data = { beacons: [], numScale: this.input.numScale };
        for (let i = 0; i < m.length; i++) {
          data.beacons[i] = {
            x: m[i].x * this.input.beacon[i].d,
            y: m[i].y * this.input.beacon[i].d,
            z: 0,
            r: this.input.distTo[i],
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
          this.callStartCalc();
        },
        deep: true
      },
    },
  })
  vm = app.mount('#app')
}

function startCalc(data, output) {
  let p = [];
  for (let i = 0; i < 4; i++) {
    if (data.beacons[i].use) {
      p.push(data.beacons[i]);
    }
  }
  undefineObjectProperties(output.pos);
  if (p.length >= 3) {
    calculate(p[0], p[1], p[2], output.pos);
  }
  drawResults(data, output);
}

function calculate(p1, p2, p3, pos) {
  let p4 = snTrilaterate(p1, p2, p3);
  if (p4 !== null) {
    pos.x = p4.x;
    pos.y = p4.y;
    pos.z = p4.z;
  } else {
    undefineObjectProperties(pos);
  }
}

function snTrilaterate(p1, p2, p3) {
  let p4 = snTrilaterate2(p1, p2, p3);
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
        p4 = snTrilaterate2(pp1, pp2, pp3);
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

function snTrilaterate2(p1, p2, p3) {
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

function drawResults(data, output) {
  map.numScale = data.numScale;
  map.beacons = data.beacons;
  map.pos = output.pos;
  map.update();
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

