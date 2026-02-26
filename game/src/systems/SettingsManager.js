/**
 * Game settings manager with localStorage persistence
 */
import { SaveSystem } from './SaveSystem.js';

export class SettingsManager {
  static STORAGE_KEY = 'pixelSurvivor_settings';

  static getDefaults() {
    return {
      soundEnabled: true,
      musicEnabled: true, // Reserved for future music
      vibrationEnabled: true,
      joystickSide: 'left', // 'left' or 'right'
      difficulty: 'normal', // 'easy', 'normal', 'hard'
    };
  }

  static load() {
    // Try to load from SaveSystem first
    const saveData = SaveSystem.load();
    if (saveData.settings) {
      return { ...this.getDefaults(), ...saveData.settings };
    }

    // Fallback to old storage
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return { ...this.getDefaults(), ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return this.getDefaults();
  }

  static save(settings) {
    // Save through SaveSystem
    const saveData = SaveSystem.load();
    saveData.settings = settings;
    SaveSystem.save(saveData);
  }

  static get(key) {
    const settings = this.load();
    return settings[key];
  }

  static set(key, value) {
    const settings = this.load();
    settings[key] = value;
    this.save(settings);
  }

  static toggle(key) {
    const current = this.get(key);
    this.set(key, !current);
    return !current;
  }

  /**
   * Get difficulty multiplier
   */
  static getDifficultyMultiplier() {
    const diff = this.get('difficulty') || 'normal';
    switch (diff) {
      case 'easy': return { enemyHp: 0.7, enemyDamage: 0.7, expMult: 1.3 };
      case 'hard': return { enemyHp: 1.5, enemyDamage: 1.5, expMult: 0.8 };
      default: return { enemyHp: 1.0, enemyDamage: 1.0, expMult: 1.0 };
    }
  }
}
