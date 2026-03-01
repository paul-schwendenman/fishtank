export type PerchType =
  | 'feeder-tube'
  | 'feeder-platform'
  | 'feeder-suet'
  | 'feeder-jelly'
  | 'bath-rim'
  | 'bath-water'
  | 'branch'
  | 'trunk'
  | 'fence'
  | 'ground';

export interface PerchPoint {
  x: number;
  y: number;
  type: PerchType;
  facing?: 'left' | 'right';
  occupied: boolean;
}
