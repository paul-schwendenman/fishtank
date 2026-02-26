import type { Firefly } from '../entities/Firefly';
import type { Owl } from '../entities/Owl';
import type { Bat } from '../entities/Bat';

export function renderFirefly(
  ctx: CanvasRenderingContext2D,
  firefly: Firefly,
  _time: number,
): void {
  const opacity = Math.max(0, Math.min(1, firefly.spawnOpacity));
  if (opacity <= 0) return;

  const { variety, glowIntensity } = firefly;
  const scale = firefly.depthScale;
  const alpha = opacity * firefly.depthAlpha;
  const glowR = variety.glowRadius * scale;
  const effectiveGlow = glowIntensity * alpha;

  if (effectiveGlow < 0.01) return;

  const x = firefly.position.x;
  const y = firefly.position.y;

  ctx.save();

  // 1. Trail — small glow dots at past positions
  ctx.globalCompositeOperation = 'lighter';
  const trail = firefly.trail;
  for (let i = 0; i < trail.length; i++) {
    const pt = trail[i]!;
    const trailFade = (i / trail.length) * 0.5;
    const trailAlpha = pt.intensity * trailFade * alpha * 0.4;
    if (trailAlpha < 0.005) continue;

    const trailR = glowR * 0.3 * trailFade;
    const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, trailR);
    grad.addColorStop(0, `rgba(${variety.glowColor}, ${trailAlpha})`);
    grad.addColorStop(1, `rgba(${variety.glowColor}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(pt.x - trailR, pt.y - trailR, trailR * 2, trailR * 2);
  }

  // 2. Main glow halo
  const haloAlpha = effectiveGlow * 0.7;
  const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  haloGrad.addColorStop(0, `rgba(${variety.glowColor}, ${haloAlpha})`);
  haloGrad.addColorStop(0.3, `rgba(${variety.glowColor}, ${haloAlpha * 0.5})`);
  haloGrad.addColorStop(1, `rgba(${variety.glowColor}, 0)`);
  ctx.fillStyle = haloGrad;
  ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2);

  // Inner bright core
  const coreR = glowR * 0.2;
  const coreAlpha = effectiveGlow * 0.9;
  const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, coreR);
  coreGrad.addColorStop(0, `rgba(255, 255, 240, ${coreAlpha})`);
  coreGrad.addColorStop(1, `rgba(${variety.glowColor}, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.fillRect(x - coreR, y - coreR, coreR * 2, coreR * 2);

  ctx.globalCompositeOperation = 'source-over';

  // 3. Tiny dark body dot
  ctx.globalAlpha = alpha * 0.4;
  ctx.fillStyle = '#1a1a10';
  ctx.beginPath();
  ctx.arc(x, y, variety.bodyRadius * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function renderOwl(
  ctx: CanvasRenderingContext2D,
  owl: Owl,
): void {
  if (owl.state !== 'gliding') return;

  ctx.save();
  ctx.translate(owl.x, owl.y);
  ctx.scale(owl.scale * owl.direction, owl.scale);

  const wingAngle = Math.sin(owl.wingPhase) * 0.3;

  ctx.fillStyle = '#0a0a14';

  // Body — ellipse
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(12, -6, 7, 0, Math.PI * 2);
  ctx.fill();

  // Ear tufts
  ctx.beginPath();
  ctx.moveTo(9, -12);
  ctx.lineTo(11, -18);
  ctx.lineTo(13, -12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(13, -12);
  ctx.lineTo(15, -17);
  ctx.lineTo(17, -11);
  ctx.fill();

  // Left wing
  ctx.save();
  ctx.translate(-4, -4);
  ctx.rotate(-wingAngle);
  ctx.beginPath();
  ctx.ellipse(-14, 0, 18, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.translate(-4, 4);
  ctx.rotate(wingAngle);
  ctx.beginPath();
  ctx.ellipse(-14, 0, 18, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

export function renderBat(
  ctx: CanvasRenderingContext2D,
  bat: Bat,
): void {
  if (bat.state === 'inactive') return;

  const wingFlap = Math.sin(bat.wingPhase) * 0.6;

  ctx.save();
  ctx.translate(bat.x, bat.y);
  ctx.scale(bat.scale, bat.scale);
  ctx.fillStyle = '#08080e';

  // Tiny body
  ctx.beginPath();
  ctx.ellipse(0, 0, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Angular V-shape wings
  ctx.beginPath();
  // Left wing
  ctx.moveTo(-2, 0);
  ctx.lineTo(-16, -8 + wingFlap * 12);
  ctx.lineTo(-10, 2 + wingFlap * 4);
  ctx.closePath();
  ctx.fill();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(16, -8 + wingFlap * 12);
  ctx.lineTo(10, 2 + wingFlap * 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
