import BaseWeapon from './BaseWeapon.js';

export default class MagicBolt extends BaseWeapon {
  constructor(scene, skillData) {
    super(scene, skillData);
    // Bullet pool
    this._bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 80,
      runChildUpdate: false,
    });
    // Register collision with enemies
    scene.addBulletGroup(this._bullets, this._onHit.bind(this));
  }

  update(time, delta) {
    this._timer -= delta;
    const stats = this.getStats();
    if (this._timer <= 0) {
      this._timer = stats.cooldown;
      this._fire(stats);
    }
    // Move bullets, deactivate out-of-bounds
    this._bullets.getChildren().forEach(b => {
      if (!b.active) return;
      if (b.x < -200 || b.x > this.scene.physics.world.bounds.width + 200 ||
          b.y < -200 || b.y > this.scene.physics.world.bounds.height + 200) {
        b.setActive(false).setVisible(false);
      }
    });
  }

  _fire(stats) {
    const player = this.scene.player;
    if (!player) return;

    // Find N nearest enemies
    const targets = this.scene.getNearestEnemies(player.x, player.y, stats.count);
    targets.forEach(enemy => {
      const b = this._bullets.get(player.x, player.y, 'bullet_magic');
      if (!b) return;
      b.setActive(true).setVisible(true).setDepth(8);
      b.setDisplaySize(8, 8);
      b._damage = this.getDamage(stats.damage);
      b._piercing = 0;
      const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
      this.scene.physics.velocityFromAngle(
        Phaser.Math.RadToDeg(angle), stats.speed, b.body.velocity
      );
      b.setAlpha(0.85);
    });

    // SFX
    this.scene.playSound('shoot');
  }

  _onHit(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    const dmg = bullet._damage || 10;
    this.scene.hitEnemy(enemy, dmg, bullet.x, bullet.y);
    bullet.setActive(false).setVisible(false);
    this.scene.spawnHitParticle(bullet.x, bullet.y, 0x88aaff);
  }

  destroy() {
    this._bullets.clear(true, true);
  }
}
