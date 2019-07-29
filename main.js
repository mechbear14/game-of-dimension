const X = 0;
const Y = 1;
const Z = 2;
const COLOURS = ["#800080", "#ff8000", "#008000"];
// TODO: Refactor so that functions are property name and dimension count independent
// TODO: Name: "axis" or "dimension"?

Array.prototype.last = function() {
  return this[this.length - 1];
};

function ds(p1, p2) {
  let acc = 0;
  if (p1.attr.length != p2.attr.length) {
    throw new Error("Number of dimensions must be same");
  } else {
    for (let a = 0; a < p1.attr.length; a++) {
      acc += (p1.attr[a] - p2.attr[a]) * (p1.attr[a] - p2.attr[a]);
    }
  }
  return Math.sqrt(acc);
}

function dsAxis(p1, p2, axis) {
  acc = 0;
  if (p1.attr.length != p2.attr.length) {
    throw new Error("Number of dimensions must be same");
  } else {
    for (let a = 0; a < p1.attr.length; a++) {
      if (a == axis) continue;
      else acc += (p1.attr[a] - p2.attr[a]) * (p1.attr[a] - p2.attr[a]);
    }
    return Math.sqrt(acc);
  }
}

function randIntBetween(a, b) {
  let coef = Math.random();
  return Math.round(a * coef + b * (1 - coef));
}

function lerpRatio(a, min, max) {
  return (a - min) / (max - min);
}

class PointSystem {
  constructor(n) {
    this.nodes = [];
    this.links = [];
    this.routes = [];
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
    for (let i = 0; i < this.nodes[0].attr.length; i++) {
      let arr = this.nodes.slice();
      this.routes.push(arr.sort((a, b) => a.attr[i] - b.attr[i]));
    }
  }

  getVisibleLinks(viewNode, dimension, width) {
    this.visibleNodes = [];
    this.visibleLinks = [];

    let visibleCandidates = this.routes[dimension].filter(
      node => dsAxis(viewNode, node, dimension) < width
    );
    this.visibleNodes.push(visibleCandidates[0]);
    for (let i = 1; i < visibleCandidates.length; i++) {
      if (
        this.visibleNodes.last().attr[dimension] !=
        visibleCandidates[i].attr[dimension]
      ) {
        this.visibleNodes.push(visibleCandidates[i]);
      } else {
        if (
          ds(this.visibleNodes.last(), viewNode) >=
          ds(visibleCandidates[i], viewNode)
        ) {
          this.visibleNodes.pop();
          this.visibleNodes.push(visibleCandidates[i]);
        }
      }
    }
    for (let i = 0; i < this.visibleNodes.length - 1; i++) {
      this.visibleLinks.push(
        new Link(this.visibleNodes[i], this.visibleNodes[i + 1])
      );
    }
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
    this.id = id;
    this.attr = [a, b, c];
    this.beacon = false;
  }

  render(canvas, x, y, axis) {
    let width = canvas.width;
    let height = canvas.height;
    let renderX = x * width;
    let renderY = y * height;
    let c = canvas.getContext("2d");
    c.beginPath();
    c.arc(renderX, renderY, 20, 0, Math.PI * 2, false);
    c.strokeStyle = COLOURS[axis];
    c.lineWidth = 20;
    c.filter = "blur(10px)";
    c.stroke();
    c.strokeStyle = "#ffffff";
    c.lineWidth = 8;
    c.filter = "blur(0px)";
    c.stroke();
    c.closePath();
    c.fillStyle = COLOURS[axis];
    c.font = "20px Arial";
    c.fillText(this.attr[axis], renderX - 7, renderY + 7);
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
    c.lineWidth = 20;
    c.filter = "blur(10px)";
    c.stroke();
    c.moveTo(sourceX, sourceY);
    c.lineTo(targetX, targetY);
    c.strokeStyle = "#ffffff";
    c.lineWidth = 8;
    c.filter = "blur(0px)";
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

    this.viewRadius = 4.5;
    this.canvas = canvas;
    this.canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
    this.render(this.loc, this.axis, this.viewRadius);

    window.addEventListener("keypress", e => {
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
    let index = this.system.visibleNodes.indexOf(this.loc);
    if (index < this.system.visibleNodes.length - 1) {
      this.loc = this.system.visibleNodes[index + 1];
      this.render(this.loc, this.axis, this.viewRadius);
    }
  }
  traverseLeft() {
    let index = this.system.visibleNodes.indexOf(this.loc);
    if (index > 0) {
      this.loc = this.system.visibleNodes[index - 1];
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
    let width = canvas.width;
    let height = canvas.height;
    let c = this.canvas.getContext("2d");
    c.fillStyle = "#000000";
    c.fillRect(0, 200, 960, 140);
    let pointsInView = [];
    let linksInView = [];
    let lower = loc.attr[axis] - radius;
    let upper = loc.attr[axis] + radius;
    pointsInView = this.system.visibleNodes.filter(
      node => node.attr[axis] > lower && node.attr[axis] < upper
    );
    linksInView = this.system.visibleLinks.filter(
      link =>
        pointsInView.indexOf(link.source) > -1 ||
        pointsInView.indexOf(link.target) > -1
    );
    linksInView.forEach(link => {
      let sr = lerpRatio(link.source.attr[axis], lower, upper);
      let tr = lerpRatio(link.target.attr[axis], lower, upper);
      link.render(
        this.canvas,
        sr + 20 / width,
        0.5,
        tr - 20 / width,
        0.5,
        axis
      );
    });
    pointsInView.forEach(point => {
      let r = lerpRatio(point.attr[axis], lower, upper);
      point.render(this.canvas, r, 0.5, axis);
    });
  }
}

let game = new Game(200, document.getElementById("canvas"));
