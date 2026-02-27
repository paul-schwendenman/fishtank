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

  // Slight body tilt based on vertical sine motion
  const tilt = Math.sin(swallow.sinePhase) * 0.08;
  ctx.rotate(tilt);

  const wingAngle = Math.sin(swallow.wingPhase);

  // --- Far wing (behind body, dimmer) ---
  ctx.save();
  ctx.globalAlpha *= 0.4;
  ctx.translate(-1, 0);
  renderWing(ctx, wingAngle * 0.7, '#141422');
  ctx.restore();

  // --- Forked tail (side profile) ---
  // Two prongs extending back, slight vertical fork
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.moveTo(-6, -1);
  ctx.lineTo(-17, -3);
  ctx.lineTo(-13, -0.5);
  ctx.lineTo(-17, 2);
  ctx.lineTo(-6, 1);
  ctx.closePath();
  ctx.fill();

  // --- Body (sleek, side profile) ---
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lighter underside
  ctx.fillStyle = '#e0d8d0';
  ctx.beginPath();
  ctx.ellipse(1, 1.2, 5, 1.3, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Rust-colored throat (barn swallow)
  ctx.fillStyle = '#a0522d';
  ctx.beginPath();
  ctx.ellipse(4.5, 0.5, 2.2, 1.5, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // --- Near wing (in front of body) ---
  ctx.save();
  ctx.translate(-1, -1);
  renderWing(ctx, wingAngle, '#1a1a2a');
  ctx.restore();

  // --- Head ---
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.ellipse(7.5, -0.5, 3, 2.5, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(8.5, -0.8, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Beak — small, pointed
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(10, -1);
  ctx.lineTo(12.5, -0.3);
  ctx.lineTo(10, 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/** Draw a single swept-back wing in side profile */
function renderWing(ctx: CanvasRenderingContext2D, flap: number, color: string): void {
  // Wing sweeps from shoulder backward and up/down
  // flap: -1 = full downstroke, +1 = full upstroke
  const wingY = -flap * 7; // vertical displacement of wingtip
  const wingMidY = -flap * 4;

  ctx.fillStyle = color;
  ctx.beginPath();
  // Shoulder joint
  ctx.moveTo(1, 0);
  // Leading edge sweeps back and up/down to wingtip
  ctx.quadraticCurveTo(-3, wingMidY - 2, -13, wingY - 1);
  // Wingtip (pointed)
  ctx.lineTo(-14, wingY);
  // Trailing edge curves back to body
  ctx.quadraticCurveTo(-6, wingMidY + 1.5, -1, 1);
  ctx.closePath();
  ctx.fill();
}
