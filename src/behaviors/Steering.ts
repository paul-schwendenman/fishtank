import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import type { Fish, TankBounds } from '../entities/Fish';

const BOUNDARY_THRESHOLD = 80;
const MAX_BOUNDARY_FORCE = 5;

export function wander(fish: Fish): Vector {
  const { species } = fish;

  // Jitter the wander angle
  fish.wanderAngle += randomRange(-species.wanderJitter, species.wanderJitter);

  // Project a circle ahead of the fish
  const ahead = fish.velocity.mag() > 0.5
    ? fish.velocity.normalize().scale(species.wanderDistance)
    : Vector.fromAngle(fish.facingAngle).scale(species.wanderDistance);

  const wanderTarget = fish.position
    .add(ahead)
    .add(Vector.fromAngle(fish.wanderAngle).scale(species.wanderRadius));

  // Steer toward the wander target
  const desired = wanderTarget.sub(fish.position).normalize().scale(species.maxSpeed);
  return desired.sub(fish.velocity).limit(species.maxForce);
}

export function avoidBoundaries(fish: Fish, bounds: TankBounds): Vector {
  let force = Vector.zero();
  const { x, y } = fish.position;

  // For bottom-dwelling species, adjust effective bounds
  const effectiveTop = fish.species.depthPreference === 'bottom'
    ? bounds.bottom - (bounds.bottom - bounds.top) * 0.25
    : bounds.top;
  const effectiveBottom = bounds.bottom;

  // Left wall
  const dLeft = x - bounds.left;
  if (dLeft < BOUNDARY_THRESHOLD) {
    const strength = Math.pow(1 - dLeft / BOUNDARY_THRESHOLD, 2) * MAX_BOUNDARY_FORCE;
    force = force.add(new Vector(strength, 0));
  }

  // Right wall
  const dRight = bounds.right - x;
  if (dRight < BOUNDARY_THRESHOLD) {
    const strength = Math.pow(1 - dRight / BOUNDARY_THRESHOLD, 2) * MAX_BOUNDARY_FORCE;
    force = force.add(new Vector(-strength, 0));
  }

  // Top
  const dTop = y - effectiveTop;
  if (dTop < BOUNDARY_THRESHOLD) {
    const strength = Math.pow(1 - Math.max(0, dTop) / BOUNDARY_THRESHOLD, 2) * MAX_BOUNDARY_FORCE;
    force = force.add(new Vector(0, strength));
  }

  // Bottom
  const dBottom = effectiveBottom - y;
  if (dBottom < BOUNDARY_THRESHOLD) {
    const strength = Math.pow(1 - dBottom / BOUNDARY_THRESHOLD, 2) * MAX_BOUNDARY_FORCE;
    force = force.add(new Vector(0, -strength));
  }

  return force;
}
