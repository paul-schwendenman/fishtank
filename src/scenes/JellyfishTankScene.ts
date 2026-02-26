import type { Scene } from '../engine/GameLoop';
import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import { Jellyfish } from '../entities/Jellyfish';
import { JELLYFISH_VARIETIES } from '../entities/JellyfishVariety';
import {
  jellyfishWander,
  ambientCurrent,
  avoidBoundaries,
  jellyfishSeparation,
  type RectBounds,
} from '../behaviors/JellyfishSteering';
import {
  composeForceBudget,
  type PrioritizedForce,
  PRIORITY_BOUNDARY,
  PRIORITY_SEPARATION,
} from '../behaviors/ForceBudget';
import { SpatialHash } from '../spatial/SpatialHash';
import { JellyfishTankRenderer } from '../rendering/JellyfishTankRenderer';
import { renderJellyfish } from '../rendering/JellyfishRenderer';

const JELLYFISH_COUNT = 7;
const SEPARATION_RADIUS = 80;

export class JellyfishTankScene implements Scene {
  private width: number;
  private height: number;
  private bounds: RectBounds;
  private jellyfish: Jellyfish[] = [];
  private environment: JellyfishTankRenderer;
  private time: number = 0;
  private spatialHash = new SpatialHash<Jellyfish>(120);

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.bounds = this.computeBounds();
    this.environment = new JellyfishTankRenderer(width, height);
    this.spawnJellyfish();
  }

  private computeBounds(): RectBounds {
    return { x: 0, y: 0, width: this.width, height: this.height };
  }

  private spawnJellyfish(): void {
    let spawnDelay = 0;
    for (let i = 0; i < JELLYFISH_COUNT; i++) {
      const variety = JELLYFISH_VARIETIES[i % JELLYFISH_VARIETIES.length]!;
      const pos = new Vector(
        randomRange(this.width * 0.15, this.width * 0.85),
        randomRange(this.height * 0.15, this.height * 0.85),
      );
      const jelly = new Jellyfish(variety, pos);
      jelly.spawnOpacity = -spawnDelay;
      spawnDelay += randomRange(0.4, 0.8);
      this.jellyfish.push(jelly);
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.bounds = this.computeBounds();
    this.environment.resize(width, height);
  }

  update(dt: number): void {
    this.time += dt;

    const current = ambientCurrent(this.time);

    // Rebuild spatial hash
    this.spatialHash.clear();
    for (const jelly of this.jellyfish) {
      this.spatialHash.insert(jelly, jelly.position.x, jelly.position.y);
    }

    // Update jellyfish
    for (const jelly of this.jellyfish) {
      const forces: PrioritizedForce[] = [];
      const budget = jelly.maxForce * 3;

      // Boundary avoidance (highest priority)
      forces.push({
        force: avoidBoundaries(jelly, this.bounds),
        priority: PRIORITY_BOUNDARY,
      });

      // Separation
      const neighbors = this.spatialHash.query(
        jelly.position.x,
        jelly.position.y,
        SEPARATION_RADIUS,
      );
      forces.push({
        force: jellyfishSeparation(jelly, neighbors, SEPARATION_RADIUS),
        priority: PRIORITY_SEPARATION,
      });

      const resultForce = composeForceBudget(forces, budget);
      jelly.applyForce(resultForce);

      // Wander + ambient current applied directly (outside budget)
      jelly.applyForce(jellyfishWander(jelly));
      jelly.applyForce(current.scale(0.15));

      jelly.update(dt);
    }

    // Update plankton with current influence
    this.environment.updatePlankton(dt, current);
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Dark background (color-cycling gradient)
    this.environment.renderBackground(ctx, this.width, this.height, this.time);

    // 2. Ambient light wash
    this.environment.renderAmbientLight(ctx, this.width, this.height, this.time);

    // 3. Caustics
    this.environment.renderCaustics(ctx, this.time);

    // 4. Plankton particles
    this.environment.renderPlankton(ctx, this.time);

    // 5. Jellyfish (depth-sorted, deepest first)
    const sorted = [...this.jellyfish].sort((a, b) => b.depth - a.depth);
    for (const jelly of sorted) {
      renderJellyfish(ctx, jelly, this.time);
    }

    // 6. Vignette overlay
    this.environment.renderVignette(ctx, this.width, this.height);
  }
}
