import type { Scene } from '../engine/GameLoop';
import { randomRange, randomInt } from '../utils/math';
import { Bird } from '../entities/Bird';
import { BIRD_VARIETIES, type BirdVarietyConfig } from '../entities/BirdVariety';
import type { PerchPoint } from '../entities/PerchPoint';
import { BirdFeederRenderer } from '../rendering/BirdFeederRenderer';
import { renderBird } from '../rendering/BirdRenderer';
import { groundWander, groundSeparation, scatterFromJay } from '../behaviors/BirdFeederSteering';

const TARGET_BIRD_COUNT = 10;
const MIN_BIRD_COUNT = 8;
const SPAWN_INTERVAL_MIN = 2;
const SPAWN_INTERVAL_MAX = 5;
const JAY_SCATTER_RADIUS = 120;

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export class BirdFeederScene implements Scene {
  private width: number;
  private height: number;
  private birds: Bird[] = [];
  private environment: BirdFeederRenderer;
  private time: number = 0;
  private spawnTimer: number = 2;
  private splashParticles: SplashParticle[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.environment = new BirdFeederRenderer(width, height);
    this.spawnInitialBirds();
  }

  private spawnInitialBirds(): void {
    // Spawn a few birds already perched at feeders
    const initialSpecies = this.pickDiverseSpecies(5);
    let delay = 0;
    for (const variety of initialSpecies) {
      const perch = this.findPerchForSpecies(variety);
      if (perch) {
        const bird = new Bird(variety, perch.x, perch.y, delay);
        bird.targetPerch = perch;
        perch.occupied = true;
        bird.state = 'perching';
        bird.stateTimer = randomRange(5, 15);
        bird.facingRight = perch.facing === 'right' || (perch.facing === undefined && Math.random() < 0.5);
        this.birds.push(bird);
        delay += randomRange(0.3, 0.8);
      }
    }
  }

  private pickDiverseSpecies(count: number): BirdVarietyConfig[] {
    const shuffled = [...BIRD_VARIETIES].sort(() => Math.random() - 0.5);
    // Filter out cardinal-f initially (will pair with cardinal-m)
    return shuffled.filter(v => v.id !== 'cardinal-f').slice(0, count);
  }

  private findPerchForSpecies(variety: BirdVarietyConfig): PerchPoint | null {
    const eligible = this.environment.perchPoints.filter(
      p => !p.occupied && variety.feeders.includes(p.type),
    );
    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)]!;
  }

  private spawnBird(): void {
    if (this.birds.length >= TARGET_BIRD_COUNT) return;

    // Pick a species that has an available perch
    const shuffled = [...BIRD_VARIETIES].sort(() => Math.random() - 0.5);
    let variety: BirdVarietyConfig | null = null;
    let perch: PerchPoint | null = null;

    for (const v of shuffled) {
      // Skip cardinal-f unless cardinal-m is present
      if (v.id === 'cardinal-f') {
        const hasMale = this.birds.some(b => b.variety.id === 'cardinal-m' && !b.isDeparted);
        if (!hasMale) continue;
      }
      const p = this.findPerchForSpecies(v);
      if (p) {
        variety = v;
        perch = p;
        break;
      }
    }

    if (!variety || !perch) return;

    // Spawn from off-screen
    const side = Math.random() < 0.5 ? -1 : 1;
    const startX = side < 0 ? -30 : this.width + 30;
    const startY = randomRange(this.height * 0.1, this.height * 0.4);

    const bird = new Bird(variety, startX, startY, 0);
    bird.spawnOpacity = 1;
    bird.state = 'approaching';
    bird.targetPerch = perch;
    perch.occupied = true;

    const flightDuration = randomRange(1.5, 2.5);
    const arcHeight = randomRange(20, 50);
    bird.startFlight(perch.x, perch.y, flightDuration, arcHeight);

    this.birds.push(bird);

    // Cardinal pairing — spawn female with male
    if (variety.id === 'cardinal-m') {
      const femaleVariety = BIRD_VARIETIES.find(v => v.id === 'cardinal-f');
      if (femaleVariety) {
        const femalePerch = this.findPerchForSpecies(femaleVariety);
        if (femalePerch) {
          const female = new Bird(femaleVariety, startX + side * -20, startY + 15, 0.5);
          female.spawnOpacity = 1;
          female.state = 'approaching';
          female.targetPerch = femalePerch;
          femalePerch.occupied = true;
          female.startFlight(femalePerch.x, femalePerch.y, flightDuration + 0.3, arcHeight);
          this.birds.push(female);
        }
      }
    }
  }

  private startDeparture(bird: Bird): void {
    const side = Math.random() < 0.5 ? -1 : 1;
    const endX = side < 0 ? -40 : this.width + 40;
    const endY = randomRange(this.height * 0.05, this.height * 0.3);

    bird.state = 'departing';
    bird.startFlight(endX, endY, randomRange(1.5, 2.5), randomRange(15, 40));

    // Release perch
    if (bird.targetPerch) {
      bird.targetPerch.occupied = false;
      bird.targetPerch = null;
    }
    if (bird.grabAndGoBranch) {
      bird.grabAndGoBranch.occupied = false;
      bird.grabAndGoBranch = null;
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.environment.resize(width, height);
  }

  update(dt: number): void {
    this.time += dt;

    // Update clouds
    this.environment.updateClouds(dt);

    // Update each bird
    for (const bird of this.birds) {
      bird.update(dt);

      // Handle ground steering
      if (bird.targetPerch?.type === 'ground' && (bird.state === 'feeding' || bird.state === 'perching')) {
        const edgeForce = groundWander(bird, { minX: this.width * 0.15, maxX: this.width * 0.85 });
        const sepForce = groundSeparation(bird, this.birds, 30);
        bird.wanderVx += (edgeForce + sepForce) * dt;
        bird.wanderVx *= 0.95; // damping
      }

      // Blue Jay intimidation
      if (bird.variety.id === 'blue-jay' && (bird.state === 'perching' || bird.state === 'feeding')) {
        for (const other of this.birds) {
          if (other === bird || other.variety.personality !== 'shy') continue;
          if (other.isFlying || other.state === 'departing') continue;

          const scatter = scatterFromJay(other, bird.x, bird.y, JAY_SCATTER_RADIUS);
          if (scatter && other.state !== 'alert') {
            // Scatter shy birds — trigger alert then departure
            other.state = 'alert';
            other.stateTimer = randomRange(0.5, 1.5);
          }
        }
      }

      // Handle chickadee grab-and-go
      if (bird.variety.grabAndGo && bird.state === 'feeding' && bird.stateTimer <= 0) {
        if (!bird.grabAndGoBranch) {
          // Find a nearby branch
          const branches = this.environment.perchPoints.filter(
            p => p.type === 'branch' && !p.occupied,
          );
          if (branches.length > 0) {
            bird.grabAndGoBranch = branches[Math.floor(Math.random() * branches.length)]!;
            bird.grabAndGoBranch.occupied = true;
          }
        }

        if (bird.grabAndGoBranch) {
          // Fly to branch with seed
          const isAtBranch = bird.targetPerch === bird.grabAndGoBranch;
          if (isAtBranch) {
            // Go back to feeder
            if (bird.grabAndGoTrips >= 3) {
              this.startDeparture(bird);
            } else {
              const feeder = this.findPerchForSpecies(bird.variety);
              if (feeder) {
                bird.grabAndGoBranch.occupied = false;
                bird.targetPerch = feeder;
                feeder.occupied = true;
                bird.state = 'hopping';
                bird.startFlight(feeder.x, feeder.y, 0.6, 15);
                bird.grabAndGoTrips++;
              }
            }
          } else {
            // Go to branch
            if (bird.targetPerch) {
              bird.targetPerch.occupied = false;
            }
            bird.targetPerch = bird.grabAndGoBranch;
            bird.state = 'hopping';
            bird.startFlight(bird.grabAndGoBranch.x, bird.grabAndGoBranch.y, 0.5, 12);
          }
        }
      }

      // Handle departure transition — bird's own state machine set departing
      // but the scene needs to set up the actual flight path
      if (bird.needsDepartureSetup) {
        bird.needsDepartureSetup = false;
        this.startDeparture(bird);
      }

      // Bathing splash particles
      if (bird.state === 'bathing' && bird.splashTimer > 0) {
        if (Math.random() < 3 * dt) {
          const intensity = bird.variety.id === 'robin' ? 2 : 1;
          for (let i = 0; i < randomInt(1, 3) * intensity; i++) {
            this.splashParticles.push({
              x: bird.x + randomRange(-5, 5),
              y: bird.y,
              vx: randomRange(-20, 20) * intensity,
              vy: randomRange(-30, -10) * intensity,
              life: randomRange(0.3, 0.6),
            });
          }
        }
      }
    }

    // Update splash particles
    for (const p of this.splashParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt; // gravity
      p.life -= dt;
    }
    this.splashParticles = this.splashParticles.filter(p => p.life > 0);

    // Remove departed birds
    this.birds = this.birds.filter(bird => {
      if (bird.isDeparted) {
        if (bird.targetPerch) {
          bird.targetPerch.occupied = false;
        }
        if (bird.grabAndGoBranch) {
          bird.grabAndGoBranch.occupied = false;
        }
        return false;
      }
      return true;
    });

    // Spawn new birds
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.birds.length < TARGET_BIRD_COUNT) {
      this.spawnBird();
      this.spawnTimer = randomRange(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX);
      // Spawn faster when below minimum
      if (this.birds.length < MIN_BIRD_COUNT) {
        this.spawnTimer = randomRange(0.5, 1.5);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sky
    this.environment.renderSky(ctx);

    // 2. Clouds
    this.environment.renderClouds(ctx);

    // 3. Distant treeline
    this.environment.renderTreeline(ctx);

    // 4. Back lawn
    this.environment.renderBackLawn(ctx);

    // 5. Fence (behind trees and feeders)
    this.environment.renderFence(ctx);

    // 6. Tree trunks (in front of fence)
    this.environment.renderTreeTrunks(ctx);

    // 7. Trunk/branch birds
    const trunkBirds = this.birds.filter(b =>
      !b.isFlying && b.targetPerch &&
      (b.targetPerch.type === 'trunk' || b.targetPerch.type === 'branch'),
    );
    for (const bird of trunkBirds) {
      renderBird(ctx, bird, this.time);
    }

    // 8. Feeders
    this.environment.renderFeeders(ctx, this.time);

    // 9. Feeder birds
    const feederBirds = this.birds.filter(b =>
      !b.isFlying && b.targetPerch &&
      (b.targetPerch.type === 'feeder-tube' ||
       b.targetPerch.type === 'feeder-platform' ||
       b.targetPerch.type === 'feeder-suet' ||
       b.targetPerch.type === 'feeder-jelly' ||
       b.targetPerch.type === 'bath-rim' ||
       b.targetPerch.type === 'bath-water'),
    );
    for (const bird of feederBirds) {
      renderBird(ctx, bird, this.time);
    }

    // 10. Ground (below ground birds)
    this.environment.renderGround(ctx);

    // 11. Fence, flight, and ground birds
    const fenceGroundBirds = this.birds.filter(b =>
      b.isFlying ||
      (b.targetPerch &&
        (b.targetPerch.type === 'fence' || b.targetPerch.type === 'ground')),
    );
    // Sort by y for depth
    fenceGroundBirds.sort((a, b) => a.y - b.y);
    for (const bird of fenceGroundBirds) {
      renderBird(ctx, bird, this.time);
    }

    // 12. Splash particles
    ctx.fillStyle = '#8ab8c8';
    for (const p of this.splashParticles) {
      ctx.globalAlpha = Math.min(p.life * 3, 0.6);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 13. Tree canopies
    this.environment.renderTreeCanopies(ctx, this.time);

    // 14. Foreground grass
    this.environment.renderForeGrass(ctx, this.time);
  }
}
