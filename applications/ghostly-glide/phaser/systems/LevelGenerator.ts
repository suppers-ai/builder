export default class LevelGenerator {
  private scene: Phaser.Scene;
  
  // Safe jump distances based on physics - tuned for reachability
  private readonly MAX_JUMP_HEIGHT = 100;  // Single jump max height
  private readonly MAX_DOUBLE_HEIGHT = 180;  // Double jump max height
  private readonly MAX_HORIZONTAL = 180;  // Max horizontal distance
  private readonly MIN_VERTICAL_SPACING = 60;
  private readonly MAX_VERTICAL_SPACING = 90;
  private readonly MIN_PLATFORM_WIDTH = 100;
  private readonly MAX_PLATFORM_WIDTH = 200;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generateLevel(difficulty: number) {
    const levelHeight = 2500 + (difficulty * 500);
    const platforms: any[] = [];
    const checkpoints: any[] = [];
    const collectibles: any[] = [];
    
    // Starting platform - always solid and wide
    platforms.push({
      x: 400,
      y: levelHeight - 100,
      width: 300,
      type: 'solid'
    });
    
    // First checkpoint
    checkpoints.push({
      x: 400,
      y: levelHeight - 150
    });
    
    // Generate platforms going up with better spacing
    let currentY = levelHeight - 200;
    let lastX = 400;
    let platformCount = 0;
    let lastPlatformType = 'solid';
    
    while (currentY > 200) {
      platformCount++;
      
      // Calculate vertical spacing - ensure it's always reachable
      let verticalSpacing = Phaser.Math.Between(
        this.MIN_VERTICAL_SPACING,
        Math.min(this.MAX_VERTICAL_SPACING, this.MAX_JUMP_HEIGHT - 10)
      );
      
      // Calculate horizontal distance based on vertical spacing
      const maxHorizontalForHeight = Math.sqrt(
        Math.max(0, this.MAX_HORIZONTAL * this.MAX_HORIZONTAL - verticalSpacing * verticalSpacing)
      );
      
      // Determine if this should be a challenging jump
      const isChallengingJump = difficulty > 3 && Math.random() < 0.3;
      
      let horizontalDistance = 0;
      if (isChallengingJump) {
        // Challenging jump - requires good timing
        horizontalDistance = Phaser.Math.Between(100, Math.min(150, maxHorizontalForHeight));
        // If horizontal is far, reduce vertical
        if (horizontalDistance > 120) {
          verticalSpacing = Math.min(verticalSpacing, 70);
        }
      } else {
        // Normal jump - easily reachable
        horizontalDistance = Phaser.Math.Between(0, Math.min(100, maxHorizontalForHeight));
      }
      
      // Apply direction
      const direction = Math.random() > 0.5 ? 1 : -1;
      let currentX = lastX + (horizontalDistance * direction);
      
      // Keep within bounds
      currentX = Phaser.Math.Clamp(currentX, 100, 700);
      
      // If we hit the edge, place platform closer
      if (currentX === 100 || currentX === 700) {
        verticalSpacing = Math.min(verticalSpacing, 70);
      }
      
      // Move up by the calculated spacing
      currentY -= verticalSpacing;
      
      // Choose platform type with more variety
      const platformType = this.choosePlatformType(difficulty, platformCount, lastPlatformType);
      const platformWidth = this.getPlatformWidth(platformType.type, difficulty);
      
      platforms.push({
        x: currentX,
        y: currentY,
        width: platformWidth,
        type: platformType.type,
        movePattern: platformType.movePattern
      });
      
      lastPlatformType = platformType.type;
      
      // Add checkpoint every 5-7 platforms
      if (platformCount % Phaser.Math.Between(5, 7) === 0) {
        checkpoints.push({
          x: currentX,
          y: currentY - 50
        });
      }
      
      // Add collectibles with better placement
      if (Math.random() < 0.4) {
        // Place collectibles between platforms or above them
        if (Math.random() < 0.5) {
          // Above platform
          collectibles.push({
            x: currentX,
            y: currentY - 50
          });
        } else {
          // Between platforms
          collectibles.push({
            x: (currentX + lastX) / 2,
            y: currentY + verticalSpacing / 2
          });
        }
      }
      
      // Add hazards with strategic placement
      if (difficulty > 2 && Math.random() < (0.1 + difficulty * 0.02)) {
        const hazardX = currentX + Phaser.Math.Between(-150, 150);
        const hazardY = currentY + Phaser.Math.Between(-30, 30);
        
        // Don't place hazards too close to checkpoints
        const nearCheckpoint = checkpoints.some(cp => 
          Math.abs(cp.x - hazardX) < 100 && Math.abs(cp.y - hazardY) < 100
        );
        
        if (!nearCheckpoint) {
          platforms.push({
            x: hazardX,
            y: hazardY,
            width: 30,
            type: 'spike'
          });
        }
      }
      
      // Add helper platforms for difficult jumps
      if (isChallengingJump && horizontalDistance > 120) {
        // Add an intermediate platform
        platforms.push({
          x: (lastX + currentX) / 2,
          y: currentY + verticalSpacing / 2,
          width: 80,
          type: 'solid'
        });
      }
      
      // Add wall platforms for wall jumping
      if (difficulty > 3 && Math.random() < 0.15) {
        const wallSide = Math.random() > 0.5 ? 80 : 720;
        platforms.push({
          x: wallSide,
          y: currentY - 40,
          width: 60,
          type: 'solid'
        });
      }
      
      lastX = currentX;
    }
    
    // Final platform at top - make it rewarding
    platforms.push({
      x: 400,
      y: 100,
      width: 300,
      type: 'bouncy'
    });
    
    // Final checkpoint
    checkpoints.push({
      x: 400,
      y: 50
    });
    
    // Add some bonus collectibles at the top
    for (let i = 0; i < 3; i++) {
      collectibles.push({
        x: 300 + (i * 100),
        y: 60
      });
    }
    
    return {
      platforms,
      checkpoints,
      collectibles,
      levelHeight
    };
  }

  getPlatformWidth(type: string, difficulty: number): number {
    // Different platform types have different sizes
    switch(type) {
      case 'moving':
        return Phaser.Math.Between(100, 150);
      case 'crumbling':
        return Phaser.Math.Between(80, 120);
      case 'bouncy':
        return Phaser.Math.Between(100, 140);
      case 'ice':
        return Phaser.Math.Between(120, 180);
      case 'sticky':
        return Phaser.Math.Between(100, 150);
      default:
        return Phaser.Math.Between(
          this.MIN_PLATFORM_WIDTH - (difficulty * 2),
          this.MAX_PLATFORM_WIDTH - (difficulty * 10)
        );
    }
  }

  choosePlatformType(difficulty: number, platformNumber: number, lastType: string) {
    // More variety in platform types
    const types: Array<{type: string, movePattern: string | null, minDifficulty: number, chance: number}> = [
      { type: 'solid', movePattern: null, minDifficulty: 1, chance: 0.4 },
      { type: 'bouncy', movePattern: null, minDifficulty: 1, chance: 0.15 },
      { type: 'moving', movePattern: 'horizontal', minDifficulty: 2, chance: 0.15 },
      { type: 'moving', movePattern: 'vertical', minDifficulty: 2, chance: 0.1 },
      { type: 'crumbling', movePattern: null, minDifficulty: 3, chance: 0.1 },
      { type: 'ice', movePattern: null, minDifficulty: 4, chance: 0.08 },
      { type: 'sticky', movePattern: null, minDifficulty: 5, chance: 0.07 },
      { type: 'moving', movePattern: 'circular', minDifficulty: 6, chance: 0.05 }
    ];
    
    // Don't repeat the same special platform type twice in a row
    if (lastType !== 'solid') {
      types.find(t => t.type === lastType)!.chance *= 0.3;
    }
    
    // Filter by difficulty
    const availableTypes = types.filter(t => difficulty >= t.minDifficulty);
    
    // Start introducing special platforms earlier
    if (platformNumber < 3) {
      return { type: 'solid', movePattern: null };
    }
    
    // Guarantee some special platforms early on
    if (platformNumber === 3) {
      return { type: 'bouncy', movePattern: null };
    }
    
    if (platformNumber === 5 && difficulty >= 1) {
      return { type: 'moving', movePattern: 'horizontal' };
    }
    
    if (platformNumber === 8 && difficulty >= 2) {
      return { type: 'moving', movePattern: 'vertical' };
    }
    
    // Random selection based on chances
    const totalChance = availableTypes.reduce((sum, t) => sum + t.chance, 0);
    let random = Math.random() * totalChance;
    
    for (const platformType of availableTypes) {
      random -= platformType.chance;
      if (random <= 0) {
        return { 
          type: platformType.type, 
          movePattern: platformType.movePattern 
        };
      }
    }
    
    return { type: 'solid', movePattern: null };
  }
}