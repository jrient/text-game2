import { C } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.body.setSize(20, 28);
    this.body.setOffset(6, 4);

    // Stats
    this.maxHp = 100;
    this.hp = 100;
    this.speed = 150;
    this.damageMultiplier = 1.0;
    this.damageReduction = 0.0;
    this.pickupRange = 80;
    this.healOnKill = 0;
    this.speedBonus = 0;
    this.hpBonus = 0;
    this.cooldownReduction = 0;
    this.pickupBonus = 0;

    // State
    this.invincible = false;
    this.invincibleTime = 800;
    this._lastDir = new Phaser.Math.Vector2(1, 0);

    // Visual: hurt flash
    this._hurtTween = null;

    // Shadow
    this._shadow = scene.add.ellipse(x, y + 14, 24, 8, 0x000000, 0.35).setDepth(9);
  }

  update(dx, dy) {
    // Movement
    const spd = this.speed + this.speedBonus;
    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      this.body.setVelocity((dx / len) * spd, (dy / len) * spd);
      this._lastDir.set(dx / len, dy / len);
      this.setFlipX(dx < 0);
    } else {
      this.body.setVelocity(0, 0);
    }
    this._shadow.setPosition(this.x, this.y + 14);
  }

  takeDamage(amount) {
    if (this.invincible) return;
    const actual = Math.max(1, Math.round(amount * (1 - this.damageReduction)));
    this.hp = Math.max(0, this.hp - actual);
    this.invincible = true;

    // Hurt flash
    if (this._hurtTween) this._hurtTween.stop();
    this._hurtTween = this.scene.tweens.add({
      targets: this, alpha: 0.3, duration: 80,
      yoyo: true, repeat: 3,
      onComplete: () => {
        this.setAlpha(1);
        this.invincible = false;
      },
    });

    // Screen shake
    this.scene.cameras.main.shake(150, 0.008);
    return actual;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  onKill() {
    if (this.healOnKill > 0) this.heal(this.healOnKill);
  }

  getLastDirection() { return this._lastDir; }

  getEffectivePickupRange() { return this.pickupRange + this.pickupBonus; }

  applyPassive(passiveData, level) {
    const stats = passiveData.levelStats[level - 1];
    if (stats.speedBonus !== undefined)      this.speedBonus = stats.speedBonus;
    if (stats.damageMultiplier !== undefined) this.damageMultiplier = stats.damageMultiplier;
    if (stats.damageReduction !== undefined)  this.damageReduction = stats.damageReduction;
    if (stats.hpBonus !== undefined) {
      const oldBonus = this.hpBonus;
      this.hpBonus = stats.hpBonus;
      this.maxHp = 100 + this.hpBonus;
      this.hp = Math.min(this.hp + (this.hpBonus - oldBonus), this.maxHp);
    }
    if (stats.cooldownReduction !== undefined) this.cooldownReduction = stats.cooldownReduction;
    if (stats.pickupBonus !== undefined)       this.pickupBonus = stats.pickupBonus;
    if (stats.healOnKill !== undefined)        this.healOnKill = stats.healOnKill;
  }

  destroy() {
    if (this._shadow) this._shadow.destroy();
    super.destroy();
  }
}
