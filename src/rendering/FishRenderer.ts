import type { Fish } from '../entities/Fish';

export function renderFish(ctx: CanvasRenderingContext2D, fish: Fish): void {
  const { species } = fish;
  const scale = fish.depthScale;
  const alpha = Math.max(0, fish.spawnOpacity);
  if (alpha <= 0) {
    return;
  }

  // Depth-based color desaturation
  const depthDim = 1 - fish.depth * 0.3;

  ctx.save();
  ctx.translate(fish.position.x, fish.position.y);
  ctx.rotate(fish.facingAngle);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  const bodyLen = species.bodyLength;
  const bodyH = species.bodyHeight / 2;
  const tailSwing = Math.sin(fish.tailPhase) * 4 * species.tailSize;
  const finFlutter = Math.sin(fish.finPhase) * 2;

  // --- Tail fin ---
  const tailLen = bodyLen * species.tailSize;
  ctx.beginPath();
  ctx.moveTo(-bodyLen * 0.45, 0);
  ctx.lineTo(-bodyLen * 0.45 - tailLen, -tailLen * 0.6 + tailSwing);
  ctx.quadraticCurveTo(
    -bodyLen * 0.45 - tailLen * 0.5,
    tailSwing * 0.3,
    -bodyLen * 0.45 - tailLen,
    tailLen * 0.6 + tailSwing,
  );
  ctx.closePath();
  ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
  ctx.fill();

  // --- Body ---
  ctx.beginPath();
  // Species-specific body shape
  if (species.name === 'Angelfish') {
    // Tall diamond-like body
    ctx.moveTo(bodyLen * 0.5, 0);
    ctx.bezierCurveTo(bodyLen * 0.3, -bodyH * 1.2, -bodyLen * 0.2, -bodyH * 1.1, -bodyLen * 0.45, 0);
    ctx.bezierCurveTo(-bodyLen * 0.2, bodyH * 1.1, bodyLen * 0.3, bodyH * 1.2, bodyLen * 0.5, 0);
  } else if (species.name === 'Pleco') {
    // Flat, wide body
    ctx.ellipse(0, 0, bodyLen * 0.5, bodyH * 0.7, 0, 0, Math.PI * 2);
  } else {
    // Standard fish ellipse
    ctx.ellipse(0, 0, bodyLen * 0.5, bodyH, 0, 0, Math.PI * 2);
  }
  ctx.fillStyle = applyDepthTint(species.bodyColor, depthDim);
  ctx.fill();

  // --- Accent stripe/markings ---
  if (species.name === 'Neon Tetra') {
    // Iridescent blue stripe
    ctx.beginPath();
    ctx.moveTo(bodyLen * 0.35, -1);
    ctx.lineTo(-bodyLen * 0.1, -1);
    ctx.lineTo(-bodyLen * 0.1, 1);
    ctx.lineTo(bodyLen * 0.35, 1);
    ctx.fillStyle = applyDepthTint('#00ccff', depthDim);
    ctx.fill();
    // Red rear section
    ctx.beginPath();
    ctx.moveTo(-bodyLen * 0.1, -bodyH * 0.5);
    ctx.lineTo(-bodyLen * 0.4, -bodyH * 0.3);
    ctx.lineTo(-bodyLen * 0.4, bodyH * 0.3);
    ctx.lineTo(-bodyLen * 0.1, bodyH * 0.5);
    ctx.fillStyle = applyDepthTint('#ff2222', depthDim);
    ctx.fill();
  } else if (species.name === 'Angelfish') {
    // Vertical black stripes
    for (const xOff of [-0.05, 0.15]) {
      ctx.beginPath();
      ctx.moveTo(bodyLen * xOff - 1, -bodyH * 0.9);
      ctx.lineTo(bodyLen * xOff + 1, -bodyH * 0.9);
      ctx.lineTo(bodyLen * xOff + 1, bodyH * 0.9);
      ctx.lineTo(bodyLen * xOff - 1, bodyH * 0.9);
      ctx.fillStyle = applyDepthTint(species.accentColor, depthDim);
      ctx.fill();
    }
  } else if (species.name === 'Dwarf Gourami') {
    // Horizontal orange and blue stripes
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      const sy = i * bodyH * 0.35;
      ctx.rect(-bodyLen * 0.35, sy - 1, bodyLen * 0.7, 2);
      ctx.fillStyle = applyDepthTint(i % 2 === 0 ? species.accentColor : species.bodyColor, depthDim);
      ctx.fill();
    }
  } else if (species.name === 'Corydoras') {
    // Spots
    for (let i = 0; i < 5; i++) {
      const sx = (i - 2) * bodyLen * 0.15;
      const sy = ((i % 2) - 0.5) * bodyH * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = applyDepthTint(species.accentColor, depthDim);
      ctx.fill();
    }
  } else if (species.name === 'Pleco') {
    // Mottled pattern (deterministic positions)
    const spots = [
      [-0.25, -0.2], [0.1, -0.3], [0.3, 0.1], [-0.1, 0.25],
      [0.2, -0.1], [-0.3, 0.05], [0.05, 0.15], [-0.15, -0.1],
    ];
    for (const [sx, sy] of spots) {
      ctx.beginPath();
      ctx.arc(sx! * bodyLen, sy! * bodyH, 2, 0, Math.PI * 2);
      ctx.fillStyle = applyDepthTint(species.accentColor, depthDim);
      ctx.fill();
    }
  }

  // --- Dorsal fin ---
  const dorsalH = bodyH * species.dorsalSize;
  ctx.beginPath();
  ctx.moveTo(bodyLen * 0.15, -bodyH + 1);
  ctx.quadraticCurveTo(
    bodyLen * 0.05,
    -bodyH - dorsalH + finFlutter,
    -bodyLen * 0.15,
    -bodyH + 2,
  );
  ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
  ctx.fill();

  // --- Pectoral fin ---
  const pecSize = bodyLen * species.pectoralSize;
  ctx.beginPath();
  ctx.moveTo(bodyLen * 0.1, bodyH * 0.3);
  ctx.quadraticCurveTo(
    bodyLen * 0.05,
    bodyH * 0.3 + pecSize + finFlutter,
    -bodyLen * 0.05,
    bodyH * 0.4,
  );
  ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
  ctx.fill();

  // --- Betta flowing fins ---
  if (species.name === 'Betta') {
    const flow = Math.sin(fish.tailPhase * 0.5) * 6;
    // Long dorsal
    ctx.beginPath();
    ctx.moveTo(bodyLen * 0.3, -bodyH);
    ctx.bezierCurveTo(
      bodyLen * 0.1, -bodyH - 18 + flow,
      -bodyLen * 0.2, -bodyH - 14 + flow * 0.7,
      -bodyLen * 0.4, -bodyH + 2,
    );
    ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
    ctx.globalAlpha = alpha * 0.7;
    ctx.fill();
    ctx.globalAlpha = alpha;

    // Long ventral fin
    ctx.beginPath();
    ctx.moveTo(bodyLen * 0.1, bodyH);
    ctx.bezierCurveTo(
      bodyLen * 0.05, bodyH + 16 - flow,
      -bodyLen * 0.15, bodyH + 12 - flow * 0.7,
      -bodyLen * 0.35, bodyH,
    );
    ctx.fillStyle = applyDepthTint(species.finColor, depthDim);
    ctx.globalAlpha = alpha * 0.6;
    ctx.fill();
    ctx.globalAlpha = alpha;
  }

  // --- Eye ---
  const eyeX = bodyLen * 0.25;
  const eyeY = -bodyH * 0.15;
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
  // Parse hex color and apply depth-based dimming with blue shift
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  const blueShift = (1 - dim) * 0.3;
  const nr = Math.round(r * dim * (1 - blueShift));
  const ng = Math.round(g * dim * (1 - blueShift * 0.5));
  const nb = Math.round(Math.min(255, b * dim + 30 * (1 - dim)));

  return `rgb(${nr},${ng},${nb})`;
}
