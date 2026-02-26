import type { Scene } from '../engine/GameLoop';
import { randomRange } from '../utils/math';
import { Crab } from '../entities/Crab';
import { Starfish } from '../entities/Starfish';
import { Goby } from '../entities/Goby';
import {
  type TidePoolBounds,
  generateLobes,
  randomPointInPool,
} from '../behaviors/TidePoolSteering';
import { TidePoolRenderer } from '../rendering/TidePoolRenderer';
import { renderCrab } from '../rendering/CrabRenderer';
import { renderStarfish } from '../rendering/StarfishRenderer';
import { renderGoby } from '../rendering/GobyRenderer';

const POOL_MARGIN = 80;
const CRAB_COUNT = 4;
const STARFISH_COUNT = 3;
const GOBY_COUNT = 5;

export class TidePoolScene implements Scene {
  private width: number;
  private height: number;
  private bounds: TidePoolBounds;
  private lobes: number[];
  private crabs: Crab[] = [];
  private starfish: Starfish[] = [];
  private gobies: Goby[] = [];
  private environment: TidePoolRenderer;
  private time: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.lobes = generateLobes(64);
    this.bounds = this.computeBounds();
    this.environment = new TidePoolRenderer(this.bounds);
    this.spawnCrabs();
    this.spawnStarfish();
    this.spawnGobies();
  }

  private computeBounds(): TidePoolBounds {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseRx = this.width / 2 - POOL_MARGIN;
    const baseRy = this.height / 2 - POOL_MARGIN;
    return { cx, cy, baseRx, baseRy, lobes: this.lobes };
  }

  private spawnCrabs(): void {
    let delay = 0;
    for (let i = 0; i < CRAB_COUNT; i++) {
      const pos = randomPointInPool(this.bounds, 0.6);
      const crab = new Crab(pos, delay);
      delay += randomRange(0.3, 0.6);
      this.crabs.push(crab);
    }
  }

  private spawnStarfish(): void {
    let delay = 0;
    for (let i = 0; i < STARFISH_COUNT; i++) {
      const pos = randomPointInPool(this.bounds, 0.7);
      const sf = new Starfish(pos, delay);
      delay += randomRange(0.3, 0.6);
      this.starfish.push(sf);
    }
  }

  private spawnGobies(): void {
    let delay = 0;
    for (let i = 0; i < GOBY_COUNT; i++) {
      const pos = randomPointInPool(this.bounds, 0.6);
      const goby = new Goby(pos, delay);
      delay += randomRange(0.2, 0.4);
      this.gobies.push(goby);
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.bounds = this.computeBounds();
    this.environment.resize(this.bounds);
  }

  update(dt: number): void {
    this.time += dt;

    for (const crab of this.crabs) {
      crab.update(dt, this.bounds);
    }

    for (const sf of this.starfish) {
      sf.update(dt, this.bounds);
    }

    for (const goby of this.gobies) {
      goby.update(dt, this.bounds);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Background — warm rocky surface
    this.environment.renderBackground(ctx, this.width, this.height);

    // 2. Pool water fill
    this.environment.renderPoolWater(ctx);

    // 3. Caustics
    this.environment.renderCaustics(ctx, this.time);

    // 4. Pebbles + shells
    this.environment.renderPebbles(ctx);

    // 5. Seaweed fronds
    this.environment.renderSeaweed(ctx, this.time);

    // 6. Anemones
    this.environment.renderAnemones(ctx, this.time);

    // 7. Sea urchins
    this.environment.renderUrchins(ctx, this.time);

    // 8. Starfish
    for (const sf of this.starfish) {
      renderStarfish(ctx, sf);
    }

    // 9. Crabs
    for (const crab of this.crabs) {
      renderCrab(ctx, crab);
    }

    // 10. Gobies
    for (const goby of this.gobies) {
      renderGoby(ctx, goby);
    }

    // 11. Water surface shimmer
    this.environment.renderWaterShimmer(ctx, this.time);

    // 12. Pool edge rocks
    this.environment.renderEdgeRocks(ctx);

    // 13. Barnacles
    this.environment.renderBarnacles(ctx);
  }
}
