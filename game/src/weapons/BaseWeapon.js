export default class BaseWeapon {
  constructor(scene, skillData) {
    this.scene = scene;
    this.skillData = skillData;
    this.level = 1;
    this._timer = 0;
    this._evolved = false;
  }

  getStats() {
    const stats = { ...this.skillData.levelStats[this.level - 1] };
    // Apply player cooldown reduction
    const player = this.scene.player;
    if (player && stats.cooldown && player.cooldownReduction > 0) {
      stats.cooldown = Math.round(stats.cooldown * (1 - player.cooldownReduction));
    }
    return stats;
  }

  getDamage(base) {
    const player = this.scene.player;
    return Math.round(base * (player ? player.damageMultiplier : 1));
  }

  upgrade() {
    if (this.level < this.skillData.maxLevel) {
      this.level++;
      this.onUpgrade();
    }
  }

  onUpgrade() {} // Override in subclasses

  // Called every frame
  update(time, delta) {}

  destroy() {}
}
