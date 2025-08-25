import Player from '../sprites/Player';
import Platform, { PlatformType } from '../sprites/Platform';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.Group;
  private collectibles!: Phaser.Physics.Arcade.Group;
  
  // Game state
  private score: number = 0;
  private highScore: number = 0;
  private lives: number = 3;
  private gameOver: boolean = false;
  private isPaused: boolean = false;
  
  // Platform generation
  private lastPlatformY: number = 0;
  private platformPool: Platform[] = [];
  private activePlatforms: Platform[] = [];
  
  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  
  // Camera
  private minCameraY: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Get high score
    this.highScore = this.registry.get('highScore') || 0;
    
    // Create background
    this.createBackground();
    
    // Create groups
    this.createGroups();
    
    // Create initial platforms
    this.createInitialPlatforms();
    
    // Create player
    this.createPlayer();
    
    // Set up collisions
    this.setupCollisions();
    
    // Create UI
    this.createUI();
    
    // Set up input
    this.setupInput();
    
    // Reset game state
    this.resetGame();
  }

  private createBackground(): void {
    // Gradient background
    const { width, height } = this.cameras.main;
    const bg = this.add.rectangle(0, 0, width, height * 10, 0x1a1a2e);
    bg.setOrigin(0, 0);
    bg.setScrollFactor(0, 0.1);
    
    // Parallax stars
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(-height * 5, height * 5),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.8)
      );
      star.setScrollFactor(0, 0.05 + i * 0.001);
    }
  }

  private createGroups(): void {
    // Platform group
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    
    // Collectibles group
    this.collectibles = this.physics.add.group({
      allowGravity: false
    });
    
    // Initialize platform pool
    for (let i = 0; i < 20; i++) {
      const platform = new Platform(this, 0, 0);
      platform.setActive(false);
      platform.setVisible(false);
      this.platformPool.push(platform);
    }
  }

  private createInitialPlatforms(): void {
    const { width, height } = this.cameras.main;
    
    // Starting platform
    this.spawnPlatform(width / 2, height - 50, PlatformType.NORMAL, 200);
    
    // Generate initial platforms going up
    let y = height - 150;
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(100, width - 100);
      const type = this.getRandomPlatformType(i);
      const platformWidth = Phaser.Math.Between(80, 150);
      
      this.spawnPlatform(x, y, type, platformWidth);
      y -= Phaser.Math.Between(60, 100);
    }
    
    this.lastPlatformY = y;
  }

  private spawnPlatform(x: number, y: number, type: PlatformType, width: number = 100): Platform {
    // Get platform from pool or create new one
    let platform = this.platformPool.find(p => !p.active);
    
    if (!platform) {
      platform = new Platform(this, x, y);
      this.platformPool.push(platform);
    }
    
    // Spawn and add to groups
    platform.spawn(x, y, type, width);
    this.platforms.add(platform);
    this.activePlatforms.push(platform);
    
    // Add collectible on some platforms
    if (type !== PlatformType.SPIKE && Phaser.Math.Between(0, 100) < 30) {
      this.spawnCollectible(x, y - 30);
    }
    
    return platform;
  }

  private spawnCollectible(x: number, y: number): void {
    const collectible = this.physics.add.sprite(x, y, 'orb');
    collectible.setScale(0.8);
    this.collectibles.add(collectible);
    
    // Floating animation
    this.tweens.add({
      targets: collectible,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private getRandomPlatformType(index: number): PlatformType {
    // Start with normal platforms, gradually introduce others
    if (index < 3) return PlatformType.NORMAL;
    
    const types = [
      PlatformType.NORMAL,
      PlatformType.NORMAL,
      PlatformType.NORMAL,
      PlatformType.MOVING,
      PlatformType.CRUMBLING,
      PlatformType.BOUNCY,
      PlatformType.ICE,
      PlatformType.SPIKE
    ];
    
    return types[Phaser.Math.Between(0, types.length - 1)];
  }

  private createPlayer(): void {
    const { width, height } = this.cameras.main;
    this.player = new Player(this, width / 2, height - 100);
  }

  private setupCollisions(): void {
    // Player vs Platforms
    this.physics.add.collider(
      this.player,
      this.platforms,
      this.handlePlatformCollision,
      undefined,
      this
    );
    
    // Player vs Collectibles
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.handleCollectibleOverlap,
      undefined,
      this
    );
  }

  private handlePlatformCollision(player: any, platform: any): void {
    const plat = platform as Platform;
    
    // Only process if landing on top
    if (player.body.touching.down && platform.body.touching.up) {
      plat.onPlayerContact(player);
      
      // Handle special platform types
      switch (plat.platformType) {
        case PlatformType.BOUNCY:
          player.bounce();
          break;
          
        case PlatformType.SPIKE:
          this.playerHit();
          break;
          
        case PlatformType.ICE:
          player.setDragX(10);
          break;
          
        default:
          player.setDragX(100);
          break;
      }
    }
  }

  private handleCollectibleOverlap(player: any, collectible: any): void {
    // Add score
    this.addScore(10);
    
    // Effect
    this.tweens.add({
      targets: collectible,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        collectible.destroy();
      }
    });
  }

  private createUI(): void {
    const padding = 20;
    
    // Score
    this.scoreText = this.add.text(padding, padding, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial Black'
    });
    this.scoreText.setScrollFactor(0);
    
    // High score
    this.highScoreText = this.add.text(padding, padding + 30, `Best: ${this.highScore}`, {
      fontSize: '18px',
      color: '#805ad5'
    });
    this.highScoreText.setScrollFactor(0);
    
    // Lives
    this.livesText = this.add.text(padding, padding + 60, '', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.livesText.setScrollFactor(0);
    this.updateLivesDisplay();
  }

  private setupInput(): void {
    // Pause
    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    
    // Restart
    this.input.keyboard?.on('keydown-R', () => {
      if (this.gameOver) {
        this.scene.restart();
      }
    });
  }

  private resetGame(): void {
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.isPaused = false;
    this.minCameraY = this.cameras.main.height;
    this.updateScore();
    this.updateLivesDisplay();
  }

  private addScore(points: number): void {
    this.score += points;
    this.updateScore();
    
    // Check high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreText.setText(`Best: ${this.highScore}`);
      this.registry.set('highScore', this.highScore);
      localStorage.setItem('ghostlyGlideHighScore', this.highScore.toString());
    }
  }

  private updateScore(): void {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  private updateLivesDisplay(): void {
    const hearts = '❤️'.repeat(Math.max(0, this.lives));
    this.livesText.setText(hearts);
  }

  private playerHit(): void {
    if (this.gameOver) return;
    
    this.player.hit();
    this.lives--;
    this.updateLivesDisplay();
    
    // Flash screen
    this.cameras.main.flash(200, 255, 0, 0);
    
    if (this.lives <= 0) {
      this.endGame();
    }
  }

  private endGame(): void {
    this.gameOver = true;
    
    // Stop player
    this.player.setActive(false);
    
    // Show game over
    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        highScore: this.highScore
      });
    });
  }

  private togglePause(): void {
    if (this.gameOver) return;
    
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.physics.pause();
      
      // Show pause overlay
      const { width, height } = this.cameras.main;
      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
      overlay.setScrollFactor(0);
      overlay.setName('pauseOverlay');
      
      const pauseText = this.add.text(width / 2, height / 2, 'PAUSED', {
        fontSize: '48px',
        color: '#ffffff'
      });
      pauseText.setOrigin(0.5);
      pauseText.setScrollFactor(0);
      pauseText.setName('pauseText');
    } else {
      this.physics.resume();
      
      // Remove pause overlay
      this.children.getByName('pauseOverlay')?.destroy();
      this.children.getByName('pauseText')?.destroy();
    }
  }

  update(time: number, delta: number): void {
    if (this.gameOver || this.isPaused) return;
    
    // Update player
    this.player.update();
    
    // Update platforms
    this.activePlatforms.forEach(platform => {
      platform.update(time, delta);
    });
    
    // Update camera to follow player upward
    const playerY = this.player.y;
    if (playerY < this.minCameraY - 200) {
      this.minCameraY = playerY + 200;
      this.cameras.main.scrollY = this.minCameraY - this.cameras.main.height;
      
      // Add score for climbing
      this.addScore(1);
    }
    
    // Generate new platforms as needed
    if (this.lastPlatformY > this.cameras.main.scrollY - 200) {
      this.generatePlatforms();
    }
    
    // Check if player fell
    if (this.player.y > this.minCameraY + 100) {
      this.playerHit();
      
      // Reset player position
      if (this.lives > 0) {
        const nearestPlatform = this.getNearestPlatform();
        if (nearestPlatform) {
          this.player.reset(nearestPlatform.x, nearestPlatform.y - 50);
        }
      }
    }
    
    // Clean up off-screen platforms
    this.cleanupPlatforms();
  }

  private generatePlatforms(): void {
    const { width } = this.cameras.main;
    
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = this.lastPlatformY - Phaser.Math.Between(60, 120);
      const type = this.getRandomPlatformType(Math.floor(this.score / 100));
      const platformWidth = Phaser.Math.Between(70, 140);
      
      this.spawnPlatform(x, y, type, platformWidth);
      this.lastPlatformY = y;
    }
  }

  private getNearestPlatform(): Platform | null {
    let nearest: Platform | null = null;
    let minDistance = Infinity;
    
    this.activePlatforms.forEach(platform => {
      if (platform.active && platform.platformType !== PlatformType.SPIKE) {
        const distance = Math.abs(platform.y - this.player.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = platform;
        }
      }
    });
    
    return nearest;
  }

  private cleanupPlatforms(): void {
    const bottomY = this.cameras.main.scrollY + this.cameras.main.height + 200;
    
    this.activePlatforms = this.activePlatforms.filter(platform => {
      if (platform.y > bottomY) {
        platform.deactivate();
        this.platforms.remove(platform);
        return false;
      }
      return true;
    });
  }
}