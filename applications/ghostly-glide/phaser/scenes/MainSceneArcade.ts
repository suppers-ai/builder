import GhostArcade from '../entities/GhostArcade.ts';
import LevelGenerator from '../systems/LevelGenerator.ts';

export default class MainSceneArcade extends Phaser.Scene {
  private ghost!: GhostArcade;
  private levelGenerator!: LevelGenerator;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private collectibles!: Phaser.Physics.Arcade.StaticGroup;
  private checkpoints!: Phaser.Physics.Arcade.StaticGroup;
  
  private currentLevel: number = 1;
  private score: number = 0;
  private lives: number = 3;
  private currentCheckpoint: { x: number, y: number } = { x: 400, y: 2400 };

  constructor() {
    super({ key: 'MainSceneArcade' });
  }

  init(data: { level?: number }) {
    this.currentLevel = data.level || 1;
  }

  create() {
    // Set up camera
    const levelHeight = 2500 + (this.currentLevel * 500);
    this.cameras.main.setBounds(0, 0, 800, levelHeight);
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Create physics groups
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group();
    this.hazards = this.physics.add.staticGroup();
    this.collectibles = this.physics.add.staticGroup();
    this.checkpoints = this.physics.add.staticGroup();
    
    // Generate level
    this.levelGenerator = new LevelGenerator(this);
    const levelData = this.levelGenerator.generateLevel(this.currentLevel);
    
    // Create platforms from level data
    this.createLevelObjects(levelData);
    
    // Create ghost player at first checkpoint
    const startX = levelData.checkpoints[0]?.x || 400;
    const startY = levelData.checkpoints[0]?.y || levelHeight - 150;
    this.ghost = new GhostArcade(this, startX, startY - 20);
    this.currentCheckpoint = { x: startX, y: startY };
    
    // Set up camera to follow ghost
    this.cameras.main.startFollow(this.ghost, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(150, 100);
    
    // Set up collisions
    this.setupCollisions();
    
    // Set up input
    this.setupInput();
    
    // Create background
    this.createBackground();
  }

  createLevelObjects(levelData: any) {
    // Create static platforms
    levelData.platforms.forEach((platformData: any) => {
      if (platformData.type === 'moving') {
        // Create moving platform
        const platform = this.movingPlatforms.create(
          platformData.x,
          platformData.y,
          'platform-moving'
        );
        platform.setImmovable(true);
        platform.body.allowGravity = false;
        platform.displayWidth = platformData.width;
        platform.refreshBody();
        platform.setData('movePattern', platformData.movePattern);
        platform.setData('originalX', platformData.x);
        platform.setData('originalY', platformData.y);
        platform.setData('type', 'moving');
      } else if (platformData.type === 'spike') {
        // Create hazard
        const spike = this.hazards.create(
          platformData.x,
          platformData.y,
          'spike'
        );
        spike.setScale(0.5);
        spike.setData('type', 'spike');
      } else {
        // Create static platform
        let textureKey = 'platform';
        if (platformData.type === 'bouncy') {
          textureKey = 'platform-bouncy';
        } else if (platformData.type === 'crumbling') {
          textureKey = 'platform-crumbling';
        } else if (platformData.type === 'ice') {
          textureKey = 'platform-ice';
        } else if (platformData.type === 'sticky') {
          textureKey = 'platform-sticky';
        }
        
        const platform = this.platforms.create(
          platformData.x,
          platformData.y,
          textureKey
        );
        platform.displayWidth = platformData.width;
        platform.refreshBody();
        platform.setData('type', platformData.type || 'solid');
        platform.setData('originalY', platformData.y);
        
        // Apply visual effects
        if (platformData.type === 'ice') {
          platform.setTint(0x88ddff);
        } else if (platformData.type === 'sticky') {
          platform.setTint(0xffaa00);
        }
      }
    });
    
    // Create checkpoints
    levelData.checkpoints.forEach((checkpoint: any) => {
      const flag = this.checkpoints.create(checkpoint.x, checkpoint.y, 'checkpoint');
      flag.setData('used', false);
    });
    
    // Create collectibles
    levelData.collectibles.forEach((orb: any) => {
      const collectible = this.collectibles.create(orb.x, orb.y, 'orb');
      collectible.setData('value', 100);
    });
  }

  setupCollisions() {
    // Ghost collides with platforms
    this.physics.add.collider(this.ghost, this.platforms, this.handlePlatformCollision, undefined, this);
    this.physics.add.collider(this.ghost, this.movingPlatforms, this.handleMovingPlatformCollision, undefined, this);
    
    // Ghost overlaps with collectibles
    this.physics.add.overlap(this.ghost, this.collectibles, this.collectOrb, undefined, this);
    
    // Ghost overlaps with checkpoints
    this.physics.add.overlap(this.ghost, this.checkpoints, this.activateCheckpoint, undefined, this);
    
    // Ghost overlaps with hazards
    this.physics.add.overlap(this.ghost, this.hazards, this.hitHazard, undefined, this);
  }

  handlePlatformCollision(ghost: any, platform: any) {
    const type = platform.getData('type');
    
    if (type === 'bouncy' && ghost.body.touching.down) {
      ghost.bounce();
    } else if (type === 'crumbling') {
      this.startCrumbling(platform);
    } else if (type === 'ice') {
      ghost.setDrag(10, 0);
    } else if (type === 'sticky') {
      ghost.setDrag(500, 0);
    } else {
      ghost.setDrag(100, 0);
    }
  }

  handleMovingPlatformCollision(ghost: any, platform: any) {
    if (ghost.body.touching.down && platform.body.touching.up) {
      ghost.x += platform.body.velocity.x * 0.016;
    }
  }

  collectOrb(ghost: any, orb: any) {
    this.score += orb.getData('value');
    this.events.emit('scoreChanged', this.score);
    
    this.tweens.add({
      targets: orb,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        orb.destroy();
      }
    });
  }

  activateCheckpoint(ghost: any, checkpoint: any) {
    if (!checkpoint.getData('used')) {
      checkpoint.setData('used', true);
      this.currentCheckpoint = { x: checkpoint.x, y: checkpoint.y - 50 };
      
      this.tweens.add({
        targets: checkpoint,
        scale: 1.5,
        duration: 200,
        yoyo: true
      });
      
      ghost.setTint(0x00ff00);
      this.time.delayedCall(200, () => ghost.clearTint());
    }
  }

  hitHazard(ghost: any, hazard: any) {
    ghost.takeDamage();
    this.lives--;
    this.events.emit('livesChanged', this.lives);
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.respawnGhost();
    }
  }

  startCrumbling(platform: any) {
    if (platform.getData('isCrumbling')) return;
    
    platform.setData('isCrumbling', true);
    
    // Shake effect
    this.tweens.add({
      targets: platform,
      x: platform.x + Phaser.Math.Between(-2, 2),
      duration: 50,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        // Make platform fall
        this.tweens.add({
          targets: platform,
          y: platform.y + 500,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            // Respawn after delay
            this.time.delayedCall(3000, () => {
              const originalY = platform.getData('originalY');
              platform.setPosition(platform.x, originalY);
              platform.setAlpha(1);
              platform.setData('isCrumbling', false);
              platform.refreshBody();
            });
          }
        });
      }
    });
  }

  setupInput() {
    // Restart key
    this.input.keyboard?.on('keydown-R', () => {
      this.respawnGhost();
    });
    
    // Pause key
    this.input.keyboard?.on('keydown-P', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
    
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  createBackground() {
    // Create parallax background layers
    for (let i = 0; i < 5; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x805ad5, 0.1 - i * 0.02);
      
      for (let j = 0; j < 20; j++) {
        const x = Phaser.Math.Between(0, 800);
        const y = Phaser.Math.Between(0, 3000);
        const size = Phaser.Math.Between(2, 10);
        graphics.fillCircle(x, y, size);
      }
      
      graphics.setScrollFactor(1 - i * 0.1);
    }
  }

  respawnGhost() {
    this.ghost.respawn(this.currentCheckpoint.x, this.currentCheckpoint.y);
  }

  gameOver() {
    this.scene.pause();
    this.events.emit('gameOver', this.score);
  }

  levelComplete() {
    this.currentLevel++;
    this.score += 1000 * this.currentLevel;
    
    if (this.currentLevel > 10) {
      this.events.emit('gameComplete', this.score);
    } else {
      this.scene.restart({ level: this.currentLevel });
    }
  }

  update(time: number, delta: number) {
    // Update ghost
    this.ghost.update();
    
    // Update moving platforms
    this.movingPlatforms.children.entries.forEach((platform: any) => {
      const pattern = platform.getData('movePattern');
      const originalX = platform.getData('originalX');
      const originalY = platform.getData('originalY');
      
      if (pattern === 'horizontal') {
        platform.x = originalX + Math.sin(time * 0.0015) * 120;
        platform.setVelocityX((Math.cos(time * 0.0015) * 120 * 0.0015) * 60);
      } else if (pattern === 'vertical') {
        platform.y = originalY + Math.sin(time * 0.0018) * 60;
        platform.setVelocityY((Math.cos(time * 0.0018) * 60 * 0.0018) * 60);
      } else if (pattern === 'circular') {
        const radius = 80;
        platform.x = originalX + Math.cos(time * 0.001) * radius;
        platform.y = originalY + Math.sin(time * 0.001) * radius * 0.5;
        platform.setVelocity(
          -Math.sin(time * 0.001) * radius * 0.001 * 60,
          Math.cos(time * 0.001) * radius * 0.5 * 0.001 * 60
        );
      }
    });
    
    // Check victory condition
    if (this.ghost.y < 150) {
      this.levelComplete();
    }
    
    // Check if fell off bottom
    if (this.ghost.y > this.cameras.main.getBounds().height + 100) {
      this.respawnGhost();
      this.lives--;
      this.events.emit('livesChanged', this.lives);
      
      if (this.lives <= 0) {
        this.gameOver();
      }
    }
  }
}