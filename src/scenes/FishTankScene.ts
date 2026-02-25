import type { Scene } from '../engine/GameLoop';
import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';
import { Fish, type TankBounds } from '../entities/Fish';
import { Bubble } from '../entities/Bubble';
import { Particle } from '../entities/Particle';
import { SPECIES } from '../entities/Species';
import { wander, avoidBoundaries, wanderZ, avoidZBoundaries } from '../behaviors/Steering';
import { getPerceivedNeighbors } from '../behaviors/Perception';
import { separation, alignment, cohesion, solitarySpacing, passiveAvoidance } from '../behaviors/SocialSteering';
import { avoidObstacles, seekSurface, substrateBehavior } from '../behaviors/EnvironmentSteering';
import { composeForceBudget, type PrioritizedForce, PRIORITY_BOUNDARY, PRIORITY_OBSTACLE, PRIORITY_SEPARATION, PRIORITY_ALIGNMENT, PRIORITY_COHESION, PRIORITY_SOLITARY, PRIORITY_PASSIVE_AVOID, PRIORITY_WANDER, PRIORITY_SURFACE, PRIORITY_SUBSTRATE } from '../behaviors/ForceBudget';
import type { Obstacle } from '../behaviors/ObstacleData';
import { SpatialHash } from '../spatial/SpatialHash';
import { renderFish } from '../rendering/FishRenderer';
import { EnvironmentRenderer } from '../rendering/EnvironmentRenderer';
import { renderBubble } from '../rendering/BubbleRenderer';
import { renderParticle } from '../rendering/ParticleRenderer';

const TANK_MARGIN = 40;
const BUBBLE_SPAWN_INTERVAL = 0.3;
const PARTICLE_COUNT = 25;
const BUBBLE_FADE_ZONE = 60;
const PASSIVE_AVOID_RADIUS = 50;
const OBSTACLE_LOOKAHEAD = 80;

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
  private spatialHash = new SpatialHash<Fish>(100);
  private obstacles: Obstacle[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.bounds = this.computeBounds();
    this.environment = new EnvironmentRenderer(this.bounds);
    this.cacheObstacles();
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

  private cacheObstacles(): void {
    this.obstacles = [];

    // Rocks as obstacles
    for (const rock of this.environment.obstacleData) {
      this.obstacles.push({
        center: new Vector(rock.x, rock.y),
        halfWidth: rock.width * 0.5,
        halfHeight: rock.height * 0.5,
        padding: 15,
      });
    }

    // Plants as thin vertical obstacles
    for (const plant of this.environment.plantData) {
      this.obstacles.push({
        center: new Vector(plant.x, plant.baseY - plant.height * 0.5),
        halfWidth: 8,
        halfHeight: plant.height * 0.5,
        padding: 10,
      });
    }
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
    this.cacheObstacles();
  }

  update(dt: number): void {
    this.time += dt;

    // Rebuild spatial hash
    this.spatialHash.clear();
    for (const fish of this.fish) {
      this.spatialHash.insert(fish, fish.position.x, fish.position.y);
    }

    // Update fish with social and environmental forces
    for (const fish of this.fish) {
      // Surface visit timer countdown
      if (fish.surfaceVisitTimer > 0) {
        fish.surfaceVisitTimer -= dt;
      }

      if (fish.isIdle) {
        // Pleco latch: when idling, steer toward a nearby rock surface
        if (fish.species.plecoLatch && !fish.plecoLatchTarget) {
          for (const obs of this.obstacles) {
            const dist = fish.position.dist(obs.center);
            if (dist < obs.halfWidth + obs.halfHeight + 30) {
              // Latch to the top surface of the rock
              fish.plecoLatchTarget = new Vector(obs.center.x, obs.center.y - obs.halfHeight);
              break;
            }
          }
        }

        if (fish.plecoLatchTarget) {
          const toTarget = fish.plecoLatchTarget.sub(fish.position);
          if (toTarget.mag() > 5) {
            fish.applyForce(toTarget.normalize().scale(fish.species.maxForce * 0.3));
          }
        }

        fish.update(dt);
        continue;
      }

      // Clear pleco latch when not idle
      fish.plecoLatchTarget = null;

      const forces: PrioritizedForce[] = [];
      const budget = fish.species.maxForce * 3;

      // Query neighbors from spatial hash
      const maxQueryRadius = Math.max(
        fish.species.schooling?.perceptionRadius ?? 0,
        fish.species.solitaryRadius ?? 0,
        PASSIVE_AVOID_RADIUS,
      );
      const rawNeighbors = this.spatialHash.query(
        fish.position.x, fish.position.y, maxQueryRadius,
      );

      // Perception filter
      const perceived = getPerceivedNeighbors(fish, rawNeighbors, maxQueryRadius);

      // --- Boundary avoidance (highest priority) ---
      const boundaryForce = avoidBoundaries(fish, this.bounds);
      forces.push({ force: boundaryForce, priority: PRIORITY_BOUNDARY });

      // --- Obstacle avoidance ---
      const obsForce = avoidObstacles(fish, this.obstacles, OBSTACLE_LOOKAHEAD);
      forces.push({ force: obsForce, priority: PRIORITY_OBSTACLE });

      // --- Social forces ---
      const schooling = fish.species.schooling;
      if (schooling) {
        // Filter to same-species neighbors within perception radius
        const sameSpecies = perceived.filter(
          other => other.species === fish.species
            && fish.position.dist(other.position) < schooling.perceptionRadius,
        );

        if (sameSpecies.length > 0) {
          forces.push({
            force: separation(fish, sameSpecies, schooling.separationRadius, schooling.separationWeight),
            priority: PRIORITY_SEPARATION,
          });
          forces.push({
            force: alignment(fish, sameSpecies, schooling.alignmentWeight),
            priority: PRIORITY_ALIGNMENT,
          });
          forces.push({
            force: cohesion(fish, sameSpecies, schooling.cohesionWeight),
            priority: PRIORITY_COHESION,
          });
        }
      }

      // Solitary spacing
      if (fish.species.solitaryRadius && fish.species.solitaryWeight) {
        forces.push({
          force: solitarySpacing(fish, perceived, fish.species.solitaryRadius, fish.species.solitaryWeight),
          priority: PRIORITY_SOLITARY,
        });
      }

      // Passive avoidance (all fish avoid collisions with each other)
      const avoidForce = passiveAvoidance(fish, perceived, PASSIVE_AVOID_RADIUS);
      forces.push({ force: avoidForce, priority: PRIORITY_PASSIVE_AVOID });

      // --- Environmental forces ---

      // Surface visits (guppy/gourami)
      if (fish.surfaceVisitTimer > 0) {
        forces.push({
          force: seekSurface(fish, this.bounds),
          priority: PRIORITY_SURFACE,
        });
      } else if (fish.species.surfaceVisitChance && fish.species.surfaceVisitDuration) {
        if (Math.random() < fish.species.surfaceVisitChance * dt) {
          fish.surfaceVisitTimer = fish.species.surfaceVisitDuration;
        }
      }

      // Corydoras substrate behavior
      if (fish.species.substrateAffinity) {
        forces.push({
          force: substrateBehavior(fish, this.bounds.bottom),
          priority: PRIORITY_SUBSTRATE,
        });
      }

      // --- Wander (lowest priority) ---
      const wanderForce = wander(fish);
      forces.push({ force: wanderForce, priority: PRIORITY_WANDER });

      // Compose through force budget and apply
      const resultForce = composeForceBudget(forces, budget);
      fish.applyForce(resultForce);

      // Z-axis forces (outside budget — simple, no priority conflicts)
      fish.applyZForce(wanderZ(fish) + avoidZBoundaries(fish));

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
