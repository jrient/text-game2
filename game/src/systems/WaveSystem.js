import { ENEMIES, BOSSES } from '../data/enemies.js';
import { ENDLESS_CONFIG } from '../data/levels.js';

/**
 * Wave System - Handles enemy spawning with batch progression
 *
 * Features:
 * - Batch-based spawning (enemies spawn in groups, not all at once)
 * - Progressive difficulty (each batch has stronger enemies)
 * - Wave-based structure (clear waves to progress)
 */
export default class WaveSystem {
  constructor(scene, levelConfig, mode) {
    this.scene = scene;
    this.mode = mode;
    this.levelConfig = levelConfig;

    // Wave progression
    this.wave = 0;
    this.batch = 0; // Current batch within wave
    this.batchesPerWave = 3; // Number of batches per wave
    this.enemiesPerBatch = 8; // Base enemies per batch

    // Timers
    this._spawnTimer = 0;
    this._batchDelay = 0; // Delay between batches
    this._bossSpawned = false;

    // Difficulty scaling
    this._difficultyMult = 1.0;
    this._batchHealthMult = 1.0; // Each batch has more HP

    // Track spawned enemies for current batch
    this._batchEnemiesSpawned = 0;
  }

  update(delta, elapsedSeconds) {
    // Update batch spawn timer
    if (this._batchDelay > 0) {
      this._batchDelay -= delta;
      if (this._batchDelay <= 0) {
        this._startNextBatch();
      }
      return;
    }

    // Update individual spawn timer
    this._spawnTimer -= delta;
    if (this._spawnTimer <= 0 && this._hasMoreToSpawn()) {
      this._spawnSingle();
    }

    // Scale difficulty over time (longer game = harder)
    this._difficultyMult = 1 + elapsedSeconds / 60 * 0.3;
  }

  /**
   * Check if there are more enemies to spawn in current batch
   */
  _hasMoreToSpawn() {
    return this._batchEnemiesSpawned < this._getCurrentBatchSize();
  }

  /**
   * Get the number of enemies in current batch
   */
  _getCurrentBatchSize() {
    const baseSize = this.enemiesPerBatch;
    const waveBonus = Math.floor(this.wave / 2);
    const batchBonus = this.batch * 2;
    return baseSize + waveBonus + batchBonus;
  }

  /**
   * Get health multiplier for current batch
   */
  _getCurrentBatchHealthMult() {
    // Each batch has +15% HP
    return 1 + (this.wave * this.batchesPerWave + this.batch) * 0.15;
  }

  /**
   * Get damage multiplier for current batch
   */
  _getCurrentBatchDamageMult() {
    // Each batch has +10% damage
    return 1 + (this.wave * this.batchesPerWave + this.batch) * 0.10;
  }

  /**
   * Start the next wave
   */
  startNextWave() {
    this.wave++;
    this.batch = 0;
    this._startNextBatch();
  }

  /**
   * Start the next batch within current wave
   */
  _startNextBatch() {
    this._batchEnemiesSpawned = 0;

    if (this.mode === 'campaign') {
      this._startCampaignBatch();
    } else {
      this._startEndlessBatch();
    }
  }

  /**
   * Campaign mode batch spawning
   */
  _startCampaignBatch() {
    const cfg = this.levelConfig;

    // Check for boss spawn
    if (!this._bossSpawned && this.scene._elapsedSeconds >= cfg.bossTime) {
      this._bossSpawned = true;
      this._spawnBoss(cfg.boss);
      this._batchDelay = 3000; // 3 second delay after boss
      return;
    }

    // Set spawn interval based on wave
    const baseInterval = cfg.waveConfig?.interval || 800;
    const waveReduction = this.wave * 50;
    this._spawnTimer = Math.max(300, baseInterval - waveReduction);
  }

  /**
   * Endless mode batch spawning
   */
  _startEndlessBatch() {
    const cfg = ENDLESS_CONFIG;

    // Boss wave check
    if (this.wave > 0 && this.wave % cfg.bossEvery === 0 && this.batch === 0) {
      const bossId = cfg.bosses[Math.floor(Math.random() * cfg.bosses.length)];
      this._spawnBoss(bossId);
      this._batchDelay = 5000; // Longer delay after boss
      return;
    }

    // Elite wave check
    const isElite = this.wave % cfg.eliteEvery === 0;

    // Calculate spawn interval
    const baseInterval = cfg.baseInterval || 600;
    const waveReduction = Math.min(300, this.wave * 20);
    this._spawnTimer = Math.max(250, baseInterval - waveReduction);
  }

  /**
   * Spawn a single enemy
   */
  _spawnSingle() {
    const healthMult = this._getCurrentBatchHealthMult() * this._difficultyMult;
    const damageMult = this._getCurrentBatchDamageMult() * this._difficultyMult;

    if (this.mode === 'campaign') {
      this._spawnCampaignEnemy(healthMult, damageMult);
    } else {
      this._spawnEndlessEnemy(healthMult, damageMult);
    }

    this._batchEnemiesSpawned++;
    this._spawnTimer = 150; // Fast spawning within batch
  }

  /**
   * Spawn enemy in campaign mode
   */
  _spawnCampaignEnemy(healthMult, damageMult) {
    const cfg = this.levelConfig;
    const enemyId = cfg.enemies[Math.floor(Math.random() * cfg.enemies.length)];
    this._spawnEnemy(enemyId, healthMult, damageMult);
  }

  /**
   * Spawn enemy in endless mode
   */
  _spawnEndlessEnemy(healthMult, damageMult) {
    const cfg = ENDLESS_CONFIG;

    // Elite wave?
    const isElite = this.wave % cfg.eliteEvery === 0;
    const mult = isElite ? 2.5 : 1.5;

    // Unlock more enemy types progressively
    const availableCount = Math.min(cfg.allEnemyTypes.length, 2 + Math.floor(this.wave / 3));
    const available = cfg.allEnemyTypes.slice(0, availableCount);
    const id = available[Math.floor(Math.random() * available.length)];

    this._spawnEnemy(id, healthMult * mult, damageMult * mult);
  }

  /**
   * Spawn a single enemy with given multipliers
   */
  _spawnEnemy(id, healthMult, damageMult) {
    const data = ENEMIES[id];
    if (!data) return;

    const [x, y] = this._edgeSpawnPos();
    const enemy = this.scene.spawnEnemy(x, y, data, false, 1);

    // Apply batch difficulty scaling
    if (enemy) {
      enemy.maxHp = Math.round(enemy.maxHp * healthMult);
      enemy.hp = enemy.maxHp;
      enemy.damage = Math.round(enemy.damage * damageMult);
    }
  }

  /**
   * Spawn boss
   */
  _spawnBoss(id) {
    const data = BOSSES[id];
    if (!data) return;

    const player = this.scene.player;
    const side = Math.floor(Math.random() * 4);
    const cam = this.scene.cameras.main;
    let x, y;
    const margin = 100;
    switch (side) {
      case 0: x = cam.scrollX + Math.random() * cam.width;  y = cam.scrollY - margin; break;
      case 1: x = cam.scrollX + cam.width + margin;          y = cam.scrollY + Math.random() * cam.height; break;
      case 2: x = cam.scrollX + Math.random() * cam.width;  y = cam.scrollY + cam.height + margin; break;
      default: x = cam.scrollX - margin;                     y = cam.scrollY + Math.random() * cam.height;
    }
    this.scene.spawnEnemy(x, y, data, true, 1);
    this.scene.showBossAlert(data.name);
  }

  /**
   * Get random edge spawn position
   */
  _edgeSpawnPos() {
    const cam = this.scene.cameras.main;
    const margin = 60;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: return [cam.scrollX + Math.random() * cam.width, cam.scrollY - margin];
      case 1: return [cam.scrollX + cam.width + margin, cam.scrollY + Math.random() * cam.height];
      case 2: return [cam.scrollX + Math.random() * cam.width, cam.scrollY + cam.height + margin];
      default: return [cam.scrollX - margin, cam.scrollY + Math.random() * cam.height];
    }
  }

  /**
   * Check if current batch is complete
   */
  isBatchComplete() {
    return this._batchEnemiesSpawned >= this._getCurrentBatchSize();
  }

  /**
   * Check if current wave is complete
   */
  isWaveComplete() {
    if (!this.isBatchComplete()) return false;

    // Check if all spawned enemies are dead
    const aliveEnemies = this.scene.enemyGroup.getChildren().filter(e => e.active).length;
    return aliveEnemies === 0;
  }

  /**
   * Advance to next batch
   */
  advanceBatch() {
    this.batch++;

    if (this.batch >= this.batchesPerWave) {
      // Wave complete, start next wave after delay
      this._batchDelay = 3000;
      this.wave++;
      this.batch = 0;
    } else {
      // Small delay between batches
      this._batchDelay = 1500;
    }
  }

  getWave() { return this.wave; }
  getBatch() { return this.batch; }
}
