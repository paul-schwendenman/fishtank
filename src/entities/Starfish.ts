import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import { normalizedPoolDist, type TidePoolBounds } from '../behaviors/TidePoolSteering';

export type StarfishState = 'creeping' | 'stopped';

const STARFISH_COLORS = ['#c45a30', '#b84a60', '#8a5aa0', '#d08030', '#a06040'];

export class Starfish {
  position: Vector;
  heading: number;
  state: StarfishState = 'stopped';

  moveTimer: number = 0;
  stopTimer: number;

  maxSpeed: number = 3;
  bodyRadius: number;
  armPhase: number;

  spawnOpacity: number;
  color: string;
  dotSeed: number;

  constructor(position: Vector, spawnDelay: number = 0) {
    this.position = position;
    this.heading = randomRange(-Math.PI, Math.PI);
    this.stopTimer = randomRange(3, 8);
    this.bodyRadius = randomRange(12, 18);
    this.armPhase = randomRange(0, Math.PI * 2);
    this.spawnOpacity = -spawnDelay;
    this.color = STARFISH_COLORS[Math.floor(Math.random() * STARFISH_COLORS.length)]!;
    this.dotSeed = Math.random() * 1000;
  }

  update(dt: number, bounds: TidePoolBounds): void {
    this.spawnOpacity = Math.min(1, this.spawnOpacity + dt * 0.5);
    this.armPhase += dt * 0.5;

    switch (this.state) {
      case 'stopped':
        this.stopTimer -= dt;
        if (this.stopTimer <= 0) {
          this.state = 'creeping';
          this.moveTimer = randomRange(4, 10);
          this.heading += randomRange(-1, 1);
        }
        break;

      case 'creeping':
        this.moveTimer -= dt;
        this.position = this.position.add(
          Vector.fromAngle(this.heading).scale(this.maxSpeed * dt),
        );
        if (this.moveTimer <= 0) {
          this.state = 'stopped';
          this.stopTimer = randomRange(5, 15);
        }
        break;
    }

    // Boundary avoidance
    const ndist = normalizedPoolDist(this.position.x, this.position.y, bounds);
    if (ndist > 0.8) {
      const strength = Math.pow((ndist - 0.8) / 0.2, 2) * 2;
      const toCenter = new Vector(bounds.cx - this.position.x, bounds.cy - this.position.y);
      this.position = this.position.add(toCenter.normalize().scale(strength));
      if (ndist > 0.9) {
        this.heading = toCenter.heading() + randomRange(-0.5, 0.5);
      }
    }
  }
}
