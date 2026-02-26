const IDLE_TIMEOUT = 3000;

export function initFullscreenButton(): void {
  const btn = document.getElementById('fullscreen-btn')!;
  let idleTimer = 0;

  btn.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    btn.classList.toggle('is-fullscreen', isFs);
    if (isFs) {
      resetIdle();
    } else {
      clearTimeout(idleTimer);
      document.body.classList.remove('idle');
    }
  });

  function resetIdle(): void {
    document.body.classList.remove('idle');
    clearTimeout(idleTimer);
    if (document.fullscreenElement) {
      idleTimer = window.setTimeout(() => {
        document.body.classList.add('idle');
      }, IDLE_TIMEOUT);
    }
  }

  document.addEventListener('mousemove', resetIdle);
  document.addEventListener('mousedown', resetIdle);
}
