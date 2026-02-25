import { Vector } from '../utils/Vector';
import type { Fish, TankBounds } from '../entities/Fish';
import type { Obstacle } from './ObstacleData';

/**
 * Obstacle avoidance: ray-cast along heading, steer away from AABB intersections.
 */
export function avoidObstacles(fish: Fish, obstacles: Obstacle[], lookahead: number): Vector {
  const heading = fish.headingDir;
  const speed = fish.velocity.mag();
  // Scale lookahead by speed — faster fish look further ahead
  const lookDist = lookahead * (0.5 + speed / fish.species.maxSpeed);

  let force = Vector.zero();

  for (const obs of obstacles) {
    // Vector from fish to obstacle center
    const toObs = obs.center.sub(fish.position);
    const dist = toObs.mag();

    // Skip if too far
    if (dist > lookDist + obs.halfWidth + obs.halfHeight) continue;

    // Project obstacle center onto heading ray
    const ahead = heading.dot(toObs);

    // Skip if obstacle is behind us
    if (ahead < 0) continue;

    // Lateral distance from ray to obstacle center
    const lateralDist = Math.abs(toObs.x * heading.y - toObs.y * heading.x);

    // Check if ray passes through expanded AABB
    const expandedHalf = Math.max(obs.halfWidth, obs.halfHeight) + obs.padding;
    if (lateralDist > expandedHalf) continue;

    // Steer away from obstacle — perpendicular to heading, away from obstacle
    const side = toObs.x * heading.y - toObs.y * heading.x;
    const steerDir = side > 0
      ? new Vector(heading.y, -heading.x)   // steer left
      : new Vector(-heading.y, heading.x);  // steer right

    // Urgency: closer = stronger
    const urgency = 1 - Math.min(ahead / lookDist, 1);
    force = force.add(steerDir.scale(urgency * fish.species.maxForce * 2));
  }

  return force;
}

/**
 * Seek surface: gentle upward force for guppies/gouramis during surface visits.
 */
export function seekSurface(fish: Fish, bounds: TankBounds): Vector {
  const targetY = bounds.top + 30;
  const dy = targetY - fish.position.y;
  // Steer toward surface
  return new Vector(0, Math.sign(dy) * Math.min(Math.abs(dy) * 0.02, fish.species.maxForce * 0.5));
}

/**
 * Substrate behavior: downward bias + forward scooting for corydoras.
 */
export function substrateBehavior(fish: Fish, bottomY: number): Vector {
  const distFromBottom = bottomY - fish.position.y;

  // If already near bottom, scoot forward with slight random vertical
  if (distFromBottom < 30) {
    const scootDir = fish.facingRight ? 1 : -1;
    return new Vector(scootDir * fish.species.maxForce * 0.3, Math.random() * 0.2 - 0.1);
  }

  // Otherwise, gentle downward pull
  return new Vector(0, Math.min(distFromBottom * 0.01, fish.species.maxForce * 0.3));
}
