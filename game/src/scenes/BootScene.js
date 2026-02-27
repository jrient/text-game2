import { C } from '../config.js';
import { achievementManager } from '../systems/AchievementManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import * as CloudService from '../services/CloudService.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Generate all textures programmatically — no external files needed
  }

  create() {
    this._generateTextures();

    // Initialize achievement manager with saved data
    const savedAchievements = SaveSystem.getAchievements();
    achievementManager.load({ unlocked: savedAchievements });

    // Make achievement manager available globally
    window.achievementManager = achievementManager;
    window.saveSystem = SaveSystem;
    window.CloudService = CloudService;

    // Complete fake loading bar
    const bar = document.getElementById('loading-bar');
    if (bar) bar.style.width = '100%';
    setTimeout(() => {
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
      this.scene.start('Menu');
    }, 300);
  }

  _generateTextures() {
    // ── Enhanced Pixel tile textures (subtle, comfortable colors) ────────────────────────────
    this._makeDetailedTile('tile_grass', [0x2a3a2a, 0x253525, 0x2f3f2f, 0x202a20], 0x3a4a3a);
    this._makeDetailedTile('tile_sand',  [0x4a3a2a, 0x453525, 0x4f3f2f, 0x3a2a20], 0x5a4a3a);
    this._makeDetailedTile('tile_stone', [0x3a3a40, 0x35353b, 0x3f3f45, 0x303038], 0x4a4a50);
    this._makeDetailedTile('tile_lava',  [0x3a2a30, 0x35252b, 0x3f2f35, 0x302028], 0x4a3a40);
    this._makeDetailedTile('tile_void',  [0x1a1a25, 0x151520, 0x1f1f2a, 0x10101a], 0x2a2a35);

    // ── Player (improved design) ────────────────────────────────
    this._makeEnhancedPlayer();

    // ── Enhanced projectiles ────────────────────────────────────
    this._makeMagicBullet('bullet_magic', 0x00e8ff);
    this._makeKnife('bullet_knife', 0xccddff);
    this._makeFireball('bullet_fire', 0xff4400);
    this._makeLightning('bullet_lightning', 0xeeff00);
    this._makeAxe('bullet_axe', 0xff6600);

    // ── New projectiles for new weapons ─────────────────────────
    this._makeMissile('bullet_missile', 0xff2266);
    this._makePoisonCloud('bullet_poison', 0x00ff66);
    this._makeFrostShard('bullet_frost', 0x88ccff);

    // ── Experience orbs (more detailed) ─────────────────────────
    this._makeDetailedOrb('orb_exp_sm', 0xcc44ff, 6);
    this._makeDetailedOrb('orb_exp_md', 0x00e8ff, 9);
    this._makeDetailedOrb('orb_exp_lg', 0xff00aa, 13);

    // ── Enhanced particles ──────────────────────────────────────
    this._makeDetailedParticle('px_hit',   0xffffff, 5);
    this._makeDetailedParticle('px_exp',   0xcc44ff, 5);
    this._makeDetailedParticle('px_fire',  0xff4400, 6);
    this._makeDetailedParticle('px_spark', 0xeeff00, 4);
    this._makeDetailedParticle('px_ice',   0x88ccff, 5);
    this._makeDetailedParticle('px_poison', 0x00ff66, 5);
    this._makeDetailedParticle('px_blood', 0xff2266, 4);

    // ── UI elements ──────────────────────────────────────────────
    this._makePixel('px_white', 0xffffff, 2);
    this._makePixel('px_red',   0xff2266, 2);
    this._makePixel('px_green', 0x00ff88, 2);
    this._makePixel('px_blue',  0x00e8ff, 2);
  }

  // ═════════════════════════════════════════════════════════════════
  //  ENHANCED TEXTURE GENERATION
  // ═════════════════════════════════════════════════════════════════

  /**
   * Create detailed tile with subtle texture
   */
  _makeDetailedTile(key, colors, accentColor) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 48;

    // Base color (main tile color)
    g.fillStyle(colors[0]);
    g.fillRect(0, 0, s, s);

    // Add subtle variation - only slightly different colors
    for (let i = 0; i < 12; i++) {
      const cx = Math.floor(Math.random() * 6) * 8;
      const cy = Math.floor(Math.random() * 6) * 8;
      // Use slightly lighter/darker variant of base color
      g.fillStyle(colors[Math.floor(Math.random() * colors.length)]);
      g.fillRect(cx, cy, 8, 8);
    }

    // Add very subtle small details (minimal and muted)
    for (let i = 0; i < 4; i++) {
      const dx = Phaser.Math.Between(4, s - 8);
      const dy = Phaser.Math.Between(4, s - 8);
      // Use a more muted version of accent, not too bright
      g.fillStyle(accentColor, 0.3);
      g.fillRect(dx, dy, 2, 2);
    }

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Create cool male player character (cyberpunk warrior style)
   */
  _makeEnhancedPlayer() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 40;

    // Shadow/glow effect
    g.fillStyle(0x00e8ff, 0.2);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0xff00aa, 0.15);
    g.fillCircle(20, 20, 14);

    // Spiky anime hair (dark with cyan highlights)
    // Base hair
    g.fillStyle(0x1a1a2e);
    g.fillCircle(20, 15, 14);
    // Hair spikes
    g.fillStyle(0x16213e);
    g.fillTriangle(20, 5, 15, 12, 25, 12);
    g.fillTriangle(12, 8, 10, 14, 16, 10);
    g.fillTriangle(28, 8, 24, 10, 30, 14);
    g.fillTriangle(8, 14, 6, 18, 12, 14);
    g.fillTriangle(32, 14, 28, 14, 34, 18);
    // Cyan highlights in hair
    g.fillStyle(0x00e8ff, 0.8);
    g.fillTriangle(18, 6, 16, 10, 20, 8);
    g.fillTriangle(26, 10, 24, 12, 27, 14);

    // Face (determined expression)
    g.fillStyle(0xffe4d6);
    g.fillCircle(20, 20, 10);
    // Sharp eyebrows
    g.fillStyle(0x1a1a2e);
    g.fillRect(12, 15, 5, 2);
    g.fillRect(23, 15, 5, 2);

    // Eyes (sharp and determined)
    g.fillStyle(0xffffff);
    g.fillCircle(15, 19, 4);
    g.fillCircle(25, 19, 4);
    // Electric blue iris
    g.fillStyle(0x00e8ff);
    g.fillCircle(15, 19, 2.5);
    g.fillCircle(25, 19, 2.5);
    // Pupils
    g.fillStyle(0x000000);
    g.fillCircle(15, 19, 1.2);
    g.fillCircle(25, 19, 1.2);
    // Eye shine
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(14, 18, 1);
    g.fillCircle(24, 18, 1);

    // Confident smirk
    g.lineStyle(2, 0xcc6666, 1);
    g.moveTo(16, 25);
    g.lineTo(24, 25);

    // Cool jacket/armor
    g.fillStyle(0x1a1a2e);
    g.fillRect(12, 28, 16, 10);
    // Jacket collar
    g.fillStyle(0x16213e);
    g.fillRect(14, 27, 12, 4);
    // Magenta accent stripe
    g.fillStyle(0xff00aa);
    g.fillRect(12, 30, 16, 2);

    // Arms (muscular)
    g.fillStyle(0xffe4d6);
    g.fillRect(6, 28, 6, 8);
    g.fillRect(28, 28, 6, 8);
    // Glove accents
    g.fillStyle(0x00e8ff);
    g.fillRect(6, 34, 6, 2);
    g.fillRect(28, 34, 6, 2);

    // Energy aura effect
    g.lineStyle(1, 0x00e8ff, 0.3);
    g.strokeCircle(20, 20, 17);
    g.lineStyle(1, 0xff00aa, 0.2);
    g.strokeCircle(20, 20, 19);

    // Floating energy particles
    g.fillStyle(0x00e8ff, 0.8);
    g.fillCircle(6, 10, 1.5);
    g.fillCircle(34, 25, 1.5);
    g.fillStyle(0xff00aa, 0.8);
    g.fillCircle(36, 12, 1);
    g.fillCircle(5, 28, 1);

    g.generateTexture('player', s, s);
    g.destroy();
  }

  /**
   * Magic bullet with glow effect
   */
  _makeMagicBullet(key, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 16;

    // Outer glow
    g.fillStyle(color, 0.3);
    g.fillCircle(s/2, s/2, s/2);

    // Core
    g.fillStyle(color);
    g.fillCircle(s/2, s/2, s/3);

    // Highlight
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(s/2 - 2, s/2 - 2, s/6);

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Throwing knife with metallic look
   */
  _makeKnife(key, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const w = 20, h = 8;

    // Blade
    g.fillStyle(0xcccccc);
    g.fillRect(0, 2, 14, 4);

    // Blade edge
    g.fillStyle(0xeeeeee);
    g.fillRect(0, 1, 14, 2);

    // Handle
    g.fillStyle(0x885533);
    g.fillRect(14, 1, 6, 6);

    // Guard
    g.fillStyle(0x888888);
    g.fillRect(13, 0, 2, 8);

    g.generateTexture(key, w, h);
    g.destroy();
  }

  /**
   * Fireball with flames
   */
  _makeFireball(key, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 24;

    // Outer flames (darker)
    g.fillStyle(0xcc4400, 0.6);
    g.fillCircle(s/2, s/2, s/2);
    g.fillCircle(s/2 - 4, s/2 + 2, s/3);

    // Inner flames (brighter)
    g.fillStyle(0xff6600);
    g.fillCircle(s/2, s/2, s/2.5);
    g.fillCircle(s/2 - 2, s/2 + 1, s/3.5);

    // Core (brightest)
    g.fillStyle(0xffaa00);
    g.fillCircle(s/2, s/2, s/4);

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Lightning bolt
   */
  _makeLightning(key, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 20;

    // Glow
    g.fillStyle(color, 0.3);
    g.fillCircle(s/2, s/2, s/2);

    // Bolt shape
    g.fillStyle(color);
    g.beginPath();
    g.moveTo(s/2, 2);
    g.lineTo(s/2 + 4, s/2);
    g.lineTo(s/2 + 1, s/2);
    g.lineTo(s/2 + 3, s - 2);
    g.lineTo(s/2 - 2, s/2);
    g.lineTo(s/2 + 1, s/2);
    g.closePath();
    g.fillPath();

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Spinning axe
   */
  _makeAxe(key, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 28;

    // Handle
    g.fillStyle(0x885533);
    g.fillRect(s/2 - 2, 8, 4, 16);

    // Axe head (double-sided)
    g.fillStyle(0xaaaaaa);
    // Left blade
    g.fillTriangle(s/2, 6, s/2, s - 6, s/2 - 12, s/2);
    // Right blade
    g.fillTriangle(s/2, 6, s/2, s - 6, s/2 + 12, s/2);

    // Blade edge
    g.fillStyle(color);
    g.fillTriangle(s/2, 6, s/2, s - 6, s/2 - 10, s/2);
    g.fillTriangle(s/2, 6, s/2, s - 6, s/2 + 10, s/2);

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Homing missile
   */
  _makeMissile(key, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 20;

    // Body
    g.fillStyle(0x666666);
    g.fillEllipse(s/2, s/2, 16, 8);

    // Warhead
    g.fillStyle(color);
    g.fillTriangle(2, s/2, 6, s/2 - 4, 6, s/2 + 4);

    // Fins
    g.fillStyle(color);
    g.fillRect(12, s/2 - 6, 4, 4);
    g.fillRect(12, s/2 + 2, 4, 4);

    // Window
    g.fillStyle(0x00ffff, 0.8);
    g.fillCircle(10, s/2, 3);

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Poison cloud effect
   */
  _makePoisonCloud(key, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 32;

    // Multiple overlapping circles for cloud effect
    g.fillStyle(color, 0.4);
    g.fillCircle(s/2, s/2, s/2);
    g.fillCircle(s/2 - 4, s/2 + 2, s/2.5);
    g.fillCircle(s/2 + 4, s/2 - 2, s/2.5);

    // Bubbles
    g.fillStyle(0x88ff88, 0.6);
    g.fillCircle(s/2 - 6, s/2 - 4, 4);
    g.fillCircle(s/2 + 6, s/2 + 6, 3);

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Frost shard (ice crystal)
   */
  _makeFrostShard(key, color) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 18;

    // Main crystal
    g.fillStyle(color, 0.9);
    g.fillTriangle(s/2, 2, s/2 - 5, s/2, s/2 + 5, s/2);

    // Facets
    g.fillStyle(0xffffff, 0.6);
    g.fillTriangle(s/2, 4, s/2 - 3, s/2, s/2 + 3, s/2);

    // Outer glow
    g.fillStyle(color, 0.3);
    g.fillCircle(s/2, s/2, s/2);

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Detailed experience orb with glow
   */
  _makeDetailedOrb(key, color, r) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = r * 2;

    // Outer glow
    g.fillStyle(color, 0.3);
    g.fillCircle(r, r, r);

    // Main orb
    g.fillStyle(color);
    g.fillCircle(r, r, r * 0.8);

    // Inner shine
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(r - r*0.3, r - r*0.3, r * 0.4);

    // Sparkle
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(r + 2, r - 1, 2, 2);

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Detailed particle with shape
   */
  _makeDetailedParticle(key, color, size) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Diamond shape
    g.fillStyle(color);
    g.beginPath();
    g.moveTo(size/2, 0);
    g.lineTo(size, size/2);
    g.lineTo(size/2, size);
    g.lineTo(0, size/2);
    g.closePath();
    g.fillPath();

    // Highlight
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(size/2, size/2, size/4);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  // Legacy methods for compatibility
  _makeTile(key, colors) {
    this._makeDetailedTile(key, colors, colors[0]);
  }

  _makePlayer() {
    this._makeEnhancedPlayer();
  }

  _makeBullet(key, color, size, h) {
    this._makeMagicBullet(key, color);
  }

  _makBulletOrb(key, color, size) {
    this._makeAxe(key, color);
  }

  _makeOrb(key, color, r) {
    this._makeDetailedOrb(key, color, r);
  }

  _makeParticle(key, color, size) {
    this._makeDetailedParticle(key, color, size);
  }

  _makePixel(key, color, size) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color); g.fillRect(0, 0, size, size);
    g.generateTexture(key, size, size);
    g.destroy();
  }
}
