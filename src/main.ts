import { GameLoop, type Scene } from './engine/GameLoop';
import { FishTankScene } from './scenes/FishTankScene';
import { KoiPondScene } from './scenes/KoiPondScene';

const canvas = document.getElementById('tank') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function createScene(w: number, h: number): Scene {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#koi-pond') {
    return new KoiPondScene(w, h);
  }
  return new FishTankScene(w, h);
}

let scene = createScene(window.innerWidth, window.innerHeight);

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  scene.resize(canvas.width, canvas.height);
}

const loop = new GameLoop(scene, ctx);

window.addEventListener('resize', resize);
resize();
loop.start();
