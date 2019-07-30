const X = 0;
const Y = 1;
const Z = 2;
const COLOURS = ["#800080", "#ff8000", "#008000"];

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

function getLerp(min, max, r) {
  return min + r * (max - min);
}

function getLerpPoint(p1, p2, r) {
  let attrs = [];
  for (let a = 0; a < p1.attr.length; a++) {
    attrs.push(getLerp(p1.attr[a], p2.attr[a], r));
  }
  return new Point(2000, ...attrs);
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
    this.flatAttr = [0, 0];
    this.beacon = false;
  }

  setFlatAttr(x, y) {
    this.flatAttr[0] = x;
    this.flatAttr[1] = y;
  }

  render(canvas, x, y, axis) {
    let width = canvas.width;
    let height = canvas.height;
    let renderX = x * width;
    let renderY = y * height;
    let c = canvas.getContext("2d");
    c.beginPath();
    c.arc(renderX, renderY, 20, 0, Math.PI * 2, false);
    c.fillStyle = "#000000";
    c.fill();
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
  constructor(sourceId, targetId, axis) {
    this.source = sourceId;
    this.target = targetId;
    this.axis = axis;
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
    //this.canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
    //this.render(this.loc, this.axis, this.viewRadius);

    window.addEventListener("keypress", this.onKeyPress);
  }

  onKeyPress(e) {
    e.preventDefault();
    switch (e.key) {
      case "w":
        game.changeDimUp();
        break;
      case "s":
        game.changeDimDown();
        break;
      case "a":
        game.traverseLeft();
        break;
      case "d":
        game.traverseRight();
        break;
    }
  }

  traverseRight() {
    let index = this.system.visibleNodes.indexOf(this.loc);
    if (index < this.system.visibleNodes.length - 1) {
      this.glideTo(this.system.visibleNodes[index + 1]);
    }
  }
  traverseLeft() {
    let index = this.system.visibleNodes.indexOf(this.loc);
    if (index > 0) {
      this.glideTo(this.system.visibleNodes[index - 1]);
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

  glideTo(loc) {
    window.removeEventListener("keypress", this.onKeyPress);
    for (let tn = 1; tn < 11; tn++) {
      let t = 50 * tn;
      let r = 0.1 * tn;
      let p = getLerpPoint(this.loc, loc, r);
      window.setTimeout(() => {
        this.render(p, this.axis, this.viewRadius);
      }, t);
    }
    window.setTimeout(
      window.addEventListener("keypress", this.onKeyPress),
      500
    );
    this.loc = loc;
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
    if (linksInView.length == 0) {
      new Link(0, 0).render(this.canvas, 0, 0.5, 1, 0.5, axis);
    } else {
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
    }
    pointsInView.forEach(point => {
      let r = lerpRatio(point.attr[axis], lower, upper);
      point.render(this.canvas, r, 0.5, axis);
    });
  }
}

// let game = new Game(200, document.getElementById("canvas"));
// TODO: Move generating points outside point system
let system = new PointSystem(200);
let simNodes = system.nodes.map(() => {
  return {};
});
let simLinks = [];
system.routes.forEach((route, index) => {
  for (let r = 0; r < route.length - 1; r++) {
    simLinks.push({
      source: route[r].id,
      target: route[r + 1].id,
      route: index
    });
  }
});
console.log(simNodes);
console.log(simLinks);

const WIDTH = 3000;
const HEIGHT = 3000;
const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;
let loc = system.getRandomPoint();
let axis = X;
let visibleLinks = [];
let canvas = document.getElementById("canvas");
let c = canvas.getContext("2d");
c.fillStyle = "#000000";
c.fillRect(0, 0, canvas.width, canvas.height);

let simulation = d3
  .forceSimulation(simNodes)
  .force("charge", d3.forceManyBody().strength(-1000))
  .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
  .force("link", d3.forceLink().links(simLinks))
  .on("tick", update)
  .on("end", end);

function update() {
  let points = d3
    .select("svg")
    .selectAll("circle")
    .data(simNodes);
  points
    .enter()
    .append("circle")
    .merge(points)
    .attr("r", 10)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("fill", "#000000");
  points.exit().remove();

  let links = d3
    .select("svg")
    .selectAll("line")
    .data(simLinks);
  links
    .enter()
    .append("line")
    .merge(links)
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .attr("stroke", d => {
      switch (d.route) {
        case 0:
          return "#800080";
        case 1:
          return "#ff8000";
        case 2:
          return "#008000";
        default:
          throw new Error("Invalid route");
      }
    });
  links.exit().remove();
}

function end() {
  for (let node of simNodes) {
    system.nodes[node.index].setFlatAttr(node.x, node.y);
  }
  for (let link of simLinks) {
    system.links[link.index] = new Link(
      link.source.index,
      link.target.index,
      link.route
    );
  }
  let body = document.getElementsByTagName("body")[0];
  body.removeChild(document.querySelector("svg"));
  getVisibleLinks(loc, axis);
  renderRegion(loc.flatAttr[0], loc.flatAttr[1], VIEW_WIDTH, VIEW_HEIGHT);
}

function getVisibleLinks(viewNode, dimension) {
  visibleLinks = system.links.filter(
    link =>
      link.axis === dimension ||
      link.source === viewNode.id ||
      link.target === viewNode.id
  );
}

function renderRegion(x, y, w, h) {
  let bBox = [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
  let pointsInView = system.nodes.filter(
    node =>
      node.flatAttr[0] > bBox[0] &&
      node.flatAttr[0] < bBox[2] &&
      node.flatAttr[1] > bBox[1] &&
      node.flatAttr[1] < bBox[3]
  );
  let linksInView = visibleLinks.filter(link => {
    let s = system.nodes[link.source].flatAttr;
    let t = system.nodes[link.target].flatAttr;
    return (
      (s[0] > bBox[0] && s[0] < bBox[2] && s[1] > bBox[1] && s[1] < bBox[3]) ||
      (t[0] > bBox[0] && t[0] < bBox[2] && t[1] > bBox[1] && t[1] < bBox[3])
    );
  });
  for (let link of linksInView) {
    let s = system.nodes[link.source].flatAttr;
    let t = system.nodes[link.target].flatAttr;
    let x1 = lerpRatio(s[0], bBox[0], bBox[2]);
    let y1 = lerpRatio(s[1], bBox[1], bBox[3]);
    let x2 = lerpRatio(t[0], bBox[0], bBox[2]);
    let y2 = lerpRatio(t[1], bBox[1], bBox[3]);
    link.render(canvas, x1, y1, x2, y2, link.axis);
  }
  for (let point of pointsInView) {
    let x = lerpRatio(point.flatAttr[0], bBox[0], bBox[2]);
    let y = lerpRatio(point.flatAttr[1], bBox[1], bBox[3]);
    point.render(canvas, x, y, axis);
  }
}
