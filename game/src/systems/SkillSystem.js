import { SKILLS, WEAPON_IDS, PASSIVE_IDS } from '../data/skills.js';
import MagicBolt from '../weapons/MagicBolt.js';
import RotatingAxe from '../weapons/RotatingAxe.js';
import ThrowingKnife from '../weapons/ThrowingKnife.js';
import Fireball from '../weapons/Fireball.js';
import Lightning from '../weapons/Lightning.js';
import GarlicAura from '../weapons/GarlicAura.js';
import FrostShard from '../weapons/FrostShard.js';
import HomingMissile from '../weapons/HomingMissile.js';
import PoisonCloud from '../weapons/PoisonCloud.js';

const WEAPON_CLASSES = { MagicBolt, RotatingAxe, ThrowingKnife, Fireball, Lightning, GarlicAura, FrostShard, HomingMissile, PoisonCloud };

export default class SkillSystem {
  constructor(scene) {
    this.scene = scene;
    this.weapons = new Map();   // id -> weapon instance
    this.passives = new Map();  // id -> current level
    // Start with magic bolt
    this.addWeapon('MAGIC_BOLT');
  }

  addWeapon(id) {
    if (this.weapons.has(id)) return this.upgradeWeapon(id);
    const data = SKILLS[id];
    const WeaponClass = WEAPON_CLASSES[data.weaponClass];
    if (!WeaponClass) return;
    const weapon = new WeaponClass(this.scene, data);
    this.weapons.set(id, weapon);
  }

  upgradeWeapon(id) {
    const w = this.weapons.get(id);
    if (w) w.upgrade();
    this._checkEvolution(id);
  }

  addPassive(id) {
    const current = this.passives.get(id) || 0;
    const data = SKILLS[id];
    if (current >= data.maxLevel) return;
    const newLevel = current + 1;
    this.passives.set(id, newLevel);
    this.scene.player.applyPassive(data, newLevel);
    // Check evolutions that require this passive
    this._checkAllEvolutions();
  }

  _checkAllEvolutions() {
    this.weapons.forEach((w, id) => this._checkEvolution(id));
  }

  _checkEvolution(weaponId) {
    const data = SKILLS[weaponId];
    if (!data || !data.evolvesInto || !data.evolveRequires) return;
    const weapon = this.weapons.get(weaponId);
    if (!weapon || weapon.level < data.maxLevel) return;
    const passiveLevel = this.passives.get(data.evolveRequires) || 0;
    const passiveMax = SKILLS[data.evolveRequires]?.maxLevel || 5;
    if (passiveLevel >= passiveMax) {
      this._evolve(weaponId, data.evolvesInto);
    }
  }

  _evolve(fromId, toId) {
    // Remove old weapon, mark evolved
    const old = this.weapons.get(fromId);
    if (old && !old._evolved) {
      old._evolved = true;
      old.level = old.skillData.maxLevel;
      // Visual feedback
      this.scene.showEvolveEffect(fromId, toId);
    }
  }

  // Returns 3 random upgradeable skill choices
  getChoices() {
    const choices = [];
    const maxWeapons = 6;

    // Collect upgradeable weapons
    const upgradeableWeapons = [];
    WEAPON_IDS.forEach(id => {
      const w = this.weapons.get(id);
      if (w && w.level < SKILLS[id].maxLevel) upgradeableWeapons.push({ id, type: 'upgrade_weapon', currentLevel: w.level });
      else if (!w && this.weapons.size < maxWeapons)  upgradeableWeapons.push({ id, type: 'new_weapon', currentLevel: 0 });
    });

    // Collect upgradeable passives
    const upgradeablePassives = [];
    PASSIVE_IDS.forEach(id => {
      const level = this.passives.get(id) || 0;
      if (level < SKILLS[id].maxLevel) upgradeablePassives.push({ id, type: 'passive', currentLevel: level });
    });

    // Shuffle and pick
    const pool = Phaser.Utils.Array.Shuffle([...upgradeableWeapons, ...upgradeablePassives]);
    const seen = new Set();
    for (const item of pool) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      choices.push(item);
      if (choices.length >= 3) break;
    }
    // Fill with passives if not enough
    while (choices.length < 3) {
      const fallback = PASSIVE_IDS.find(id => !seen.has(id));
      if (!fallback) break;
      seen.add(fallback);
      choices.push({ id: fallback, type: 'passive', currentLevel: this.passives.get(fallback) || 0 });
    }
    return choices;
  }

  applyChoice(choice) {
    if (choice.type === 'new_weapon')      this.addWeapon(choice.id);
    else if (choice.type === 'upgrade_weapon') this.upgradeWeapon(choice.id);
    else if (choice.type === 'passive')    this.addPassive(choice.id);
  }

  update(time, delta) {
    this.weapons.forEach(w => w.update(time, delta));
  }

  destroy() {
    this.weapons.forEach(w => w.destroy());
  }
}
