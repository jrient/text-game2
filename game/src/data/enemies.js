export const ENEMIES = {
  SLIME: {
    id: 'SLIME', name: '史莱姆',
    bodyColor: 0x44dd44, eyeColor: 0xffffff,
    size: 14, hp: 30, speed: 60, damage: 8,
    expDrop: 2, scoreValue: 10, knockback: 80,
  },
  MUSHROOM: {
    id: 'MUSHROOM', name: '蘑菇怪',
    bodyColor: 0xcc7733, eyeColor: 0xffeecc,
    size: 16, hp: 55, speed: 45, damage: 14,
    expDrop: 3, scoreValue: 15, knockback: 60,
  },
  SKELETON: {
    id: 'SKELETON', name: '骷髅',
    bodyColor: 0xddddcc, eyeColor: 0xff4444,
    size: 16, hp: 75, speed: 80, damage: 18,
    expDrop: 4, scoreValue: 20, knockback: 100,
  },
  GHOST: {
    id: 'GHOST', name: '幽灵',
    bodyColor: 0x8899ff, eyeColor: 0xff8800,
    size: 18, hp: 65, speed: 95, damage: 16,
    expDrop: 5, scoreValue: 25, knockback: 120,
    alpha: 0.75,
  },
  FIRE_DEMON: {
    id: 'FIRE_DEMON', name: '火焰魔',
    bodyColor: 0xff5500, eyeColor: 0xffff00,
    size: 20, hp: 130, speed: 60, damage: 28,
    expDrop: 7, scoreValue: 35, knockback: 80,
  },
  ROCK_GOLEM: {
    id: 'ROCK_GOLEM', name: '岩石怪',
    bodyColor: 0x777777, eyeColor: 0xff2200,
    size: 26, hp: 220, speed: 38, damage: 40,
    expDrop: 10, scoreValue: 50, knockback: 40,
  },
  VOID_TENTACLE: {
    id: 'VOID_TENTACLE', name: '虚空触手',
    bodyColor: 0x770088, eyeColor: 0x00ffff,
    size: 18, hp: 160, speed: 85, damage: 32,
    expDrop: 8, scoreValue: 45, knockback: 90,
  },
  DESERT_WORM: {
    id: 'DESERT_WORM', name: '沙漠虫',
    bodyColor: 0xccaa44, eyeColor: 0xff0000,
    size: 15, hp: 45, speed: 70, damage: 12,
    expDrop: 3, scoreValue: 12, knockback: 70,
  },
  CHAOS_BODY: {
    id: 'CHAOS_BODY', name: '混沌体',
    bodyColor: 0x443366, eyeColor: 0xff66ff,
    size: 22, hp: 180, speed: 65, damage: 35,
    expDrop: 9, scoreValue: 48, knockback: 85,
  },
};

export const BOSSES = {
  TREE_SPIRIT: {
    id: 'TREE_SPIRIT', name: '树精Boss', isBoss: true,
    bodyColor: 0x226622, eyeColor: 0xff6600,
    size: 55, hp: 2000, speed: 50, damage: 40,
    expDrop: 100, scoreValue: 500, knockback: 20,
    phase2Threshold: 0.5, // triggers at 50% HP
  },
  SCORPION_KING: {
    id: 'SCORPION_KING', name: '沙漠蝎王', isBoss: true,
    bodyColor: 0xddaa33, eyeColor: 0xff0000,
    size: 60, hp: 3500, speed: 65, damage: 55,
    expDrop: 150, scoreValue: 750, knockback: 15,
    phase2Threshold: 0.5,
  },
  DARK_KNIGHT: {
    id: 'DARK_KNIGHT', name: '黑暗骑士', isBoss: true,
    bodyColor: 0x333366, eyeColor: 0x00ffff,
    size: 60, hp: 5000, speed: 75, damage: 65,
    expDrop: 200, scoreValue: 1000, knockback: 10,
    phase2Threshold: 0.5,
  },
  LAVA_GIANT: {
    id: 'LAVA_GIANT', name: '熔岩巨人', isBoss: true,
    bodyColor: 0xff3300, eyeColor: 0xffff00,
    size: 70, hp: 7000, speed: 48, damage: 75,
    expDrop: 250, scoreValue: 1500, knockback: 5,
    phase2Threshold: 0.5,
  },
  VOID_OVERLORD: {
    id: 'VOID_OVERLORD', name: '虚空霸主', isBoss: true,
    bodyColor: 0x440066, eyeColor: 0x00ff88,
    size: 78, hp: 10000, speed: 70, damage: 85,
    expDrop: 500, scoreValue: 3000, knockback: 5,
    phase2Threshold: 0.5,
  },
};
