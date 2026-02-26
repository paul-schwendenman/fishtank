import { Vector } from '../utils/Vector';
import { randomRange, lerpAngle } from '../utils/math';
import { normalizedPoolDist, type TidePoolBounds } from '../behaviors/TidePoolSteering';

export type GobyState = 'hovering' | 'darting';

const GOBY_COLORS = ['#6a7a50', '#5a6a40', '#7a8a5a', '#4a5a3a', '#8a7a5a'];

export class Goby {
  position: Vector;
  heading: number;
  state: GobyState = 'hovering';

  hoverTimer: number;
  dartStart: Vector = Vector.zero();
  dartEnd: Vector = Vector.zero();
  dartProgress: number = 0;
  dartDuration: number = 0.3;

  bodyLength: number;
  tailPhase: number = 0;

  spawnOpacity: number;
  color: string;

  constructor(position: Vector, spawnDelay: number = 0) {
    this.position = position;
    this.heading = randomRange(-Math.PI, Math.PI);
    this.hoverTimer = randomRange(1, 3);
    this.bodyLength = randomRange(8, 12);
    this.spawnOpacity = -spawnDelay;
    this.color = GOBY_COLORS[Math.floor(Math.random() * GOBY_COLORS.length)]!;
  }

  update(dt: number, bounds: TidePoolBounds): void {
    this.spawnOpacity = Math.min(1, this.spawnOpacity + dt * 0.5);
    this.tailPhase += dt * (this.state === 'darting' ? 25 : 8);

    switch (this.state) {
      case 'hovering': {
        this.hoverTimer -= dt;
        // Slight jitter while hovering
        const jx = Math.sin(this.tailPhase * 0.3) * 0.3;
        const jy = Math.cos(this.tailPhase * 0.2) * 0.2;
        this.position = this.position.add(new Vector(jx, jy).scale(dt * 5));

        if (this.hoverTimer <= 0) {
          this.pickDartTarget(bounds);
        }
        break;
      }

      case 'darting':
        this.dartProgress += dt / this.dartDuration;
        if (this.dartProgress >= 1) {
          this.position = this.dartEnd;
          this.state = 'hovering';
          this.hoverTimer = randomRange(1, 3);
        } else {
          const t = this.dartProgress;
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          this.position = this.dartStart.lerp(this.dartEnd, eased);
          const dir = this.dartEnd.sub(this.dartStart);
          if (dir.mag() > 0) {
            this.heading = lerpAngle(this.heading, dir.heading(), 0.3);
          }
        }
        break;
    }

    // Boundary avoidance during hover
    const ndist = normalizedPoolDist(this.position.x, this.position.y, bounds);
    if (ndist > 0.85 && this.state === 'hovering') {
      const toCenter = new Vector(bounds.cx - this.position.x, bounds.cy - this.position.y);
      this.position = this.position.add(toCenter.normalize().scale(1.5));
    }
  }

  private pickDartTarget(bounds: TidePoolBounds): void {
    this.state = 'darting';
    this.dartStart = this.position;

    const angle = randomRange(-Math.PI, Math.PI);
    const dist = randomRange(40, 120);
    let tx = this.position.x + Math.cos(angle) * dist;
    let ty = this.position.y + Math.sin(angle) * dist;

    // Constrain target to within pool
    if (normalizedPoolDist(tx, ty, bounds) > 0.75) {
      const scale = 0.6;
      tx = bounds.cx + (tx - bounds.cx) * scale;
      ty = bounds.cy + (ty - bounds.cy) * scale;
    }

    this.dartEnd = new Vector(tx, ty);
    this.dartProgress = 0;
    this.dartDuration = randomRange(0.2, 0.4);
  }
}
