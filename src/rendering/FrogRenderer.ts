import type { Frog } from '../entities/Frog';

export function renderFrog(ctx: CanvasRenderingContext2D, frog: Frog): void {
  ctx.save();
  ctx.translate(frog.position.x, frog.position.y);

  // During leap, apply arc offset and scale
  if (frog.state === 'leaping') {
    ctx.translate(0, frog.leapArcY);
    const s = frog.leapScale;
    ctx.scale(s, s);
  }

  ctx.rotate(frog.heading);

  const len = frog.bodyLength;
  const bodyW = len * 0.45;

  // --- Shadow (only when not leaping high) ---
  if (frog.state !== 'leaping') {
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(1, 2, len * 0.4, bodyW * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // --- Legs ---
  ctx.strokeStyle = '#2a5c1a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  if (frog.state === 'leaping') {
    // Extended legs during leap
    // Back legs (extended behind)
    ctx.beginPath();
    ctx.moveTo(-len * 0.3, -bodyW * 0.6);
    ctx.lineTo(-len * 0.7, -bodyW * 1.2);
    ctx.lineTo(-len * 0.9, -bodyW * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-len * 0.3, bodyW * 0.6);
    ctx.lineTo(-len * 0.7, bodyW * 1.2);
    ctx.lineTo(-len * 0.9, bodyW * 0.8);
    ctx.stroke();
    // Front legs (extended forward)
    ctx.beginPath();
    ctx.moveTo(len * 0.2, -bodyW * 0.5);
    ctx.lineTo(len * 0.5, -bodyW * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(len * 0.2, bodyW * 0.5);
    ctx.lineTo(len * 0.5, bodyW * 0.9);
    ctx.stroke();
  } else {
    // Tucked legs when sitting/swimming
    // Back legs (tucked Z shape)
    ctx.beginPath();
    ctx.moveTo(-len * 0.2, -bodyW * 0.5);
    ctx.lineTo(-len * 0.35, -bodyW * 0.9);
    ctx.lineTo(-len * 0.15, -bodyW * 1.0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-len * 0.2, bodyW * 0.5);
    ctx.lineTo(-len * 0.35, bodyW * 0.9);
    ctx.lineTo(-len * 0.15, bodyW * 1.0);
    ctx.stroke();
    // Front legs (tucked)
    ctx.beginPath();
    ctx.moveTo(len * 0.15, -bodyW * 0.4);
    ctx.lineTo(len * 0.25, -bodyW * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(len * 0.15, bodyW * 0.4);
    ctx.lineTo(len * 0.25, bodyW * 0.7);
    ctx.stroke();
  }

  // --- Body (oval, wider at front) ---
  ctx.beginPath();
  ctx.ellipse(-len * 0.05, 0, len * 0.4, bodyW, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#3a7a2a';
  ctx.fill();

  // Belly highlight
  ctx.beginPath();
  ctx.ellipse(-len * 0.05, 0, len * 0.25, bodyW * 0.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#5a9a4a';
  ctx.fill();

  // --- Eye bumps ---
  const eyeR = len * 0.12;
  ctx.beginPath();
  ctx.arc(len * 0.3, -bodyW * 0.35, eyeR, 0, Math.PI * 2);
  ctx.fillStyle = '#4a8a3a';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(len * 0.3, bodyW * 0.35, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils
  ctx.beginPath();
  ctx.arc(len * 0.32, -bodyW * 0.35, eyeR * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(len * 0.32, bodyW * 0.35, eyeR * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(len * 0.33, -bodyW * 0.37, eyeR * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(len * 0.33, bodyW * 0.33, eyeR * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // --- Throat puff ---
  if (frog.isThroatPuffing) {
    const puffSize = Math.abs(Math.sin(frog.throatPuffPhase)) * len * 0.2;
    ctx.beginPath();
    ctx.ellipse(len * 0.2, 0, puffSize, puffSize * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 220, 180, 0.6)';
    ctx.fill();
  }

  ctx.restore();
}
