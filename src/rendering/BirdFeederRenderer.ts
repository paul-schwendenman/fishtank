import { randomRange, randomInt } from '../utils/math';
import type { PerchPoint } from '../entities/PerchPoint';

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  bumps: { dx: number; dy: number; r: number }[];
}

interface TreeData {
  x: number;
  trunkWidth: number;
  trunkTop: number;
  trunkBottom: number;
  trunkColor: string;
  canopyX: number;
  canopyY: number;
  canopyW: number;
  canopyH: number;
  leafColor: string;
  branches: { x: number; y: number; endX: number; endY: number; width: number }[];
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

interface SeedSpeck {
  x: number;
  y: number;
  size: number;
  color: string;
}

export class BirdFeederRenderer {
  private width: number;
  private height: number;

  // Key y-coordinates
  groundY: number = 0;
  private horizonY: number = 0;
  private treelineY: number = 0;
  private lawnTopY: number = 0;
  private fenceY: number = 0;
  private foreGrassY: number = 0;

  // Pre-generated data
  private clouds: Cloud[] = [];
  private leftTree!: TreeData;
  private rightTree!: TreeData;
  private fencePosts: FencePost[] = [];
  private wildflowers: Wildflower[] = [];
  private foreGrass: GrassBlade[] = [];
  private groundSeeds: SeedSpeck[] = [];

  // Feeder positions (computed on generate)
  private tubeFeederX: number = 0;
  private tubeFeederY: number = 0;
  private platformX: number = 0;
  private platformY: number = 0;
  private bathX: number = 0;
  private bathY: number = 0;
  private suetX: number = 0;
  private suetY: number = 0;
  private jellyX: number = 0;
  private jellyY: number = 0;

  // Exposed for scene
  perchPoints: PerchPoint[] = [];

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

  private generate(): void {
    this.horizonY = this.height * 0.12;
    this.treelineY = this.height * 0.16;
    this.lawnTopY = this.height * 0.25;
    this.fenceY = this.height * 0.52;
    this.groundY = this.height * 0.68;
    this.foreGrassY = this.height * 0.88;

    this.generateClouds();
    this.generateTrees();
    this.generateFeeders();
    this.generateFence();
    this.generateWildflowers();
    this.generateForeGrass();
    this.generateGroundSeeds();
    this.generatePerchPoints();
  }

  private generateClouds(): void {
    this.clouds = [];
    const count = randomInt(3, 5);
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
        y: randomRange(this.height * 0.03, this.horizonY * 0.8),
        width: randomRange(80, 160),
        height: randomRange(25, 50),
        speed: randomRange(2, 4),
        opacity: randomRange(0.4, 0.7),
        bumps,
      });
    }
  }

  private generateTrees(): void {
    const treeBottomY = this.groundY;

    // Left tree at ~18% — large backyard tree
    const lx = this.width * 0.18;
    const lTrunkW = Math.max(5, this.width * 0.007); // narrow trunk
    // Canopy is the dominant visual — wide and tall
    const lCanopyW = this.width * 0.18;
    const lCanopyH = this.height * 0.30;
    // Canopy center sits above the fence, trunk visible below it
    const lCanopyCenterY = this.fenceY - this.height * 0.18;
    const lTrunkTop = lCanopyCenterY + lCanopyH * 0.15; // trunk disappears into canopy

    const leftBranches = [
      // Branch for jelly station — extends to the right from canopy area
      { x: lx, y: this.fenceY - this.height * 0.10, endX: lx + this.width * 0.08, endY: this.fenceY - this.height * 0.12, width: 7 },
      // Upper branch left
      { x: lx, y: lCanopyCenterY + lCanopyH * 0.08, endX: lx - this.width * 0.07, endY: lCanopyCenterY + lCanopyH * 0.02, width: 6 },
      // Upper branch right
      { x: lx, y: lCanopyCenterY + lCanopyH * 0.02, endX: lx + this.width * 0.06, endY: lCanopyCenterY - lCanopyH * 0.05, width: 5 },
    ];

    this.leftTree = {
      x: lx,
      trunkWidth: lTrunkW,
      trunkTop: lTrunkTop,
      trunkBottom: treeBottomY,
      trunkColor: '#6a5a45',
      canopyX: lx,
      canopyY: lCanopyCenterY,
      canopyW: lCanopyW,
      canopyH: lCanopyH,
      leafColor: '#3a7a30',
      branches: leftBranches,
    };

    // Right tree at ~82% — slightly smaller
    const rx = this.width * 0.82;
    const rTrunkW = Math.max(4, this.width * 0.006);
    const rCanopyW = this.width * 0.15;
    const rCanopyH = this.height * 0.26;
    const rCanopyCenterY = this.fenceY - this.height * 0.15;
    const rTrunkTop = rCanopyCenterY + rCanopyH * 0.15;

    const rightBranches = [
      // Branch left side (perch points)
      { x: rx, y: rCanopyCenterY + rCanopyH * 0.12, endX: rx - this.width * 0.07, endY: rCanopyCenterY + rCanopyH * 0.06, width: 6 },
      // Branch right side
      { x: rx, y: rCanopyCenterY + rCanopyH * 0.05, endX: rx + this.width * 0.05, endY: rCanopyCenterY - rCanopyH * 0.02, width: 5 },
      // Lower branch for perching
      { x: rx, y: this.fenceY - this.height * 0.04, endX: rx - this.width * 0.06, endY: this.fenceY - this.height * 0.07, width: 6 },
    ];

    this.rightTree = {
      x: rx,
      trunkWidth: rTrunkW,
      trunkTop: rTrunkTop,
      trunkBottom: treeBottomY,
      trunkColor: '#5a4a3a',
      canopyX: rx,
      canopyY: rCanopyCenterY,
      canopyW: rCanopyW,
      canopyH: rCanopyH,
      leafColor: '#358a28',
      branches: rightBranches,
    };
  }

  private generateFeeders(): void {
    // Platform feeder — center-left ~35%
    this.platformX = this.width * 0.35;
    this.platformY = this.fenceY + (this.groundY - this.fenceY) * 0.25;

    // Bird bath — center ~50%
    this.bathX = this.width * 0.50;
    this.bathY = this.groundY - 5;

    // Tube feeder — center-right ~65%
    this.tubeFeederX = this.width * 0.65;
    this.tubeFeederY = this.fenceY + (this.groundY - this.fenceY) * 0.15;

    // Suet cage — right tree trunk
    this.suetX = this.rightTree.x + this.rightTree.trunkWidth * 0.8;
    this.suetY = this.fenceY - this.height * 0.01;

    // Jelly station — hanging from left tree branch
    const jellyBranch = this.leftTree.branches[0]!;
    this.jellyX = jellyBranch.endX;
    this.jellyY = jellyBranch.endY + 15;
  }

  private generateFence(): void {
    this.fencePosts = [];
    const postSpacing = 70 + Math.random() * 15;
    const postCount = Math.ceil(this.width / postSpacing) + 1;
    for (let i = 0; i < postCount; i++) {
      const x = i * postSpacing;
      this.fencePosts.push({ x, y: this.fenceY });
    }
  }

  private generateWildflowers(): void {
    this.wildflowers = [];
    const colors = ['#e8d040', '#d070d0', '#f0f0f0', '#e0a030', '#80a0e0'];
    const count = randomInt(20, 35);
    for (let i = 0; i < count; i++) {
      const x = randomRange(0, this.width);
      const y = randomRange(this.groundY + 5, this.foreGrassY);
      this.wildflowers.push({
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        size: randomRange(2, 4),
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
        y: this.foreGrassY + randomRange(0, this.height - this.foreGrassY),
        height: randomRange(18, 45),
        width: randomRange(1.5, 3.5),
        phase: randomRange(0, Math.PI * 2),
        color: greens[Math.floor(Math.random() * greens.length)]!,
      });
    }
  }

  private generateGroundSeeds(): void {
    this.groundSeeds = [];
    // Seeds beneath feeders
    const seedAreas = [
      { cx: this.platformX, cy: this.groundY + 8, rx: 30, ry: 8, count: randomInt(8, 14) },
      { cx: this.tubeFeederX, cy: this.groundY + 8, rx: 25, ry: 8, count: randomInt(6, 10) },
      { cx: this.bathX, cy: this.groundY + 8, rx: 20, ry: 6, count: randomInt(4, 8) },
    ];
    const seedColors = ['#c8b890', '#b0a078', '#d0c098', '#a89868'];
    for (const area of seedAreas) {
      for (let i = 0; i < area.count; i++) {
        const angle = randomRange(0, Math.PI * 2);
        const dist = Math.random();
        this.groundSeeds.push({
          x: area.cx + Math.cos(angle) * area.rx * dist,
          y: area.cy + Math.sin(angle) * area.ry * dist,
          size: randomRange(1, 2.5),
          color: seedColors[Math.floor(Math.random() * seedColors.length)]!,
        });
      }
    }
  }

  private generatePerchPoints(): void {
    this.perchPoints = [];

    // Tube feeder — 4 perch pegs
    const tubePerchOffsets = [
      { dx: -8, dy: -12 }, { dx: 8, dy: -4 },
      { dx: -8, dy: 4 }, { dx: 8, dy: 12 },
    ];
    for (const off of tubePerchOffsets) {
      this.perchPoints.push({
        x: this.tubeFeederX + off.dx,
        y: this.tubeFeederY + off.dy,
        type: 'feeder-tube',
        facing: off.dx < 0 ? 'right' : 'left',
        occupied: false,
      });
    }

    // Platform feeder — 4 spots
    for (let i = 0; i < 4; i++) {
      this.perchPoints.push({
        x: this.platformX - 15 + i * 10,
        y: this.platformY - 3,
        type: 'feeder-platform',
        occupied: false,
      });
    }

    // Suet cage — 2 spots
    this.perchPoints.push({
      x: this.suetX + 4,
      y: this.suetY - 5,
      type: 'feeder-suet',
      facing: 'left',
      occupied: false,
    });
    this.perchPoints.push({
      x: this.suetX + 4,
      y: this.suetY + 10,
      type: 'feeder-suet',
      facing: 'left',
      occupied: false,
    });

    // Jelly station — 2 spots
    this.perchPoints.push({
      x: this.jellyX - 8,
      y: this.jellyY,
      type: 'feeder-jelly',
      facing: 'right',
      occupied: false,
    });
    this.perchPoints.push({
      x: this.jellyX + 8,
      y: this.jellyY,
      type: 'feeder-jelly',
      facing: 'left',
      occupied: false,
    });

    // Bird bath — 3 rim spots + 1 water
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI * 0.3 + i * Math.PI * 0.3;
      this.perchPoints.push({
        x: this.bathX + Math.cos(angle) * 18,
        y: this.bathY - 18 + Math.sin(angle) * 4,
        type: 'bath-rim',
        occupied: false,
      });
    }
    this.perchPoints.push({
      x: this.bathX,
      y: this.bathY - 14,
      type: 'bath-water',
      occupied: false,
    });

    // Branch perches — from both trees
    for (const branch of this.leftTree.branches) {
      // Perch at ~70% along branch
      this.perchPoints.push({
        x: branch.x + (branch.endX - branch.x) * 0.7,
        y: branch.y + (branch.endY - branch.y) * 0.7 - 4,
        type: 'branch',
        occupied: false,
      });
    }
    for (const branch of this.rightTree.branches) {
      this.perchPoints.push({
        x: branch.x + (branch.endX - branch.x) * 0.7,
        y: branch.y + (branch.endY - branch.y) * 0.7 - 4,
        type: 'branch',
        occupied: false,
      });
    }

    // Trunk perches — left tree
    this.perchPoints.push({
      x: this.leftTree.x - this.leftTree.trunkWidth * 0.5,
      y: this.fenceY - this.height * 0.04,
      type: 'trunk',
      facing: 'left',
      occupied: false,
    });
    this.perchPoints.push({
      x: this.leftTree.x + this.leftTree.trunkWidth * 0.5,
      y: this.fenceY - this.height * 0.08,
      type: 'trunk',
      facing: 'right',
      occupied: false,
    });

    // Trunk perches — right tree
    this.perchPoints.push({
      x: this.rightTree.x - this.rightTree.trunkWidth * 0.5,
      y: this.fenceY - this.height * 0.04,
      type: 'trunk',
      facing: 'left',
      occupied: false,
    });
    this.perchPoints.push({
      x: this.rightTree.x + this.rightTree.trunkWidth * 0.5,
      y: this.fenceY - this.height * 0.08,
      type: 'trunk',
      facing: 'right',
      occupied: false,
    });

    // Fence perches — every other post
    for (let i = 1; i < this.fencePosts.length; i += 2) {
      const post = this.fencePosts[i]!;
      this.perchPoints.push({
        x: post.x,
        y: post.y - 28,
        type: 'fence',
        occupied: false,
      });
    }

    // Ground spots beneath feeders
    const groundSpots = [
      this.platformX - 20, this.platformX, this.platformX + 20,
      this.tubeFeederX - 15, this.tubeFeederX + 15,
      this.bathX - 25, this.bathX + 25,
    ];
    for (const gx of groundSpots) {
      this.perchPoints.push({
        x: gx,
        y: this.groundY + 5,
        type: 'ground',
        occupied: false,
      });
    }
  }

  // --- Update ---

  updateClouds(dt: number): void {
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * dt;
      if (cloud.x > this.width + cloud.width) {
        cloud.x = -cloud.width;
        cloud.y = randomRange(this.height * 0.03, this.horizonY * 0.8);
      }
    }
  }

  // --- Render methods (called in layer order by scene) ---

  renderSky(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, 0, 0, this.lawnTopY);
    grad.addColorStop(0, '#8ac4e8');
    grad.addColorStop(0.5, '#b0d8f0');
    grad.addColorStop(1, '#e8e4d8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.lawnTopY);
  }

  renderClouds(ctx: CanvasRenderingContext2D): void {
    for (const cloud of this.clouds) {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.translate(cloud.x, cloud.y);
      ctx.fillStyle = '#fff';
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

  renderTreeline(ctx: CanvasRenderingContext2D): void {
    // Distant tree silhouettes along horizon
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#4a6a58';
    ctx.beginPath();
    ctx.moveTo(0, this.treelineY + 10);
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = t * this.width;
      const y = this.treelineY
        + Math.sin(t * Math.PI * 8) * 4
        + Math.sin(t * Math.PI * 3 + 1) * 6
        + Math.sin(t * Math.PI * 13 + 2) * 2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.treelineY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderBackLawn(ctx: CanvasRenderingContext2D): void {
    const grad = ctx.createLinearGradient(0, this.treelineY, 0, this.groundY);
    grad.addColorStop(0, '#78b060');
    grad.addColorStop(0.4, '#68a850');
    grad.addColorStop(1, '#58a040');
    ctx.fillStyle = grad;
    ctx.fillRect(0, this.treelineY, this.width, this.groundY - this.treelineY);
  }

  renderTreeTrunks(ctx: CanvasRenderingContext2D): void {
    for (const tree of [this.leftTree, this.rightTree]) {
      // Trunk — slight taper (wider at base)
      const baseHalfW = tree.trunkWidth * 1.3;
      const topHalfW = tree.trunkWidth * 0.8;
      ctx.fillStyle = tree.trunkColor;
      ctx.beginPath();
      ctx.moveTo(tree.x - topHalfW, tree.trunkTop);
      ctx.lineTo(tree.x + topHalfW, tree.trunkTop);
      ctx.lineTo(tree.x + baseHalfW, tree.trunkBottom);
      ctx.lineTo(tree.x - baseHalfW, tree.trunkBottom);
      ctx.closePath();
      ctx.fill();

      // Bark texture
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 1;
      for (let y = tree.trunkTop + 8; y < tree.trunkBottom; y += 10) {
        const t = (y - tree.trunkTop) / (tree.trunkBottom - tree.trunkTop);
        const hw = topHalfW + (baseHalfW - topHalfW) * t;
        ctx.beginPath();
        ctx.moveTo(tree.x - hw * 0.7, y);
        ctx.lineTo(tree.x + hw * 0.7, y);
        ctx.stroke();
      }
      ctx.restore();

      // Branches — draw with taper using a filled quad
      for (const branch of tree.branches) {
        const dx = branch.endX - branch.x;
        const dy = branch.endY - branch.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) continue;
        // Perpendicular direction
        const nx = -dy / len;
        const ny = dx / len;
        const startW = branch.width * 0.5;
        const endW = branch.width * 0.2;

        ctx.fillStyle = tree.trunkColor;
        ctx.beginPath();
        ctx.moveTo(branch.x + nx * startW, branch.y + ny * startW);
        ctx.lineTo(branch.endX + nx * endW, branch.endY + ny * endW);
        ctx.lineTo(branch.endX - nx * endW, branch.endY - ny * endW);
        ctx.lineTo(branch.x - nx * startW, branch.y - ny * startW);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  renderFeeders(ctx: CanvasRenderingContext2D, time: number): void {
    this.renderTubeFeeder(ctx);
    this.renderPlatformFeeder(ctx);
    this.renderSuetCage(ctx);
    this.renderJellyStation(ctx);
    this.renderBirdBath(ctx, time);
  }

  private renderTubeFeeder(ctx: CanvasRenderingContext2D): void {
    const x = this.tubeFeederX;
    const topY = this.tubeFeederY - 25;
    const bottomY = this.tubeFeederY + 25;

    // Shepherd's hook pole
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, this.groundY);
    ctx.lineTo(x, topY - 15);
    // Hook curve
    ctx.quadraticCurveTo(x, topY - 25, x - 8, topY - 20);
    ctx.stroke();

    // Tube body (seed visible inside)
    ctx.fillStyle = 'rgba(200, 210, 200, 0.3)';
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(x - 7, topY, 14, bottomY - topY);
    ctx.fill();
    ctx.stroke();

    // Seed inside
    const seedGrad = ctx.createLinearGradient(x - 5, topY, x - 5, bottomY);
    seedGrad.addColorStop(0, 'rgba(180, 160, 100, 0.5)');
    seedGrad.addColorStop(0.7, 'rgba(180, 160, 100, 0.7)');
    seedGrad.addColorStop(1, 'rgba(160, 140, 80, 0.7)');
    ctx.fillStyle = seedGrad;
    ctx.fillRect(x - 5, topY + 5, 10, (bottomY - topY) * 0.75);

    // Metal cap & base
    ctx.fillStyle = '#777';
    ctx.fillRect(x - 9, topY - 3, 18, 5);
    ctx.fillRect(x - 9, bottomY - 2, 18, 5);

    // Perch pegs
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    for (const off of [{ dy: -12 }, { dy: -4 }, { dy: 4 }, { dy: 12 }]) {
      ctx.beginPath();
      ctx.moveTo(x - 7, this.tubeFeederY + off.dy);
      ctx.lineTo(x - 13, this.tubeFeederY + off.dy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 7, this.tubeFeederY + off.dy);
      ctx.lineTo(x + 13, this.tubeFeederY + off.dy);
      ctx.stroke();
    }
  }

  private renderPlatformFeeder(ctx: CanvasRenderingContext2D): void {
    const x = this.platformX;
    const y = this.platformY;

    // Post
    ctx.fillStyle = '#8a7a60';
    ctx.fillRect(x - 3, y, 6, this.groundY - y);

    // Platform tray
    ctx.fillStyle = '#a08a60';
    ctx.fillRect(x - 22, y - 3, 44, 5);

    // Rim
    ctx.strokeStyle = '#8a7a58';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 23, y - 4, 46, 7);

    // Seed on surface
    ctx.fillStyle = '#c8b890';
    for (let i = 0; i < 8; i++) {
      const sx = x + randomRange(-18, 18);
      const sy = y - 2 + randomRange(-1, 1);
      ctx.beginPath();
      ctx.ellipse(sx, sy, 1.2, 0.8, randomRange(0, Math.PI), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderSuetCage(ctx: CanvasRenderingContext2D): void {
    const x = this.suetX;
    const y = this.suetY;
    const w = 14;
    const h = 20;

    // Suet block
    ctx.fillStyle = '#d8c8a0';
    ctx.fillRect(x - w / 2, y - h / 2, w, h);

    // Wire mesh
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 0.7;
    // Vertical wires
    for (let i = 0; i <= 4; i++) {
      const wx = x - w / 2 + i * (w / 4);
      ctx.beginPath();
      ctx.moveTo(wx, y - h / 2);
      ctx.lineTo(wx, y + h / 2);
      ctx.stroke();
    }
    // Horizontal wires
    for (let i = 0; i <= 5; i++) {
      const wy = y - h / 2 + i * (h / 5);
      ctx.beginPath();
      ctx.moveTo(x - w / 2, wy);
      ctx.lineTo(x + w / 2, wy);
      ctx.stroke();
    }

    // Frame
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);
  }

  private renderJellyStation(ctx: CanvasRenderingContext2D): void {
    const x = this.jellyX;
    const y = this.jellyY;

    // Hanging wire from branch
    const branch = this.leftTree.branches[0]!;
    ctx.strokeStyle = '#e88830';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(branch.endX, branch.endY);
    ctx.lineTo(x, y - 8);
    ctx.stroke();

    // Platform
    ctx.fillStyle = '#e88830';
    ctx.fillRect(x - 14, y - 3, 28, 4);

    // Jelly dish (purple)
    ctx.fillStyle = '#6a2a8a';
    ctx.beginPath();
    ctx.ellipse(x - 4, y, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orange halves
    ctx.fillStyle = '#ee8822';
    ctx.beginPath();
    ctx.arc(x + 6, y - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffaa44';
    ctx.beginPath();
    ctx.arc(x + 6, y - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderBirdBath(ctx: CanvasRenderingContext2D, time: number): void {
    const x = this.bathX;
    const y = this.bathY;

    // Pedestal
    ctx.fillStyle = '#a09888';
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
    ctx.lineTo(x + 4, y - 12);
    ctx.lineTo(x - 4, y - 12);
    ctx.closePath();
    ctx.fill();

    // Pedestal base
    ctx.fillStyle = '#98908a';
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bowl
    ctx.fillStyle = '#a09888';
    ctx.beginPath();
    ctx.ellipse(x, y - 16, 20, 6, 0, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y - 16, 20, 4, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Water surface
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y - 16, 18, 4, 0, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#6a9ab0';
    ctx.fillRect(x - 18, y - 20, 36, 8);

    // Shimmer
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#b0d8f0';
    const shimmerX = x + Math.sin(time * 0.8) * 8;
    ctx.beginPath();
    ctx.ellipse(shimmerX, y - 17, 6, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Bowl rim
    ctx.strokeStyle = '#908880';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y - 16, 20, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderFence(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = 0; i < this.fencePosts.length; i++) {
      const post = this.fencePosts[i]!;

      // Post
      ctx.fillStyle = '#8a7a60';
      ctx.fillRect(post.x - 3, post.y - 26, 6, 26);

      // Post cap
      ctx.fillStyle = '#7a6a50';
      ctx.fillRect(post.x - 4, post.y - 28, 8, 4);

      // Rails
      if (i < this.fencePosts.length - 1) {
        const next = this.fencePosts[i + 1]!;
        ctx.strokeStyle = '#8a7a60';
        ctx.lineWidth = 3;
        // Top rail
        ctx.beginPath();
        ctx.moveTo(post.x, post.y - 20);
        ctx.lineTo(next.x, next.y - 20);
        ctx.stroke();
        // Bottom rail
        ctx.beginPath();
        ctx.moveTo(post.x, post.y - 10);
        ctx.lineTo(next.x, next.y - 10);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  renderGround(ctx: CanvasRenderingContext2D): void {
    // Ground area below feeders — extends all the way to canvas bottom
    const grad = ctx.createLinearGradient(0, this.groundY - 5, 0, this.height);
    grad.addColorStop(0, '#509840');
    grad.addColorStop(0.5, '#408830');
    grad.addColorStop(1, '#387828');
    ctx.fillStyle = grad;
    ctx.fillRect(0, this.groundY - 5, this.width, this.height - this.groundY + 5);

    // Scattered seed
    for (const seed of this.groundSeeds) {
      ctx.fillStyle = seed.color;
      ctx.beginPath();
      ctx.ellipse(seed.x, seed.y, seed.size, seed.size * 0.6, randomRange(0, Math.PI), 0, Math.PI * 2);
      ctx.fill();
    }

    // Wildflowers
    for (const flower of this.wildflowers) {
      ctx.fillStyle = flower.color;
      ctx.beginPath();
      ctx.arc(flower.x, flower.y, flower.size, 0, Math.PI * 2);
      ctx.fill();
      if (flower.size > 2.5) {
        ctx.fillStyle = '#e8d040';
        ctx.beginPath();
        ctx.arc(flower.x, flower.y, flower.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bare dirt near bath
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#8a7a58';
    ctx.beginPath();
    ctx.ellipse(this.bathX, this.groundY + 4, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderTreeCanopies(ctx: CanvasRenderingContext2D, time: number): void {
    for (const tree of [this.leftTree, this.rightTree]) {
      const cx = tree.canopyX;
      const cy = tree.canopyY;
      const w = tree.canopyW;
      const h = tree.canopyH;

      // Main canopy — overlapping circles for organic shape
      ctx.fillStyle = tree.leafColor;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.5, h * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.25, cy + h * 0.1, w * 0.35, h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + w * 0.25, cy + h * 0.05, w * 0.35, h * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.1, cy - h * 0.2, w * 0.3, h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Subtle leaf movement - lighter highlights that shift
      ctx.save();
      ctx.globalAlpha = 0.1;
      const leafHighlightColor = tree === this.leftTree ? '#5a9a48' : '#4a9a38';
      ctx.fillStyle = leafHighlightColor;
      for (let i = 0; i < 5; i++) {
        const lx = cx + Math.sin(time * 0.3 + i * 1.2) * w * 0.3;
        const ly = cy + Math.cos(time * 0.4 + i * 0.8) * h * 0.2;
        ctx.beginPath();
        ctx.ellipse(lx, ly, w * 0.15, h * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Shadow beneath canopy on ground
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(tree.x + 5, tree.trunkBottom + 3, w * 0.45, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
}
