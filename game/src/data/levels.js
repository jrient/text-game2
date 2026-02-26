export const LEVELS = [
  {
    id: 1, name: '像素森林', bgColor: 0x1a3010,
    tileColors: [0x2d5020, 0x3a6528, 0x254018],
    duration: 180, bossTime: 150,
    enemies: ['SLIME', 'MUSHROOM'],
    boss: 'TREE_SPIRIT',
    waveConfig: { baseCount: 4, countGrowth: 0.3, interval: 4000, minInterval: 2000 },
    description: '邪恶的生物潜伏在像素森林中...',
    starConditions: { time: 120, noHit: false, kills: 50 },
  },
  {
    id: 2, name: '沙漠遗迹', bgColor: 0x3a2a10,
    tileColors: [0x5a4020, 0x6a5030, 0x483218],
    duration: 240, bossTime: 210,
    enemies: ['DESERT_WORM', 'SKELETON'],
    boss: 'SCORPION_KING',
    waveConfig: { baseCount: 5, countGrowth: 0.35, interval: 3500, minInterval: 1800 },
    description: '沙漠遗迹中的亡灵誓死守护秘密...',
    starConditions: { time: 180, noHit: false, kills: 80 },
  },
  {
    id: 3, name: '幽灵城堡', bgColor: 0x10101a,
    tileColors: [0x202035, 0x2a2a45, 0x18182a],
    duration: 240, bossTime: 210,
    enemies: ['GHOST', 'SKELETON'],
    boss: 'DARK_KNIGHT',
    waveConfig: { baseCount: 5, countGrowth: 0.4, interval: 3200, minInterval: 1600 },
    description: '黑暗骑士统治着这座城堡...',
    starConditions: { time: 180, noHit: false, kills: 100 },
  },
  {
    id: 4, name: '熔岩洞窟', bgColor: 0x1a0500,
    tileColors: [0x3a1000, 0x4a1800, 0x280800],
    duration: 300, bossTime: 270,
    enemies: ['FIRE_DEMON', 'ROCK_GOLEM'],
    boss: 'LAVA_GIANT',
    waveConfig: { baseCount: 6, countGrowth: 0.45, interval: 3000, minInterval: 1400 },
    description: '熔岩巨人在此等待勇者的挑战...',
    starConditions: { time: 240, noHit: false, kills: 130 },
  },
  {
    id: 5, name: '虚空领域', bgColor: 0x08000f,
    tileColors: [0x14001e, 0x1a002a, 0x0e0016],
    duration: 300, bossTime: 270,
    enemies: ['VOID_TENTACLE', 'CHAOS_BODY', 'GHOST'],
    boss: 'VOID_OVERLORD',
    waveConfig: { baseCount: 7, countGrowth: 0.5, interval: 2500, minInterval: 1200 },
    description: '最终考验——虚空霸主的领域...',
    starConditions: { time: 240, noHit: false, kills: 160 },
  },
];

// Player level-up EXP requirements
export const EXP_TABLE = [
  0, 10, 25, 45, 70, 100, 135, 175, 220, 270,
  325, 390, 465, 550, 645, 750, 865, 990, 1125, 1270,
  1430, 1610, 1810, 2030, 2270, 2530, 2810, 3110, 3430, 3770,
];

// Endless mode config
export const ENDLESS_CONFIG = {
  baseInterval: 4000,
  minInterval: 700,
  intervalDecrement: 15,
  baseCount: 3,
  countIncrement: 0.15,
  allEnemyTypes: ['SLIME', 'MUSHROOM', 'SKELETON', 'GHOST', 'FIRE_DEMON', 'ROCK_GOLEM', 'VOID_TENTACLE', 'DESERT_WORM', 'CHAOS_BODY'],
  bosses: ['TREE_SPIRIT', 'SCORPION_KING', 'DARK_KNIGHT', 'LAVA_GIANT', 'VOID_OVERLORD'],
  eliteEvery: 10,
  bossEvery: 20,
};
