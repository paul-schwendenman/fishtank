import type { Fish } from '../entities/Fish';

const MIN_FORESHORTEN = 0.2;

export function renderFish(ctx: CanvasRenderingContext2D, fish: Fish): void {
  const { species } = fish;
  const scale = fish.depthScale;
  const alpha = Math.max(0, fish.spawnOpacity);
  if (alpha <= 0) {
    return;
  }

  // Depth-based color desaturation
  const depthDim = 1 - fish.depth * 0.3;

  // Foreshortening from view angle (1.0 at profile → MIN_FORESHORTEN at head-on)
  const foreshorten = Math.max(MIN_FORESHORTEN, Math.cos(fish.effectiveViewAngle));

  ctx.save();
  ctx.translate(fish.position.x, fish.position.y);
  // X-flip first so rotation tilts correctly for both directions
  ctx.scale(fish.facingRight ? scale : -scale, scale);
  ctx.rotate(fish.facingAngle);
  ctx.globalAlpha = alpha;

  const bodyLen = species.bodyLength;
  const bodyH = species.bodyHeight / 2;
  const tailSwing = Math.sin(fish.tailPhase) * 4 * species.tailSize;
  const finFlutter = Math.sin(fish.finPhase) * 2;

  // Foreshortened x-dimensions
  const fBodyLen = bodyLen * foreshorten;
  const fBodyH = bodyH; // height stays the same

  // --- Tail fin ---
  const tailLen = fBodyLen * species.tailSize;
  const tailAmplitude = tailLen * 0.6 * foreshorten + tailLen * 0.6 * (1 - foreshorten) * 0.3;
  ctx.beginPath();
  ctx.moveTo(-fBodyLen * 0.45, 0);
  ctx.lineTo(-fBodyLen * 0.45 - tailLen, -tailAmplitude + tailSwing * foreshorten);
  ctx.quadraticCurveTo(
    -fBodyLen * 0.45 - tailLen * 0.5,
    tailSwing * 0.3 * foreshorten,
    -fBodyLen * 0.45 - tailLen,
    tailAmplitude + tailSwing * foreshorten,
  );
  ctx.closePath();
  ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
  ctx.fill();

  // --- Body ---
  ctx.beginPath();
  if (species.name === 'Angelfish') {
    // Tall diamond-like body, foreshortened
    ctx.moveTo(fBodyLen * 0.5, 0);
    ctx.bezierCurveTo(
      fBodyLen * 0.3, -fBodyH * 1.2,
      -fBodyLen * 0.2, -fBodyH * 1.1,
      -fBodyLen * 0.45, 0,
    );
    ctx.bezierCurveTo(
      -fBodyLen * 0.2, fBodyH * 1.1,
      fBodyLen * 0.3, fBodyH * 1.2,
      fBodyLen * 0.5, 0,
    );
  } else if (species.name === 'Pleco') {
    ctx.ellipse(0, 0, fBodyLen * 0.5, fBodyH * 0.7, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(0, 0, fBodyLen * 0.5, fBodyH, 0, 0, Math.PI * 2);
  }
  ctx.fillStyle = applyDepthTint(species.bodyColor, depthDim);
  ctx.fill();

  // --- Accent stripe/markings ---
  if (species.name === 'Neon Tetra') {
    // Iridescent blue stripe
    ctx.beginPath();
    ctx.moveTo(fBodyLen * 0.35, -1);
    ctx.lineTo(-fBodyLen * 0.1, -1);
    ctx.lineTo(-fBodyLen * 0.1, 1);
    ctx.lineTo(fBodyLen * 0.35, 1);
    ctx.fillStyle = applyDepthTint('#00ccff', depthDim);
    ctx.fill();
    // Red rear section
    ctx.beginPath();
    ctx.moveTo(-fBodyLen * 0.1, -fBodyH * 0.5);
    ctx.lineTo(-fBodyLen * 0.4, -fBodyH * 0.3);
    ctx.lineTo(-fBodyLen * 0.4, fBodyH * 0.3);
    ctx.lineTo(-fBodyLen * 0.1, fBodyH * 0.5);
    ctx.fillStyle = applyDepthTint('#ff2222', depthDim);
    ctx.fill();
  } else if (species.name === 'Angelfish') {
    // Vertical black stripes
    for (const xOff of [-0.05, 0.15]) {
      ctx.beginPath();
      ctx.moveTo(fBodyLen * xOff - 1, -fBodyH * 0.9);
      ctx.lineTo(fBodyLen * xOff + 1, -fBodyH * 0.9);
      ctx.lineTo(fBodyLen * xOff + 1, fBodyH * 0.9);
      ctx.lineTo(fBodyLen * xOff - 1, fBodyH * 0.9);
      ctx.fillStyle = applyDepthTint(species.accentColor, depthDim);
      ctx.fill();
    }
  } else if (species.name === 'Dwarf Gourami') {
    // Horizontal orange and blue stripes
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      const sy = i * fBodyH * 0.35;
      ctx.rect(-fBodyLen * 0.35, sy - 1, fBodyLen * 0.7, 2);
      ctx.fillStyle = applyDepthTint(i % 2 === 0 ? species.accentColor : species.bodyColor, depthDim);
      ctx.fill();
    }
  } else if (species.name === 'Corydoras') {
    // Spots
    for (let i = 0; i < 5; i++) {
      const sx = (i - 2) * fBodyLen * 0.15;
      const sy = ((i % 2) - 0.5) * fBodyH * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = applyDepthTint(species.accentColor, depthDim);
      ctx.fill();
    }
  } else if (species.name === 'Pleco') {
    // Mottled pattern
    const spots = [
      [-0.25, -0.2], [0.1, -0.3], [0.3, 0.1], [-0.1, 0.25],
      [0.2, -0.1], [-0.3, 0.05], [0.05, 0.15], [-0.15, -0.1],
    ];
    for (const [sx, sy] of spots) {
      ctx.beginPath();
      ctx.arc(sx! * fBodyLen, sy! * fBodyH, 2, 0, Math.PI * 2);
      ctx.fillStyle = applyDepthTint(species.accentColor, depthDim);
      ctx.fill();
    }
  }

  // --- Dorsal fin (always on top) ---
  const dorsalH = fBodyH * species.dorsalSize;
  ctx.beginPath();
  ctx.moveTo(fBodyLen * 0.15, -fBodyH + 1);
  ctx.quadraticCurveTo(
    fBodyLen * 0.05,
    -fBodyH - dorsalH + finFlutter,
    -fBodyLen * 0.15,
    -fBodyH + 2,
  );
  ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
  ctx.fill();

  // --- Pectoral fin (fades when head-on) ---
  const pecSize = fBodyLen * species.pectoralSize;
  const pecAlpha = alpha * foreshorten; // hidden when head-on
  ctx.globalAlpha = pecAlpha;
  ctx.beginPath();
  ctx.moveTo(fBodyLen * 0.1, fBodyH * 0.3);
  ctx.quadraticCurveTo(
    fBodyLen * 0.05,
    fBodyH * 0.3 + pecSize + finFlutter,
    -fBodyLen * 0.05,
    fBodyH * 0.4,
  );
  ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
  ctx.fill();
  ctx.globalAlpha = alpha;

  // --- Betta flowing fins ---
  if (species.name === 'Betta') {
    const flow = Math.sin(fish.tailPhase * 0.5) * 6;
    // Long dorsal
    ctx.beginPath();
    ctx.moveTo(fBodyLen * 0.3, -fBodyH);
    ctx.bezierCurveTo(
      fBodyLen * 0.1, -fBodyH - 18 + flow,
      -fBodyLen * 0.2, -fBodyH - 14 + flow * 0.7,
      -fBodyLen * 0.4, -fBodyH + 2,
    );
    ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
    ctx.globalAlpha = alpha * 0.7;
    ctx.fill();
    ctx.globalAlpha = alpha;

    // Long ventral fin
    ctx.beginPath();
    ctx.moveTo(fBodyLen * 0.1, fBodyH);
    ctx.bezierCurveTo(
      fBodyLen * 0.05, fBodyH + 16 - flow,
      -fBodyLen * 0.15, fBodyH + 12 - flow * 0.7,
      -fBodyLen * 0.35, fBodyH,
    );
    ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
    ctx.globalAlpha = alpha * 0.6;
    ctx.fill();
    ctx.globalAlpha = alpha;
  }

  // --- Eye (x-position foreshortened) ---
  const eyeX = fBodyLen * 0.25;
  const eyeY = -fBodyH * 0.15;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, species.eyeSize, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  // Highlight
  ctx.beginPath();
  ctx.arc(eyeX + 0.8, eyeY - 0.8, species.eyeSize * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fill();

  ctx.restore();
}

function applyDepthTint(color: string, dim: number): string {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  const blueShift = (1 - dim) * 0.3;
  const nr = Math.round(r * dim * (1 - blueShift));
  const ng = Math.round(g * dim * (1 - blueShift * 0.5));
  const nb = Math.round(Math.min(255, b * dim + 30 * (1 - dim)));

  return `rgb(${nr},${ng},${nb})`;
}
