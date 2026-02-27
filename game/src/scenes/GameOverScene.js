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
    bg.fillStyle(0x04040e); bg.fillRect(0, 0, W, H);
    // Pixel scanlines
    for (let y = 0; y < H; y += 4) {
      bg.fillStyle(0x000000, 0.2); bg.fillRect(0, y, W, 2);
    }
    // Subtle grid
    bg.lineStyle(1, 0x00e8ff, 0.03);
    for (let gx = 0; gx < W; gx += 60) bg.lineBetween(gx, 0, gx, H);
    for (let gy = 0; gy < H; gy += 60) bg.lineBetween(0, gy, W, gy);

    // Stars with neon colors
    const starColors = [0xffffff, 0x00e8ff, 0xff00aa, 0xcc44ff];
    for (let i = 0; i < 60; i++) {
      const col = starColors[Phaser.Math.Between(0, starColors.length - 1)];
      const s = this.add.rectangle(Math.random() * W, Math.random() * H, 2, 2, col, Math.random() * 0.5 + 0.1);
      this.tweens.add({ targets: s, alpha: 0, duration: 800 + Math.random() * 1200, yoyo: true, repeat: -1 });
    }

    // Result title
    const titleColor = this.won ? '#ffcc00' : '#ff2266';
    const titleText  = this.won ? '🎉 VICTORY! 🎉' : '💀 GAME OVER';
    const subtitle   = this.won
      ? (this.gameMode === 'campaign' ? `关卡 ${this.levelIndex + 1} 通关！` : '')
      : '你倒下了...';

    const titleTxt = this.add.text(W / 2, 80, titleText, {
      fontFamily: "'Press Start 2P'", fontSize: '16px',
      color: titleColor, stroke: '#000', strokeThickness: 4,
      shadow: { blur: 8, color: this.won ? '#ffcc00' : '#ff2266', fill: true },
    }).setOrigin(0.5);
    this.tweens.add({ targets: titleTxt, y: 74, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    if (subtitle) {
      this.add.text(W / 2, 110, subtitle, {
        fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#8899bb',
      }).setOrigin(0.5);
    }

    // Stats panel
    this._buildStats(W / 2, H / 2 - 30);

    // Action buttons
    this._buildButtons(W, H);

    // Particle burst on victory (neon confetti)
    if (this.won) {
      const confettiColors = [0x00e8ff, 0xff00aa, 0xffcc00, 0x00ff88, 0xcc44ff];
      for (let i = 0; i < 30; i++) {
        this.time.delayedCall(i * 60, () => {
          const col = confettiColors[Phaser.Math.Between(0, confettiColors.length - 1)];
          const px = this.add.rectangle(Math.random() * W, -10, 6, 6, col);
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
    panel.fillStyle(0x0a0a24, 0.95); panel.fillRoundedRect(cx - W / 2, cy - H / 2, W, H, 8);
    panel.lineStyle(2, 0x00e8ff, 0.6); panel.strokeRoundedRect(cx - W / 2, cy - H / 2, W, H, 8);
    // Shine strip
    panel.fillStyle(0x00e8ff, 0.06); panel.fillRoundedRect(cx - W / 2 + 4, cy - H / 2 + 4, W - 8, 12, 4);

    const rows = [
      { label: '得分', value: this.score.toLocaleString(), color: '#ffcc00' },
      { label: '击杀数', value: this.kills.toString(), color: '#ff2266' },
      { label: '角色等级', value: `Lv.${this.level}`, color: '#00ff88' },
      { label: '存活时间', value: this._formatTime(this.timeSecs), color: '#00e8ff' },
      { label: '模式', value: this.gameMode === 'endless' ? '无尽' : `关卡 ${this.levelIndex + 1}`, color: '#8899bb' },
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

    this._makeBtn(W / 2, btnY, retryData.text, 0x0a1a3a, 0x0e2244, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(320, () => this.scene.start(retryData.scene, retryData.data));
    });

    // Next level (campaign only)
    if (this.won && this.gameMode === 'campaign' && this.levelIndex < 4) {
      this._makeBtn(W / 2, btnY + 65, '▶ 下一关', 0x0a2a1a, 0x0e3a2a, () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(320, () =>
          this.scene.start('Game', { mode: 'campaign', levelIndex: this.levelIndex + 1 })
        );
      });
    }

    // Menu
    this._makeBtn(W / 2, btnY + (this.won && this.gameMode === 'campaign' && this.levelIndex < 4 ? 130 : 65),
      '🏠 主菜单', 0x0a0a24, 0x0e1238, () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(320, () => this.scene.start('Menu'));
      });
  }

  _makeBtn(x, y, label, bg, hover, cb) {
    const g = this.add.graphics();
    const w = 260, h = 50;
    const draw = (col) => {
      g.clear();
      g.fillStyle(col); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      g.lineStyle(2, 0x00e8ff, 0.6); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      // Shine
      g.fillStyle(0x00e8ff, 0.06); g.fillRoundedRect(x - w / 2 + 4, y - h / 2 + 4, w - 8, 10, 4);
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
