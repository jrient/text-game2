import { C } from '../config.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, enemyData, isBoss = false) {
    // Start with player texture as placeholder; _buildGraphic() replaces it
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyData = enemyData;
    this.isBoss = isBoss;
    this.active = true;

    // Stats (scaled by difficulty)
    this.maxHp = enemyData.hp;
    this.hp = enemyData.hp;
    this.speed = enemyData.speed;
    this.damage = enemyData.damage;
    this.expDrop = enemyData.expDrop;
    this.scoreValue = enemyData.scoreValue;
    this.knockbackForce = enemyData.knockback || 80;

    // Special behavior setup
    this.behavior = enemyData.behavior || null;
    this._behaviorTimer = 0;
    this._lastBehaviorTime = 0;

    // Visual setup
    this.setDepth(5);
    this._buildGraphic();
    this._buildHpBar();

    // Knockback state
    this._knockTimer = 0;

    // Boss phase
    this._phase2 = false;
  }

  _buildGraphic() {
    const d = this.enemyData;
    const size = d.size;
    // Draw enemy as a graphics object, generate texture key
    const key = `enemy_${d.id}`;
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      if (this.isBoss) {
        this._drawBoss(g, d, size);
      } else {
        this._drawEnemy(g, d, size);
      }
      g.generateTexture(key, size * 2, size * 2);
      g.destroy();
    }
    this.setTexture(key);
    this.setDisplaySize(size * 2, size * 2);
    this.body.setSize(size * 1.6, size * 1.6);
    this.body.setOffset(size * 0.2, size * 0.2);
    if (d.alpha) this.setAlpha(d.alpha);
  }

  _drawEnemy(g, d, size) {
    const s = size;
    const outlineColor = Phaser.Display.Color.IntegerToColor(d.bodyColor).darken(40).color;

    // Draw shadow/outline for depth
    g.fillStyle(outlineColor);
    g.fillRect(s/2 + 2, s/4 + 2, s, s * 1.2);

    // Body (main color with gradient simulation)
    // Top half (lighter)
    const lighterColor = Phaser.Display.Color.IntegerToColor(d.bodyColor).brighten(20).color;
    g.fillStyle(lighterColor);
    g.fillRect(s/2, s/4, s, s * 0.6);
    // Bottom half (main color)
    g.fillStyle(d.bodyColor);
    g.fillRect(s/2, s/4 + s * 0.5, s, s * 0.7);

    // Head with better shape
    const headSize = s * 0.7;
    g.fillStyle(d.bodyColor);
    g.fillRect(s/2 - 2, 0, s + 4, headSize);

    // Eyes (more expressive - bigger and cuter)
    const eyeSize = s / 3;
    const eyeY = 6;
    // Left eye white
    g.fillStyle(0xffffff);
    g.fillCircle(s/2 + s/4, eyeY, eyeSize);
    // Right eye white
    g.fillCircle(s/2 + s*0.7, eyeY, eyeSize);
    // Pupils
    g.fillStyle(d.eyeColor);
    g.fillCircle(s/2 + s/4 + 1, eyeY + 1, eyeSize/2);
    g.fillCircle(s/2 + s*0.7 + 1, eyeY + 1, eyeSize/2);
    // Eye highlights (make them cute!)
    g.fillStyle(0xffffff);
    g.fillCircle(s/2 + s/4 - 1, eyeY - 1, 2);
    g.fillCircle(s/2 + s*0.7 - 1, eyeY - 1, 2);

    // Mouth/face based on enemy type
    if (d.id === 'SLIME' || d.id === 'GHOST' || d.id === 'FIRE_SLIME') {
      // Cute smile
      g.fillStyle(0x333333, 0.6);
      g.fillRect(s/2 + s/3, eyeY + eyeSize + 2, s/3, 2);
    } else if (d.id === 'SKELETON' || d.id === 'GHOST_WARRIOR') {
      // Scary expression
      g.fillStyle(0x333333, 0.8);
      g.fillRect(s/2 + s/4, eyeY + eyeSize + 1, s/4, 3);
      g.fillRect(s/2 + s*0.6, eyeY + eyeSize + 1, s/4, 3);
    }

    // Outline/shading
    g.lineStyle(1, outlineColor, 0.5);
    g.strokeRect(s/2, s/4, s, s * 1.2);
    g.strokeRect(s/2 - 2, 0, s + 4, headSize);

    // Add special details based on enemy type
    if (d.id === 'FIRE_SLIME') {
      // Flame particles
      g.fillStyle(0xffaa00);
      for (let i = 0; i < 3; i++) {
        const px = s/2 + Math.random() * s;
        const py = s/4 + Math.random() * s * 0.5;
        g.fillRect(px, py, 3, 3);
      }
    } else if (d.id === 'GHOST' || d.id === 'GHOST_WARRIOR') {
      // Eerie glow
      g.fillStyle(0xaaccff, 0.3);
      g.fillCircle(s, s/2, s/2);
    } else if (d.id === 'STONE_GOLEM' || d.id === 'ROCK_GOLEM') {
      // Cracks
      g.lineStyle(2, 0x444444);
      g.moveTo(s/2 + 4, s/4 + 4);
      g.lineTo(s/2 + s/2, s/2);
      g.moveTo(s/2 + s - 4, s/4 + 6);
      g.lineTo(s/2 + s/2, s/2 + 4);
      g.strokePath();
    }
  }

  _drawBoss(g, d, size) {
    const s = size;
    // Large boss body
    g.fillStyle(d.bodyColor);
    g.fillRect(s / 4, s / 4, s * 1.5, s * 1.5);
    // Head
    g.fillStyle(d.bodyColor);
    g.fillRect(s / 4, 0, s * 1.5, s / 2 + 4);
    // Big glowing eyes
    g.fillStyle(0xffffff);
    g.fillRect(s / 2, s / 6, s / 3, s / 3);
    g.fillRect(s * 1.1, s / 6, s / 3, s / 3);
    g.fillStyle(d.eyeColor);
    g.fillRect(s / 2 + 2, s / 6 + 2, s / 4, s / 4);
    g.fillRect(s * 1.1 + 2, s / 6 + 2, s / 4, s / 4);
    // Crown / horns
    g.fillStyle(0xffdd44);
    g.fillTriangle(s / 2, 0, s / 2 + s / 5, -s / 4, s / 2 + s * 2 / 5, 0);
    g.fillTriangle(s, 0, s + s / 5, -s / 3, s + s * 2 / 5, 0);
    // Outline
    g.lineStyle(3, 0xffffff, 0.6);
    g.strokeRect(s / 4, s / 4, s * 1.5, s * 1.5);
  }

  _buildHpBar() {
    if (!this.isBoss) {
      // Small HP bar above enemy (use rectangle for better performance)
      const w = C.ENEMY.HP_BAR_WIDTH, h = C.ENEMY.HP_BAR_HEIGHT;
      this._hpBg = this.scene.add.rectangle(
        this.x, this.y - this.displayHeight / 2 - C.ENEMY.HP_BAR_OFFSET_Y,
        w, h, 0x330000
      ).setDepth(6);
      this._hpFg = this.scene.add.rectangle(
        this.x, this.y - this.displayHeight / 2 - C.ENEMY.HP_BAR_OFFSET_Y,
        w, h, 0x44ff44
      ).setOrigin(0, 0.5).setDepth(7);
    }
    this._updateHpBar();
  }

  _updateHpBar() {
    if (this.isBoss) {
      // Boss HP bar handled by GameScene HUD
      return;
    }
    if (!this._hpBg || !this._hpFg) return;

    const w = C.ENEMY.HP_BAR_WIDTH;
    const ratio = Math.max(0, this.hp / this.maxHp);
    const y = this.y - this.displayHeight / 2 - C.ENEMY.HP_BAR_OFFSET_Y;

    // Update positions (follow enemy)
    this._hpBg.setPosition(this.x, y);
    this._hpFg.setPosition(this.x - w / 2, y);

    // Update width and color (only when damaged)
    this._hpFg.displayWidth = w * ratio;
    const col = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff3333;
    this._hpFg.setFillStyle(col);
  }

  scaleStats(multiplier) {
    this.maxHp = Math.round(this.maxHp * multiplier);
    this.hp = this.maxHp;
    this.damage = Math.round(this.damage * multiplier);
    this.expDrop = Math.round(this.expDrop * multiplier);
  }

  takeDamage(amount) {
    if (!this.active) return 0;

    // Apply damage reduction for armored enemies
    let actualDamage = amount;
    if (this.behavior === 'armored' && this.enemyData.damageReduction) {
      actualDamage = Math.round(amount * (1 - this.enemyData.damageReduction));
    }

    this.hp -= actualDamage;
    this._updateHpBar();

    // Hit flash
    this.scene.tweens.add({
      targets: this,
      alpha: C.ENEMY.HIT_FLASH_ALPHA,
      duration: C.ENEMY.HIT_FLASH_DURATION,
      yoyo: true,
    });

    // Boss phase 2
    if (this.isBoss && !this._phase2 && this.hp / this.maxHp <= C.ENEMY.BOSS_PHASE2_HP_THRESHOLD) {
      this._phase2 = true;
      this.speed *= C.ENEMY.BOSS_PHASE2_SPEED_MULT;
      this.damage = Math.round(this.damage * C.ENEMY.BOSS_PHASE2_DMG_MULT);
      this.setTint(C.ENEMY.BOSS_PHASE2_TINT);
      this.scene.cameras.main.shake(300, 0.015);
    }

    return actualDamage;
  }

  knockback(fromX, fromY) {
    // Armored enemies resist knockback
    if (this.behavior === 'armored') return;

    const angle = Phaser.Math.Angle.Between(fromX, fromY, this.x, this.y);
    const force = this.knockbackForce;
    this.body.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
    this._knockTimer = 150;
  }

  update(playerX, playerY, delta) {
    if (!this.active) return;

    // Handle special behaviors
    this._handleBehavior(playerX, playerY, delta);

    // Move toward player unless being knocked back
    if (this._knockTimer > 0) {
      this._knockTimer -= delta;
      // Decay knockback
      this.body.velocity.x *= C.ENEMY.KNOCKBACK_DECAY;
      this.body.velocity.y *= C.ENEMY.KNOCKBACK_DECAY;
    } else {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);
      this.body.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed,
      );
      this.setFlipX(playerX < this.x);
    }

    // Update HP bar position (cheap, just position update)
    if (this._hpBg && this._hpFg) {
      const y = this.y - this.displayHeight / 2 - C.ENEMY.HP_BAR_OFFSET_Y;
      this._hpBg.setPosition(this.x, y);
      this._hpFg.setPosition(this.x - C.ENEMY.HP_BAR_WIDTH / 2, y);
    }
  }

  /**
   * Handle special enemy behaviors
   */
  _handleBehavior(playerX, playerY, delta) {
    if (!this.behavior) return;

    switch (this.behavior) {
      case 'teleport':
        this._handleTeleport(playerX, playerY, delta);
        break;
      case 'explode':
        // Explosion handled in death
        break;
      case 'armored':
        // Damage reduction handled in takeDamage
        break;
    }
  }

  /**
   * Handle teleport behavior for ghost warriors
   */
  _handleTeleport(playerX, playerY, delta) {
    const teleportRange = this.enemyData.teleportRange || 300;
    const teleportCooldown = this.enemyData.teleportCooldown || 3000;
    const now = this.scene.time.now;

    // Check if player is too far
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);

    if (dist > teleportRange && now - this._lastBehaviorTime > teleportCooldown) {
      // Teleport closer to player
      const angle = Math.atan2(playerY - this.y, playerX - this.x);
      const teleportDist = 100;
      let newX = playerX - Math.cos(angle) * teleportDist + Phaser.Math.Between(-30, 30);
      let newY = playerY - Math.sin(angle) * teleportDist + Phaser.Math.Between(-30, 30);

      // Clamp to world bounds to prevent teleporting outside
      const bounds = this.scene.physics.world.bounds;
      newX = Phaser.Math.Clamp(newX, bounds.x + 50, bounds.x + bounds.width - 50);
      newY = Phaser.Math.Clamp(newY, bounds.y + 50, bounds.y + bounds.height - 50);

      // Teleport effect
      this.scene.spawnExplosion(this.x, this.y, 30, 0x6644aa);
      this.setPosition(newX, newY);
      this.scene.spawnExplosion(newX, newY, 30, 0x6644aa);

      this._lastBehaviorTime = now;
    }
  }

  /**
   * Handle explosion on death
   */
  onDeath() {
    if (this.behavior === 'explode' && this.enemyData.explosionRadius) {
      const radius = this.enemyData.explosionRadius || 80;
      const damage = this.enemyData.explosionDamage || 40;

      // Damage nearby enemies
      const nearbyEnemies = this.scene.getEnemiesInRadius(this.x, this.y, radius);
      nearbyEnemies.forEach(e => {
        if (e !== this && e.active) {
          this.scene.hitEnemy(e, damage, this.x, this.y);
        }
      });

      // Damage player if in range
      const player = this.scene.player;
      const playerDist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (playerDist < radius) {
        const actualDamage = player.takeDamage(damage);
        if (actualDamage > 0) {
          this.scene._showDamageNumber(player.x, player.y - 20, actualDamage, '#ff4444');
          this.scene._updateHpBar();
        }
      }

      // Visual effect
      this.scene.spawnExplosion(this.x, this.y, radius, 0xff6622);
      this.scene.cameras.main.shake(200, 0.02);
    }
  }

  isDead() { return this.hp <= 0; }

  destroy() {
    if (this._hpBg) { this._hpBg.destroy(); this._hpBg = null; }
    if (this._hpFg) { this._hpFg.destroy(); this._hpFg = null; }
    super.destroy();
  }
}
