import { C } from '../config.js';

export default class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'Pause', active: false }); }

  create() {
    const W = C.W, H = C.H;

    // Only visible when woken
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

    const panel = this.add.rectangle(W / 2, H / 2, 280, 220, 0x111133, 0.97);
    const border = this.add.graphics();
    border.lineStyle(3, 0x3355aa); border.strokeRoundedRect(W / 2 - 140, H / 2 - 110, 280, 220, 6);

    this.add.text(W / 2, H / 2 - 80, '⏸ PAUSED', {
      fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffdd44',
    }).setOrigin(0.5);

    // Resume
    this._makeBtn(W / 2, H / 2 - 20, '▶  继续', '#44ff88', () => {
      const game = this.scene.get('Game');
      if (game) game._togglePause();
    });

    // Return to menu
    this._makeBtn(W / 2, H / 2 + 40, '🏠  返回菜单', '#ff8888', () => {
      const game = this.scene.get('Game');
      if (game) { game._cleanup(); game.scene.stop(); }
      this.scene.stop();
      this.scene.stop('LevelUp');
      this.scene.start('Menu');
    });

    // Controls hint
    this.add.text(W / 2, H / 2 + 90, 'ESC = 暂停/继续', {
      fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#445566',
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
