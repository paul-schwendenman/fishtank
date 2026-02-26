import { Vector } from '../utils/Vector';
import { randomRange } from '../utils/math';

export interface TidePoolBounds {
  cx: number;
  cy: number;
  baseRx: number;
  baseRy: number;
  lobes: number[]; // radial multipliers sampled around the ellipse
}

/** Generate organic lobe multipliers using layered sine waves */
export function generateLobes(count: number = 64): number[] {
  const lobes: number[] = [];
  const layers = [
    { freq: 3, amp: 0.10, phase: Math.random() * Math.PI * 2 },
    { freq: 5, amp: 0.06, phase: Math.random() * Math.PI * 2 },
    { freq: 7, amp: 0.03, phase: Math.random() * Math.PI * 2 },
    { freq: 11, amp: 0.015, phase: Math.random() * Math.PI * 2 },
  ];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    let mult = 1;
    for (const layer of layers) {
      mult += Math.sin(angle * layer.freq + layer.phase) * layer.amp;
    }
    lobes.push(mult);
  }
  return lobes;
}

/** Interpolated lobe value at any angle */
export function lobeAt(angle: number, lobes: number[]): number {
  const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const idx = (a / (Math.PI * 2)) * lobes.length;
  const i0 = Math.floor(idx) % lobes.length;
  const i1 = (i0 + 1) % lobes.length;
  const frac = idx - Math.floor(idx);
  return lobes[i0]! * (1 - frac) + lobes[i1]! * frac;
}

/** Get the boundary point at a given angle */
export function poolEdgePoint(angle: number, bounds: TidePoolBounds): Vector {
  const lobe = lobeAt(angle, bounds.lobes);
  return new Vector(
    bounds.cx + bounds.baseRx * lobe * Math.cos(angle),
    bounds.cy + bounds.baseRy * lobe * Math.sin(angle),
  );
}

/** Normalized distance: 0 at center, 1 at pool edge, >1 outside */
export function normalizedPoolDist(x: number, y: number, bounds: TidePoolBounds): number {
  const dx = x - bounds.cx;
  const dy = y - bounds.cy;
  const angle = Math.atan2(dy, dx);
  const lobe = lobeAt(angle, bounds.lobes);
  const ndx = dx / (bounds.baseRx * lobe);
  const ndy = dy / (bounds.baseRy * lobe);
  return Math.sqrt(ndx * ndx + ndy * ndy);
}

/** Random point inside the pool boundary */
export function randomPointInPool(bounds: TidePoolBounds, marginFraction: number = 0.7): Vector {
  const angle = randomRange(0, Math.PI * 2);
  const dist = Math.random() * marginFraction;
  const lobe = lobeAt(angle, bounds.lobes);
  return new Vector(
    bounds.cx + Math.cos(angle) * bounds.baseRx * lobe * dist,
    bounds.cy + Math.sin(angle) * bounds.baseRy * lobe * dist,
  );
}

/** Trace the pool boundary path onto the canvas context */
export function tracePoolPath(ctx: CanvasRenderingContext2D, bounds: TidePoolBounds, steps: number = 128): void {
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const pt = poolEdgePoint(angle, bounds);
    if (i === 0) {
      ctx.moveTo(pt.x, pt.y);
    } else {
      ctx.lineTo(pt.x, pt.y);
    }
  }
  ctx.closePath();
}
