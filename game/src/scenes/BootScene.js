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
    // ── Enhanced Pixel tile textures ────────────────────────────
    this._makeDetailedTile('tile_grass', [0x0a2a2a, 0x082020, 0x0c3535, 0x061818], 0x00aa88);
    this._makeDetailedTile('tile_sand',  [0x3a2218, 0x2a1810, 0x4a2a1a, 0x1a0e08], 0x884422);
    this._makeDetailedTile('tile_stone', [0x1a1a2a, 0x141428, 0x222238, 0x0e0e1e], 0x3344aa);
    this._makeDetailedTile('tile_lava',  [0x3a0028, 0x2a001a, 0x4a0035, 0x1a0010], 0xff00aa);
    this._makeDetailedTile('tile_void',  [0x0a0018, 0x080014, 0x0e001e, 0x06000e], 0x6622cc);

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
   * Create detailed tile with small decorations
   */
  _makeDetailedTile(key, colors, accentColor) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 48;

    // Base color
    g.fillStyle(colors[0]);
    g.fillRect(0, 0, s, s);

    // Add pixel noise and texture
    for (let i = 0; i < 20; i++) {
      const cx = Math.floor(Math.random() * 6) * 8;
      const cy = Math.floor(Math.random() * 6) * 8;
      g.fillStyle(colors[1 + (i % 3)]);
      g.fillRect(cx, cy, 8, 8);
    }

    // Add small decorative details (grass/stone/etc)
    for (let i = 0; i < 8; i++) {
      const dx = Phaser.Math.Between(4, s - 8);
      const dy = Phaser.Math.Between(4, s - 8);
      g.fillStyle(accentColor);
      g.fillRect(dx, dy, 3, 3);
      g.fillRect(dx + 1, dy + 1, 2, 2);
    }

    // Add border for tile definition
    g.lineStyle(1, 0x000000, 0.2);
    g.strokeRect(0, 0, s, s);

    g.generateTexture(key, s, s);
    g.destroy();
  }

  /**
   * Create enhanced player character (Vampire Survivors inspired)
   */
  _makeEnhancedPlayer() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 40;

    // Shadow/outline for depth
    g.fillStyle(0x0a0a1a);
    g.fillRect(11, 11, 18, 22);
    g.fillRect(10, 3, 20, 14);

    // Body (dark armor)
    // Top part
    g.fillStyle(0x1a1a3a);
    g.fillRect(10, 10, 20, 12);
    // Bottom part (slightly lighter)
    g.fillStyle(0x222244);
    g.fillRect(10, 20, 20, 11);

    // Head with better proportions
    g.fillStyle(0x1a1a3a);
    g.fillRect(11, 4, 18, 12);

    // Visor (cyan glow instead of face)
    g.fillStyle(0x00e8ff);
    g.fillRect(13, 8, 14, 4);

    // Eyes (visor bar - single glowing strip)
    g.fillStyle(0x00e8ff, 0.9);
    g.fillRect(14, 8, 12, 3);

    // Visor highlight
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(15, 8, 5, 1);

    // Helmet (dark with cyan stripe)
    g.fillStyle(0x2a2a4a);
    g.fillRect(11, 2, 18, 5);
    g.fillRect(10, 3, 4, 4);  // Side left
    g.fillRect(26, 3, 4, 4); // Side right
    g.fillRect(16, 0, 8, 3); // Top detail
    // Cyan stripe on helmet
    g.fillStyle(0x00e8ff);
    g.fillRect(16, 1, 8, 1);

    // Legs with separation
    g.fillStyle(0x141430);
    g.fillRect(12, 30, 7, 8);
    g.fillRect(21, 30, 7, 8);

    // Feet
    g.fillStyle(0x1a1a3a);
    g.fillRect(11, 36, 8, 4);
    g.fillRect(21, 36, 8, 4);

    // Arms with better positioning
    // Left arm
    g.fillStyle(0x1a1a3a);
    g.fillRect(3, 14, 8, 12);
    g.fillStyle(0x00e8ff); // Cyan hand glow
    g.fillRect(3, 24, 8, 4);

    // Right arm
    g.fillStyle(0x1a1a3a);
    g.fillRect(29, 14, 8, 12);
    g.fillStyle(0x00e8ff); // Cyan hand glow
    g.fillRect(29, 24, 8, 4);

    // Cyan accent lines on body
    g.fillStyle(0x00e8ff, 0.6);
    g.fillRect(10, 15, 20, 1);
    g.fillRect(10, 22, 20, 1);

    // Outline/shading
    g.lineStyle(1, 0x00e8ff, 0.3);
    g.strokeRect(10, 3, 20, 31);

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
