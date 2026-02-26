/**
 * Game settings manager with localStorage persistence
 */
export class SettingsManager {
  static STORAGE_KEY = 'pixelSurvivor_settings';

  static getDefaults() {
    return {
      soundEnabled: true,
      musicEnabled: true, // Reserved for future music
      vibrationEnabled: true,
      joystickSide: 'left', // 'left' or 'right'
    };
  }

  static load() {
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
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
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
}
