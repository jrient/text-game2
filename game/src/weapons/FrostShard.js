import BaseWeapon from './BaseWeapon.js';

export default class FrostShard extends BaseWeapon {
  constructor(scene, skillData) {
    super(scene, skillData);
    this._bulletGroup = scene.physics.add.group({ runChildUpdate: false, maxSize: 40 });
    scene.addBulletGroup(this._bulletGroup, this._onHit.bind(this));
    // Pre-generate shard texture once
    if (!scene.textures.exists('frost_shard')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xaaddff, 0.9);
      g.fillTriangle(6, 0, 2, 10, 10, 10);
      g.fillStyle(0xffffff, 0.6);
      g.fillTriangle(6, 3, 4, 8, 8, 8);
      g.generateTexture('frost_shard', 12, 12);
      g.destroy();
    }
  }

  update(time, delta) {
    const stats = this.getStats();
    if (time - this._lastFire > stats.cooldown) {
      this._fire(stats);
      this._lastFire = time;
    }
  }

  _fire(stats) {
    const player = this.scene.player;
    if (!player) return;

    const targets = this.scene.getNearestEnemies(player.x, player.y, stats.count);
    const count = Math.min(stats.count, Math.max(targets.length, 1));

    for (let i = 0; i < count; i++) {
      let targetX, targetY;

      if (i < targets.length) {
        // Aim at enemy
        targetX = targets[i].x;
        targetY = targets[i].y;
      } else {
        // Random direction
        const angle = (Math.PI * 2 / count) * i;
        targetX = player.x + Math.cos(angle) * 200;
        targetY = player.y + Math.sin(angle) * 200;
      }

      const angle = Phaser.Math.Angle.Between(player.x, player.y, targetX, targetY);
      const speed = 400;

      const shard = this._bulletGroup.get(player.x, player.y, 'shard', null, true);
      if (shard) {
        shard.setActive(true).setVisible(true);
        shard.setSize(14, 14);
        shard.setDepth(8);
        shard.setTexture('frost_shard');

        shard.body.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
        shard.setRotation(angle + Math.PI / 2);

        shard.setData('damage', this.getDamage(stats.damage));
        shard.setData('slowDuration', stats.slowDuration);
        shard.setData('slowFactor', stats.slowFactor);

        // Ice trail
        shard.setData('trail', []);
      }
    }

    this.scene.playSound('shoot');
  }

  _onHit(shard, enemy) {
    if (!shard.active || !enemy.active) return;

    const damage = shard.getData('damage') || 10;
    const slowDuration = shard.getData('slowDuration') || 1500;
    const slowFactor = shard.getData('slowFactor') || 0.6;

    // Apply damage and slow
    this.scene.hitEnemy(enemy, damage, shard.x, shard.y);
    this._applySlow(enemy, slowFactor, slowDuration);

    // Ice particles
    this.scene.spawnHitParticle(shard.x, shard.y, 0xaaddff);

    shard.setActive(false).setVisible(false);
  }

  _applySlow(enemy, factor, duration) {
    // Store original speed if not already stored
    if (enemy._originalSpeed === undefined) {
      enemy._originalSpeed = enemy.speed;
    }

    // Apply slow effect
    enemy.speed = enemy._originalSpeed * factor;
    enemy.setTint(0x88ccff);

    // Clear any existing slow timer
    if (enemy._slowTimer) {
      enemy._slowTimer.remove();
      enemy._slowTimer = null;
    }

    // Set restore timer
    enemy._slowTimer = this.scene.time.delayedCall(duration, () => {
      if (enemy && enemy.active) {
        // Restore original speed and clear tint
        enemy.speed = enemy._originalSpeed;
        enemy.clearTint();
        enemy._originalSpeed = undefined;
      }
      enemy._slowTimer = null;
    });
  }

  destroy() {
    this._bulletGroup.destroy();
    super.destroy();
  }
}
