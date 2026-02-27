import { Vector } from '../utils/Vector';
import { randomRange, randomInt } from '../utils/math';
import type { CowVarietyConfig, CowPatchConfig } from './CowVariety';

export type CowState = 'grazing' | 'walking' | 'resting' | 'standing' | 'headUp';

export interface CowPatch {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotation: number;
}

export class Cow {
  position: Vector;
  velocity: Vector = Vector.zero();
  heading: number;
  facingRight: boolean;
  variety: CowVarietyConfig;
  depth: number; // 0 = foreground, 1 = background (y-based)
  spawnOpacity: number;

  state: CowState = 'grazing';
  stateTimer: number;

  // Animation phases
  walkPhase: number = 0;
  tailPhase: number;
  headAngle: number = 0; // 0 = mid, negative = down (grazing), positive = up
  jawPhase: number = 0;
  earFlickTimer: number;
  earFlickDuration: number = 0;
  isEarFlicking: boolean = false;

  // Lying down transition
  lyingTransition: number = 0; // 0 = standing, 1 = fully lying

  // Pre-generated patch positions (stable per cow)
  bodyPatches: CowPatch[] = [];

  // Body dimensions (based on variety)
  bodyWidth: number;
  bodyHeight: number;

  constructor(variety: CowVarietyConfig, position: Vector, spawnDelay: number) {
    this.variety = variety;
    this.position = position;
    this.heading = Math.random() < 0.5 ? 0 : Math.PI;
    this.facingRight = this.heading < Math.PI * 0.5 || this.heading > Math.PI * 1.5;
    this.spawnOpacity = -spawnDelay;
    this.depth = 0;

    this.bodyWidth = 50 * variety.sizeMult;
    this.bodyHeight = 30 * variety.sizeMult;

    this.stateTimer = randomRange(20, 40);
    this.tailPhase = randomRange(0, Math.PI * 2);
    this.earFlickTimer = randomRange(3, 8);

    this.generatePatches();
  }

  private generatePatches(): void {
    for (const patchCfg of this.variety.patches) {
      const count = randomInt(patchCfg.countMin, patchCfg.countMax);
      for (let i = 0; i < count; i++) {
        this.bodyPatches.push(this.randomPatch(patchCfg));
      }
    }
  }

  private randomPatch(cfg: CowPatchConfig): CowPatch {
    return {
      cx: randomRange(-0.35, 0.35),
      cy: randomRange(-0.3, 0.3),
      rx: randomRange(cfg.sizeMin, cfg.sizeMax),
      ry: randomRange(cfg.sizeMin * 0.6, cfg.sizeMax * 0.8),
      rotation: randomRange(-0.5, 0.5),
    };
  }

  update(dt: number): void {
    // Spawn opacity
    if (this.spawnOpacity < 1) {
      this.spawnOpacity += 0.5 * dt;
    }

    // Tail swish (always)
    this.tailPhase += dt * (0.8 + Math.random() * 0.2);

    // Ear flick
    if (this.isEarFlicking) {
      this.earFlickDuration -= dt;
      if (this.earFlickDuration <= 0) {
        this.isEarFlicking = false;
      }
    } else {
      this.earFlickTimer -= dt;
      if (this.earFlickTimer <= 0) {
        this.isEarFlicking = true;
        this.earFlickDuration = 0.2;
        this.earFlickTimer = randomRange(3, 10);
      }
    }

    this.stateTimer -= dt;

    switch (this.state) {
      case 'grazing':
        // Head down, chewing
        this.headAngle += ((-0.4) - this.headAngle) * 3 * dt;
        this.jawPhase += dt * 3;

        if (this.stateTimer <= 0) {
          this.transitionFrom('grazing');
        }
        break;

      case 'walking':
        this.walkPhase += dt * 3;
        // Head at mid level, gentle bob
        this.headAngle += ((-0.1 + Math.sin(this.walkPhase) * 0.05) - this.headAngle) * 3 * dt;
        this.jawPhase = 0;

        // Move
        const speed = 12 * this.variety.sizeMult;
        const dir = this.facingRight ? 1 : -1;
        this.velocity = new Vector(speed * dir, 0);
        this.position = this.position.add(this.velocity.scale(dt));

        if (this.stateTimer <= 0) {
          this.transitionFrom('walking');
        }
        break;

      case 'resting':
        // Lying down
        this.lyingTransition = Math.min(1, this.lyingTransition + dt / 2.5);
        this.headAngle += (0.0 - this.headAngle) * 2 * dt;
        this.jawPhase += dt * 2; // chewing cud
        this.velocity = Vector.zero();

        if (this.stateTimer <= 0) {
          this.transitionFrom('resting');
        }
        break;

      case 'standing':
        // Getting up if was lying
        this.lyingTransition = Math.max(0, this.lyingTransition - dt / 2.5);
        this.headAngle += (0.0 - this.headAngle) * 2 * dt;
        this.jawPhase = 0;
        this.velocity = Vector.zero();

        if (this.stateTimer <= 0) {
          this.transitionFrom('standing');
        }
        break;

      case 'headUp':
        // Head raised, looking around
        this.headAngle += (0.15 - this.headAngle) * 3 * dt;
        this.jawPhase = 0;
        this.velocity = Vector.zero();

        if (this.stateTimer <= 0) {
          this.transitionFrom('headUp');
        }
        break;
    }
  }

  private transitionFrom(current: CowState): void {
    const roll = Math.random();

    switch (current) {
      case 'grazing':
        if (roll < 0.4) {
          this.setState('walking', randomRange(5, 20));
        } else if (roll < 0.6) {
          this.setState('resting', randomRange(30, 90));
        } else if (roll < 0.8) {
          this.setState('headUp', randomRange(3, 8));
        } else {
          // Continue grazing
          this.setState('grazing', randomRange(20, 40));
        }
        break;

      case 'walking':
        if (roll < 0.6) {
          this.setState('grazing', randomRange(20, 40));
        } else if (roll < 0.8) {
          this.setState('resting', randomRange(30, 90));
        } else {
          this.setState('standing', randomRange(10, 25));
        }
        break;

      case 'resting':
        // Must stand up first
        this.setState('standing', randomRange(10, 25));
        break;

      case 'standing':
        if (this.lyingTransition > 0.01) {
          // Still getting up, wait
          this.stateTimer = 0.5;
          return;
        }
        if (roll < 0.5) {
          this.setState('grazing', randomRange(20, 40));
        } else if (roll < 0.8) {
          this.setState('walking', randomRange(5, 20));
        } else {
          this.setState('headUp', randomRange(3, 8));
        }
        break;

      case 'headUp':
        this.setState('grazing', randomRange(20, 40));
        break;
    }
  }

  private setState(newState: CowState, duration: number): void {
    this.state = newState;
    this.stateTimer = duration;

    if (newState === 'walking') {
      // Maybe change direction
      if (Math.random() < 0.3) {
        this.facingRight = !this.facingRight;
        this.heading = this.facingRight ? 0 : Math.PI;
      }
      this.walkPhase = 0;
    }
  }

  /** Check if cow is currently lying (or transitioning to lying) */
  get isLying(): boolean {
    return this.lyingTransition > 0.01;
  }
}
