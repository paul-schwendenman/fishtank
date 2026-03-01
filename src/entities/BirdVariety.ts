import type { PerchType } from './PerchPoint';

export type BirdSize = 'small' | 'medium' | 'large';
export type FlightStyle = 'normal' | 'undulating' | 'direct';
export type Personality = 'shy' | 'bold' | 'aggressive';
export type TailStyle = 'short' | 'medium' | 'long' | 'pointed' | 'cocked';

export interface BirdVarietyConfig {
  id: string;
  name: string;
  size: BirdSize;
  bodyColor: string;
  wingColor: string;
  headColor: string;
  breastColor: string;
  beakColor: string;
  accentColor?: string;
  hasCrest: boolean;
  tailStyle: TailStyle;
  feeders: PerchType[];
  flightStyle: FlightStyle;
  personality: Personality;
  pairsWithId?: string;
  clingsVertical?: boolean;
  headDown?: boolean;
  tailCocked?: boolean;
  grabAndGo?: boolean;
}

export const BIRD_VARIETIES: BirdVarietyConfig[] = [
  // Bold / Large
  {
    id: 'cardinal-m',
    name: 'Northern Cardinal (M)',
    size: 'medium',
    bodyColor: '#cc2222',
    wingColor: '#aa1a1a',
    headColor: '#cc2222',
    breastColor: '#dd3333',
    beakColor: '#e8a030',
    accentColor: '#1a1a1a', // black face mask
    hasCrest: true,
    tailStyle: 'long',
    feeders: ['feeder-platform', 'ground', 'branch'],
    flightStyle: 'normal',
    personality: 'bold',
    pairsWithId: 'cardinal-f',
  },
  {
    id: 'cardinal-f',
    name: 'Northern Cardinal (F)',
    size: 'medium',
    bodyColor: '#b89070',
    wingColor: '#a07858',
    headColor: '#b89070',
    breastColor: '#c8a080',
    beakColor: '#e8a030',
    accentColor: '#c06040', // red tints
    hasCrest: true,
    tailStyle: 'long',
    feeders: ['feeder-platform', 'ground', 'branch'],
    flightStyle: 'normal',
    personality: 'bold',
    pairsWithId: 'cardinal-m',
  },
  {
    id: 'blue-jay',
    name: 'Blue Jay',
    size: 'large',
    bodyColor: '#4488cc',
    wingColor: '#3366aa',
    headColor: '#4488cc',
    breastColor: '#e8e8e8',
    beakColor: '#2a2a2a',
    accentColor: '#1a1a1a', // black necklace
    hasCrest: true,
    tailStyle: 'long',
    feeders: ['feeder-platform', 'feeder-suet', 'bath-rim', 'branch'],
    flightStyle: 'direct',
    personality: 'aggressive',
  },
  {
    id: 'oriole',
    name: 'Baltimore Oriole',
    size: 'medium',
    bodyColor: '#ee8822',
    wingColor: '#1a1a1a',
    headColor: '#1a1a1a',
    breastColor: '#ee8822',
    beakColor: '#555555',
    accentColor: '#ffffff', // white wing bars
    hasCrest: false,
    tailStyle: 'medium',
    feeders: ['feeder-jelly', 'bath-rim', 'branch'],
    flightStyle: 'normal',
    personality: 'bold',
  },
  {
    id: 'dove',
    name: 'Mourning Dove',
    size: 'medium',
    bodyColor: '#c0a888',
    wingColor: '#a89070',
    headColor: '#b8a080',
    breastColor: '#d0b898',
    beakColor: '#2a2a2a',
    hasCrest: false,
    tailStyle: 'pointed',
    feeders: ['ground', 'feeder-platform'],
    flightStyle: 'direct',
    personality: 'shy',
  },
  // Medium
  {
    id: 'downy-wp',
    name: 'Downy Woodpecker',
    size: 'medium',
    bodyColor: '#f0f0f0',
    wingColor: '#1a1a1a',
    headColor: '#1a1a1a',
    breastColor: '#f0f0f0',
    beakColor: '#333333',
    accentColor: '#cc2222', // red nape spot
    hasCrest: false,
    tailStyle: 'short',
    feeders: ['feeder-suet', 'trunk', 'branch'],
    flightStyle: 'undulating',
    personality: 'bold',
    clingsVertical: true,
  },
  {
    id: 'rb-wp',
    name: 'Red-bellied Woodpecker',
    size: 'medium',
    bodyColor: '#e8e0d0',
    wingColor: '#1a1a1a',
    headColor: '#cc3322',
    breastColor: '#e8e0d0',
    beakColor: '#333333',
    hasCrest: false,
    tailStyle: 'short',
    feeders: ['feeder-suet', 'feeder-jelly', 'trunk', 'branch'],
    flightStyle: 'undulating',
    personality: 'bold',
    clingsVertical: true,
  },
  {
    id: 'robin',
    name: 'American Robin',
    size: 'medium',
    bodyColor: '#6a5a4a',
    wingColor: '#5a4a3a',
    headColor: '#3a3a3a',
    breastColor: '#cc6633',
    beakColor: '#cca030',
    hasCrest: false,
    tailStyle: 'medium',
    feeders: ['bath-rim', 'bath-water', 'ground', 'branch'],
    flightStyle: 'normal',
    personality: 'bold',
  },
  // Small
  {
    id: 'chickadee',
    name: 'Black-capped Chickadee',
    size: 'small',
    bodyColor: '#a0a098',
    wingColor: '#8a8a82',
    headColor: '#1a1a1a',
    breastColor: '#f0ede8',
    beakColor: '#1a1a1a',
    accentColor: '#f0ede8', // white cheeks
    hasCrest: false,
    tailStyle: 'medium',
    feeders: ['feeder-tube', 'feeder-suet', 'branch'],
    flightStyle: 'normal',
    personality: 'shy',
    grabAndGo: true,
  },
  {
    id: 'titmouse',
    name: 'Tufted Titmouse',
    size: 'small',
    bodyColor: '#8a8a90',
    wingColor: '#7a7a80',
    headColor: '#8a8a90',
    breastColor: '#f0ede8',
    beakColor: '#1a1a1a',
    accentColor: '#d0a080', // peach flanks
    hasCrest: true,
    tailStyle: 'medium',
    feeders: ['feeder-tube', 'feeder-suet', 'branch'],
    flightStyle: 'normal',
    personality: 'bold',
  },
  {
    id: 'nuthatch',
    name: 'White-breasted Nuthatch',
    size: 'small',
    bodyColor: '#6a7a8a',
    wingColor: '#5a6a7a',
    headColor: '#1a1a1a',
    breastColor: '#f0ede8',
    beakColor: '#4a4a4a',
    hasCrest: false,
    tailStyle: 'short',
    feeders: ['feeder-tube', 'feeder-suet', 'trunk', 'branch'],
    flightStyle: 'normal',
    personality: 'bold',
    clingsVertical: true,
    headDown: true,
  },
  {
    id: 'goldfinch',
    name: 'American Goldfinch',
    size: 'small',
    bodyColor: '#e8d020',
    wingColor: '#1a1a1a',
    headColor: '#e8d020',
    breastColor: '#e8d020',
    beakColor: '#dd8833',
    accentColor: '#1a1a1a', // black forehead
    hasCrest: false,
    tailStyle: 'short',
    feeders: ['feeder-tube', 'branch'],
    flightStyle: 'undulating',
    personality: 'shy',
  },
  {
    id: 'junco',
    name: 'Dark-eyed Junco',
    size: 'small',
    bodyColor: '#5a5a62',
    wingColor: '#4a4a52',
    headColor: '#4a4a52',
    breastColor: '#f0ede8',
    beakColor: '#d0a0a0',
    accentColor: '#f0f0f0', // white outer tail
    hasCrest: false,
    tailStyle: 'short',
    feeders: ['ground', 'feeder-platform'],
    flightStyle: 'normal',
    personality: 'shy',
  },
  {
    id: 'wren',
    name: 'Carolina Wren',
    size: 'small',
    bodyColor: '#9a6a3a',
    wingColor: '#8a5a2a',
    headColor: '#9a6a3a',
    breastColor: '#d8c8a8',
    beakColor: '#4a4040',
    accentColor: '#f0ede8', // white eyebrow
    hasCrest: false,
    tailStyle: 'cocked',
    feeders: ['feeder-suet', 'branch'],
    flightStyle: 'normal',
    personality: 'bold',
    tailCocked: true,
  },
  {
    id: 'house-finch',
    name: 'House Finch',
    size: 'small',
    bodyColor: '#8a7060',
    wingColor: '#7a6050',
    headColor: '#cc4444',
    breastColor: '#cc4444',
    beakColor: '#8a7a60',
    hasCrest: false,
    tailStyle: 'medium',
    feeders: ['feeder-tube', 'feeder-platform', 'feeder-jelly', 'branch'],
    flightStyle: 'normal',
    personality: 'bold',
  },
];
