import { Vector } from '../utils/Vector';
import { randomRange, lerpAngle } from '../utils/math';
import type { SpeciesConfig } from './Species';

export interface TankBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export class Fish {
  position: Vector;
  velocity: Vector;
  acceleration: Vector = Vector.zero();
  species: SpeciesConfig;
  depth: number;
  facingAngle: number;
  tailPhase: number;
  finPhase: number;
  isIdle: boolean = false;
  idleTimer: number = 0;
  wanderAngle: number;
  spawnOpacity: number = 0;
  targetDepth: number;
  depthChangeTimer: number;

  constructor(species: SpeciesConfig, position: Vector, depth: number) {
    this.species = species;
    this.position = position;
    this.depth = depth;
    this.targetDepth = depth;
    this.depthChangeTimer = randomRange(30, 60);

    const angle = randomRange(-Math.PI, Math.PI);
    const speed = randomRange(species.maxSpeed * 0.3, species.maxSpeed * 0.6);
    this.velocity = Vector.fromAngle(angle).scale(speed);
    this.facingAngle = angle;
    this.wanderAngle = angle;
    this.tailPhase = randomRange(0, Math.PI * 2);
    this.finPhase = randomRange(0, Math.PI * 2);
  }

  applyForce(force: Vector): void {
    this.acceleration = this.acceleration.add(force);
  }

  get depthScale(): number {
    return 1.0 - this.depth * 0.3; // 1.0 at front, 0.7 at back
  }

  get speedMultiplier(): number {
    return 1.0 - this.depth * 0.2; // slower at back
  }

  update(dt: number): void {
    // Spawn fade-in
    if (this.spawnOpacity < 1) {
      this.spawnOpacity = Math.min(1, this.spawnOpacity + dt * 0.5);
    }

    // Idle system
    if (this.isIdle) {
      this.idleTimer -= dt;
      this.velocity = this.velocity.scale(1 - 3 * dt); // decay velocity
      if (this.idleTimer <= 0) {
        this.isIdle = false;
      }
    } else {
      // Random chance to go idle
      if (Math.random() < this.species.idleChance * dt) {
        this.isIdle = true;
        this.idleTimer = randomRange(
          this.species.idleDurationMin,
          this.species.idleDurationMax,
        );
      }
    }

    if (!this.isIdle) {
      // Apply accumulated forces
      const force = this.acceleration.limit(this.species.maxForce);
      this.velocity = this.velocity.add(force.scale(dt * 60));
    }

    // Clamp velocity
    const effectiveMaxSpeed = this.species.maxSpeed * this.speedMultiplier;
    this.velocity = this.velocity.limit(effectiveMaxSpeed);

    // Integrate position
    this.position = this.position.add(this.velocity.scale(dt));

    // Reset acceleration
    this.acceleration = Vector.zero();

    // Update facing angle (smooth turn)
    const speed = this.velocity.mag();
    if (speed > 1) {
      const targetAngle = this.velocity.heading();
      this.facingAngle = lerpAngle(
        this.facingAngle,
        targetAngle,
        this.species.turnSmoothing * Math.min(dt * 60, 3),
      );
    }

    // Animate fins and tail
    const speedRatio = speed / this.species.maxSpeed;
    this.tailPhase += this.species.tailFrequency * (0.3 + speedRatio * 0.7) * dt;
    this.finPhase += 4 * dt;

    // Depth drift
    this.depthChangeTimer -= dt;
    if (this.depthChangeTimer <= 0) {
      this.depthChangeTimer = randomRange(30, 60);
      if (!this.species.depthPreference) {
        this.targetDepth = randomRange(0.1, 0.9);
      }
    }
    this.depth += (this.targetDepth - this.depth) * 0.01 * dt;
  }
}
