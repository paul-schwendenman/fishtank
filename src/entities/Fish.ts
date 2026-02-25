import { Vector } from '../utils/Vector';
import { randomRange, clamp } from '../utils/math';
import type { SpeciesConfig } from './Species';

export interface TankBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const FACING_HYSTERESIS = 5; // vx must exceed this to flip facingRight
const TANK_DEPTH_PX = 400;  // conceptual z-depth in pixels for viewAngle calc
const MAX_TILT = Math.PI / 6;

export class Fish {
  position: Vector;
  velocity: Vector;
  acceleration: Vector = Vector.zero();
  species: SpeciesConfig;
  depth: number;           // z-position: 0 = front glass, 1 = back wall
  facingAngle: number;     // vertical tilt only (±PI/6)
  tailPhase: number;
  finPhase: number;
  isIdle: boolean = false;
  idleTimer: number = 0;
  wanderAngle: number;
  wanderZAngle: number;    // z-axis wander angle
  spawnOpacity: number = 0;

  // Z-axis physics
  vz: number = 0;         // z-velocity (depth change rate)
  az: number = 0;         // z-acceleration (reset each frame)

  // Turn tracking
  facingRight: boolean;
  turnPhase: number = 1;  // 0 = mid-turn, 1 = settled

  constructor(species: SpeciesConfig, position: Vector, depth: number) {
    this.species = species;
    this.position = position;
    this.depth = depth;

    const angle = randomRange(-Math.PI, Math.PI);
    const speed = randomRange(species.maxSpeed * 0.3, species.maxSpeed * 0.6);
    this.velocity = Vector.fromAngle(angle).scale(speed);
    this.facingAngle = 0; // vertical tilt, starts level
    this.facingRight = this.velocity.x >= 0;
    this.wanderAngle = angle;
    this.wanderZAngle = randomRange(-Math.PI, Math.PI);
    this.tailPhase = randomRange(0, Math.PI * 2);
    this.finPhase = randomRange(0, Math.PI * 2);
  }

  applyForce(force: Vector): void {
    this.acceleration = this.acceleration.add(force);
  }

  applyZForce(zForce: number): void {
    this.az += zForce;
  }

  get depthScale(): number {
    return 1.0 - this.depth * 0.3; // 1.0 at front, 0.7 at back
  }

  get speedMultiplier(): number {
    return 1.0 - this.depth * 0.2; // slower at back
  }

  /** View angle: 0 = perfect profile, PI/2 = head-on */
  get viewAngle(): number {
    const absVx = Math.abs(this.velocity.x);
    const absVz = Math.abs(this.vz) * TANK_DEPTH_PX;
    return Math.atan2(absVz, absVx);
  }

  /** Effective view angle: peaks at PI/2 during turn midpoint */
  get effectiveViewAngle(): number {
    // During a turn (turnPhase < 1), blend toward head-on at the midpoint
    if (this.turnPhase < 1) {
      // turnPhase goes 0→1; peak foreshortening at turnPhase ~0
      const turnInfluence = 1 - this.turnPhase;
      const turnAngle = Math.PI / 2 * turnInfluence;
      return Math.max(this.viewAngle, turnAngle);
    }
    return this.viewAngle;
  }

  /** Body heading as a unit vector (accounts for facingRight + tilt) */
  get headingDir(): Vector {
    return new Vector(
      (this.facingRight ? 1 : -1) * Math.cos(this.facingAngle),
      Math.sin(this.facingAngle),
    );
  }

  update(dt: number): void {
    // Spawn fade-in
    if (this.spawnOpacity < 1) {
      this.spawnOpacity = Math.min(1, this.spawnOpacity + dt * 0.5);
    }

    // Idle system
    if (this.isIdle) {
      this.idleTimer -= dt;
      if (this.idleTimer <= 0) {
        this.isIdle = false;
      }
    } else {
      if (Math.random() < this.species.idleChance * dt) {
        this.isIdle = true;
        this.idleTimer = randomRange(
          this.species.idleDurationMin,
          this.species.idleDurationMax,
        );
      }
    }

    if (!this.isIdle) {
      // Apply accumulated 2D forces
      const force = this.acceleration.limit(this.species.maxForce);
      this.velocity = this.velocity.add(force.scale(dt * 60));
    }

    // Clamp 2D velocity
    const effectiveMaxSpeed = this.species.maxSpeed * this.speedMultiplier;
    this.velocity = this.velocity.limit(effectiveMaxSpeed);

    // Lateral drag — fish are streamlined nose-to-tail, not sideways.
    // Decompose velocity into forward (along body) and lateral (perpendicular),
    // decay lateral much faster so the fish always moves where it's pointing.
    const heading = this.headingDir;
    const fwdSpeed = this.velocity.x * heading.x + this.velocity.y * heading.y;
    const fwdVel = heading.scale(fwdSpeed);
    const latVel = this.velocity.sub(fwdVel);
    const steps = Math.min(dt * 60, 3);
    const fwdDrag = Math.pow(0.997, steps);  // light forward drag — coasts for seconds
    const latDrag = Math.pow(0.88, steps);   // heavy lateral drag — kills drift in ~10 frames
    this.velocity = fwdVel.scale(fwdDrag).add(latVel.scale(latDrag));

    // Integrate 2D position
    this.position = this.position.add(this.velocity.scale(dt));

    // Reset 2D acceleration
    this.acceleration = Vector.zero();

    // Z-axis integration
    this.vz += this.az * dt * 60;
    this.vz = clamp(this.vz, -this.species.maxZSpeed, this.species.maxZSpeed);
    this.vz *= Math.pow(0.97, steps); // z-drag
    this.depth += this.vz * dt;
    this.depth = clamp(this.depth, 0, 1);
    this.az = 0;

    // Update facing direction with hysteresis
    const vx = this.velocity.x;
    if (this.facingRight && vx < -FACING_HYSTERESIS) {
      this.facingRight = false;
      this.turnPhase = 0;
    } else if (!this.facingRight && vx > FACING_HYSTERESIS) {
      this.facingRight = true;
      this.turnPhase = 0;
    }

    // Animate turn phase toward 1 (settled)
    if (this.turnPhase < 1) {
      this.turnPhase = Math.min(1, this.turnPhase + dt / this.species.turnDuration);
    }

    // Update facing angle (vertical tilt only)
    // Rotation rate scales with speed — fish can't spin in place.
    // At low speed the tilt freezes, preserving the last heading while coasting.
    const speed = this.velocity.mag();
    const speedFraction = clamp(speed / this.species.maxSpeed, 0, 1);
    if (speed > this.species.maxSpeed * 0.15) {
      const targetTilt = Math.atan2(this.velocity.y, Math.abs(this.velocity.x));
      const tiltRate = 0.18 * speedFraction * steps;
      this.facingAngle += (targetTilt - this.facingAngle) * Math.min(tiltRate, 1);
    }
    this.facingAngle = clamp(this.facingAngle, -MAX_TILT, MAX_TILT);

    // Animate fins and tail
    const speedRatio = speed / this.species.maxSpeed;
    this.tailPhase += this.species.tailFrequency * (0.3 + speedRatio * 0.7) * dt;
    this.finPhase += 4 * dt;
  }
}
