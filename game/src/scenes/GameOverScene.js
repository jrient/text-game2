import { C } from '../config.js';
import { LEVELS } from '../data/levels.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.won        = data.won || false;
    this.score      = data.score || 0;
    this.kills      = data.kills || 0;
    this.level      = data.level || 1;
    this.timeSecs   = data.time || 0;
    this.gameMode   = data.mode || 'endless';
    this.levelIndex = data.levelIndex || 0;
  }

  create() {
    const W = C.W, H = C.H;
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x050510); bg.fillRect(0, 0, W, H);
    // Pixel scanlines
    for (let y = 0; y < H; y += 4) {
      bg.fillStyle(0x000000, 0.2); bg.fillRect(0, y, W, 2);
    }

    // Stars
    for (let i = 0; i < 60; i++) {
      const s = this.add.rectangle(Math.random() * W, Math.random() * H, 2, 2, 0xffffff, Math.random() * 0.5 + 0.1);
      this.tweens.add({ targets: s, alpha: 0, duration: 800 + Math.random() * 1200, yoyo: true, repeat: -1 });
    }

    // Result title
    const titleColor = this.won ? '#ffdd44' : '#ff4444';
    const titleText  = this.won ? '🎉 VICTORY! 🎉' : '💀 GAME OVER';
    const subtitle   = this.won
      ? (this.gameMode === 'campaign' ? `关卡 ${this.levelIndex + 1} 通关！` : '')
      : '你倒下了...';

    const titleTxt = this.add.text(W / 2, 80, titleText, {
      fontFamily: "'Press Start 2P'", fontSize: '16px',
      color: titleColor, stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.tweens.add({ targets: titleTxt, y: 74, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    if (subtitle) {
      this.add.text(W / 2, 110, subtitle, {
        fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#aabbcc',
      }).setOrigin(0.5);
    }

    // Stats panel
    this._buildStats(W / 2, H / 2 - 30);

    // Action buttons
    this._buildButtons(W, H);

    // Particle burst on victory
    if (this.won) {
      for (let i = 0; i < 30; i++) {
        this.time.delayedCall(i * 60, () => {
          const px = this.add.rectangle(Math.random() * W, -10, 6, 6, Phaser.Display.Color.RandomRGB().color);
          this.tweens.add({
            targets: px, y: H + 20, x: px.x + Phaser.Math.Between(-80, 80),
            duration: 1200 + Math.random() * 800, alpha: 0,
            onComplete: () => px.destroy(),
          });
        });
      }
    }
  }

  _buildStats(cx, cy) {
    const W = 320, H = 160;
    const panel = this.add.graphics();
    panel.fillStyle(0x111133, 0.9); panel.fillRoundedRect(cx - W / 2, cy - H / 2, W, H, 6);
    panel.lineStyle(2, 0x3355aa);   panel.strokeRoundedRect(cx - W / 2, cy - H / 2, W, H, 6);

    const rows = [
      { label: '得分', value: this.score.toLocaleString(), color: '#ffdd44' },
      { label: '击杀数', value: this.kills.toString(), color: '#ff8888' },
      { label: '角色等级', value: `Lv.${this.level}`, color: '#44ff88' },
      { label: '存活时间', value: this._formatTime(this.timeSecs), color: '#88aaff' },
      { label: '模式', value: this.gameMode === 'endless' ? '无尽' : `关卡 ${this.levelIndex + 1}`, color: '#aabbcc' },
    ];

    rows.forEach((row, i) => {
      const y = cy - H / 2 + 22 + i * 28;
      this.add.text(cx - W / 2 + 16, y, row.label, {
        fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#667788',
      });
      this.add.text(cx + W / 2 - 16, y, row.value, {
        fontFamily: "'Press Start 2P'", fontSize: '8px', color: row.color,
      }).setOrigin(1, 0);
    });
  }

  _buildButtons(W, H) {
    const btnY = H - 160;

    // Retry button
    const retryData = this.gameMode === 'campaign'
      ? { text: '🔄 再试一次', scene: 'Game', data: { mode: 'campaign', levelIndex: this.levelIndex } }
      : { text: '🔄 再来一局', scene: 'Game', data: { mode: 'endless', levelIndex: 0 } };

    this._makeBtn(W / 2, btnY, retryData.text, 0x1a3a1a, 0x4466aa, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(320, () => this.scene.start(retryData.scene, retryData.data));
    });

    // Next level (campaign only)
    if (this.won && this.gameMode === 'campaign' && this.levelIndex < 4) {
      this._makeBtn(W / 2, btnY + 65, '▶ 下一关', 0x1a3010, 0x44aa44, () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(320, () =>
          this.scene.start('Game', { mode: 'campaign', levelIndex: this.levelIndex + 1 })
        );
      });
    }

    // Menu
    this._makeBtn(W / 2, btnY + (this.won && this.gameMode === 'campaign' && this.levelIndex < 4 ? 130 : 65),
      '🏠 主菜单', 0x1a1a2a, 0x334466, () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(320, () => this.scene.start('Menu'));
      });
  }

  _makeBtn(x, y, label, bg, hover, cb) {
    const g = this.add.graphics();
    const w = 260, h = 50;
    const draw = (col) => {
      g.clear();
      g.fillStyle(col); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      g.lineStyle(2, 0x4466aa); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    };
    draw(bg);
    const txt = this.add.text(x, y, label, {
      fontFamily: "'Press Start 2P'", fontSize: '11px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    txt.on('pointerover', () => draw(hover));
    txt.on('pointerout',  () => draw(bg));
    txt.on('pointerdown', cb);
    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => draw(hover));
    zone.on('pointerout',  () => draw(bg));
    zone.on('pointerdown', cb);
  }

  _formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
