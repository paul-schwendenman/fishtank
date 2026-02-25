import { GameLoop } from './engine/GameLoop';
import { FishTankScene } from './scenes/FishTankScene';

const canvas = document.getElementById('tank') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  scene.resize(canvas.width, canvas.height);
}

const scene = new FishTankScene(window.innerWidth, window.innerHeight);
const loop = new GameLoop(scene, ctx);

window.addEventListener('resize', resize);
resize();
loop.start();
