import { GameLoop } from './engine/GameLoop';
import { FishTankScene } from './scenes/FishTankScene';
import { KoiPondScene } from './scenes/KoiPondScene';
import { JellyfishTankScene } from './scenes/JellyfishTankScene';
import { FireflyFieldScene } from './scenes/FireflyFieldScene';
import { TidePoolScene } from './scenes/TidePoolScene';
import { FarmFieldScene } from './scenes/FarmFieldScene';
import { BirdFeederScene } from './scenes/BirdFeederScene';
import { SettingsUI, type SceneEntry } from './ui/SettingsUI';
import { initFullscreenButton } from './ui/fullscreen';

const canvas = document.getElementById('tank') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const scenes: SceneEntry[] = [
  {
    id: 'fish-tank',
    name: 'Fish Tank',
    description: 'Tropical aquarium',
    icon: '\u{1F420}',
    create: (w, h) => new FishTankScene(w, h),
  },
  {
    id: 'koi-pond',
    name: 'Koi Pond',
    description: 'Zen garden pond',
    icon: '\u{1F3E3}',
    create: (w, h) => new KoiPondScene(w, h),
  },
  {
    id: 'jellyfish-tank',
    name: 'Jellyfish Tank',
    description: 'Deep sea exhibit',
    icon: '\u{1FABC}',
    create: (w, h) => new JellyfishTankScene(w, h),
  },
  {
    id: 'firefly-field',
    name: 'Firefly Field',
    description: 'Moonlit meadow at dusk',
    icon: '\u{2728}',
    create: (w, h) => new FireflyFieldScene(w, h),
  },
  {
    id: 'tide-pool',
    name: 'Tide Pool',
    description: 'Sun-drenched rocky shore',
    icon: '\u{1F980}',
    create: (w, h) => new TidePoolScene(w, h),
  },
  {
    id: 'farm-field',
    name: 'Farm Field',
    description: 'Pastoral dairy farm',
    icon: '\u{1F404}',
    create: (w, h) => new FarmFieldScene(w, h),
  },
  {
    id: 'bird-feeder',
    name: 'Bird Feeder',
    description: 'Backyard bird watching',
    icon: '\u{1F426}',
    create: (w, h) => new BirdFeederScene(w, h),
  },
];

function getInitialScene(): SceneEntry {
  const hash = window.location.hash.toLowerCase().replace('#', '');
  return scenes.find((s) => s.id === hash) ?? scenes[0]!;
}

const initial = getInitialScene();
let scene = initial.create(window.innerWidth, window.innerHeight);

const loop = new GameLoop(scene, ctx);

initFullscreenButton();

new SettingsUI(scenes, initial.id, (entry) => {
  window.location.hash = entry.id;
  scene = entry.create(canvas.width, canvas.height);
  loop.setScene(scene);
});

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  scene.resize(canvas.width, canvas.height);
}

window.addEventListener('resize', resize);
resize();
loop.start();
