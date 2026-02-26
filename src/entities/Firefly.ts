import { Vector } from '../utils/Vector';
import { randomRange, clamp } from '../utils/math';
import type { FireflyVarietyConfig } from './FireflyVariety';

const TWO_PI = Math.PI * 2;

export interface TrailPoint {
  x: number;
  y: number;
  intensity: number;
}

export class Firefly {
  position: Vector;
  velocity: Vector;
  acceleration: Vector = Vector.zero();
  heading: number;
  depth: number;
  spawnOpacity: number = 0;
  wanderAngle: number;
  variety: FireflyVarietyConfig;

  pulsePhase: number;
  glowIntensity: number = 0;

  trail: TrailPoint[];
  private trailTimer: number = 0;

  maxSpeed: number;
  maxForce: number;

  constructor(variety: FireflyVarietyConfig, position: Vector) {
    this.variety = variety;
    this.position = position;
    this.depth = randomRange(0.1, 0.9);

    this.heading = randomRange(-Math.PI, Math.PI);
    this.wanderAngle = this.heading;

    const speed = randomRange(5, 15) * this.speedScale;
    this.velocity = Vector.fromAngle(this.heading).scale(speed);

    this.pulsePhase = randomRange(0, TWO_PI);

    this.maxSpeed = variety.maxSpeed;
    this.maxForce = variety.maxForce;

    this.trail = [];
  }

  get depthScale(): number {
    return 0.4 + (1 - this.depth) * 0.6;
  }

  get depthAlpha(): number {
    return 0.3 + (1 - this.depth) * 0.7;
  }

  get speedScale(): number {
    return 0.5 + (1 - this.depth) * 0.5;
  }

  applyForce(force: Vector): void {
    this.acceleration = this.acceleration.add(force);
  }

  private computeGlow(): number {
    const { pulsePattern } = this.variety;
    const p = this.pulsePhase % TWO_PI;
    const t = p / TWO_PI; // 0–1

    switch (pulsePattern) {
      case 'rhythmic': {
        // smooth on/off with easing: on for ~40%, off for ~60%
        const raw = Math.sin(p);
        return clamp(raw * 2.5, 0, 1);
      }
      case 'flash': {
        // quick flash (~15% of cycle), then dark
        if (t < 0.15) {
          const flashT = t / 0.15;
          return Math.sin(flashT * Math.PI);
        }
        return 0;
      }
      case 'undulate': {
        // never fully dark, gentle wave
        return 0.3 + Math.sin(p) * 0.35 + Math.sin(p * 2.3) * 0.15;
      }
    }
  }

  update(dt: number): void {
    // Spawn fade-in
    if (this.spawnOpacity < 1) {
      this.spawnOpacity = Math.min(1, this.spawnOpacity + dt * 0.5);
    }

    // Pulse
    this.pulsePhase += this.variety.pulseFreq * TWO_PI * dt;
    this.glowIntensity = this.computeGlow();

    // Apply forces
    const force = this.acceleration.limit(this.maxForce * 3);
    this.velocity = this.velocity.add(force.scale(dt * 60));
    this.velocity = this.velocity.limit(this.maxSpeed * this.speedScale);

    // Drag
    const drag = Math.pow(0.985, Math.min(dt * 60, 3));
    this.velocity = this.velocity.scale(drag);

    // Update position and heading
    this.position = this.position.add(this.velocity.scale(dt));
    if (this.velocity.magSq() > 0.1) {
      this.heading = this.velocity.heading();
    }

    // Trail: record positions at intervals
    this.trailTimer += dt;
    if (this.trailTimer > 0.03) {
      this.trailTimer = 0;
      this.trail.push({
        x: this.position.x,
        y: this.position.y,
        intensity: this.glowIntensity,
      });
      while (this.trail.length > this.variety.trailLength) {
        this.trail.shift();
      }
    }

    // Reset acceleration
    this.acceleration = Vector.zero();
  }
}
