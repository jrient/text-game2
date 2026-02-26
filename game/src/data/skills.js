export const SKILLS = {
  // ===== WEAPONS =====
  MAGIC_BOLT: {
    id: 'MAGIC_BOLT', name: '魔法弹', type: 'weapon', icon: '🔵',
    description: '自动射击最近的敌人',
    maxLevel: 5, evolvesInto: 'HOMING_BOLT', evolveRequires: 'POWER_UP',
    weaponClass: 'MagicBolt',
    levelStats: [
      { damage: 20, cooldown: 1200, count: 1, speed: 300 },
      { damage: 26, cooldown: 1100, count: 1, speed: 320 },
      { damage: 32, cooldown: 1000, count: 2, speed: 340 },
      { damage: 40, cooldown: 900,  count: 2, speed: 360 },
      { damage: 50, cooldown: 800,  count: 3, speed: 380 },
    ],
  },
  ROTATING_AXE: {
    id: 'ROTATING_AXE', name: '旋转斧', type: 'weapon', icon: '🪓',
    description: '在玩家周围旋转，持续伤害',
    maxLevel: 5, evolvesInto: 'STORM_AXE', evolveRequires: 'COOLDOWN_UP',
    weaponClass: 'RotatingAxe',
    levelStats: [
      { damage: 30, angularSpeed: 120, count: 1, orbitRadius: 70 },
      { damage: 38, angularSpeed: 140, count: 1, orbitRadius: 75 },
      { damage: 48, angularSpeed: 160, count: 2, orbitRadius: 80 },
      { damage: 60, angularSpeed: 180, count: 2, orbitRadius: 85 },
      { damage: 74, angularSpeed: 200, count: 3, orbitRadius: 90 },
    ],
  },
  THROWING_KNIFE: {
    id: 'THROWING_KNIFE', name: '飞刀', type: 'weapon', icon: '🗡️',
    description: '向移动方向高速飞出，可穿透',
    maxLevel: 5, evolvesInto: 'BLADE_STORM', evolveRequires: 'SPEED_UP',
    weaponClass: 'ThrowingKnife',
    levelStats: [
      { damage: 15, cooldown: 900,  count: 1, piercing: 1, speed: 450 },
      { damage: 19, cooldown: 800,  count: 2, piercing: 1, speed: 480 },
      { damage: 24, cooldown: 700,  count: 2, piercing: 2, speed: 510 },
      { damage: 30, cooldown: 600,  count: 3, piercing: 2, speed: 540 },
      { damage: 38, cooldown: 500,  count: 4, piercing: 3, speed: 580 },
    ],
  },
  FIREBALL: {
    id: 'FIREBALL', name: '火球术', type: 'weapon', icon: '🔥',
    description: '爆炸伤害，大范围攻击',
    maxLevel: 5, evolvesInto: 'INFERNO', evolveRequires: 'ARMOR_UP',
    weaponClass: 'Fireball',
    levelStats: [
      { damage: 40, cooldown: 2200, radius: 60, speed: 200 },
      { damage: 52, cooldown: 2000, radius: 70, speed: 210 },
      { damage: 66, cooldown: 1800, radius: 82, speed: 220 },
      { damage: 84, cooldown: 1600, radius: 96, speed: 230 },
      { damage: 105, cooldown: 1400, radius: 112, speed: 240 },
    ],
  },
  LIGHTNING: {
    id: 'LIGHTNING', name: '闪电链', type: 'weapon', icon: '⚡',
    description: '在敌人之间跳跃的闪电',
    maxLevel: 5, evolvesInto: 'THUNDERSTORM', evolveRequires: 'PICKUP_UP',
    weaponClass: 'Lightning',
    levelStats: [
      { damage: 28, cooldown: 1600, chains: 2 },
      { damage: 36, cooldown: 1500, chains: 3 },
      { damage: 45, cooldown: 1400, chains: 4 },
      { damage: 56, cooldown: 1200, chains: 5 },
      { damage: 70, cooldown: 1000, chains: 6 },
    ],
  },
  GARLIC_AURA: {
    id: 'GARLIC_AURA', name: '大蒜气息', type: 'weapon', icon: '🧄',
    description: '持续伤害周围所有敌人',
    maxLevel: 5, evolvesInto: 'HOLY_LIGHT', evolveRequires: 'HP_UP',
    weaponClass: 'GarlicAura',
    levelStats: [
      { damage: 5,  interval: 600, radius: 80  },
      { damage: 8,  interval: 550, radius: 95  },
      { damage: 12, interval: 500, radius: 112 },
      { damage: 17, interval: 450, radius: 130 },
      { damage: 23, interval: 380, radius: 150 },
    ],
  },

  // ===== NEW WEAPONS =====
  HOMING_MISSILE: {
    id: 'HOMING_MISSILE', name: '追踪导弹', type: 'weapon', icon: '🚀',
    description: '自动追踪并撞击敌人',
    maxLevel: 5, evolvesInto: null, evolveRequires: null,
    weaponClass: 'HomingMissile',
    levelStats: [
      { damage: 25, cooldown: 1800, count: 1, speed: 180, turnSpeed: 0.06 },
      { damage: 32, cooldown: 1700, count: 1, speed: 190, turnSpeed: 0.07 },
      { damage: 40, cooldown: 1600, count: 2, speed: 200, turnSpeed: 0.08 },
      { damage: 50, cooldown: 1500, count: 2, speed: 210, turnSpeed: 0.09 },
      { damage: 62, cooldown: 1400, count: 3, speed: 220, turnSpeed: 0.10 },
    ],
  },
  POISON_CLOUD: {
    id: 'POISON_CLOUD', name: '毒雾', type: 'weapon', icon: '☠️',
    description: '释放持续伤害毒雾区域',
    maxLevel: 5, evolvesInto: null, evolveRequires: null,
    weaponClass: 'PoisonCloud',
    levelStats: [
      { damage: 8, cooldown: 3000, radius: 70, duration: 3000 },
      { damage: 12, cooldown: 2800, radius: 80, duration: 3500 },
      { damage: 17, cooldown: 2600, radius: 90, duration: 4000 },
      { damage: 23, cooldown: 2400, radius: 100, duration: 4500 },
      { damage: 30, cooldown: 2200, radius: 110, duration: 5000 },
    ],
  },
  FROST_SHARD: {
    id: 'FROST_SHARD', name: '冰冻弹', type: 'weapon', icon: '❄️',
    description: '冰冻敌人并造成伤害',
    maxLevel: 5, evolvesInto: null, evolveRequires: null,
    weaponClass: 'FrostShard',
    levelStats: [
      { damage: 18, cooldown: 1500, count: 1, slowDuration: 1500, slowFactor: 0.6 },
      { damage: 24, cooldown: 1400, count: 1, slowDuration: 1800, slowFactor: 0.55 },
      { damage: 31, cooldown: 1300, count: 2, slowDuration: 2100, slowFactor: 0.5 },
      { damage: 39, cooldown: 1200, count: 2, slowDuration: 2400, slowFactor: 0.45 },
      { damage: 48, cooldown: 1100, count: 3, slowDuration: 2700, slowFactor: 0.4 },
    ],
  },

  // ===== PASSIVES =====
  POWER_UP: {
    id: 'POWER_UP', name: '攻击强化', type: 'passive', icon: '⚔️',
    description: '提升所有武器伤害',
    maxLevel: 5,
    levelStats: [
      { damageMultiplier: 1.20 }, { damageMultiplier: 1.44 },
      { damageMultiplier: 1.73 }, { damageMultiplier: 2.07 },
      { damageMultiplier: 2.49 },
    ],
  },
  SPEED_UP: {
    id: 'SPEED_UP', name: '速度强化', type: 'passive', icon: '👟',
    description: '提升移动速度',
    maxLevel: 5,
    levelStats: [
      { speedBonus: 25 }, { speedBonus: 50 },
      { speedBonus: 80 }, { speedBonus: 115 },
      { speedBonus: 155 },
    ],
  },
  ARMOR_UP: {
    id: 'ARMOR_UP', name: '护甲强化', type: 'passive', icon: '🛡️',
    description: '减少受到的伤害',
    maxLevel: 5,
    levelStats: [
      { damageReduction: 0.10 }, { damageReduction: 0.18 },
      { damageReduction: 0.25 }, { damageReduction: 0.32 },
      { damageReduction: 0.40 },
    ],
  },
  HP_UP: {
    id: 'HP_UP', name: '生命强化', type: 'passive', icon: '❤️',
    description: '提升最大生命值',
    maxLevel: 5,
    levelStats: [
      { hpBonus: 30 }, { hpBonus: 65 },
      { hpBonus: 105 }, { hpBonus: 150 },
      { hpBonus: 200 },
    ],
  },
  COOLDOWN_UP: {
    id: 'COOLDOWN_UP', name: '冷却强化', type: 'passive', icon: '⏰',
    description: '减少技能冷却时间',
    maxLevel: 5,
    levelStats: [
      { cooldownReduction: 0.10 }, { cooldownReduction: 0.18 },
      { cooldownReduction: 0.25 }, { cooldownReduction: 0.32 },
      { cooldownReduction: 0.40 },
    ],
  },
  PICKUP_UP: {
    id: 'PICKUP_UP', name: '吸附强化', type: 'passive', icon: '🧲',
    description: '增加经验宝石吸附范围',
    maxLevel: 5,
    levelStats: [
      { pickupBonus: 40 }, { pickupBonus: 85 },
      { pickupBonus: 135 }, { pickupBonus: 190 },
      { pickupBonus: 250 },
    ],
  },
  VAMPIRE: {
    id: 'VAMPIRE', name: '吸血', type: 'passive', icon: '🩸',
    description: '击杀敌人回复HP',
    maxLevel: 5,
    levelStats: [
      { healOnKill: 1 }, { healOnKill: 2 },
      { healOnKill: 3 }, { healOnKill: 5 },
      { healOnKill: 8 },
    ],
  },

  // ===== NEW PASSIVES =====
  CRITICAL_HIT: {
    id: 'CRITICAL_HIT', name: '暴击', type: 'passive', icon: '💥',
    description: '几率造成双倍伤害',
    maxLevel: 5,
    levelStats: [
      { critChance: 0.08, critMultiplier: 2.0 },
      { critChance: 0.12, critMultiplier: 2.2 },
      { critChance: 0.16, critMultiplier: 2.4 },
      { critChance: 0.20, critMultiplier: 2.6 },
      { critChance: 0.25, critMultiplier: 3.0 },
    ],
  },
  DODGE: {
    id: 'DODGE', name: '闪避', type: 'passive', icon: '💨',
    description: '几率完全避免伤害',
    maxLevel: 5,
    levelStats: [
      { dodgeChance: 0.08 },
      { dodgeChance: 0.12 },
      { dodgeChance: 0.16 },
      { dodgeChance: 0.20 },
      { dodgeChance: 0.25 },
    ],
  },
  EXP_BOOST: {
    id: 'EXP_BOOST', name: '经验加成', type: 'passive', icon: '📚',
    description: '获取更多经验值',
    maxLevel: 5,
    levelStats: [
      { expMultiplier: 1.15 },
      { expMultiplier: 1.30 },
      { expMultiplier: 1.45 },
      { expMultiplier: 1.60 },
      { expMultiplier: 1.80 },
    ],
  },
};

export const WEAPON_IDS = Object.keys(SKILLS).filter(id => SKILLS[id].type === 'weapon');
export const PASSIVE_IDS = Object.keys(SKILLS).filter(id => SKILLS[id].type === 'passive');
