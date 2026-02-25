import type { TankBounds } from '../entities/Fish';

interface Plant {
  x: number;
  baseY: number;
  height: number;
  segments: number;
  color: string;
  phase: number;
  amplitude: number;
  period: number;
  width: number;
  layer: 'back' | 'front';
}

interface Rock {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: { dx: number; dy: number }[];
}

interface LightRay {
  x: number;
  width: number;
  angle: number;
  opacity: number;
  period: number;
  phase: number;
}

interface Pebble {
  x: number;
  y: number;
  rx: number;
  ry: number;
  angle: number;
}

export class EnvironmentRenderer {
  private plants: Plant[] = [];
  private rocks: Rock[] = [];
  private lightRays: LightRay[] = [];
  private pebbles: Pebble[] = [];
  private aeratorX: number = 0;

  constructor(private bounds: TankBounds) {
    this.generate();
  }

  resize(bounds: TankBounds): void {
    this.bounds = bounds;
    this.generate();
  }

  private generate(): void {
    const { left, right, bottom } = this.bounds;
    const width = right - left;

    // Generate plants
    this.plants = [];
    const plantPositions = [0.05, 0.15, 0.3, 0.55, 0.75, 0.92];
    const backPlants = [0, 2, 4];
    plantPositions.forEach((xPct, i) => {
      const isBack = backPlants.includes(i);
      const x = left + width * xPct;
      const height = 80 + Math.random() * 120;
      const segments = 5 + Math.floor(Math.random() * 4);
      const greens = ['#1a5c2a', '#2d7a3e', '#1e6830', '#3a8c4f', '#245c32', '#4a9c5c'];
      const color = isBack
        ? '#1a4c2a'  // muted for back
        : greens[Math.floor(Math.random() * greens.length)]!;

      this.plants.push({
        x,
        baseY: bottom,
        height,
        segments,
        color,
        phase: Math.random() * Math.PI * 2,
        amplitude: 5 + Math.random() * 10,
        period: 3 + Math.random() * 3,
        width: 3 + Math.random() * 4,
        layer: isBack ? 'back' : 'front',
      });
    });

    // Generate rocks
    this.rocks = [];
    const rockPositions = [0.25, 0.6];
    rockPositions.forEach((xPct) => {
      const x = left + width * xPct;
      const w = 20 + Math.random() * 30;
      const h = 15 + Math.random() * 15;
      const points = [];
      const numPoints = 6 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numPoints; j++) {
        const angle = (j / numPoints) * Math.PI * 2;
        const r = 0.7 + Math.random() * 0.3;
        points.push({ dx: Math.cos(angle) * r, dy: Math.sin(angle) * r });
      }
      this.rocks.push({
        x,
        y: bottom - h * 0.4,
        width: w,
        height: h,
        color: `rgb(${80 + Math.random() * 40}, ${70 + Math.random() * 30}, ${60 + Math.random() * 20})`,
        points,
      });
    });

    // Cave/arch decoration
    this.rocks.push({
      x: left + width * 0.45,
      y: bottom - 20,
      width: 45,
      height: 30,
      color: '#5a4a3a',
      points: [
        { dx: -1, dy: 0.4 },
        { dx: -0.9, dy: -0.8 },
        { dx: -0.3, dy: -1 },
        { dx: 0.3, dy: -1 },
        { dx: 0.9, dy: -0.8 },
        { dx: 1, dy: 0.4 },
        { dx: 0.5, dy: 0.4 },
        { dx: 0.4, dy: -0.3 },
        { dx: -0.4, dy: -0.3 },
        { dx: -0.5, dy: 0.4 },
      ],
    });

    // Light rays
    this.lightRays = [];
    for (let i = 0; i < 4; i++) {
      this.lightRays.push({
        x: left + width * (0.15 + i * 0.22 + Math.random() * 0.1),
        width: 30 + Math.random() * 50,
        angle: -0.15 + Math.random() * 0.3,
        opacity: 0.06 + Math.random() * 0.08,
        period: 12 + Math.random() * 8,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Pebbles
    this.pebbles = [];
    for (let i = 0; i < 30; i++) {
      this.pebbles.push({
        x: Math.random() * (right + 60),
        y: bottom - 2 + Math.random() * 8,
        rx: 1 + Math.random() * 2.5,
        ry: 0.7 + Math.random() * 1.5,
        angle: Math.random(),
      });
    }

    // Aerator position
    this.aeratorX = left + width * 0.8;
  }

  get obstacleData(): Array<{ x: number; y: number; width: number; height: number }> {
    return this.rocks.map(r => ({ x: r.x, y: r.y, width: r.width, height: r.height }));
  }

  get plantData(): Array<{ x: number; baseY: number; height: number; layer: 'back' | 'front' }> {
    return this.plants.map(p => ({ x: p.x, baseY: p.baseY, height: p.height, layer: p.layer }));
  }

  get aeratorPosition(): { x: number; y: number } {
    return { x: this.aeratorX, y: this.bounds.bottom };
  }

  renderBackground(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number): void {
    // Deep blue-green gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
    grad.addColorStop(0, '#0a1e2e');
    grad.addColorStop(0.3, '#0c2636');
    grad.addColorStop(0.7, '#0e2e3a');
    grad.addColorStop(1, '#0a2428');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  renderSubstrate(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number): void {
    const { bottom } = this.bounds;

    // Main substrate — fill to bottom of canvas
    const grad = ctx.createLinearGradient(0, bottom - 5, 0, canvasH);
    grad.addColorStop(0, '#8a7a5a');
    grad.addColorStop(0.3, '#7a6a4a');
    grad.addColorStop(1, '#5a4a30');
    ctx.fillStyle = grad;
    ctx.fillRect(0, bottom - 5, canvasW, canvasH - bottom + 10);

    // Pebbles
    ctx.fillStyle = '#9a8a6a';
    for (const pebble of this.pebbles) {
      ctx.beginPath();
      ctx.ellipse(pebble.x, pebble.y, pebble.rx, pebble.ry, pebble.angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderLightRays(ctx: CanvasRenderingContext2D, time: number, canvasH: number): void {
    for (const ray of this.lightRays) {
      const sway = Math.sin(time / ray.period + ray.phase) * 15;
      const x = ray.x + sway;
      const topW = ray.width * 0.4;
      const bottomW = ray.width * 1.5;
      const height = canvasH * 0.8;

      ctx.save();
      ctx.globalAlpha = ray.opacity;
      ctx.translate(x, 0);
      ctx.rotate(ray.angle);

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(255, 230, 180, 1)');
      grad.addColorStop(0.5, 'rgba(255, 230, 180, 0.5)');
      grad.addColorStop(1, 'rgba(255, 230, 180, 0)');

      ctx.beginPath();
      ctx.moveTo(-topW / 2, 0);
      ctx.lineTo(topW / 2, 0);
      ctx.lineTo(bottomW / 2, height);
      ctx.lineTo(-bottomW / 2, height);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.restore();
    }
  }

  renderPlants(ctx: CanvasRenderingContext2D, time: number, layer: 'back' | 'front'): void {
    for (const plant of this.plants) {
      if (plant.layer !== layer) continue;

      ctx.save();
      if (layer === 'back') {
        ctx.globalAlpha = 0.6;
      } else {
        ctx.globalAlpha = 0.85;
      }

      const segmentH = plant.height / plant.segments;
      ctx.strokeStyle = plant.color;
      ctx.lineCap = 'round';

      for (let blade = 0; blade < 3; blade++) {
        const bladeOffset = (blade - 1) * plant.width * 1.5;
        const bladePhase = plant.phase + blade * 0.8;

        ctx.lineWidth = plant.width * (1 - blade * 0.15);
        ctx.beginPath();
        ctx.moveTo(plant.x + bladeOffset, plant.baseY);

        let cx = plant.x + bladeOffset;
        let cy = plant.baseY;

        for (let s = 1; s <= plant.segments; s++) {
          const t = s / plant.segments;
          const sway = Math.sin(time / plant.period + bladePhase + s * 0.3) * plant.amplitude * t;
          cx = plant.x + bladeOffset + sway;
          cy = plant.baseY - s * segmentH;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // Leaf tips
        if (plant.height > 100) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, plant.width * 0.8, 3, 0.3, 0, Math.PI * 2);
          ctx.fillStyle = plant.color;
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  renderDecorations(ctx: CanvasRenderingContext2D): void {
    for (const rock of this.rocks) {
      ctx.beginPath();
      const first = rock.points[0]!;
      ctx.moveTo(
        rock.x + first.dx * rock.width * 0.5,
        rock.y + first.dy * rock.height * 0.5,
      );
      for (let i = 1; i < rock.points.length; i++) {
        const p = rock.points[i]!;
        ctx.lineTo(
          rock.x + p.dx * rock.width * 0.5,
          rock.y + p.dy * rock.height * 0.5,
        );
      }
      ctx.closePath();
      ctx.fillStyle = rock.color;
      ctx.fill();

      // Subtle highlight
      ctx.beginPath();
      ctx.ellipse(rock.x - rock.width * 0.1, rock.y - rock.height * 0.2, rock.width * 0.15, rock.height * 0.1, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fill();
    }

    // Aerator stone
    const aer = this.aeratorPosition;
    ctx.beginPath();
    ctx.ellipse(aer.x, aer.y - 3, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#6a6a6a';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(aer.x, aer.y - 4, 10, 4, 0, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#7a7a7a';
    ctx.fill();
  }
}
