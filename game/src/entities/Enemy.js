import { C } from '../config.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, enemyData, isBoss = false) {
    // Start with player texture as placeholder; _buildGraphic() replaces it
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyData = enemyData;
    this.isBoss = isBoss;
    this.active = true;

    // Stats (scaled by difficulty)
    this.maxHp = enemyData.hp;
    this.hp = enemyData.hp;
    this.speed = enemyData.speed;
    this.damage = enemyData.damage;
    this.expDrop = enemyData.expDrop;
    this.scoreValue = enemyData.scoreValue;
    this.knockbackForce = enemyData.knockback || 80;

    // Visual setup
    this.setDepth(5);
    this._buildGraphic();
    this._buildHpBar();

    // Knockback state
    this._knockTimer = 0;

    // Boss phase
    this._phase2 = false;
  }

  _buildGraphic() {
    const d = this.enemyData;
    const size = d.size;
    // Draw enemy as a graphics object, generate texture key
    const key = `enemy_${d.id}`;
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      if (this.isBoss) {
        this._drawBoss(g, d, size);
      } else {
        this._drawEnemy(g, d, size);
      }
      g.generateTexture(key, size * 2, size * 2);
      g.destroy();
    }
    this.setTexture(key);
    this.setDisplaySize(size * 2, size * 2);
    this.body.setSize(size * 1.6, size * 1.6);
    this.body.setOffset(size * 0.2, size * 0.2);
    if (d.alpha) this.setAlpha(d.alpha);
  }

  _drawEnemy(g, d, size) {
    const s = size;
    // Body
    g.fillStyle(d.bodyColor); g.fillRect(s / 2, s / 4, s, s * 1.2);
    // Head
    g.fillStyle(d.bodyColor); g.fillRect(s / 2 - 2, 0, s + 4, s / 2 + 4);
    // Eyes (white + pupil)
    g.fillStyle(0xffffff);
    g.fillRect(s / 2 + 2, 4, s / 4, s / 4);
    g.fillRect(s / 2 + s / 2, 4, s / 4, s / 4);
    g.fillStyle(d.eyeColor);
    g.fillRect(s / 2 + 3, 5, s / 6, s / 6);
    g.fillRect(s / 2 + s / 2 + 1, 5, s / 6, s / 6);
    // Outline
    g.lineStyle(2, Phaser.Display.Color.IntegerToColor(d.bodyColor).darken(30).color);
    g.strokeRect(s / 2, s / 4, s, s * 1.2);
  }

  _drawBoss(g, d, size) {
    const s = size;
    // Large boss body
    g.fillStyle(d.bodyColor);
    g.fillRect(s / 4, s / 4, s * 1.5, s * 1.5);
    // Head
    g.fillStyle(d.bodyColor);
    g.fillRect(s / 4, 0, s * 1.5, s / 2 + 4);
    // Big glowing eyes
    g.fillStyle(0xffffff);
    g.fillRect(s / 2, s / 6, s / 3, s / 3);
    g.fillRect(s * 1.1, s / 6, s / 3, s / 3);
    g.fillStyle(d.eyeColor);
    g.fillRect(s / 2 + 2, s / 6 + 2, s / 4, s / 4);
    g.fillRect(s * 1.1 + 2, s / 6 + 2, s / 4, s / 4);
    // Crown / horns
    g.fillStyle(0xffdd44);
    g.fillTriangle(s / 2, 0, s / 2 + s / 5, -s / 4, s / 2 + s * 2 / 5, 0);
    g.fillTriangle(s, 0, s + s / 5, -s / 3, s + s * 2 / 5, 0);
    // Outline
    g.lineStyle(3, 0xffffff, 0.6);
    g.strokeRect(s / 4, s / 4, s * 1.5, s * 1.5);
  }

  _buildHpBar() {
    if (!this.isBoss) {
      // Small HP bar above enemy
      this._hpBg = this.scene.add.graphics().setDepth(6);
      this._hpFg = this.scene.add.graphics().setDepth(7);
    }
    this._updateHpBar();
  }

  _updateHpBar() {
    const w = this.isBoss ? 200 : 28;
    const h = this.isBoss ? 14 : 4;
    const ratio = Math.max(0, this.hp / this.maxHp);

    if (this.isBoss) {
      // Boss HP bar handled by GameScene HUD
      return;
    }
    if (!this._hpBg) return;
    const bx = this.x - w / 2;
    const by = this.y - this.displayHeight / 2 - 8;
    this._hpBg.clear();
    this._hpBg.fillStyle(0x330000); this._hpBg.fillRect(bx, by, w, h);
    this._hpFg.clear();
    if (ratio > 0) {
      const col = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff3333;
      this._hpFg.fillStyle(col); this._hpFg.fillRect(bx, by, w * ratio, h);
    }
  }

  scaleStats(multiplier) {
    this.maxHp = Math.round(this.maxHp * multiplier);
    this.hp = this.maxHp;
    this.damage = Math.round(this.damage * multiplier);
    this.expDrop = Math.round(this.expDrop * multiplier);
  }

  takeDamage(amount) {
    if (!this.active) return 0;
    this.hp -= amount;
    this._updateHpBar();

    // Hit flash
    this.scene.tweens.add({
      targets: this, alpha: 0.4, duration: 60, yoyo: true,
    });

    // Boss phase 2
    if (this.isBoss && !this._phase2 && this.hp / this.maxHp <= 0.5) {
      this._phase2 = true;
      this.speed *= 1.4;
      this.damage = Math.round(this.damage * 1.3);
      this.setTint(0xff6600);
      this.scene.cameras.main.shake(300, 0.015);
    }

    return amount;
  }

  knockback(fromX, fromY) {
    const angle = Phaser.Math.Angle.Between(fromX, fromY, this.x, this.y);
    const force = this.knockbackForce;
    this.body.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
    this._knockTimer = 150;
  }

  update(playerX, playerY, delta) {
    if (!this.active) return;

    // Move toward player unless being knocked back
    if (this._knockTimer > 0) {
      this._knockTimer -= delta;
      // Decay knockback
      this.body.velocity.x *= 0.92;
      this.body.velocity.y *= 0.92;
    } else {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);
      this.body.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed,
      );
      this.setFlipX(playerX < this.x);
    }

    this._updateHpBar();
  }

  isDead() { return this.hp <= 0; }

  destroy() {
    if (this._hpBg) { this._hpBg.destroy(); this._hpBg = null; }
    if (this._hpFg) { this._hpFg.destroy(); this._hpFg = null; }
    super.destroy();
  }
}
