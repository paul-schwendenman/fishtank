import { Vector } from '../utils/Vector';
import { randomRange, lerpAngle } from '../utils/math';

export type FrogState = 'sitting' | 'leaping' | 'swimming';

export class Frog {
  position: Vector;
  heading: number;
  state: FrogState = 'sitting';

  // Sitting
  sittingTimer: number;
  sittingPadIndex: number = -1;
  throatPuffPhase: number = 0;
  isThroatPuffing: boolean = false;
  throatPuffTimer: number = 0;

  // Leaping
  leapStart: Vector = Vector.zero();
  leapEnd: Vector = Vector.zero();
  leapProgress: number = 0;
  leapDuration: number = 0.5;
  leapHeight: number = 0;

  // Swimming
  swimTarget: Vector = Vector.zero();
  velocity: Vector = Vector.zero();

  bodyLength: number = 14;

  constructor(position: Vector) {
    this.position = position;
    this.heading = randomRange(-Math.PI, Math.PI);
    this.sittingTimer = randomRange(5, 20);
  }

  get leapArcY(): number {
    const t = this.leapProgress;
    return -4 * this.leapHeight * t * (1 - t);
  }

  get leapScale(): number {
    const t = this.leapProgress;
    return 1 + 0.3 * Math.sin(t * Math.PI);
  }

  startLeap(target: Vector, targetPadIndex: number): void {
    this.state = 'leaping';
    this.leapStart = this.position;
    this.leapEnd = target;
    this.leapProgress = 0;
    this.leapDuration = randomRange(0.4, 0.6);
    this.leapHeight = 30 + Math.random() * 20;
    this.sittingPadIndex = targetPadIndex;

    const dir = target.sub(this.position);
    if (dir.mag() > 0) {
      this.heading = dir.heading();
    }
  }

  startSwimming(target: Vector, targetPadIndex: number): void {
    this.state = 'swimming';
    this.swimTarget = target;
    this.sittingPadIndex = targetPadIndex;
    const dir = target.sub(this.position);
    if (dir.mag() > 0) {
      this.heading = dir.heading();
    }
  }

  update(dt: number): void {
    switch (this.state) {
      case 'sitting':
        this.sittingTimer -= dt;

        if (Math.random() < 0.3 * dt) {
          this.heading += randomRange(-0.3, 0.3);
        }

        if (this.isThroatPuffing) {
          this.throatPuffPhase += dt * 8;
          this.throatPuffTimer -= dt;
          if (this.throatPuffTimer <= 0) {
            this.isThroatPuffing = false;
          }
        } else if (Math.random() < 0.1 * dt) {
          this.isThroatPuffing = true;
          this.throatPuffTimer = randomRange(0.5, 1.5);
          this.throatPuffPhase = 0;
        }
        break;

      case 'leaping':
        this.leapProgress += dt / this.leapDuration;
        if (this.leapProgress >= 1) {
          this.leapProgress = 1;
          this.position = this.leapEnd;
        } else {
          this.position = this.leapStart.lerp(this.leapEnd, this.leapProgress);
        }
        break;

      case 'swimming': {
        const toTarget = this.swimTarget.sub(this.position);
        const dist = toTarget.mag();
        if (dist < 5) {
          this.position = this.swimTarget;
          this.state = 'sitting';
          this.sittingTimer = randomRange(5, 20);
        } else {
          const dir = toTarget.normalize();
          this.heading = lerpAngle(this.heading, dir.heading(), 0.1);
          this.velocity = dir.scale(40);
          this.position = this.position.add(this.velocity.scale(dt));
        }
        break;
      }
    }
  }
}
