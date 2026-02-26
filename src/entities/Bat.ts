import { randomRange } from '../utils/math';

export type BatState = 'inactive' | 'fluttering' | 'darting';

export class Bat {
  x: number = 0;
  y: number = 0;
  state: BatState = 'inactive';
  cooldown: number;
  wingPhase: number = 0;
  scale: number = 1;

  private targetX: number = 0;
  private targetY: number = 0;
  private lifetime: number = 0;
  private maxLifetime: number = 0;
  private dartTimer: number = 0;
  private screenWidth: number;
  private screenHeight: number;

  constructor(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
    this.cooldown = randomRange(5, 20);
  }

  resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  private spawn(): void {
    this.state = 'fluttering';
    this.x = randomRange(this.screenWidth * 0.1, this.screenWidth * 0.9);
    this.y = randomRange(this.screenHeight * 0.05, this.screenHeight * 0.4);
    this.targetX = this.x;
    this.targetY = this.y;
    this.wingPhase = randomRange(0, Math.PI * 2);
    this.scale = randomRange(0.5, 0.9);
    this.lifetime = 0;
    this.maxLifetime = randomRange(15, 30);
    this.dartTimer = randomRange(1, 3);
  }

  private pickDartTarget(): void {
    this.state = 'darting';
    this.targetX = this.x + randomRange(-100, 100);
    this.targetY = this.y + randomRange(-60, 60);
    // Clamp to visible area
    this.targetX = Math.max(20, Math.min(this.screenWidth - 20, this.targetX));
    this.targetY = Math.max(this.screenHeight * 0.03, Math.min(this.screenHeight * 0.45, this.targetY));
  }

  update(dt: number): void {
    if (this.state === 'inactive') {
      this.cooldown -= dt;
      if (this.cooldown <= 0) {
        this.spawn();
      }
      return;
    }

    this.lifetime += dt;
    // Rapid wing flap
    this.wingPhase += dt * 18;

    if (this.state === 'fluttering') {
      // Jittery hover
      this.x += Math.sin(this.wingPhase * 0.8) * 20 * dt;
      this.y += Math.cos(this.wingPhase * 0.6) * 12 * dt;

      this.dartTimer -= dt;
      if (this.dartTimer <= 0) {
        this.pickDartTarget();
      }
    } else if (this.state === 'darting') {
      // Quick lerp to target
      this.x += (this.targetX - this.x) * 4 * dt;
      this.y += (this.targetY - this.y) * 4 * dt;

      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      if (dx * dx + dy * dy < 25) {
        this.state = 'fluttering';
        this.dartTimer = randomRange(1.5, 4);
      }
    }

    // Exit after lifetime
    if (this.lifetime > this.maxLifetime) {
      this.state = 'inactive';
      this.cooldown = randomRange(8, 25);
    }
  }
}
