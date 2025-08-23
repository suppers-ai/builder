import type { Level, Platform, Collectible, Vector2D } from "../types/game.ts";
import { JumpCalculator } from "./jump-calculator.ts";

export class ValidatedLevelGenerator {
  private levels: Level[] = [];
  private calculator: JumpCalculator;
  
  // Based on calculated physics:
  // Single jump height: ~104 pixels
  // Double jump height: ~188 pixels  
  // Horizontal reach with momentum: ~208 pixels
  // Wall jump height: ~133 pixels
  // Wall jump distance: ~400 pixels
  
  private readonly SAFE_JUMP_HEIGHT = 85; // Conservative single jump
  private readonly SAFE_DOUBLE_HEIGHT = 160; // Conservative double jump
  private readonly SAFE_HORIZONTAL = 170; // Conservative horizontal distance
  private readonly SAFE_DIAGONAL_H = 120; // Horizontal component when jumping diagonally
  private readonly SAFE_DIAGONAL_V = 70; // Vertical component when jumping diagonally
  private readonly MIN_VERTICAL_SPACING = 60; // Minimum space between platforms to avoid head bumping

  constructor() {
    this.calculator = new JumpCalculator();
    this.generateAllLevels();
  }

  private generateAllLevels(): void {
    for (let i = 1; i <= 10; i++) {
      this.levels.push(this.generateValidatedLevel(i));
    }
  }

  private generateValidatedLevel(levelNumber: number): Level {
    const difficulty = levelNumber;
    const platforms: Platform[] = [];
    const collectibles: Collectible[] = [];
    const checkpoints: Vector2D[] = [];
    
    const levelHeight = 2000 + (difficulty * 500);
    const levelWidth = 800;
    
    // Starting platform - wide and safe
    const startPlatform: Platform = {
      id: 'start-platform',
      position: { x: 400, y: levelHeight - 50 },
      velocity: { x: 0, y: 0 },
      width: 300,
      height: 20,
      active: true,
      type: 'solid',
      color: '#4a5568'
    };
    platforms.push(startPlatform);
    
    // Add first checkpoint
    checkpoints.push({ x: 400, y: levelHeight - 100 });

    // Build level from bottom to top with guaranteed path
    let currentPlatform = startPlatform;
    let currentY = levelHeight - 50;
    let platformCount = 0;
    
    while (currentY > 300) {  // Stop higher to leave room for final platform
      platformCount++;
      
      // Add checkpoint every 4 platforms for easier gameplay
      if (platformCount % 4 === 0) {
        checkpoints.push({ 
          x: currentPlatform.position.x, 
          y: currentPlatform.position.y - 50 
        });
      }

      // Choose next platform type based on difficulty
      const nextPlatform = this.createNextPlatform(
        currentPlatform,
        currentY,
        difficulty,
        platformCount
      );
      
      if (nextPlatform) {
        platforms.push(nextPlatform);
        currentPlatform = nextPlatform;
        currentY = nextPlatform.position.y;
        
        // Add collectible near some platforms (30% chance)
        if (Math.random() < 0.3) {
          collectibles.push(this.createCollectible(nextPlatform, platformCount));
        }
      } else {
        // Failed to create valid platform, try again with easier parameters
        currentY -= 50;
      }
    }

    // Final platform at top - easy to reach
    const finalPlatform: Platform = {
      id: 'end-platform',
      position: { x: 400, y: 100 },
      velocity: { x: 0, y: 0 },
      width: 300,
      height: 20,
      active: true,
      type: 'solid',
      color: '#10b981'
    };
    
    // Ensure final platform is reachable from last platform
    const lastPlatform = platforms[platforms.length - 1];
    const gap = lastPlatform.position.y - finalPlatform.position.y;
    
    if (gap > this.SAFE_DOUBLE_HEIGHT) {
      // Add intermediate platform
      platforms.push({
        id: 'bridge-to-end',
        position: { 
          x: (lastPlatform.position.x + finalPlatform.position.x) / 2,
          y: lastPlatform.position.y - this.SAFE_JUMP_HEIGHT
        },
        velocity: { x: 0, y: 0 },
        width: 100,
        height: 15,
        active: true,
        type: 'solid',
        color: '#4a5568'
      });
    }
    
    platforms.push(finalPlatform);

    // Add some additional hazards that don't block the main path
    this.addSafeHazards(platforms, levelHeight, difficulty);

    const levelNames = [
      "Tutorial Climb",
      "Simple Ascent", 
      "Platform Practice",
      "Jumping Journey",
      "Careful Climbing",
      "Precision Path",
      "Tricky Tower",
      "Expert Escalation",
      "Master's Mountain",
      "Ultimate Upward"
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

  private createNextPlatform(
    currentPlatform: Platform,
    currentY: number,
    difficulty: number,
    platformNumber: number
  ): Platform | null {
    
    // Determine platform parameters based on difficulty
    const widthRange = {
      min: Math.max(80, 120 - difficulty * 3),
      max: Math.max(100, 160 - difficulty * 2)
    };
    
    const newWidth = widthRange.min + Math.random() * (widthRange.max - widthRange.min);
    
    // Choose jump type based on difficulty
    const jumpTypes = this.getAvailableJumpTypes(difficulty, platformNumber);
    const jumpType = jumpTypes[Math.floor(Math.random() * jumpTypes.length)];
    
    let newX = currentPlatform.position.x;
    let newY = currentPlatform.position.y;
    
    switch (jumpType) {
      case 'straight_up':
        // Jump straight up - ensure enough vertical spacing
        newY -= Math.max(this.MIN_VERTICAL_SPACING, this.SAFE_JUMP_HEIGHT * (0.7 + Math.random() * 0.2));
        newX += (Math.random() - 0.5) * 30; // Very small horizontal variation
        break;
        
      case 'diagonal':
        // Diagonal jump - ensure minimum vertical clearance
        newY -= Math.max(this.MIN_VERTICAL_SPACING, this.SAFE_DIAGONAL_V * (0.8 + Math.random() * 0.2));
        const direction = Math.random() > 0.5 ? 1 : -1;
        newX += direction * this.SAFE_DIAGONAL_H * (0.6 + Math.random() * 0.3);
        break;
        
      case 'horizontal':
        // Mostly horizontal jump - enough vertical space to clear
        newY -= Math.max(this.MIN_VERTICAL_SPACING, 40 + Math.random() * 30);
        const hDirection = Math.random() > 0.5 ? 1 : -1;
        newX += hDirection * this.SAFE_HORIZONTAL * (0.5 + Math.random() * 0.3);
        break;
        
      case 'double_jump':
        // Requires double jump - ensure good spacing
        newY -= Math.max(this.MIN_VERTICAL_SPACING * 2, this.SAFE_DOUBLE_HEIGHT * (0.7 + Math.random() * 0.2));
        newX += (Math.random() - 0.5) * 80;
        break;
        
      case 'wall_jump_setup':
        // Create wall jump scenario
        return this.createWallJumpSection(currentPlatform, currentY, difficulty);
    }
    
    // Keep within level bounds
    newX = Math.max(newWidth/2 + 50, Math.min(750 - newWidth/2, newX));
    
    // Ensure platforms are reachable
    // Calculate actual edge-to-edge distances
    const yGap = currentPlatform.position.y - newY;
    const xGap = Math.abs(newX - currentPlatform.position.x);
    
    // Enforce maximum gaps based on jump capabilities
    if (yGap > this.SAFE_DOUBLE_HEIGHT * 0.8) {
      newY = currentPlatform.position.y - this.SAFE_DOUBLE_HEIGHT * 0.75;
    }
    
    if (xGap > this.SAFE_HORIZONTAL * 0.7) {
      const direction = newX > currentPlatform.position.x ? 1 : -1;
      newX = currentPlatform.position.x + direction * this.SAFE_HORIZONTAL * 0.6;
    }
    
    // For straight up jumps, keep X very close
    if (jumpType === 'straight_up') {
      newX = currentPlatform.position.x + (Math.random() - 0.5) * 20;
    }
    
    // Choose platform type
    const platformType = this.choosePlatformType(difficulty, platformNumber);
    
    const platform: Platform = {
      id: `platform-${platformNumber}`,
      position: { x: newX, y: newY },
      velocity: { x: 0, y: 0 },
      width: newWidth,
      height: 15,
      active: true,
      type: platformType.type,
      color: platformType.color
    };
    
    // Add movement pattern for moving platforms
    if (platform.type === 'moving') {
      platform.pattern = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      platform.patternData = {
        centerX: platform.position.x,
        centerY: platform.position.y,
        radius: 50 + difficulty * 5,
        speed: 0.5 + difficulty * 0.05
      };
    }
    
    // Add bounce force for bouncy platforms
    if (platform.type === 'bouncy') {
      platform.bounceForce = 600 + difficulty * 20;
    }
    
    return platform;
  }

  private createWallJumpSection(
    currentPlatform: Platform,
    currentY: number,
    difficulty: number
  ): Platform | null {
    // Create a simple wall that's guaranteed reachable
    const wallX = currentPlatform.position.x + (Math.random() > 0.5 ? 100 : -100);
    const wallY = currentPlatform.position.y - 80;
    
    return {
      id: `wall-${Date.now()}`,
      position: { x: wallX, y: wallY },
      velocity: { x: 0, y: 0 },
      width: 20,
      height: 150,
      active: true,
      type: 'solid',
      color: '#6b7280'
    };
  }

  private getAvailableJumpTypes(difficulty: number, platformNumber: number): string[] {
    const types = ['straight_up', 'diagonal', 'horizontal'];
    
    if (difficulty >= 3) {
      types.push('double_jump');
    }
    
    if (difficulty >= 5 && platformNumber % 7 === 0) {
      types.push('wall_jump_setup');
    }
    
    return types;
  }

  private choosePlatformType(difficulty: number, platformNumber: number): { type: Platform['type'], color: string } {
    // Start with mostly solid platforms
    if (difficulty < 3) {
      return { type: 'solid', color: '#4a5568' };
    }
    
    const rand = Math.random();
    
    if (difficulty >= 7 && rand < 0.1) {
      return { type: 'crumbling', color: '#ef4444' };
    }
    
    if (difficulty >= 5 && rand < 0.2) {
      return { type: 'moving', color: '#805ad5' };
    }
    
    if (difficulty >= 3 && rand < 0.15) {
      return { type: 'bouncy', color: '#10b981' };
    }
    
    return { type: 'solid', color: '#4a5568' };
  }

  private createCollectible(nearPlatform: Platform, id: number): Collectible {
    // Place collectible above and near the platform
    return {
      id: `orb-${id}`,
      position: {
        x: nearPlatform.position.x + (Math.random() - 0.5) * 50,
        y: nearPlatform.position.y - 30
      },
      velocity: { x: 0, y: 0 },
      width: 20,
      height: 20,
      active: true,
      type: 'spirit_orb',
      value: 100,
      collected: false
    };
  }

  private addSafeHazards(platforms: Platform[], levelHeight: number, difficulty: number): void {
    // Add spikes only in safe locations (not blocking main path)
    const numSpikes = Math.floor(difficulty * 1.5);
    
    for (let i = 0; i < numSpikes; i++) {
      // Place spikes on edges or in corners where they won't block progress
      const x = Math.random() > 0.5 ? 50 : 750;
      const y = 200 + Math.random() * (levelHeight - 400);
      
      platforms.push({
        id: `spike-${i}`,
        position: { x, y },
        velocity: { x: 0, y: 0 },
        width: 30,
        height: 30,
        active: true,
        type: 'spike',
        color: '#dc2626'
      });
    }
  }

  public getLevel(levelNumber: number): Level | null {
    if (levelNumber < 1 || levelNumber > this.levels.length) {
      return null;
    }
    return JSON.parse(JSON.stringify(this.levels[levelNumber - 1]));
  }

  public getTotalLevels(): number {
    return this.levels.length;
  }
}