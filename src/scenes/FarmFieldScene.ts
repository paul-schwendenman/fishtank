import type { Scene } from '../engine/GameLoop';
import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import { Cow } from '../entities/Cow';
import { COW_VARIETIES } from '../entities/CowVariety';
import { Butterfly } from '../entities/Butterfly';
import { FenceBird } from '../entities/FenceBird';
import { Swallow } from '../entities/Swallow';
import { FarmFieldRenderer } from '../rendering/FarmFieldRenderer';
import { renderCow } from '../rendering/CowRenderer';
import { renderButterfly } from '../rendering/ButterflyRenderer';
import { renderFenceBird } from '../rendering/FenceBirdRenderer';
import { renderSwallow } from '../rendering/SwallowRenderer';
import {
  avoidFieldEdge,
  avoidPond,
  cowSeparation,
} from '../behaviors/FarmSteering';

const COW_COUNT = 6;
const BUTTERFLY_COUNT = 3;
const BIRD_COUNT = 2;
const COW_SEPARATION_RADIUS = 80;

export class FarmFieldScene implements Scene {
  private width: number;
  private height: number;
  private cows: Cow[] = [];
  private butterflies: Butterfly[] = [];
  private birds: FenceBird[] = [];
  private swallow: Swallow;
  private environment: FarmFieldRenderer;
  private time: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.environment = new FarmFieldRenderer(width, height);
    this.swallow = new Swallow(width, height);
    this.spawnCows();
    this.spawnButterflies();
    this.spawnBirds();
  }

  private spawnCows(): void {
    let spawnDelay = 0;
    for (let i = 0; i < COW_COUNT; i++) {
      const variety = COW_VARIETIES[i % COW_VARIETIES.length]!;
      const x = randomRange(this.width * 0.1, this.width * 0.9);
      const y = this.environment.groundY(x);
      const cow = new Cow(variety, new Vector(x, y), spawnDelay);
      // Assign depth based on y position relative to fence line
      cow.depth = 0;
      spawnDelay += randomRange(0.3, 0.8);
      this.cows.push(cow);
    }
    this.assignCowDepths();
  }

  private assignCowDepths(): void {
    for (const cow of this.cows) {
      // Place roughly half in the back field, half in the fore field
      if (Math.random() < 0.35) {
        // Back cow — place in back field area
        const x = cow.position.x;
        const backY = randomRange(
          this.environment.horizonY + (this.environment.fenceY - this.environment.horizonY) * 0.2,
          this.environment.horizonY + (this.environment.fenceY - this.environment.horizonY) * 0.5,
        );
        cow.position = new Vector(x, backY);
        cow.depth = 0.7 + Math.random() * 0.3; // far away
      } else {
        // Front cow — place in fore field area
        const x = cow.position.x;
        const foreY = randomRange(
          this.environment.fenceY + 15,
          this.environment.fenceY + (this.height - this.environment.fenceY) * 0.5,
        );
        cow.position = new Vector(x, foreY);
        cow.depth = Math.random() * 0.4; // closer
      }
    }
  }

  private spawnButterflies(): void {
    for (let i = 0; i < BUTTERFLY_COUNT; i++) {
      const x = randomRange(this.width * 0.1, this.width * 0.9);
      const y = randomRange(this.environment.fenceY + 10, this.environment.fenceY + (this.height - this.environment.fenceY) * 0.5);
      this.butterflies.push(new Butterfly(new Vector(x, y)));
    }
  }

  private spawnBirds(): void {
    const posts = this.environment.postPositions;
    if (posts.length < 2) return;
    for (let i = 0; i < BIRD_COUNT; i++) {
      const idx = Math.floor(Math.random() * posts.length);
      const post = posts[idx]!;
      this.birds.push(new FenceBird(post.x, post.y, idx));
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.environment.resize(width, height);
    this.swallow.resize(width, height);
  }

  update(dt: number): void {
    this.time += dt;

    // Clouds drift
    this.environment.updateClouds(dt);

    // Update cows
    const fieldBounds = { minX: 20, maxX: this.width - 20 };
    for (const cow of this.cows) {
      cow.update(dt);

      // Apply steering only when walking
      if (cow.state === 'walking') {
        const edgeForce = avoidFieldEdge(cow, fieldBounds);
        const pondForce = avoidPond(cow, this.environment.pondBounds);
        const sepForce = cowSeparation(cow, this.cows, COW_SEPARATION_RADIUS);

        // Apply forces to velocity
        const steer = edgeForce.add(pondForce).add(sepForce);
        if (steer.mag() > 0.5) {
          cow.velocity = cow.velocity.add(steer.scale(dt));
          cow.position = cow.position.add(steer.scale(dt));

          // If edge force is strong, turn around
          if (edgeForce.mag() > 5) {
            cow.facingRight = edgeForce.x > 0;
            cow.heading = cow.facingRight ? 0 : Math.PI;
          }
        }
      }

      // Snap front cows to ground terrain
      if (cow.depth < 0.5) {
        const baseY = this.environment.fenceY + 15 + (1 - cow.depth) * (this.height - this.environment.fenceY) * 0.3;
        const terrainY = baseY + (this.environment.groundY(cow.position.x) - this.environment.fenceY);
        cow.position = new Vector(cow.position.x, terrainY);
      }
    }

    // Group dynamics: contagious resting/walking
    this.contagionCheck(dt);

    // Update butterflies
    const butterflyBounds = {
      minX: 20,
      maxX: this.width - 20,
      minY: this.environment.fenceY,
      maxY: this.height - 30,
    };
    for (const b of this.butterflies) {
      b.update(dt, butterflyBounds);
    }

    // Update birds
    for (const bird of this.birds) {
      bird.update(dt, this.environment.postPositions);
    }

    // Update swallow
    this.swallow.update(dt);
  }

  private contagionCheck(dt: number): void {
    // Small chance per second for nearby cows to match behavior
    for (const cow of this.cows) {
      if (cow.state !== 'grazing' && cow.state !== 'standing') continue;

      for (const other of this.cows) {
        if (other === cow) continue;
        const d = cow.position.dist(other.position);
        if (d > 200) continue;

        if (other.state === 'resting' && cow.state === 'standing' && Math.random() < 0.02 * dt) {
          cow.state = 'resting';
          cow.stateTimer = randomRange(30, 90);
        }
        if (other.state === 'walking' && cow.state === 'grazing' && Math.random() < 0.01 * dt) {
          cow.state = 'walking';
          cow.stateTimer = randomRange(5, 15);
          cow.facingRight = other.facingRight;
          cow.heading = other.heading;
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sky
    this.environment.renderSky(ctx);

    // 2. Clouds
    this.environment.renderClouds(ctx, this.time);

    // 3. Distant hills
    this.environment.renderDistantHills(ctx);

    // 4. Far trees
    this.environment.renderFarTrees(ctx);

    // 5. Back field
    this.environment.renderBackField(ctx);

    // 5b. Mid trees
    this.environment.renderMidTrees(ctx);

    // 6. Back cows (depth > 0.5)
    const backCows = this.cows.filter(c => c.depth > 0.5);
    backCows.sort((a, b) => b.depth - a.depth);
    for (const cow of backCows) {
      renderCow(ctx, cow, this.time);
    }

    // 7. Mid field
    this.environment.renderMidField(ctx);

    // 8. Pond
    this.environment.renderPond(ctx, this.time);

    // 9. Fence
    this.environment.renderFence(ctx);

    // 10. Main cows (depth <= 0.5), sorted by depth
    const frontCows = this.cows.filter(c => c.depth <= 0.5);
    frontCows.sort((a, b) => b.depth - a.depth);
    for (const cow of frontCows) {
      renderCow(ctx, cow, this.time);
    }

    // 11. Fore field + wildflowers
    this.environment.renderForeField(ctx, this.time);

    // 12. Birds + butterflies + swallow
    for (const bird of this.birds) {
      renderFenceBird(ctx, bird);
    }
    for (const b of this.butterflies) {
      renderButterfly(ctx, b);
    }
    renderSwallow(ctx, this.swallow);

    // 13. Fore grass
    this.environment.renderForeGrass(ctx, this.time);
  }
}
