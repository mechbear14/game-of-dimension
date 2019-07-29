const X = 0;
const Y = 1;
const Z = 2;
const COLOURS = ["#800080", "#ff8000", "#008000"];
// TODO: Refactor so that functions are property name and dimension count independent
// TODO: Name: "axis" or "dimension"?

function ds(p1, p2) {
  let dx = p1.a - p2.a;
  let dy = p1.b - p2.b;
  let dz = p1.c - p2.c;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function dsAxis(p1, p2, axis) {
  let dx = p1.a - p2.a;
  let dy = p1.b - p2.b;
  let dz = p1.c - p2.c;
  switch (axis) {
    case X:
      return Math.sqrt(dy * dy + dz * dz);
    case Y:
      return Math.sqrt(dx * dx + dz * dz);
    case Z:
      return Math.sqrt(dy * dy + dx * dx);
  }
  throw new Error("Invalid axis");
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
    this.beacon = undefined;
    for (let i = 0; i < n; i++) {
      let newPoint = new Point(
        i,
        randIntBetween(0, 100),
        randIntBetween(0, 100),
        randIntBetween(0, 100)
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
    let visibleCandidates = this.nodes.filter(
      node => dsAxis(viewNode, node, dimension) < width
    );
    switch (dimension) {
      case X:
        visibleCandidates.sort((p1, p2) => p1.a - p2.a);
        break;
      case Y:
        visibleCandidates.sort((p1, p2) => p1.b - p2.b);
        break;
      case Z:
        visibleCandidates.sort((p1, p2) => p1.c - p2.c);
        break;
    }
    this.visibleNodes.push(visibleCandidates[0]);
    for (let i = 1; i < visibleCandidates.length; i++) {
      switch (dimension) {
        case X:
          if (
            this.visibleNodes[this.visibleNodes.length - 1].a !=
            visibleCandidates[i].a
          ) {
            this.visibleNodes.push(visibleCandidates[i]);
          } else {
            if (
              ds(this.visibleNodes[this.visibleNodes.length - 1], viewNode) <
              ds(visibleCandidates[i], viewNode)
            ) {
              this.visibleNodes[this.visibleNodes.length - 1] =
                visibleCandidates[i];
            }
          }
          break;
        case Y:
          if (
            this.visibleNodes[this.visibleNodes.length - 1].b !=
            visibleCandidates[i].b
          ) {
            this.visibleNodes.push(visibleCandidates[i]);
          } else {
            if (
              ds(this.visibleNodes[this.visibleNodes.length - 1], viewNode) <
              ds(visibleCandidates[i], viewNode)
            ) {
              this.visibleNodes[this.visibleNodes.length - 1] =
                visibleCandidates[i];
            }
          }
          break;
        case Z:
          if (
            this.visibleNodes[this.visibleNodes.length - 1].c !=
            visibleCandidates[i].c
          ) {
            this.visibleNodes.push(visibleCandidates[i]);
          } else {
            if (
              ds(this.visibleNodes[this.visibleNodes.length - 1], viewNode) <
              ds(visibleCandidates[i], viewNode)
            ) {
              this.visibleNodes[this.visibleNodes.length - 1] =
                visibleCandidates[i];
            }
          }
          break;
      }
    }
    for (let i = 0; i < this.visibleNodes.length - 1; i++) {
      this.visibleNodes[i].next = this.visibleNodes[i + 1];
      this.visibleNodes[i + 1].prev = this.visibleNodes[i];
      this.visibleLinks.push(
        new Link(this.visibleNodes[i], this.visibleNodes[i + 1])
      );
    }
    this.visibleNodes[0].prev = undefined;
    this.visibleNodes[this.visibleNodes.length - 1].next = undefined;
  }

  getRandomPoint() {
    let index = Math.round(Math.random() * this.nodes.length);
    return this.nodes[index];
  }

  setBeacon(point) {
    point.beacon = true;
    this.beacon = point;
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

  render(canvas, x, y, axis) {
    let width = canvas.width;
    let height = canvas.height;
    let renderX = x * width;
    let renderY = y * height;
    let c = canvas.getContext("2d");
    c.beginPath();
    c.arc(renderX, renderY, 20, 0, Math.PI * 2, false);
    c.fillStyle = "#ffffff";
    c.strokeStyle = COLOURS[axis];
    c.lineWidth = 5;
    c.fill();
    c.stroke();
    c.closePath();
    c.fillStyle = COLOURS[axis];
    c.font = "20px Arial";
    c.fillText(this.a, renderX - 7, renderY + 7);
  }
}

class Link {
  constructor(sourceId, targetId) {
    this.source = sourceId;
    this.target = targetId;
  }

  render(canvas, sx, sy, tx, ty, axis) {
    let width = canvas.width;
    let height = canvas.height;
    let sourceX = sx * width;
    let sourceY = sy * height;
    let targetX = tx * width;
    let targetY = ty * height;
    let c = canvas.getContext("2d");
    c.beginPath();
    c.moveTo(sourceX, sourceY);
    c.lineTo(targetX, targetY);
    c.strokeStyle = COLOURS[axis];
    c.lineWidth = 5;
    c.stroke();
    c.closePath();
  }
}

class Game {
  constructor(n, canvas) {
    this.radius = 20;
    this.system = new PointSystem(n);
    this.system.setBeacon(this.system.getRandomPoint());
    this.loc = this.system.getRandomPoint();
    while (this.loc.beacon) {
      this.loc = this.system.getRandomPoint();
    }
    this.axis = X;
    this.system.getVisibleLinks(this.loc, this.axis, this.radius);

    this.viewRadius = 5;
    this.canvas = canvas;
    this.render(this.loc, this.axis, this.viewRadius);

    window.addEventListener("keypress", e => {
      console.log(e.key);
      e.preventDefault();
      switch (e.key) {
        case "w":
          this.changeDimUp();
          break;
        case "s":
          this.changeDimDown();
          break;
        case "a":
          this.traverseLeft();
          break;
        case "d":
          this.traverseRight();
          break;
      }
    });
  }

  traverseRight() {
    if (this.loc.next) {
      this.loc = this.loc.next;
      this.system.getVisibleLinks(this.loc, this.axis, this.radius);
      this.render(this.loc, this.axis, this.viewRadius);
    }
  }
  traverseLeft() {
    if (this.loc.prev) {
      this.loc = this.loc.prev;
      this.system.getVisibleLinks(this.loc, this.axis, this.radius);
      this.render(this.loc, this.axis, this.viewRadius);
    }
  }
  changeDimUp() {
    this.axis = (this.axis + 1) % 3;
    this.system.getVisibleLinks(this.loc, this.axis, this.radius);
    this.render(this.loc, this.axis, this.viewRadius);
  }
  changeDimDown() {
    this.axis = (this.axis + 3 - 1) % 3;
    this.system.getVisibleLinks(this.loc, this.axis, this.radius);
    this.render(this.loc, this.axis, this.viewRadius);
  }

  render(loc, axis, radius) {
    let c = this.canvas.getContext("2d");
    c.clearRect(0, 270 - 20 - 5, 960, 20 + 5 + 20 + 5);
    let pointsInView = [];
    let linksInView = [];
    let lower = 0;
    let upper = 0;
    switch (axis) {
      case X:
        lower = loc.a - radius;
        upper = loc.a + radius;
        pointsInView = this.system.visibleNodes.filter(
          node => node.a > lower && node.a < upper
        );
        linksInView = this.system.visibleLinks.filter(
          link =>
            pointsInView.indexOf(link.source) > -1 ||
            pointsInView.indexOf(link.target) > -1
        );
        linksInView.forEach(link => {
          link.render(
            this.canvas,
            (link.source.a - lower) / (upper - lower),
            0.5,
            (link.target.a - lower) / (upper - lower),
            0.5,
            axis
          );
        });
        pointsInView.forEach(point => {
          point.render(
            this.canvas,
            (point.a - lower) / (upper - lower),
            0.5,
            axis
          );
        });
        break;
      case Y:
        lower = loc.b - radius;
        upper = loc.b + radius;
        pointsInView = this.system.visibleNodes.filter(
          node => node.b > lower && node.b < upper
        );
        linksInView = this.system.visibleLinks.filter(
          link =>
            pointsInView.indexOf(link.source) > -1 ||
            pointsInView.indexOf(link.target) > -1
        );
        linksInView.forEach(link => {
          link.render(
            this.canvas,
            (link.source.b - lower) / (upper - lower),
            0.5,
            (link.target.b - lower) / (upper - lower),
            0.5,
            axis
          );
        });
        pointsInView.forEach(point => {
          point.render(
            this.canvas,
            (point.b - lower) / (upper - lower),
            0.5,
            axis
          );
        });
        break;
      case Z:
        lower = loc.c - radius;
        upper = loc.c + radius;
        pointsInView = this.system.visibleNodes.filter(
          node => node.c > lower && node.c < upper
        );
        linksInView = this.system.visibleLinks.filter(
          link =>
            pointsInView.indexOf(link.source) > -1 ||
            pointsInView.indexOf(link.target) > -1
        );
        linksInView.forEach(link => {
          link.render(
            this.canvas,
            (link.source.c - lower) / (upper - lower),
            0.5,
            (link.target.c - lower) / (upper - lower),
            0.5,
            axis
          );
        });
        pointsInView.forEach(point => {
          point.render(
            this.canvas,
            (point.c - lower) / (upper - lower),
            0.5,
            axis
          );
        });
        break;
    }
  }
}

let game = new Game(200, document.getElementById("canvas"));
