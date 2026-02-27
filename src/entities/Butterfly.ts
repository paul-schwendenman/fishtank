import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';

export type ButterflyState = 'hovering' | 'fluttering';

const BUTTERFLY_COLORS = ['#e8c840', '#e88030', '#f0f0f0', '#b060d0', '#5088d0'];

export class Butterfly {
  position: Vector;
  heading: number;
  state: ButterflyState = 'hovering';
  color: string;

  hoverTimer: number;
  hoverCenter: Vector;
  wingPhase: number = 0;

  flutterStart: Vector = Vector.zero();
  flutterEnd: Vector = Vector.zero();
  flutterControl: Vector = Vector.zero();
  flutterProgress: number = 0;
  flutterDuration: number = 1;

  spawnOpacity: number = 1;

  constructor(position: Vector) {
    this.position = position;
    this.hoverCenter = position;
    this.heading = randomRange(-Math.PI, Math.PI);
    this.hoverTimer = randomRange(2, 5);
    this.color = BUTTERFLY_COLORS[Math.floor(Math.random() * BUTTERFLY_COLORS.length)]!;
  }

  update(dt: number, bounds: { minX: number; maxX: number; minY: number; maxY: number }): void {
    this.wingPhase += dt * 12;

    switch (this.state) {
      case 'hovering': {
        this.hoverTimer -= dt;
        // Gentle bob
        const bx = Math.sin(this.wingPhase * 0.15) * 0.3;
        const by = Math.cos(this.wingPhase * 0.12) * 0.5;
        this.position = this.hoverCenter.add(new Vector(bx, by));

        if (this.hoverTimer <= 0) {
          this.startFlutter(bounds);
        }
        break;
      }

      case 'fluttering': {
        this.flutterProgress += dt / this.flutterDuration;
        if (this.flutterProgress >= 1) {
          this.position = this.flutterEnd;
          this.hoverCenter = this.flutterEnd;
          this.state = 'hovering';
          this.hoverTimer = randomRange(2, 5);
        } else {
          const t = this.flutterProgress;
          // Quadratic bezier
          const mt = 1 - t;
          this.position = this.flutterStart.scale(mt * mt)
            .add(this.flutterControl.scale(2 * mt * t))
            .add(this.flutterEnd.scale(t * t));

          const dir = this.flutterEnd.sub(this.flutterStart);
          if (dir.mag() > 0) {
            this.heading = dir.heading();
          }
        }
        break;
      }
    }
  }

  private startFlutter(bounds: { minX: number; maxX: number; minY: number; maxY: number }): void {
    this.state = 'fluttering';
    this.flutterStart = this.position;

    const angle = randomRange(-Math.PI, Math.PI);
    const dist = randomRange(60, 150);
    let tx = this.position.x + Math.cos(angle) * dist;
    let ty = this.position.y + Math.sin(angle) * dist;

    // Keep in bounds
    tx = Math.max(bounds.minX, Math.min(bounds.maxX, tx));
    ty = Math.max(bounds.minY, Math.min(bounds.maxY, ty));

    this.flutterEnd = new Vector(tx, ty);

    // Control point for bezier arc (arcs upward)
    const mid = this.flutterStart.lerp(this.flutterEnd, 0.5);
    this.flutterControl = mid.add(new Vector(randomRange(-30, 30), -randomRange(20, 50)));

    this.flutterProgress = 0;
    this.flutterDuration = randomRange(1, 2.5);
  }
}
