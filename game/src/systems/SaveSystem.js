/**
 * Save system for game progress and statistics
 * Uses localStorage for persistence with optional cloud sync
 */
import * as CloudService from '../services/CloudService.js';

export class SaveSystem {
  static STORAGE_KEY = 'pixelSurvivor_save';
  static STATS_KEY = 'pixelSurvivor_stats';
  static CLOUD_ENABLED = true; // Enable cloud sync

  /**
   * Get default save data structure
   */
  static getDefaults() {
    return {
      version: 2, // Save version for migration
      created: Date.now(),
      lastPlayed: Date.now(),

      // High scores
      highScores: {
        endless: 0,
        campaign: [0, 0, 0, 0, 0], // One per level
      },

      // Total statistics
      stats: {
        totalPlayTime: 0,        // Seconds
        totalKills: 0,
        totalLevelsGained: 0,
        totalDeaths: 0,
        totalBossKills: 0,
        highestLevel: 0,
        highestCombo: 0,
      },

      // Settings (synced with SettingsManager)
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        joystickSide: 'left',
        difficulty: 'normal', // easy, normal, hard
      },

      // Unlocked content
      unlocks: {
        weapons: [],
        achievements: [],
      },
    };
  }

  /**
   * Load save data from localStorage
   */
  static load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // Merge with defaults in case of version mismatch
        return this.migrateSave(data);
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return this.getDefaults();
  }

  /**
   * Save data to localStorage
   */
  static save(data) {
    try {
      data.lastPlayed = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Failed to save:', e);
      return false;
    }
  }

  /**
   * Migrate save data between versions
   */
  static migrateSave(data) {
    const defaults = this.getDefaults();

    // Version 1 -> 2: Add new fields
    if (data.version === 1) {
      data.version = 2;
      if (!data.settings.difficulty) {
        data.settings.difficulty = 'normal';
      }
      if (!data.unlocks.achievements) {
        data.unlocks.achievements = [];
      }
    }

    // Ensure all fields exist
    return {
      ...defaults,
      ...data,
      settings: { ...defaults.settings, ...data.settings },
      stats: { ...defaults.stats, ...data.stats },
    };
  }

  /**
   * Update high score if current is higher
   */
  static updateHighScore(mode, levelIndex, score) {
    const data = this.load();

    if (mode === 'endless') {
      if (score > data.highScores.endless) {
        data.highScores.endless = score;
      }
    } else if (mode === 'campaign') {
      if (score > data.highScores.campaign[levelIndex]) {
        data.highScores.campaign[levelIndex] = score;
      }
    }

    this.save(data);
    return data.highScores;
  }

  /**
   * Update statistics after a game session
   */
  static updateStats(sessionData) {
    const data = this.load();

    data.stats.totalPlayTime += sessionData.playTime || 0;
    data.stats.totalKills += sessionData.kills || 0;
    data.stats.totalLevelsGained += sessionData.level || 0;
    data.stats.totalDeaths += sessionData.died ? 1 : 0;
    data.stats.totalBossKills += sessionData.bossKills || 0;
    data.stats.highestLevel = Math.max(data.stats.highestLevel, sessionData.level || 0);
    data.stats.highestCombo = Math.max(data.stats.highestCombo, sessionData.highestCombo || 0);

    this.save(data);
    return data.stats;
  }

  /**
   * Get current statistics
   */
  static getStats() {
    const data = this.load();
    return data.stats;
  }

  /**
   * Get statistics formatted for achievements
   */
  static getStatsForAchievements() {
    const stats = this.getStats();
    return {
      totalKills: stats.totalKills,
      totalBossKills: stats.totalBossKills,
      totalOrbs: 0, // Not tracked yet
      totalScore: 0, // Not tracked yet
    };
  }

  /**
   * Get unlocked achievements
   */
  static getAchievements() {
    const data = this.load();
    return data.unlocks.achievements || [];
  }

  /**
   * Unlock an achievement
   */
  static unlockAchievement(id) {
    const data = this.load();
    if (!data.unlocks.achievements.includes(id)) {
      data.unlocks.achievements.push(id);
      this.save(data);
    }
  }

  /**
   * Check if achievement is unlocked
   */
  static isAchievementUnlocked(id) {
    const data = this.load();
    return data.unlocks.achievements.includes(id);
  }

  /**
   * Get high scores
   */
  static getHighScores() {
    const data = this.load();
    return data.highScores;
  }

  /**
   * Reset all data (confirm with user)
   */
  static reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    return this.getDefaults();
  }

  /**
   * Export save data as JSON string
   */
  static export() {
    const data = this.load();
    return JSON.stringify(data);
  }

  /**
   * Import save data from JSON string
   */
  static import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const migrated = this.migrateSave(data);
      this.save(migrated);
      return true;
    } catch (e) {
      console.error('Failed to import save:', e);
      return false;
    }
  }

  /**
   * Format time for display
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Format number with commas
   */
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ═══════════════════════════════════════════════════════
  //  CLOUD SYNC
  // ═══════════════════════════════════════════════════════

  /**
   * Save to cloud (async)
   */
  static async saveToCloud() {
    if (!this.CLOUD_ENABLED) return false;

    try {
      const data = this.load();
      await CloudService.saveToCloud(data);
      return true;
    } catch (e) {
      console.warn('Cloud save failed:', e);
      return false;
    }
  }

  /**
   * Load from cloud (async)
   */
  static async loadFromCloud() {
    if (!this.CLOUD_ENABLED) return null;

    try {
      const result = await CloudService.loadFromCloud();
      return result.data;
    } catch (e) {
      console.warn('Cloud load failed:', e);
      return null;
    }
  }

  /**
   * Check if cloud is available
   */
  static async isCloudAvailable() {
    if (!this.CLOUD_ENABLED) return false;
    return await CloudService.checkBackendHealth();
  }

  /**
   * Submit score to leaderboard (async)
   */
  static async submitScore(scoreData) {
    if (!this.CLOUD_ENABLED) return false;

    try {
      await CloudService.submitScore(scoreData);
      return true;
    } catch (e) {
      console.warn('Score submission failed:', e);
      return false;
    }
  }

  /**
   * Get leaderboard (async)
   */
  static async getLeaderboard(mode = 'endless', levelIndex = 0) {
    if (!this.CLOUD_ENABLED) return [];

    try {
      return await CloudService.getLeaderboard(mode, levelIndex);
    } catch (e) {
      console.warn('Get leaderboard failed:', e);
      return [];
    }
  }

  /**
   * Get player rank (async)
   */
  static async getPlayerRank(mode = 'endless', levelIndex = 0) {
    if (!this.CLOUD_ENABLED) return null;

    try {
      return await CloudService.getPlayerRank(mode, levelIndex);
    } catch (e) {
      console.warn('Get player rank failed:', e);
      return null;
    }
  }
}
