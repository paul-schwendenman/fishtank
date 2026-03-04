import * as THREE from 'three';

export type HawkState = 'circling' | 'diving' | 'climbing';

const _lookMatrix = new THREE.Matrix4();
const _up = new THREE.Vector3(0, 1, 0);
const _tempVec = new THREE.Vector3();

export class Hawk {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  heading = new THREE.Quaternion();

  state: HawkState = 'circling';
  stateTimer = 0;
  stateDuration = 0;

  // Circling parameters
  private circleAngle = 0;
  private circleRadius = 35;
  private circleCenter = new THREE.Vector3();
  private circleAltitude = 0;

  // Dive target
  private diveTarget = new THREE.Vector3();

  constructor(position: THREE.Vector3) {
    this.position = position.clone();
    this.velocity = new THREE.Vector3(15, 0, 0);
    this.enterCircling(position);
  }

  private enterCircling(flockCenter: THREE.Vector3): void {
    this.state = 'circling';
    this.stateTimer = 0;
    this.stateDuration = 8 + Math.random() * 7; // 8-15 seconds
    this.circleCenter.copy(flockCenter);
    this.circleAltitude = flockCenter.y + 20 + Math.random() * 10;
    // Start angle from current position relative to circle center
    this.circleAngle = Math.atan2(
      this.position.z - this.circleCenter.z,
      this.position.x - this.circleCenter.x,
    );
  }

  private enterDiving(flockCenter: THREE.Vector3): void {
    this.state = 'diving';
    this.stateTimer = 0;
    this.stateDuration = 2 + Math.random(); // 2-3 seconds
    this.diveTarget.copy(flockCenter);
  }

  private enterClimbing(): void {
    this.state = 'climbing';
    this.stateTimer = 0;
    this.stateDuration = 3 + Math.random() * 2; // 3-5 seconds
  }

  update(dt: number, flockCenter: THREE.Vector3): void {
    this.stateTimer += dt;

    switch (this.state) {
      case 'circling':
        this.updateCircling(dt, flockCenter);
        if (this.stateTimer >= this.stateDuration) {
          this.enterDiving(flockCenter);
        }
        break;

      case 'diving':
        this.updateDiving(dt);
        if (this.stateTimer >= this.stateDuration) {
          this.enterClimbing();
        }
        break;

      case 'climbing':
        this.updateClimbing(dt, flockCenter);
        if (this.stateTimer >= this.stateDuration) {
          this.enterCircling(flockCenter);
        }
        break;
    }

    // Update heading quaternion from velocity
    const speed = this.velocity.length();
    if (speed > 0.1) {
      _tempVec.copy(this.position).add(this.velocity);
      _lookMatrix.lookAt(this.position, _tempVec, _up);
      this.heading.setFromRotationMatrix(_lookMatrix);
    }
  }

  private updateCircling(dt: number, flockCenter: THREE.Vector3): void {
    // Slowly drift circle center toward flock
    this.circleCenter.lerp(flockCenter, 0.3 * dt);

    const angularSpeed = 0.4; // radians per second
    this.circleAngle += angularSpeed * dt;

    const targetX = this.circleCenter.x + Math.cos(this.circleAngle) * this.circleRadius;
    const targetZ = this.circleCenter.z + Math.sin(this.circleAngle) * this.circleRadius;
    const altitudeBob = Math.sin(this.stateTimer * 0.5) * 3;
    const targetY = this.circleAltitude + altitudeBob;

    // Steer toward circle position
    _tempVec.set(targetX, targetY, targetZ).sub(this.position);
    const desired = _tempVec.normalize().multiplyScalar(15);

    this.velocity.lerp(desired, 3 * dt);

    // Move
    _tempVec.copy(this.velocity).multiplyScalar(dt);
    this.position.add(_tempVec);
  }

  private updateDiving(dt: number): void {
    // Accelerate toward dive target
    const t = this.stateTimer / this.stateDuration; // 0 to 1

    _tempVec.copy(this.diveTarget).sub(this.position);
    const dist = _tempVec.length();

    // Speed ramps up during dive
    const speed = 30 + t * 30; // 30 to 60
    if (dist > 1) {
      const desired = _tempVec.normalize().multiplyScalar(speed);
      this.velocity.lerp(desired, 5 * dt);
    }

    // Move
    _tempVec.copy(this.velocity).multiplyScalar(dt);
    this.position.add(_tempVec);
  }

  private updateClimbing(dt: number, flockCenter: THREE.Vector3): void {
    const t = this.stateTimer / this.stateDuration;

    // Pull up and away from flock, decelerating
    _tempVec.copy(this.position).sub(flockCenter).setY(0);
    if (_tempVec.length() < 0.1) _tempVec.set(1, 0, 0);
    _tempVec.normalize();

    // Climb direction: away from flock center + upward
    const speed = 40 * (1 - t * 0.6); // decelerate from 40 to ~16
    const desired = new THREE.Vector3(
      _tempVec.x * speed * 0.7,
      speed * 0.5,
      _tempVec.z * speed * 0.7,
    );

    this.velocity.lerp(desired, 2 * dt);

    // Move
    _tempVec.copy(this.velocity).multiplyScalar(dt);
    this.position.add(_tempVec);
  }
}
