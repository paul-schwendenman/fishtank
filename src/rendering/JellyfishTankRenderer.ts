import { randomRange } from '../utils/math';
import { Vector } from '../utils/Vector';

interface Plankton {
  x: number;
  y: number;
  size: number;
  alpha: number;
  phase: number;
  vx: number;
  vy: number;
}

interface CausticSpot {
  x: number;
  y: number;
  radius: number;
  phase: number;
}

export class JellyfishTankRenderer {
  private plankton: Plankton[] = [];
  private caustics: CausticSpot[] = [];
  private width: number;
  private height: number;

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
    // Plankton particles (40)
    this.plankton = [];
    for (let i = 0; i < 40; i++) {
      this.plankton.push({
        x: randomRange(0, this.width),
        y: randomRange(0, this.height),
        size: randomRange(0.5, 2),
        alpha: randomRange(0.1, 0.4),
        phase: randomRange(0, Math.PI * 2),
        vx: randomRange(-5, 5),
        vy: randomRange(-3, 3),
      });
    }

    // Caustic spots (15)
    this.caustics = [];
    for (let i = 0; i < 15; i++) {
      this.caustics.push({
        x: randomRange(0, this.width),
        y: randomRange(0, this.height),
        radius: randomRange(30, 80),
        phase: randomRange(0, Math.PI * 2),
      });
    }
  }

  renderBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
  ): void {
    // Slowly cycling hue: blue → purple → teal → blue
    const hueShift = Math.sin(time * 0.03) * 20;
    const baseHue = 230 + hueShift;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `hsl(${baseHue}, 40%, 4%)`);
    grad.addColorStop(0.5, `hsl(${baseHue + 10}, 35%, 3%)`);
    grad.addColorStop(1, `hsl(${baseHue + 20}, 30%, 2%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  renderAmbientLight(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
  ): void {
    // Drifting center for ambient light
    const cx = w / 2 + Math.sin(time * 0.08) * w * 0.15;
    const cy = h / 3 + Math.cos(time * 0.06) * h * 0.1;

    const hue = 220 + Math.sin(time * 0.04) * 30;
    const radius = Math.max(w, h) * 0.6;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `hsla(${hue}, 50%, 20%, 0.08)`);
    grad.addColorStop(0.5, `hsla(${hue + 15}, 40%, 12%, 0.04)`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  renderCaustics(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    for (const c of this.caustics) {
      const x = c.x + Math.sin(time * 0.3 + c.phase) * 20;
      const y = c.y + Math.cos(time * 0.25 + c.phase) * 15;
      const pulseR = c.radius * (0.8 + Math.sin(time * 0.4 + c.phase) * 0.2);
      const alpha = 0.015 + Math.sin(time * 0.5 + c.phase) * 0.008;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, pulseR);
      grad.addColorStop(0, `rgba(80, 100, 200, ${alpha})`);
      grad.addColorStop(0.5, `rgba(100, 80, 180, ${alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - pulseR, y - pulseR, pulseR * 2, pulseR * 2);
    }
    ctx.restore();
  }

  updatePlankton(dt: number, currentForce: Vector): void {
    for (const p of this.plankton) {
      p.x += (p.vx + currentForce.x * 0.5) * dt;
      p.y += (p.vy + currentForce.y * 0.5) * dt;

      // Wrap around edges
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;
    }
  }

  renderPlankton(ctx: CanvasRenderingContext2D, time: number): void {
    for (const p of this.plankton) {
      const flicker = 0.6 + Math.sin(time * 2 + p.phase) * 0.4;
      ctx.globalAlpha = p.alpha * flicker;
      ctx.fillStyle = 'rgba(150, 180, 220, 1)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  renderVignette(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Edge vignette
    const edgeGrad = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.3,
      w / 2, h / 2, Math.max(w, h) * 0.75,
    );
    edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    edgeGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);
  }
}
