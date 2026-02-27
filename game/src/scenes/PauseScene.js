import { C } from '../config.js';

export default class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'Pause', active: false }); }

  create() {
    const W = C.W, H = C.H;

    // Only visible when woken
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

    const panel = this.add.rectangle(W / 2, H / 2, 280, 220, 0x0a0a24, 0.97);
    const border = this.add.graphics();
    border.lineStyle(3, 0x00e8ff, 0.6); border.strokeRoundedRect(W / 2 - 140, H / 2 - 110, 280, 220, 8);
    // Shine strip
    border.fillStyle(0x00e8ff, 0.06); border.fillRoundedRect(W / 2 - 136, H / 2 - 106, 272, 12, 4);

    this.add.text(W / 2, H / 2 - 80, '⏸ PAUSED', {
      fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#00e8ff',
      shadow: { blur: 8, color: '#00e8ff', fill: true },
    }).setOrigin(0.5);

    // Resume
    this._makeBtn(W / 2, H / 2 - 20, '▶  继续', '#00ff88', () => {
      const game = this.scene.get('Game');
      if (game) game._togglePause();
    });

    // Return to menu
    this._makeBtn(W / 2, H / 2 + 40, '🏠  返回菜单', '#ff2266', () => {
      const game = this.scene.get('Game');
      if (game) { game._cleanup(); game.scene.stop(); }
      this.scene.stop();
      this.scene.stop('LevelUp');
      this.scene.start('Menu');
    });

    // Controls hint
    this.add.text(W / 2, H / 2 + 90, 'ESC = 暂停/继续', {
      fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#556677',
    }).setOrigin(0.5);
  }

  _makeBtn(x, y, label, color, cb) {
    const txt = this.add.text(x, y, label, {
      fontFamily: "'Press Start 2P'", fontSize: '11px', color,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    txt.on('pointerover', () => txt.setScale(1.08));
    txt.on('pointerout',  () => txt.setScale(1));
    txt.on('pointerdown', cb);
  }
}
