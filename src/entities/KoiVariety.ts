export interface PatchConfig {
  color: string;
  countMin: number;
  countMax: number;
  sizeMin: number;
  sizeMax: number;
}

export interface KoiVarietyConfig {
  name: string;
  baseColor: string;
  patches: PatchConfig[];
  hasShimmer: boolean;
  hasScalePattern: boolean;
}

export const KOI_VARIETIES: KoiVarietyConfig[] = [
  {
    name: 'Kohaku',
    baseColor: '#f5f0e8',
    patches: [
      { color: '#cc3333', countMin: 2, countMax: 4, sizeMin: 0.15, sizeMax: 0.3 },
    ],
    hasShimmer: false,
    hasScalePattern: false,
  },
  {
    name: 'Taisho Sanke',
    baseColor: '#f5f0e8',
    patches: [
      { color: '#cc3333', countMin: 2, countMax: 3, sizeMin: 0.15, sizeMax: 0.25 },
      { color: '#1a1a1a', countMin: 1, countMax: 2, sizeMin: 0.06, sizeMax: 0.12 },
    ],
    hasShimmer: false,
    hasScalePattern: false,
  },
  {
    name: 'Showa',
    baseColor: '#1a1a1a',
    patches: [
      { color: '#cc3333', countMin: 2, countMax: 3, sizeMin: 0.15, sizeMax: 0.3 },
      { color: '#f5f0e8', countMin: 1, countMax: 2, sizeMin: 0.12, sizeMax: 0.25 },
    ],
    hasShimmer: false,
    hasScalePattern: false,
  },
  {
    name: 'Ogon',
    baseColor: '#d4a017',
    patches: [],
    hasShimmer: true,
    hasScalePattern: false,
  },
  {
    name: 'Asagi',
    baseColor: '#6688aa',
    patches: [
      { color: '#cc4444', countMin: 2, countMax: 3, sizeMin: 0.1, sizeMax: 0.2 },
    ],
    hasShimmer: false,
    hasScalePattern: true,
  },
];
