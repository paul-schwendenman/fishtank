import { Vector } from '../utils/Vector';
import { randomRange, lerpAngle } from '../utils/math';

export class WaterStrider {
  position: Vector;
  velocity: Vector;
  heading: number;
  wanderAngle: number;

  dartTimer: number;
  isDarting: boolean = false;
  dartDuration: number = 0;
  dartTime: number = 0;

  bodyLength: number = 8;
  legSpread: number = 12;

  constructor(position: Vector) {
    this.position = position;
    this.heading = randomRange(-Math.PI, Math.PI);
    this.velocity = Vector.fromAngle(this.heading).scale(3);
    this.wanderAngle = this.heading;
    this.dartTimer = randomRange(3, 8);
  }

  update(dt: number, bounds: { cx: number; cy: number; rx: number; ry: number }): void {
    this.dartTimer -= dt;

    if (this.isDarting) {
      this.dartTime += dt;
      if (this.dartTime >= this.dartDuration) {
        this.isDarting = false;
        this.velocity = this.velocity.scale(0.3);
        this.dartTimer = randomRange(3, 8);
      }
    } else if (this.dartTimer <= 0) {
      this.isDarting = true;
      this.dartDuration = randomRange(0.2, 0.4);
      this.dartTime = 0;
      const angle = randomRange(-Math.PI, Math.PI);
      this.velocity = Vector.fromAngle(angle).scale(randomRange(60, 100));
    }

    // Slow wander when not darting
    if (!this.isDarting) {
      this.wanderAngle += randomRange(-0.5, 0.5);
      const wanderForce = Vector.fromAngle(this.wanderAngle).scale(0.5);
      this.velocity = this.velocity.add(wanderForce);
      this.velocity = this.velocity.limit(5);
    }

    // Boundary avoidance
    const dx = (this.position.x - bounds.cx) / bounds.rx;
    const dy = (this.position.y - bounds.cy) / bounds.ry;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0.85) {
      const toCenter = new Vector(bounds.cx - this.position.x, bounds.cy - this.position.y);
      this.velocity = this.velocity.add(toCenter.normalize().scale(2));
    }

    // Drag
    const steps = Math.min(dt * 60, 3);
    this.velocity = this.velocity.scale(Math.pow(0.95, steps));
    this.position = this.position.add(this.velocity.scale(dt));

    if (this.velocity.mag() > 1) {
      this.heading = lerpAngle(this.heading, this.velocity.heading(), 0.1);
    }
  }
}
