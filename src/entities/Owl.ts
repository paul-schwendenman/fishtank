import { randomRange } from '../utils/math';

export type OwlState = 'inactive' | 'gliding';

export class Owl {
  x: number = 0;
  y: number = 0;
  state: OwlState = 'inactive';
  cooldown: number;
  speed: number = 0;
  direction: number = 1; // 1 = left-to-right, -1 = right-to-left
  wingPhase: number = 0;
  scale: number = 1;

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
    this.wingPhase = 0;
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
    // Slow wing flap
    this.wingPhase += dt * 2.5;
    // Gentle vertical bob
    this.y += Math.sin(this.wingPhase * 0.7) * 8 * dt;

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
