import type { Fish } from '../entities/Fish';

const BLIND_SPOT_COS = Math.cos((270 / 2) * Math.PI / 180); // cos(135°) ≈ -0.707

/** Check if target is within observer's 270° forward vision arc and within maxRadius */
export function isPerceived(observer: Fish, target: Fish, maxRadius: number): boolean {
  const dx = target.position.x - observer.position.x;
  const dy = target.position.y - observer.position.y;
  const distSq = dx * dx + dy * dy;

  if (distSq > maxRadius * maxRadius || distSq < 0.001) return false;

  // Direction to target
  const dist = Math.sqrt(distSq);
  const toTargetX = dx / dist;
  const toTargetY = dy / dist;

  // Observer's heading
  const heading = observer.headingDir;

  // Dot product = cos(angle between heading and direction to target)
  const dot = heading.x * toTargetX + heading.y * toTargetY;

  // 270° arc means blind spot is 90° behind: target is visible if dot > cos(135°)
  return dot > BLIND_SPOT_COS;
}

/** Filter a list of candidates to those perceived by observer */
export function getPerceivedNeighbors(observer: Fish, candidates: Fish[], maxRadius: number): Fish[] {
  const result: Fish[] = [];
  for (const candidate of candidates) {
    if (candidate === observer) continue;
    if (isPerceived(observer, candidate, maxRadius)) {
      result.push(candidate);
    }
  }
  return result;
}
