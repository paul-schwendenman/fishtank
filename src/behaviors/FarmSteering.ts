import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import type { Cow } from '../entities/Cow';
import type { PondBounds } from '../rendering/FarmFieldRenderer';

export function avoidFieldEdge(cow: Cow, bounds: { minX: number; maxX: number }): Vector {
  const margin = 80;
  let fx = 0;

  if (cow.position.x < bounds.minX + margin) {
    const strength = (margin - (cow.position.x - bounds.minX)) / margin;
    fx = strength * 20;
  } else if (cow.position.x > bounds.maxX - margin) {
    const strength = (margin - (bounds.maxX - cow.position.x)) / margin;
    fx = -strength * 20;
  }

  return new Vector(fx, 0);
}

export function avoidPond(cow: Cow, pondBounds: PondBounds | null): Vector {
  if (!pondBounds) return Vector.zero();

  const dx = cow.position.x - pondBounds.cx;
  const dy = cow.position.y - pondBounds.cy;
  const ndx = dx / (pondBounds.rx + 30);
  const ndy = dy / (pondBounds.ry + 20);
  const dist = Math.sqrt(ndx * ndx + ndy * ndy);

  if (dist < 1) {
    // Inside or too close — push away
    const strength = (1 - dist) * 40;
    const away = new Vector(dx, dy);
    if (away.mag() < 0.01) return new Vector(strength, 0);
    return away.normalize().scale(strength);
  }
  return Vector.zero();
}

export function cowSeparation(cow: Cow, others: Cow[], radius: number): Vector {
  let force = Vector.zero();
  let count = 0;

  for (const other of others) {
    if (other === cow) continue;
    const d = cow.position.dist(other.position);
    if (d < radius && d > 0) {
      const away = cow.position.sub(other.position).normalize().scale(1 / d);
      force = force.add(away);
      count++;
    }
  }

  if (count > 0) {
    force = force.scale(1 / count).normalize().scale(15);
  }
  return force;
}

export function cowWander(cow: Cow): Vector {
  const angle = randomRange(-0.3, 0.3);
  const heading = cow.facingRight ? 0 : Math.PI;
  return Vector.fromAngle(heading + angle).scale(2);
}

export function snapToGround(cow: Cow, groundY: (x: number) => number): void {
  cow.position = new Vector(cow.position.x, groundY(cow.position.x));
}
