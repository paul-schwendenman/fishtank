import type { Goby } from '../entities/Goby';

export function renderGoby(ctx: CanvasRenderingContext2D, goby: Goby): void {
  const opacity = Math.max(0, Math.min(1, goby.spawnOpacity));
  if (opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(goby.position.x, goby.position.y);
  ctx.rotate(goby.heading);

  const len = goby.bodyLength;
  const w = len * 0.3;
  const tailSwing = Math.sin(goby.tailPhase) * 3;

  // --- Tail fin ---
  ctx.beginPath();
  ctx.moveTo(-len * 0.3, 0);
  ctx.lineTo(-len * 0.55, -w * 0.8 + tailSwing);
  ctx.lineTo(-len * 0.55, w * 0.8 + tailSwing);
  ctx.closePath();
  ctx.fillStyle = goby.color;
  ctx.globalAlpha = opacity * 0.7;
  ctx.fill();
  ctx.globalAlpha = opacity;

  // --- Dorsal fin (tiny) ---
  ctx.beginPath();
  ctx.moveTo(len * 0.05, -w * 0.8);
  ctx.lineTo(-len * 0.15, -w * 1.0);
  ctx.lineTo(-len * 0.2, -w * 0.7);
  ctx.closePath();
  ctx.globalAlpha = opacity * 0.5;
  ctx.fillStyle = goby.color;
  ctx.fill();
  ctx.globalAlpha = opacity;

  // --- Body (tapered oval) ---
  ctx.beginPath();
  ctx.ellipse(0, 0, len * 0.4, w, 0, 0, Math.PI * 2);
  ctx.fillStyle = goby.color;
  ctx.fill();

  // Belly highlight
  ctx.beginPath();
  ctx.ellipse(len * 0.05, w * 0.15, len * 0.2, w * 0.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fill();

  // --- Eyes ---
  ctx.beginPath();
  ctx.arc(len * 0.25, -w * 0.25, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(len * 0.25, w * 0.25, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(len * 0.26, -w * 0.28, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(len * 0.26, w * 0.22, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
