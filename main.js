class PointSystem {
  constructor(n) {
    this.nodes = [];
    this.links = [];
    for (let i = 0; i < n; i++) {
      let newPoint = new Point(
        i,
        this.randIntBetween(0, 200),
        this.randIntBetween(0, 200),
        this.randIntBetween(0, 200)
      );
      this.nodes.push(newPoint);
    }

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
  }

  randIntBetween(a, b) {
    let coef = Math.random();
    return Math.round(a * coef + b * (1 - coef));
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

const WIDTH = 1920;
const HEIGHT = 1080;

system = new PointSystem(85);
console.log(system.nodes);
simulation = d3
  .forceSimulation(system.nodes)
  .force("charge", d3.forceManyBody().strength(-270))
  .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
  .force(
    "link",
    d3
      .forceLink()
      .links(system.links)
      .distance(10)
  )
  .on("tick", render);

function render() {
  let l = d3
    .select("svg")
    .selectAll("line")
    .data(system.links);
  l.enter()
    .append("line")
    .merge(l)
    .attr("x1", d => d.source.x)
    .attr("x2", d => d.target.x)
    .attr("y1", d => d.source.y)
    .attr("y2", d => d.target.y)
    .attr("stroke", d => d.stroke);

  l.exit().remove();

  let n = d3
    .select("svg")
    .selectAll("circle")
    .data(system.nodes);
  n.enter()
    .append("circle")
    .merge(n)
    .attr("r", 5)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  n.exit().remove();
}
