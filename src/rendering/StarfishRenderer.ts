import type { Starfish } from '../entities/Starfish';

/** Simple seeded pseudo-random for consistent texture dots */
function seedRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 11) % 2147483647;
    return s / 2147483647;
  };
}

export function renderStarfish(ctx: CanvasRenderingContext2D, starfish: Starfish): void {
  const opacity = Math.max(0, Math.min(1, starfish.spawnOpacity));
  if (opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(starfish.position.x, starfish.position.y);
  ctx.rotate(starfish.heading);

  const r = starfish.bodyRadius;
  const innerR = r * 0.38;

  // --- 5-pointed star shape with slight arm flex ---
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const tipAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const valleyAngle = ((i + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;

    const flex = Math.sin(starfish.armPhase + i * 1.2) * r * 0.04;
    const tipX = Math.cos(tipAngle) * (r + flex);
    const tipY = Math.sin(tipAngle) * (r + flex);
    const valleyX = Math.cos(valleyAngle) * innerR;
    const valleyY = Math.sin(valleyAngle) * innerR;

    if (i === 0) {
      ctx.moveTo(tipX, tipY);
    } else {
      ctx.lineTo(tipX, tipY);
    }
    ctx.lineTo(valleyX, valleyY);
  }
  ctx.closePath();

  ctx.fillStyle = starfish.color;
  ctx.fill();

  // Subtle outline
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // --- Center bump ---
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fill();

  // --- Texture dots along each arm ---
  const rng = seedRng(starfish.dotSeed);
  for (let i = 0; i < 5; i++) {
    const armAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    for (let d = 0.3; d < 0.9; d += 0.18) {
      const dotX = Math.cos(armAngle) * r * d + (rng() - 0.5) * 2.5;
      const dotY = Math.sin(armAngle) * r * d + (rng() - 0.5) * 2.5;
      const dotR = 0.6 + rng() * 0.5;

      ctx.beginPath();
      ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fill();
    }
  }

  ctx.restore();
}
