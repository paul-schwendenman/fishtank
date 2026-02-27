import type { Swallow } from '../entities/Swallow';

export function renderSwallow(ctx: CanvasRenderingContext2D, swallow: Swallow): void {
  if (swallow.state === 'inactive') return;

  ctx.save();
  ctx.translate(swallow.x, swallow.y);
  ctx.scale(swallow.scale, swallow.scale);

  // Face direction of flight
  if (swallow.direction === -1) {
    ctx.scale(-1, 1);
  }

  const wingAngle = Math.sin(swallow.wingPhase) * 0.5;

  // --- Body ---
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // White throat
  ctx.fillStyle = '#e0d8d0';
  ctx.beginPath();
  ctx.ellipse(3, 1, 3, 1.5, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // --- Wings (swept back) ---
  ctx.fillStyle = '#1a1a2a';

  // Left wing
  ctx.save();
  ctx.translate(-2, -2);
  ctx.rotate(-wingAngle - 0.2);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, -6);
  ctx.lineTo(-12, -2);
  ctx.lineTo(-2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.translate(-2, 2);
  ctx.rotate(wingAngle + 0.2);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, 6);
  ctx.lineTo(-12, 2);
  ctx.lineTo(-2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // --- Forked tail ---
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.moveTo(-7, -1);
  ctx.lineTo(-16, -4);
  ctx.lineTo(-11, 0);
  ctx.lineTo(-16, 4);
  ctx.lineTo(-7, 1);
  ctx.closePath();
  ctx.fill();

  // --- Head ---
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.arc(7, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(8.5, -0.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#2a2a1a';
  ctx.beginPath();
  ctx.moveTo(9.5, -0.5);
  ctx.lineTo(12, 0);
  ctx.lineTo(9.5, 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
