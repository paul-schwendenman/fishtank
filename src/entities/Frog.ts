import { Vector } from '../utils/Vector';
import { randomRange, lerpAngle } from '../utils/math';

export type FrogState = 'sitting' | 'leaping' | 'swimming' | 'floating';

export class Frog {
  position: Vector;
  heading: number;
  state: FrogState = 'sitting';

  // Sitting
  sittingTimer: number;
  sittingPadIndex: number = -1;
  padOffset: Vector = Vector.zero(); // offset from pad center
  isOnBank: boolean = false;
  throatPuffPhase: number = 0;
  isThroatPuffing: boolean = false;
  throatPuffTimer: number = 0;

  // Leaping
  leapStart: Vector = Vector.zero();
  leapEnd: Vector = Vector.zero();
  leapProgress: number = 0;
  leapDuration: number = 0.5;
  leapHeight: number = 0;

  // Swimming / floating (shared kick-based movement)
  swimTarget: Vector = Vector.zero();
  velocity: Vector = Vector.zero();
  floatTimer: number = 0; // how long to float before deciding next action
  kickTimer: number = 0;
  kickPhase: number = 0;
  isKicking: boolean = false;

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
    this.isOnBank = false;

    const dir = target.sub(this.position);
    if (dir.mag() > 0) {
      this.heading = dir.heading();
    }
  }

  startSwimming(target: Vector, targetPadIndex: number): void {
    this.state = 'swimming';
    this.swimTarget = target;
    this.sittingPadIndex = targetPadIndex;
    this.isOnBank = false;
    this.velocity = Vector.zero();
    this.isKicking = true;
    this.kickPhase = 0;
    this.kickTimer = 0;
    const dir = target.sub(this.position);
    if (dir.mag() > 0) {
      this.heading = dir.heading();
    }
  }

  startFloating(): void {
    this.state = 'floating';
    this.sittingPadIndex = -1;
    this.isOnBank = false;
    this.velocity = Vector.zero();
    this.floatTimer = randomRange(4, 15);
    this.kickTimer = randomRange(1, 3);
    this.isKicking = false;
    this.kickPhase = 0;
  }

  /** Generate a random offset within a lily pad radius */
  static randomPadOffset(padRadius: number): Vector {
    const angle = randomRange(0, Math.PI * 2);
    // stay within ~60% of pad radius so frog doesn't hang over the edge
    const dist = randomRange(0, padRadius * 0.4);
    return Vector.fromAngle(angle).scale(dist);
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
          // Turn toward target
          const dir = toTarget.normalize();
          this.heading = lerpAngle(this.heading, dir.heading(), 0.1);

          // Kick-based propulsion
          this.kickTimer -= dt;
          if (this.isKicking) {
            this.kickPhase += dt * 6;
            if (this.kickPhase > Math.PI) {
              this.isKicking = false;
              this.kickTimer = randomRange(0.3, 0.8);
            } else {
              // Kick burst in heading direction
              const kickForce = Math.sin(this.kickPhase) * 120;
              this.velocity = Vector.fromAngle(this.heading).scale(kickForce);
            }
          } else if (this.kickTimer <= 0) {
            this.isKicking = true;
            this.kickPhase = 0;
          }

          // Coast: decelerate between kicks
          this.velocity = this.velocity.scale(Math.pow(0.02, dt)); // heavy drag
          this.position = this.position.add(this.velocity.scale(dt));
        }
        break;
      }

      case 'floating': {
        this.floatTimer -= dt;

        // Kick-based propulsion (less frequent, less forceful than swimming)
        this.kickTimer -= dt;
        if (this.isKicking) {
          this.kickPhase += dt * 5;
          if (this.kickPhase > Math.PI) {
            this.isKicking = false;
            this.kickTimer = randomRange(2, 5);
          } else {
            // Gentle kick in heading direction
            const kickForce = Math.sin(this.kickPhase) * 60;
            this.velocity = Vector.fromAngle(this.heading).scale(kickForce);
          }
        } else if (this.kickTimer <= 0) {
          this.isKicking = true;
          this.kickPhase = 0;
          // Slight heading adjustment with each kick
          this.heading += randomRange(-0.4, 0.4);
        }

        // Coast: decelerate between kicks
        this.velocity = this.velocity.scale(Math.pow(0.02, dt)); // heavy drag
        this.position = this.position.add(this.velocity.scale(dt));

        break;
      }
    }
  }
}
