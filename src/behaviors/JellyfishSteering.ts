import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import type { Jellyfish } from '../entities/Jellyfish';

export interface RectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Very weak wander — about 0.3x the force of fish wander */
export function jellyfishWander(jelly: Jellyfish): Vector {
  jelly.wanderAngle += randomRange(-0.15, 0.15);

  const ahead = jelly.velocity.mag() > 0.5
    ? jelly.velocity.normalize().scale(30)
    : Vector.fromAngle(jelly.wanderAngle).scale(30);

  const wanderTarget = jelly.position
    .add(ahead)
    .add(Vector.fromAngle(jelly.wanderAngle).scale(15));

  const desired = wanderTarget.sub(jelly.position).normalize().scale(jelly.maxSpeed * 0.3);
  return desired.sub(jelly.velocity).limit(jelly.maxForce * 0.3);
}

/** Global ambient current from slow sine waves */
export function ambientCurrent(time: number): Vector {
  const cx = Math.sin(time * 0.15) * 3 + Math.sin(time * 0.07) * 2;
  const cy = Math.cos(time * 0.12) * 2 + Math.sin(time * 0.09 + 1) * 1.5;
  return new Vector(cx, cy);
}

/** Rectangular boundary avoidance with soft force and large threshold */
export function avoidBoundaries(jelly: Jellyfish, bounds: RectBounds): Vector {
  const threshold = 100;
  let fx = 0;
  let fy = 0;

  const leftDist = jelly.position.x - bounds.x;
  const rightDist = (bounds.x + bounds.width) - jelly.position.x;
  const topDist = jelly.position.y - bounds.y;
  const bottomDist = (bounds.y + bounds.height) - jelly.position.y;

  if (leftDist < threshold) {
    const strength = Math.pow((threshold - leftDist) / threshold, 2);
    fx += strength * 2;
  }
  if (rightDist < threshold) {
    const strength = Math.pow((threshold - rightDist) / threshold, 2);
    fx -= strength * 2;
  }
  if (topDist < threshold) {
    const strength = Math.pow((threshold - topDist) / threshold, 2);
    fy += strength * 2;
  }
  if (bottomDist < threshold) {
    const strength = Math.pow((threshold - bottomDist) / threshold, 2);
    fy -= strength * 2;
  }

  return new Vector(fx, fy);
}

/** Weak separation to prevent jellyfish overlap */
export function jellyfishSeparation(
  jelly: Jellyfish,
  neighbors: Jellyfish[],
  radius: number,
): Vector {
  let force = Vector.zero();
  let count = 0;

  for (const other of neighbors) {
    if (other === jelly) continue;
    const d = jelly.position.dist(other.position);
    if (d < radius && d > 0) {
      const away = jelly.position.sub(other.position).normalize().scale(1 / d);
      force = force.add(away);
      count++;
    }
  }

  if (count > 0) {
    force = force.scale(1 / count).normalize().scale(jelly.maxForce * 0.5);
  }
  return force;
}
