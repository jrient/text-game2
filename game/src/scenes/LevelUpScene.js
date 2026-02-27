import { C } from '../config.js';
import { SKILLS } from '../data/skills.js';

export default class LevelUpScene extends Phaser.Scene {
  constructor() { super({ key: 'LevelUp', active: false }); }

  init(data) {
    this.choices = data.choices || [];
    this.playerLevel = data.playerLevel || 1;
  }

  create() {
    const W = C.W, H = C.H;

    // Dim overlay
    this._overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75);

    // Title with glow
    this.add.text(W / 2, H * 0.12, '✨  升  级  啦  ！', {
      fontFamily: "'Press Start 2P'", fontSize: '15px',
      color: '#ffcc00', stroke: '#000', strokeThickness: 3,
      shadow: { blur: 8, color: '#ffcc00', fill: true },
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.19, `LEVEL ${this.playerLevel}`, {
      fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#00ff88',
    }).setOrigin(0.5);

    // Animated separator (neon cyan)
    const sep = this.add.graphics();
    sep.lineStyle(2, 0x00e8ff, 0.5); sep.lineBetween(30, H * 0.23, W - 30, H * 0.23);

    // Skill cards
    const cardStartY = H * 0.28;
    const cardGap    = (H * 0.65) / 3;

    this.choices.forEach((choice, i) => {
      this._buildCard(W / 2, cardStartY + i * cardGap, choice, i);
    });

    // Animate in
    this.cameras.main.fadeIn(150, 0, 0, 0);

    // Touch: tap anywhere outside to dismiss (safety)
    this.time.delayedCall(8000, () => {
      if (this.scene.isActive('LevelUp')) this._pick(this.choices[0]);
    });
  }

  _buildCard(cx, cy, choice, idx) {
    const W = 340, H = 90;
    const skill = SKILLS[choice.id];
    if (!skill) return;

    const currentLevel = choice.currentLevel || 0;
    const nextLevel    = currentLevel + 1;
    const isNew        = choice.type === 'new_weapon' || currentLevel === 0;

    const container = this.add.container(cx, cy);

    // Card background
    const bg = this.add.graphics();
    const borderCol = skill.type === 'weapon' ? 0x00e8ff : 0x00ff88;
    bg.fillStyle(0x0a0a24, 0.95); bg.fillRoundedRect(-W / 2, -H / 2, W, H, 8);
    bg.lineStyle(3, borderCol, 0.6); bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 8);
    container.add(bg);

    // Shine strip
    const shine = this.add.graphics();
    shine.fillStyle(0x00e8ff, 0.06);
    shine.fillRoundedRect(-W / 2 + 4, -H / 2 + 4, W - 8, 10, 4);
    container.add(shine);

    // Icon
    const iconTxt = this.add.text(-W / 2 + 22, 0, skill.icon, { fontSize: '28px' }).setOrigin(0.5);
    container.add(iconTxt);

    // NEW badge
    if (isNew) {
      const badge = this.add.text(W / 2 - 8, -H / 2 + 8, 'NEW', {
        fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#ffcc00',
        backgroundColor: '#ff00aa', padding: { x: 4, y: 2 },
      }).setOrigin(1, 0);
      container.add(badge);
    } else {
      const lvBadge = this.add.text(W / 2 - 8, -H / 2 + 8, `Lv.${nextLevel}`, {
        fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#00ff88',
        backgroundColor: '#002a1a', padding: { x: 4, y: 2 },
      }).setOrigin(1, 0);
      container.add(lvBadge);
    }

    // Skill name
    const nameColor = skill.type === 'weapon' ? '#00e8ff' : '#00ff88';
    const nameTxt = this.add.text(-W / 2 + 50, -H / 2 + 14, skill.name, {
      fontFamily: "'Press Start 2P'", fontSize: '11px', color: nameColor,
    });
    container.add(nameTxt);

    // Description
    const descTxt = this.add.text(-W / 2 + 50, -H / 2 + 34, skill.description, {
      fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#8899bb',
      wordWrap: { width: W - 70 },
    });
    container.add(descTxt);

    // Level indicators (dots)
    const dotY = H / 2 - 14;
    const maxLvl = skill.maxLevel;
    for (let d = 0; d < maxLvl; d++) {
      const filled = d < nextLevel;
      const dot = this.add.rectangle(-W / 2 + 50 + d * 14, dotY, 10, 6, filled ? 0x00ff88 : 0x1a2a3a);
      container.add(dot);
    }

    // Type label
    const typeLabel = skill.type === 'weapon' ? '武器' : '强化';
    const typeTxt = this.add.text(W / 2 - 8, H / 2 - 8, typeLabel, {
      fontFamily: "'Press Start 2P'", fontSize: '7px',
      color: skill.type === 'weapon' ? '#00e8ff' : '#00ff88',
    }).setOrigin(1, 1);
    container.add(typeTxt);

    // Hotkey label
    const hotkey = ['❶', '❷', '❸'][idx];
    const hotTxt = this.add.text(-W / 2 + 8, H / 2 - 8, hotkey, {
      fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#556677',
    }).setOrigin(0, 1);
    container.add(hotTxt);

    // Interaction
    const zone = this.add.zone(0, 0, W, H).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x0e1238, 0.98); bg.fillRoundedRect(-W / 2, -H / 2, W, H, 8);
      bg.lineStyle(3, 0x00e8ff);    bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 8);
      container.setScale(1.02);
    });
    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x0a0a24, 0.95); bg.fillRoundedRect(-W / 2, -H / 2, W, H, 8);
      bg.lineStyle(3, borderCol, 0.6); bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 8);
      container.setScale(1);
    });
    zone.on('pointerdown', () => this._pick(choice));
    container.add(zone);

    // Slide in animation
    container.setAlpha(0).setX(cx + 60);
    this.tweens.add({
      targets: container, x: cx, alpha: 1,
      duration: 220, delay: idx * 80, ease: 'Back.easeOut',
    });

    // Keyboard hotkey
    const keys = ['ONE', 'TWO', 'THREE'];
    if (this.input.keyboard) {
      const key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keys[idx]]);
      key.once('down', () => this._pick(choice));
    }
  }

  _pick(choice) {
    if (!this.scene.isActive('LevelUp')) return;
    this.cameras.main.fadeOut(120, 0, 0, 0);
    this.time.delayedCall(130, () => {
      // Notify GameScene
      const gameScene = this.scene.get('Game');
      if (gameScene) gameScene.events.emit('levelup_choice', choice);
      this.scene.stop('LevelUp');
    });
  }
}
