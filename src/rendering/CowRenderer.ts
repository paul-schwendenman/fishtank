import type { Cow } from '../entities/Cow';
import { lerp } from '../utils/math';

export function renderCow(ctx: CanvasRenderingContext2D, cow: Cow, time: number): void {
  if (cow.spawnOpacity <= 0) return;

  // Depth-based scaling and fading
  const depthScale = lerp(1.0, 0.45, cow.depth);
  const depthAlpha = lerp(1.0, 0.7, cow.depth);

  ctx.save();
  ctx.globalAlpha = Math.min(cow.spawnOpacity, 1) * depthAlpha;
  ctx.translate(cow.position.x, cow.position.y);
  ctx.scale(depthScale, depthScale);

  // Flip for facing direction
  if (!cow.facingRight) {
    ctx.scale(-1, 1);
  }

  const bw = cow.bodyWidth;
  const bh = cow.bodyHeight;
  const lying = cow.lyingTransition;

  // Lying compresses body vertically
  const bodyScaleY = lerp(1.0, 0.5, lying);
  const bodyOffsetY = lying * bh * 0.25; // shift down as lying

  // --- Shadow ---
  ctx.save();
  ctx.globalAlpha *= 0.15;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  const shadowW = bw * (0.8 + lying * 0.2);
  ctx.ellipse(0, bh * 0.5 + 2, shadowW, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Legs (hidden when fully lying) ---
  if (lying < 0.95) {
    ctx.save();
    ctx.globalAlpha *= (1 - lying);
    renderLegs(ctx, cow, bw, bh);
    ctx.restore();
  }

  // --- Body ---
  ctx.save();
  ctx.translate(0, bodyOffsetY);
  ctx.scale(1, bodyScaleY);

  // Walk bob — very subtle for heavy animal
  const walkBob = cow.state === 'walking' ? Math.sin(cow.walkPhase * 2) * 0.4 : 0;
  // Walk sway — subtle horizontal weight transfer
  const walkSway = cow.state === 'walking' ? Math.sin(cow.walkPhase) * 0.6 : 0;
  ctx.translate(walkSway, -walkBob);

  renderBody(ctx, cow, bw, bh);

  // --- Markings ---
  renderMarkings(ctx, cow, bw, bh);

  // Belly highlight
  ctx.beginPath();
  ctx.ellipse(0, bh * 0.05, bw * 0.3, bh * 0.15, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fill();

  ctx.restore(); // undo body transform

  // --- Udder (below body, only visible standing) ---
  if (lying < 0.5) {
    ctx.save();
    ctx.globalAlpha *= (1 - lying * 2);
    ctx.fillStyle = '#e8c8b0';
    ctx.beginPath();
    ctx.ellipse(-bw * 0.12, bh * 0.38 + bodyOffsetY, bw * 0.07, bh * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Head ---
  renderHead(ctx, cow, bw, bh, bodyOffsetY, bodyScaleY, time);

  // --- Tail ---
  renderTail(ctx, cow, bw, bh, bodyOffsetY, bodyScaleY, time);

  ctx.restore(); // main restore
}

/**
 * Traces the cow body silhouette — a simplified boxy shape that reads well at 55px.
 * 4 curves: flat top with shoulder rise, steep rump, flat belly, deep brisket/chest.
 */
function traceBodyPath(ctx: CanvasRenderingContext2D, bw: number, bh: number): void {
  // Body extents
  const l = -bw * 0.48;  // rump (left/back)
  const r = bw * 0.48;   // chest (right/front)
  const t = -bh * 0.38;  // topline
  const b = bh * 0.34;   // belly

  ctx.beginPath();

  // Start at shoulder top — slight hump above topline
  ctx.moveTo(r * 0.75, t - bh * 0.06);

  // Topline: gentle curve, nearly flat, from shoulder to rump
  ctx.bezierCurveTo(
    r * 0.2, t,       // ease into flat
    l * 0.4, t,       // flat middle
    l * 0.9, t + bh * 0.02, // approach rump, still nearly flat
  );

  // Rump: steep rounded drop
  ctx.bezierCurveTo(
    l * 1.02, t + bh * 0.15,
    l * 1.02, b - bh * 0.15,
    l * 0.85, b,
  );

  // Belly: fairly flat, slight tuck-up at rear, gentle brisket dip at front
  ctx.bezierCurveTo(
    l * 0.4, b + bh * 0.02,
    r * 0.2, b + bh * 0.04,
    r * 0.7, b + bh * 0.06, // brisket slightly lower than belly
  );

  // Front chest: rises steeply back up to shoulder
  ctx.bezierCurveTo(
    r * 0.9, b - bh * 0.02,
    r * 1.0, t + bh * 0.25,
    r * 0.75, t - bh * 0.06,
  );

  ctx.closePath();
}

function renderBody(ctx: CanvasRenderingContext2D, cow: Cow, bw: number, bh: number): void {
  traceBodyPath(ctx, bw, bh);
  ctx.fillStyle = cow.variety.baseColor;
  ctx.fill();

  // Subtle underbelly darkening
  ctx.save();
  ctx.beginPath();
  ctx.rect(-bw * 0.55, bh * 0.05, bw * 1.1, bh * 0.5);
  ctx.clip();
  traceBodyPath(ctx, bw, bh);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fill();
  ctx.restore();
}

function renderLegs(ctx: CanvasRenderingContext2D, cow: Cow, bw: number, bh: number): void {
  const legLength = bh * 0.8;
  const legWidth = bw * 0.055;
  const wp = cow.walkPhase;
  const isWalking = cow.state === 'walking';

  // 4 legs with walk cycle phase offsets
  const legPositions = [
    { x: bw * 0.30, phaseOff: 0 },              // front-right
    { x: bw * 0.22, phaseOff: Math.PI },         // front-left
    { x: -bw * 0.24, phaseOff: Math.PI * 0.5 },  // back-right
    { x: -bw * 0.32, phaseOff: Math.PI * 1.5 },  // back-left
  ];

  for (const leg of legPositions) {
    const swing = isWalking ? Math.sin(wp + leg.phaseOff) * bw * 0.08 : 0;
    const lift = isWalking ? Math.max(0, -Math.sin(wp + leg.phaseOff)) * bh * 0.06 : 0;

    const topX = leg.x;
    const topY = bh * 0.2;
    const kneeX = leg.x + swing * 0.3;
    const kneeY = topY + legLength * 0.45;
    const footX = leg.x + swing;
    const footY = topY + legLength - lift;

    // Upper leg — tapers from wide hip to narrower knee
    const upperWidth = legWidth * 1.4;
    ctx.fillStyle = cow.variety.legColor;
    ctx.beginPath();
    ctx.moveTo(topX - upperWidth, topY);
    ctx.lineTo(topX + upperWidth, topY);
    ctx.lineTo(kneeX + legWidth, kneeY);
    ctx.lineTo(kneeX - legWidth, kneeY);
    ctx.closePath();
    ctx.fill();

    // Lower leg — thinner
    const lowerWidth = legWidth * 0.8;
    ctx.beginPath();
    ctx.moveTo(kneeX - legWidth, kneeY);
    ctx.lineTo(kneeX + legWidth, kneeY);
    ctx.lineTo(footX + lowerWidth, footY);
    ctx.lineTo(footX - lowerWidth, footY);
    ctx.closePath();
    ctx.fill();

    // Hoof
    const hoofW = lowerWidth * 1.15;
    const hoofH = bh * 0.05;
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.rect(footX - hoofW, footY - hoofH * 0.3, hoofW * 2, hoofH);
    ctx.fill();
  }
}

function renderMarkings(ctx: CanvasRenderingContext2D, cow: Cow, bw: number, bh: number): void {
  if (cow.variety.pattern === 'solid') return;

  ctx.save();
  // Clip to body silhouette path
  traceBodyPath(ctx, bw, bh);
  ctx.clip();

  if (cow.variety.pattern === 'belt') {
    // White belt across middle
    ctx.fillStyle = cow.variety.beltColor ?? '#f0ede8';
    ctx.fillRect(-bw * 0.15, -bh * 0.5, bw * 0.3, bh);
  } else {
    // Patches
    for (const patch of cow.bodyPatches) {
      ctx.fillStyle = cow.variety.patches[0]?.color ?? '#1a1a1a';
      ctx.beginPath();
      ctx.save();
      ctx.translate(patch.cx * bw, patch.cy * bh);
      ctx.rotate(patch.rotation);
      ctx.ellipse(0, 0, patch.rx * bw, patch.ry * bh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Shaggy texture for Belted Galloway
  if (cow.variety.shaggy) {
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = cow.variety.baseColor;
    ctx.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * bw;
      const y = (Math.random() - 0.5) * bh;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 6, y + (Math.random() - 0.5) * 4);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function renderHead(
  ctx: CanvasRenderingContext2D,
  cow: Cow,
  bw: number, bh: number,
  bodyOffsetY: number,
  bodyScaleY: number,
  _time: number,
): void {
  const headW = bw * 0.24;
  const headH = headW * 0.78; // slightly taller than old 0.75, reads as blocky at scale
  const neckLen = bw * 0.2;

  // Head position based on headAngle
  const headBaseX = bw * 0.4;
  const headBaseY = -bh * 0.15 * bodyScaleY + bodyOffsetY;
  const headX = headBaseX + Math.cos(cow.headAngle) * neckLen;
  const headY = headBaseY + Math.sin(cow.headAngle) * neckLen;

  // Neck — thick tapered quad
  const neckBodyW = bw * 0.10;
  const neckHeadW = bw * 0.065;
  ctx.fillStyle = cow.variety.headColor;
  ctx.beginPath();
  ctx.moveTo(headBaseX, headBaseY - neckBodyW);
  ctx.lineTo(headBaseX, headBaseY + neckBodyW);
  ctx.lineTo(headX, headY + neckHeadW);
  ctx.lineTo(headX, headY - neckHeadW);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(cow.headAngle * 0.5);

  const hw = headW;
  const hh = headH;

  // Head shape — slightly squared ellipse using two overlapping shapes
  // Main head: horizontal ellipse, slightly wider at jaw
  ctx.fillStyle = cow.variety.headColor;
  ctx.beginPath();
  ctx.ellipse(hw * 0.05, 0, hw * 0.95, hh * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flatten the top (poll) — small overlay rectangle + curve
  ctx.beginPath();
  ctx.moveTo(-hw * 0.4, -hh * 0.6);
  ctx.lineTo(hw * 0.5, -hh * 0.6);
  ctx.lineTo(hw * 0.5, -hh * 0.35);
  ctx.bezierCurveTo(hw * 0.3, -hh * 0.45, -hw * 0.2, -hh * 0.45, -hw * 0.4, -hh * 0.35);
  ctx.closePath();
  ctx.fillStyle = cow.variety.headColor;
  ctx.fill();

  // Square off the front face slightly — fill in front edge
  ctx.beginPath();
  ctx.moveTo(hw * 0.8, -hh * 0.5);
  ctx.lineTo(hw * 1.0, -hh * 0.3);
  ctx.lineTo(hw * 1.0, hh * 0.3);
  ctx.lineTo(hw * 0.8, hh * 0.5);
  ctx.bezierCurveTo(hw * 0.95, hh * 0.2, hw * 0.95, -hh * 0.2, hw * 0.8, -hh * 0.5);
  ctx.closePath();
  ctx.fillStyle = cow.variety.headColor;
  ctx.fill();

  // Muzzle — broad lighter area at front
  const muzzleX = hw * 0.6;
  const muzzleY = hh * 0.15;
  ctx.fillStyle = lightenColor(cow.variety.headColor, 0.25);
  ctx.beginPath();
  ctx.ellipse(muzzleX, muzzleY, hw * 0.35, hh * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostril
  ctx.fillStyle = 'rgba(50, 30, 20, 0.5)';
  ctx.beginPath();
  ctx.ellipse(muzzleX + hw * 0.18, muzzleY + hh * 0.05, 1.5, 1.0, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#1a1208';
  ctx.beginPath();
  ctx.arc(hw * 0.1, -hh * 0.2, hw * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(hw * 0.12, -hh * 0.23, hw * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Ear — leaf-shaped, angled back
  const earFlick = cow.isEarFlicking ? 0.25 : 0;
  const earBaseX = -hw * 0.15;
  const earBaseY = -hh * 0.5;
  ctx.save();
  ctx.translate(earBaseX, earBaseY - earFlick * 2.5);
  ctx.rotate(-0.7 - earFlick);
  // Outer ear
  ctx.fillStyle = cow.variety.headColor;
  ctx.beginPath();
  ctx.moveTo(0, hh * 0.1);
  ctx.quadraticCurveTo(-hw * 0.1, -hh * 0.15, -hw * 0.03, -hh * 0.3);
  ctx.quadraticCurveTo(hw * 0.05, -hh * 0.2, hw * 0.08, -hh * 0.05);
  ctx.quadraticCurveTo(hw * 0.06, hh * 0.05, 0, hh * 0.1);
  ctx.closePath();
  ctx.fill();
  // Inner ear
  ctx.fillStyle = 'rgba(200, 150, 130, 0.4)';
  ctx.beginPath();
  ctx.moveTo(0, hh * 0.04);
  ctx.quadraticCurveTo(-hw * 0.06, -hh * 0.1, -hw * 0.01, -hh * 0.2);
  ctx.quadraticCurveTo(hw * 0.03, -hh * 0.12, hw * 0.05, -hh * 0.01);
  ctx.quadraticCurveTo(hw * 0.03, hh * 0.03, 0, hh * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Horn nubs
  ctx.fillStyle = '#d4c8a0';
  ctx.beginPath();
  ctx.ellipse(earBaseX + hw * 0.06, earBaseY - hh * 0.18 - earFlick * 2.5, hw * 0.03, hh * 0.08, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Jaw/chewing animation
  if (cow.jawPhase > 0) {
    const chew = Math.sin(cow.jawPhase) * 1.0;
    ctx.fillStyle = cow.variety.headColor;
    ctx.beginPath();
    ctx.ellipse(hw * 0.2, hh * 0.35 + chew, hw * 0.2, hh * 0.12, 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function renderTail(
  ctx: CanvasRenderingContext2D,
  cow: Cow,
  bw: number, bh: number,
  bodyOffsetY: number,
  bodyScaleY: number,
  _time: number,
): void {
  const tailBaseX = -bw * 0.46;
  const tailBaseY = -bh * 0.15 * bodyScaleY + bodyOffsetY;
  const swish = Math.sin(cow.tailPhase) * 15;

  // Thicker tail base
  ctx.strokeStyle = darkenColor(cow.variety.baseColor, 0.15);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.quadraticCurveTo(
    tailBaseX - bw * 0.15,
    tailBaseY + bh * 0.3 + swish * 0.3,
    tailBaseX - bw * 0.1 + swish * 0.5,
    tailBaseY + bh * 0.5 + swish,
  );
  ctx.stroke();

  // Tail tuft — darker than body
  const tuftX = tailBaseX - bw * 0.1 + swish * 0.5;
  const tuftY = tailBaseY + bh * 0.5 + swish;
  ctx.fillStyle = darkenColor(cow.variety.baseColor, 0.3);
  ctx.beginPath();
  ctx.ellipse(tuftX, tuftY, 5, 3.5, swish * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

/** Lighten a hex color by mixing with white */
function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(g + (255 - g) * amount)}, ${Math.round(b + (255 - b) * amount)})`;
}

/** Darken a hex color by mixing with black */
function darkenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * (1 - amount))}, ${Math.round(g * (1 - amount))}, ${Math.round(b * (1 - amount))})`;
}
