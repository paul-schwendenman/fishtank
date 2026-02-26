export class Ripple {
  x: number;
  y: number;
  radius: number = 0;
  maxRadius: number;
  age: number = 0;
  lifetime: number;
  strength: number;

  constructor(x: number, y: number, maxRadius: number, lifetime: number, strength: number) {
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this.lifetime = lifetime;
    this.strength = strength;
  }

  get alive(): boolean {
    return this.age < this.lifetime;
  }

  get opacity(): number {
    return (1 - this.age / this.lifetime) * this.strength;
  }

  get lineWidth(): number {
    return Math.max(0.5, 2 * (1 - this.age / this.lifetime));
  }

  update(dt: number): void {
    this.age += dt;
    this.radius = (this.age / this.lifetime) * this.maxRadius;
  }
}
