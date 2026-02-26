export function initFullscreenButton(): void {
  const btn = document.getElementById('fullscreen-btn')!;

  btn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    btn.classList.toggle('is-fullscreen', !!document.fullscreenElement);
  });
}
