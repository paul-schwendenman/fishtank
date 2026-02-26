import { Vector } from '../utils/Vector';
import { randomRange, clamp } from '../utils/math';
import type { JellyfishVarietyConfig } from './JellyfishVariety';

const HISTORY_SIZE = 60;

export class Jellyfish {
  position: Vector;
  velocity: Vector;
  acceleration: Vector = Vector.zero();
  depth: number;
  spawnOpacity: number = 0;
  variety: JellyfishVarietyConfig;
  bellRadius: number;

  // Heading: rotation angle applied to the canvas.
  // 0 = bell faces up, PI/2 = bell faces right, etc.
  heading: number;
  headingDrift: number; // slow random drift rate

  // Pulse system
  pulsePhase: number;
  pulseFreq: number;
  contracting: boolean = false;

  // Position history for tentacle trailing
  positionHistory: Vector[];

  // Per-tentacle randomization
  tentacleLengths: number[];
  tentaclePhaseOffsets: number[];

  // Wander state
  wanderAngle: number;

  maxSpeed: number;
  maxForce: number;

  constructor(variety: JellyfishVarietyConfig, position: Vector) {
    this.variety = variety;
    this.position = position;

    this.bellRadius = randomRange(variety.bellRadiusMin, variety.bellRadiusMax);

    // Random initial heading — each jellyfish faces a different direction
    this.heading = randomRange(-Math.PI, Math.PI);
    this.headingDrift = randomRange(-0.15, 0.15);

    const speed = randomRange(2, 5);
    this.velocity = this.thrustDirection().scale(speed);
    this.wanderAngle = this.heading;

    this.depth = randomRange(0.15, 0.7);
    this.pulsePhase = randomRange(0, Math.PI * 2);
    this.pulseFreq = randomRange(variety.pulseFreqMin, variety.pulseFreqMax);

    // Pre-fill position history
    this.positionHistory = [];
    for (let i = 0; i < HISTORY_SIZE; i++) {
      this.positionHistory.push(position);
    }

    // Per-tentacle randomization
    const tc = variety.tentacles;
    this.tentacleLengths = [];
    this.tentaclePhaseOffsets = [];
    for (let i = 0; i < tc.count; i++) {
      this.tentacleLengths.push(randomRange(tc.lengthMin, tc.lengthMax));
      this.tentaclePhaseOffsets.push(randomRange(0, Math.PI * 2));
    }

    this.maxSpeed = variety.maxSpeed;
    this.maxForce = variety.maxForce;
  }

  /** Direction the bell propels toward (away from tentacles) in world space. */
  thrustDirection(): Vector {
    // Local "up" is (0, -1). After rotating by heading:
    // world = (sin(heading), -cos(heading))
    return new Vector(Math.sin(this.heading), -Math.cos(this.heading));
  }

  applyForce(force: Vector): void {
    this.acceleration = this.acceleration.add(force);
  }

  get depthAlpha(): number {
    return 1.0 - this.depth * 0.35;
  }

  get depthScale(): number {
    return 1.0 - this.depth * 0.15;
  }

  /** Returns 0 (relaxed) to 1 (fully contracted) */
  get pulseAmount(): number {
    // Asymmetric: fast contraction, slow relaxation
    const raw = Math.sin(this.pulsePhase);
    return clamp(raw * 2, 0, 1);
  }

  update(dt: number): void {
    // Spawn fade-in
    if (this.spawnOpacity < 1) {
      this.spawnOpacity = Math.min(1, this.spawnOpacity + dt * 0.5);
    }

    // --- Pulse system ---
    this.pulsePhase += this.pulseFreq * Math.PI * 2 * dt;

    this.contracting = Math.sin(this.pulsePhase) > 0;

    // --- Heading turn: only while thrusting, very slight ---
    if (this.contracting) {
      this.headingDrift += randomRange(-0.1, 0.1) * dt;
      this.headingDrift = clamp(this.headingDrift, -0.04, 0.04);
      this.heading += this.headingDrift * dt;
    }

    // Thrust continuously during contraction phase, ramped by pulse amount
    if (this.contracting) {
      const ramp = this.pulseAmount;
      this.applyForce(this.thrustDirection().scale(this.variety.thrustStrength * ramp));
    }

    // Gentle passive sinking — just a slow drift, not fighting thrust
    this.applyForce(new Vector(0, this.variety.sinkRate));

    // Apply forces
    const force = this.acceleration.limit(this.maxForce * 3);
    this.velocity = this.velocity.add(force.scale(dt * 60));

    // Speed limit
    this.velocity = this.velocity.limit(this.maxSpeed);

    // Drag: stronger during coast (relaxed), lighter during thrust (contracting)
    // This gives a clear accelerate → coast → slow cycle
    const baseDrag = this.contracting ? 0.996 : 0.99;
    const dragFactor = Math.pow(baseDrag, Math.min(dt * 60, 3));
    this.velocity = this.velocity.scale(dragFactor);

    // Update position
    this.position = this.position.add(this.velocity.scale(dt));

    // Update position history
    this.positionHistory.shift();
    this.positionHistory.push(this.position);

    // Reset acceleration
    this.acceleration = Vector.zero();

    // Slow depth oscillation
    const depthOsc = Math.sin(this.pulsePhase * 0.1) * 0.05;
    this.depth = clamp(this.depth + depthOsc * dt, 0, 1);
  }
}
