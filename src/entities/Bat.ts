import { randomRange } from '../utils/math';

export type BatState = 'inactive' | 'flying';

export class Bat {
  x: number = 0;
  y: number = 0;
  state: BatState = 'inactive';
  cooldown: number;
  wingPhase: number = 0;
  scale: number = 1;

  private vx: number = 0;
  private vy: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private targetScale: number = 1;
  private lifetime: number = 0;
  private maxLifetime: number = 0;
  private turnTimer: number = 0;
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
    this.state = 'flying';
    // Enter from a random edge
    const edge = Math.random();
    if (edge < 0.25) {
      this.x = -20;
      this.y = randomRange(this.screenHeight * 0.05, this.screenHeight * 0.35);
      this.vx = randomRange(40, 80);
      this.vy = randomRange(-20, 20);
    } else if (edge < 0.5) {
      this.x = this.screenWidth + 20;
      this.y = randomRange(this.screenHeight * 0.05, this.screenHeight * 0.35);
      this.vx = randomRange(-80, -40);
      this.vy = randomRange(-20, 20);
    } else {
      this.x = randomRange(this.screenWidth * 0.1, this.screenWidth * 0.9);
      this.y = -20;
      this.vx = randomRange(-40, 40);
      this.vy = randomRange(20, 50);
    }
    this.wingPhase = randomRange(0, Math.PI * 2);
    this.scale = randomRange(0.5, 0.8);
    this.targetScale = this.scale;
    this.lifetime = 0;
    this.maxLifetime = randomRange(8, 20);
    this.turnTimer = randomRange(0.5, 1.5);
    this.pickTarget();
  }

  private pickTarget(): void {
    this.targetX = randomRange(this.screenWidth * 0.05, this.screenWidth * 0.95);
    this.targetY = randomRange(this.screenHeight * 0.03, this.screenHeight * 0.4);
    // Simulate depth change — coming closer or going further
    this.targetScale = randomRange(0.4, 1.0);
    this.turnTimer = randomRange(1.0, 3.0);
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

    // Steer toward target with erratic jitter
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Accelerate toward target
    const ax = (dx / Math.max(dist, 1)) * 120;
    const ay = (dy / Math.max(dist, 1)) * 120;
    this.vx += (ax - this.vx * 2) * dt;
    this.vy += (ay - this.vy * 2) * dt;

    // Erratic jitter overlaid on flight
    this.vx += Math.sin(this.wingPhase * 0.7) * 60 * dt;
    this.vy += Math.cos(this.wingPhase * 0.5) * 40 * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Smooth depth/scale transitions
    this.scale += (this.targetScale - this.scale) * 1.5 * dt;

    // Pick new target periodically
    this.turnTimer -= dt;
    if (this.turnTimer <= 0 || dist < 30) {
      this.pickTarget();
    }

    // Exit after lifetime — fly off an edge
    if (this.lifetime > this.maxLifetime) {
      // Once past lifetime, stop picking new targets — just fly out
      if (this.x < -40 || this.x > this.screenWidth + 40 ||
          this.y < -40 || this.y > this.screenHeight + 40) {
        this.state = 'inactive';
        this.cooldown = randomRange(8, 25);
      }
      // Aim off the nearest edge
      const edgeX = this.x < this.screenWidth / 2 ? -60 : this.screenWidth + 60;
      this.targetX = edgeX;
      this.targetY = this.y + randomRange(-30, 30);
    }
  }
}
