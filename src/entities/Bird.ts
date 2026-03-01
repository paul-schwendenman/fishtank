import { randomRange } from '../utils/math';
import { easeInOut } from '../utils/math';
import type { BirdVarietyConfig } from './BirdVariety';
import type { PerchPoint } from './PerchPoint';

export type BirdState =
  | 'approaching'
  | 'circling'
  | 'landing'
  | 'perching'
  | 'feeding'
  | 'alert'
  | 'hopping'
  | 'bathing'
  | 'departing';

export class Bird {
  x: number;
  y: number;
  variety: BirdVarietyConfig;
  state: BirdState = 'approaching';
  stateTimer: number = 0;
  targetPerch: PerchPoint | null = null;
  spawnOpacity: number;
  facingRight: boolean;

  // Animation
  wingPhase: number = 0;
  headAngle: number = 0;
  bodyBobPhase: number = 0;
  tailFlickTimer: number;
  peckPhase: number = 0;
  splashTimer: number = 0;

  // Flight arc
  flightStartX: number = 0;
  flightStartY: number = 0;
  flightEndX: number = 0;
  flightEndY: number = 0;
  flightProgress: number = 0;
  flightDuration: number = 1;
  flightArcHeight: number = 40;
  needsDepartureSetup: boolean = false;

  // Grab-and-go state (chickadees)
  grabAndGoTrips: number = 0;
  grabAndGoBranch: PerchPoint | null = null;

  // Ground wander
  wanderVx: number = 0;
  wanderTimer: number = 0;
  headBobPhase: number = 0; // for dove head-bob

  constructor(variety: BirdVarietyConfig, x: number, y: number, spawnDelay: number) {
    this.variety = variety;
    this.x = x;
    this.y = y;
    this.spawnOpacity = -spawnDelay;
    this.facingRight = Math.random() < 0.5;
    this.tailFlickTimer = randomRange(2, 6);
    this.bodyBobPhase = randomRange(0, Math.PI * 2);
  }

  startFlight(endX: number, endY: number, duration: number, arcHeight: number): void {
    this.flightStartX = this.x;
    this.flightStartY = this.y;
    this.flightEndX = endX;
    this.flightEndY = endY;
    this.flightProgress = 0;
    this.flightDuration = duration;
    this.flightArcHeight = arcHeight;
    this.facingRight = endX > this.x;
    this.wingPhase = 0;
  }

  update(dt: number): void {
    // Spawn opacity
    if (this.spawnOpacity < 1) {
      this.spawnOpacity += 0.5 * dt;
    }

    // Tail flick timer (always)
    this.tailFlickTimer -= dt;
    if (this.tailFlickTimer <= 0) {
      this.tailFlickTimer = randomRange(2, 6);
    }

    this.bodyBobPhase += dt * 3;
    this.stateTimer -= dt;

    switch (this.state) {
      case 'approaching':
        this.updateFlight(dt);
        if (this.flightProgress >= 1) {
          this.state = 'landing';
          this.stateTimer = 0.3;
          this.wingPhase = 0;
        }
        break;

      case 'circling':
        this.updateFlight(dt);
        if (this.flightProgress >= 1) {
          this.state = 'landing';
          this.stateTimer = 0.3;
        }
        break;

      case 'landing':
        // Decelerate to perch
        if (this.targetPerch) {
          this.x += (this.targetPerch.x - this.x) * 5 * dt;
          this.y += (this.targetPerch.y - this.y) * 5 * dt;
        }
        // Wing flare
        this.wingPhase += dt * 15;
        if (this.stateTimer <= 0) {
          if (this.targetPerch) {
            this.x = this.targetPerch.x;
            this.y = this.targetPerch.y;
            if (this.targetPerch.facing) {
              this.facingRight = this.targetPerch.facing === 'right';
            }
          }
          this.state = 'perching';
          this.stateTimer = randomRange(3, 8);
        }
        break;

      case 'perching':
        this.headAngle += (Math.sin(this.bodyBobPhase * 0.5) * 0.1 - this.headAngle) * 2 * dt;
        // Occasional head turn
        if (Math.random() < 0.3 * dt) {
          this.headAngle = randomRange(-0.2, 0.2);
        }
        if (this.stateTimer <= 0) {
          this.transitionFromPerching();
        }
        break;

      case 'feeding':
        this.peckPhase += dt * 6;
        this.headAngle = Math.sin(this.peckPhase) * 0.3 - 0.2;
        // Head lifts between pecks
        if (Math.random() < 0.15 * dt) {
          this.headAngle = 0.1;
        }
        if (this.stateTimer <= 0) {
          this.transitionFromFeeding();
        }
        break;

      case 'alert':
        this.headAngle += (0.15 - this.headAngle) * 3 * dt;
        // Look side to side
        if (Math.random() < 0.8 * dt) {
          this.facingRight = !this.facingRight;
        }
        if (this.stateTimer <= 0) {
          this.state = 'perching';
          this.stateTimer = randomRange(3, 8);
        }
        break;

      case 'hopping':
        this.updateFlight(dt);
        if (this.flightProgress >= 1) {
          if (this.targetPerch) {
            this.x = this.targetPerch.x;
            this.y = this.targetPerch.y;
            if (this.targetPerch.facing) {
              this.facingRight = this.targetPerch.facing === 'right';
            }
          }
          this.state = 'perching';
          this.stateTimer = randomRange(3, 8);
        }
        break;

      case 'bathing':
        // Splash animation
        this.splashTimer += dt;
        this.wingPhase += dt * 8;
        this.bodyBobPhase += dt * 6;
        if (this.stateTimer <= 0) {
          this.state = 'perching';
          this.stateTimer = randomRange(3, 6);
          this.splashTimer = 0;
        }
        break;

      case 'departing':
        this.updateFlight(dt);
        if (this.flightProgress >= 1) {
          // Mark as fully departed — scene will remove
          this.stateTimer = -999;
        }
        break;
    }

    // Ground wandering (doves, juncos, robins on ground)
    if (this.targetPerch?.type === 'ground' && (this.state === 'feeding' || this.state === 'perching')) {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderVx = randomRange(-8, 8);
        this.wanderTimer = randomRange(1, 3);
        if (this.wanderVx !== 0) {
          this.facingRight = this.wanderVx > 0;
        }
      }
      this.x += this.wanderVx * dt;

      // Dove head bob
      if (this.variety.id === 'dove' && Math.abs(this.wanderVx) > 1) {
        this.headBobPhase += dt * 8;
      }
    }
  }

  private updateFlight(dt: number): void {
    this.flightProgress += dt / this.flightDuration;
    this.wingPhase += dt * (this.variety.size === 'small' ? 18 : 14);

    if (this.flightProgress >= 1) {
      this.flightProgress = 1;
      this.x = this.flightEndX;
      this.y = this.flightEndY;
    } else {
      const t = this.flightProgress;
      const eased = easeInOut(t);
      this.x = this.flightStartX + (this.flightEndX - this.flightStartX) * eased;
      this.y = this.flightStartY + (this.flightEndY - this.flightStartY) * eased;

      // Arc
      if (this.variety.flightStyle === 'undulating') {
        // Sine-wave undulating flight
        this.y -= Math.sin(t * Math.PI) * this.flightArcHeight * 0.5;
        this.y -= Math.sin(t * Math.PI * 4) * 5;
      } else {
        this.y -= Math.sin(t * Math.PI) * this.flightArcHeight;
      }

      this.facingRight = this.flightEndX > this.flightStartX;
    }
  }

  private transitionFromPerching(): void {
    const roll = Math.random();

    if (this.variety.grabAndGo && this.grabAndGoBranch) {
      // Chickadee: alternate between feeder and branch
      this.grabAndGoTrips++;
      if (this.grabAndGoTrips >= 4) {
        // Done, depart
        this.state = 'departing';
        this.needsDepartureSetup = true;
        return;
      }
      // Will be handled by scene
      this.state = 'feeding';
      this.stateTimer = randomRange(2, 4);
      return;
    }

    if (roll < 0.5) {
      this.state = 'feeding';
      this.stateTimer = randomRange(8, 25);
    } else if (roll < 0.65) {
      this.state = 'alert';
      this.stateTimer = randomRange(2, 5);
    } else if (roll < 0.8 && this.targetPerch?.type === 'bath-rim') {
      this.state = 'bathing';
      this.stateTimer = randomRange(5, 12);
    } else {
      this.state = 'feeding';
      this.stateTimer = randomRange(10, 30);
    }
  }

  private transitionFromFeeding(): void {
    const roll = Math.random();

    if (roll < 0.15) {
      this.state = 'alert';
      this.stateTimer = randomRange(2, 4);
    } else if (roll < 0.35) {
      // Ready to depart
      this.state = 'departing';
      this.needsDepartureSetup = true;
    } else if (roll < 0.5) {
      this.state = 'perching';
      this.stateTimer = randomRange(3, 8);
    } else {
      // Continue feeding
      this.state = 'feeding';
      this.stateTimer = randomRange(8, 20);
    }
  }

  /** Whether this bird has departed off-screen */
  get isDeparted(): boolean {
    return this.state === 'departing' && this.stateTimer <= -999;
  }

  /** Whether this bird is in flight (for rendering) */
  get isFlying(): boolean {
    return this.state === 'approaching' || this.state === 'circling' || this.state === 'departing';
  }

  /** Size multiplier for rendering */
  get sizeScale(): number {
    switch (this.variety.size) {
      case 'small': return 0.7;
      case 'medium': return 1.0;
      case 'large': return 1.2;
    }
  }
}
