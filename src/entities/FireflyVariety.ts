export interface FireflyVarietyConfig {
  name: string;
  bodyRadius: number;
  glowRadius: number;
  glowColor: string;
  trailLength: number;
  pulseFreq: number;
  /** 'rhythmic' = on/off with easing, 'flash' = quick flash + long dark, 'undulate' = never fully dark */
  pulsePattern: 'rhythmic' | 'flash' | 'undulate';
  maxSpeed: number;
  maxForce: number;
}

export const FIREFLY_VARIETIES: FireflyVarietyConfig[] = [
  {
    name: 'Common Firefly',
    bodyRadius: 2,
    glowRadius: 18,
    glowColor: '180, 210, 40',
    trailLength: 8,
    pulseFreq: 0.8,
    pulsePattern: 'rhythmic',
    maxSpeed: 30,
    maxForce: 0.5,
  },
  {
    name: 'Green Sprite',
    bodyRadius: 1.5,
    glowRadius: 14,
    glowColor: '100, 240, 80',
    trailLength: 5,
    pulseFreq: 1.2,
    pulsePattern: 'flash',
    maxSpeed: 35,
    maxForce: 0.6,
  },
  {
    name: 'Amber Drifter',
    bodyRadius: 2.5,
    glowRadius: 22,
    glowColor: '230, 170, 40',
    trailLength: 12,
    pulseFreq: 0.5,
    pulsePattern: 'undulate',
    maxSpeed: 22,
    maxForce: 0.4,
  },
];
