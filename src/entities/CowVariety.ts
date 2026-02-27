export type CowPattern = 'solid' | 'patches' | 'belt';

export interface CowPatchConfig {
  color: string;
  countMin: number;
  countMax: number;
  sizeMin: number;
  sizeMax: number;
}

export interface CowVarietyConfig {
  name: string;
  baseColor: string;
  headColor: string;
  legColor: string;
  pattern: CowPattern;
  patches: CowPatchConfig[];
  beltColor?: string;
  sizeMult: number;
  shaggy: boolean;
}

export const COW_VARIETIES: CowVarietyConfig[] = [
  {
    name: 'Holstein',
    baseColor: '#f0ede8',
    headColor: '#f0ede8',
    legColor: '#1a1a1a',
    pattern: 'patches',
    patches: [
      { color: '#1a1a1a', countMin: 3, countMax: 5, sizeMin: 0.15, sizeMax: 0.35 },
    ],
    sizeMult: 1.0,
    shaggy: false,
  },
  {
    name: 'Jersey',
    baseColor: '#c49a6c',
    headColor: '#8b6844',
    legColor: '#8b6844',
    pattern: 'solid',
    patches: [],
    sizeMult: 0.85,
    shaggy: false,
  },
  {
    name: 'Brown Swiss',
    baseColor: '#9a8a78',
    headColor: '#8a7a68',
    legColor: '#7a6a58',
    pattern: 'solid',
    patches: [],
    sizeMult: 1.05,
    shaggy: false,
  },
  {
    name: 'Guernsey',
    baseColor: '#f0ede8',
    headColor: '#c87830',
    legColor: '#c87830',
    pattern: 'patches',
    patches: [
      { color: '#c87830', countMin: 2, countMax: 4, sizeMin: 0.15, sizeMax: 0.3 },
    ],
    sizeMult: 0.9,
    shaggy: false,
  },
  {
    name: 'Belted Galloway',
    baseColor: '#1a1a1a',
    headColor: '#1a1a1a',
    legColor: '#1a1a1a',
    pattern: 'belt',
    patches: [],
    beltColor: '#f0ede8',
    sizeMult: 0.95,
    shaggy: true,
  },
];
