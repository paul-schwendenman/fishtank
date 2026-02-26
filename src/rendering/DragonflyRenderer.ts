import type { Dragonfly } from '../entities/Dragonfly';

export function renderDragonfly(ctx: CanvasRenderingContext2D, df: Dragonfly): void {
  ctx.save();
  ctx.translate(df.position.x, df.position.y);
  ctx.rotate(df.heading);

  const len = df.bodyLength;

  // --- Shadow beneath ---
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.ellipse(0, 4, len * 0.4, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.globalAlpha = 1;

  // --- Wings (4 transparent ovals) ---
  const wingBeat = Math.sin(df.wingPhase);
  const wingAlpha = 0.2 + Math.abs(wingBeat) * 0.15;
  ctx.globalAlpha = wingAlpha;

  const wingLen = len * 0.6;
  const wingW = len * 0.18;
  const wingAngle = 0.3 + wingBeat * 0.15;

  // Front wings
  ctx.save();
  ctx.rotate(-wingAngle);
  ctx.beginPath();
  ctx.ellipse(len * 0.1, -wingLen * 0.4, wingW, wingLen * 0.45, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(180, 210, 240, 0.7)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
  ctx.lineWidth = 0.3;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.rotate(wingAngle);
  ctx.beginPath();
  ctx.ellipse(len * 0.1, wingLen * 0.4, wingW, wingLen * 0.45, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(180, 210, 240, 0.7)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
  ctx.lineWidth = 0.3;
  ctx.stroke();
  ctx.restore();

  // Back wings (slightly smaller)
  ctx.save();
  ctx.rotate(-wingAngle * 0.8);
  ctx.beginPath();
  ctx.ellipse(-len * 0.05, -wingLen * 0.35, wingW * 0.85, wingLen * 0.4, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(180, 210, 240, 0.6)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.rotate(wingAngle * 0.8);
  ctx.beginPath();
  ctx.ellipse(-len * 0.05, wingLen * 0.35, wingW * 0.85, wingLen * 0.4, 0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(180, 210, 240, 0.6)';
  ctx.fill();
  ctx.restore();

  ctx.globalAlpha = 1;

  // --- Body (thin elongated) ---
  ctx.beginPath();
  ctx.ellipse(0, 0, len * 0.5, len * 0.06, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#2244aa';
  ctx.fill();

  // Thorax (wider front section)
  ctx.beginPath();
  ctx.ellipse(len * 0.2, 0, len * 0.12, len * 0.08, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#3355bb';
  ctx.fill();

  // --- Eyes ---
  ctx.beginPath();
  ctx.arc(len * 0.38, -len * 0.06, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#115533';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(len * 0.38, len * 0.06, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
