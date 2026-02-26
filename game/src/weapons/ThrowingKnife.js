import BaseWeapon from './BaseWeapon.js';

export default class ThrowingKnife extends BaseWeapon {
  constructor(scene, skillData) {
    super(scene, skillData);
    this._bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 100, runChildUpdate: false,
    });
    scene.addBulletGroup(this._bullets, this._onHit.bind(this));
  }

  update(time, delta) {
    this._timer -= delta;
    const stats = this.getStats();
    if (this._timer <= 0) {
      this._timer = stats.cooldown;
      this._fire(stats);
    }
    this._bullets.getChildren().forEach(b => {
      if (!b.active) return;
      const bounds = this.scene.physics.world.bounds;
      if (b.x < -300 || b.x > bounds.width + 300 || b.y < -300 || b.y > bounds.height + 300)
        b.setActive(false).setVisible(false);
    });
  }

  _fire(stats) {
    const player = this.scene.player;
    if (!player) return;
    const dir = player.getLastDirection();
    const spread = stats.count > 1 ? 15 : 0;
    const baseAngle = Phaser.Math.RadToDeg(Math.atan2(dir.y, dir.x));

    for (let i = 0; i < stats.count; i++) {
      const b = this._bullets.get(player.x, player.y, 'bullet_knife');
      if (!b) continue;
      b.setActive(true).setVisible(true).setDepth(8);
      b.setDisplaySize(12, 5);
      b._damage = this.getDamage(stats.damage);
      b._piercing = stats.piercing;
      b._hits = 0;
      const offset = (i - (stats.count - 1) / 2) * spread;
      const angle = baseAngle + offset;
      b.setRotation(Phaser.Math.DegToRad(angle));
      this.scene.physics.velocityFromAngle(angle, stats.speed, b.body.velocity);
    }
    this.scene.playSound('knife');
  }

  _onHit(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    this.scene.hitEnemy(enemy, bullet._damage, bullet.x, bullet.y);
    this.scene.spawnHitParticle(bullet.x, bullet.y, 0xddddaa);
    bullet._hits = (bullet._hits || 0) + 1;
    if (bullet._hits >= bullet._piercing) {
      bullet.setActive(false).setVisible(false);
    }
  }

  destroy() { this._bullets.clear(true, true); }
}
