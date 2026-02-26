import type { Crab } from '../entities/Crab';

export function renderCrab(ctx: CanvasRenderingContext2D, crab: Crab): void {
  const opacity = Math.max(0, Math.min(1, crab.spawnOpacity));
  if (opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(crab.position.x, crab.position.y);
  ctx.rotate(crab.heading);

  const w = crab.bodyWidth;
  const h = crab.bodyHeight;
  const legAnim = crab.state === 'scuttling' ? Math.sin(crab.legPhase) * 4 : 0;

  // --- Legs (4 per side, animated during scuttling) ---
  ctx.strokeStyle = crab.shellColor;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const baseX = -w * 0.25 + i * (w * 0.18);
      const baseY = side * h * 0.4;
      const phase = legAnim * (i % 2 === 0 ? 1 : -1);
      const tipX = baseX + phase * 0.5;
      const tipY = side * (h * 0.5 + w * 0.35 + phase * side * 0.5);
      const midX = (baseX + tipX) / 2;
      const midY = (baseY + tipY) / 2 + side * 2;

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();
    }
  }

  // --- Claws ---
  const clawOpen = Math.sin(crab.clawPhase) * 0.12 + 0.25;
  for (let side = -1; side <= 1; side += 2) {
    const cx = w * 0.5;
    const cy = side * h * 0.28;

    // Arm
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, cy * 0.6);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Upper pincer
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 6, cy - side * 5 * clawOpen);
    ctx.stroke();

    // Lower pincer
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 6, cy + side * 5 * clawOpen);
    ctx.stroke();
  }

  // --- Shell (body) ---
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.48, h * 0.48, 0, 0, Math.PI * 2);
  ctx.fillStyle = crab.shellColor;
  ctx.fill();

  // Shell highlight
  ctx.beginPath();
  ctx.ellipse(-w * 0.08, -h * 0.08, w * 0.22, h * 0.16, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();

  // Shell ridge lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    const y = -h * 0.15 + i * h * 0.12;
    ctx.beginPath();
    ctx.moveTo(-w * 0.25, y);
    ctx.quadraticCurveTo(0, y + 1.5, w * 0.25, y);
    ctx.stroke();
  }

  // --- Eyes on stalks ---
  for (let side = -1; side <= 1; side += 2) {
    const ex = w * 0.38;
    const ey = side * h * 0.1;

    // Stalk
    ctx.strokeStyle = crab.shellColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.28, side * h * 0.04);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Eye
    ctx.beginPath();
    ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(ex + 0.5, ey - 0.5, 0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
  }

  ctx.restore();
}
