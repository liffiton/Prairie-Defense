// Entry point for Prairie Defense: Midwest Native Guardians

import './style.css';
import { Game } from './game/Game';
import { UIManager } from './ui/UIManager';

function init() {
  const appContainer = document.querySelector<HTMLDivElement>('#app');
  if (!appContainer) throw new Error('#app container not found');

  // Create game canvas
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 640;

  // Read biome from URL if provided (e.g. ?biome=savanna or ?biome=wetland)
  const urlParams = new URLSearchParams(window.location.search);
  const initialBiome = urlParams.get('biome') || 'prairie';

  // Initialize Game and UI
  const game = new Game(canvas, initialBiome);
  const ui = new UIManager(game, appContainer);

  if (urlParams.get('guide') === 'true') {
    ui.openFieldGuide();
  }

  // Main game loop with delta time
  let lastTime = performance.now();

  function loop(currentTime: number) {
    const rawDt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Cap delta time to prevent spiral of death on tab switch
    const dt = Math.min(rawDt, 0.1);

    game.update(dt);
    game.render();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// Start game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
