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

  // Pulse system
  pulsePhase: number;
  pulseFreq: number;
  private contracting: boolean = false;

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

    const angle = randomRange(-Math.PI, Math.PI);
    const speed = randomRange(2, 5);
    this.velocity = Vector.fromAngle(angle).scale(speed);
    this.wanderAngle = angle;

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
    // Map so positive part is short (contraction) and negative is long (relaxation)
    return clamp(raw * 2, 0, 1);
  }

  update(dt: number): void {
    // Spawn fade-in
    if (this.spawnOpacity < 1) {
      this.spawnOpacity = Math.min(1, this.spawnOpacity + dt * 0.5);
    }

    // Advance pulse
    this.pulsePhase += this.pulseFreq * Math.PI * 2 * dt;

    // Detect contraction phase (sin crossing from negative to positive)
    const prevContracting = this.contracting;
    this.contracting = Math.sin(this.pulsePhase) > 0;

    // Apply thrust during contraction onset
    if (this.contracting && !prevContracting) {
      // Thrust upward (negative y)
      this.applyForce(new Vector(0, -this.variety.thrustStrength));
    }

    // Constant passive sinking
    this.applyForce(new Vector(0, this.variety.sinkRate));

    // Apply forces
    const force = this.acceleration.limit(this.maxForce * 3);
    this.velocity = this.velocity.add(force.scale(dt * 60));

    // Speed limit
    this.velocity = this.velocity.limit(this.maxSpeed);

    // Gentle drag (jellyfish are slow and floaty)
    const dragFactor = Math.pow(0.985, Math.min(dt * 60, 3));
    this.velocity = this.velocity.scale(dragFactor);

    // Update position
    this.position = this.position.add(this.velocity.scale(dt));

    // Update position history (ring buffer style, shift and push)
    this.positionHistory.shift();
    this.positionHistory.push(this.position);

    // Reset acceleration
    this.acceleration = Vector.zero();

    // Slow depth oscillation
    const depthOsc = Math.sin(this.pulsePhase * 0.1) * 0.05;
    this.depth = clamp(this.depth + depthOsc * dt, 0, 1);
  }
}
