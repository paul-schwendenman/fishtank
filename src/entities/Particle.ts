import { randomRange } from '../utils/math';

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;

  constructor(boundsLeft: number, boundsRight: number, boundsTop: number, boundsBottom: number) {
    this.x = randomRange(boundsLeft, boundsRight);
    this.y = randomRange(boundsTop, boundsBottom);
    this.vx = randomRange(-3, 3);
    this.vy = randomRange(-2, 2);
    this.size = randomRange(1, 2);
    this.opacity = randomRange(0.15, 0.35);
  }

  update(dt: number, boundsLeft: number, boundsRight: number, boundsTop: number, boundsBottom: number): void {
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
  }
}
