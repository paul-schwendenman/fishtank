import { randomRange } from '../utils/math';

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  age: number;
  lifetime: number;
  baseSize: number;
  colorR: number;
  colorG: number;
  colorB: number;

  constructor(boundsLeft: number, boundsRight: number, boundsTop: number, boundsBottom: number) {
    this.x = randomRange(boundsLeft, boundsRight);
    this.y = randomRange(boundsTop, boundsBottom);
    this.vx = randomRange(-3, 3);
    this.vy = randomRange(-2, 2);
    this.baseSize = randomRange(1, 2);
    this.size = this.baseSize;
    this.opacity = 0;
    this.age = randomRange(0, 15); // stagger initial ages so they don't all fade in at once
    this.lifetime = randomRange(15, 40);
    this.colorR = 200 + Math.round(randomRange(-20, 20));
    this.colorG = 220 + Math.round(randomRange(-20, 20));
    this.colorB = 240 + Math.round(randomRange(-20, 20));
  }

  update(dt: number, boundsLeft: number, boundsRight: number, boundsTop: number, boundsBottom: number): void {
    this.age += dt;

    // Respawn in-place when lifetime exceeded
    if (this.age >= this.lifetime) {
      this.age = 0;
      this.lifetime = randomRange(15, 40);
      this.baseSize = randomRange(1, 2);
      this.colorR = 200 + Math.round(randomRange(-20, 20));
      this.colorG = 220 + Math.round(randomRange(-20, 20));
      this.colorB = 240 + Math.round(randomRange(-20, 20));
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Wrap around
    if (this.x < boundsLeft) this.x = boundsRight;
    if (this.x > boundsRight) this.x = boundsLeft;
    if (this.y < boundsTop) this.y = boundsBottom;
    if (this.y > boundsBottom) this.y = boundsTop;

    // Slight random drift changes
    this.vx += randomRange(-0.5, 0.5) * dt;
    this.vy += randomRange(-0.5, 0.5) * dt;
    this.vx = Math.max(-3, Math.min(3, this.vx));
    this.vy = Math.max(-2, Math.min(2, this.vy));

    // Lifetime-aware opacity: fade in over 2s, steady, fade out over last 3s
    const fadeInEnd = 2;
    const fadeOutStart = this.lifetime - 3;
    let baseOpacity: number;
    if (this.age < fadeInEnd) {
      baseOpacity = (this.age / fadeInEnd) * 0.35;
    } else if (this.age > fadeOutStart) {
      baseOpacity = ((this.lifetime - this.age) / 3) * 0.35;
    } else {
      baseOpacity = 0.35;
    }
    this.opacity = Math.max(0, baseOpacity);

    // Size pulses subtly
    this.size = this.baseSize * (0.9 + 0.1 * Math.sin(this.age * 0.5));
  }
}
