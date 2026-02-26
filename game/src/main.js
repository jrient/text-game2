import { C } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LevelUpScene from './scenes/LevelUpScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import PauseScene from './scenes/PauseScene.js';

// Detect device type and orientation
function getScreenConfig() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const aspectRatio = screenWidth / screenHeight;

  // Mobile or portrait screen - use portrait mode
  if (isMobile || aspectRatio < 1) {
    return {
      width: 390,
      height: 844,
      isPortrait: true,
      isMobile: true,
    };
  }
  // Desktop or landscape screen - use landscape mode
  else {
    return {
      width: 1280,
      height: 720,
      isPortrait: false,
      isMobile: false,
    };
  }
}

const screenConfig = getScreenConfig();
C.W = screenConfig.width;
C.H = screenConfig.height;
C.IS_PORTRAIT = screenConfig.isPortrait;
C.IS_MOBILE = screenConfig.isMobile;

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
    resizeInterval: 100, // Check for resize every 100ms
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
