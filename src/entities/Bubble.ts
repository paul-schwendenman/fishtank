import { randomRange } from '../utils/math';

export class Bubble {
  x: number;
  y: number;
  radius: number;
  initialRadius: number;
  startY: number;
  speed: number;
  wobblePhase: number;
  wobbleAmplitude: number;
  alive: boolean = true;
  hasPopped: boolean = false;

  constructor(x: number, y: number) {
    this.x = x + randomRange(-8, 8);
    this.y = y;
    this.startY = y;
    this.radius = randomRange(1.5, 5);
    this.initialRadius = this.radius;
    this.speed = randomRange(30, 60);
    this.wobblePhase = randomRange(0, Math.PI * 2);
    this.wobbleAmplitude = randomRange(3, 6);
  }

  update(dt: number, topBound: number): void {
    this.y -= this.speed * dt;
    this.speed += 5 * dt; // slight acceleration
    this.wobblePhase += 3 * dt;
    this.x += Math.sin(this.wobblePhase) * this.wobbleAmplitude * dt;

    // Grow radius as it rises, cap at 1.4x initial
    this.radius = Math.min(this.initialRadius * 1.4, this.radius + 0.3 * dt);

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

  isInFadeZone(topBound: number, fadeZone: number): boolean {
    return this.y < topBound + fadeZone && !this.hasPopped;
  }
}
