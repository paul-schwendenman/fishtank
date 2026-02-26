import type { Particle } from '../entities/Particle';

export function renderParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
  if (particle.opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = particle.opacity;

  const color = `rgb(${particle.colorR}, ${particle.colorG}, ${particle.colorB})`;

  // Glow halo for larger particles
  if (particle.baseSize > 1.8) {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particle.colorR}, ${particle.colorG}, ${particle.colorB}, 0.08)`;
    ctx.globalAlpha = particle.opacity * 0.5;
    ctx.fill();
    ctx.globalAlpha = particle.opacity;
  }

  // Main particle
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}
