import BaseWeapon from './BaseWeapon.js';

export default class HomingMissile extends BaseWeapon {
  constructor(scene, skillData) {
    super(scene, skillData);
    this._bullets = [];
    this._bulletGroup = scene.physics.add.group({ runChildUpdate: false, maxSize: 50 });
    scene.addBulletGroup(this._bulletGroup, this._onHit.bind(this));
  }

  update(time, delta) {
    const stats = this.getStats();
    const cooldown = Math.round(stats.cooldown * (1 - this.player.cooldownReduction));
    if (time - this._lastFire > cooldown) {
      this._fire(stats);
      this._lastFire = time;
    }

    // Update all bullets
    this._bulletGroup.getChildren().forEach(bullet => {
      if (!bullet.active) return;

      // Find nearest enemy to target
      const nearest = this._findNearestEnemy(bullet.x, bullet.y);
      if (nearest) {
        // Turn towards enemy
        const targetAngle = Phaser.Math.Angle.Between(bullet.x, bullet.y, nearest.x, nearest.y);
        const currentAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
        let angleDiff = targetAngle - currentAngle;

        // Normalize angle to -PI to PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Apply turn speed limit
        const maxTurn = stats.turnSpeed;
        angleDiff = Phaser.Math.Clamp(angleDiff, -maxTurn, maxTurn);

        // Calculate new velocity
        const newAngle = currentAngle + angleDiff;
        bullet.body.setVelocity(
          Math.cos(newAngle) * stats.speed,
          Math.sin(newAngle) * stats.speed
        );
        bullet.setRotation(newAngle);
      }

      // Lifetime check
      if (bullet.getData('lifetime')) {
        bullet.setData('lifetime', bullet.getData('lifetime') - delta);
        if (bullet.getData('lifetime') <= 0) {
          bullet.setActive(false).setVisible(false);
        }
      }
    });
  }

  _fire(stats) {
    const player = this.scene.player;
    if (!player) return;

    for (let i = 0; i < stats.count; i++) {
      const bullet = this._bulletGroup.get(player.x, player.y, 'bullet', null, true);
      if (bullet) {
        bullet.setActive(true).setVisible(true);
        bullet.setSize(16, 16);
        bullet.setDepth(8);

        // Draw missile
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xff4444);
        graphics.fillCircle(0, 0, 6);
        graphics.fillStyle(0xffaa00);
        graphics.fillCircle(3, 0, 3);
        graphics.generateTexture('missile_temp_' + bullet.x, 12, 12);
        graphics.destroy();
        bullet.setTexture('missile_temp_' + bullet.x);

        // Random initial direction
        const angle = Math.random() * Math.PI * 2;
        bullet.body.setVelocity(
          Math.cos(angle) * stats.speed,
          Math.sin(angle) * stats.speed
        );
        bullet.setRotation(angle);

        // Set lifetime (8 seconds)
        bullet.setData('lifetime', 8000);
        bullet.setData('damage', this.getDamage(stats.damage));

        // Trail effect
        const trail = this.scene.add.graphics().setDepth(7);
        bullet.setData('trail', trail);
      }
    }
  }

  _findNearestEnemy(x, y) {
    const enemies = this.scene.enemyGroup.getChildren().filter(e => e.active);
    if (enemies.length === 0) return null;

    let nearest = null;
    let nearestDist = Infinity;
    for (const enemy of enemies) {
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  _onHit(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    const damage = bullet.getData('damage') || 10;
    this.scene.hitEnemy(enemy, damage, bullet.x, bullet.y);
    this.scene.spawnHitParticle(bullet.x, bullet.y, 0xff4444);

    bullet.setActive(false).setVisible(false);

    // Destroy trail
    const trail = bullet.getData('trail');
    if (trail) trail.destroy();
  }

  destroy() {
    this._bulletGroup.destroy();
    super.destroy();
  }
}
