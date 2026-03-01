import type { Bird } from '../entities/Bird';

export function groundWander(bird: Bird, bounds: { minX: number; maxX: number }): number {
  const margin = 40;
  // Soft turn-around at edges
  if (bird.x < bounds.minX + margin) {
    return 10;
  }
  if (bird.x > bounds.maxX - margin) {
    return -10;
  }
  return 0;
}

export function groundSeparation(bird: Bird, others: Bird[], radius: number): number {
  let force = 0;
  let count = 0;

  for (const other of others) {
    if (other === bird) continue;
    if (other.targetPerch?.type !== 'ground') continue;
    const dx = bird.x - other.x;
    const dist = Math.abs(dx);
    if (dist < radius && dist > 0) {
      force += (dx / dist) * (1 / dist) * 20;
      count++;
    }
  }

  if (count > 0) {
    force /= count;
  }
  return force;
}

export function scatterFromJay(bird: Bird, jayX: number, jayY: number, radius: number): { fx: number; fy: number } | null {
  if (bird.variety.personality !== 'shy') return null;

  const dx = bird.x - jayX;
  const dy = bird.y - jayY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < radius && dist > 0) {
    const strength = (radius - dist) / radius * 30;
    return {
      fx: (dx / dist) * strength,
      fy: (dy / dist) * strength,
    };
  }
  return null;
}
