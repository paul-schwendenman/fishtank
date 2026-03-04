import * as THREE from 'three';
import type { Scene } from '../engine/GameLoop';
import { Boid } from '../entities/Boid';
import {
  separation,
  alignment,
  cohesion,
  avoidBoundary,
  migration,
  verticalPreference,
  wander3D,
  composeForceBudget3D,
} from '../behaviors/MurmurationSteering';
import { SpatialHash3D } from '../spatial/SpatialHash3D';
import { MurmurationRenderer } from '../rendering/MurmurationRenderer';

const BOID_COUNT = 400;
const PERCEPTION_RADIUS = 20;
const SEPARATION_RADIUS = 6;
const BOUNDARY_RADIUS = 120;
const PREFERRED_ALTITUDE = 50;

// Migration waypoints — a large loop through the sky near the camera.
// Y is altitude, X/Z are horizontal. Camera is at origin.
const WAYPOINTS: THREE.Vector3[] = [
  new THREE.Vector3(-30, 55, -60),   // left, high, behind
  new THREE.Vector3(-60, 45, -20),   // far left, sweep past
  new THREE.Vector3(-40, 60, 30),    // left, high, in front
  new THREE.Vector3(0, 40, 50),      // center, close pass overhead
  new THREE.Vector3(40, 55, 30),     // right, high
  new THREE.Vector3(60, 50, -20),    // far right
  new THREE.Vector3(30, 65, -60),    // right, high, behind
  new THREE.Vector3(0, 70, -80),     // center, distant, high
];

export class MurmurationScene implements Scene {
  private width: number;
  private height: number;
  private boids: Boid[] = [];
  private renderer3D: MurmurationRenderer;
  private spatialHash = new SpatialHash3D<Boid>(20);

  // Migration state
  private waypointIndex = 0;
  private waypointT = 0;             // interpolation between current and next waypoint
  private migrationTarget = new THREE.Vector3();
  private migrationSpeed = 0.06;     // how fast the target moves along the path
  private lastDt = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer3D = new MurmurationRenderer(width, height, BOID_COUNT);

    // Compute initial migration target
    this.updateMigrationTarget();

    // Spawn boids in a loose cloud near first waypoint
    const spawnCenter = WAYPOINTS[0]!;
    for (let i = 0; i < BOID_COUNT; i++) {
      const pos = new THREE.Vector3(
        spawnCenter.x + (Math.random() - 0.5) * 30,
        spawnCenter.y + (Math.random() - 0.5) * 20,
        spawnCenter.z + (Math.random() - 0.5) * 30,
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 10,
      );
      this.boids.push(new Boid(pos, vel));
    }
  }

  private updateMigrationTarget(): void {
    const current = WAYPOINTS[this.waypointIndex]!;
    const next = WAYPOINTS[(this.waypointIndex + 1) % WAYPOINTS.length]!;
    this.migrationTarget.lerpVectors(current, next, this.waypointT);
  }

  update(dt: number): void {
    this.lastDt = dt;

    // Advance migration waypoint
    this.waypointT += this.migrationSpeed * dt;
    if (this.waypointT >= 1) {
      this.waypointT -= 1;
      this.waypointIndex = (this.waypointIndex + 1) % WAYPOINTS.length;
    }
    this.updateMigrationTarget();

    // Rebuild spatial hash
    this.spatialHash.clear();
    for (const boid of this.boids) {
      this.spatialHash.insert(boid, boid.position.x, boid.position.y, boid.position.z);
    }

    // Apply steering forces
    for (const boid of this.boids) {
      const neighbors = this.spatialHash.query(
        boid.position.x,
        boid.position.y,
        boid.position.z,
        PERCEPTION_RADIUS,
      );

      const sepForce = separation(boid, neighbors, SEPARATION_RADIUS);
      const aliForce = alignment(boid, neighbors, 0.8);
      const cohForce = cohesion(boid, neighbors, 0.6, PERCEPTION_RADIUS);
      const boundForce = avoidBoundary(boid, this.migrationTarget, BOUNDARY_RADIUS);
      const migForce = migration(boid, this.migrationTarget, 0.4);
      const vertForce = verticalPreference(boid, PREFERRED_ALTITUDE, 0.15);
      const wandForce = wander3D(boid, 0.3);

      const resultForce = composeForceBudget3D(
        [
          { force: boundForce, priority: 0 },
          { force: migForce, priority: 1 },
          { force: sepForce, priority: 2 },
          { force: aliForce, priority: 3 },
          { force: cohForce, priority: 3 },
          { force: vertForce, priority: 3 },
          { force: wandForce, priority: 5 },
        ],
        boid.maxForce * 3,
      );

      boid.applyForce(resultForce);
      boid.update(dt);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Clear the 2D canvas — all rendering happens on the overlay
    ctx.clearRect(0, 0, this.width, this.height);

    // Update instanced mesh and render via Three.js
    this.renderer3D.updateBoids(this.boids, this.lastDt);
    this.renderer3D.render();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.renderer3D.resize(width, height);
  }

  destroy(): void {
    this.renderer3D.dispose();
  }
}
