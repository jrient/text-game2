import BaseWeapon from './BaseWeapon.js';

export default class GarlicAura extends BaseWeapon {
  constructor(scene, skillData) {
    super(scene, skillData);
    // Aura visual ring
    this._ring = scene.add.graphics().setDepth(3);
    this._tickTimer = 0;
    this._hitCooldowns = new Map();
  }

  update(time, delta) {
    const player = this.scene.player;
    if (!player) return;
    const stats = this.getStats();

    // Draw aura ring
    this._ring.clear();
    this._ring.lineStyle(3, 0xaaffaa, 0.3);
    this._ring.strokeCircle(player.x, player.y, stats.radius);
    this._ring.fillStyle(0x44ff88, 0.05);
    this._ring.fillCircle(player.x, player.y, stats.radius);

    // Tick damage
    this._tickTimer -= delta;
    const now = time;
    if (this._tickTimer <= 0) {
      this._tickTimer = stats.interval;
      // Damage all enemies in radius
      this.scene.getEnemiesInRadius(player.x, player.y, stats.radius).forEach(e => {
        if (!e.active) return;
        if (this._hitCooldowns.has(e) && now - this._hitCooldowns.get(e) < stats.interval - 50) return;
        this._hitCooldowns.set(e, now);
        this.scene.hitEnemy(e, this.getDamage(stats.damage), e.x, e.y);
        this.scene.spawnHitParticle(e.x, e.y, 0x44ff88);
      });
    }
    // Clean cooldowns
    this._hitCooldowns.forEach((t, e) => { if (!e.active) this._hitCooldowns.delete(e); });
  }

  destroy() {
    if (this._ring) this._ring.destroy();
  }
}
