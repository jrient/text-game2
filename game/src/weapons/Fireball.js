import BaseWeapon from './BaseWeapon.js';

export default class Fireball extends BaseWeapon {
  constructor(scene, skillData) {
    super(scene, skillData);
    this._bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 20, runChildUpdate: false,
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
      if (b.x < -200 || b.x > bounds.width + 200 || b.y < -200 || b.y > bounds.height + 200)
        this._explode(b);
    });
  }

  _fire(stats) {
    const player = this.scene.player;
    if (!player) return;
    // Target most dense cluster
    const target = this.scene.getDenseTarget(player.x, player.y) || this.scene.getNearestEnemies(player.x, player.y, 1)[0];
    if (!target) return;

    const b = this._bullets.get(player.x, player.y, 'bullet_fire');
    if (!b) return;
    b.setActive(true).setVisible(true).setDepth(8);
    b.setDisplaySize(16, 16);
    b._damage = this.getDamage(stats.damage);
    b._radius = stats.radius;
    b._hasExploded = false;

    const angle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    this.scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), stats.speed, b.body.velocity);

    b.setScale(1.1, 0.9);
    this.scene.playSound('fireball');
  }

  _onHit(bullet, enemy) {
    if (!bullet.active || bullet._hasExploded) return;
    this._explode(bullet);
  }

  _explode(bullet) {
    if (!bullet.active || bullet._hasExploded) return;
    bullet._hasExploded = true;
    const { x, y, _damage: dmg, _radius: r } = bullet;
    bullet.setActive(false).setVisible(false);

    // AOE damage to all enemies in radius
    this.scene.getEnemiesInRadius(x, y, r).forEach(e => {
      if (e.active) this.scene.hitEnemy(e, dmg, x, y);
    });

    // Explosion visual
    this.scene.spawnExplosion(x, y, r, 0xff6600);
  }

  destroy() { this._bullets.clear(true, true); }
}
