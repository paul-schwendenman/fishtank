import type { Bubble } from '../entities/Bubble';

export function renderBubble(ctx: CanvasRenderingContext2D, bubble: Bubble, topBound: number, fadeZone: number): void {
  const opacity = bubble.getOpacity(topBound, fadeZone);
  if (opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Bubble body
  ctx.beginPath();
  ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(180, 220, 255, 0.5)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Fill with slight gradient
  const grad = ctx.createRadialGradient(
    bubble.x - bubble.radius * 0.3,
    bubble.y - bubble.radius * 0.3,
    0,
    bubble.x,
    bubble.y,
    bubble.radius,
  );
  grad.addColorStop(0, 'rgba(200, 235, 255, 0.15)');
  grad.addColorStop(1, 'rgba(150, 200, 240, 0.05)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.arc(
    bubble.x - bubble.radius * 0.25,
    bubble.y - bubble.radius * 0.25,
    bubble.radius * 0.25,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fill();

  ctx.restore();
}
