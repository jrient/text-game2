/**
 * Achievement Manager
 * Handles achievement tracking, unlocking, and rewards
 */
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../data/achievements.js';

export class AchievementManager {
  constructor() {
    this.unlocked = new Set();
    this.justUnlocked = [];
    this.sessionStats = {
      kills: 0,
      bossKills: 0,
      orbsCollected: 0,
      tookDamage: false,
      maxCombo: 0,
      currentCombo: 0,
      uniqueWeapons: new Set(),
      startTime: null,
      time: 0,
      won: false,
      mode: null,
      level: 1,
      score: 0,
      totalSkillLevels: 0,
    };
  }

  /**
   * Initialize with saved data
   */
  load(savedData = {}) {
    this.unlocked = new Set(savedData.unlocked || []);
  }

  /**
   * Export for saving
   */
  save() {
    return {
      unlocked: Array.from(this.unlocked),
    };
  }

  /**
   * Start a new session
   */
  startSession(mode = 'endless') {
    this.sessionStats = {
      kills: 0,
      bossKills: 0,
      orbsCollected: 0,
      tookDamage: false,
      maxCombo: 0,
      currentCombo: 0,
      uniqueWeapons: new Set(),
      startTime: Date.now(),
      time: 0,
      won: false,
      mode: mode,
      level: 1,
      score: 0,
      totalSkillLevels: 0,
    };
    this.justUnlocked = [];
  }

  /**
   * Record a kill
   */
  recordKill(isBoss = false) {
    this.sessionStats.kills++;
    this.sessionStats.currentCombo++;
    if (this.sessionStats.currentCombo > this.sessionStats.maxCombo) {
      this.sessionStats.maxCombo = this.sessionStats.currentCombo;
    }
    if (isBoss) {
      this.sessionStats.bossKills++;
    }
    this.checkAchievements();
  }

  /**
   * Reset combo (when player takes too long between kills)
   */
  resetCombo() {
    this.sessionStats.currentCombo = 0;
  }

  /**
   * Record that player took damage
   */
  recordDamage() {
    this.sessionStats.tookDamage = true;
  }

  /**
   * Record orb collection
   */
  recordOrb() {
    this.sessionStats.orbsCollected++;
  }

  /**
   * Add a weapon to the unique set
   */
  addWeapon(weaponId) {
    this.sessionStats.uniqueWeapons.add(weaponId);
    this.checkAchievements();
  }

  /**
   * Update level
   */
  updateLevel(level) {
    this.sessionStats.level = level;
    this.checkAchievements();
  }

  /**
   * Update score
   */
  updateScore(score) {
    this.sessionStats.score = score;
    this.checkAchievements();
  }

  /**
   * Update total skill levels
   */
  updateSkillLevels(totalLevels) {
    this.sessionStats.totalSkillLevels = totalLevels;
    this.checkAchievements();
  }

  /**
   * Get current session time
   */
  getSessionTime() {
    return Math.floor((Date.now() - this.sessionStats.startTime) / 1000);
  }

  /**
   * End the session
   */
  endSession(won = false) {
    this.sessionStats.time = this.getSessionTime();
    this.sessionStats.won = won;
    this.checkAchievements();
  }

  /**
   * Check if any achievements should be unlocked
   */
  checkAchievements() {
    // Get lifetime stats from SaveSystem
    const lifetimeStats = window.saveSystem?.getStats() || {
      totalKills: 0,
      totalBossKills: 0,
      totalOrbs: 0,
      totalScore: 0,
    };

    // Add current session stats
    const stats = {
      totalKills: lifetimeStats.totalKills + this.sessionStats.kills,
      totalBossKills: lifetimeStats.totalBossKills + this.sessionStats.bossKills,
      totalOrbs: lifetimeStats.totalOrbs + this.sessionStats.orbsCollected,
      totalScore: lifetimeStats.totalScore + this.sessionStats.score,
    };

    // Check each achievement
    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
      if (this.unlocked.has(key)) continue; // Already unlocked

      let unlocked = false;

      // Call the appropriate condition function
      if (achievement.category === 'combat' || achievement.category === 'collection' || achievement.category === 'score') {
        unlocked = achievement.condition(stats);
      } else {
        unlocked = achievement.condition(this.sessionStats);
      }

      if (unlocked) {
        this.unlockAchievement(key);
      }
    }
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(id) {
    if (this.unlocked.has(id)) return;

    this.unlocked.add(id);
    this.justUnlocked.push({
      id,
      achievement: ACHIEVEMENTS[id],
      time: Date.now(),
    });

    // Save to SaveSystem
    if (window.saveSystem) {
      window.saveSystem.unlockAchievement(id);
    }

    // Play sound effect
    if (window.musicSystem) {
      window.musicSystem.playAchievement();
    }
  }

  /**
   * Get newly unlocked achievements (for notifications)
   */
  getNewlyUnlocked() {
    const now = Date.now();
    const recent = this.justUnlocked.filter(a => now - a.time < 5000);
    // Clear old ones
    this.justUnlocked = this.justUnlocked.filter(a => now - a.time < 5000);
    return recent;
  }

  /**
   * Get achievement rewards
   */
  getRewards() {
    const rewards = {
      expMult: 1.0,
      damageMult: 1.0,
      pickupRange: 0,
      speedBonus: 0,
      hpBonus: 0,
    };

    for (const id of this.unlocked) {
      const achievement = ACHIEVEMENTS[id];
      if (achievement.reward) {
        if (achievement.reward.expMult) rewards.expMult *= achievement.reward.expMult;
        if (achievement.reward.damageMult) rewards.damageMult *= achievement.reward.damageMult;
        if (achievement.reward.pickupRange) rewards.pickupRange += achievement.reward.pickupRange;
        if (achievement.reward.speedBonus) rewards.speedBonus += achievement.reward.speedBonus;
        if (achievement.reward.hpBonus) rewards.hpBonus += achievement.reward.hpBonus;
      }
    }

    return rewards;
  }

  /**
   * Get achievement info for display
   */
  getAchievementInfo(id) {
    return {
      ...ACHIEVEMENTS[id],
      unlocked: this.unlocked.has(id),
    };
  }

  /**
   * Get all achievements grouped by category
   */
  getAllAchievements() {
    const result = {};

    for (const [catKey, catInfo] of Object.entries(ACHIEVEMENT_CATEGORIES)) {
      result[catKey] = {
        ...catInfo,
        achievements: [],
      };
    }

    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
      const cat = achievement.category;
      if (result[cat]) {
        result[cat].achievements.push({
          ...achievement,
          unlocked: this.unlocked.has(key),
        });
      }
    }

    return result;
  }

  /**
   * Get unlock progress for an achievement
   */
  getProgress(id) {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement) return null;

    const stats = window.saveSystem?.getStats() || {
      totalKills: 0,
      totalBossKills: 0,
      totalOrbs: 0,
      totalScore: 0,
    };

    // Calculate progress based on achievement type
    switch (id) {
      case 'FIRST_BLOOD':
      case 'KILL_100':
      case 'KILL_1000':
        return {
          current: stats.totalKills + this.sessionStats.kills,
          max: id === 'FIRST_BLOOD' ? 1 : id === 'KILL_100' ? 100 : 1000,
        };
      case 'BOSS_HUNTER':
        return {
          current: stats.totalBossKills + this.sessionStats.bossKills,
          max: 10,
        };
      case 'SURVIVOR_5MIN':
        return {
          current: this.getSessionTime(),
          max: 300,
        };
      case 'SURVIVOR_10MIN':
        return {
          current: this.getSessionTime(),
          max: 600,
        };
      case 'MAX_LEVEL':
        return {
          current: this.sessionStats.level,
          max: 30,
        };
      case 'COLLECTOR':
        return {
          current: stats.totalOrbs + this.sessionStats.orbsCollected,
          max: 1000,
        };
      case 'WEAPON_MASTER':
        return {
          current: this.sessionStats.uniqueWeapons.size,
          max: 6,
        };
      case 'FULL_BUILD':
        return {
          current: this.sessionStats.totalSkillLevels,
          max: 42,
        };
      case 'HIGH_SCORE_10K':
        return {
          current: this.sessionStats.score,
          max: 10000,
        };
      case 'HIGH_SCORE_50K':
        return {
          current: this.sessionStats.score,
          max: 50000,
        };
      case 'HIGH_SCORE_100K':
        return {
          current: this.sessionStats.score,
          max: 100000,
        };
      case 'MILLIONAIRE':
        return {
          current: stats.totalScore + this.sessionStats.score,
          max: 1000000,
        };
      case 'SPEED_RUNNER':
        return {
          current: this.sessionStats.won && this.sessionStats.mode === 'campaign' && this.getSessionTime() <= 180 ? 1 : 0,
          max: 1,
        };
      case 'PACIFIST':
        return {
          current: this.sessionStats.won && this.sessionStats.mode === 'campaign' && this.sessionStats.kills === 0 ? 1 : 0,
          max: 1,
        };
      case 'COMBO_MASTER':
        return {
          current: this.sessionStats.maxCombo,
          max: 10,
        };
      case 'UNTOUCHABLE':
        return {
          current: this.sessionStats.won && !this.sessionStats.tookDamage ? 1 : 0,
          max: 1,
        };
      default:
        return null;
    }
  }
}

// Singleton instance
export const achievementManager = new AchievementManager();
