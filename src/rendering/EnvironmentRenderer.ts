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
  depth: number;
  type: 'grass' | 'bushy' | 'carpet';
}

interface Rock {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: { dx: number; dy: number }[];
  depth: number;
}

interface LightRay {
  x: number;
  width: number;
  angle: number;
  opacity: number;
  period: number;
  phase: number;
  period2: number;
  phase2: number;
  widthPeriod: number;
  widthPhase: number;
}

const PEBBLE_COLORS = [
  '#9a8a6a', '#8a7a5a', '#a09070', '#7a6a50', '#b0a080',
  '#6a6a6a', '#8a8070', '#a89878', '#706050', '#c0b090',
];

interface Pebble {
  x: number;
  y: number;
  rx: number;
  ry: number;
  angle: number;
  color: string;
}

interface DriftwoodBranch {
  startT: number;  // position along trunk (0-1)
  angle: number;
  length: number;
  thickness: number;
}

interface Driftwood {
  x: number;
  y: number;
  length: number;
  angle: number;
  thickness: number;
  branches: DriftwoodBranch[];
  depth: number;
}

export class EnvironmentRenderer {
  private plants: Plant[] = [];
  private rocks: Rock[] = [];
  private lightRays: LightRay[] = [];
  private pebbles: Pebble[] = [];
  private driftwood: Driftwood[] = [];
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
    const plantPositions = [
      { x: 0.02, back: true },
      { x: 0.08, back: false },
      { x: 0.14, back: true },
      { x: 0.22, back: false },
      { x: 0.30, back: true },
      { x: 0.38, back: false },
      { x: 0.48, back: true },
      { x: 0.55, back: false },
      { x: 0.65, back: true },
      { x: 0.72, back: false },
      { x: 0.80, back: true },
      { x: 0.88, back: false },
      { x: 0.94, back: true },
    ];
    const greens = ['#1a5c2a', '#2d7a3e', '#1e6830', '#3a8c4f', '#245c32', '#4a9c5c'];
    plantPositions.forEach((pos) => {
      const depth = pos.back ? 0.6 + Math.random() * 0.2 : 0.1 + Math.random() * 0.2;
      const x = left + width * (pos.x + (Math.random() - 0.5) * 0.03);
      const height = 120 + Math.random() * 160;
      const segments = 6 + Math.floor(Math.random() * 5);
      const color = pos.back
        ? '#1a4c2a'  // muted for back
        : greens[Math.floor(Math.random() * greens.length)]!;

      this.plants.push({
        x,
        baseY: bottom - depth * 20,
        height,
        segments,
        color,
        phase: Math.random() * Math.PI * 2,
        amplitude: 6 + Math.random() * 12,
        period: 3 + Math.random() * 3,
        width: 4 + Math.random() * 5,
        depth,
        type: 'grass',
      });
    });

    // Bushy plants (3-4): shorter, wider, radiating fronds with leaf-tip ellipses
    const bushyGreens = ['#2a7a3a', '#3a9c4f', '#1e8830', '#4aac5c'];
    const bushyCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < bushyCount; i++) {
      const bx = left + width * (0.15 + i * 0.22 + (Math.random() - 0.5) * 0.08);
      const depth = 0.2 + Math.random() * 0.3;
      this.plants.push({
        x: bx,
        baseY: bottom - depth * 20,
        height: 60 + Math.random() * 40,
        segments: 5,
        color: bushyGreens[Math.floor(Math.random() * bushyGreens.length)]!,
        phase: Math.random() * Math.PI * 2,
        amplitude: 4 + Math.random() * 6,
        period: 4 + Math.random() * 3,
        width: 3 + Math.random() * 3,
        depth,
        type: 'bushy',
      });
    }

    // Carpet plants (8-12): very short, bright green, minimal sway, foreground
    const carpetGreens = ['#3aaa50', '#4abb60', '#50cc70', '#45b855'];
    const carpetCount = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < carpetCount; i++) {
      const cx = left + Math.random() * width;
      const depth = 0.05 + Math.random() * 0.1;
      this.plants.push({
        x: cx,
        baseY: bottom - depth * 20,
        height: 10 + Math.random() * 10,
        segments: 3,
        color: carpetGreens[Math.floor(Math.random() * carpetGreens.length)]!,
        phase: Math.random() * Math.PI * 2,
        amplitude: 1 + Math.random() * 2,
        period: 5 + Math.random() * 3,
        width: 1.5 + Math.random() * 1.5,
        depth,
        type: 'carpet',
      });
    }

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
        depth: 0.35 + Math.random() * 0.2,
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
      depth: 0.4 + Math.random() * 0.1,
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
        period2: 7 + Math.random() * 6,
        phase2: Math.random() * Math.PI * 2,
        widthPeriod: 10 + Math.random() * 10,
        widthPhase: Math.random() * Math.PI * 2,
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
        color: PEBBLE_COLORS[Math.floor(Math.random() * PEBBLE_COLORS.length)]!,
      });
    }

    // Driftwood (1 piece)
    this.driftwood = [];
    const dwX = left + width * 0.35;
    const dwY = bottom - 25;
    const dwLength = 80 + Math.random() * 40;
    const dwAngle = -0.35 + Math.random() * 0.15; // roughly -20 degrees
    const branchCount = 2 + Math.floor(Math.random() * 2); // 2-3
    const branches: DriftwoodBranch[] = [];
    for (let b = 0; b < branchCount; b++) {
      branches.push({
        startT: 0.3 + b * 0.25 + Math.random() * 0.1,
        angle: (Math.random() > 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.5),
        length: 20 + Math.random() * 25,
        thickness: 2 + Math.random() * 2,
      });
    }
    this.driftwood.push({
      x: dwX,
      y: dwY,
      length: dwLength,
      angle: dwAngle,
      thickness: 6 + Math.random() * 3,
      branches,
      depth: 0.35 + Math.random() * 0.15,
    });

    // Aerator position
    this.aeratorX = left + width * 0.8;
  }

  get obstacleData(): Array<{ x: number; y: number; width: number; height: number }> {
    const obstacles = this.rocks.map(r => ({ x: r.x, y: r.y, width: r.width, height: r.height }));
    for (const dw of this.driftwood) {
      obstacles.push({
        x: dw.x + Math.cos(dw.angle) * dw.length * 0.5,
        y: dw.y + Math.sin(dw.angle) * dw.length * 0.5,
        width: dw.length * 0.8,
        height: dw.thickness * 3,
      });
    }
    return obstacles;
  }

  get plantData(): Array<{ x: number; baseY: number; height: number; depth: number }> {
    return this.plants.map(p => ({ x: p.x, baseY: p.baseY, height: p.height, depth: p.depth }));
  }

  get aeratorPosition(): { x: number; y: number } {
    return { x: this.aeratorX, y: this.bounds.bottom };
  }

  getDepthRenderables(ctx: CanvasRenderingContext2D, time: number): Array<{ depth: number; render: () => void }> {
    const items: Array<{ depth: number; render: () => void }> = [];

    for (const plant of this.plants) {
      items.push({
        depth: plant.depth,
        render: () => this.renderPlant(ctx, time, plant),
      });
    }

    for (const rock of this.rocks) {
      items.push({
        depth: rock.depth,
        render: () => this.renderRock(ctx, rock),
      });
    }

    for (const dw of this.driftwood) {
      items.push({
        depth: dw.depth,
        render: () => this.renderDriftwood(ctx, dw),
      });
    }

    // Aerator stone
    items.push({
      depth: 0.45,
      render: () => this.renderAerator(ctx),
    });

    return items;
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
    const depthSlope = 20; // how far the substrate recedes upward

    // Upper slope — fades from transparent to substrate color, giving depth
    const slopeGrad = ctx.createLinearGradient(0, bottom - depthSlope, 0, bottom);
    slopeGrad.addColorStop(0, 'rgba(138, 122, 90, 0)');
    slopeGrad.addColorStop(0.5, 'rgba(138, 122, 90, 0.4)');
    slopeGrad.addColorStop(1, 'rgba(138, 122, 90, 1)');
    ctx.fillStyle = slopeGrad;
    ctx.fillRect(0, bottom - depthSlope, canvasW, depthSlope);

    // Main substrate — fill to bottom of canvas
    const grad = ctx.createLinearGradient(0, bottom, 0, canvasH);
    grad.addColorStop(0, '#8a7a5a');
    grad.addColorStop(0.3, '#7a6a4a');
    grad.addColorStop(1, '#5a4a30');
    ctx.fillStyle = grad;
    ctx.fillRect(0, bottom, canvasW, canvasH - bottom);

    // Pebbles
    for (const pebble of this.pebbles) {
      ctx.fillStyle = pebble.color;
      ctx.beginPath();
      ctx.ellipse(pebble.x, pebble.y, pebble.rx, pebble.ry, pebble.angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderLightRays(ctx: CanvasRenderingContext2D, time: number, canvasH: number): void {
    for (const ray of this.lightRays) {
      // Compound sine sway
      const sway = Math.sin(time / ray.period + ray.phase) * 12
        + Math.sin(time / ray.period2 + ray.phase2) * 6;
      const x = ray.x + sway;

      // Breathing width
      const widthScale = 1 + Math.sin(time / ray.widthPeriod + ray.widthPhase) * 0.15;
      const topW = ray.width * 0.4 * widthScale;
      const bottomW = ray.width * 1.5 * widthScale;
      const height = canvasH * 0.8;

      ctx.save();
      ctx.globalAlpha = ray.opacity;
      ctx.translate(x, 0);
      ctx.rotate(ray.angle);

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(255, 230, 180, 1)');
      grad.addColorStop(0.5, 'rgba(255, 230, 180, 0.5)');
      grad.addColorStop(1, 'rgba(255, 230, 180, 0)');

      // Curved edges with quadraticCurveTo for slight waviness
      const midY = height * 0.5;
      const edgeWave = Math.sin(time * 0.3 + ray.phase) * 3;
      ctx.beginPath();
      ctx.moveTo(-topW / 2, 0);
      ctx.lineTo(topW / 2, 0);
      ctx.quadraticCurveTo(bottomW / 2 + edgeWave, midY, bottomW / 2, height);
      ctx.lineTo(-bottomW / 2, height);
      ctx.quadraticCurveTo(-bottomW / 2 - edgeWave, midY, -topW / 2, 0);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.restore();
    }
  }

  private renderPlant(ctx: CanvasRenderingContext2D, time: number, plant: Plant): void {
    if (plant.type === 'bushy') {
      this.renderBushyPlant(ctx, time, plant);
    } else if (plant.type === 'carpet') {
      this.renderCarpetPlant(ctx, time, plant);
    } else {
      this.renderGrassPlant(ctx, time, plant);
    }
  }

  private renderGrassPlant(ctx: CanvasRenderingContext2D, time: number, plant: Plant): void {
    ctx.save();
    ctx.globalAlpha = 0.9 - plant.depth * 0.4;

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

      if (plant.height > 100) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, plant.width * 0.8, 3, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = plant.color;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderBushyPlant(ctx: CanvasRenderingContext2D, time: number, plant: Plant): void {
    ctx.save();
    ctx.globalAlpha = 0.9 - plant.depth * 0.4;
    ctx.lineCap = 'round';

    const frondCount = 5 + Math.floor(plant.phase * 2) % 3; // 5-7 based on phase seed
    for (let i = 0; i < frondCount; i++) {
      const angle = ((i / frondCount) - 0.5) * Math.PI * 0.8; // spread in arc
      const frondPhase = plant.phase + i * 1.2;
      const sway = Math.sin(time / plant.period + frondPhase) * plant.amplitude * 0.5;

      const tipX = plant.x + Math.sin(angle + sway * 0.02) * plant.height * 0.6;
      const tipY = plant.baseY - Math.cos(angle) * plant.height;

      ctx.strokeStyle = plant.color;
      ctx.lineWidth = plant.width * (1 - i * 0.08);
      ctx.beginPath();
      ctx.moveTo(plant.x, plant.baseY);
      ctx.quadraticCurveTo(
        plant.x + sway + (tipX - plant.x) * 0.3,
        plant.baseY - plant.height * 0.6,
        tipX + sway,
        tipY,
      );
      ctx.stroke();

      // Leaf-tip ellipse
      ctx.beginPath();
      ctx.ellipse(tipX + sway, tipY, plant.width * 1.5, plant.width * 0.7, angle, 0, Math.PI * 2);
      ctx.fillStyle = plant.color;
      ctx.fill();
    }

    ctx.restore();
  }

  private renderCarpetPlant(ctx: CanvasRenderingContext2D, time: number, plant: Plant): void {
    ctx.save();
    ctx.globalAlpha = 0.85 - plant.depth * 0.3;
    ctx.strokeStyle = plant.color;
    ctx.lineCap = 'round';
    ctx.lineWidth = plant.width;

    const bladeCount = 3 + Math.floor(plant.phase * 2) % 3; // 3-5
    for (let i = 0; i < bladeCount; i++) {
      const offset = (i - bladeCount / 2) * plant.width * 2;
      const sway = Math.sin(time / plant.period + plant.phase + i * 0.5) * plant.amplitude;

      ctx.beginPath();
      ctx.moveTo(plant.x + offset, plant.baseY);
      ctx.lineTo(plant.x + offset + sway, plant.baseY - plant.height);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderRock(ctx: CanvasRenderingContext2D, rock: Rock): void {
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

  private renderDriftwood(ctx: CanvasRenderingContext2D, dw: Driftwood): void {
    ctx.save();

    // Trunk: thick rounded-cap line
    const cos = Math.cos(dw.angle);
    const sin = Math.sin(dw.angle);
    const endX = dw.x + cos * dw.length;
    const endY = dw.y + sin * dw.length;

    ctx.strokeStyle = '#5a4030';
    ctx.lineCap = 'round';
    ctx.lineWidth = dw.thickness;
    ctx.beginPath();
    ctx.moveTo(dw.x, dw.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Subtle grain lines along trunk
    ctx.strokeStyle = 'rgba(80, 55, 30, 0.3)';
    ctx.lineWidth = 0.5;
    for (let g = 0; g < 3; g++) {
      const offsetY = (g - 1) * dw.thickness * 0.25;
      ctx.beginPath();
      ctx.moveTo(dw.x - sin * offsetY, dw.y + cos * offsetY);
      ctx.lineTo(endX - sin * offsetY, endY + cos * offsetY);
      ctx.stroke();
    }

    // Branches
    for (const branch of dw.branches) {
      const bx = dw.x + cos * dw.length * branch.startT;
      const by = dw.y + sin * dw.length * branch.startT;
      const branchAngle = dw.angle + branch.angle;
      const bEndX = bx + Math.cos(branchAngle) * branch.length;
      const bEndY = by + Math.sin(branchAngle) * branch.length;

      ctx.strokeStyle = '#6a5040';
      ctx.lineWidth = branch.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(
        (bx + bEndX) / 2 + Math.sin(branchAngle) * 5,
        (by + bEndY) / 2 - Math.cos(branchAngle) * 5,
        bEndX,
        bEndY,
      );
      ctx.stroke();
    }

    // Top highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = dw.thickness * 0.4;
    ctx.beginPath();
    ctx.moveTo(dw.x - sin * dw.thickness * 0.2, dw.y + cos * dw.thickness * 0.2);
    ctx.lineTo(endX - sin * dw.thickness * 0.2, endY + cos * dw.thickness * 0.2);
    ctx.stroke();

    ctx.restore();
  }

  private renderAerator(ctx: CanvasRenderingContext2D): void {
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

  renderSurfaceShimmer(ctx: CanvasRenderingContext2D, time: number, width: number): void {
    const { top } = this.bounds;
    const bandHeight = 25;

    // Horizontal gradient band at water surface
    const shimmerAlpha = 0.04 + Math.sin(time * 0.4) * 0.02;
    const grad = ctx.createLinearGradient(0, top, 0, top + bandHeight);
    grad.addColorStop(0, `rgba(200, 230, 255, ${shimmerAlpha})`);
    grad.addColorStop(0.5, `rgba(180, 220, 250, ${shimmerAlpha * 0.6})`);
    grad.addColorStop(1, 'rgba(180, 220, 250, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, top, width, bandHeight);

    // 3-5 drifting sparkle highlights
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const sparkleX = (width * 0.15 + i * width * 0.22
        + Math.sin(time * 0.3 + i * 1.7) * width * 0.05) % width;
      const sparkleY = top + 5 + Math.sin(time * 0.5 + i * 2.3) * 4;
      const sparkleAlpha = 0.06 + Math.sin(time * 0.7 + i * 1.1) * 0.03;
      const sparkleRadius = 8 + Math.sin(time * 0.4 + i) * 3;

      const sGrad = ctx.createRadialGradient(sparkleX, sparkleY, 0, sparkleX, sparkleY, sparkleRadius);
      sGrad.addColorStop(0, `rgba(255, 255, 255, ${sparkleAlpha})`);
      sGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sGrad;
      ctx.fillRect(sparkleX - sparkleRadius, sparkleY - sparkleRadius, sparkleRadius * 2, sparkleRadius * 2);
    }
    ctx.restore();
  }

  renderGlassEdges(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const edgeSize = 40;
    const edgeColor = 'rgba(0, 5, 15, 0.3)';
    const transparent = 'rgba(0, 5, 15, 0)';

    // Left edge
    const leftGrad = ctx.createLinearGradient(0, 0, edgeSize, 0);
    leftGrad.addColorStop(0, edgeColor);
    leftGrad.addColorStop(1, transparent);
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, edgeSize, height);

    // Right edge
    const rightGrad = ctx.createLinearGradient(width, 0, width - edgeSize, 0);
    rightGrad.addColorStop(0, edgeColor);
    rightGrad.addColorStop(1, transparent);
    ctx.fillStyle = rightGrad;
    ctx.fillRect(width - edgeSize, 0, edgeSize, height);

    // Top edge
    const topGrad = ctx.createLinearGradient(0, 0, 0, edgeSize);
    topGrad.addColorStop(0, edgeColor);
    topGrad.addColorStop(1, transparent);
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, edgeSize);

    // Bottom edge
    const bottomGrad = ctx.createLinearGradient(0, height, 0, height - edgeSize);
    bottomGrad.addColorStop(0, edgeColor);
    bottomGrad.addColorStop(1, transparent);
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, height - edgeSize, width, edgeSize);
  }
}
