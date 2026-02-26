import { Vector } from '../utils/Vector';
import { randomRange, lerpAngle } from '../utils/math';
import { normalizedPoolDist, type TidePoolBounds } from '../behaviors/TidePoolSteering';

export type CrabState = 'scuttling' | 'resting' | 'turning';

const SHELL_COLORS = ['#8a4a2a', '#6a5a3a', '#7a3a2a', '#5a6a4a', '#9a5a3a'];

export class Crab {
  position: Vector;
  heading: number;
  moveDirection: number; // +1 or -1: which side the crab scuttles toward
  state: CrabState = 'resting';

  scuttleTimer: number = 0;
  restTimer: number;
  turnFrom: number = 0;
  turnTo: number = 0;
  turnProgress: number = 0;
  turnDuration: number = 0;

  speed: number = 0;
  maxSpeed: number;
  bodyWidth: number;
  bodyHeight: number;

  spawnOpacity: number;
  legPhase: number = 0;
  clawPhase: number = 0;

  shellColor: string;

  constructor(position: Vector, spawnDelay: number = 0) {
    this.position = position;
    this.heading = randomRange(-Math.PI, Math.PI);
    this.moveDirection = Math.random() > 0.5 ? 1 : -1;
    this.restTimer = randomRange(1, 3);
    this.maxSpeed = randomRange(25, 40);
    this.bodyWidth = randomRange(14, 20);
    this.bodyHeight = this.bodyWidth * 0.7;
    this.spawnOpacity = -spawnDelay;
    this.shellColor = SHELL_COLORS[Math.floor(Math.random() * SHELL_COLORS.length)]!;
  }

  update(dt: number, bounds: TidePoolBounds): void {
    this.spawnOpacity = Math.min(1, this.spawnOpacity + dt * 0.5);
    this.clawPhase += dt * 2;

    switch (this.state) {
      case 'resting':
        this.restTimer -= dt;
        this.speed *= 0.85;
        if (this.restTimer <= 0) {
          if (Math.random() < 0.4) {
            this.state = 'turning';
            this.turnFrom = this.heading;
            this.turnTo = this.heading + randomRange(-Math.PI * 0.8, Math.PI * 0.8);
            this.turnProgress = 0;
            this.turnDuration = randomRange(0.3, 0.6);
          } else {
            this.state = 'scuttling';
            this.scuttleTimer = randomRange(1, 3);
            this.moveDirection = Math.random() > 0.5 ? 1 : -1;
          }
        }
        break;

      case 'turning':
        this.turnProgress += dt / this.turnDuration;
        if (this.turnProgress >= 1) {
          this.heading = this.turnTo;
          this.state = 'scuttling';
          this.scuttleTimer = randomRange(1, 3);
        } else {
          this.heading = lerpAngle(this.turnFrom, this.turnTo, this.turnProgress);
        }
        break;

      case 'scuttling': {
        this.scuttleTimer -= dt;
        this.legPhase += dt * 14;
        this.speed = this.maxSpeed;

        // Move sideways relative to heading
        const moveAngle = this.heading + (Math.PI / 2) * this.moveDirection;
        this.position = this.position.add(Vector.fromAngle(moveAngle).scale(this.speed * dt));

        if (this.scuttleTimer <= 0) {
          this.state = 'resting';
          this.restTimer = randomRange(1.5, 4);
        }

        // Random quick direction flip
        if (Math.random() < 0.03) {
          this.moveDirection *= -1;
        }
        break;
      }
    }

    // Boundary avoidance
    const ndist = normalizedPoolDist(this.position.x, this.position.y, bounds);
    if (ndist > 0.82) {
      const strength = Math.pow((ndist - 0.82) / 0.18, 2) * 3;
      const toCenter = new Vector(bounds.cx - this.position.x, bounds.cy - this.position.y);
      this.position = this.position.add(toCenter.normalize().scale(strength));
      if (ndist > 0.92) {
        this.heading = toCenter.heading() + randomRange(-0.5, 0.5);
        this.state = 'resting';
        this.restTimer = randomRange(0.5, 1.5);
      }
    }
  }
}
