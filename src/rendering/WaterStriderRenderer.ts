import type { WaterStrider } from '../entities/WaterStrider';

export function renderWaterStrider(ctx: CanvasRenderingContext2D, ws: WaterStrider): void {
  ctx.save();
  ctx.translate(ws.position.x, ws.position.y);
  ctx.rotate(ws.heading);

  const len = ws.bodyLength;
  const spread = ws.legSpread;

  // --- Leg dimple shadows (at each leg tip) ---
  ctx.globalAlpha = 0.15;
  const legTips = [
    // Front legs
    { x: len * 0.3, y: -spread * 0.7 },
    { x: len * 0.3, y: spread * 0.7 },
    // Middle legs (longest)
    { x: 0, y: -spread },
    { x: 0, y: spread },
    // Back legs
    { x: -len * 0.4, y: -spread * 0.6 },
    { x: -len * 0.4, y: spread * 0.6 },
  ];

  for (const tip of legTips) {
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // --- Legs (6 radiating lines) ---
  ctx.strokeStyle = '#4a3a2a';
  ctx.lineWidth = 0.7;
  ctx.lineCap = 'round';

  for (const tip of legTips) {
    ctx.beginPath();
    ctx.moveTo(tip.x * 0.3, tip.y * 0.2);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
  }

  // --- Body (small oval) ---
  ctx.beginPath();
  ctx.ellipse(0, 0, len * 0.4, len * 0.15, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#3a2a1a';
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(len * 0.3, 0, len * 0.12, len * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#4a3a2a';
  ctx.fill();

  ctx.restore();
}
