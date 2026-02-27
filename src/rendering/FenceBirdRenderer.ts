import type { FenceBird } from '../entities/FenceBird';

export function renderFenceBird(ctx: CanvasRenderingContext2D, bird: FenceBird): void {
  if (bird.spawnOpacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = Math.min(bird.spawnOpacity, 1);
  ctx.translate(bird.x, bird.y);

  if (!bird.facingRight) {
    ctx.scale(-1, 1);
  }

  const hopBounce = bird.state === 'hopping'
    ? -Math.sin(bird.hopProgress * Math.PI) * 5
    : 0;
  ctx.translate(0, hopBounce);

  // --- Legs (only when perching or hopping) ---
  if (bird.state !== 'flying') {
    ctx.strokeStyle = '#4a4040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, 4);
    ctx.lineTo(-2, 9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, 4);
    ctx.lineTo(2, 9);
    ctx.stroke();

    // Feet
    ctx.beginPath();
    ctx.moveTo(-4, 9);
    ctx.lineTo(0, 9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.lineTo(4, 9);
    ctx.stroke();
  }

  // --- Body ---
  ctx.fillStyle = '#5a5040';
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Breast (lighter)
  ctx.fillStyle = '#8a7a68';
  ctx.beginPath();
  ctx.ellipse(2, 1, 4, 3.5, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // --- Wing ---
  if (bird.state === 'flying') {
    const flapAngle = Math.sin(bird.wingPhase) * 0.8;
    ctx.save();
    ctx.rotate(flapAngle);
    ctx.fillStyle = '#4a4438';
    ctx.beginPath();
    ctx.ellipse(0, -5, 5, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // Folded wing
    ctx.fillStyle = '#4a4438';
    ctx.beginPath();
    ctx.ellipse(-1, 0, 5, 4, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Head ---
  ctx.save();
  ctx.translate(5, -4);
  ctx.rotate(bird.headTurn);

  ctx.fillStyle = '#5a5040';
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(1.5, -0.5, 1, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlight
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(1.7, -0.8, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#c0a040';
  ctx.beginPath();
  ctx.moveTo(3.5, -0.5);
  ctx.lineTo(7, 0.5);
  ctx.lineTo(3.5, 1.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // --- Tail ---
  const tailBob = Math.sin(bird.tailBobPhase) * 2;
  ctx.fillStyle = '#4a4438';
  ctx.beginPath();
  ctx.moveTo(-5, -1);
  ctx.lineTo(-11, -3 + tailBob);
  ctx.lineTo(-10, 0 + tailBob);
  ctx.lineTo(-5, 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
