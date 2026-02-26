/**
 * Achievement System
 * Tracks and unlocks achievements based on player actions
 */
export const ACHIEVEMENTS = {
  // ═══════════════════════════════════════════════════════
  //  COMBAT ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════
  FIRST_BLOOD: {
    id: 'FIRST_BLOOD',
    name: '初露锋芒',
    description: '击杀第1个敌人',
    icon: '🗡️',
    category: 'combat',
    condition: (stats) => stats.totalKills >= 1,
    reward: { expMult: 1.05 },
  },
  KILL_100: {
    id: 'KILL_100',
    name: '百人斩',
    description: '累计击杀100个敌人',
    icon: '⚔️',
    category: 'combat',
    condition: (stats) => stats.totalKills >= 100,
    reward: { damageMult: 1.1 },
  },
  KILL_1000: {
    id: 'KILL_1000',
    name: '千人斩',
    description: '累计击杀1000个敌人',
    icon: '💀',
    category: 'combat',
    condition: (stats) => stats.totalKills >= 1000,
    reward: { damageMult: 1.2 },
  },
  BOSS_HUNTER: {
    id: 'BOSS_HUNTER',
    name: 'Boss猎手',
    description: '击杀10个Boss',
    icon: '👑',
    category: 'combat',
    condition: (stats) => stats.totalBossKills >= 10,
    reward: { damageMult: 1.15 },
  },

  // ═══════════════════════════════════════════════════════
  //  SURVIVAL ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════
  SURVIVOR_5MIN: {
    id: 'SURVIVOR_5MIN',
    name: '生存专家',
    description: '单局生存5分钟',
    icon: '⏱️',
    category: 'survival',
    condition: (session) => session.time >= 300,
    reward: { expMult: 1.1 },
  },
  SURVIVOR_10MIN: {
    id: 'SURVIVOR_10MIN',
    name: '生存大师',
    description: '单局生存10分钟',
    icon: '🏆',
    category: 'survival',
    condition: (session) => session.time >= 600,
    reward: { expMult: 1.15 },
  },
  MAX_LEVEL: {
    id: 'MAX_LEVEL',
    name: '登峰造极',
    description: '达到等级30',
    icon: '⭐',
    category: 'survival',
    condition: (session) => session.level >= 30,
    reward: { damageMult: 1.2 },
  },
  UNTOUCHABLE: {
    id: 'UNTOUCHABLE',
    name: '无伤通关',
    description: '不受任何伤害通关关卡',
    icon: '🛡️',
    category: 'survival',
    condition: (session) => session.tookDamage === false && session.won,
    reward: { expMult: 1.3 },
  },

  // ═══════════════════════════════════════════════════════
  //  COLLECTION ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════
  COLLECTOR: {
    id: 'COLLECTOR',
    name: '收藏家',
    description: '拾取1000个经验球',
    icon: '💎',
    category: 'collection',
    condition: (stats) => stats.totalOrbs >= 1000,
    reward: { pickupRange: 20 },
  },
  WEAPON_MASTER: {
    id: 'WEAPON_MASTER',
    name: '武器大师',
    description: '拥有6种武器',
    icon: '🗡️',
    category: 'collection',
    condition: (session) => session.uniqueWeapons >= 6,
    reward: { damageMult: 1.1 },
  },
  FULL_BUILD: {
    id: 'FULL_BUILD',
    name: '完美构建',
    description: '所有技能升到满级',
    icon: '✨',
    category: 'collection',
    condition: (session) => session.totalSkillLevels >= 42, // 7 skills × 6 levels
    reward: { damageMult: 1.15 },
  },

  // ═══════════════════════════════════════════════════════
  //  SCORE ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════
  HIGH_SCORE_10K: {
    id: 'HIGH_SCORE_10K',
    name: '小有成就',
    description: '单局得分超过10,000',
    icon: '🏅',
    category: 'score',
    condition: (session) => session.score >= 10000,
    reward: { expMult: 1.05 },
  },
  HIGH_SCORE_50K: {
    id: 'HIGH_SCORE_50K',
    name: '声名远扬',
    description: '单局得分超过50,000',
    icon: '🏆',
    category: 'score',
    condition: (session) => session.score >= 50000,
    reward: { expMult: 1.1 },
  },
  HIGH_SCORE_100K: {
    id: 'HIGH_SCORE_100K',
    name: '传说',
    description: '单局得分超过100,000',
    icon: '👑',
    category: 'score',
    condition: (session) => session.score >= 100000,
    reward: { damageMult: 1.15 },
  },
  MILLIONAIRE: {
    id: 'MILLIONAIRE',
    name: '百万富翁',
    description: '累计获得1,000,000分',
    icon: '💰',
    category: 'score',
    condition: (stats) => stats.totalScore >= 1000000,
    reward: { expMult: 1.2 },
  },

  // ═══════════════════════════════════════════════════════
  //  SPECIAL ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════
  SPEED_RUNNER: {
    id: 'SPEED_RUNNER',
    name: '速通大师',
    description: '3分钟内完成关卡',
    icon: '⚡',
    category: 'special',
    condition: (session) => session.mode === 'campaign' && session.won && session.time <= 180,
    reward: { speedBonus: 20 },
  },
  PACIFIST: {
    id: 'PACIFIST',
    name: '和平主义者',
    description: '不使用任何武器通关关卡',
    icon: '☮️',
    category: 'special',
    condition: (session) => session.mode === 'campaign' && session.won && session.kills === 0,
    reward: { hpBonus: 50 },
  },
  COMBO_MASTER: {
    id: 'COMBO_MASTER',
    name: '连击大师',
    description: '达成10连击',
    icon: '💥',
    category: 'special',
    condition: (session) => session.maxCombo >= 10,
    reward: { damageMult: 1.1 },
  },
};

// Achievement categories for display
export const ACHIEVEMENT_CATEGORIES = {
  combat: { name: '战斗', icon: '⚔️', order: 1 },
  survival: { name: '生存', icon: '❤️', order: 2 },
  collection: { name: '收集', icon: '💎', order: 3 },
  score: { name: '积分', icon: '🏆', order: 4 },
  special: { name: '特殊', icon: '⭐', order: 5 },
};

// Export to window for access in scenes
if (typeof window !== 'undefined') {
  window.ACHIEVEMENTS = ACHIEVEMENTS;
  window.ACHIEVEMENT_CATEGORIES = ACHIEVEMENT_CATEGORIES;
}
