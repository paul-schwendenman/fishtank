import { randomRange } from '../utils/math';
import {
  type TidePoolBounds,
  poolEdgePoint,
  tracePoolPath,
} from '../behaviors/TidePoolSteering';

interface CausticSpot {
  baseX: number;
  baseY: number;
  radius: number;
  phase: number;
  speedX: number;
  speedY: number;
}

interface EdgeRock {
  angle: number;
  x: number;
  y: number;
  size: number;
  points: { dx: number; dy: number }[];
  color: string;
  hasMoss: boolean;
}

interface Pebble {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  color: string;
}

interface Shell {
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
}

interface SeaweedFrond {
  baseX: number;
  baseY: number;
  height: number;
  segments: number;
  color: string;
  phase: number;
  width: number;
}

interface Anemone {
  x: number;
  y: number;
  baseRadius: number;
  tentacleCount: number;
  tentacleLength: number;
  bodyColor: string;
  tipColor: string;
  phase: number;
}

interface SeaUrchin {
  x: number;
  y: number;
  radius: number;
  spineCount: number;
  spineLength: number;
  color: string;
  phase: number;
}

interface Barnacle {
  x: number;
  y: number;
  radius: number;
  openAngle: number;
}

export class TidePoolRenderer {
  private bounds: TidePoolBounds;
  private caustics: CausticSpot[] = [];
  private edgeRocks: EdgeRock[] = [];
  private pebbles: Pebble[] = [];
  private shells: Shell[] = [];
  private seaweed: SeaweedFrond[] = [];
  private anemones: Anemone[] = [];
  private urchins: SeaUrchin[] = [];
  private barnacles: Barnacle[] = [];

  constructor(bounds: TidePoolBounds) {
    this.bounds = bounds;
    this.generate();
  }

  resize(bounds: TidePoolBounds): void {
    this.bounds = bounds;
    this.generate();
  }

  private generate(): void {
    const { cx, cy } = this.bounds;

    // --- Caustics (20 warm golden spots) ---
    this.caustics = [];
    for (let i = 0; i < 20; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const dist = Math.random() * 0.8;
      const pt = poolEdgePoint(angle, this.bounds);
      const dx = pt.x - cx;
      const dy = pt.y - cy;
      this.caustics.push({
        baseX: cx + dx * dist,
        baseY: cy + dy * dist,
        radius: randomRange(25, 55),
        phase: randomRange(0, Math.PI * 2),
        speedX: randomRange(-6, 6),
        speedY: randomRange(-5, 5),
      });
    }

    // --- Edge rocks (35-50 around boundary) ---
    this.edgeRocks = [];
    const rockCount = 35 + Math.floor(Math.random() * 16);
    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2 + randomRange(-0.04, 0.04);
      const edgePt = poolEdgePoint(angle, this.bounds);
      const outward = randomRange(5, 18);
      const rx = edgePt.x + Math.cos(angle) * outward;
      const ry = edgePt.y + Math.sin(angle) * outward;

      const numPts = 5 + Math.floor(Math.random() * 3);
      const points: { dx: number; dy: number }[] = [];
      for (let j = 0; j < numPts; j++) {
        const pa = (j / numPts) * Math.PI * 2;
        const r = 0.5 + Math.random() * 0.5;
        points.push({ dx: Math.cos(pa) * r, dy: Math.sin(pa) * r });
      }

      const warmth = Math.random();
      const r = 100 + Math.floor(warmth * 40 + Math.random() * 30);
      const g = 85 + Math.floor(warmth * 30 + Math.random() * 25);
      const b = 70 + Math.floor(Math.random() * 25);

      this.edgeRocks.push({
        angle,
        x: rx,
        y: ry,
        size: randomRange(14, 28),
        points,
        color: `rgb(${r}, ${g}, ${b})`,
        hasMoss: Math.random() > 0.6,
      });
    }

    // --- Pebbles (35 on pool floor) ---
    this.pebbles = [];
    const pebbleColors = [
      '#9a8a7a', '#8a7a6a', '#b0a090', '#7a6a5a',
      '#a09080', '#8a7060', '#b8a898', '#706050',
      '#a08878', '#c0a898',
    ];
    for (let i = 0; i < 35; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const dist = randomRange(0.1, 0.85);
      const edgePt = poolEdgePoint(angle, this.bounds);
      const dx = edgePt.x - cx;
      const dy = edgePt.y - cy;
      this.pebbles.push({
        x: cx + dx * dist,
        y: cy + dy * dist,
        rx: randomRange(2, 5),
        ry: randomRange(1.5, 4),
        rotation: randomRange(0, Math.PI),
        color: pebbleColors[Math.floor(Math.random() * pebbleColors.length)]!,
      });
    }

    // --- Shells (8) ---
    this.shells = [];
    const shellColors = ['#e8dcc8', '#d0c4b0', '#f0e8d8', '#c8bcac', '#e0d4c4'];
    for (let i = 0; i < 8; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const dist = randomRange(0.15, 0.8);
      const edgePt = poolEdgePoint(angle, this.bounds);
      const dx = edgePt.x - cx;
      const dy = edgePt.y - cy;
      this.shells.push({
        x: cx + dx * dist,
        y: cy + dy * dist,
        size: randomRange(3, 6),
        rotation: randomRange(0, Math.PI * 2),
        color: shellColors[Math.floor(Math.random() * shellColors.length)]!,
      });
    }

    // --- Seaweed fronds (12) ---
    this.seaweed = [];
    const seaweedColors = ['#3a6a30', '#2a5a28', '#4a7a38', '#2a5020', '#3a6028'];
    for (let i = 0; i < 12; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const dist = randomRange(0.5, 0.9);
      const edgePt = poolEdgePoint(angle, this.bounds);
      const dx = edgePt.x - cx;
      const dy = edgePt.y - cy;
      this.seaweed.push({
        baseX: cx + dx * dist,
        baseY: cy + dy * dist,
        height: randomRange(15, 35),
        segments: 4 + Math.floor(Math.random() * 3),
        color: seaweedColors[Math.floor(Math.random() * seaweedColors.length)]!,
        phase: randomRange(0, Math.PI * 2),
        width: randomRange(2, 4),
      });
    }

    // --- Anemones (5) ---
    this.anemones = [];
    const anemoneStyles = [
      { body: '#8a4080', tip: '#c070b0' },
      { body: '#c06040', tip: '#e89070' },
      { body: '#40a060', tip: '#70d090' },
      { body: '#a06090', tip: '#d090c0' },
      { body: '#d07040', tip: '#f0a070' },
    ];
    for (let i = 0; i < 5; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const dist = randomRange(0.3, 0.8);
      const edgePt = poolEdgePoint(angle, this.bounds);
      const dx = edgePt.x - cx;
      const dy = edgePt.y - cy;
      const style = anemoneStyles[i % anemoneStyles.length]!;
      this.anemones.push({
        x: cx + dx * dist,
        y: cy + dy * dist,
        baseRadius: randomRange(6, 10),
        tentacleCount: 10 + Math.floor(Math.random() * 6),
        tentacleLength: randomRange(10, 18),
        bodyColor: style.body,
        tipColor: style.tip,
        phase: randomRange(0, Math.PI * 2),
      });
    }

    // --- Sea urchins (3) ---
    this.urchins = [];
    for (let i = 0; i < 3; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const dist = randomRange(0.4, 0.8);
      const edgePt = poolEdgePoint(angle, this.bounds);
      const dx = edgePt.x - cx;
      const dy = edgePt.y - cy;
      this.urchins.push({
        x: cx + dx * dist,
        y: cy + dy * dist,
        radius: randomRange(5, 8),
        spineCount: 16 + Math.floor(Math.random() * 8),
        spineLength: randomRange(8, 14),
        color: '#2a1a30',
        phase: randomRange(0, Math.PI * 2),
      });
    }

    // --- Barnacles on edge rocks (18 clusters) ---
    this.barnacles = [];
    for (let i = 0; i < 18; i++) {
      const rock = this.edgeRocks[Math.floor(Math.random() * this.edgeRocks.length)]!;
      this.barnacles.push({
        x: rock.x + randomRange(-rock.size * 0.3, rock.size * 0.3),
        y: rock.y + randomRange(-rock.size * 0.3, rock.size * 0.3),
        radius: randomRange(1.5, 3),
        openAngle: randomRange(0, Math.PI * 2),
      });
    }
  }

  // ==================== Render methods ====================

  renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Warm rocky surface
    const grad = ctx.createRadialGradient(
      this.bounds.cx, this.bounds.cy, 0,
      this.bounds.cx, this.bounds.cy, Math.max(width, height) * 0.7,
    );
    grad.addColorStop(0, '#a09080');
    grad.addColorStop(0.5, '#8a7a68');
    grad.addColorStop(1, '#6a5a48');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  renderPoolWater(ctx: CanvasRenderingContext2D): void {
    const { cx, cy, baseRx, baseRy } = this.bounds;

    ctx.save();
    tracePoolPath(ctx, this.bounds);
    ctx.clip();

    // Shallow water gradient — sandy bottom with blue-green tint
    const grad = ctx.createRadialGradient(
      cx, cy - baseRy * 0.2, 0,
      cx, cy, Math.max(baseRx, baseRy),
    );
    grad.addColorStop(0, '#7abaa8');
    grad.addColorStop(0.3, '#5a9a88');
    grad.addColorStop(0.6, '#4a8a78');
    grad.addColorStop(1, '#3a7a68');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - baseRx * 1.2, cy - baseRy * 1.2, baseRx * 2.4, baseRy * 2.4);

    ctx.restore();
  }

  renderCaustics(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    tracePoolPath(ctx, this.bounds);
    ctx.clip();

    for (const c of this.caustics) {
      const x = c.baseX + Math.sin(time * 0.5 + c.phase) * c.speedX * 3;
      const y = c.baseY + Math.cos(time * 0.4 + c.phase * 1.3) * c.speedY * 3;
      const pulsR = c.radius * (0.8 + Math.sin(time * 0.7 + c.phase) * 0.2);

      const grad = ctx.createRadialGradient(x, y, 0, x, y, pulsR);
      grad.addColorStop(0, 'rgba(220, 195, 120, 0.06)');
      grad.addColorStop(0.5, 'rgba(200, 175, 100, 0.035)');
      grad.addColorStop(1, 'rgba(180, 155, 80, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - pulsR, y - pulsR, pulsR * 2, pulsR * 2);
    }

    ctx.restore();
  }

  renderPebbles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    tracePoolPath(ctx, this.bounds);
    ctx.clip();

    for (const p of this.pebbles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.5;
      ctx.fill();

      // Tiny highlight
      ctx.beginPath();
      ctx.ellipse(-p.rx * 0.2, -p.ry * 0.2, p.rx * 0.35, p.ry * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fill();
      ctx.restore();
    }

    // Shells
    for (const s of this.shells) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.globalAlpha = 0.6;

      // Fan shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, s.size, -0.8, 0.8);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();

      // Ridges
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 0.3;
      for (let r = 0; r < 4; r++) {
        const ra = -0.6 + (r / 3) * 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ra) * s.size * 0.9, Math.sin(ra) * s.size * 0.9);
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  renderSeaweed(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    tracePoolPath(ctx, this.bounds);
    ctx.clip();

    for (const frond of this.seaweed) {
      ctx.save();
      ctx.translate(frond.baseX, frond.baseY);
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = frond.color;
      ctx.lineWidth = frond.width;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(0, 0);

      // Build swaying segments
      let px = 0;
      let py = 0;
      for (let s = 1; s <= frond.segments; s++) {
        const t = s / frond.segments;
        const sway = Math.sin(time * 1.2 + frond.phase + s * 0.8) * (8 * t);
        const nx = sway;
        const ny = -frond.height * t;
        ctx.quadraticCurveTo(
          (px + nx) / 2 + sway * 0.3, (py + ny) / 2,
          nx, ny,
        );
        px = nx;
        py = ny;
      }
      ctx.stroke();

      // Leaf blobs along frond
      for (let s = 1; s <= frond.segments; s++) {
        const t = s / frond.segments;
        const sway = Math.sin(time * 1.2 + frond.phase + s * 0.8) * (8 * t);
        const lx = sway;
        const ly = -frond.height * t;
        const leafSize = frond.width * (1.2 - t * 0.4);

        ctx.beginPath();
        ctx.ellipse(lx, ly, leafSize, leafSize * 1.5, sway * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = frond.color;
        ctx.globalAlpha = 0.4;
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  renderAnemones(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    tracePoolPath(ctx, this.bounds);
    ctx.clip();

    for (const a of this.anemones) {
      ctx.save();
      ctx.translate(a.x, a.y);

      // Tentacles
      for (let t = 0; t < a.tentacleCount; t++) {
        const baseAngle = (t / a.tentacleCount) * Math.PI * 2;
        const sway = Math.sin(time * 0.8 + a.phase + t * 0.7) * 0.3;
        const tipAngle = baseAngle + sway;

        const tipX = Math.cos(tipAngle) * a.tentacleLength;
        const tipY = Math.sin(tipAngle) * a.tentacleLength;
        const midX = Math.cos(baseAngle) * a.tentacleLength * 0.5 +
          Math.sin(time * 1.2 + t) * 2;
        const midY = Math.sin(baseAngle) * a.tentacleLength * 0.5 +
          Math.cos(time * 1.0 + t * 0.5) * 2;

        ctx.beginPath();
        ctx.moveTo(
          Math.cos(baseAngle) * a.baseRadius * 0.8,
          Math.sin(baseAngle) * a.baseRadius * 0.8,
        );
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.strokeStyle = a.bodyColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.stroke();

        // Tip dot
        ctx.beginPath();
        ctx.arc(tipX, tipY, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = a.tipColor;
        ctx.globalAlpha = 0.8;
        ctx.fill();
      }

      // Base disc
      ctx.beginPath();
      ctx.arc(0, 0, a.baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = a.bodyColor;
      ctx.globalAlpha = 0.6;
      ctx.fill();

      // Center
      ctx.beginPath();
      ctx.arc(0, 0, a.baseRadius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  renderUrchins(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    tracePoolPath(ctx, this.bounds);
    ctx.clip();

    for (const u of this.urchins) {
      ctx.save();
      ctx.translate(u.x, u.y);

      // Spines
      ctx.strokeStyle = u.color;
      ctx.lineWidth = 0.7;
      ctx.globalAlpha = 0.7;
      for (let s = 0; s < u.spineCount; s++) {
        const baseAngle = (s / u.spineCount) * Math.PI * 2;
        const sway = Math.sin(time * 0.6 + u.phase + s * 0.5) * 0.1;
        const tipAngle = baseAngle + sway;
        const len = u.spineLength * (0.8 + Math.sin(s * 2.3) * 0.2);

        ctx.beginPath();
        ctx.moveTo(
          Math.cos(baseAngle) * u.radius * 0.7,
          Math.sin(baseAngle) * u.radius * 0.7,
        );
        ctx.lineTo(
          Math.cos(tipAngle) * (u.radius + len),
          Math.sin(tipAngle) * (u.radius + len),
        );
        ctx.stroke();
      }

      // Body
      ctx.beginPath();
      ctx.arc(0, 0, u.radius, 0, Math.PI * 2);
      ctx.fillStyle = u.color;
      ctx.globalAlpha = 0.8;
      ctx.fill();

      // Subtle highlight
      ctx.beginPath();
      ctx.arc(-u.radius * 0.2, -u.radius * 0.2, u.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  renderWaterShimmer(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    tracePoolPath(ctx, this.bounds);
    ctx.clip();

    // Subtle light shimmer overlay
    const { cx, cy, baseRx, baseRy } = this.bounds;
    const shimmerX = cx + Math.sin(time * 0.3) * baseRx * 0.2;
    const shimmerY = cy + Math.cos(time * 0.25) * baseRy * 0.2;
    const grad = ctx.createRadialGradient(
      shimmerX, shimmerY, 0,
      shimmerX, shimmerY, Math.max(baseRx, baseRy) * 0.5,
    );
    grad.addColorStop(0, 'rgba(255, 255, 230, 0.04)');
    grad.addColorStop(1, 'rgba(255, 255, 230, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - baseRx * 1.2, cy - baseRy * 1.2, baseRx * 2.4, baseRy * 2.4);

    ctx.restore();
  }

  renderEdgeRocks(ctx: CanvasRenderingContext2D): void {
    for (const rock of this.edgeRocks) {
      ctx.save();
      ctx.translate(rock.x, rock.y);
      ctx.rotate(rock.angle);

      // Rock shape
      ctx.beginPath();
      const first = rock.points[0]!;
      ctx.moveTo(first.dx * rock.size * 0.5, first.dy * rock.size * 0.5);
      for (let i = 1; i < rock.points.length; i++) {
        const p = rock.points[i]!;
        ctx.lineTo(p.dx * rock.size * 0.5, p.dy * rock.size * 0.5);
      }
      ctx.closePath();
      ctx.fillStyle = rock.color;
      ctx.fill();

      // Highlight
      ctx.beginPath();
      ctx.ellipse(
        -rock.size * 0.08, -rock.size * 0.08,
        rock.size * 0.12, rock.size * 0.08,
        0, 0, Math.PI * 2,
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();

      // Moss on some rocks
      if (rock.hasMoss) {
        const inwardAngle = Math.PI; // point inward (since we're rotated by rock.angle)
        ctx.strokeStyle = '#3a6a30';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.5;

        for (let f = -1; f <= 1; f++) {
          const fa = inwardAngle + f * 0.4;
          const mossLen = randomRange(4, 10);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(
            Math.cos(fa) * mossLen * 0.5,
            Math.sin(fa) * mossLen * 0.5,
            Math.cos(fa + f * 0.2) * mossLen,
            Math.sin(fa + f * 0.2) * mossLen,
          );
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  renderBarnacles(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = 0.6;
    for (const b of this.barnacles) {
      // Base circle
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#c0b8a8';
      ctx.fill();
      ctx.strokeStyle = '#8a8278';
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Opening slit
      ctx.beginPath();
      ctx.moveTo(
        b.x + Math.cos(b.openAngle) * b.radius * 0.3,
        b.y + Math.sin(b.openAngle) * b.radius * 0.3,
      );
      ctx.lineTo(
        b.x + Math.cos(b.openAngle + Math.PI) * b.radius * 0.3,
        b.y + Math.sin(b.openAngle + Math.PI) * b.radius * 0.3,
      );
      ctx.strokeStyle = '#5a5248';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
