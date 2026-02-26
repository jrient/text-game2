import { C } from '../config.js';
import { LEVELS, EXP_TABLE } from '../data/levels.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ExpOrb from '../entities/ExpOrb.js';
import SkillSystem from '../systems/SkillSystem.js';
import WaveSystem from '../systems/WaveSystem.js';
import ObjectPool from '../systems/ObjectPool.js';
import { SettingsManager } from '../systems/SettingsManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this.gameMode = data.mode || 'endless';
    this.levelIndex = data.levelIndex || 0;
    this.levelConfig = LEVELS[this.levelIndex] || LEVELS[0];
  }

  create() {
    // World bounds
    this.physics.world.setBounds(0, 0, C.WORLD_W, C.WORLD_H);

    // State
    this._gameOver = false;
    this._paused = false;
    this._playerLevel = 1;
    this._playerExp = 0;
    this._kills = 0;
    this._score = 0;
    this._elapsedSeconds = 0;
    this._bulletOverlaps = [];
    this._audioCtx = null;
    this._soundEnabled = SettingsManager.get('soundEnabled');

    // Object pools for performance
    this._buildObjectPools();

    // Build game world
    this._buildBackground();
    this._buildPlayer();
    this._buildGroups();
    this._buildCamera();
    this._buildInput();
    this._buildJoystick();
    this._buildHUD();
    this._buildAudio();

    // Systems
    this.skillSystem = new SkillSystem(this);
    this.waveSystem  = new WaveSystem(this, this.levelConfig, this.gameMode);

    // Collisions
    this._setupCollisions();

    // Timer
    this._timerEvent = this.time.addEvent({ delay: 1000, callback: this._onSecond, callbackScope: this, repeat: -1 });

    // Events from LevelUp scene
    this.events.on('levelup_choice', this._onLevelUpChoice, this);

    // Pause scene overlay
    this.scene.launch('Pause');
    this.scene.sleep('Pause');

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ═══════════════════════════════════════════════════════
  //  BACKGROUND
  // ═══════════════════════════════════════════════════════
  _buildBackground() {
    const cfg = this.levelConfig;
    const tileKey = ['tile_grass', 'tile_sand', 'tile_stone', 'tile_lava', 'tile_void'][this.levelIndex] || 'tile_grass';
    const cols = Math.ceil(C.WORLD_W / C.TILE) + 1;
    const rows = Math.ceil(C.WORLD_H / C.TILE) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.add.image(c * C.TILE + C.TILE / 2, r * C.TILE + C.TILE / 2, tileKey).setDepth(0);
      }
    }
    // Background tint overlay
    this.add.rectangle(C.WORLD_W / 2, C.WORLD_H / 2, C.WORLD_W, C.WORLD_H, cfg.bgColor, 0.35).setDepth(0.5);
  }

  // ═══════════════════════════════════════════════════════
  //  PLAYER
  // ═══════════════════════════════════════════════════════
  _buildPlayer() {
    const cx = C.WORLD_W / 2, cy = C.WORLD_H / 2;
    this.player = new Player(this, cx, cy);
    this.player.setCollideWorldBounds(true);
  }

  // ═══════════════════════════════════════════════════════
  //  GROUPS
  // ═══════════════════════════════════════════════════════
  _buildGroups() {
    this.enemyGroup = this.physics.add.group({ runChildUpdate: false, maxSize: C.MAX_ENEMIES });
    this.orbGroup   = this.physics.add.group({ runChildUpdate: false, maxSize: C.MAX_ORBS });
  }

  // ═══════════════════════════════════════════════════════
  //  CAMERA
  // ═══════════════════════════════════════════════════════
  _buildCamera() {
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, C.WORLD_W, C.WORLD_H);
  }

  // ═══════════════════════════════════════════════════════
  //  INPUT
  // ═══════════════════════════════════════════════════════
  _buildInput() {
    this._keys = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up2:   Phaser.Input.Keyboard.KeyCodes.UP,
      down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right2:Phaser.Input.Keyboard.KeyCodes.RIGHT,
      esc:   Phaser.Input.Keyboard.KeyCodes.ESC,
    });
    this._joystickDir = { x: 0, y: 0 };

    this._keys.esc.on('down', () => this._togglePause());
  }

  // ═══════════════════════════════════════════════════════
  //  JOYSTICK (nipplejs) - Improved
  // ═══════════════════════════════════════════════════════
  _buildJoystick() {
    if (typeof nipplejs === 'undefined') return;

    // Get joystick side preference (default: left)
    const joystickSide = SettingsManager.get('joystickSide') || 'left';

    const zone = document.createElement('div');
    zone.id = 'joystick-zone';
    const position = joystickSide === 'left'
      ? 'left: 20px; bottom: 20px;'
      : 'right: 20px; bottom: 20px;';
    zone.style.cssText = `
      position: fixed; ${position}
      width: 140px; height: 140px;
      z-index: 100; pointer-events: all;
    `;
    document.body.appendChild(zone);
    this._joystickZoneEl = zone;

    this._nipple = nipplejs.create({
      zone, mode: 'static',
      position: joystickSide === 'left'
        ? { left: '90px', bottom: '90px' }
        : { right: '90px', bottom: '90px' },
      color: 'rgba(68, 255, 136, 0.4)', size: 120,
    });

    this._nipple.on('move', (e, data) => {
      if (data.vector) {
        this._joystickDir.x = data.vector.x;
        this._joystickDir.y = -data.vector.y; // nipplejs y is inverted
      }
    });
    this._nipple.on('end', () => { this._joystickDir.x = 0; this._joystickDir.y = 0; });
  }

  // ═══════════════════════════════════════════════════════
  //  HUD
  // ═══════════════════════════════════════════════════════
  _buildHUD() {
    // Fixed to camera
    const cam = this.cameras.main;
    this._hud = this.add.container(0, 0).setScrollFactor(0).setDepth(50);

    // Top bar background
    const topBg = this.add.rectangle(C.W / 2, 22, C.W, 44, 0x000000, 0.7);
    this._hud.add(topBg);

    // HP bar
    this._hpBarBg = this.add.rectangle(C.HP_BAR.x + C.HP_BAR.w / 2, C.HP_BAR.y + C.HP_BAR.h / 2, C.HP_BAR.w, C.HP_BAR.h, 0x440000);
    this._hpBar   = this.add.rectangle(C.HP_BAR.x + C.HP_BAR.w / 2, C.HP_BAR.y + C.HP_BAR.h / 2, C.HP_BAR.w, C.HP_BAR.h, 0xff4444);
    this._hpText  = this.add.text(C.HP_BAR.x + C.HP_BAR.w + 4, C.HP_BAR.y, '100', { fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#ff8888' });
    this._hud.add([this._hpBarBg, this._hpBar, this._hpText]);

    // Lv + Timer + Score (top center/right)
    this._lvText    = this.add.text(200, 8, 'Lv.1', { fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#44ff88' }).setOrigin(0.5, 0);
    this._timerText = this.add.text(C.W - 10, 8, '00:00', { fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#ffdd44' }).setOrigin(1, 0);
    this._killText  = this.add.text(C.W - 10, 22, '💀 0', { fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#ffaaaa' }).setOrigin(1, 0);
    this._hud.add([this._lvText, this._timerText, this._killText]);

    // EXP bar (below HP)
    this._expBarBg = this.add.rectangle(C.W / 2, C.EXP_BAR.y + C.EXP_BAR.h / 2, C.EXP_BAR.w, C.EXP_BAR.h, 0x002244);
    this._expBar   = this.add.rectangle(C.EXP_BAR.x, C.EXP_BAR.y + C.EXP_BAR.h / 2, 0, C.EXP_BAR.h, 0x4488ff).setOrigin(0, 0.5);
    this._hud.add([this._expBarBg, this._expBar]);

    // Boss HP bar (hidden by default)
    this._bossHpBg  = this.add.rectangle(C.W / 2, C.H - 36, 300, 16, 0x440000).setVisible(false);
    this._bossHpBar = this.add.rectangle(C.W / 2 - 150 + 1, C.H - 36, 298, 14, 0xff2200).setOrigin(0, 0.5).setVisible(false);
    this._bossLabel = this.add.text(C.W / 2, C.H - 52, '', { fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#ff8888' }).setOrigin(0.5).setVisible(false);
    this._hud.add([this._bossHpBg, this._bossHpBar, this._bossLabel]);

    // Pause button (top right)
    const pauseBtn = this.add.text(C.W - 12, C.H - 40, '⏸', { fontSize: '22px' })
      .setOrigin(1, 1).setScrollFactor(0).setDepth(51).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this._togglePause());

    // Mode label
    const modeLabel = this.gameMode === 'endless' ? '无尽模式' : `关卡 ${this.levelIndex + 1}: ${this.levelConfig.name}`;
    this.add.text(C.W / 2, 34, modeLabel, {
      fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#667788',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);
  }

  _buildAudio() {
    // Web Audio API for simple SFX
    try { this._audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }

  // ═══════════════════════════════════════════════════════
  //  OBJECT POOLS (for performance)
  // ═══════════════════════════════════════════════════════
  _buildObjectPools() {
    // Pool for hit particles
    this._particlePool = new ObjectPool(this, () => {
      return this.add.rectangle(
        0, 0,
        C.COMBAT.HIT_PARTICLE_SIZE, C.COMBAT.HIT_PARTICLE_SIZE,
        0xffffff
      ).setDepth(20);
    }, C.POOL.PARTICLE_SIZE);

    // Pool for damage numbers
    this._damageTextPool = new ObjectPool(this, () => {
      return this.add.text(0, 0, '', {
        fontFamily: "'Press Start 2P'",
        fontSize: C.COMBAT.DAMAGE_NUMBER_FONT_SIZE + 'px',
        color: '#ffffff',
        stroke: '#000000', strokeThickness: 2,
      }).setDepth(30).setOrigin(0.5);
    }, C.POOL.DAMAGE_TEXT_SIZE);

    // Pool for explosion rings (graphics objects)
    this._explosionPool = new ObjectPool(this, () => {
      return this.add.graphics().setDepth(15);
    }, C.POOL.EXPLOSION_SIZE);
  }

  playSound(key) {
    if (!this._audioCtx || !this._soundEnabled) return;
    const ctx = this._audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;
    switch (key) {
      case 'shoot':
        osc.type = 'square'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);
        gain.gain.setValueAtTime(0.06, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.08); break;
      case 'knife':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now); osc.stop(now + 0.05); break;
      case 'fireball':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now); osc.stop(now + 0.2); break;
      case 'lightning':
        osc.type = 'square'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(1600, now + 0.05); osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);
        gain.gain.setValueAtTime(0.07, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15); break;
      case 'levelup':
        osc.type = 'sine';
        [523, 659, 784, 1046].forEach((freq, i) => osc.frequency.setValueAtTime(freq, now + i * 0.08));
        gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now); osc.stop(now + 0.4); break;
      case 'die':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now); osc.stop(now + 0.8); break;
      case 'pickup':
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, now); osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06);
        gain.gain.setValueAtTime(0.04, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.08); break;
    }
  }

  // ═══════════════════════════════════════════════════════
  //  COLLISION SETUP
  // ═══════════════════════════════════════════════════════
  _setupCollisions() {
    // Enemy hits player
    this.physics.add.overlap(this.player, this.enemyGroup, this._onPlayerEnemyOverlap, null, this);
    // Orb pickup
    this.physics.add.overlap(this.player, this.orbGroup, this._onOrbPickup, null, this);
  }

  // Called by weapons to register their bullet group
  addBulletGroup(group, callback) {
    const overlap = this.physics.add.overlap(group, this.enemyGroup, callback, null, this);
    this._bulletOverlaps.push(overlap);
  }

  // ═══════════════════════════════════════════════════════
  //  COLLISION HANDLERS
  // ═══════════════════════════════════════════════════════
  _onPlayerEnemyOverlap(player, enemy) {
    if (!enemy.active || !player || player.invincible) return;
    const dmg = player.takeDamage(enemy.damage);
    if (dmg > 0) this._showDamageNumber(player.x, player.y - 20, dmg, '#ff4444');
    this._updateHpBar();
    if (player.hp <= 0) this._triggerGameOver();
  }

  _onOrbPickup(player, orb) {
    if (!orb.active) return;
    orb.setActive(false).setVisible(false);
    this._gainExp(orb.value);
    this.playSound('pickup');
  }

  // ═══════════════════════════════════════════════════════
  //  EXP & LEVELING
  // ═══════════════════════════════════════════════════════
  _gainExp(amount) {
    this._playerExp += amount;
    const required = EXP_TABLE[this._playerLevel] || 9999;
    if (this._playerExp >= required) {
      this._playerExp -= required;
      this._playerLevel++;
      this._onLevelUp();
    }
    this._updateExpBar();
  }

  _onLevelUp() {
    this.playSound('levelup');
    this._lvText.setText(`Lv.${this._playerLevel}`);
    const choices = this.skillSystem.getChoices();
    this._paused = true;
    this.physics.pause(); // freeze all physics during card selection
    this.time.delayedCall(50, () => {
      this.scene.launch('LevelUp', { choices, playerLevel: this._playerLevel });
    });
  }

  _onLevelUpChoice(choice) {
    this.skillSystem.applyChoice(choice);
    this._paused = false;
    this.physics.resume();
    this.spawnHitParticle(this.player.x, this.player.y, 0x44ff88);
  }

  // ═══════════════════════════════════════════════════════
  //  ENEMY MANAGEMENT
  // ═══════════════════════════════════════════════════════
  spawnEnemy(x, y, data, isBoss, mult = 1) {
    if (this.enemyGroup.getLength() >= C.MAX_ENEMIES) return;
    const enemy = new Enemy(this, x, y, data, isBoss);
    if (mult > 1) enemy.scaleStats(mult);
    this.enemyGroup.add(enemy);
    if (isBoss) {
      this._currentBoss = enemy;
      this._bossHpBg.setVisible(true);
      this._bossHpBar.setVisible(true);
      this._bossLabel.setText(data.name).setVisible(true);
    }
    return enemy;
  }

  hitEnemy(enemy, damage, hitX, hitY) {
    if (!enemy || !enemy.active) return;
    enemy.takeDamage(damage);
    enemy.knockback(hitX, hitY);
    this._showDamageNumber(enemy.x, enemy.y - 10, damage, '#ffffff');
    if (enemy.isDead()) this._killEnemy(enemy);
    // Update boss bar
    if (enemy === this._currentBoss) this._updateBossBar();
  }

  _killEnemy(enemy) {
    if (!enemy.active) return;
    this._kills++;
    this._score += enemy.scoreValue;
    this.player.onKill();
    this._killText.setText(`💀 ${this._kills}`);

    // Drop experience orbs
    const value = enemy.expDrop;
    const bigOrbs = enemy.isBoss ? Math.floor(value / 10) : 0;
    const medOrbs = Math.floor(value / 5);
    const smlOrbs = value % 5;

    for (let i = 0; i < bigOrbs; i++) this._dropOrb(enemy.x, enemy.y, 10);
    for (let i = 0; i < medOrbs; i++) this._dropOrb(enemy.x, enemy.y, 5);
    for (let i = 0; i < smlOrbs; i++) this._dropOrb(enemy.x, enemy.y, 1);

    // Death particles
    this.spawnExplosion(enemy.x, enemy.y, enemy.displayWidth / 2, enemy.enemyData.bodyColor);

    // Boss death
    if (enemy.isBoss) {
      this._currentBoss = null;
      this._bossHpBg.setVisible(false); this._bossHpBar.setVisible(false); this._bossLabel.setVisible(false);
      this.cameras.main.shake(500, 0.02);
      if (this.gameMode === 'campaign') {
        this.time.delayedCall(1500, () => this._triggerVictory());
      }
    }

    enemy.setActive(false).setVisible(false);
  }

  _dropOrb(x, y, value) {
    if (this.orbGroup.getLength() >= C.MAX_ORBS) return;
    const ox = x + Phaser.Math.Between(-24, 24);
    const oy = y + Phaser.Math.Between(-24, 24);
    const orb = new ExpOrb(this, ox, oy, value);
    this.orbGroup.add(orb);
  }

  // ═══════════════════════════════════════════════════════
  //  QUERY HELPERS (used by weapons)
  // ═══════════════════════════════════════════════════════
  getNearestEnemies(x, y, count) {
    const alive = this.enemyGroup.getChildren().filter(e => e.active);
    alive.sort((a, b) =>
      Phaser.Math.Distance.Between(x, y, a.x, a.y) - Phaser.Math.Distance.Between(x, y, b.x, b.y)
    );
    return alive.slice(0, count);
  }

  getDenseTarget(x, y) {
    // Find point with most enemies nearby (simplified: return centroid of nearest 5)
    const nearest = this.getNearestEnemies(x, y, 5);
    if (nearest.length === 0) return null;
    return nearest[Math.floor(nearest.length / 2)];
  }

  getEnemiesInRadius(x, y, radius) {
    return this.enemyGroup.getChildren().filter(e => {
      if (!e.active) return false;
      return Phaser.Math.Distance.Between(x, y, e.x, e.y) <= radius;
    });
  }

  // ═══════════════════════════════════════════════════════
  //  VISUAL EFFECTS (using object pools for performance)
  // ═══════════════════════════════════════════════════════
  spawnHitParticle(x, y, color) {
    const count = C.COMBAT.HIT_PARTICLE_COUNT;
    for (let i = 0; i < count; i++) {
      const px = this._particlePool.get();
      px.setPosition(x, y).setFillStyle(color).setAlpha(1).setScale(1);
      const angle = Math.random() * Math.PI * 2;
      const speed = C.COMBAT.HIT_PARTICLE_MIN_SPEED + Math.random() * (C.COMBAT.HIT_PARTICLE_MAX_SPEED - C.COMBAT.HIT_PARTICLE_MIN_SPEED);
      this.tweens.add({
        targets: px,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: C.COMBAT.HIT_PARTICLE_MIN_DURATION + Math.random() * (C.COMBAT.HIT_PARTICLE_MAX_DURATION - C.COMBAT.HIT_PARTICLE_MIN_DURATION),
        onComplete: () => this._particlePool.release(px),
      });
    }
  }

  spawnExplosion(x, y, radius, color) {
    const ring = this._explosionPool.get();
    ring.clear()
      .lineStyle(C.FX.EXPLOSION_LINE_WIDTH, color, C.FX.EXPLOSION_ALPHA)
      .strokeCircle(x, y, C.FX.EXPLOSION_START_RADIUS)
      .setAlpha(1).setScale(1);
    this.tweens.add({
      targets: ring,
      scaleX: radius / C.FX.EXPLOSION_START_RADIUS,
      scaleY: radius / C.FX.EXPLOSION_START_RADIUS,
      alpha: 0,
      duration: C.FX.EXPLOSION_DURATION,
      onComplete: () => this._explosionPool.release(ring),
    });
    this.spawnHitParticle(x, y, color);
    this.spawnHitParticle(x, y, 0xffffff);
  }

  _showDamageNumber(x, y, value, color) {
    const txt = this._damageTextPool.get();
    txt.setPosition(x, y).setText(`-${value}`).setColor(color).setAlpha(1).setY(y);
    this.tweens.add({
      targets: txt,
      y: y - C.COMBAT.DAMAGE_NUMBER_RISE,
      alpha: 0,
      duration: C.COMBAT.DAMAGE_NUMBER_DURATION,
      onComplete: () => this._damageTextPool.release(txt),
    });
  }

  showBossAlert(name) {
    const txt = this.add.text(C.W / 2, C.H / 2 - 60, `⚠ BOSS: ${name}`, {
      fontFamily: "'Press Start 2P'", fontSize: '13px', color: '#ff4444',
      stroke: '#000000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(60).setOrigin(0.5);
    this.cameras.main.shake(400, 0.012);
    this.tweens.add({ targets: txt, alpha: 0, delay: 2000, duration: 500, onComplete: () => txt.destroy() });
  }

  showEvolveEffect(fromId, toId) {
    const txt = this.add.text(C.W / 2, C.H / 2 - 30, '⚡ 技能进化！', {
      fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffff44',
      stroke: '#000000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(60).setOrigin(0.5);
    this.cameras.main.flash(300, 255, 220, 0, false);
    this.tweens.add({ targets: txt, alpha: 0, delay: 1500, duration: 500, onComplete: () => txt.destroy() });
  }

  // ═══════════════════════════════════════════════════════
  //  HUD UPDATES
  // ═══════════════════════════════════════════════════════
  _updateHpBar() {
    const p = this.player;
    const ratio = Math.max(0, p.hp / p.maxHp);
    this._hpBar.setSize(C.HP_BAR.w * ratio, C.HP_BAR.h);
    this._hpBar.setX(C.HP_BAR.x + (C.HP_BAR.w * ratio) / 2);
    const col = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff3333;
    this._hpBar.setFillStyle(col);
    this._hpText.setText(`${p.hp}/${p.maxHp}`);
  }

  _updateExpBar() {
    const required = EXP_TABLE[this._playerLevel] || 9999;
    const ratio = Math.min(1, this._playerExp / required);
    this._expBar.setSize(C.EXP_BAR.w * ratio, C.EXP_BAR.h);
  }

  _updateBossBar() {
    if (!this._currentBoss) return;
    const ratio = Math.max(0, this._currentBoss.hp / this._currentBoss.maxHp);
    this._bossHpBar.setSize(298 * ratio, 14);
  }

  _onSecond() {
    if (this._paused || this._gameOver) return;
    this._elapsedSeconds++;
    const m = Math.floor(this._elapsedSeconds / 60).toString().padStart(2, '0');
    const s = (this._elapsedSeconds % 60).toString().padStart(2, '0');
    this._timerText.setText(`${m}:${s}`);

    // Campaign time-out
    if (this.gameMode === 'campaign' && this._elapsedSeconds >= this.levelConfig.duration) {
      if (!this._currentBoss && !this._gameOver) this._triggerVictory();
    }
  }

  // ═══════════════════════════════════════════════════════
  //  PAUSE
  // ═══════════════════════════════════════════════════════
  _togglePause() {
    if (this._gameOver) return;
    if (this._paused) {
      this._paused = false;
      this.scene.sleep('Pause');
      this.physics.resume();
    } else {
      this._paused = true;
      this.scene.wake('Pause');
      this.physics.pause();
    }
  }

  // ═══════════════════════════════════════════════════════
  //  GAME OVER / VICTORY
  // ═══════════════════════════════════════════════════════
  _triggerGameOver() {
    if (this._gameOver) return;
    this._gameOver = true;
    this.playSound('die');
    this.physics.pause();
    this.cameras.main.fade(800, 0, 0, 0);
    this.time.delayedCall(900, () => {
      this._cleanup();
      this.scene.start('GameOver', {
        won: false, score: this._score, kills: this._kills,
        level: this._playerLevel, time: this._elapsedSeconds,
        mode: this.gameMode, levelIndex: this.levelIndex,
      });
    });
  }

  _triggerVictory() {
    if (this._gameOver) return;
    this._gameOver = true;
    this.cameras.main.flash(600, 255, 255, 100, false);
    this.time.delayedCall(600, () => {
      this.physics.pause();
      this.cameras.main.fade(600, 0, 0, 0);
      this.time.delayedCall(700, () => {
        this._cleanup();
        this.scene.start('GameOver', {
          won: true, score: this._score, kills: this._kills,
          level: this._playerLevel, time: this._elapsedSeconds,
          mode: this.gameMode, levelIndex: this.levelIndex,
        });
      });
    });
  }

  _cleanup() {
    if (this._nipple) { this._nipple.destroy(); this._nipple = null; }
    if (this._joystickZoneEl) { this._joystickZoneEl.remove(); this._joystickZoneEl = null; }
    if (this.skillSystem) { this.skillSystem.destroy(); }
    if (this._particlePool) { this._particlePool.destroy(); }
    if (this._damageTextPool) { this._damageTextPool.destroy(); }
    if (this._explosionPool) { this._explosionPool.destroy(); }
    this.scene.stop('Pause');
    this.scene.stop('LevelUp');
  }

  // ═══════════════════════════════════════════════════════
  //  MAIN UPDATE LOOP
  // ═══════════════════════════════════════════════════════
  update(time, delta) {
    if (this._gameOver) return;
    if (this._paused) return;

    // Player input direction
    const keys = this._keys;
    let dx = this._joystickDir.x;
    let dy = this._joystickDir.y;
    if (keys.left.isDown  || keys.left2.isDown)  dx -= 1;
    if (keys.right.isDown || keys.right2.isDown) dx += 1;
    if (keys.up.isDown    || keys.up2.isDown)    dy -= 1;
    if (keys.down.isDown  || keys.down2.isDown)  dy += 1;

    this.player.update(dx, dy);

    // Enemy updates
    this.enemyGroup.getChildren().forEach(e => {
      if (e.active) e.update(this.player.x, this.player.y, delta);
    });

    // Orb attraction
    const pickupRange = this.player.getEffectivePickupRange();
    this.orbGroup.getChildren().forEach(orb => {
      if (!orb.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, orb.x, orb.y);
      if (dist < pickupRange) orb.attractTo(this.player.x, this.player.y);
      else if (orb.isAttracted()) orb.stopAttract();
    });

    // Wave system
    this.waveSystem.update(delta, this._elapsedSeconds);

    // Skill / weapon updates
    this.skillSystem.update(time, delta);

    // HUD
    this._updateHpBar();
  }
}
