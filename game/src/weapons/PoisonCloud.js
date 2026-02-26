import BaseWeapon from './BaseWeapon.js';

export default class PoisonCloud extends BaseWeapon {
  constructor(scene, skillData) {
    super(scene, skillData);
    this._clouds = [];
    this._cloudGroup = scene.add.group();
  }

  update(time, delta) {
    const stats = this.getStats();
    const cooldown = Math.round(stats.cooldown * (1 - this.player.cooldownReduction));
    if (time - this._lastFire > cooldown) {
      this._fire(stats);
      this._lastFire = time;
    }

    // Update all clouds
    for (let i = this._clouds.length - 1; i >= 0; i--) {
      const cloud = this._clouds[i];
      cloud.remaining -= delta;

      if (cloud.remaining <= 0) {
        // Remove cloud
        cloud.graphic.destroy();
        this._clouds.splice(i, 1);
        continue;
      }

      // Pulsing effect
      const pulse = 1 + Math.sin(time / 200) * 0.1;
      cloud.graphic.setScale(pulse);

      // Damage enemies in range
      const enemies = this.scene.getEnemiesInRadius(cloud.x, cloud.y, stats.radius);
      enemies.forEach(enemy => {
        const lastHit = cloud.hitTimes.get(enemy);
        if (!lastHit || time - lastHit > 500) {
          cloud.hitTimes.set(enemy, time);
          this.scene.hitEnemy(enemy, this.getDamage(stats.damage), enemy.x, enemy.y);
          // Poison color particle
          this.scene.spawnHitParticle(enemy.x, enemy.y, 0x44ff44);
        }
      });
    }
  }

  _fire(stats) {
    const player = this.scene.player;
    if (!player) return;

    // Find a good position (near enemies or random around player)
    let targetX, targetY;
    const nearest = this.scene.getNearestEnemies(player.x, player.y, 1);
    if (nearest.length > 0) {
      targetX = nearest[0].x;
      targetY = nearest[0].y;
    } else {
      // Random position around player
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 50;
      targetX = player.x + Math.cos(angle) * dist;
      targetY = player.y + Math.sin(angle) * dist;
    }

    // Create poison cloud graphic
    const graphic = this.scene.add.graphics()
      .setDepth(5)
      .setPosition(targetX, targetY);

    // Draw cloud layers
    const drawCloud = () => {
      graphic.clear();
      // Outer diffuse cloud
      graphic.fillStyle(0x44ff44, 0.15);
      graphic.fillCircle(0, 0, stats.radius);
      // Inner denser cloud
      graphic.fillStyle(0x22cc22, 0.25);
      graphic.fillCircle(0, 0, stats.radius * 0.6);
      // Center core
      graphic.fillStyle(0x00aa00, 0.3);
      graphic.fillCircle(0, 0, stats.radius * 0.3);
    };
    drawCloud();

    this._clouds.push({
      graphic: graphic,
      x: targetX,
      y: targetY,
      remaining: stats.duration,
      hitTimes: new Map(),
      radius: stats.radius,
      drawFunc: drawCloud,
    });
  }

  destroy() {
    this._clouds.forEach(cloud => cloud.graphic.destroy());
    this._clouds = [];
    super.destroy();
  }
}
