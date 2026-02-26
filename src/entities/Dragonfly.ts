import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';

export type DragonflyState = 'hovering' | 'darting';

export class Dragonfly {
  position: Vector;
  heading: number;
  state: DragonflyState = 'hovering';

  hoverTimer: number;
  wingPhase: number = 0;

  dartStart: Vector = Vector.zero();
  dartEnd: Vector = Vector.zero();
  dartProgress: number = 0;
  dartDuration: number = 0.4;

  bodyLength: number = 16;

  constructor(position: Vector) {
    this.position = position;
    this.heading = randomRange(-Math.PI, Math.PI);
    this.hoverTimer = randomRange(2, 5);
  }

  update(dt: number, bounds: { cx: number; cy: number; rx: number; ry: number }): void {
    this.wingPhase += dt * 40;

    switch (this.state) {
      case 'hovering':
        this.hoverTimer -= dt;
        // Slight jitter
        const jx = Math.sin(this.wingPhase * 0.3) * 0.5;
        const jy = Math.cos(this.wingPhase * 0.2) * 0.3;
        this.position = this.position.add(new Vector(jx, jy).scale(dt * 10));

        if (this.hoverTimer <= 0) {
          this.startDart(bounds);
        }
        break;

      case 'darting':
        this.dartProgress += dt / this.dartDuration;
        if (this.dartProgress >= 1) {
          this.position = this.dartEnd;
          this.state = 'hovering';
          this.hoverTimer = randomRange(2, 5);
        } else {
          const t = this.dartProgress;
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          this.position = this.dartStart.lerp(this.dartEnd, eased);
          const dir = this.dartEnd.sub(this.dartStart);
          if (dir.mag() > 0) {
            this.heading = dir.heading();
          }
        }
        break;
    }
  }

  private startDart(bounds: { cx: number; cy: number; rx: number; ry: number }): void {
    this.state = 'darting';
    this.dartStart = this.position;

    const angle = randomRange(-Math.PI, Math.PI);
    const dist = randomRange(100, 200);
    let target = this.position.add(Vector.fromAngle(angle).scale(dist));

    // Keep roughly within pond area (with some overflow allowed)
    const dx = (target.x - bounds.cx) / (bounds.rx * 1.2);
    const dy = (target.y - bounds.cy) / (bounds.ry * 1.2);
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 1) {
      target = new Vector(
        bounds.cx + (target.x - bounds.cx) / d,
        bounds.cy + (target.y - bounds.cy) / d,
      );
    }

    this.dartEnd = target;
    this.dartProgress = 0;
    this.dartDuration = randomRange(0.3, 0.5);
  }
}
