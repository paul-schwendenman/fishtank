import type { Scene } from '../engine/GameLoop';

export interface SceneEntry {
  id: string;
  name: string;
  description: string;
  icon: string;
  create: (w: number, h: number) => Scene;
}

export class SettingsUI {
  private overlay: HTMLElement;
  private sceneList: HTMLElement;
  private activeSceneId: string;

  constructor(
    private scenes: SceneEntry[],
    initialSceneId: string,
    private onSceneChange: (entry: SceneEntry) => void,
  ) {
    this.activeSceneId = initialSceneId;
    this.overlay = document.getElementById('settings-overlay')!;
    this.sceneList = document.getElementById('scene-list')!;

    this.renderSceneList();
    this.bindEvents();
  }

  private renderSceneList(): void {
    this.sceneList.innerHTML = '';
    for (const entry of this.scenes) {
      const el = document.createElement('button');
      el.className = 'scene-option' + (entry.id === this.activeSceneId ? ' active' : '');
      el.innerHTML = `
        <span class="scene-icon">${entry.icon}</span>
        <span class="scene-info">
          <span class="scene-name">${entry.name}</span>
          <span class="scene-desc">${entry.description}</span>
        </span>
      `;
      el.addEventListener('click', () => this.selectScene(entry));
      this.sceneList.appendChild(el);
    }
  }

  private selectScene(entry: SceneEntry): void {
    if (entry.id === this.activeSceneId) return;
    this.activeSceneId = entry.id;
    this.renderSceneList();
    this.onSceneChange(entry);
    this.close();
  }

  private bindEvents(): void {
    document.getElementById('settings-btn')!.addEventListener('click', () => this.open());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  private open(): void {
    this.overlay.classList.add('open');
  }

  private close(): void {
    this.overlay.classList.remove('open');
  }
}
