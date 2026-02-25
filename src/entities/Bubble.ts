import { randomRange } from '../utils/math';

export class Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobblePhase: number;
  wobbleAmplitude: number;
  alive: boolean = true;

  constructor(x: number, y: number) {
    this.x = x + randomRange(-8, 8);
    this.y = y;
    this.radius = randomRange(1.5, 5);
    this.speed = randomRange(30, 60);
    this.wobblePhase = randomRange(0, Math.PI * 2);
    this.wobbleAmplitude = randomRange(3, 6);
  }

  update(dt: number, topBound: number): void {
    this.y -= this.speed * dt;
    this.speed += 5 * dt; // slight acceleration
    this.wobblePhase += 3 * dt;
    this.x += Math.sin(this.wobblePhase) * this.wobbleAmplitude * dt;

    if (this.y < topBound - 10) {
      this.alive = false;
    }
  }

  getOpacity(topBound: number, fadeZone: number): number {
    if (this.y < topBound + fadeZone) {
      return Math.max(0, (this.y - topBound) / fadeZone);
    }
    return 0.6;
  }
}
