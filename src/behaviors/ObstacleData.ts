import { Vector } from '../utils/Vector';

export interface Obstacle {
  center: Vector;
  halfWidth: number;
  halfHeight: number;
  padding: number;
}
