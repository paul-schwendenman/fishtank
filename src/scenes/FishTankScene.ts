import type { Scene } from '../engine/GameLoop';
import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import { Fish, type TankBounds } from '../entities/Fish';
import { Bubble } from '../entities/Bubble';
import { Particle } from '../entities/Particle';
import { SPECIES } from '../entities/Species';
import { wander, avoidBoundaries } from '../behaviors/Steering';
import { renderFish } from '../rendering/FishRenderer';
import { EnvironmentRenderer } from '../rendering/EnvironmentRenderer';
import { renderBubble } from '../rendering/BubbleRenderer';
import { renderParticle } from '../rendering/ParticleRenderer';

const TANK_MARGIN = 40;
const BUBBLE_SPAWN_INTERVAL = 0.3;
const PARTICLE_COUNT = 25;
const BUBBLE_FADE_ZONE = 60;

interface FishPreset {
  species: string;
  count: number;
}

const TROPICAL_COMMUNITY: FishPreset[] = [
  { species: 'neonTetra', count: 8 },
  { species: 'angelfish', count: 2 },
  { species: 'guppy', count: 4 },
  { species: 'betta', count: 1 },
  { species: 'corydoras', count: 3 },
  { species: 'pleco', count: 1 },
  { species: 'dwarfGourami', count: 2 },
];

export class FishTankScene implements Scene {
  private width: number;
  private height: number;
  private bounds: TankBounds;
  private fish: Fish[] = [];
  private bubbles: Bubble[] = [];
  private particles: Particle[] = [];
  private environment: EnvironmentRenderer;
  private time: number = 0;
  private bubbleTimer: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.bounds = this.computeBounds();
    this.environment = new EnvironmentRenderer(this.bounds);
    this.spawnFish(TROPICAL_COMMUNITY);
    this.spawnParticles();
  }

  private computeBounds(): TankBounds {
    return {
      left: TANK_MARGIN,
      right: this.width - TANK_MARGIN,
      top: TANK_MARGIN,
      bottom: this.height - TANK_MARGIN - 35, // above substrate
    };
  }

  private spawnFish(preset: FishPreset[]): void {
    let spawnDelay = 0;
    for (const { species, count } of preset) {
      const config = SPECIES[species];
      if (!config) continue;
      for (let i = 0; i < count; i++) {
        let depth: number;
        if (config.depthPreference === 'bottom') {
          depth = randomRange(0.5, 0.8);
        } else {
          depth = randomRange(0.1, 0.9);
        }

        const x = randomRange(this.bounds.left + 60, this.bounds.right - 60);
        let y: number;
        if (config.depthPreference === 'bottom') {
          y = randomRange(this.bounds.bottom - 60, this.bounds.bottom - 15);
        } else {
          y = randomRange(this.bounds.top + 40, this.bounds.bottom - 40);
        }

        const fish = new Fish(config, new Vector(x, y), depth);
        // Stagger spawn opacity for fade-in effect
        fish.spawnOpacity = -spawnDelay; // will be clamped to 0 until timer catches up
        spawnDelay += randomRange(0.1, 0.3);
        this.fish.push(fish);
      }
    }
  }

  private spawnParticles(): void {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push(
        new Particle(this.bounds.left, this.bounds.right, this.bounds.top, this.bounds.bottom),
      );
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

    // Update fish
    for (const fish of this.fish) {
      if (!fish.isIdle) {
        const wanderForce = wander(fish);
        const boundaryForce = avoidBoundaries(fish, this.bounds);
        fish.applyForce(wanderForce);
        fish.applyForce(boundaryForce);
      }
      fish.update(dt);
    }

    // Spawn bubbles
    this.bubbleTimer += dt;
    if (this.bubbleTimer >= BUBBLE_SPAWN_INTERVAL) {
      this.bubbleTimer -= BUBBLE_SPAWN_INTERVAL;
      const aer = this.environment.aeratorPosition;
      this.bubbles.push(new Bubble(aer.x, aer.y));
    }

    // Update bubbles
    for (const bubble of this.bubbles) {
      bubble.update(dt, this.bounds.top);
    }
    this.bubbles = this.bubbles.filter((b) => b.alive);

    // Update particles
    for (const particle of this.particles) {
      particle.update(dt, this.bounds.left, this.bounds.right, this.bounds.top, this.bounds.bottom);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Background
    this.environment.renderBackground(ctx, this.width, this.height);

    // 2. Light rays
    this.environment.renderLightRays(ctx, this.time, this.height);

    // 3. Back plants
    this.environment.renderPlants(ctx, this.time, 'back');

    // Sort fish by depth (back first)
    const sorted = [...this.fish].sort((a, b) => b.depth - a.depth);

    // 4. Back fish (depth > 0.5)
    for (const fish of sorted) {
      if (fish.depth > 0.5) {
        renderFish(ctx, fish);
      }
    }

    // 5. Substrate
    this.environment.renderSubstrate(ctx, this.width, this.height);

    // 6. Decorations
    this.environment.renderDecorations(ctx);

    // 7. Front fish (depth <= 0.5)
    for (const fish of sorted) {
      if (fish.depth <= 0.5) {
        renderFish(ctx, fish);
      }
    }

    // 8. Front plants
    this.environment.renderPlants(ctx, this.time, 'front');

    // 9. Bubbles
    for (const bubble of this.bubbles) {
      renderBubble(ctx, bubble, this.bounds.top, BUBBLE_FADE_ZONE);
    }

    // 10. Particles
    for (const particle of this.particles) {
      renderParticle(ctx, particle);
    }
  }
}
