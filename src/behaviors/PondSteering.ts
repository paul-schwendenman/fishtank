import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import type { Koi, PondBounds } from '../entities/Koi';

export function pondWander(koi: Koi): Vector {
  koi.wanderAngle += randomRange(-0.3, 0.3);

  const ahead = koi.velocity.mag() > 0.5
    ? koi.velocity.normalize().scale(40)
    : Vector.fromAngle(koi.heading).scale(40);

  const wanderTarget = koi.position
    .add(ahead)
    .add(Vector.fromAngle(koi.wanderAngle).scale(30));

  const desired = wanderTarget.sub(koi.position).normalize().scale(koi.maxSpeed);
  return desired.sub(koi.velocity).limit(koi.maxForce);
}

export function avoidPondEdge(koi: Koi, bounds: PondBounds): Vector {
  const dx = (koi.position.x - bounds.cx) / bounds.rx;
  const dy = (koi.position.y - bounds.cy) / bounds.ry;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0.8) {
    const strength = Math.pow((dist - 0.8) / 0.2, 2) * 5;
    const toCenter = new Vector(bounds.cx - koi.position.x, bounds.cy - koi.position.y);
    return toCenter.normalize().scale(strength);
  }
  return Vector.zero();
}

export function koiSeparation(koi: Koi, neighbors: Koi[], radius: number): Vector {
  let force = Vector.zero();
  let count = 0;

  for (const other of neighbors) {
    if (other === koi) continue;
    const d = koi.position.dist(other.position);
    if (d < radius && d > 0) {
      const away = koi.position.sub(other.position).normalize().scale(1 / d);
      force = force.add(away);
      count++;
    }
  }

  if (count > 0) {
    force = force.scale(1 / count).normalize().scale(koi.maxForce);
  }
  return force;
}

export function koiAlignment(koi: Koi, neighbors: Koi[]): Vector {
  let avgHeading = Vector.zero();
  let count = 0;

  for (const other of neighbors) {
    if (other === koi) continue;
    avgHeading = avgHeading.add(Vector.fromAngle(other.heading));
    count++;
  }

  if (count > 0) {
    avgHeading = avgHeading.scale(1 / count).normalize().scale(koi.maxSpeed);
    return avgHeading.sub(koi.velocity).limit(koi.maxForce * 0.2);
  }
  return Vector.zero();
}

export function koiCohesion(koi: Koi, neighbors: Koi[]): Vector {
  let center = Vector.zero();
  let count = 0;

  for (const other of neighbors) {
    if (other === koi) continue;
    center = center.add(other.position);
    count++;
  }

  if (count > 0) {
    center = center.scale(1 / count);
    const desired = center.sub(koi.position).normalize().scale(koi.maxSpeed);
    return desired.sub(koi.velocity).limit(koi.maxForce * 0.3);
  }
  return Vector.zero();
}

export function seekSurface(koi: Koi): Vector {
  // Gentle force to slow down during feeding
  return koi.velocity.scale(-0.02);
}
