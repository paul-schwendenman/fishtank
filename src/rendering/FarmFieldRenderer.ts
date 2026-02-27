import { randomRange, randomInt } from '../utils/math';

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  bumps: { dx: number; dy: number; r: number }[];
}

interface HillLayer {
  points: number[];
  color: string;
}

interface FarTree {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface MidTree {
  x: number;
  y: number;
  canopyWidth: number;
  canopyHeight: number;
  trunkWidth: number;
  trunkHeight: number;
  leafColor: string;
  trunkColor: string;
}

interface FencePost {
  x: number;
  y: number;
}

interface Wildflower {
  x: number;
  y: number;
  color: string;
  size: number;
  phase: number;
}

interface GrassBlade {
  x: number;
  y: number;
  height: number;
  width: number;
  phase: number;
  color: string;
}

interface PondData {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  reeds: { x: number; height: number; phase: number }[];
}

export interface PondBounds {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export class FarmFieldRenderer {
  private width: number;
  private height: number;

  // Key y-coordinates
  horizonY: number = 0;
  private backFieldY: number = 0;
  fenceY: number = 0;
  private foreFieldY: number = 0;

  // Pre-generated data
  private clouds: Cloud[] = [];
  private hillLayers: HillLayer[] = [];
  private farTrees: FarTree[] = [];
  midTrees: MidTree[] = [];
  private fencePosts: FencePost[] = [];
  private wildflowers: Wildflower[] = [];
  private foreGrass: GrassBlade[] = [];
  private pond: PondData | null = null;

  // Exposed for scene
  postPositions: { x: number; y: number }[] = [];
  pondBounds: PondBounds | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.generate();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.generate();
  }

  /** Sine-based rolling terrain — horizon edge */
  horizonCurveY(x: number): number {
    const t = x / this.width;
    return this.horizonY
      + Math.sin(t * Math.PI * 1.8 + 0.5) * this.height * 0.008
      + Math.sin(t * Math.PI * 3.2 + 2) * this.height * 0.004;
  }

  /** Sine-based rolling terrain — back/mid field boundary */
  midFieldY(x: number): number {
    const t = x / this.width;
    return this.backFieldY
      + Math.sin(t * Math.PI * 2.0 + 1.2) * this.height * 0.01
      + Math.sin(t * Math.PI * 3.5 + 0.8) * this.height * 0.005;
  }

  /** Sine-based rolling terrain — fence/foreground line */
  groundY(x: number): number {
    const t = x / this.width;
    return this.fenceY
      + Math.sin(t * Math.PI * 2.5) * this.height * 0.015
      + Math.sin(t * Math.PI * 1.3 + 1) * this.height * 0.01;
  }

  private generate(): void {
    this.horizonY = this.height * 0.15;
    this.backFieldY = this.height * 0.45;
    this.fenceY = this.height * 0.72;
    this.foreFieldY = this.height * 0.90;

    this.generateClouds();
    this.generateHills();
    this.generateFarTrees();
    this.generateMidTrees();
    this.generateFence();
    this.generateWildflowers();
    this.generateForeGrass();
    this.generatePond();
  }

  private generateClouds(): void {
    this.clouds = [];
    const count = randomInt(4, 6);
    for (let i = 0; i < count; i++) {
      const bumps: Cloud['bumps'] = [];
      const bumpCount = randomInt(3, 5);
      for (let b = 0; b < bumpCount; b++) {
        bumps.push({
          dx: randomRange(-0.4, 0.4),
          dy: randomRange(-0.3, 0.2),
          r: randomRange(0.3, 0.6),
        });
      }
      this.clouds.push({
        x: randomRange(0, this.width),
        y: randomRange(this.height * 0.05, this.horizonY * 0.7),
        width: randomRange(80, 180),
        height: randomRange(30, 60),
        speed: randomRange(2, 5),
        opacity: randomRange(0.5, 0.85),
        bumps,
      });
    }
  }

  private generateHills(): void {
    this.hillLayers = [];
    const colors = ['#7a9a78', '#6a8a68'];
    for (let layer = 0; layer < 2; layer++) {
      const segments = 30;
      const points: number[] = [];
      const baseY = this.horizonY + layer * this.height * 0.04;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const hill = Math.sin(t * Math.PI * (2.5 + layer * 0.5)) * this.height * 0.04
          + Math.sin(t * Math.PI * (1.2 + layer) + layer * 2) * this.height * 0.025;
        points.push(baseY + hill);
      }
      this.hillLayers.push({ points, color: colors[layer]! });
    }
  }

  private generateFarTrees(): void {
    this.farTrees = [];
    const count = randomInt(6, 10);
    for (let i = 0; i < count; i++) {
      const green = 60 + Math.floor(Math.random() * 30);
      this.farTrees.push({
        x: randomRange(0, this.width),
        y: this.horizonY + randomRange(-5, 15),
        width: randomRange(15, 30),
        height: randomRange(20, 45),
        color: `rgb(${green - 10}, ${green}, ${green - 15})`,
      });
    }
  }

  private generateMidTrees(): void {
    this.midTrees = [];
    const count = randomInt(2, 3);
    const spacing = this.width / (count + 1);
    for (let i = 0; i < count; i++) {
      const x = spacing * (i + 1) + randomRange(-spacing * 0.3, spacing * 0.3);
      const green = 50 + Math.floor(Math.random() * 30);
      this.midTrees.push({
        x,
        y: this.backFieldY + randomRange(-10, 10),
        canopyWidth: randomRange(60, 100),
        canopyHeight: randomRange(50, 80),
        trunkWidth: randomRange(8, 14),
        trunkHeight: randomRange(30, 50),
        leafColor: `rgb(${green - 5}, ${green + 20}, ${green - 10})`,
        trunkColor: `rgb(${80 + Math.floor(Math.random() * 20)}, ${65 + Math.floor(Math.random() * 15)}, ${50 + Math.floor(Math.random() * 10)})`,
      });
    }
  }

  private generateFence(): void {
    this.fencePosts = [];
    this.postPositions = [];
    const postSpacing = 80 + Math.random() * 20;
    const postCount = Math.ceil(this.width / postSpacing) + 1;
    for (let i = 0; i < postCount; i++) {
      const x = i * postSpacing;
      const y = this.groundY(x);
      this.fencePosts.push({ x, y });
      this.postPositions.push({ x, y: y - 25 }); // top of post for birds
    }
  }

  private generateWildflowers(): void {
    this.wildflowers = [];
    const colors = ['#e8d040', '#d070d0', '#f0f0f0', '#e0a030', '#80a0e0'];
    const count = randomInt(40, 70);
    for (let i = 0; i < count; i++) {
      const x = randomRange(0, this.width);
      const y = randomRange(this.fenceY + 10, this.foreFieldY + 20);
      this.wildflowers.push({
        x,
        y: this.groundY(x) + (y - this.fenceY),
        color: colors[Math.floor(Math.random() * colors.length)]!,
        size: randomRange(2, 5),
        phase: randomRange(0, Math.PI * 2),
      });
    }
  }

  private generateForeGrass(): void {
    this.foreGrass = [];
    const count = Math.ceil(this.width / 4);
    for (let i = 0; i < count; i++) {
      const x = (i / count) * this.width + randomRange(-3, 3);
      const greens = ['#2a6a20', '#3a7a30', '#2a5a1a', '#3a8a38'];
      this.foreGrass.push({
        x,
        y: this.foreFieldY + randomRange(0, this.height - this.foreFieldY),
        height: randomRange(15, 40),
        width: randomRange(1.5, 3.5),
        phase: randomRange(0, Math.PI * 2),
        color: greens[Math.floor(Math.random() * greens.length)]!,
      });
    }
  }

  private generatePond(): void {
    // Place pond off to one side in the mid-ground
    const side = Math.random() < 0.5 ? 0.25 : 0.75;
    const cx = this.width * side;
    const cy = (this.backFieldY + this.fenceY) / 2 + randomRange(-10, 10);
    const rx = randomRange(50, 80);
    const ry = randomRange(25, 40);

    this.pondBounds = { cx, cy, rx, ry };

    const reeds: PondData['reeds'] = [];
    const reedCount = randomInt(3, 6);
    for (let i = 0; i < reedCount; i++) {
      const angle = randomRange(-0.6, 0.6) + (Math.random() < 0.5 ? 0 : Math.PI);
      reeds.push({
        x: cx + Math.cos(angle) * (rx + randomRange(-5, 8)),
        height: randomRange(18, 35),
        phase: randomRange(0, Math.PI * 2),
      });
    }

    this.pond = { cx, cy, rx, ry, reeds };
  }

  // --- Render methods (called in layer order by scene) ---

  renderSky(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.horizonY + this.height * 0.02);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(0.6, '#b0d8f0');
    grad.addColorStop(1, '#e8e0d0');
    ctx.fillStyle = grad;
    // Fill generously — the back field will paint over the bottom edge
    ctx.fillRect(0, 0, this.width, this.horizonY + this.height * 0.03);
  }

  renderClouds(ctx: CanvasRenderingContext2D, _time: number): void {
    for (const cloud of this.clouds) {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.translate(cloud.x, cloud.y);

      // Draw cloud as overlapping ellipses
      ctx.fillStyle = '#fff';
      // Main body
      ctx.beginPath();
      ctx.ellipse(0, 0, cloud.width * 0.5, cloud.height * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      for (const bump of cloud.bumps) {
        ctx.beginPath();
        ctx.ellipse(
          bump.dx * cloud.width,
          bump.dy * cloud.height,
          cloud.width * bump.r,
          cloud.height * bump.r * 0.6,
          0, 0, Math.PI * 2,
        );
        ctx.fill();
      }

      ctx.restore();
    }
  }

  renderDistantHills(ctx: CanvasRenderingContext2D): void {
    for (const layer of this.hillLayers) {
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.moveTo(0, this.height);
      const segCount = layer.points.length - 1;
      for (let i = 0; i <= segCount; i++) {
        ctx.lineTo((i / segCount) * this.width, layer.points[i]!);
      }
      ctx.lineTo(this.width, this.height);
      ctx.closePath();
      ctx.fill();
    }
  }

  renderFarTrees(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 0.6;
    for (const tree of this.farTrees) {
      // Draw trunk + canopy as a single path so alpha doesn't compound
      const trunkWidth = tree.width * 0.3;
      const trunkBottom = tree.y + 20;
      const cx = tree.x;
      const cy = tree.y - tree.height * 0.5;
      ctx.fillStyle = tree.color;
      ctx.beginPath();
      ctx.ellipse(cx, cy, tree.width * 0.5, tree.height * 0.5, 0, 0, Math.PI * 2);
      ctx.rect(cx - trunkWidth / 2, cy, trunkWidth, trunkBottom - cy);
      ctx.fill();
    }
    ctx.restore();
  }

  renderBackField(ctx: CanvasRenderingContext2D): void {
    const steps = Math.ceil(this.width / 4);
    // Lighter green pasture with curved top edge
    const grad = ctx.createLinearGradient(0, this.horizonY, 0, this.backFieldY);
    grad.addColorStop(0, '#7ab868');
    grad.addColorStop(1, '#68a858');
    ctx.fillStyle = grad;
    ctx.beginPath();
    // Top edge follows horizon curve
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * this.width;
      const y = this.horizonCurveY(x);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Bottom edge follows mid-field curve (right to left)
    for (let i = steps; i >= 0; i--) {
      const x = (i / steps) * this.width;
      ctx.lineTo(x, this.midFieldY(x));
    }
    ctx.closePath();
    ctx.fill();
  }

  renderMidTree(ctx: CanvasRenderingContext2D, tree: MidTree): void {
    // Trunk
    ctx.fillStyle = tree.trunkColor;
    ctx.fillRect(
      tree.x - tree.trunkWidth / 2,
      tree.y - tree.trunkHeight,
      tree.trunkWidth,
      tree.trunkHeight,
    );

    // Canopy — overlapping circles
    ctx.fillStyle = tree.leafColor;
    const cx = tree.x;
    const cy = tree.y - tree.trunkHeight - tree.canopyHeight * 0.3;

    ctx.beginPath();
    ctx.ellipse(cx, cy, tree.canopyWidth * 0.5, tree.canopyHeight * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - tree.canopyWidth * 0.25, cy + tree.canopyHeight * 0.1, tree.canopyWidth * 0.35, tree.canopyHeight * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + tree.canopyWidth * 0.25, cy + tree.canopyHeight * 0.05, tree.canopyWidth * 0.35, tree.canopyHeight * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shadow on grass
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(tree.x + 10, tree.y + 3, tree.canopyWidth * 0.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderMidField(ctx: CanvasRenderingContext2D): void {
    const steps = Math.ceil(this.width / 4);
    // Richer green mid-field with curved edges
    const grad = ctx.createLinearGradient(0, this.backFieldY, 0, this.fenceY);
    grad.addColorStop(0, '#58a048');
    grad.addColorStop(1, '#4a9040');
    ctx.fillStyle = grad;
    ctx.beginPath();
    // Top edge follows mid-field curve
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * this.width;
      const y = this.midFieldY(x);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Bottom edge follows ground/fence curve (right to left)
    for (let i = steps; i >= 0; i--) {
      const x = (i / steps) * this.width;
      ctx.lineTo(x, this.groundY(x));
    }
    ctx.closePath();
    ctx.fill();

    // Subtle grass texture lines
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#2a5a20';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 12) {
      const y1 = this.backFieldY + randomRange(0, this.fenceY - this.backFieldY);
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x + randomRange(-3, 3), y1 - randomRange(3, 8));
      ctx.stroke();
    }
    ctx.restore();
  }

  renderPond(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.pond) return;
    const { cx, cy, rx, ry, reeds } = this.pond;

    // Muddy bank edge
    ctx.save();
    ctx.fillStyle = '#6a5a40';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx + 6, ry + 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.save();
    ctx.clip();

    // Water gradient
    const waterGrad = ctx.createRadialGradient(cx, cy - ry * 0.3, 0, cx, cy, Math.max(rx, ry));
    waterGrad.addColorStop(0, '#3a6878');
    waterGrad.addColorStop(0.5, '#2a5868');
    waterGrad.addColorStop(1, '#1a4858');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);

    // Sky reflection
    ctx.globalAlpha = 0.15;
    const refGrad = ctx.createLinearGradient(cx, cy - ry, cx, cy + ry);
    refGrad.addColorStop(0, '#87CEEB');
    refGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = refGrad;
    ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);

    // Ripple lines
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#8ab8c8';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const rippleY = cy + Math.sin(time * 0.5 + i * 1.5) * ry * 0.4;
      ctx.beginPath();
      ctx.moveTo(cx - rx * 0.7, rippleY);
      ctx.quadraticCurveTo(cx, rippleY + Math.sin(time * 0.8 + i) * 3, cx + rx * 0.7, rippleY);
      ctx.stroke();
    }

    ctx.restore(); // remove clip
    ctx.restore();

    // Cattails/reeds
    for (const reed of reeds) {
      const sway = Math.sin(time * 0.8 + reed.phase) * 3;
      ctx.strokeStyle = '#4a6a30';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(reed.x, cy + ry * 0.3);
      ctx.quadraticCurveTo(
        reed.x + sway,
        cy + ry * 0.3 - reed.height * 0.6,
        reed.x + sway * 1.3,
        cy + ry * 0.3 - reed.height,
      );
      ctx.stroke();

      // Cattail top
      ctx.fillStyle = '#5a3a20';
      ctx.beginPath();
      ctx.ellipse(
        reed.x + sway * 1.3,
        cy + ry * 0.3 - reed.height - 4,
        2.5, 6, 0, 0, Math.PI * 2,
      );
      ctx.fill();
    }
  }

  renderFence(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    for (let i = 0; i < this.fencePosts.length; i++) {
      const post = this.fencePosts[i]!;

      // Post
      ctx.fillStyle = '#8a7a60';
      ctx.fillRect(post.x - 3, post.y - 30, 6, 30);

      // Post top cap
      ctx.fillStyle = '#7a6a50';
      ctx.fillRect(post.x - 4, post.y - 32, 8, 4);

      // Rails to next post
      if (i < this.fencePosts.length - 1) {
        const next = this.fencePosts[i + 1]!;

        // Top rail
        ctx.strokeStyle = '#8a7a60';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(post.x, post.y - 24);
        ctx.lineTo(next.x, next.y - 24);
        ctx.stroke();

        // Bottom rail
        ctx.beginPath();
        ctx.moveTo(post.x, post.y - 12);
        ctx.lineTo(next.x, next.y - 12);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  renderForeField(ctx: CanvasRenderingContext2D, time: number): void {
    // Darker foreground green — follows groundY contour
    const grad = ctx.createLinearGradient(0, this.fenceY, 0, this.height);
    grad.addColorStop(0, '#408838');
    grad.addColorStop(1, '#306828');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    const steps = Math.ceil(this.width / 4);
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * this.width;
      ctx.lineTo(x, this.groundY(x));
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();

    // Wildflowers
    for (const flower of this.wildflowers) {
      const bob = Math.sin(time * 1.5 + flower.phase) * 2;
      ctx.fillStyle = flower.color;
      ctx.beginPath();
      ctx.arc(flower.x, flower.y + bob, flower.size, 0, Math.PI * 2);
      ctx.fill();

      // Tiny center
      if (flower.size > 3) {
        ctx.fillStyle = '#e8d040';
        ctx.beginPath();
        ctx.arc(flower.x, flower.y + bob, flower.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderForeGrass(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.lineCap = 'round';
    for (const blade of this.foreGrass) {
      const sway = Math.sin(time * 1.2 + blade.phase) * 5;
      ctx.strokeStyle = blade.color;
      ctx.lineWidth = blade.width;
      ctx.beginPath();
      ctx.moveTo(blade.x, blade.y);
      ctx.quadraticCurveTo(
        blade.x + sway,
        blade.y - blade.height * 0.6,
        blade.x + sway * 1.4,
        blade.y - blade.height,
      );
      ctx.stroke();
    }
  }

  updateClouds(dt: number): void {
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * dt;
      // Wrap
      if (cloud.x > this.width + cloud.width) {
        cloud.x = -cloud.width;
        cloud.y = randomRange(this.height * 0.05, this.horizonY * 0.7);
      }
    }
  }
}
