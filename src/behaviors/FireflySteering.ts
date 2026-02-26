import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import type { Firefly } from '../entities/Firefly';

/** Gentle Craig Reynolds wander — small jitter, circle 20px ahead, 12px radius */
export function fireflyWander(firefly: Firefly): Vector {
  firefly.wanderAngle += randomRange(-0.25, 0.25);

  const ahead = firefly.velocity.mag() > 0.5
    ? firefly.velocity.normalize().scale(20)
    : Vector.fromAngle(firefly.wanderAngle).scale(20);

  const wanderTarget = firefly.position
    .add(ahead)
    .add(Vector.fromAngle(firefly.wanderAngle).scale(12));

  const desired = wanderTarget.sub(firefly.position).normalize().scale(firefly.maxSpeed * 0.3);
  return desired.sub(firefly.velocity).limit(firefly.maxForce * 0.3);
}

/** Rectangular boundary avoidance with soft ceiling and grass floor */
export function avoidBoundaries(
  firefly: Firefly,
  w: number,
  h: number,
  grassLineY: number,
): Vector {
  const threshold = 60;
  let fx = 0;
  let fy = 0;

  const ceilingY = h * 0.15; // soft ceiling — fireflies stay below this mostly

  const leftDist = firefly.position.x;
  const rightDist = w - firefly.position.x;
  const topDist = firefly.position.y - ceilingY;
  const bottomDist = grassLineY - firefly.position.y;

  if (leftDist < threshold) {
    const strength = Math.pow((threshold - leftDist) / threshold, 2);
    fx += strength * 2;
  }
  if (rightDist < threshold) {
    const strength = Math.pow((threshold - rightDist) / threshold, 2);
    fx -= strength * 2;
  }
  if (topDist < threshold) {
    const strength = Math.pow(Math.max(0, threshold - topDist) / threshold, 2);
    fy += strength * 2;
  }
  if (bottomDist < threshold) {
    const strength = Math.pow(Math.max(0, threshold - bottomDist) / threshold, 2);
    fy -= strength * 2;
  }

  return new Vector(fx, fy);
}

/** Weak 1/d repulsion to prevent clustering */
export function fireflySeparation(
  firefly: Firefly,
  neighbors: Firefly[],
  radius: number,
): Vector {
  let force = Vector.zero();
  let count = 0;

  for (const other of neighbors) {
    if (other === firefly) continue;
    const d = firefly.position.dist(other.position);
    if (d < radius && d > 0) {
      const away = firefly.position.sub(other.position).normalize().scale(1 / d);
      force = force.add(away);
      count++;
    }
  }

  if (count > 0) {
    force = force.scale(1 / count).normalize().scale(firefly.maxForce * 0.4);
  }
  return force;
}

/** Slow sine-based ambient drift */
export function gentleBreeze(time: number): Vector {
  const bx = Math.sin(time * 0.1) * 2 + Math.sin(time * 0.04) * 1.5;
  const by = Math.cos(time * 0.08) * 0.8;
  return new Vector(bx, by);
}
