import BaseWeapon from './BaseWeapon.js';

export default class Lightning extends BaseWeapon {
  constructor(scene, skillData) {
    super(scene, skillData);
    this._bolts = []; // Graphics objects for lightning arcs
  }

  update(time, delta) {
    this._timer -= delta;
    if (this._timer <= 0) {
      const stats = this.getStats();
      this._timer = stats.cooldown;
      this._strike(stats);
    }
  }

  _strike(stats) {
    const player = this.scene.player;
    if (!player) return;
    const nearest = this.scene.getNearestEnemies(player.x, player.y, 1);
    if (nearest.length === 0) return;

    // Build chain
    const chain = [{ x: player.x, y: player.y }];
    const hit = new Set();
    let current = nearest[0];

    for (let i = 0; i < stats.chains; i++) {
      if (!current || !current.active) break;
      if (hit.has(current)) break;
      hit.add(current);
      this.scene.hitEnemy(current, this.getDamage(stats.damage), current.x, current.y);
      chain.push({ x: current.x, y: current.y });
      // Find next nearest not yet hit
      const nextTargets = this.scene.getNearestEnemies(current.x, current.y, 6)
        .filter(e => !hit.has(e));
      current = nextTargets[0] || null;
    }

    // Draw lightning arcs
    this._drawLightning(chain);
    this.scene.playSound('lightning');
  }

  _drawLightning(chain) {
    const g = this.scene.add.graphics().setDepth(15);
    g.lineStyle(3, 0xffff88, 0.9);
    for (let i = 1; i < chain.length; i++) {
      const { x: x1, y: y1 } = chain[i - 1];
      const { x: x2, y: y2 } = chain[i];
      // Jagged lightning path
      g.beginPath();
      g.moveTo(x1, y1);
      const steps = 4;
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const mx = x1 + (x2 - x1) * t + Phaser.Math.Between(-12, 12);
        const my = y1 + (y2 - y1) * t + Phaser.Math.Between(-12, 12);
        g.lineTo(mx, my);
      }
      g.lineTo(x2, y2);
      g.strokePath();
      // Glow
      g.lineStyle(6, 0x8888ff, 0.25);
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath();
      // Spark at target
      this.scene.spawnHitParticle(x2, y2, 0xffff44);
    }
    this._bolts.push(g);
    // Fade out
    this.scene.tweens.add({
      targets: g, alpha: 0, duration: 200,
      onComplete: () => { g.destroy(); this._bolts = this._bolts.filter(b => b !== g); },
    });
  }

  destroy() {
    this._bolts.forEach(g => g.destroy());
    this._bolts = [];
  }
}
