import { ENEMIES, BOSSES } from '../data/enemies.js';
import { ENDLESS_CONFIG } from '../data/levels.js';

export default class WaveSystem {
  constructor(scene, levelConfig, mode) {
    this.scene = scene;
    this.mode = mode;
    this.levelConfig = levelConfig;
    this.wave = 0;
    this._spawnTimer = 0;
    this._bossSpawned = false;
    this._difficultyMult = 1.0;
  }

  update(delta, elapsedSeconds) {
    this._spawnTimer -= delta;
    if (this._spawnTimer <= 0) {
      this._spawn(elapsedSeconds);
    }
    // Scale difficulty over time
    this._difficultyMult = 1 + elapsedSeconds / 60 * 0.5;
  }

  _spawn(elapsedSeconds) {
    if (this.mode === 'campaign') {
      this._spawnCampaign(elapsedSeconds);
    } else {
      this._spawnEndless(elapsedSeconds);
    }
  }

  _spawnCampaign(elapsedSeconds) {
    const cfg = this.levelConfig;
    const waveCfg = cfg.waveConfig;

    // Boss trigger
    if (!this._bossSpawned && elapsedSeconds >= cfg.bossTime) {
      this._bossSpawned = true;
      this._spawnBoss(cfg.boss);
      this._spawnTimer = waveCfg.interval;
      return;
    }

    // Regular waves
    const count = Math.round(waveCfg.baseCount + this.wave * waveCfg.countGrowth);
    const interval = Math.max(waveCfg.minInterval, waveCfg.interval - this.wave * 50);
    this._spawnTimer = interval;
    this.wave++;

    for (let i = 0; i < count; i++) {
      const enemyId = cfg.enemies[Math.floor(Math.random() * cfg.enemies.length)];
      this._spawnEnemy(enemyId, this._difficultyMult);
    }
  }

  _spawnEndless(elapsedSeconds) {
    const cfg = ENDLESS_CONFIG;
    const spawnInterval = Math.max(cfg.minInterval, cfg.baseInterval - this.wave * cfg.intervalDecrement);
    this._spawnTimer = spawnInterval;
    this.wave++;

    // Elite wave every N waves
    const isElite = this.wave % cfg.eliteEvery === 0;
    // Boss wave every N waves
    if (this.wave % cfg.bossEvery === 0) {
      const bossId = cfg.bosses[Math.floor(Math.random() * cfg.bosses.length)];
      this._spawnBoss(bossId);
      return;
    }

    // Unlock more enemy types progressively
    const availableCount = Math.min(cfg.allEnemyTypes.length, 2 + Math.floor(this.wave / 5));
    const available = cfg.allEnemyTypes.slice(0, availableCount);
    const count = Math.round(cfg.baseCount + this.wave * cfg.countIncrement);
    const mult = 1 + this.wave * 0.05;

    for (let i = 0; i < count; i++) {
      const id = available[Math.floor(Math.random() * available.length)];
      this._spawnEnemy(id, mult * (isElite ? 2 : 1));
    }
  }

  _spawnEnemy(id, mult = 1) {
    const data = ENEMIES[id];
    if (!data) return;
    const [x, y] = this._edgeSpawnPos();
    this.scene.spawnEnemy(x, y, data, false, mult);
  }

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

  getWave() { return this.wave; }
}
