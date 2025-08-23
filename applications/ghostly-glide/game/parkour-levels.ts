import type { Level, Platform, Collectible, Vector2D } from "../types/game.ts";

export class ParkourLevelGenerator {
  private levels: Level[] = [];

  constructor() {
    this.generateAllLevels();
  }

  private generateAllLevels(): void {
    // Generate 10 increasingly difficult parkour levels
    for (let i = 1; i <= 10; i++) {
      this.levels.push(this.generateLevel(i));
    }
  }

  private generateLevel(levelNumber: number): Level {
    const difficulty = levelNumber;
    const platforms: Platform[] = [];
    const collectibles: Collectible[] = [];
    const checkpoints: Vector2D[] = [];
    
    // Level dimensions - taller levels as difficulty increases
    const levelHeight = 3000 + (difficulty * 1000);
    const levelWidth = 800;
    
    // Starting platform
    platforms.push({
      id: 'start-platform',
      position: { x: 400, y: levelHeight - 50 },
      velocity: { x: 0, y: 0 },
      width: 200,
      height: 20,
      active: true,
      type: 'solid',
      color: '#4a5568'
    });

    // Add checkpoint at start
    checkpoints.push({ x: 400, y: levelHeight - 100 });

    // Generate main parkour path
    let currentY = levelHeight - 200;
    let currentX = 400;
    const sectionHeight = 300;
    const numSections = Math.floor(levelHeight / sectionHeight);

    for (let section = 0; section < numSections; section++) {
      const sectionDifficulty = (section / numSections) * difficulty;
      
      // Add checkpoint every 3 sections
      if (section > 0 && section % 3 === 0) {
        checkpoints.push({ x: currentX, y: currentY });
      }

      // Choose section type based on difficulty
      const sectionType = this.chooseSectionType(sectionDifficulty);
      
      switch (sectionType) {
        case 'zigzag':
          this.createZigzagSection(platforms, currentX, currentY, sectionDifficulty);
          break;
        case 'wall_jump':
          this.createWallJumpSection(platforms, currentX, currentY, sectionDifficulty);
          break;
        case 'moving':
          this.createMovingPlatformSection(platforms, currentX, currentY, sectionDifficulty);
          break;
        case 'precision':
          this.createPrecisionSection(platforms, currentX, currentY, sectionDifficulty);
          break;
        case 'spiral':
          this.createSpiralSection(platforms, currentX, currentY, sectionDifficulty);
          break;
        case 'crumbling':
          this.createCrumblingSection(platforms, currentX, currentY, sectionDifficulty);
          break;
      }

      // Add collectibles in this section
      if (Math.random() > 0.3) {
        collectibles.push({
          id: `orb-${section}`,
          position: { 
            x: 200 + Math.random() * 400,
            y: currentY - Math.random() * 100
          },
          velocity: { x: 0, y: 0 },
          width: 20,
          height: 20,
          active: true,
          type: 'spirit_orb',
          value: 100 + difficulty * 10,
          collected: false
        });
      }

      currentY -= sectionHeight;
      // Vary X position for next section
      currentX = 200 + Math.random() * 400;
    }

    // Final platform at the top
    platforms.push({
      id: 'end-platform',
      position: { x: 400, y: 100 },
      velocity: { x: 0, y: 0 },
      width: 200,
      height: 20,
      active: true,
      type: 'solid',
      color: '#10b981' // Green for finish
    });

    // Add some hazards
    this.addHazards(platforms, levelHeight, difficulty);

    const levelNames = [
      "The First Ascent",
      "Vertical Challenge",
      "Sky Parkour",
      "Wall Runner's Dream",
      "Precision Heights",
      "The Gauntlet",
      "Aerial Acrobatics",
      "Master's Path",
      "Impossible Climb",
      "Ghost's Peak"
    ];

    return {
      id: levelNumber,
      name: levelNames[levelNumber - 1] || `Level ${levelNumber}`,
      background: `level${levelNumber}`,
      platforms,
      collectibles,
      checkpoints,
      spawnPoint: { x: 400, y: levelHeight - 100 },
      exitPoint: { x: 400, y: 50 },
      width: levelWidth,
      height: levelHeight
    };
  }

  private chooseSectionType(difficulty: number): string {
    const types = ['zigzag', 'wall_jump', 'moving', 'precision', 'spiral', 'crumbling'];
    if (difficulty < 2) {
      return types[Math.floor(Math.random() * 2)]; // Only zigzag and wall_jump for easy
    } else if (difficulty < 5) {
      return types[Math.floor(Math.random() * 4)]; // Add moving and precision
    } else {
      return types[Math.floor(Math.random() * types.length)]; // All types for hard
    }
  }

  private createZigzagSection(platforms: Platform[], startX: number, startY: number, difficulty: number): void {
    const numPlatforms = 4 + Math.floor(difficulty);
    let x = startX;
    let y = startY;

    for (let i = 0; i < numPlatforms; i++) {
      // Alternate left and right
      x = i % 2 === 0 ? 200 : 600;
      y -= 50 + Math.random() * 30;

      platforms.push({
        id: `zigzag-${Date.now()}-${i}`,
        position: { x, y },
        velocity: { x: 0, y: 0 },
        width: 80 - difficulty * 5, // Smaller platforms as difficulty increases
        height: 15,
        active: true,
        type: 'solid',
        color: '#4a5568'
      });
    }
  }

  private createWallJumpSection(platforms: Platform[], startX: number, startY: number, difficulty: number): void {
    // Create two walls for wall jumping
    const wallHeight = 200 + difficulty * 20;
    const gap = 150 - difficulty * 10; // Narrower gap as difficulty increases

    // Left wall
    platforms.push({
      id: `wall-left-${Date.now()}`,
      position: { x: startX - gap / 2, y: startY - wallHeight / 2 },
      velocity: { x: 0, y: 0 },
      width: 20,
      height: wallHeight,
      active: true,
      type: 'solid',
      color: '#4a5568'
    });

    // Right wall
    platforms.push({
      id: `wall-right-${Date.now()}`,
      position: { x: startX + gap / 2, y: startY - wallHeight / 2 },
      velocity: { x: 0, y: 0 },
      width: 20,
      height: wallHeight,
      active: true,
      type: 'solid',
      color: '#4a5568'
    });

    // Platform at top
    platforms.push({
      id: `wall-top-${Date.now()}`,
      position: { x: startX, y: startY - wallHeight - 20 },
      velocity: { x: 0, y: 0 },
      width: 100,
      height: 15,
      active: true,
      type: 'solid',
      color: '#4a5568'
    });
  }

  private createMovingPlatformSection(platforms: Platform[], startX: number, startY: number, difficulty: number): void {
    const numPlatforms = 3 + Math.floor(difficulty / 2);

    for (let i = 0; i < numPlatforms; i++) {
      const y = startY - (i * 60);
      const moveRadius = 100 + difficulty * 20;
      const speed = 0.5 + difficulty * 0.1;

      platforms.push({
        id: `moving-${Date.now()}-${i}`,
        position: { x: startX, y },
        velocity: { x: 0, y: 0 },
        width: 70,
        height: 15,
        active: true,
        type: 'moving',
        color: '#805ad5', // Purple for moving
        pattern: i % 2 === 0 ? 'horizontal' : 'vertical',
        patternData: {
          centerX: startX,
          centerY: y,
          radius: moveRadius,
          speed: speed
        }
      });
    }
  }

  private createPrecisionSection(platforms: Platform[], startX: number, startY: number, difficulty: number): void {
    // Small platforms requiring precise jumps
    const numPlatforms = 5 + Math.floor(difficulty);
    
    for (let i = 0; i < numPlatforms; i++) {
      const angle = (i / numPlatforms) * Math.PI;
      const radius = 150;
      const x = startX + Math.cos(angle) * radius;
      const y = startY - (i * 40);

      platforms.push({
        id: `precision-${Date.now()}-${i}`,
        position: { x, y },
        velocity: { x: 0, y: 0 },
        width: 40 - difficulty * 2, // Very small platforms
        height: 10,
        active: true,
        type: 'solid',
        color: '#f59e0b' // Amber for precision
      });
    }
  }

  private createSpiralSection(platforms: Platform[], startX: number, startY: number, difficulty: number): void {
    const numPlatforms = 8 + Math.floor(difficulty);
    const radius = 150;
    
    for (let i = 0; i < numPlatforms; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = startX + Math.cos(angle) * radius;
      const y = startY - (i * 30);

      platforms.push({
        id: `spiral-${Date.now()}-${i}`,
        position: { x, y },
        velocity: { x: 0, y: 0 },
        width: 60,
        height: 12,
        active: true,
        type: i % 3 === 0 ? 'bouncy' : 'solid',
        color: i % 3 === 0 ? '#10b981' : '#4a5568',
        bounceForce: 600
      });
    }
  }

  private createCrumblingSection(platforms: Platform[], startX: number, startY: number, difficulty: number): void {
    // Platforms that fall after stepping on them
    const numPlatforms = 4 + Math.floor(difficulty / 2);
    
    for (let i = 0; i < numPlatforms; i++) {
      const x = startX + (Math.random() - 0.5) * 300;
      const y = startY - (i * 60);

      platforms.push({
        id: `crumbling-${Date.now()}-${i}`,
        position: { x, y },
        velocity: { x: 0, y: 0 },
        width: 80,
        height: 15,
        active: true,
        type: 'crumbling',
        color: '#ef4444' // Red for danger
      });
    }
  }

  private addHazards(platforms: Platform[], levelHeight: number, difficulty: number): void {
    const numSpikes = difficulty * 3;
    
    for (let i = 0; i < numSpikes; i++) {
      const x = 100 + Math.random() * 600;
      const y = 200 + Math.random() * (levelHeight - 400);

      platforms.push({
        id: `spike-${Date.now()}-${i}`,
        position: { x, y },
        velocity: { x: 0, y: 0 },
        width: 30,
        height: 30,
        active: true,
        type: 'spike',
        color: '#dc2626' // Red for danger
      });
    }
  }

  public getLevel(levelNumber: number): Level | null {
    if (levelNumber < 1 || levelNumber > this.levels.length) {
      return null;
    }
    // Return a deep copy to prevent modification
    const level = this.levels[levelNumber - 1];
    return JSON.parse(JSON.stringify(level));
  }

  public getTotalLevels(): number {
    return this.levels.length;
  }
}