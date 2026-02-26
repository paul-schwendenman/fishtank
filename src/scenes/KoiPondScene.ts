import type { Scene } from '../engine/GameLoop';
import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import { Koi, type PondBounds } from '../entities/Koi';
import { KOI_VARIETIES } from '../entities/KoiVariety';
import { Ripple } from '../entities/Ripple';
import { Frog } from '../entities/Frog';
import { Dragonfly } from '../entities/Dragonfly';
import { WaterStrider } from '../entities/WaterStrider';
import { pondWander, avoidPondEdge, koiSeparation, koiAlignment, koiCohesion, seekSurface } from '../behaviors/PondSteering';
import { composeForceBudget, type PrioritizedForce, PRIORITY_BOUNDARY, PRIORITY_SEPARATION, PRIORITY_ALIGNMENT, PRIORITY_COHESION } from '../behaviors/ForceBudget';
import { SpatialHash } from '../spatial/SpatialHash';
import { PondRenderer } from '../rendering/PondRenderer';
import { renderKoi } from '../rendering/KoiRenderer';
import { renderFrog } from '../rendering/FrogRenderer';
import { renderDragonfly } from '../rendering/DragonflyRenderer';
import { renderWaterStrider } from '../rendering/WaterStriderRenderer';

const POND_MARGIN = 60;
const KOI_COUNT = 8;
const FROG_COUNT = 3;
const DRAGONFLY_COUNT = 2;
const STRIDER_COUNT = 4;
const SEPARATION_RADIUS = 60;
const PERCEPTION_RADIUS = 150;
const MAX_RIPPLES = 30;
const RIPPLE_INTERVAL_MIN = 0.5;
const RIPPLE_INTERVAL_MAX = 1.0;
const FEEDING_CHANCE = 0.01;
const FEEDING_DURATION_MIN = 2;
const FEEDING_DURATION_MAX = 4;

export class KoiPondScene implements Scene {
  private width: number;
  private height: number;
  private bounds: PondBounds;
  private koi: Koi[] = [];
  private ripples: Ripple[] = [];
  private frogs: Frog[] = [];
  private dragonflies: Dragonfly[] = [];
  private striders: WaterStrider[] = [];
  private environment: PondRenderer;
  private time: number = 0;
  private spatialHash = new SpatialHash<Koi>(100);
  private rippleTimers: number[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.bounds = this.computeBounds();
    this.environment = new PondRenderer(this.bounds);
    this.spawnKoi();
    this.spawnFrogs();
    this.spawnDragonflies();
    this.spawnStriders();
  }

  private computeBounds(): PondBounds {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rx = this.width / 2 - POND_MARGIN;
    const ry = this.height / 2 - POND_MARGIN;
    return { cx, cy, rx, ry, margin: POND_MARGIN };
  }

  private randomPointInPond(marginFraction: number = 0.7): Vector {
    const { cx, cy, rx, ry } = this.bounds;
    const angle = randomRange(0, Math.PI * 2);
    const dist = Math.random() * marginFraction;
    return new Vector(
      cx + Math.cos(angle) * rx * dist,
      cy + Math.sin(angle) * ry * dist,
    );
  }

  private spawnKoi(): void {
    let spawnDelay = 0;
    for (let i = 0; i < KOI_COUNT; i++) {
      const variety = KOI_VARIETIES[i % KOI_VARIETIES.length]!;
      const pos = this.randomPointInPond(0.6);
      const bodyLen = randomRange(40, 60);
      const koi = new Koi(variety, pos, bodyLen);
      koi.spawnOpacity = -spawnDelay;
      spawnDelay += randomRange(0.2, 0.5);
      this.koi.push(koi);
      this.rippleTimers.push(randomRange(RIPPLE_INTERVAL_MIN, RIPPLE_INTERVAL_MAX));
    }
  }

  private spawnFrogs(): void {
    const pads = this.environment.lilyPads;
    for (let i = 0; i < FROG_COUNT && i < pads.length; i++) {
      const pad = pads[i]!;
      const frog = new Frog(new Vector(pad.x, pad.y));
      frog.sittingPadIndex = i;
      pad.occupied = true;
      this.frogs.push(frog);
    }
  }

  private spawnDragonflies(): void {
    for (let i = 0; i < DRAGONFLY_COUNT; i++) {
      const pos = this.randomPointInPond(0.5);
      this.dragonflies.push(new Dragonfly(pos));
    }
  }

  private spawnStriders(): void {
    for (let i = 0; i < STRIDER_COUNT; i++) {
      const pos = this.randomPointInPond(0.6);
      this.striders.push(new WaterStrider(pos));
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

    // Rebuild spatial hash
    this.spatialHash.clear();
    for (const koi of this.koi) {
      this.spatialHash.insert(koi, koi.position.x, koi.position.y);
    }

    // Update koi
    for (let i = 0; i < this.koi.length; i++) {
      const koi = this.koi[i]!;

      // Feeding trigger
      if (!koi.isFeeding && !koi.isIdle && Math.random() < FEEDING_CHANCE * dt) {
        koi.isFeeding = true;
        koi.feedingTimer = randomRange(FEEDING_DURATION_MIN, FEEDING_DURATION_MAX);
        koi.mouthPhase = 0;
      }

      if (koi.isIdle && !koi.isFeeding) {
        koi.update(dt);
        continue;
      }

      const forces: PrioritizedForce[] = [];
      const budget = koi.maxForce * 3;

      // Boundary avoidance
      forces.push({ force: avoidPondEdge(koi, this.bounds), priority: PRIORITY_BOUNDARY });

      // Social: query neighbors
      const neighbors = this.spatialHash.query(koi.position.x, koi.position.y, PERCEPTION_RADIUS);

      // Separation
      forces.push({
        force: koiSeparation(koi, neighbors, SEPARATION_RADIUS),
        priority: PRIORITY_SEPARATION,
      });

      // Alignment
      forces.push({
        force: koiAlignment(koi, neighbors),
        priority: PRIORITY_ALIGNMENT,
      });

      // Cohesion
      forces.push({
        force: koiCohesion(koi, neighbors),
        priority: PRIORITY_COHESION,
      });

      // Feeding: slow down
      if (koi.isFeeding) {
        forces.push({ force: seekSurface(koi), priority: PRIORITY_ALIGNMENT });
      }

      const resultForce = composeForceBudget(forces, budget);
      koi.applyForce(resultForce);

      // Wander always contributes
      koi.applyForce(pondWander(koi));

      koi.update(dt);

      // Lily pad interaction — bob pads near surface koi
      this.environment.bobLilyPads(koi.position.x, koi.position.y, koi.depth);

      // Ripples from surface koi
      if (koi.depth < 0.3 && koi.spawnOpacity >= 1) {
        this.rippleTimers[i]! -= dt;
        if (this.rippleTimers[i]! <= 0) {
          this.rippleTimers[i] = randomRange(RIPPLE_INTERVAL_MIN, RIPPLE_INTERVAL_MAX);
          if (this.ripples.length < MAX_RIPPLES) {
            // Spawn behind head
            const behind = Vector.fromAngle(koi.heading + Math.PI).scale(koi.bodyLength * 0.3);
            const rx = koi.position.x + behind.x;
            const ry = koi.position.y + behind.y;
            const strength = koi.isFeeding ? 0.6 : 0.3;
            const maxR = koi.isFeeding ? randomRange(50, 80) : randomRange(30, 60);
            // 2-3 concentric ripples
            const count = 2 + (Math.random() > 0.5 ? 1 : 0);
            for (let c = 0; c < count; c++) {
              this.ripples.push(new Ripple(
                rx, ry,
                maxR * (0.7 + c * 0.15),
                randomRange(1.5, 3) + c * 0.3,
                strength * (1 - c * 0.2),
              ));
            }
          }
        }
      }
    }

    // Update ripples
    for (const ripple of this.ripples) {
      ripple.update(dt);
    }
    this.ripples = this.ripples.filter(r => r.alive);

    // Update frogs
    this.updateFrogs(dt);

    // Update dragonflies
    for (const df of this.dragonflies) {
      df.update(dt, this.bounds);
    }

    // Update water striders
    for (const ws of this.striders) {
      ws.update(dt, this.bounds);
    }

    // Update debris drift
    this.environment.updateDebris(dt);
  }

  private updateFrogs(dt: number): void {
    const pads = this.environment.lilyPads;

    for (const frog of this.frogs) {
      frog.update(dt);

      if (frog.state === 'sitting' && frog.sittingTimer <= 0) {
        // Find an unoccupied pad to leap to
        const freePads: number[] = [];
        for (let i = 0; i < pads.length; i++) {
          if (!pads[i]!.occupied && i !== frog.sittingPadIndex) {
            freePads.push(i);
          }
        }

        if (freePads.length > 0) {
          const targetIdx = freePads[Math.floor(Math.random() * freePads.length)]!;
          const targetPad = pads[targetIdx]!;

          // Release current pad
          if (frog.sittingPadIndex >= 0 && frog.sittingPadIndex < pads.length) {
            pads[frog.sittingPadIndex]!.occupied = false;
          }

          // Leap ripple
          if (this.ripples.length < MAX_RIPPLES) {
            this.ripples.push(new Ripple(frog.position.x, frog.position.y, 40, 2, 0.5));
            this.ripples.push(new Ripple(frog.position.x, frog.position.y, 30, 1.5, 0.4));
          }

          const dist = frog.position.dist(new Vector(targetPad.x, targetPad.y));
          if (dist < 200) {
            // Direct leap
            frog.startLeap(new Vector(targetPad.x, targetPad.y), targetIdx);
            targetPad.occupied = true;
          } else {
            // Leap to water, then swim
            const midAngle = randomRange(0, Math.PI * 2);
            const midDist = randomRange(40, 80);
            const mid = frog.position.add(Vector.fromAngle(midAngle).scale(midDist));
            frog.startLeap(mid, -1);
          }
        } else {
          // No free pads, reset timer
          frog.sittingTimer = randomRange(5, 15);
        }
      }

      // Handle leap completion
      if (frog.state === 'leaping' && frog.leapProgress >= 1) {
        // Landing ripple
        if (this.ripples.length < MAX_RIPPLES) {
          this.ripples.push(new Ripple(frog.position.x, frog.position.y, 35, 2, 0.4));
          this.ripples.push(new Ripple(frog.position.x, frog.position.y, 25, 1.5, 0.3));
        }

        if (frog.sittingPadIndex >= 0 && frog.sittingPadIndex < pads.length) {
          // Landed on pad
          const pad = pads[frog.sittingPadIndex]!;
          frog.position = new Vector(pad.x, pad.y);
          frog.state = 'sitting';
          frog.sittingTimer = randomRange(5, 20);
        } else {
          // Landed in water — swim to nearest free pad
          let nearestIdx = -1;
          let nearestDist = Infinity;
          for (let i = 0; i < pads.length; i++) {
            if (!pads[i]!.occupied) {
              const d = frog.position.dist(new Vector(pads[i]!.x, pads[i]!.y));
              if (d < nearestDist) {
                nearestDist = d;
                nearestIdx = i;
              }
            }
          }
          if (nearestIdx >= 0) {
            const pad = pads[nearestIdx]!;
            pad.occupied = true;
            frog.startSwimming(new Vector(pad.x, pad.y), nearestIdx);
          } else {
            // No free pad, just sit in water
            frog.state = 'sitting';
            frog.sittingTimer = randomRange(3, 8);
          }
        }
      }

      // Handle swim arrival
      if (frog.state === 'sitting' && frog.sittingPadIndex >= 0 && frog.sittingPadIndex < pads.length) {
        const pad = pads[frog.sittingPadIndex]!;
        frog.position = new Vector(pad.x, pad.y);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Background
    this.environment.renderBackground(ctx, this.width, this.height);

    // 2. Caustics
    this.environment.renderCaustics(ctx, this.time);

    // 3. Submerged rocks
    this.environment.renderSubmergedRocks(ctx);

    // 4. Ambient motes
    this.environment.renderAmbientMotes(ctx, this.time);

    // 5. Lily pad shadows
    this.environment.renderLilyPadShadows(ctx, this.time);

    // 6. Koi (sorted by depth — deeper first)
    const sortedKoi = [...this.koi].sort((a, b) => b.depth - a.depth);
    for (const koi of sortedKoi) {
      renderKoi(ctx, koi, this.time);
    }

    // 7. Ripples
    this.renderRipples(ctx);

    // 8. Lily pads + flowers
    this.environment.renderLilyPads(ctx, this.time);

    // 9. Surface debris
    this.environment.renderDebris(ctx);

    // 10. Frogs
    for (const frog of this.frogs) {
      renderFrog(ctx, frog);
    }

    // 11. Water striders
    for (const ws of this.striders) {
      renderWaterStrider(ctx, ws);
    }

    // 12. Dragonflies
    for (const df of this.dragonflies) {
      renderDragonfly(ctx, df);
    }

    // 13. Pond edge (stones + moss — overlays pond boundary)
    this.environment.renderPondEdge(ctx);

    // 14. Stone lantern
    this.environment.renderStoneLantern(ctx);
  }

  private renderRipples(ctx: CanvasRenderingContext2D): void {
    for (const ripple of this.ripples) {
      if (ripple.opacity <= 0) continue;

      ctx.save();
      ctx.globalAlpha = ripple.opacity;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = ripple.lineWidth;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
