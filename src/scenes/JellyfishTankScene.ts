import type { Scene } from '../engine/GameLoop';
import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import { Jellyfish } from '../entities/Jellyfish';
import { JELLYFISH_VARIETIES } from '../entities/JellyfishVariety';
import {
  jellyfishWander,
  ambientCurrent,
  jellyfishSeparation,
} from '../behaviors/JellyfishSteering';
import {
  composeForceBudget,
  PRIORITY_SEPARATION,
} from '../behaviors/ForceBudget';
import { SpatialHash } from '../spatial/SpatialHash';
import { JellyfishTankRenderer } from '../rendering/JellyfishTankRenderer';
import { renderJellyfish } from '../rendering/JellyfishRenderer';

const JELLYFISH_COUNT = 14;
const SEPARATION_RADIUS = 80;
// How far offscreen before recycling
const OFFSCREEN_MARGIN = 200;

export class JellyfishTankScene implements Scene {
  private width: number;
  private height: number;
  private jellyfish: Jellyfish[] = [];
  private environment: JellyfishTankRenderer;
  private time: number = 0;
  private spatialHash = new SpatialHash<Jellyfish>(120);

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.environment = new JellyfishTankRenderer(width, height);
    this.spawnInitialJellyfish();
  }

  private spawnInitialJellyfish(): void {
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

  /** Spawn a jellyfish at a random edge, heading inward */
  private spawnFromEdge(variety: typeof JELLYFISH_VARIETIES[number]): Jellyfish {
    const edge = Math.floor(Math.random() * 4);
    let pos: Vector;
    let heading: number;

    switch (edge) {
      case 0: // top
        pos = new Vector(randomRange(0, this.width), -OFFSCREEN_MARGIN * 0.5);
        heading = randomRange(Math.PI * 0.1, Math.PI * 0.4);
        break;
      case 1: // bottom
        pos = new Vector(randomRange(0, this.width), this.height + OFFSCREEN_MARGIN * 0.5);
        heading = randomRange(-Math.PI * 0.4, -Math.PI * 0.1);
        break;
      case 2: // left
        pos = new Vector(-OFFSCREEN_MARGIN * 0.5, randomRange(0, this.height));
        heading = randomRange(-Math.PI * 0.3, Math.PI * 0.3);
        break;
      default: // right
        pos = new Vector(this.width + OFFSCREEN_MARGIN * 0.5, randomRange(0, this.height));
        heading = randomRange(Math.PI * 0.7, Math.PI * 1.3);
        break;
    }

    const jelly = new Jellyfish(variety, pos);
    jelly.heading = heading;
    jelly.velocity = jelly.thrustDirection().scale(randomRange(3, 6));
    jelly.spawnOpacity = -randomRange(0, 0.5);
    return jelly;
  }

  private isOffscreen(jelly: Jellyfish): boolean {
    return (
      jelly.position.x < -OFFSCREEN_MARGIN ||
      jelly.position.x > this.width + OFFSCREEN_MARGIN ||
      jelly.position.y < -OFFSCREEN_MARGIN ||
      jelly.position.y > this.height + OFFSCREEN_MARGIN
    );
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
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
      // Separation
      const neighbors = this.spatialHash.query(
        jelly.position.x,
        jelly.position.y,
        SEPARATION_RADIUS,
      );
      const sepForce = jellyfishSeparation(jelly, neighbors, SEPARATION_RADIUS);
      const resultForce = composeForceBudget(
        [{ force: sepForce, priority: PRIORITY_SEPARATION }],
        jelly.maxForce * 3,
      );
      jelly.applyForce(resultForce);

      // Wander + ambient current only while thrusting
      if (jelly.contracting) {
        jelly.applyForce(jellyfishWander(jelly));
        jelly.applyForce(current.scale(0.15));
      }

      jelly.update(dt);
    }

    // Recycle offscreen jellyfish — replace with new one from a random edge
    for (let i = 0; i < this.jellyfish.length; i++) {
      const jelly = this.jellyfish[i]!;
      if (jelly.spawnOpacity >= 0 && this.isOffscreen(jelly)) {
        this.jellyfish[i] = this.spawnFromEdge(
          JELLYFISH_VARIETIES[i % JELLYFISH_VARIETIES.length]!,
        );
      }
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
