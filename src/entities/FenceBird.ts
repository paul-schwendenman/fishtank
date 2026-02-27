import { randomRange } from '../utils/math';

export type FenceBirdState = 'perching' | 'hopping' | 'flying';

export class FenceBird {
  x: number;
  y: number;
  state: FenceBirdState = 'perching';
  postIndex: number;
  facingRight: boolean;

  // Perching
  perchTimer: number;
  headTurn: number = 0;
  tailBobPhase: number = 0;

  // Hopping
  hopStart: number = 0;
  hopEnd: number = 0;
  hopProgress: number = 0;
  hopDuration: number = 0.3;

  // Flying
  flyStartX: number = 0;
  flyStartY: number = 0;
  flyEndX: number = 0;
  flyEndY: number = 0;
  flyProgress: number = 0;
  flyDuration: number = 0.8;
  wingPhase: number = 0;

  spawnOpacity: number = 1;

  constructor(x: number, y: number, postIndex: number) {
    this.x = x;
    this.y = y;
    this.postIndex = postIndex;
    this.facingRight = Math.random() < 0.5;
    this.perchTimer = randomRange(5, 15);
  }

  update(dt: number, postPositions: { x: number; y: number }[]): void {
    this.tailBobPhase += dt * 3;

    switch (this.state) {
      case 'perching':
        this.perchTimer -= dt;

        // Occasional head turn
        if (Math.random() < 0.5 * dt) {
          this.headTurn = randomRange(-0.3, 0.3);
        }

        if (this.perchTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.3 && postPositions.length > 1) {
            // Fly to a different post
            this.startFly(postPositions);
          } else if (roll < 0.6) {
            // Hop along rail
            this.startHop();
          } else {
            // Stay perching longer
            this.perchTimer = randomRange(5, 15);
            this.facingRight = !this.facingRight;
          }
        }
        break;

      case 'hopping':
        this.hopProgress += dt / this.hopDuration;
        if (this.hopProgress >= 1) {
          this.x = this.hopEnd;
          this.state = 'perching';
          this.perchTimer = randomRange(3, 10);
        } else {
          const t = this.hopProgress;
          this.x = this.hopStart + (this.hopEnd - this.hopStart) * t;
          // Arc upward
          this.y = this.y; // y stays at perch level
        }
        break;

      case 'flying':
        this.flyProgress += dt / this.flyDuration;
        this.wingPhase += dt * 20;
        if (this.flyProgress >= 1) {
          this.x = this.flyEndX;
          this.y = this.flyEndY;
          this.state = 'perching';
          this.perchTimer = randomRange(5, 15);
        } else {
          const t = this.flyProgress;
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          this.x = this.flyStartX + (this.flyEndX - this.flyStartX) * eased;
          this.y = this.flyStartY + (this.flyEndY - this.flyStartY) * eased;
          // Arc upward
          this.y -= Math.sin(t * Math.PI) * 40;
          this.facingRight = this.flyEndX > this.flyStartX;
        }
        break;
    }
  }

  private startHop(): void {
    this.state = 'hopping';
    this.hopStart = this.x;
    const dir = this.facingRight ? 1 : -1;
    this.hopEnd = this.x + dir * randomRange(15, 30);
    this.hopProgress = 0;
    this.hopDuration = randomRange(0.2, 0.4);
  }

  private startFly(postPositions: { x: number; y: number }[]): void {
    // Pick a different post
    let targetIdx = this.postIndex;
    let attempts = 0;
    while (targetIdx === this.postIndex && attempts < 10) {
      targetIdx = Math.floor(Math.random() * postPositions.length);
      attempts++;
    }

    const target = postPositions[targetIdx]!;
    this.state = 'flying';
    this.flyStartX = this.x;
    this.flyStartY = this.y;
    this.flyEndX = target.x;
    this.flyEndY = target.y;
    this.flyProgress = 0;
    this.flyDuration = randomRange(0.6, 1.2);
    this.wingPhase = 0;
    this.postIndex = targetIdx;
  }
}
