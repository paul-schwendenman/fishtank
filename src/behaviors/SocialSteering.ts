import { Vector } from '../utils/Vector';
import type { Fish } from '../entities/Fish';

/**
 * Separation: repel from too-close same-species fish.
 * Inverse-distance-squared weighting so very close fish produce strong repulsion.
 */
export function separation(fish: Fish, neighbors: Fish[], radius: number, weight: number): Vector {
  let force = Vector.zero();
  let count = 0;

  for (const other of neighbors) {
    const diff = fish.position.sub(other.position);
    const distSq = diff.magSq();
    if (distSq < 0.001 || distSq > radius * radius) continue;

    // Inverse distance squared: closer = stronger
    const strength = 1 / distSq;
    force = force.add(diff.normalize().scale(strength));
    count++;
  }

  if (count === 0) return Vector.zero();

  // Normalize by count and scale by weight and radius² to get consistent magnitude
  return force.scale(weight * radius * radius / count);
}

/**
 * Alignment: steer toward the average heading of nearby same-species fish.
 * Attenuated by neighbor count — pairs barely align, larger groups align strongly.
 */
export function alignment(fish: Fish, neighbors: Fish[], weight: number): Vector {
  if (neighbors.length === 0) return Vector.zero();

  let avgVel = Vector.zero();
  for (const other of neighbors) {
    avgVel = avgVel.add(other.velocity);
  }
  avgVel = avgVel.scale(1 / neighbors.length);

  // Ramp up with group size: 1 neighbor → 0.25, 2 → 0.5, 4+ → full
  const groupFactor = Math.min(neighbors.length / 4, 1);

  // Steer toward average velocity
  const desired = avgVel.normalize().scale(fish.species.maxSpeed);
  return desired.sub(fish.velocity).limit(fish.species.maxForce * weight * groupFactor);
}

/**
 * Cohesion: steer toward the centroid of nearby same-species fish.
 * Attenuated by distance — fish already near the centroid feel almost no pull,
 * so the school holds loosely rather than collapsing to a point.
 */
export function cohesion(fish: Fish, neighbors: Fish[], weight: number, perceptionRadius: number): Vector {
  if (neighbors.length === 0) return Vector.zero();

  let centroid = Vector.zero();
  for (const other of neighbors) {
    centroid = centroid.add(other.position);
  }
  centroid = centroid.scale(1 / neighbors.length);

  const toCentroid = centroid.sub(fish.position);
  const dist = toCentroid.mag();
  if (dist < 0.001) return Vector.zero();

  // Scale by how far we are from centroid relative to perception radius.
  // Near centroid → ~0, at edge of perception → full strength.
  const distFactor = Math.min(dist / perceptionRadius, 1);

  const desired = toCentroid.normalize().scale(fish.species.maxSpeed * distFactor);
  return desired.sub(fish.velocity).limit(fish.species.maxForce * weight * distFactor);
}

/**
 * Solitary spacing: repel from ALL nearby fish (for angelfish, betta, gourami).
 */
export function solitarySpacing(fish: Fish, allNearby: Fish[], radius: number, weight: number): Vector {
  let force = Vector.zero();
  let count = 0;

  for (const other of allNearby) {
    if (other === fish) continue;
    const diff = fish.position.sub(other.position);
    const distSq = diff.magSq();
    if (distSq < 0.001 || distSq > radius * radius) continue;

    const dist = Math.sqrt(distSq);
    // Linear falloff: closer = stronger
    const strength = (radius - dist) / radius;
    force = force.add(diff.normalize().scale(strength));
    count++;
  }

  if (count === 0) return Vector.zero();
  return force.scale(weight / count);
}

/**
 * Passive avoidance: predict collision via relative velocity and steer perpendicular.
 * Deterministic side choice (lower-x fish steers right) to prevent dance.
 */
export function passiveAvoidance(fish: Fish, nearby: Fish[], radius: number): Vector {
  let force = Vector.zero();
  const LOOKAHEAD_TIME = 1.5; // seconds to look ahead

  for (const other of nearby) {
    if (other === fish) continue;

    const toOther = other.position.sub(fish.position);
    const dist = toOther.mag();
    if (dist < 0.001 || dist > radius) continue;

    // Relative velocity (how fast we're approaching each other)
    const relVel = fish.velocity.sub(other.velocity);
    const closingSpeed = toOther.normalize().dot(relVel);

    // Only avoid if we're actually closing in
    if (closingSpeed <= 0) continue;

    // Time to closest approach
    const timeToClosest = dist / closingSpeed;
    if (timeToClosest > LOOKAHEAD_TIME) continue;

    // Predicted closest distance
    const futurePos = fish.position.add(fish.velocity.scale(timeToClosest));
    const otherFuturePos = other.position.add(other.velocity.scale(timeToClosest));
    const futureDist = futurePos.dist(otherFuturePos);

    // Collision threshold based on body sizes
    const minSep = (fish.species.bodyLength + other.species.bodyLength) * 0.8;
    if (futureDist > minSep) continue;

    // Steer perpendicular — deterministic side: lower-x fish steers right
    const perp = fish.position.x <= other.position.x
      ? new Vector(toOther.y, -toOther.x)   // steer right
      : new Vector(-toOther.y, toOther.x);  // steer left

    const urgency = 1 - (timeToClosest / LOOKAHEAD_TIME);
    force = force.add(perp.normalize().scale(urgency * fish.species.maxForce));
  }

  return force;
}
