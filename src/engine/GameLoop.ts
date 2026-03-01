export interface Scene {
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  resize(width: number, height: number): void;
  destroy?(): void;
}

export class GameLoop {
  private lastTime = 0;
  private running = false;
  private rafId = 0;

  constructor(
    private scene: Scene,
    private ctx: CanvasRenderingContext2D,
  ) {}

  setScene(scene: Scene): void {
    this.scene.destroy?.();
    this.scene = scene;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick(now: number): void {
    if (!this.running) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.033);
    this.lastTime = now;

    this.scene.update(dt);
    this.scene.render(this.ctx);

    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }
}
