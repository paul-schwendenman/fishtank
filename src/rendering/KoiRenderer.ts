import type { Koi } from '../entities/Koi';

export function renderKoi(ctx: CanvasRenderingContext2D, koi: Koi, time: number): void {
  const clampedOpacity = Math.max(0, Math.min(1, koi.spawnOpacity));
  if (clampedOpacity <= 0) return;

  const spawnScale = clampedOpacity < 1 ? 0.3 + 0.7 * clampedOpacity : 1;
  const scale = koi.depthScale * spawnScale;
  const alpha = clampedOpacity * koi.depthAlpha;

  const bodyLen = koi.bodyLength;
  const bodyW = koi.bodyWidth;
  const tailSwing = Math.sin(koi.tailPhase) * 6;

  ctx.save();
  ctx.translate(koi.position.x, koi.position.y);

  // Refraction wobble for deeper koi
  if (koi.depth > 0.5) {
    const wobble = Math.sin(time * 3 + koi.position.x * 0.05) * (koi.depth - 0.5) * 4;
    ctx.translate(wobble, wobble * 0.5);
  }

  ctx.rotate(koi.heading);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  // --- Tail fan (draw first, behind body) ---
  const tailX = -bodyLen * 0.48;
  const tailSpread = bodyW * 0.55;
  ctx.beginPath();
  ctx.moveTo(tailX, 0);
  ctx.quadraticCurveTo(
    tailX - bodyLen * 0.12, -tailSpread * 0.5 + tailSwing * 0.3,
    tailX - bodyLen * 0.22, -tailSpread * 0.7 + tailSwing,
  );
  ctx.lineTo(tailX - bodyLen * 0.18, tailSwing * 0.5);
  ctx.quadraticCurveTo(
    tailX - bodyLen * 0.12, tailSpread * 0.5 + tailSwing * 0.3,
    tailX - bodyLen * 0.22, tailSpread * 0.7 + tailSwing,
  );
  ctx.lineTo(tailX, 0);
  ctx.closePath();
  ctx.fillStyle = koi.variety.baseColor;
  ctx.fill();

  // --- Pectoral fins (swept back, slightly transparent) ---
  const finLen = bodyLen * 0.18;
  const finY = bodyW * 0.35;
  ctx.globalAlpha = alpha * 0.5;

  ctx.beginPath();
  ctx.moveTo(bodyLen * 0.1, -finY);
  ctx.quadraticCurveTo(bodyLen * -0.02, -finY - finLen * 0.6, -bodyLen * 0.08, -finY - finLen * 0.2);
  ctx.lineTo(-bodyLen * 0.05, -finY);
  ctx.closePath();
  ctx.fillStyle = koi.variety.baseColor;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(bodyLen * 0.1, finY);
  ctx.quadraticCurveTo(bodyLen * -0.02, finY + finLen * 0.6, -bodyLen * 0.08, finY + finLen * 0.2);
  ctx.lineTo(-bodyLen * 0.05, finY);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = alpha;

  // --- Body: tapered bezier oval ---
  const bodyPath = new Path2D();
  bodyPath.moveTo(bodyLen * 0.5, 0);
  // Right side (top in top-down)
  bodyPath.bezierCurveTo(
    bodyLen * 0.4, -bodyW * 0.45,
    bodyLen * 0.05, -bodyW * 0.55,
    -bodyLen * 0.25, -bodyW * 0.3,
  );
  bodyPath.bezierCurveTo(
    -bodyLen * 0.38, -bodyW * 0.18,
    -bodyLen * 0.46, -bodyW * 0.06,
    -bodyLen * 0.48, 0,
  );
  // Left side (bottom in top-down)
  bodyPath.bezierCurveTo(
    -bodyLen * 0.46, bodyW * 0.06,
    -bodyLen * 0.38, bodyW * 0.18,
    -bodyLen * 0.25, bodyW * 0.3,
  );
  bodyPath.bezierCurveTo(
    bodyLen * 0.05, bodyW * 0.55,
    bodyLen * 0.4, bodyW * 0.45,
    bodyLen * 0.5, 0,
  );
  bodyPath.closePath();

  // Fill base color
  ctx.fillStyle = koi.variety.baseColor;
  ctx.fill(bodyPath);

  // --- Color patches clipped to body ---
  ctx.save();
  ctx.clip(bodyPath);

  for (const patch of koi.patches) {
    if (patch.points.length < 3) continue;
    ctx.beginPath();
    const first = patch.points[0]!;
    ctx.moveTo(first.x * bodyLen, first.y * bodyLen);
    for (let i = 1; i < patch.points.length; i++) {
      const p = patch.points[i]!;
      const next = patch.points[(i + 1) % patch.points.length]!;
      const cpx = (p.x + next.x) / 2 * bodyLen;
      const cpy = (p.y + next.y) / 2 * bodyLen;
      ctx.quadraticCurveTo(p.x * bodyLen, p.y * bodyLen, cpx, cpy);
    }
    ctx.closePath();
    ctx.fillStyle = patch.color;
    ctx.fill();
  }

  // Scale pattern for Asagi
  if (koi.variety.hasScalePattern) {
    const scaleSize = 4;
    ctx.strokeStyle = 'rgba(80, 100, 130, 0.3)';
    ctx.lineWidth = 0.5;
    for (let sx = -bodyLen * 0.35; sx < bodyLen * 0.15; sx += scaleSize * 1.5) {
      for (let sy = -bodyW * 0.4; sy < bodyW * 0.4; sy += scaleSize * 1.3) {
        const offset = Math.floor(sy / (scaleSize * 1.3)) % 2 === 0 ? scaleSize * 0.75 : 0;
        ctx.beginPath();
        ctx.arc(sx + offset, sy, scaleSize * 0.5, 0, Math.PI, true);
        ctx.stroke();
      }
    }
  }

  // Ogon shimmer highlight
  if (koi.variety.hasShimmer) {
    const shimmerX = Math.sin(time * 2 + koi.heading) * bodyLen * 0.2;
    const grad = ctx.createRadialGradient(shimmerX, 0, 0, shimmerX, 0, bodyLen * 0.35);
    grad.addColorStop(0, 'rgba(255, 240, 180, 0.35)');
    grad.addColorStop(1, 'rgba(255, 240, 180, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(-bodyLen * 0.5, -bodyW * 0.6, bodyLen, bodyW * 1.2);
  }

  ctx.restore(); // end clip

  // --- Body outline (subtle) ---
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.stroke(bodyPath);

  // --- Mouth (feeding animation) ---
  if (koi.isFeeding) {
    const mouthOpen = Math.abs(Math.sin(koi.mouthPhase)) * 3;
    ctx.beginPath();
    ctx.ellipse(bodyLen * 0.48, 0, mouthOpen, mouthOpen * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2a1a0a';
    ctx.fill();
  }

  // --- Eyes ---
  const eyeX = bodyLen * 0.35;
  const eyeY = bodyW * 0.2;

  ctx.beginPath();
  ctx.arc(eyeX, -eyeY, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(eyeX + 0.7, -eyeY - 0.7, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeX + 0.7, eyeY - 0.7, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
