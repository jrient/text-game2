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

  // ═══════════════════════════════════════════════════════
  //  PLAYER CONSTANTS
  // ═══════════════════════════════════════════════════════
  PLAYER: {
    BASE_HP: 100,
    BASE_SPEED: 150,
    BASE_PICKUP_RANGE: 80,
    BODY_WIDTH: 20,
    BODY_HEIGHT: 28,
    BODY_OFFSET_X: 6,
    BODY_OFFSET_Y: 4,
    SHADOW_WIDTH: 24,
    SHADOW_HEIGHT: 8,
    SHADOW_OFFSET_Y: 14,
    INVINCIBLE_TIME: 800,
    HURT_FLASH_ALPHA: 0.3,
    HURT_FLASH_DURATION: 80,
    HURT_FLASH_REPEAT: 3,
  },

  // ═══════════════════════════════════════════════════════
  //  COMBAT CONSTANTS
  // ═══════════════════════════════════════════════════════
  COMBAT: {
    HIT_PARTICLE_COUNT: 4,
    HIT_PARTICLE_SIZE: 4,
    HIT_PARTICLE_MIN_SPEED: 40,
    HIT_PARTICLE_MAX_SPEED: 100,
    HIT_PARTICLE_MIN_DURATION: 200,
    HIT_PARTICLE_MAX_DURATION: 400,
    DAMAGE_NUMBER_FONT_SIZE: 8,
    DAMAGE_NUMBER_RISE: 28,
    DAMAGE_NUMBER_DURATION: 700,
  },

  // ═══════════════════════════════════════════════════════
  //  VISUAL EFFECTS
  // ═══════════════════════════════════════════════════════
  FX: {
    EXPLOSION_LINE_WIDTH: 3,
    EXPLOSION_START_RADIUS: 4,
    EXPLOSION_DURATION: 300,
    EXPLOSION_ALPHA: 0.9,
  },

  // ═══════════════════════════════════════════════════════
  //  OBJECT POOL
  // ═══════════════════════════════════════════════════════
  POOL: {
    PARTICLE_SIZE: 50,
    DAMAGE_TEXT_SIZE: 30,
    EXPLOSION_SIZE: 10,
  },

  // ═══════════════════════════════════════════════════════
  //  JOYSTICK
  // ═══════════════════════════════════════════════════════
  JOYSTICK: {
    SIZE: 120,
    ZONE_SIZE: 140,
    COLOR: 'rgba(68, 255, 136, 0.4)',
    OFFSET: 90,
  },

  // ═══════════════════════════════════════════════════════
  //  ENEMY
  // ═══════════════════════════════════════════════════════
  ENEMY: {
    HP_BAR_WIDTH: 28,
    HP_BAR_HEIGHT: 4,
    HP_BAR_OFFSET_Y: 8,
    HIT_FLASH_ALPHA: 0.4,
    HIT_FLASH_DURATION: 60,
    KNOCKBACK_DECAY: 0.92,
    BOSS_PHASE2_HP_THRESHOLD: 0.5,
    BOSS_PHASE2_SPEED_MULT: 1.4,
    BOSS_PHASE2_DMG_MULT: 1.3,
    BOSS_PHASE2_TINT: 0xff6600,
  },

  // ═══════════════════════════════════════════════════════
  //  ROTATING AXE
  // ═══════════════════════════════════════════════════════
  AXE: {
    WIDTH: 20,
    HEIGHT: 10,
    GLOW_WIDTH: 24,
    GLOW_HEIGHT: 14,
    GLOW_COLOR: 0xff8800,
    GLOW_ALPHA: 0.3,
    HIT_RADIUS: 30,
    HIT_COOLDOWN: 450,
    CHECK_RANGE_BUFFER: 60,
  },
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
