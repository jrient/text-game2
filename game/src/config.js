// Global game configuration
export const C = {
  // Canvas dimensions (portrait mobile)
  W: 390,
  H: 844,

  // World size (camera scrolls within)
  WORLD_W: 3000,
  WORLD_H: 3000,

  TILE: 48, // tile size in pixels

  // UI palette
  COL: {
    BG:       0x0a0a0f,
    PANEL:    0x111122,
    BORDER:   0x3355aa,
    TEXT:     0xeeeeff,
    GREEN:    0x44ff88,
    RED:      0xff4444,
    YELLOW:   0xffdd44,
    BLUE:     0x4488ff,
    PURPLE:   0xaa44ff,
    ORANGE:   0xff8833,
    CYAN:     0x44ffee,
    WHITE:    0xffffff,
    DARK:     0x080810,
  },

  // HP bar
  HP_BAR: { x: 10, y: 8, w: 180, h: 14 },
  EXP_BAR: { x: 10, y: 26, w: 370, h: 6 },

  // Physics
  PHYSICS: {
    gravity: { x: 0, y: 0 },
  },

  // Enemy spawn margin outside camera
  SPAWN_MARGIN: 60,

  // Max active entities
  MAX_ENEMIES: 250,
  MAX_ORBS: 300,
  MAX_BULLETS: 400,
};

// Pixel color palette (for programmatic pixel art)
export const PALETTE = {
  player: {
    body: 0x4488ff,
    outline: 0x2255bb,
    eye: 0xffffff,
    pupil: 0x000000,
    hair: 0xffaa44,
  },
};
