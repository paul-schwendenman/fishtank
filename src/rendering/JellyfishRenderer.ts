import type { Jellyfish } from '../entities/Jellyfish';
import { clamp } from '../utils/math';

export function renderJellyfish(
  ctx: CanvasRenderingContext2D,
  jelly: Jellyfish,
  time: number,
): void {
  const clampedOpacity = Math.max(0, Math.min(1, jelly.spawnOpacity));
  if (clampedOpacity <= 0) return;

  const spawnScale = clampedOpacity < 1 ? 0.3 + 0.7 * clampedOpacity : 1;
  const scale = jelly.depthScale * spawnScale;
  const alpha = clampedOpacity * jelly.depthAlpha;
  const variety = jelly.variety;
  const bellR = jelly.bellRadius;
  const bellH = bellR * variety.bellAspect;
  const pulse = jelly.pulseAmount;

  // Pulse affects bell width and height
  const pulseWidthScale = 1 - pulse * 0.2; // narrows during contraction
  const pulseHeightScale = 1 + pulse * 0.1; // slightly taller during contraction

  ctx.save();
  ctx.translate(jelly.position.x, jelly.position.y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  // --- 1. Tentacles (behind bell) ---
  renderTentacles(ctx, jelly, time, bellR, pulseWidthScale);

  // --- 2. Oral arms ---
  renderOralArms(ctx, jelly, time);

  // --- 3. Bell ---
  const bellPath = renderBell(ctx, variety, bellR, bellH, pulseWidthScale, pulseHeightScale);

  // --- 4. Edge glow ---
  renderEdgeGlow(ctx, variety, bellR, bellH, pulseWidthScale, pulseHeightScale);

  // --- 5. Bioluminescent glow ---
  if (variety.bioluminescent) {
    renderBioluminescence(ctx, variety, bellR, time);
  }

  // --- 6. Inner detail (Moon Jelly gonad pattern) ---
  if (variety.name === 'Moon Jelly') {
    renderGonadPattern(ctx, bellR, bellH, pulseWidthScale, pulseHeightScale, bellPath);
  }

  ctx.restore();
}

function renderTentacles(
  ctx: CanvasRenderingContext2D,
  jelly: Jellyfish,
  time: number,
  bellR: number,
  pulseWidthScale: number,
): void {
  const variety = jelly.variety;
  const tc = variety.tentacles;
  const history = jelly.positionHistory;
  const currentPos = jelly.position;

  ctx.lineCap = 'round';

  for (let i = 0; i < tc.count; i++) {
    const angle = (i / tc.count) * Math.PI - Math.PI / 2 + Math.PI / 4;
    // Tentacle attachment point on bell rim
    const attachX = Math.cos(angle) * bellR * pulseWidthScale * 0.9;
    const attachY = 0; // Bell bottom

    const tentLen = jelly.tentacleLengths[i]!;
    const phaseOff = jelly.tentaclePhaseOffsets[i]!;

    // Opacity fades from base to tip
    const baseAlpha = clamp(variety.bellOpacity + 0.15, 0, 0.5);

    ctx.beginPath();
    ctx.moveTo(attachX, attachY);

    const segments = 8;
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;

      // Hybrid: trailing from position history + parametric sine undulation
      const histIdx = Math.floor((1 - t) * (history.length - 1));
      const histPoint = history[Math.max(0, histIdx)]!;
      const trailOffset = histPoint.sub(currentPos).scale(t * 0.3);

      const waveX = Math.sin(time * tc.waveFrequency + t * 4 + phaseOff) * tc.waveAmplitude * t;
      const waveY = tentLen * t;

      ctx.lineTo(
        attachX + trailOffset.x + waveX,
        attachY + waveY + trailOffset.y * 0.5,
      );
    }

    // Taper line width
    ctx.strokeStyle = variety.edgeColor;
    ctx.lineWidth = tc.thickness * (1 - 0.5 * 0); // uniform, taper via segments
    ctx.globalAlpha *= baseAlpha / 0.5;
    ctx.stroke();
    ctx.globalAlpha /= baseAlpha / 0.5;
  }
}

function renderOralArms(
  ctx: CanvasRenderingContext2D,
  jelly: Jellyfish,
  time: number,
): void {
  const variety = jelly.variety;
  const oa = variety.oralArms;

  for (let i = 0; i < oa.count; i++) {
    const spread = (i / (oa.count - 1 || 1) - 0.5) * jelly.bellRadius * 0.5;

    ctx.beginPath();
    ctx.moveTo(spread, 0);

    const segments = 6;
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const ruffle = Math.sin(time * oa.ruffleFrequency + t * 8 + i * 2) * oa.thickness * 0.5 * t;
      ctx.lineTo(
        spread + ruffle,
        t * oa.length,
      );
    }

    ctx.strokeStyle = variety.bellColor;
    ctx.lineWidth = oa.thickness * (1 - 0.3);
    ctx.lineCap = 'round';
    ctx.globalAlpha *= 0.6;
    ctx.stroke();
    ctx.globalAlpha /= 0.6;
  }
}

function renderBell(
  ctx: CanvasRenderingContext2D,
  variety: { bellColor: string; bellOpacity: number },
  bellR: number,
  bellH: number,
  pulseWidthScale: number,
  pulseHeightScale: number,
): Path2D {
  const w = bellR * pulseWidthScale;
  const h = bellH * pulseHeightScale;

  const bellPath = new Path2D();
  // Half-dome shape: flat bottom, curved top
  bellPath.moveTo(-w, 0);
  bellPath.bezierCurveTo(
    -w, -h * 0.6,
    -w * 0.5, -h,
    0, -h,
  );
  bellPath.bezierCurveTo(
    w * 0.5, -h,
    w, -h * 0.6,
    w, 0,
  );
  // Slight inward curve at bottom rim
  bellPath.quadraticCurveTo(w * 0.5, h * 0.1, 0, h * 0.05);
  bellPath.quadraticCurveTo(-w * 0.5, h * 0.1, -w, 0);
  bellPath.closePath();

  // Radial gradient: bright center fading to transparent edge
  const grad = ctx.createRadialGradient(0, -h * 0.4, 0, 0, -h * 0.3, Math.max(w, h));
  grad.addColorStop(0, variety.bellColor);
  grad.addColorStop(0.6, variety.bellColor);
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.fill(bellPath);

  return bellPath;
}

function renderEdgeGlow(
  ctx: CanvasRenderingContext2D,
  variety: { edgeColor: string },
  bellR: number,
  bellH: number,
  pulseWidthScale: number,
  pulseHeightScale: number,
): void {
  const w = bellR * pulseWidthScale;
  const h = bellH * pulseHeightScale;

  ctx.save();

  // Edge stroke along bell rim
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.bezierCurveTo(
    -w, -h * 0.6,
    -w * 0.5, -h,
    0, -h,
  );
  ctx.bezierCurveTo(
    w * 0.5, -h,
    w, -h * 0.6,
    w, 0,
  );

  ctx.strokeStyle = variety.edgeColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = variety.edgeColor;
  ctx.shadowBlur = 8;
  ctx.stroke();

  // Bottom rim glow
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.quadraticCurveTo(0, h * 0.15, w, 0);
  ctx.strokeStyle = variety.edgeColor;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 6;
  ctx.stroke();

  ctx.restore();
}

function renderBioluminescence(
  ctx: CanvasRenderingContext2D,
  variety: { glowColor: string; glowIntensity: number },
  bellR: number,
  time: number,
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const pulseGlow = 0.7 + Math.sin(time * 2) * 0.3;
  const glowR = bellR * 2.5;

  const grad = ctx.createRadialGradient(0, -bellR * 0.3, 0, 0, -bellR * 0.3, glowR);
  grad.addColorStop(0, variety.glowColor);
  grad.addColorStop(0.4, variety.glowColor.replace(/[\d.]+\)$/, `${variety.glowIntensity * pulseGlow * 0.5})`));
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.globalAlpha *= variety.glowIntensity * pulseGlow;
  ctx.fillRect(-glowR, -glowR - bellR * 0.3, glowR * 2, glowR * 2);

  ctx.restore();
}

function renderGonadPattern(
  ctx: CanvasRenderingContext2D,
  bellR: number,
  bellH: number,
  pulseWidthScale: number,
  pulseHeightScale: number,
  bellPath: Path2D,
): void {
  const w = bellR * pulseWidthScale;
  const h = bellH * pulseHeightScale;

  ctx.save();
  ctx.clip(bellPath);

  // 4-leaf clover pattern
  ctx.globalAlpha *= 0.3;
  ctx.fillStyle = 'rgba(180, 150, 200, 0.5)';

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const cx = Math.cos(angle) * w * 0.25;
    const cy = -h * 0.4 + Math.sin(angle) * h * 0.2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.18, h * 0.22, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
