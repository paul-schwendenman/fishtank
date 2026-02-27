import type { Butterfly } from '../entities/Butterfly';

export function renderButterfly(ctx: CanvasRenderingContext2D, butterfly: Butterfly): void {
  if (butterfly.spawnOpacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = Math.min(butterfly.spawnOpacity, 1);
  ctx.translate(butterfly.position.x, butterfly.position.y);

  const wingBeat = Math.sin(butterfly.wingPhase);
  const wingScale = 0.3 + Math.abs(wingBeat) * 0.7; // wings open/close

  // Body
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 1.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(-3, -6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(3, -6);
  ctx.stroke();

  // Wings
  ctx.fillStyle = butterfly.color;

  // Left upper wing
  ctx.save();
  ctx.scale(wingScale, 1);
  ctx.beginPath();
  ctx.ellipse(-5, -2, 5, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right upper wing
  ctx.save();
  ctx.scale(wingScale, 1);
  ctx.beginPath();
  ctx.ellipse(5, -2, 5, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Left lower wing (slightly smaller)
  ctx.save();
  ctx.scale(wingScale, 1);
  ctx.beginPath();
  ctx.ellipse(-4, 2, 4, 3, -0.1, 0, Math.PI * 2);
  ctx.globalAlpha *= 0.8;
  ctx.fill();
  ctx.restore();

  // Right lower wing
  ctx.save();
  ctx.scale(wingScale, 1);
  ctx.beginPath();
  ctx.ellipse(4, 2, 4, 3, 0.1, 0, Math.PI * 2);
  ctx.globalAlpha *= 0.8;
  ctx.fill();
  ctx.restore();

  // Wing edge details
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.3;
  ctx.save();
  ctx.scale(wingScale, 1);
  ctx.beginPath();
  ctx.ellipse(-5, -2, 5, 4, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(5, -2, 5, 4, 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}
