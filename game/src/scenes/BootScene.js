import { C } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Generate all textures programmatically — no external files needed
  }

  create() {
    this._generateTextures();
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
    // ── Pixel tile textures ──────────────────────────────────────
    this._makeTile('tile_grass', [0x2d5020, 0x3a6528, 0x254018, 0x335824]);
    this._makeTile('tile_sand',  [0x5a4020, 0x6a5030, 0x483218, 0x5e4525]);
    this._makeTile('tile_stone', [0x303045, 0x383855, 0x28283a, 0x343450]);
    this._makeTile('tile_lava',  [0x3a1000, 0x4a1800, 0x280800, 0x3e1200]);
    this._makeTile('tile_void',  [0x14001e, 0x1a002a, 0x0e0016, 0x160020]);

    // ── Player ───────────────────────────────────────────────────
    this._makePlayer();

    // ── Bullet / projectile textures ─────────────────────────────
    this._makeBullet('bullet_magic',    0x88aaff, 8);
    this._makeBullet('bullet_knife',    0xddddaa, 10, 4);
    this._makeBullet('bullet_fire',     0xff6600, 14);
    this._makeBullet('bullet_lightning',0xffff44, 6);
    this._makBulletOrb('bullet_axe',    0xffaa22, 14);

    // ── Experience orb ───────────────────────────────────────────
    this._makeOrb('orb_exp_sm', 0x44ff88, 5);
    this._makeOrb('orb_exp_md', 0x44ffaa, 8);
    this._makeOrb('orb_exp_lg', 0x88ffcc, 11);

    // ── Particles ────────────────────────────────────────────────
    this._makeParticle('px_hit',   0xffffff, 4);
    this._makeParticle('px_exp',   0x44ff88, 4);
    this._makeParticle('px_fire',  0xff6600, 5);
    this._makeParticle('px_spark', 0xffff44, 3);

    // ── UI elements ──────────────────────────────────────────────
    this._makePixel('px_white', 0xffffff, 2);
    this._makePixel('px_red',   0xff4444, 2);
    this._makePixel('px_green', 0x44ff88, 2);
    this._makePixel('px_blue',  0x4488ff, 2);
  }

  // 48x48 pixel tile with 4 color variation
  _makeTile(key, colors) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(colors[0]);
    g.fillRect(0, 0, 48, 48);
    // Pixel noise
    for (let i = 0; i < 12; i++) {
      const cx = Math.floor(Math.random() * 6) * 8;
      const cy = Math.floor(Math.random() * 6) * 8;
      g.fillStyle(colors[1 + (i % 3)]);
      g.fillRect(cx, cy, 8, 8);
    }
    g.generateTexture(key, 48, 48);
    g.destroy();
  }

  _makePlayer() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const s = 32;
    // Body (blue)
    g.fillStyle(0x4488ff); g.fillRect(8, 8, 16, 20);
    // Head
    g.fillStyle(0xffcc99); g.fillRect(9, 2, 14, 12);
    // Eyes
    g.fillStyle(0x000000); g.fillRect(12, 5, 3, 3); g.fillRect(17, 5, 3, 3);
    // Outline
    g.lineStyle(2, 0x2255bb);
    g.strokeRect(8, 8, 16, 20); g.strokeRect(9, 2, 14, 12);
    // Legs
    g.fillStyle(0x2255bb); g.fillRect(9, 26, 6, 6); g.fillRect(17, 26, 6, 6);
    // Arms
    g.fillStyle(0x4488ff); g.fillRect(2, 10, 6, 14); g.fillRect(24, 10, 6, 14);
    g.generateTexture('player', s, s);
    g.destroy();
  }

  _makeBullet(key, color, size, h) {
    const w = size; const bh = h || size;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color); g.fillRect(0, 0, w, bh);
    g.fillStyle(0xffffff); g.fillRect(1, 1, 2, 2);
    g.generateTexture(key, w, bh);
    g.destroy();
  }

  _makBulletOrb(key, color, size) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color); g.fillCircle(size / 2, size / 2, size / 2);
    g.fillStyle(0xffffff, 0.5); g.fillCircle(size / 2 - 2, size / 2 - 2, size / 5);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  _makeOrb(key, color, r) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color); g.fillCircle(r, r, r);
    g.fillStyle(0xffffff, 0.6); g.fillCircle(r - 1, r - 1, Math.max(1, r / 3));
    g.generateTexture(key, r * 2, r * 2);
    g.destroy();
  }

  _makeParticle(key, color, size) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color); g.fillRect(0, 0, size, size);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  _makePixel(key, color, size) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(color); g.fillRect(0, 0, size, size);
    g.generateTexture(key, size, size);
    g.destroy();
  }
}
