import { randomRange } from '../utils/math';

export type OwlState = 'inactive' | 'gliding';

export class Owl {
  x: number = 0;
  y: number = 0;
  state: OwlState = 'inactive';
  cooldown: number;
  speed: number = 0;
  direction: number = 1; // 1 = left-to-right, -1 = right-to-left
  wingAngle: number = 0;  // current wing deflection (0 = flat/gliding, positive = up)
  scale: number = 1;

  // Flap-glide cycle
  private cycleTimer: number = 0;
  private flapping: boolean = false;
  private flapPhase: number = 0;

  private screenWidth: number;
  private screenHeight: number;

  constructor(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
    this.cooldown = randomRange(30, 60);
  }

  resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  private launch(): void {
    this.state = 'gliding';
    this.direction = Math.random() < 0.5 ? 1 : -1;
    this.x = this.direction === 1 ? -60 : this.screenWidth + 60;
    this.y = randomRange(this.screenHeight * 0.05, this.screenHeight * 0.25);
    this.speed = randomRange(40, 65);
    this.wingAngle = 0;
    this.flapPhase = 0;
    this.flapping = false;
    this.cycleTimer = randomRange(0.5, 1.5);
    this.scale = randomRange(0.8, 1.2);
  }

  update(dt: number): void {
    if (this.state === 'inactive') {
      this.cooldown -= dt;
      if (this.cooldown <= 0) {
        this.launch();
      }
      return;
    }

    // Gliding
    this.x += this.speed * this.direction * dt;

    // Flap-flap-gliiiiide cycle
    this.cycleTimer -= dt;
    if (this.cycleTimer <= 0) {
      this.flapping = !this.flapping;
      if (this.flapping) {
        // Single slow flap (~0.8s for one full beat)
        this.cycleTimer = randomRange(0.7, 0.9);
        this.flapPhase = 0;
      } else {
        // Shorter glide between flaps (1–2.5s)
        this.cycleTimer = randomRange(1, 2.5);
      }
    }

    if (this.flapping) {
      // Slow deliberate wing beat
      this.flapPhase += dt * 7;
      const raw = Math.sin(this.flapPhase);
      // Bias downward: downstroke (negative) goes further than upstroke (positive)
      this.wingAngle = raw > 0 ? raw * 0.25 : raw * 0.4;
    } else {
      // Glide: wings held nearly flat, very slight upward angle
      this.wingAngle += (0.04 - this.wingAngle) * 2.5 * dt;
    }

    // Gentle vertical bob
    this.y += Math.sin(this.x * 0.02) * 4 * dt;

    // Check if offscreen
    if (
      (this.direction === 1 && this.x > this.screenWidth + 80) ||
      (this.direction === -1 && this.x < -80)
    ) {
      this.state = 'inactive';
      this.cooldown = randomRange(30, 60);
    }
  }
}
