import type { Scene } from '../engine/GameLoop';
import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import { Firefly } from '../entities/Firefly';
import { FIREFLY_VARIETIES } from '../entities/FireflyVariety';
import { Owl } from '../entities/Owl';
import { Bat } from '../entities/Bat';
import {
  fireflyWander,
  avoidBoundaries,
  fireflySeparation,
  gentleBreeze,
} from '../behaviors/FireflySteering';
import {
  composeForceBudget,
  PRIORITY_BOUNDARY,
  PRIORITY_SEPARATION,
  PRIORITY_WANDER,
} from '../behaviors/ForceBudget';
import { SpatialHash } from '../spatial/SpatialHash';
import { FireflyFieldRenderer } from '../rendering/FireflyFieldRenderer';
import { renderFirefly, renderOwl, renderBat } from '../rendering/FireflyRenderer';

const FIREFLY_COUNT = 40;
const SEPARATION_RADIUS = 50;
const OFFSCREEN_MARGIN = 100;

export class FireflyFieldScene implements Scene {
  private width: number;
  private height: number;
  private grassLineY: number;
  private fireflies: Firefly[] = [];
  private owl: Owl;
  private bats: Bat[] = [];
  private environment: FireflyFieldRenderer;
  private time: number = 0;
  private spatialHash = new SpatialHash<Firefly>(80);

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grassLineY = height * 0.82;
    this.environment = new FireflyFieldRenderer(width, height);
    this.owl = new Owl(width, height);
    for (let i = 0; i < 3; i++) {
      this.bats.push(new Bat(width, height));
    }
    this.spawnInitialFireflies();
  }

  private spawnInitialFireflies(): void {
    let spawnDelay = 0;
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      const variety = FIREFLY_VARIETIES[i % FIREFLY_VARIETIES.length]!;
      const pos = new Vector(
        randomRange(this.width * 0.05, this.width * 0.95),
        randomRange(this.height * 0.2, this.grassLineY - 20),
      );
      const fly = new Firefly(variety, pos);
      fly.spawnOpacity = -spawnDelay;
      spawnDelay += randomRange(0.1, 0.3);
      this.fireflies.push(fly);
    }
  }

  private spawnFromEdge(variety: typeof FIREFLY_VARIETIES[number]): Firefly {
    const edge = Math.floor(Math.random() * 4);
    let pos: Vector;

    switch (edge) {
      case 0: // top
        pos = new Vector(randomRange(0, this.width), this.height * 0.15 - 20);
        break;
      case 1: // bottom
        pos = new Vector(randomRange(0, this.width), this.grassLineY + 20);
        break;
      case 2: // left
        pos = new Vector(-20, randomRange(this.height * 0.2, this.grassLineY - 20));
        break;
      default: // right
        pos = new Vector(this.width + 20, randomRange(this.height * 0.2, this.grassLineY - 20));
        break;
    }

    const fly = new Firefly(variety, pos);
    fly.spawnOpacity = -randomRange(0, 0.5);
    return fly;
  }

  private isOffscreen(fly: Firefly): boolean {
    return (
      fly.position.x < -OFFSCREEN_MARGIN ||
      fly.position.x > this.width + OFFSCREEN_MARGIN ||
      fly.position.y < -OFFSCREEN_MARGIN ||
      fly.position.y > this.height + OFFSCREEN_MARGIN
    );
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.grassLineY = height * 0.82;
    this.environment.resize(width, height);
    this.owl.resize(width, height);
    for (const bat of this.bats) {
      bat.resize(width, height);
    }
  }

  update(dt: number): void {
    this.time += dt;

    const breeze = gentleBreeze(this.time);

    // Rebuild spatial hash
    this.spatialHash.clear();
    for (const fly of this.fireflies) {
      this.spatialHash.insert(fly, fly.position.x, fly.position.y);
    }

    // Update fireflies
    for (const fly of this.fireflies) {
      const neighbors = this.spatialHash.query(
        fly.position.x,
        fly.position.y,
        SEPARATION_RADIUS,
      );

      const sepForce = fireflySeparation(fly, neighbors, SEPARATION_RADIUS);
      const boundForce = avoidBoundaries(fly, this.width, this.height, this.grassLineY);
      const wandForce = fireflyWander(fly);

      const resultForce = composeForceBudget(
        [
          { force: boundForce, priority: PRIORITY_BOUNDARY },
          { force: sepForce, priority: PRIORITY_SEPARATION },
          { force: wandForce, priority: PRIORITY_WANDER },
        ],
        fly.maxForce * 3,
      );

      fly.applyForce(resultForce);
      fly.applyForce(breeze.scale(0.1));
      fly.update(dt);
    }

    // Recycle offscreen fireflies
    for (let i = 0; i < this.fireflies.length; i++) {
      const fly = this.fireflies[i]!;
      if (fly.spawnOpacity >= 0 && this.isOffscreen(fly)) {
        this.fireflies[i] = this.spawnFromEdge(
          FIREFLY_VARIETIES[i % FIREFLY_VARIETIES.length]!,
        );
      }
    }

    // Update owl & bats
    this.owl.update(dt);
    for (const bat of this.bats) {
      bat.update(dt);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sky gradient
    this.environment.renderSky(ctx, this.width, this.height);

    // 2. Stars
    this.environment.renderStars(ctx, this.time);

    // 3. Moon + glow
    this.environment.renderMoon(ctx, this.width, this.height);

    // 4. Distant treeline/hills
    this.environment.renderTreeline(ctx, this.width, this.height);

    // 5. Owl silhouette
    renderOwl(ctx, this.owl);

    // 6. Bats
    for (const bat of this.bats) {
      renderBat(ctx, bat);
    }

    // 7. Distant fireflies (depth > 0.5) — behind grass
    const sorted = [...this.fireflies].sort((a, b) => b.depth - a.depth);
    for (const fly of sorted) {
      if (fly.depth > 0.5) {
        renderFirefly(ctx, fly, this.time);
      }
    }

    // 8. Foreground grass
    this.environment.renderGrass(ctx, this.width, this.height, this.grassLineY, this.time);

    // 9. Ground fog
    this.environment.renderFog(ctx, this.width, this.time);

    // 10. Near fireflies (depth <= 0.5) — glow on top of everything
    for (const fly of sorted) {
      if (fly.depth <= 0.5) {
        renderFirefly(ctx, fly, this.time);
      }
    }

    // 11. Vignette
    this.environment.renderVignette(ctx, this.width, this.height);
  }
}
