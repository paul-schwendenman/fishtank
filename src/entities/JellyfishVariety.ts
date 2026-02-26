export interface TentacleConfig {
  count: number;
  lengthMin: number;
  lengthMax: number;
  thickness: number;
  waveAmplitude: number;
  waveFrequency: number;
}

export interface OralArmConfig {
  count: number;
  length: number;
  thickness: number;
  ruffleFrequency: number;
}

export interface JellyfishVarietyConfig {
  name: string;
  bellRadiusMin: number;
  bellRadiusMax: number;
  bellAspect: number; // height / width ratio (>1 = tall dome, <1 = flat saucer)
  bellColor: string;
  edgeColor: string;
  glowColor: string;
  bellOpacity: number;
  tentacles: TentacleConfig;
  oralArms: OralArmConfig;
  pulseFreqMin: number;
  pulseFreqMax: number;
  thrustStrength: number;
  sinkRate: number;
  maxSpeed: number;
  maxForce: number;
  bioluminescent: boolean;
  glowIntensity: number;
}

export const JELLYFISH_VARIETIES: JellyfishVarietyConfig[] = [
  {
    name: 'Moon Jelly',
    bellRadiusMin: 20,
    bellRadiusMax: 30,
    bellAspect: 0.5,
    bellColor: 'rgba(200, 210, 230, 0.3)',
    edgeColor: 'rgba(180, 200, 240, 0.6)',
    glowColor: 'rgba(150, 180, 220, 0.2)',
    bellOpacity: 0.35,
    tentacles: {
      count: 30,
      lengthMin: 8,
      lengthMax: 15,
      thickness: 0.5,
      waveAmplitude: 2,
      waveFrequency: 3,
    },
    oralArms: { count: 4, length: 20, thickness: 2, ruffleFrequency: 6 },
    pulseFreqMin: 0.6,
    pulseFreqMax: 0.9,
    thrustStrength: 35,
    sinkRate: 0,
    maxSpeed: 35,
    maxForce: 0.4,
    bioluminescent: false,
    glowIntensity: 0.1,
  },
  {
    name: 'Pacific Sea Nettle',
    bellRadiusMin: 28,
    bellRadiusMax: 40,
    bellAspect: 0.75,
    bellColor: 'rgba(200, 140, 60, 0.35)',
    edgeColor: 'rgba(220, 120, 40, 0.7)',
    glowColor: 'rgba(200, 130, 50, 0.25)',
    bellOpacity: 0.4,
    tentacles: {
      count: 16,
      lengthMin: 60,
      lengthMax: 100,
      thickness: 1.2,
      waveAmplitude: 8,
      waveFrequency: 2,
    },
    oralArms: { count: 4, length: 50, thickness: 4, ruffleFrequency: 8 },
    pulseFreqMin: 0.4,
    pulseFreqMax: 0.7,
    thrustStrength: 40,
    sinkRate: 0,
    maxSpeed: 30,
    maxForce: 0.35,
    bioluminescent: false,
    glowIntensity: 0.15,
  },
  {
    name: 'Blue Blubber',
    bellRadiusMin: 18,
    bellRadiusMax: 28,
    bellAspect: 0.7,
    bellColor: 'rgba(100, 120, 200, 0.35)',
    edgeColor: 'rgba(130, 140, 220, 0.6)',
    glowColor: 'rgba(100, 110, 200, 0.2)',
    bellOpacity: 0.4,
    tentacles: {
      count: 8,
      lengthMin: 10,
      lengthMax: 20,
      thickness: 3,
      waveAmplitude: 3,
      waveFrequency: 4,
    },
    oralArms: { count: 8, length: 25, thickness: 5, ruffleFrequency: 10 },
    pulseFreqMin: 0.7,
    pulseFreqMax: 1.0,
    thrustStrength: 38,
    sinkRate: 0,
    maxSpeed: 38,
    maxForce: 0.45,
    bioluminescent: false,
    glowIntensity: 0.1,
  },
  {
    name: 'Crystal Jelly',
    bellRadiusMin: 16,
    bellRadiusMax: 25,
    bellAspect: 0.45,
    bellColor: 'rgba(220, 240, 255, 0.12)',
    edgeColor: 'rgba(100, 255, 180, 0.5)',
    glowColor: 'rgba(80, 255, 160, 0.35)',
    bellOpacity: 0.15,
    tentacles: {
      count: 40,
      lengthMin: 15,
      lengthMax: 30,
      thickness: 0.3,
      waveAmplitude: 3,
      waveFrequency: 2.5,
    },
    oralArms: { count: 4, length: 12, thickness: 1, ruffleFrequency: 5 },
    pulseFreqMin: 0.5,
    pulseFreqMax: 0.8,
    thrustStrength: 30,
    sinkRate: 0,
    maxSpeed: 32,
    maxForce: 0.35,
    bioluminescent: true,
    glowIntensity: 0.5,
  },
  {
    name: "Lion's Mane",
    bellRadiusMin: 35,
    bellRadiusMax: 50,
    bellAspect: 0.85,
    bellColor: 'rgba(160, 80, 50, 0.35)',
    edgeColor: 'rgba(180, 70, 40, 0.6)',
    glowColor: 'rgba(170, 80, 45, 0.2)',
    bellOpacity: 0.4,
    tentacles: {
      count: 40,
      lengthMin: 80,
      lengthMax: 140,
      thickness: 0.8,
      waveAmplitude: 10,
      waveFrequency: 1.5,
    },
    oralArms: { count: 8, length: 60, thickness: 3, ruffleFrequency: 7 },
    pulseFreqMin: 0.3,
    pulseFreqMax: 0.5,
    thrustStrength: 45,
    sinkRate: 0,
    maxSpeed: 28,
    maxForce: 0.3,
    bioluminescent: false,
    glowIntensity: 0.1,
  },
];
