import { Vector } from '../utils/Vector';
import { randomRange, clamp, lerpAngle } from '../utils/math';
import type { KoiVarietyConfig, PatchConfig } from './KoiVariety';

export interface PondBounds {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  margin: number;
}

export interface KoiPatch {
  cx: number;
  cy: number;
  points: { x: number; y: number }[];
  color: string;
}

export class Koi {
  position: Vector;
  velocity: Vector;
  acceleration: Vector = Vector.zero();
  heading: number;
  depth: number;
  depthPhase: number;
  tailPhase: number;
  wanderAngle: number;
  isIdle: boolean = false;
  idleTimer: number = 0;
  spawnOpacity: number = 0;
  feedingTimer: number = 0;
  isFeeding: boolean = false;
  feedingDepthTarget: number = 0;
  mouthPhase: number = 0;

  variety: KoiVarietyConfig;
  patches: KoiPatch[];
  bodyLength: number;
  bodyWidth: number;

  maxSpeed: number = 35;
  maxForce: number = 0.8;
  idleChance: number = 0.08;
  idleDurationMin: number = 2;
  idleDurationMax: number = 5;

  constructor(variety: KoiVarietyConfig, position: Vector, bodyLength: number) {
    this.variety = variety;
    this.position = position;
    this.bodyLength = bodyLength;
    this.bodyWidth = bodyLength * 0.35;

    const angle = randomRange(-Math.PI, Math.PI);
    const speed = randomRange(this.maxSpeed * 0.2, this.maxSpeed * 0.4);
    this.velocity = Vector.fromAngle(angle).scale(speed);
    this.heading = angle;
    this.depth = randomRange(0.2, 0.6);
    this.depthPhase = randomRange(0, Math.PI * 2);
    this.tailPhase = randomRange(0, Math.PI * 2);
    this.wanderAngle = angle;

    this.patches = this.generatePatches(variety.patches);
  }

  private generatePatches(configs: PatchConfig[]): KoiPatch[] {
    const patches: KoiPatch[] = [];
    for (const config of configs) {
      const count = Math.floor(randomRange(config.countMin, config.countMax + 0.99));
      for (let i = 0; i < count; i++) {
        const cx = randomRange(-0.3, 0.3);
        const cy = randomRange(-0.25, 0.25);
        const size = randomRange(config.sizeMin, config.sizeMax);
        const numPoints = 6 + Math.floor(Math.random() * 3);
        const points: { x: number; y: number }[] = [];
        for (let j = 0; j < numPoints; j++) {
          const a = (j / numPoints) * Math.PI * 2;
          const r = size * (0.7 + Math.random() * 0.6);
          points.push({
            x: cx + Math.cos(a) * r,
            y: cy + Math.sin(a) * r * 0.6,
          });
        }
        patches.push({ cx, cy, points, color: config.color });
      }
    }
    return patches;
  }

  applyForce(force: Vector): void {
    this.acceleration = this.acceleration.add(force);
  }

  get depthAlpha(): number {
    return 1.0 - this.depth * 0.4;
  }

  get depthScale(): number {
    return 1.0 - this.depth * 0.15;
  }

  update(dt: number): void {
    if (this.spawnOpacity < 1) {
      this.spawnOpacity = Math.min(1, this.spawnOpacity + dt * 0.5);
    }

    // Idle system
    if (this.isIdle) {
      this.idleTimer -= dt;
      if (this.idleTimer <= 0) {
        this.isIdle = false;
      }
    } else if (!this.isFeeding) {
      if (Math.random() < this.idleChance * dt) {
        this.isIdle = true;
        this.idleTimer = randomRange(this.idleDurationMin, this.idleDurationMax);
      }
    }

    // Feeding
    if (this.isFeeding) {
      this.feedingTimer -= dt;
      this.mouthPhase += dt * 6;
      if (this.depth > 0.05) {
        this.depth -= dt * 0.3;
      }
      if (this.feedingTimer <= 0) {
        this.isFeeding = false;
        this.feedingDepthTarget = randomRange(0.2, 0.6);
      }
    } else {
      this.depthPhase += dt * 0.3;
      const depthTarget = 0.3 + Math.sin(this.depthPhase) * 0.25;
      this.depth += (depthTarget - this.depth) * dt * 0.5;

      if (this.feedingDepthTarget > 0) {
        this.depth += (this.feedingDepthTarget - this.depth) * dt * 0.3;
        if (Math.abs(this.depth - this.feedingDepthTarget) < 0.05) {
          this.feedingDepthTarget = 0;
        }
      }
    }
    this.depth = clamp(this.depth, 0, 1);

    if (!this.isIdle) {
      const force = this.acceleration.limit(this.maxForce * 3);
      this.velocity = this.velocity.add(force.scale(dt * 60));
    }

    // Speed limit — slower when feeding
    const effectiveMax = this.isFeeding ? this.maxSpeed * 0.4 : this.maxSpeed;
    this.velocity = this.velocity.limit(effectiveMax);

    // Very strong lateral drag
    const headingVec = Vector.fromAngle(this.heading);
    const fwdSpeed = this.velocity.dot(headingVec);
    const fwdVel = headingVec.scale(fwdSpeed);
    const latVel = this.velocity.sub(fwdVel);
    const steps = Math.min(dt * 60, 3);
    const fwdDrag = Math.pow(0.997, steps);
    const latDrag = Math.pow(0.82, steps);
    this.velocity = fwdVel.scale(fwdDrag).add(latVel.scale(latDrag));

    this.position = this.position.add(this.velocity.scale(dt));

    // Smooth heading interpolation
    const speed = this.velocity.mag();
    if (speed > 2) {
      const targetHeading = this.velocity.heading();
      const t = Math.min(1, 0.08 * steps * (speed / this.maxSpeed));
      this.heading = lerpAngle(this.heading, targetHeading, t);
    }

    this.acceleration = Vector.zero();

    // Animate tail
    const speedRatio = speed / this.maxSpeed;
    this.tailPhase += (3 + speedRatio * 4) * dt;
  }
}
