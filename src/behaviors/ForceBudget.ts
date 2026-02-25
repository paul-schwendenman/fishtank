import { Vector } from '../utils/Vector';

export interface PrioritizedForce {
  force: Vector;
  priority: number; // lower = higher priority
}

// Priority constants
export const PRIORITY_BOUNDARY = 0;
export const PRIORITY_OBSTACLE = 1;
export const PRIORITY_SEPARATION = 2;
export const PRIORITY_ALIGNMENT = 3;
export const PRIORITY_COHESION = 3;
export const PRIORITY_SOLITARY = 2;
export const PRIORITY_PASSIVE_AVOID = 2;
export const PRIORITY_WANDER = 4;
export const PRIORITY_SURFACE = 3;
export const PRIORITY_SUBSTRATE = 3;

/**
 * Compose forces by priority with a magnitude budget.
 * Higher-priority forces (lower number) get their full magnitude first;
 * lower-priority forces get whatever budget remains.
 */
export function composeForceBudget(forces: PrioritizedForce[], budget: number): Vector {
  // Sort by priority (ascending = highest priority first)
  forces.sort((a, b) => a.priority - b.priority);

  let result = Vector.zero();
  let remaining = budget;

  for (const { force } of forces) {
    const mag = force.mag();
    if (mag < 0.001 || remaining < 0.001) continue;

    if (mag <= remaining) {
      result = result.add(force);
      remaining -= mag;
    } else {
      // Partial: scale force to fit remaining budget
      result = result.add(force.normalize().scale(remaining));
      remaining = 0;
    }
  }

  return result;
}
