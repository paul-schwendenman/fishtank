import type { Scene } from '../engine/GameLoop';
import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import { Cow, type CowState } from '../entities/Cow';
import { COW_VARIETIES } from '../entities/CowVariety';
import { Butterfly } from '../entities/Butterfly';
import { FenceBird } from '../entities/FenceBird';
import { Swallow } from '../entities/Swallow';
import { FarmFieldRenderer, type MidTree } from '../rendering/FarmFieldRenderer';
import { renderCow } from '../rendering/CowRenderer';
import { renderButterfly } from '../rendering/ButterflyRenderer';
import { renderFenceBird } from '../rendering/FenceBirdRenderer';
import { renderSwallow } from '../rendering/SwallowRenderer';
import {
  avoidFieldEdge,
  avoidPond,
  cowSeparation,
} from '../behaviors/FarmSteering';

const COW_COUNT = 18;
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
    const initialStates: { state: CowState; timer: number }[] = [
      { state: 'grazing', timer: randomRange(5, 15) },
      { state: 'walking', timer: randomRange(4, 10) },
      { state: 'grazing', timer: randomRange(8, 20) },
      { state: 'standing', timer: randomRange(5, 12) },
      { state: 'resting', timer: randomRange(15, 40) },
      { state: 'grazing', timer: randomRange(3, 10) },
      { state: 'headUp', timer: randomRange(3, 6) },
      { state: 'grazing', timer: randomRange(10, 25) },
      { state: 'resting', timer: randomRange(20, 50) },
    ];

    let spawnDelay = 0;
    for (let i = 0; i < COW_COUNT; i++) {
      const variety = COW_VARIETIES[i % COW_VARIETIES.length]!;
      const x = randomRange(this.width * 0.1, this.width * 0.9);
      const y = this.environment.groundY(x);
      const cow = new Cow(variety, new Vector(x, y), spawnDelay);
      cow.depth = 0;

      // Diversify initial states
      const init = initialStates[i % initialStates.length]!;
      cow.state = init.state;
      cow.stateTimer = init.timer;
      if (init.state === 'resting') {
        cow.lyingTransition = 1; // already lying
      }

      spawnDelay += randomRange(0.1, 0.3);
      this.cows.push(cow);
    }
    this.assignCowDepths();
  }

  private assignCowDepths(): void {
    const fieldTop = this.environment.horizonY + (this.environment.fenceY - this.environment.horizonY) * 0.15;

    for (const cow of this.cows) {
      const x = cow.position.x;
      const fieldBottom = this.environment.groundY(x) - 15;
      // Bias toward back (fieldTop) — exponent >1 clusters toward 0 (top/back)
      const t = Math.pow(Math.random(), 2);
      const y = fieldTop + t * (fieldBottom - fieldTop);
      cow.position = new Vector(x, y);
      this.pushOutOfPond(cow);
      this.updateCowDepth(cow);
    }
  }

  private updateCowDepth(cow: Cow): void {
    const fieldTop = this.environment.horizonY + (this.environment.fenceY - this.environment.horizonY) * 0.15;
    const fieldBottom = this.environment.groundY(cow.position.x) - 15;
    const range = fieldBottom - fieldTop;
    cow.depth = range > 0 ? 1 - (cow.position.y - fieldTop) / range : 0.5;
  }

  private pushOutOfPond(cow: Cow): void {
    const pond = this.environment.pondBounds;
    if (!pond) return;

    const margin = 25;
    const dx = cow.position.x - pond.cx;
    const dy = cow.position.y - pond.cy;
    const ndx = dx / (pond.rx + margin);
    const ndy = dy / (pond.ry + margin);
    const dist = Math.sqrt(ndx * ndx + ndy * ndy);

    if (dist < 1) {
      // Push to nearest edge of exclusion zone
      const angle = Math.atan2(dy, dx);
      cow.position = new Vector(
        pond.cx + Math.cos(angle) * (pond.rx + margin + 5),
        pond.cy + Math.sin(angle) * (pond.ry + margin + 5),
      );
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

      // Keep cows out of pond and within field bounds
      this.pushOutOfPond(cow);

      const fieldTop = this.environment.horizonY + (this.environment.fenceY - this.environment.horizonY) * 0.15;
      const fieldBottom = this.environment.groundY(cow.position.x) - 15;
      const clampedY = Math.max(fieldTop, Math.min(fieldBottom, cow.position.y));
      if (clampedY !== cow.position.y) {
        cow.position = new Vector(cow.position.x, clampedY);
      }

      this.updateCowDepth(cow);
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
      bird.update(dt, this.environment.postPositions, this.environment.fencePosts);
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

    // 6. Mid field
    this.environment.renderMidField(ctx);

    // 7. All cows + mid trees + pond interleaved by y-position
    const fieldItems: { y: number; type: 'cow' | 'tree' | 'pond'; cow?: Cow; tree?: MidTree }[] = [];
    for (const cow of this.cows) {
      fieldItems.push({ y: cow.position.y, type: 'cow', cow });
    }
    for (const tree of this.environment.midTrees) {
      fieldItems.push({ y: tree.y, type: 'tree', tree });
    }
    if (this.environment.pondBounds) {
      fieldItems.push({ y: this.environment.pondBounds.cy, type: 'pond' });
    }
    fieldItems.sort((a, b) => a.y - b.y);
    for (const item of fieldItems) {
      if (item.type === 'tree') {
        this.environment.renderMidTree(ctx, item.tree!);
      } else if (item.type === 'pond') {
        this.environment.renderPond(ctx, this.time);
      } else {
        renderCow(ctx, item.cow!, this.time);
      }
    }

    // 8. Fence
    this.environment.renderFence(ctx);

    // 9. Fore field + wildflowers
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
