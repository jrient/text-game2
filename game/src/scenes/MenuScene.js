import { C } from '../config.js';
import { LEVELS } from '../data/levels.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const W = C.W, H = C.H;
    this._buildBg();
    this._buildTitle();
    this._buildModeButtons();
    this._buildLevelSelect();
    this._buildFooter();
    this._animateTitle();
  }

  _buildBg() {
    // Dark pixel starfield background
    const g = this.add.graphics();
    g.fillStyle(C.COL.BG); g.fillRect(0, 0, C.W, C.H);
    // Stars
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, C.W);
      const y = Phaser.Math.Between(0, C.H);
      const s = Phaser.Math.Between(1, 3);
      g.fillStyle(0xffffff, Math.random() * 0.6 + 0.2);
      g.fillRect(x, y, s, s);
    }
    // Animated pixel particles
    this._stars = [];
    for (let i = 0; i < 20; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, C.W),
        Phaser.Math.Between(0, C.H),
        2, 2, 0x4488ff, 0.5
      );
      this._stars.push(star);
      this.tweens.add({
        targets: star, alpha: { from: 0.1, to: 0.8 },
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1500),
      });
    }
  }

  _buildTitle() {
    const W = C.W;
    // Shadow
    this.add.text(W / 2 + 3, 93, 'PIXEL', {
      fontFamily: "'Press Start 2P'", fontSize: '26px', color: '#002244',
    }).setOrigin(0.5);
    this.add.text(W / 2 + 3, 125, 'SURVIVOR', {
      fontFamily: "'Press Start 2P'", fontSize: '22px', color: '#002244',
    }).setOrigin(0.5);

    this._titleText1 = this.add.text(W / 2, 90, 'PIXEL', {
      fontFamily: "'Press Start 2P'", fontSize: '26px',
      color: '#44ff88',
      stroke: '#002244', strokeThickness: 3,
    }).setOrigin(0.5);

    this._titleText2 = this.add.text(W / 2, 122, 'SURVIVOR', {
      fontFamily: "'Press Start 2P'", fontSize: '22px',
      color: '#4488ff',
      stroke: '#002244', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(W / 2, 158, '像素幸存者', {
      fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#aabbcc',
    }).setOrigin(0.5);
  }

  _buildModeButtons() {
    const W = C.W;
    const btnY = 220;

    // Campaign button
    this._btnCampaign = this._makeButton(W / 2, btnY, '⚔  关卡模式', 0x3355aa, 0x4466cc, () => {
      this._showLevelSelect();
    });

    // Endless button
    this._btnEndless = this._makeButton(W / 2, btnY + 80, '∞  无尽模式', 0x553300, 0x774400, () => {
      this.scene.start('Game', { mode: 'endless', levelIndex: 0 });
    });
  }

  _makeButton(x, y, label, bg, hover, onClick) {
    const g = this.add.graphics();
    const w = 280, h = 54;
    const drawBtn = (col, borderCol) => {
      g.clear();
      g.fillStyle(col); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      g.lineStyle(3, borderCol); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      // Pixel shine top
      g.fillStyle(0xffffff, 0.12); g.fillRect(x - w / 2 + 4, y - h / 2 + 4, w - 8, 6);
    };
    drawBtn(bg, hover);

    const txt = this.add.text(x, y, label, {
      fontFamily: "'Press Start 2P'", fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    txt.on('pointerover', () => drawBtn(hover, 0xffffff));
    txt.on('pointerout',  () => drawBtn(bg, hover));
    txt.on('pointerdown', () => {
      this.cameras.main.flash(200, 255, 255, 255, false);
      this.time.delayedCall(100, onClick);
    });

    // Make entire area interactive (transparent overlay)
    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => drawBtn(hover, 0xffffff));
    zone.on('pointerout',  () => drawBtn(bg, hover));
    zone.on('pointerdown', () => {
      this.cameras.main.flash(200, 255, 255, 255, false);
      this.time.delayedCall(100, onClick);
    });
    return { g, txt, zone };
  }

  _buildLevelSelect() {
    this._levelPanel = this.add.container(0, 0).setVisible(false);
    const W = C.W, H = C.H;

    // Overlay bg
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85); bg.fillRect(0, 0, W, H);
    this._levelPanel.add(bg);

    // Title
    const title = this.add.text(W / 2, 60, '选择关卡', {
      fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#44ff88',
    }).setOrigin(0.5);
    this._levelPanel.add(title);

    // Level cards
    LEVELS.forEach((lvl, i) => {
      const cardY = 130 + i * 115;
      const cardX = W / 2;
      const card = this._makeLevelCard(cardX, cardY, lvl, i);
      this._levelPanel.add(card);
    });

    // Back button
    const back = this.add.text(W / 2, H - 40, '◀ 返回', {
      fontFamily: "'Press Start 2P'", fontSize: '11px', color: '#aabbcc',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this._hideLevelSelect());
    this._levelPanel.add(back);
  }

  _makeLevelCard(x, y, lvl, idx) {
    const container = this.add.container(x, y);
    const w = 340, h = 100;
    const bg = this.add.graphics();
    bg.fillStyle(0x111133, 0.9); bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    bg.lineStyle(2, 0x3355aa); bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    container.add(bg);

    // Level number
    const numTxt = this.add.text(-w / 2 + 18, -h / 2 + 12, `0${lvl.id}`, {
      fontFamily: "'Press Start 2P'", fontSize: '20px', color: '#4488ff',
    });
    container.add(numTxt);

    // Name
    const nameTxt = this.add.text(-w / 2 + 60, -h / 2 + 12, lvl.name, {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#ffffff',
    });
    container.add(nameTxt);

    // Description
    const descTxt = this.add.text(-w / 2 + 60, -h / 2 + 36, lvl.description, {
      fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#aabbcc',
      wordWrap: { width: 240 },
    });
    container.add(descTxt);

    // Duration badge
    const durTxt = this.add.text(w / 2 - 10, -h / 2 + 12, `${lvl.duration}s`, {
      fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#ffdd44',
    }).setOrigin(1, 0);
    container.add(durTxt);

    // Play button
    const playBtn = this.add.text(w / 2 - 10, h / 2 - 14, '▶ 开始', {
      fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#44ff88',
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    playBtn.on('pointerdown', () => {
      this.cameras.main.flash(200, 255, 255, 255, false);
      this.time.delayedCall(150, () => {
        this.scene.start('Game', { mode: 'campaign', levelIndex: idx });
      });
    });
    container.add(playBtn);

    // Make whole card clickable
    const zone = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => { bg.clear(); bg.fillStyle(0x1a2255, 0.95); bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4); bg.lineStyle(2, 0x4466cc); bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4); });
    zone.on('pointerout',  () => { bg.clear(); bg.fillStyle(0x111133, 0.9); bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4); bg.lineStyle(2, 0x3355aa); bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4); });
    zone.on('pointerdown', () => {
      this.cameras.main.flash(200, 255, 255, 255, false);
      this.time.delayedCall(150, () => {
        this.scene.start('Game', { mode: 'campaign', levelIndex: idx });
      });
    });
    container.add(zone);

    return container;
  }

  _buildFooter() {
    this.add.text(C.W / 2, C.H - 20, 'v1.0  ·  触屏/键盘均可操作', {
      fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#334455',
    }).setOrigin(0.5);
  }

  _showLevelSelect() {
    this._levelPanel.setVisible(true);
    this._levelPanel.setAlpha(0);
    this.tweens.add({ targets: this._levelPanel, alpha: 1, duration: 200 });
  }

  _hideLevelSelect() {
    this.tweens.add({
      targets: this._levelPanel, alpha: 0, duration: 150,
      onComplete: () => this._levelPanel.setVisible(false),
    });
  }

  _animateTitle() {
    this.tweens.add({
      targets: [this._titleText1, this._titleText2],
      y: '-=6', duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }
}
