export class Vector {
  constructor(public x: number, public y: number) {}

  add(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector): Vector {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  scale(s: number): Vector {
    return new Vector(this.x * s, this.y * s);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector {
    const m = this.mag();
    if (m === 0) return new Vector(0, 0);
    return new Vector(this.x / m, this.y / m);
  }

  limit(max: number): Vector {
    if (this.magSq() > max * max) {
      return this.normalize().scale(max);
    }
    return new Vector(this.x, this.y);
  }

  heading(): number {
    return Math.atan2(this.y, this.x);
  }

  dist(v: Vector): number {
    return this.sub(v).mag();
  }

  lerp(v: Vector, t: number): Vector {
    return new Vector(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
    );
  }

  static random(): Vector {
    const angle = Math.random() * Math.PI * 2;
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  static fromAngle(angle: number): Vector {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  static zero(): Vector {
    return new Vector(0, 0);
  }
}
