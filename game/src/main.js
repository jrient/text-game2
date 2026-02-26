import { C } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LevelUpScene from './scenes/LevelUpScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import PauseScene from './scenes/PauseScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: C.W,
  height: C.H,
  backgroundColor: C.COL.BG,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: C.PHYSICS.gravity,
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, LevelUpScene, PauseScene, GameOverScene],
};

// Hide loading overlay when Phaser is ready
const game = new Phaser.Game(config);

game.events.on('ready', () => {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
});

// Fake loading progress bar
let prog = 0;
const bar = document.getElementById('loading-bar');
const iv = setInterval(() => {
  prog = Math.min(prog + Math.random() * 15, 90);
  if (bar) bar.style.width = prog + '%';
}, 120);
window._fakeLoadInterval = iv;

export default game;
