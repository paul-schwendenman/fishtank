import * as THREE from 'three';
import type { Boid } from '../entities/Boid';

const _tempVec = new THREE.Vector3();
const _desired = new THREE.Vector3();

export interface PrioritizedForce3D {
  force: THREE.Vector3;
  priority: number;
}

/**
 * Priority-based force composition in 3D.
 * Same algorithm as ForceBudget.composeForceBudget but using Vector3.
 */
export function composeForceBudget3D(forces: PrioritizedForce3D[], budget: number): THREE.Vector3 {
  forces.sort((a, b) => a.priority - b.priority);

  const result = new THREE.Vector3();
  let remaining = budget;

  for (const { force } of forces) {
    const mag = force.length();
    if (mag < 0.001 || remaining < 0.001) continue;

    if (mag <= remaining) {
      result.add(force);
      remaining -= mag;
    } else {
      _tempVec.copy(force).normalize().multiplyScalar(remaining);
      result.add(_tempVec);
      remaining = 0;
    }
  }

  return result;
}

/**
 * Separation: inverse-distance-squared repulsion from nearby boids.
 */
export function separation(boid: Boid, neighbors: Boid[], radius: number): THREE.Vector3 {
  const force = new THREE.Vector3();
  let count = 0;

  for (const other of neighbors) {
    if (other === boid) continue;
    _tempVec.copy(boid.position).sub(other.position);
    const distSq = _tempVec.lengthSq();
    if (distSq < 0.001 || distSq > radius * radius) continue;

    const strength = 1 / distSq;
    _tempVec.normalize().multiplyScalar(strength);
    force.add(_tempVec);
    count++;
  }

  if (count === 0) return force;
  return force.multiplyScalar(radius * radius / count);
}

/**
 * Alignment: steer toward neighbors' average velocity.
 */
export function alignment(boid: Boid, neighbors: Boid[], weight: number): THREE.Vector3 {
  const avgVel = new THREE.Vector3();
  let count = 0;

  for (const other of neighbors) {
    if (other === boid) continue;
    avgVel.add(other.velocity);
    count++;
  }

  if (count === 0) return avgVel;
  avgVel.divideScalar(count);

  // Steer toward average velocity
  _desired.copy(avgVel).normalize().multiplyScalar(boid.maxSpeed);
  _desired.sub(boid.velocity);
  if (_desired.length() > boid.maxForce * weight) {
    _desired.setLength(boid.maxForce * weight);
  }
  return _desired.clone();
}

/**
 * Cohesion: steer toward neighbors' centroid, distance-attenuated.
 */
export function cohesion(boid: Boid, neighbors: Boid[], weight: number, perceptionRadius: number): THREE.Vector3 {
  const centroid = new THREE.Vector3();
  let count = 0;

  for (const other of neighbors) {
    if (other === boid) continue;
    centroid.add(other.position);
    count++;
  }

  if (count === 0) return new THREE.Vector3();
  centroid.divideScalar(count);

  _tempVec.copy(centroid).sub(boid.position);
  const dist = _tempVec.length();
  if (dist < 0.001) return new THREE.Vector3();

  const distFactor = Math.min(dist / perceptionRadius, 1);
  _desired.copy(_tempVec).normalize().multiplyScalar(boid.maxSpeed * distFactor);
  _desired.sub(boid.velocity);
  const maxF = boid.maxForce * weight * distFactor;
  if (_desired.length() > maxF) {
    _desired.setLength(maxF);
  }
  return _desired.clone();
}

/**
 * Boundary avoidance: soft spherical boundary with exponential ramp.
 */
export function avoidBoundary(boid: Boid, center: THREE.Vector3, maxRadius: number): THREE.Vector3 {
  _tempVec.copy(boid.position).sub(center);
  const dist = _tempVec.length();
  const threshold = maxRadius * 0.7;

  if (dist < threshold) return new THREE.Vector3();

  // Exponential ramp as boid approaches boundary
  const overshoot = (dist - threshold) / (maxRadius - threshold);
  const strength = Math.pow(Math.min(overshoot, 1), 2) * boid.maxForce * 5;

  return _tempVec.normalize().negate().multiplyScalar(strength).clone();
}

/**
 * Migration: steer toward a moving waypoint.
 */
export function migration(boid: Boid, target: THREE.Vector3, weight: number): THREE.Vector3 {
  _desired.copy(target).sub(boid.position);
  const dist = _desired.length();
  if (dist < 0.001) return new THREE.Vector3();

  // Stronger pull when far from target
  const urgency = Math.min(dist / 60, 1);
  _desired.normalize().multiplyScalar(boid.maxSpeed * urgency);
  _desired.sub(boid.velocity);
  const maxF = boid.maxForce * weight;
  if (_desired.length() > maxF) {
    _desired.setLength(maxF);
  }
  return _desired.clone();
}

/**
 * Vertical preference: gentle pull toward a preferred altitude.
 */
export function verticalPreference(boid: Boid, preferredY: number, weight: number): THREE.Vector3 {
  const diff = preferredY - boid.position.y;
  const strength = Math.sign(diff) * Math.min(Math.abs(diff) * 0.01, boid.maxForce * weight);
  return new THREE.Vector3(0, strength, 0);
}

/**
 * 3D wander: autocorrelated direction changes for smooth individual variation.
 */
export function wander3D(boid: Boid, weight: number): THREE.Vector3 {
  // Jitter wander angles
  boid.wanderAngle += (Math.random() - 0.5) * 0.6;
  boid.wanderPitch += (Math.random() - 0.5) * 0.3;
  boid.wanderPitch = Math.max(-0.8, Math.min(0.8, boid.wanderPitch));

  // Project a sphere ahead of the boid
  const speed = boid.velocity.length();
  const aheadDist = Math.max(speed * 0.5, 5);

  _tempVec.copy(boid.velocity);
  if (speed > 0.1) {
    _tempVec.normalize().multiplyScalar(aheadDist);
  } else {
    _tempVec.set(aheadDist, 0, 0);
  }

  const wanderRadius = 8;
  const wx = Math.cos(boid.wanderAngle) * Math.cos(boid.wanderPitch) * wanderRadius;
  const wy = Math.sin(boid.wanderPitch) * wanderRadius;
  const wz = Math.sin(boid.wanderAngle) * Math.cos(boid.wanderPitch) * wanderRadius;

  _desired.set(
    boid.position.x + _tempVec.x + wx,
    boid.position.y + _tempVec.y + wy,
    boid.position.z + _tempVec.z + wz,
  ).sub(boid.position).normalize().multiplyScalar(boid.maxSpeed);

  _desired.sub(boid.velocity);
  const maxF = boid.maxForce * weight;
  if (_desired.length() > maxF) {
    _desired.setLength(maxF);
  }
  return _desired.clone();
}
