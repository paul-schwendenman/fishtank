import * as THREE from 'three';

const _tempVec = new THREE.Vector3();

export class Boid {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration = new THREE.Vector3();
  heading = new THREE.Quaternion();

  maxSpeed: number;
  maxForce: number;
  wanderAngle: number;
  wanderPitch: number;
  spawnOpacity: number;

  private static _lookMatrix = new THREE.Matrix4();
  private static _up = new THREE.Vector3(0, 1, 0);

  constructor(position: THREE.Vector3, velocity: THREE.Vector3) {
    this.position = position.clone();
    this.velocity = velocity.clone();
    // Per-boid variation: ±10%
    const variation = 0.9 + Math.random() * 0.2;
    this.maxSpeed = 35 * variation;
    this.maxForce = 1.8 * variation;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderPitch = (Math.random() - 0.5) * 0.5;
    this.spawnOpacity = -(Math.random() * 2);
  }

  applyForce(force: THREE.Vector3): void {
    this.acceleration.add(force);
  }

  update(dt: number): void {
    // Fade-in
    if (this.spawnOpacity < 1) {
      this.spawnOpacity += 0.5 * dt;
    }

    // Integrate acceleration
    _tempVec.copy(this.acceleration).multiplyScalar(dt);
    this.velocity.add(_tempVec);

    // Limit speed
    const speed = this.velocity.length();
    if (speed > this.maxSpeed) {
      this.velocity.multiplyScalar(this.maxSpeed / speed);
    }

    // Minimum speed — birds don't hover
    if (speed < this.maxSpeed * 0.3) {
      this.velocity.setLength(this.maxSpeed * 0.3);
    }

    // Light drag
    this.velocity.multiplyScalar(0.998);

    // Move
    _tempVec.copy(this.velocity).multiplyScalar(dt);
    this.position.add(_tempVec);

    // Update heading quaternion from velocity direction
    if (speed > 0.1) {
      _tempVec.copy(this.position).add(this.velocity);
      Boid._lookMatrix.lookAt(this.position, _tempVec, Boid._up);
      this.heading.setFromRotationMatrix(Boid._lookMatrix);
    }

    // Reset acceleration
    this.acceleration.set(0, 0, 0);
  }
}
