import BaseWeapon from './BaseWeapon.js';

export default class RotatingAxe extends BaseWeapon {
  constructor(scene, skillData) {
    super(scene, skillData);
    this._axes = [];
    this._angle = 0;
    this._hitCooldowns = new Map(); // enemy -> last hit timestamp
    this._buildAxes();
  }

  _buildAxes() {
    this._axes.forEach(a => a.destroy());
    this._axes = [];
    const stats = this.getStats();
    for (let i = 0; i < stats.count; i++) {
      // Simple rectangle as the spinning axe (pixel art style)
      const axe = this.scene.add.rectangle(0, 0, 20, 10, 0xffaa22).setDepth(9);
      const glow = this.scene.add.rectangle(0, 0, 24, 14, 0xff8800, 0.3).setDepth(8);
      axe._glow = glow;
      this._axes.push(axe);
    }
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player) return;
    const stats = this.getStats();
    this._angle += (stats.angularSpeed / 1000) * delta;

    const enemies = this.scene.enemyGroup.getChildren();

    this._axes.forEach((axe, i) => {
      const offset = (360 / this._axes.length) * i;
      const rad = Phaser.Math.DegToRad(this._angle + offset);
      const ax = player.x + Math.cos(rad) * stats.orbitRadius;
      const ay = player.y + Math.sin(rad) * stats.orbitRadius;

      axe.setPosition(ax, ay).setRotation(rad + Math.PI / 4);
      if (axe._glow) axe._glow.setPosition(ax, ay).setRotation(rad + Math.PI / 4);

      // Manual distance-based hit detection (no physics group needed)
      enemies.forEach(e => {
        if (!e.active) return;
        const dist = Phaser.Math.Distance.Between(ax, ay, e.x, e.y);
        if (dist < e.displayWidth / 2 + 12) {
          const lastHit = this._hitCooldowns.get(e) || 0;
          if (time - lastHit > 450) {
            this._hitCooldowns.set(e, time);
            this.scene.hitEnemy(e, this.getDamage(stats.damage), ax, ay);
            this.scene.spawnHitParticle(ax, ay, 0xffaa22);
          }
        }
      });
    });

    // Remove cooldowns for dead enemies
    this._hitCooldowns.forEach((_, e) => { if (!e.active) this._hitCooldowns.delete(e); });
  }

  onUpgrade() { this._buildAxes(); }

  destroy() {
    this._axes.forEach(a => { if (a._glow) a._glow.destroy(); a.destroy(); });
    this._axes = [];
  }
}
