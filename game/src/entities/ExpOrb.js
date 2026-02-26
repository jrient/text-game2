export default class ExpOrb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, value) {
    const key = value >= 10 ? 'orb_exp_lg' : value >= 4 ? 'orb_exp_md' : 'orb_exp_sm';
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.value = value;
    this.setDepth(4);
    this.body.setMaxVelocity(400, 400);

    // Gentle float animation
    scene.tweens.add({
      targets: this, y: y - 4, duration: 600 + Math.random() * 400,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Magnet state
    this._attracted = false;
  }

  attractTo(px, py) {
    this._attracted = true;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, px, py);
    const dist = Phaser.Math.Distance.Between(this.x, this.y, px, py);
    const speed = Math.min(400, 150 + dist * 3);
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  stopAttract() {
    this._attracted = false;
    this.body.setVelocity(0, 0);
  }

  isAttracted() { return this._attracted; }
}
