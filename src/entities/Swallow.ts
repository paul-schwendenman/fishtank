import { randomRange } from '../utils/math';

export type SwallowState = 'inactive' | 'flying';

export class Swallow {
  x: number = 0;
  y: number = 0;
  state: SwallowState = 'inactive';
  cooldown: number;
  speed: number = 0;
  direction: number = 1; // 1 = left-to-right, -1 = right-to-left
  wingPhase: number = 0;
  sinePhase: number = 0;
  scale: number = 1;

  private screenWidth: number;
  private screenHeight: number;

  constructor(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
    this.cooldown = randomRange(15, 40);
  }

  resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  private launch(): void {
    this.state = 'flying';
    this.direction = Math.random() < 0.5 ? 1 : -1;
    this.x = this.direction === 1 ? -40 : this.screenWidth + 40;
    this.y = randomRange(this.screenHeight * 0.05, this.screenHeight * 0.3);
    this.speed = randomRange(120, 200);
    this.wingPhase = 0;
    this.sinePhase = randomRange(0, Math.PI * 2);
    this.scale = randomRange(0.7, 1.1);
  }

  update(dt: number): void {
    if (this.state === 'inactive') {
      this.cooldown -= dt;
      if (this.cooldown <= 0) {
        this.launch();
      }
      return;
    }

    // Flying — fast horizontal with sine-wave vertical
    this.x += this.speed * this.direction * dt;
    this.sinePhase += dt * 2;
    this.y += Math.sin(this.sinePhase) * 30 * dt;

    // Wing flap
    this.wingPhase += dt * 15;

    // Check if offscreen
    if (
      (this.direction === 1 && this.x > this.screenWidth + 60) ||
      (this.direction === -1 && this.x < -60)
    ) {
      this.state = 'inactive';
      this.cooldown = randomRange(15, 40);
    }
  }
}
