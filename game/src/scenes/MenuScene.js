import { C } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { SettingsManager } from '../systems/SettingsManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { musicSystem } from '../systems/MusicSystem.js';
import { achievementManager } from '../systems/AchievementManager.js';
import { ACHIEVEMENT_CATEGORIES } from '../data/achievements.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    // Start background music
    const musicEnabled = SettingsManager.get('musicEnabled') ?? true;
    musicSystem.setEnabled(musicEnabled);
    musicSystem.start();

    const W = C.W, H = C.H;
    this._buildBg();
    this._buildTitle();
    this._buildModeButtons();
    this._buildLevelSelect();
    this._buildFooter();
    this._animateTitle();
  }

  shutdown() {
    // Stop music when leaving menu
    musicSystem.stop();
    super.shutdown();
  }

  _buildBg() {
    // Gradient background
    const bg = this.add.graphics();
    // Top to bottom gradient
    const gradient = bg.createLinearGradient(0, 0, 0, C.H);
    gradient.addColorStop(0, 0x1a1a2e);
    gradient.addColorStop(0.5, 0x16213e);
    gradient.addColorStop(1, 0x0f0f23);
    bg.fillStyle(gradient); bg.fillRect(0, 0, C.W, C.H);

    // Animated stars with different colors
    this._stars = [];
    const starColors = [0xffffff, 0x44aaff, 0xffaa44, 0xff44aa];
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, C.W);
      const y = Phaser.Math.Between(0, C.H);
      const size = Phaser.Math.Between(1, 3);
      const color = starColors[Phaser.Math.Between(0, starColors.length - 1)];
      const alpha = Math.random() * 0.5 + 0.2;

      const star = this.add.rectangle(x, y, size, size, color, alpha).setDepth(0);
      this._stars.push(star);

      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: { from: alpha, to: alpha * 0.3 },
        scale: { from: 1, to: 0.7 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }

    // Add some floating particles for depth
    this._particles = [];
    for (let i = 0; i < 15; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, C.W),
        Phaser.Math.Between(0, C.H),
        Phaser.Math.Between(2, 4),
        0x4488ff,
        0.3
      ).setDepth(0);
      this._particles.push(particle);

      // Float animation
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 150),
        x: particle.x + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(8000, 15000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 5000),
      });
    }

    // Bottom decorative line
    const line = this.add.graphics();
    line.lineStyle(2, 0x3355aa, 0.5);
    line.lineBetween(20, C.H - 60, C.W - 20, C.H - 60);
  }

  _buildTitle() {
    const W = C.W;
    const centerX = W / 2;

    // Glow effect layers
    for (let i = 3; i > 0; i--) {
      this.add.text(centerX + i, 93 - i, 'PIXEL', {
        fontFamily: "'Press Start 2P'", fontSize: '28px',
        color: i === 1 ? '#004422' : '#002211',
      }).setOrigin(0.5).setAlpha(0.5);
    }
    for (let i = 3; i > 0; i--) {
      this.add.text(centerX + i, 127 - i, 'SURVIVOR', {
        fontFamily: "'Press Start 2P'", fontSize: '24px',
        color: i === 1 ? '#002244' : '#001122',
      }).setOrigin(0.5).setAlpha(0.5);
    }

    // Main title with gradient effect (simulated with multiple layers)
    this._titleText1 = this.add.text(centerX, 90, 'PIXEL', {
      fontFamily: "'Press Start 2P'", fontSize: '28px',
      color: '#44ff88',
      stroke: '#003322', strokeThickness: 4,
      shadow: { blur: 8, color: '#44ff88', fill: true },
    }).setOrigin(0.5);

    this._titleText2 = this.add.text(centerX, 127, 'SURVIVOR', {
      fontFamily: "'Press Start 2P'", fontSize: '24px',
      color: '#4488ff',
      stroke: '#002244', strokeThickness: 4,
      shadow: { blur: 8, color: '#4488ff', fill: true },
    }).setOrigin(0.5);

    // Subtitle with styling
    this.add.text(centerX, 165, '像素幸存者', {
      fontFamily: "'Press Start 2P'", fontSize: '11px', color: '#88aacc',
      stroke: '#001122', strokeThickness: 2,
    }).setOrigin(0.5);

    // Version badge
    this.add.text(centerX, 195, 'v1.3', {
      fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#556677',
    }).setOrigin(0.5);

    // PC control hint (only show in landscape)
    if (!C.IS_PORTRAIT) {
      this.add.text(centerX, C.H - 30, '推荐使用手柄或WASD控制 | 游戏内ESC暂停', {
        fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#667788',
      }).setOrigin(0.5);
    }
  }

  _buildModeButtons() {
    const W = C.W, H = C.H;
    const isPortrait = C.IS_PORTRAIT;

    // Calculate positions based on orientation
    let btnY, btnSpacing, scoreY;
    if (isPortrait) {
      btnY = 260;
      btnSpacing = 85;
      scoreY = btnY + btnSpacing * 2 + 20;
    } else {
      btnY = H * 0.4;
      btnSpacing = 90;
      scoreY = btnY + btnSpacing * 2 + 30;
    }

    // Campaign button with improved style
    this._btnCampaign = this._makeStyledButton(W / 2, btnY, '⚔', '关卡模式', 0x2a4a8a, 0x3a5a9a, () => {
      this._showLevelSelect();
    });

    // Endless button with improved style
    this._btnEndless = this._makeStyledButton(W / 2, btnY + btnSpacing, '∞', '无尽模式', 0x8a4a2a, 0x9a5a3a, () => {
      this.scene.start('Game', { mode: 'endless', levelIndex: 0 });
    });

    // Leaderboard button
    this._btnLeaderboard = this._makeStyledButton(W / 2, btnY + btnSpacing * 2, '🏆', '排行榜', 0x6a5a2a, 0x8a7a4a, () => {
      this._showLeaderboard();
    });

    // High score display (position differently for portrait/landscape)
    const highScores = SaveSystem.getHighScores();
    const endlessHigh = SaveSystem.formatNumber(highScores.endless);
    this.add.text(W / 2, scoreY, `无尽模式最高: ${endlessHigh}`, {
      fontFamily: "'Press Start 2P'", fontSize: isPortrait ? '8px' : '10px', color: '#667788',
    }).setOrigin(0.5);

    // Settings button (top right)
    this._buildSettingsButton();
  }

  _makeStyledButton(x, y, icon, label, baseColor, hoverColor, onClick) {
    const w = 280, h = 58;
    const container = this.add.container(x, y);

    // Button background with rounded corners
    const bg = this.add.graphics();
    const drawBg = (isHovered) => {
      bg.clear();
      // Main background
      bg.fillStyle(isHovered ? hoverColor : baseColor);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      // Highlight effect
      bg.lineStyle(2, isHovered ? 0xffffff : hoverColor, 0.8);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      // Shine effect at top
      bg.fillStyle(0xffffff, 0.15);
      bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, 12, 4);
    };
    drawBg(false);
    container.add(bg);

    // Icon with glow
    const iconText = this.add.text(-w / 2 + 35, 0, icon, {
      fontFamily: "'Press Start 2P'", fontSize: '24px',
    }).setOrigin(0.5);
    container.add(iconText);

    // Label text
    const labelText = this.add.text(15, 0, label, {
      fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0, 0.5);
    container.add(labelText);

    // Interactive zone
    const zone = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      drawBg(true);
      container.setScale(1.02);
    });
    zone.on('pointerout', () => {
      drawBg(false);
      container.setScale(1);
    });
    zone.on('pointerdown', () => {
      container.setScale(0.98);
      this.cameras.main.flash(150, 255, 255, 255, false);
      this.time.delayedCall(100, onClick);
    });
    container.add(zone);

    return container;
  }

  _buildSettingsButton() {
    // Settings button with better styling
    const settingsBg = this.add.graphics();
    settingsBg.fillStyle(0x223344, 0.8);
    settingsBg.fillRoundedRect(C.W - 48, 12, 36, 36, 6);
    settingsBg.lineStyle(2, 0x3355aa, 0.6);
    settingsBg.strokeRoundedRect(C.W - 48, 12, 36, 36, 6);
    settingsBg.setDepth(99);

    const settingsIcon = this.add.text(C.W - 30, 30, '⚙', {
      fontSize: '22px',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(100);

    settingsIcon.on('pointerdown', () => {
      this._showSettingsPanel();
      settingsBg.clear();
      settingsBg.fillStyle(0x334455, 0.8);
      settingsBg.fillRoundedRect(C.W - 48, 12, 36, 36, 6);
    });

    settingsIcon.on('pointerover', () => {
      settingsIcon.setScale(1.15);
      settingsBg.clear();
      settingsBg.fillStyle(0x445566, 0.9);
      settingsBg.fillRoundedRect(C.W - 48, 12, 36, 36, 6);
      settingsBg.lineStyle(2, 0x556677, 0.8);
      settingsBg.strokeRoundedRect(C.W - 48, 12, 36, 36, 6);
    });
    settingsIcon.on('pointerout', () => {
      settingsIcon.setScale(1);
      settingsBg.clear();
      settingsBg.fillStyle(0x223344, 0.8);
      settingsBg.fillRoundedRect(C.W - 48, 12, 36, 36, 6);
      settingsBg.lineStyle(2, 0x3355aa, 0.6);
      settingsBg.strokeRoundedRect(C.W - 48, 12, 36, 36, 6);
    });

    // Achievement button (trophy icon) - to the left of settings
    const achievementBg = this.add.graphics();
    achievementBg.fillStyle(0x443322, 0.8);
    achievementBg.fillRoundedRect(C.W - 90, 12, 36, 36, 6);
    achievementBg.lineStyle(2, 0x664422, 0.6);
    achievementBg.strokeRoundedRect(C.W - 90, 12, 36, 36, 6);
    achievementBg.setDepth(99);

    // Show count of unlocked achievements
    const unlockedCount = achievementManager.unlocked.size;
    const totalCount = Object.keys(window.ACHIEVEMENTS || {}).length;
    const achievementIcon = this.add.text(C.W - 72, 30, '🏆', {
      fontSize: '20px',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(100);

    achievementIcon.on('pointerdown', () => {
      this._showAchievementPanel();
      musicSystem.playSound('menuSelect');
    });

    achievementIcon.on('pointerover', () => {
      achievementIcon.setScale(1.15);
      achievementBg.clear();
      achievementBg.fillStyle(0x664433, 0.9);
      achievementBg.fillRoundedRect(C.W - 90, 12, 36, 36, 6);
      achievementBg.lineStyle(2, 0x886644, 0.8);
      achievementBg.strokeRoundedRect(C.W - 90, 12, 36, 36, 6);
    });
    achievementIcon.on('pointerout', () => {
      achievementIcon.setScale(1);
      achievementBg.clear();
      achievementBg.fillStyle(0x443322, 0.8);
      achievementBg.fillRoundedRect(C.W - 90, 12, 36, 36, 6);
      achievementBg.lineStyle(2, 0x664422, 0.6);
      achievementBg.strokeRoundedRect(C.W - 90, 12, 36, 36, 6);
    });
  }

  _buildSettingsPanel() {
    this._settingsPanel = this.add.container(0, 0).setVisible(false);
    const W = C.W, H = C.H;

    // Overlay bg with gradient effect
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a15, 0.95); bg.fillRect(0, 0, W, H);
    // Add subtle border
    bg.lineStyle(4, 0x3355aa); bg.strokeRect(10, 10, W - 20, H - 20);
    this._settingsPanel.add(bg);

    // Title with glow effect
    const titleBg = this.add.text(W / 2 + 2, 82, '⚙ 设置', {
      fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#002244',
    }).setOrigin(0.5);
    const title = this.add.text(W / 2, 80, '⚙ 设置', {
      fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#44ff88',
      stroke: '#002244', strokeThickness: 4,
    }).setOrigin(0.5);
    this._settingsPanel.add([titleBg, title]);

    // Sound toggle
    const soundOn = SettingsManager.get('soundEnabled');
    this._soundToggleText = this.add.text(W / 2, 150, `🔊 音效`, {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: soundOn ? '#44ff88' : '#666666',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this._soundToggleText.on('pointerdown', () => {
      const newState = SettingsManager.toggle('soundEnabled');
      this._soundToggleText.setText(`${newState ? '🔊' : '🔇'} 音效`);
      this._soundToggleText.setColor(newState ? '#44ff88' : '#666666');
    });
    this._settingsPanel.add(this._soundToggleText);

    // Difficulty selector
    const difficulty = SettingsManager.get('difficulty') || 'normal';
    const diffLabels = { easy: '简单', normal: '普通', hard: '困难' };
    const diffColors = { easy: '#44ff44', normal: '#ffaa00', hard: '#ff4444' };
    this._difficultyText = this.add.text(W / 2, 210, `⚔ 难度: ${diffLabels[difficulty]}`, {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: diffColors[difficulty],
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this._difficultyText.on('pointerdown', () => {
      const current = SettingsManager.get('difficulty') || 'normal';
      const difficulties = ['easy', 'normal', 'hard'];
      const nextIndex = (difficulties.indexOf(current) + 1) % 3;
      const nextDiff = difficulties[nextIndex];
      SettingsManager.set('difficulty', nextDiff);
      this._difficultyText.setText(`⚔ 难度: ${diffLabels[nextDiff]}`);
      this._difficultyText.setColor(diffColors[nextDiff]);
    });
    this._settingsPanel.add(this._difficultyText);

    // Joystick side toggle
    const joystickSide = SettingsManager.get('joystickSide') || 'left';
    this._joystickToggleText = this.add.text(W / 2, 270, `🕹 摇杆: ${joystickSide === 'left' ? '左侧' : '右侧'}`, {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#4488ff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this._joystickToggleText.on('pointerdown', () => {
      const current = SettingsManager.get('joystickSide') || 'left';
      const newState = current === 'left' ? 'right' : 'left';
      SettingsManager.set('joystickSide', newState);
      this._joystickToggleText.setText(`🕹 摇杆: ${newState === 'left' ? '左侧' : '右侧'}`);
    });
    this._settingsPanel.add(this._joystickToggleText);

    // Stats display (readonly)
    const stats = SaveSystem.getStats();
    this.add.text(W / 2, 350, `📊 游戏统计`, {
      fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#aa88ff',
    }).setOrigin(0.5);
    this.add.text(W / 2, 380, `总击杀: ${SaveSystem.formatNumber(stats.totalKills)}`, {
      fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#888888',
    }).setOrigin(0.5);
    this.add.text(W / 2, 400, `游戏时长: ${SaveSystem.formatTime(stats.totalPlayTime)}`, {
      fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#888888',
    }).setOrigin(0.5);

    // Back button
    const back = this.add.text(W / 2, H - 50, '◀ 返回', {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#aabbcc',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this._hideSettingsPanel());
    this._settingsPanel.add(back);
  }

  _showSettingsPanel() {
    if (!this._settingsPanel) this._buildSettingsPanel();
    this._settingsPanel.setVisible(true);
    this._settingsPanel.setAlpha(0);
    this.tweens.add({ targets: this._settingsPanel, alpha: 1, duration: 200 });
  }

  _hideSettingsPanel() {
    this.tweens.add({
      targets: this._settingsPanel, alpha: 0, duration: 150,
      onComplete: () => this._settingsPanel.setVisible(false),
    });
  }

  _buildAchievementPanel() {
    this._achievementPanel = this.add.container(0, 0).setVisible(false);
    const W = C.W, H = C.H;

    // Overlay bg
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a15, 0.95); bg.fillRect(0, 0, W, H);
    bg.lineStyle(4, 0x665544); bg.strokeRect(10, 10, W - 20, H - 20);
    this._achievementPanel.add(bg);

    // Title
    const titleBg = this.add.text(W / 2 + 2, 82, '🏆 成就', {
      fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#332200',
    }).setOrigin(0.5);
    const title = this.add.text(W / 2, 80, '🏆 成就', {
      fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#ffaa44',
      stroke: '#332200', strokeThickness: 4,
    }).setOrigin(0.5);
    this._achievementPanel.add([titleBg, title]);

    // Progress summary
    const unlockedCount = achievementManager.unlocked.size;
    const totalCount = Object.keys(ACHIEVEMENTS).length;
    const progressPercent = Math.floor((unlockedCount / totalCount) * 100);
    this.add.text(W / 2, 120, `进度: ${unlockedCount}/${totalCount} (${progressPercent}%)`, {
      fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#ffcc66',
    }).setOrigin(0.5);

    // Get achievements grouped by category
    const allAchievements = achievementManager.getAllAchievements();

    // Display achievements by category
    let currentY = 150;
    const categoryOrder = Object.entries(ACHIEVEMENT_CATEGORIES)
      .sort(([, a], [, b]) => a.order - b.order);

    categoryOrder.forEach(([catKey, catInfo]) => {
      const catAchievements = allAchievements[catKey]?.achievements || [];
      if (catAchievements.length === 0) return;

      // Category header
      const catHeader = this.add.text(W / 2, currentY, `${catInfo.icon} ${catInfo.name}`, {
        fontFamily: "'Press Start 2P'", fontSize: '11px', color: '#88aacc',
      }).setOrigin(0.5);
      this._achievementPanel.add(catHeader);
      currentY += 25;

      // Achievement entries
      catAchievements.forEach(ach => {
        const achColor = ach.unlocked ? '#44ff88' : '#556677';
        const achIcon = ach.unlocked ? ach.icon : '🔒';
        const achText = this.add.text(W / 2, currentY, `${achIcon} ${ach.name}`, {
          fontFamily: "'Press Start 2P'", fontSize: '8px', color: achColor,
        }).setOrigin(0.5);
        this._achievementPanel.add(achText);

        // Description (smaller, dim)
        const descText = this.add.text(W / 2, currentY + 12, ach.description, {
          fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#445566',
        }).setOrigin(0.5);
        this._achievementPanel.add(descText);

        // Progress for incomplete achievements
        if (!ach.unlocked) {
          const progress = achievementManager.getProgress(ach.id);
          if (progress) {
            const progText = this.add.text(W / 2, currentY + 22, `${progress.current}/${progress.max}`, {
              fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#667788',
            }).setOrigin(0.5);
            this._achievementPanel.add(progText);
            currentY += 10;
          }
        }

        currentY += 28;
      });

      currentY += 10;
    });

    // Make the panel scrollable if too tall
    if (currentY > H - 80) {
      // TODO: Add scroll functionality
    }

    // Back button
    const back = this.add.text(W / 2, H - 50, '◀ 返回', {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#aabbcc',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this._hideAchievementPanel());
    this._achievementPanel.add(back);
  }

  _showAchievementPanel() {
    if (!this._achievementPanel) this._buildAchievementPanel();
    this._achievementPanel.setVisible(true);
    this._achievementPanel.setAlpha(0);
    this.tweens.add({ targets: this._achievementPanel, alpha: 1, duration: 200 });
  }

  _hideAchievementPanel() {
    this.tweens.add({
      targets: this._achievementPanel, alpha: 0, duration: 150,
      onComplete: () => this._achievementPanel.setVisible(false),
    });
  }

  // ═══════════════════════════════════════════════════════
  //  LEADERBOARD PANEL
  // ═══════════════════════════════════════════════════════

  async _buildLeaderboardPanel() {
    this._leaderboardPanel = this.add.container(0, 0).setVisible(false);
    const W = C.W, H = C.H;

    // Overlay bg
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a15, 0.95); bg.fillRect(0, 0, W, H);
    bg.lineStyle(4, 0x556644); bg.strokeRect(10, 10, W - 20, H - 20);
    this._leaderboardPanel.add(bg);

    // Title
    const title = this.add.text(W / 2, 60, '🏆 排行榜', {
      fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#ffcc44',
      stroke: '#332200', strokeThickness: 4,
    }).setOrigin(0.5);
    this._leaderboardPanel.add(title);

    // Mode selector
    this._leaderboardMode = 'endless';
    const modeBtn = this.add.text(W / 2, 100, `模式: 无尽 ▼`, {
      fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#88aacc',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    modeBtn.on('pointerdown', () => {
      this._leaderboardMode = this._leaderboardMode === 'endless' ? 'campaign' : 'endless';
      modeBtn.setText(`模式: ${this._leaderboardMode === 'endless' ? '无尽' : '关卡'} ▼`);
      this._refreshLeaderboard();
    });
    this._leaderboardPanel.add(modeBtn);

    // Loading text
    this._leaderboardLoading = this.add.text(W / 2, H / 2, '加载中...', {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#667788',
    }).setOrigin(0.5);
    this._leaderboardPanel.add(this._leaderboardLoading);

    // Leaderboard entries container
    this._leaderboardEntries = this.add.container(0, 140);
    this._leaderboardPanel.add(this._leaderboardEntries);

    // Back button
    const back = this.add.text(W / 2, H - 50, '◀ 返回', {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#aabbcc',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this._hideLeaderboardPanel());
    this._leaderboardPanel.add(back);
  }

  async _refreshLeaderboard() {
    // Clear existing entries
    this._leaderboardEntries.removeAll(true);

    // Show loading
    this._leaderboardLoading.setVisible(true);

    try {
      const leaderboard = await SaveSystem.getLeaderboard(this._leaderboardMode, 0, 50);
      this._leaderboardLoading.setVisible(false);

      if (leaderboard.length === 0) {
        this._leaderboardEntries.add(this.add.text(C.W / 2, 50, '暂无数据', {
          fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#556677',
        }).setOrigin(0.5));
        return;
      }

      // Display entries
      const startY = 20;
      const lineHeight = 45;

      leaderboard.slice(0, 10).forEach((entry, i) => {
        const y = startY + i * lineHeight;
        const isPlayer = entry.player_id === window.CloudService?.getPlayerId?.();

        // Rank badge
        const rankColor = i === 0 ? '#ffdd00' : i === 1 ? '#cccccc' : i === 2 ? '#cd7f32' : '#556677';
        const rankBg = this.add.graphics();
        rankBg.fillStyle(0x223344, 0.8);
        rankBg.fillRoundedRect(30, y - 12, 40, 24, 4);
        this._leaderboardEntries.add(rankBg);

        const rankText = this.add.text(50, y, `#${entry.rank}`, {
          fontFamily: "'Press Start 2P'", fontSize: '10px', color: rankColor,
        }).setOrigin(0.5);
        this._leaderboardEntries.add(rankText);

        // Player name
        const nameColor = isPlayer ? '#44ff88' : '#ffffff';
        const nameText = this.add.text(90, y - 5, entry.player_name.substring(0, 12), {
          fontFamily: "'Press Start 2P'", fontSize: '9px', color: nameColor,
        }).setOrigin(0, 0.5);
        this._leaderboardEntries.add(nameText);

        // Score
        const scoreText = this.add.text(C.W - 40, y - 5, SaveSystem.formatNumber(entry.score), {
          fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#ffaa44',
        }).setOrigin(1, 0.5);
        this._leaderboardEntries.add(scoreText);

        // Stats (small)
        const statsText = this.add.text(90, y + 8, `Lv${entry.level} ${entry.kills}击杀 ${entry.time}秒`, {
          fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#556677',
        }).setOrigin(0, 0.5);
        this._leaderboardEntries.add(statsText);
      });

    } catch (e) {
      this._leaderboardLoading.setText('加载失败');
      console.error('Leaderboard error:', e);
    }
  }

  async _showLeaderboardPanel() {
    if (!this._leaderboardPanel) await this._buildLeaderboardPanel();
    this._leaderboardPanel.setVisible(true);
    this._leaderboardPanel.setAlpha(0);
    this.tweens.add({ targets: this._leaderboardPanel, alpha: 1, duration: 200 });

    // Load leaderboard data
    this._refreshLeaderboard();
  }

  _hideLeaderboardPanel() {
    this.tweens.add({
      targets: this._leaderboardPanel, alpha: 0, duration: 150,
      onComplete: () => this._leaderboardPanel.setVisible(false),
    });
  }

  _buildLevelSelect() {
    this._levelPanel = this.add.container(0, 0).setVisible(false);
    const W = C.W, H = C.H;

    // Overlay bg with improved style
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a15, 0.95); bg.fillRect(0, 0, W, H);
    bg.lineStyle(4, 0x3355aa); bg.strokeRect(10, 10, W - 20, H - 20);
    this._levelPanel.add(bg);

    // Title with glow
    const titleBg = this.add.text(W / 2 + 2, 62, '选择关卡', {
      fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#002244',
    }).setOrigin(0.5);
    const title = this.add.text(W / 2, 60, '选择关卡', {
      fontFamily: "'Press Start 2P'", fontSize: '18px', color: '#44ff88',
      stroke: '#002244', strokeThickness: 4,
    }).setOrigin(0.5);
    this._levelPanel.add([titleBg, title]);

    // Level cards
    LEVELS.forEach((lvl, i) => {
      const cardY = 130 + i * 105;
      const cardX = W / 2;
      const card = this._makeLevelCard(cardX, cardY, lvl, i);
      this._levelPanel.add(card);
    });

    // Back button with improved style
    const back = this.add.text(W / 2, H - 50, '◀ 返回', {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#aabbcc',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this._hideLevelSelect());
    this._levelPanel.add(back);
  }

  _makeLevelCard(x, y, lvl, idx) {
    const container = this.add.container(x, y);
    const w = 340, h = 96;
    const highScores = SaveSystem.getHighScores();
    const levelHigh = SaveSystem.formatNumber(highScores.campaign[idx] || 0);

    // Card background
    const bg = this.add.graphics();
    const drawBg = (isHovered) => {
      bg.clear();
      bg.fillStyle(isHovered ? 0x1a2255 : 0x111133, 0.95);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      bg.lineStyle(2, isHovered ? 0x4466cc : 0x3355aa);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      // Shine effect
      if (isHovered) {
        bg.fillStyle(0xffffff, 0.1);
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, 12, 4);
      }
    };
    drawBg(false);
    container.add(bg);

    // Level number badge
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0x3355aa); badgeBg.fillCircle(-w / 2 + 24, 0, 20);
    badgeBg.lineStyle(2, 0x4466cc); badgeBg.strokeCircle(-w / 2 + 24, 0, 20);
    container.add(badgeBg);

    const numTxt = this.add.text(-w / 2 + 24, 1, `0${lvl.id}`, {
      fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);
    container.add(numTxt);

    // Name
    const nameTxt = this.add.text(-w / 2 + 55, -h / 2 + 16, lvl.name, {
      fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0, 0);
    container.add(nameTxt);

    // Description
    const descTxt = this.add.text(-w / 2 + 55, -h / 2 + 36, lvl.description, {
      fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#8899aa',
    }).setOrigin(0, 0);
    container.add(descTxt);

    // Duration badge
    const durBg = this.add.graphics();
    durBg.fillStyle(0x332200); durBg.fillRoundedRect(w / 2 - 75, -h / 2 + 8, 65, 18, 4);
    container.add(durBg);

    const durTxt = this.add.text(w / 2 - 43, -h / 2 + 9, `${lvl.duration}s`, {
      fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#ffaa44',
    }).setOrigin(0.5);
    container.add(durTxt);

    // High score display
    const scoreTxt = this.add.text(w / 2 - 10, h / 2 - 12, `★ ${levelHigh}`, {
      fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#ffdd44',
    }).setOrigin(1, 1);
    container.add(scoreTxt);

    // Play button
    const playBtn = this.add.text(w / 2 - 15, h / 2 - 14, '▶', {
      fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#44ff88',
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    playBtn.on('pointerdown', () => {
      this.cameras.main.flash(200, 255, 255, 255, false);
      this.time.delayedCall(150, () => {
        this.scene.start('Game', { mode: 'campaign', levelIndex: idx });
      });
    });
    container.add(playBtn);

    // Interactive zone for whole card
    const zone = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      drawBg(true);
      container.setScale(1.02);
    });
    zone.on('pointerout', () => {
      drawBg(false);
      container.setScale(1);
    });
    zone.on('pointerdown', () => {
      this.cameras.main.flash(200, 255, 255, 255, false);
      this.time.delayedCall(150, () => {
        this.scene.start('Game', { mode: 'campaign', levelIndex: idx });
      });
    });
    container.add(zone);

    return container;
  }
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
    const footerY = C.H - 25;

    // Version badge
    const versionBg = this.add.graphics();
    versionBg.fillStyle(0x223344, 0.6);
    versionBg.fillRoundedRect(C.W / 2 - 55, footerY - 10, 110, 20, 4);
    versionBg.setDepth(0);

    this.add.text(C.W / 2, footerY, 'v1.1  ·  触屏/键盘', {
      fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#445566',
    }).setOrigin(0.5);

    // Control hints
    this.add.text(C.W / 2, footerY + 18, 'WASD移动 · ESC暂停', {
      fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#334455',
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
