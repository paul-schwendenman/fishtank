import type { Particle } from '../entities/Particle';

export function renderParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
  ctx.save();
  ctx.globalAlpha = particle.opacity;
  ctx.fillStyle = 'rgba(200, 220, 240, 1)';
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
