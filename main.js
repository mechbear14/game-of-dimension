class PointSystem {
  constructor(n) {
    this.points = [];
    for (let i = 0; i < n; i++) {
      let newPoint = new Point(
        i,
        Math.round(Math.random() * 100),
        Math.round(Math.random() * 100),
        Math.round(Math.random() * 100)
      );
      this.points.push(newPoint);
    }

    this.a = this.points.slice();
    this.a.sort((pa, pb) => {
      return pa.a - pb.a;
    });
    this.b = this.points.slice();
    this.b.sort((pa, pb) => {
      return pa.b - pb.b;
    });
    this.c = this.points.slice();
    this.c.sort((pa, pb) => {
      return pa.c - pb.c;
    });
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
console.log(system.points);
console.log(system.a);
console.log(system.b);
console.log(system.c);
