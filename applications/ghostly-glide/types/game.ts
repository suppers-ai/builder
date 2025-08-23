export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  active: boolean;
}

export interface Ghost extends GameObject {
  health: number;
  grounded: boolean;
  jumpCount: number;
  maxJumps: number;
  wallSliding: boolean;
  facingRight: boolean;
  trail: Vector2D[];
  lastGroundedPosition: Vector2D;
}

export interface Platform extends GameObject {
  type: 'solid' | 'moving' | 'crumbling' | 'bouncy' | 'spike';
  color?: string;
  pattern?: 'horizontal' | 'vertical' | 'circular' | 'patrol';
  patternData?: any;
  crumbleTimer?: number;
  bounceForce?: number;
}

export interface Collectible extends GameObject {
  type: 'spirit_orb' | 'poltergeist_pearl' | 'speed_boost' | 'invincibility' | 'extra_life';
  value: number;
  collected: boolean;
}

export interface Level {
  id: number;
  name: string;
  background: string;
  platforms: Platform[];
  collectibles: Collectible[];
  checkpoints: Vector2D[];
  spawnPoint: Vector2D;
  exitPoint: Vector2D;
  width: number;
  height: number;
  deathZones?: GameObject[];
}

export interface GameState {
  currentLevel: number;
  score: number;
  lives: number;
  orbsCollected: number;
  combo: number;
  maxCombo: number;
  gameOver: boolean;
  paused: boolean;
  victory: boolean;
  highScore: number;
  powerUps: {
    speed: number;
    invincibility: number;
  };
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
  dash: boolean;
  pause: boolean;
}