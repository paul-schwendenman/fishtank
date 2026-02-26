import type { PondBounds } from '../entities/Koi';
import { randomRange } from '../utils/math';

interface CausticSpot {
  baseX: number;
  baseY: number;
  radius: number;
  phase: number;
  speedX: number;
  speedY: number;
}

interface EdgeStone {
  angle: number;
  size: number;
  points: { dx: number; dy: number }[];
  color: string;
  mossLength: number;
  mossAngle: number;
}

interface SubmergedRock {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  color: string;
}

export interface LilyPad {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  notchAngle: number;
  hasFlower: boolean;
  flowerColor: string;
  bobPhase: number;
  bobOffset: number;
  occupied: boolean;
}

interface SurfaceDebris {
  x: number;
  y: number;
  type: 'leaf' | 'petal';
  size: number;
  color: string;
  rotation: number;
  driftAngle: number;
  driftSpeed: number;
  rotSpeed: number;
}

interface AmbientMote {
  x: number;
  y: number;
  size: number;
  phase: number;
  speedX: number;
  speedY: number;
  alpha: number;
}

export class PondRenderer {
  private caustics: CausticSpot[] = [];
  private edgeStones: EdgeStone[] = [];
  private submergedRocks: SubmergedRock[] = [];
  lilyPads: LilyPad[] = [];
  private debris: SurfaceDebris[] = [];
  private motes: AmbientMote[] = [];
  private bounds: PondBounds;

  constructor(bounds: PondBounds) {
    this.bounds = bounds;
    this.generate();
  }

  resize(bounds: PondBounds): void {
    this.bounds = bounds;
    this.generate();
  }

  private generate(): void {
    const { cx, cy, rx, ry } = this.bounds;

    // Caustic light spots (25)
    this.caustics = [];
    for (let i = 0; i < 25; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const dist = Math.random() * 0.85;
      this.caustics.push({
        baseX: cx + Math.cos(angle) * rx * dist,
        baseY: cy + Math.sin(angle) * ry * dist,
        radius: randomRange(20, 50),
        phase: randomRange(0, Math.PI * 2),
        speedX: randomRange(-8, 8),
        speedY: randomRange(-6, 6),
      });
    }

    // Edge stones (40-55 around ellipse)
    this.edgeStones = [];
    const stoneCount = 40 + Math.floor(Math.random() * 16);
    for (let i = 0; i < stoneCount; i++) {
      const angle = (i / stoneCount) * Math.PI * 2 + randomRange(-0.05, 0.05);
      const numPoints = 5 + Math.floor(Math.random() * 3);
      const points: { dx: number; dy: number }[] = [];
      for (let j = 0; j < numPoints; j++) {
        const pa = (j / numPoints) * Math.PI * 2;
        const r = 0.6 + Math.random() * 0.4;
        points.push({ dx: Math.cos(pa) * r, dy: Math.sin(pa) * r });
      }
      const gray = 80 + Math.floor(Math.random() * 60);
      this.edgeStones.push({
        angle,
        size: randomRange(12, 25),
        points,
        color: `rgb(${gray}, ${gray - 10}, ${gray - 20})`,
        mossLength: Math.random() > 0.5 ? randomRange(8, 20) : 0,
        mossAngle: angle + Math.PI + randomRange(-0.3, 0.3),
      });
    }

    // Submerged rocks (4)
    this.submergedRocks = [];
    for (let i = 0; i < 4; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const dist = randomRange(0.2, 0.6);
      const gray = 60 + Math.floor(Math.random() * 40);
      this.submergedRocks.push({
        x: cx + Math.cos(angle) * rx * dist,
        y: cy + Math.sin(angle) * ry * dist,
        rx: randomRange(12, 25),
        ry: randomRange(8, 18),
        rotation: randomRange(0, Math.PI),
        color: `rgb(${gray}, ${gray - 5}, ${gray - 15})`,
      });
    }

    // Lily pads (10-14)
    this.lilyPads = [];
    const padCount = 10 + Math.floor(Math.random() * 5);
    for (let i = 0; i < padCount; i++) {
      let px: number, py: number;
      let attempts = 0;
      // Place within swim area, avoid overlaps
      do {
        const a = randomRange(0, Math.PI * 2);
        const d = randomRange(0.15, 0.75);
        px = cx + Math.cos(a) * rx * d;
        py = cy + Math.sin(a) * ry * d;
        attempts++;
      } while (
        attempts < 20 &&
        this.lilyPads.some(p => Math.hypot(p.x - px, p.y - py) < 50)
      );

      this.lilyPads.push({
        x: px,
        y: py,
        radius: randomRange(15, 40),
        rotation: randomRange(0, Math.PI * 2),
        notchAngle: randomRange(0, Math.PI * 2),
        hasFlower: Math.random() < 0.3,
        flowerColor: Math.random() > 0.5 ? '#f0c0d0' : '#fff0f0',
        bobPhase: randomRange(0, Math.PI * 2),
        bobOffset: 0,
        occupied: false,
      });
    }

    // Surface debris (15)
    this.debris = [];
    const leafColors = ['#8b6914', '#a07828', '#6b5010', '#c49030'];
    const petalColors = ['#f0c0d0', '#ffe8ee', '#f8d8e0'];
    for (let i = 0; i < 15; i++) {
      const isLeaf = Math.random() > 0.4;
      const a = randomRange(0, Math.PI * 2);
      const d = randomRange(0.1, 0.8);
      this.debris.push({
        x: cx + Math.cos(a) * rx * d,
        y: cy + Math.sin(a) * ry * d,
        type: isLeaf ? 'leaf' : 'petal',
        size: isLeaf ? randomRange(4, 8) : randomRange(2, 4),
        color: isLeaf
          ? leafColors[Math.floor(Math.random() * leafColors.length)]!
          : petalColors[Math.floor(Math.random() * petalColors.length)]!,
        rotation: randomRange(0, Math.PI * 2),
        driftAngle: randomRange(0, Math.PI * 2),
        driftSpeed: randomRange(2, 5),
        rotSpeed: randomRange(-0.2, 0.2),
      });
    }

    // Ambient motes (10)
    this.motes = [];
    for (let i = 0; i < 10; i++) {
      const a = randomRange(0, Math.PI * 2);
      const d = randomRange(0.1, 0.7);
      this.motes.push({
        x: cx + Math.cos(a) * rx * d,
        y: cy + Math.sin(a) * ry * d,
        size: randomRange(1, 2.5),
        phase: randomRange(0, Math.PI * 2),
        speedX: randomRange(-3, 3),
        speedY: randomRange(-2, 2),
        alpha: randomRange(0.1, 0.25),
      });
    }
  }

  renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Dark earthy background behind pond
    ctx.fillStyle = '#2a2018';
    ctx.fillRect(0, 0, width, height);

    // Pond fill — dark green-brown gradient
    const { cx, cy, rx, ry } = this.bounds;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();

    const grad = ctx.createRadialGradient(cx, cy - ry * 0.3, 0, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0, '#1a3020');
    grad.addColorStop(0.4, '#142818');
    grad.addColorStop(0.7, '#102214');
    grad.addColorStop(1, '#0a1a10');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);

    ctx.restore();
  }

  renderCaustics(ctx: CanvasRenderingContext2D, time: number): void {
    const { cx, cy, rx, ry } = this.bounds;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();

    for (const c of this.caustics) {
      const x = c.baseX + Math.sin(time * 0.4 + c.phase) * c.speedX * 3;
      const y = c.baseY + Math.cos(time * 0.35 + c.phase * 1.3) * c.speedY * 3;
      const pulsR = c.radius * (0.8 + Math.sin(time * 0.6 + c.phase) * 0.2);

      const grad = ctx.createRadialGradient(x, y, 0, x, y, pulsR);
      grad.addColorStop(0, 'rgba(120, 160, 100, 0.04)');
      grad.addColorStop(0.5, 'rgba(100, 140, 80, 0.025)');
      grad.addColorStop(1, 'rgba(80, 120, 60, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - pulsR, y - pulsR, pulsR * 2, pulsR * 2);
    }

    ctx.restore();
  }

  renderSubmergedRocks(ctx: CanvasRenderingContext2D): void {
    for (const rock of this.submergedRocks) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.translate(rock.x, rock.y);
      ctx.rotate(rock.rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, rock.rx, rock.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = rock.color;
      ctx.fill();

      // Subtle highlight
      ctx.beginPath();
      ctx.ellipse(-rock.rx * 0.2, -rock.ry * 0.2, rock.rx * 0.4, rock.ry * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();

      ctx.restore();
    }
  }

  renderAmbientMotes(ctx: CanvasRenderingContext2D, time: number): void {
    for (const mote of this.motes) {
      const x = mote.x + Math.sin(time * 0.3 + mote.phase) * mote.speedX * 5;
      const y = mote.y + Math.cos(time * 0.25 + mote.phase * 1.2) * mote.speedY * 5;
      const alpha = mote.alpha * (0.7 + Math.sin(time * 0.5 + mote.phase) * 0.3);

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, mote.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180, 200, 160, 1)';
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  renderLilyPadShadows(ctx: CanvasRenderingContext2D, time: number): void {
    for (const pad of this.lilyPads) {
      const bob = Math.sin(time * 0.8 + pad.bobPhase) * 1 + pad.bobOffset;
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.translate(pad.x + 3, pad.y + 3 + bob);
      ctx.rotate(pad.rotation);
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();
    }
  }

  renderLilyPads(ctx: CanvasRenderingContext2D, time: number): void {
    for (const pad of this.lilyPads) {
      const bob = Math.sin(time * 0.8 + pad.bobPhase) * 1 + pad.bobOffset;
      ctx.save();
      ctx.translate(pad.x, pad.y + bob);
      ctx.rotate(pad.rotation);

      // Pad with V-notch
      ctx.beginPath();
      const notch = pad.notchAngle - pad.rotation;
      const notchWidth = 0.25;
      ctx.arc(0, 0, pad.radius, notch + notchWidth, notch + Math.PI * 2 - notchWidth);
      ctx.lineTo(0, 0);
      ctx.closePath();

      // Green gradient
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pad.radius);
      grad.addColorStop(0, '#3a7a30');
      grad.addColorStop(0.7, '#2a6a22');
      grad.addColorStop(1, '#1a5a18');
      ctx.fillStyle = grad;
      ctx.fill();

      // Veins radiating from center
      ctx.strokeStyle = 'rgba(20, 60, 15, 0.4)';
      ctx.lineWidth = 0.5;
      for (let v = 0; v < 8; v++) {
        const va = (v / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(va) * pad.radius * 0.85, Math.sin(va) * pad.radius * 0.85);
        ctx.stroke();
      }

      // Edge highlight
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius, notch + notchWidth, notch + Math.PI * 2 - notchWidth);
      ctx.strokeStyle = 'rgba(80, 140, 60, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Flower
      if (pad.hasFlower) {
        const fx = pad.radius * 0.3;
        const fy = -pad.radius * 0.2;
        const petalCount = 6 + Math.floor(pad.bobPhase * 2) % 3;
        const petalSize = pad.radius * 0.25;

        for (let p = 0; p < petalCount; p++) {
          const pa = (p / petalCount) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(
            fx + Math.cos(pa) * petalSize * 0.5,
            fy + Math.sin(pa) * petalSize * 0.5,
            petalSize * 0.4,
            petalSize * 0.2,
            pa,
            0, Math.PI * 2,
          );
          ctx.fillStyle = pad.flowerColor;
          ctx.fill();
        }

        // Center
        ctx.beginPath();
        ctx.arc(fx, fy, petalSize * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#e8d040';
        ctx.fill();
      }

      ctx.restore();
    }
  }

  updateDebris(dt: number): void {
    const { cx, cy, rx, ry } = this.bounds;

    for (const d of this.debris) {
      d.x += Math.cos(d.driftAngle) * d.driftSpeed * dt;
      d.y += Math.sin(d.driftAngle) * d.driftSpeed * dt;
      d.rotation += d.rotSpeed * dt;

      // Wrap at pond edge
      const ndx = (d.x - cx) / rx;
      const ndy = (d.y - cy) / ry;
      if (ndx * ndx + ndy * ndy > 0.85) {
        // Wrap to opposite side
        d.x = cx - (d.x - cx) * 0.5;
        d.y = cy - (d.y - cy) * 0.5;
      }
    }
  }

  renderDebris(ctx: CanvasRenderingContext2D): void {
    for (const d of this.debris) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rotation);
      ctx.globalAlpha = 0.7;

      if (d.type === 'leaf') {
        ctx.beginPath();
        ctx.ellipse(0, 0, d.size, d.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
        // Vein
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(-d.size * 0.7, 0);
        ctx.lineTo(d.size * 0.7, 0);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, d.size, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  renderPondEdge(ctx: CanvasRenderingContext2D): void {
    const { cx, cy, rx, ry } = this.bounds;

    for (const stone of this.edgeStones) {
      const sx = cx + Math.cos(stone.angle) * (rx + stone.size * 0.3);
      const sy = cy + Math.sin(stone.angle) * (ry + stone.size * 0.3);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(stone.angle);

      ctx.beginPath();
      const first = stone.points[0]!;
      ctx.moveTo(first.dx * stone.size * 0.5, first.dy * stone.size * 0.5);
      for (let i = 1; i < stone.points.length; i++) {
        const p = stone.points[i]!;
        ctx.lineTo(p.dx * stone.size * 0.5, p.dy * stone.size * 0.5);
      }
      ctx.closePath();
      ctx.fillStyle = stone.color;
      ctx.fill();

      // Highlight
      ctx.beginPath();
      ctx.ellipse(-stone.size * 0.1, -stone.size * 0.1, stone.size * 0.15, stone.size * 0.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fill();

      ctx.restore();

      // Moss/fern fronds overhanging inward
      if (stone.mossLength > 0) {
        const mossX = cx + Math.cos(stone.angle) * rx;
        const mossY = cy + Math.sin(stone.angle) * ry;
        const inwardAngle = stone.angle + Math.PI;

        ctx.save();
        ctx.strokeStyle = '#2a5a20';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.6;

        for (let f = -1; f <= 1; f++) {
          const fa = inwardAngle + f * 0.3;
          ctx.beginPath();
          ctx.moveTo(mossX, mossY);
          ctx.quadraticCurveTo(
            mossX + Math.cos(fa) * stone.mossLength * 0.6,
            mossY + Math.sin(fa) * stone.mossLength * 0.6,
            mossX + Math.cos(fa + f * 0.15) * stone.mossLength,
            mossY + Math.sin(fa + f * 0.15) * stone.mossLength,
          );
          ctx.stroke();
        }

        ctx.restore();
      }
    }
  }

  renderStoneLantern(ctx: CanvasRenderingContext2D): void {
    const { cx, cy, rx, ry } = this.bounds;
    // Place at top-right of pond edge
    const angle = -Math.PI * 0.3;
    const lx = cx + Math.cos(angle) * (rx + 20);
    const ly = cy + Math.sin(angle) * (ry + 20);

    ctx.save();
    ctx.translate(lx, ly);

    // Base
    ctx.fillStyle = '#8a8070';
    ctx.fillRect(-12, -4, 24, 8);

    // Pillar
    ctx.fillStyle = '#9a9080';
    ctx.fillRect(-5, -22, 10, 18);

    // Roof (trapezoid)
    ctx.beginPath();
    ctx.moveTo(-15, -22);
    ctx.lineTo(15, -22);
    ctx.lineTo(10, -30);
    ctx.lineTo(-10, -30);
    ctx.closePath();
    ctx.fillStyle = '#7a7060';
    ctx.fill();

    // Top knob
    ctx.beginPath();
    ctx.arc(0, -32, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#8a8070';
    ctx.fill();

    // Window/light opening
    ctx.fillStyle = 'rgba(200, 180, 100, 0.3)';
    ctx.fillRect(-3, -19, 6, 8);

    ctx.restore();
  }

  /** Set bobOffset on lily pads near a given point (koi swimming underneath) */
  bobLilyPads(koiX: number, koiY: number, koiDepth: number): void {
    if (koiDepth > 0.3) return; // only near-surface koi affect pads
    for (const pad of this.lilyPads) {
      const dist = Math.hypot(pad.x - koiX, pad.y - koiY);
      if (dist < pad.radius + 30) {
        const strength = (1 - dist / (pad.radius + 30)) * (1 - koiDepth / 0.3);
        pad.bobOffset = Math.sin(Date.now() * 0.01) * strength * 3;
      } else {
        pad.bobOffset *= 0.95; // decay
      }
    }
  }
}
