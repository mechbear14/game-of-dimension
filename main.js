const X = 0;
const Y = 1;
const Z = 2;

function ds(p1, p2) {
  let dx = p1.a - p2.a;
  let dy = p1.b - p2.b;
  let dz = p1.c - p2.c;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function randIntBetween(a, b) {
  let coef = Math.random();
  return Math.round(a * coef + b * (1 - coef));
}

class PointSystem {
  constructor(n) {
    this.nodes = [];
    this.links = [];
    this.visibleNodes = [];
    this.visibleLinks = [];
    for (let i = 0; i < n; i++) {
      let newPoint = new Point(
        i,
        randIntBetween(0, 200),
        randIntBetween(0, 200),
        randIntBetween(0, 200)
      );
      this.nodes.push(newPoint);
    }
    /*
    let a = this.nodes.slice();
    a.sort((pa, pb) => {
      return pa.a - pb.a;
    });
    let b = this.nodes.slice();
    b.sort((pa, pb) => {
      return pa.b - pb.b;
    });
    let c = this.nodes.slice();
    c.sort((pa, pb) => {
      return pa.c - pb.c;
    });

    for (let i = 0; i < this.nodes.length - 1; i++) {
      this.links.push({ source: a[i], target: a[i + 1], stroke: "#ff8000" });
      this.links.push({ source: b[i], target: b[i + 1], stroke: "#0080ff" });
      this.links.push({ source: c[i], target: c[i + 1], stroke: "#008000" });
    }
    */
  }

  getVisibleLinks(viewNode, dimension, width) {
    this.visibleNodes = this.nodes.filter(node => ds(viewNode, node) < width);
    let arr = this.visibleNodes.slice();
    switch (dimension) {
      case X:
        arr.sort((a, b) => a.a < b.a);
        break;
      case Y:
        arr.sort((a, b) => a.b < b.b);
        break;
      case Z:
        arr.sort((a, b) => a.c < b.c);
        break;
    }
    for (let i = 0; i < arr.length - 1; i++) {
      this.visibleLinks.push({ source: arr[i], target: arr[i + 1] });
    }
  }

  getRandomPoint() {
    let index = Math.round(Math.random() * this.nodes.length);
    return this.nodes[index];
  }

  setBeacon(point) {
    point.beacon = true;
  }
}

class Point {
  constructor(id, a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.id = id;
    this.beacon = false;
    this.links = new Array(6);
  }
}

system = new PointSystem(200);
system.setBeacon(system.getRandomPoint());
location = system.getRandomPoint();
while (location.beacon) {
  location = system.getRandomPoint();
}
system.getVisibleLinks(location);
console.log(location);
console.log(beacon);
console.log(system.visibleNodes);
console.log(system.visibleLinks);
