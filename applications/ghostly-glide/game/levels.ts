import type { Level, Obstacle, Collectible } from "../types/game.ts";

export class LevelGenerator {
  private levels: Level[] = [];

  constructor() {
    this.generateAllLevels();
  }

  private generateAllLevels(): void {
    // Generate 10 progressively harder levels
    for (let i = 1; i <= 10; i++) {
      this.levels.push(this.generateLevel(i));
    }
  }

  private generateLevel(levelNumber: number): Level {
    const difficulty = levelNumber;
    const obstacles: Obstacle[] = [];
    const collectibles: Collectible[] = [];
    
    // Level gets taller as difficulty increases
    const levelHeight = 2000 + (difficulty * 500);
    
    // Calculate level parameters based on difficulty
    const numStaticObstacles = 5 + Math.floor(difficulty * 2);
    const numDynamicObstacles = 2 + Math.floor(difficulty * 1.5);
    const numSpookyZones = 1 + Math.floor(difficulty * 0.5);
    const numOrbs = 8 + Math.floor(difficulty * 1.5);
    const requiredOrbs = 5 + Math.floor(difficulty * 0.5);

    // Generate static obstacles throughout the level height
    for (let i = 0; i < numStaticObstacles; i++) {
      const yPosition = 200 + (i * (levelHeight - 400) / numStaticObstacles);
      obstacles.push({
        id: `static-${levelNumber}-${i}`,
        position: {
          x: 100 + Math.random() * 600,
          y: yPosition + Math.random() * 100 - 50
        },
        velocity: { x: 0, y: 0 },
        width: 60 + Math.random() * 40,
        height: 20,
        active: true,
        type: 'static',
        damage: 1
      });
    }

    // Generate dynamic obstacles distributed throughout level
    for (let i = 0; i < numDynamicObstacles; i++) {
      const pattern = ['horizontal', 'vertical', 'circular'][Math.floor(Math.random() * 3)] as 'horizontal' | 'vertical' | 'circular';
      const yPosition = 300 + (i * (levelHeight - 600) / numDynamicObstacles);
      const obstacle: Obstacle = {
        id: `dynamic-${levelNumber}-${i}`,
        position: {
          x: 100 + Math.random() * 600,
          y: yPosition + Math.random() * 200
        },
        velocity: {
          x: pattern === 'horizontal' ? (Math.random() > 0.5 ? 1 : -1) : 0,
          y: pattern === 'vertical' ? (Math.random() > 0.5 ? 1 : -1) : 0
        },
        width: 40 + Math.random() * 30,
        height: 40 + Math.random() * 30,
        active: true,
        type: 'dynamic',
        damage: 1,
        pattern
      };

      if (pattern === 'circular') {
        obstacle.patternData = {
          centerX: obstacle.position.x,
          centerY: obstacle.position.y,
          radius: 30 + Math.random() * 50,
          speed: 0.5 + Math.random() * 1.5
        };
      }

      obstacles.push(obstacle);
    }

    // Generate spooky zones distributed vertically
    for (let i = 0; i < numSpookyZones; i++) {
      const yPosition = 400 + (i * (levelHeight - 800) / numSpookyZones);
      obstacles.push({
        id: `spooky-${levelNumber}-${i}`,
        position: {
          x: 100 + Math.random() * 600,
          y: yPosition + Math.random() * 200
        },
        velocity: { x: 0, y: 0 },
        width: 100 + Math.random() * 100,
        height: 80 + Math.random() * 80,
        active: true,
        type: 'spooky_zone',
        damage: 0
      });
    }

    // Generate spirit orbs throughout the level
    for (let i = 0; i < numOrbs; i++) {
      const yPosition = 100 + (i * (levelHeight - 200) / numOrbs);
      collectibles.push({
        id: `orb-${levelNumber}-${i}`,
        position: {
          x: 50 + Math.random() * 700,
          y: yPosition + Math.random() * 100
        },
        velocity: { x: 0, y: 0 },
        width: 20,
        height: 20,
        active: true,
        type: 'spirit_orb',
        value: 100 + levelNumber * 10,
        collected: false
      });
    }

    // Add special collectibles near the middle of the level
    if (Math.random() > 0.5) {
      collectibles.push({
        id: `pearl-${levelNumber}`,
        position: {
          x: 100 + Math.random() * 600,
          y: levelHeight / 2 + Math.random() * 200 - 100
        },
        velocity: { x: 0, y: 0 },
        width: 30,
        height: 30,
        active: true,
        type: 'poltergeist_pearl',
        value: 500 + levelNumber * 50,
        collected: false
      });
    }

    // Add power-ups distributed through the level
    const powerUpTypes: Array<'speed_boost' | 'invincibility' | 'extra_life'> = ['speed_boost', 'invincibility', 'extra_life'];
    const numPowerUps = Math.min(3, 1 + Math.floor(difficulty * 0.3));
    for (let i = 0; i < numPowerUps; i++) {
      const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const yPosition = 200 + (i * (levelHeight - 400) / numPowerUps);
      collectibles.push({
        id: `powerup-${levelNumber}-${i}`,
        position: {
          x: 100 + Math.random() * 600,
          y: yPosition + Math.random() * 200
        },
        velocity: { x: 0, y: 0 },
        width: 25,
        height: 25,
        active: true,
        type: powerUpType,
        value: 0,
        collected: false
      });
    }

    const levelNames = [
      "Haunted Mansion Entry",
      "The Creaky Corridor",
      "Phantom's Parlor",
      "Spectral Staircase",
      "Ghoulish Gallery",
      "Ethereal Attic",
      "Cursed Cellar",
      "Wraith's Workshop",
      "Poltergeist Plaza",
      "Spirit King's Throne"
    ];

    return {
      id: levelNumber,
      name: levelNames[levelNumber - 1] || `Level ${levelNumber}`,
      background: `level${levelNumber}`,
      spawnPoint: { x: 400, y: levelHeight - 100 },
      exitPoint: { x: 400, y: 100 },
      width: 800,
      height: levelHeight,
      requiredOrbs,
      obstacles,
      collectibles
    };
  }

  public getLevel(levelNumber: number): Level | null {
    if (levelNumber < 1 || levelNumber > this.levels.length) {
      return null;
    }
    // Return a deep copy to prevent modification of the original
    const level = this.levels[levelNumber - 1];
    return JSON.parse(JSON.stringify(level));
  }

  public getTotalLevels(): number {
    return this.levels.length;
  }
}