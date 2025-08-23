import Ghost from '../entities/Ghost.ts';
import LevelGenerator from '../systems/LevelGenerator.ts';

export default class MainScene extends Phaser.Scene {
  private ghost!: Ghost;
  private levelGenerator!: LevelGenerator;
  private platforms!: Phaser.Physics.Matter.Sprite[];
  private movingPlatforms!: Phaser.Physics.Matter.Sprite[];
  private hazards!: Phaser.Physics.Matter.Sprite[];
  private collectibles!: Phaser.Physics.Matter.Sprite[];
  private checkpoints!: Phaser.Physics.Matter.Sprite[];
  
  private currentLevel: number = 1;
  private score: number = 0;
  private lives: number = 99;
  private currentCheckpoint: { x: number, y: number } = { x: 400, y: 500 };

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { level?: number }) {
    this.currentLevel = data.level || 1;
  }

  create() {
    // Set up camera
    this.cameras.main.setBounds(0, 0, 800, 2500 + (this.currentLevel * 500));
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Set up Matter.js world bounds
    this.matter.world.setBounds(0, 0, 800, 2500 + (this.currentLevel * 500));

    // Initialize arrays for Matter.js objects
    this.platforms = [];
    this.movingPlatforms = [];
    this.hazards = [];
    this.collectibles = [];
    this.checkpoints = [];

    // Generate level
    this.levelGenerator = new LevelGenerator(this);
    const levelData = this.levelGenerator.generateLevel(this.currentLevel);
    
    // Create platforms from level data
    this.createLevelObjects(levelData);

    // Create ghost player with safety check
    const startX = this.currentCheckpoint?.x || 400;
    const startY = this.currentCheckpoint?.y || 500;
    this.ghost = new Ghost(this, startX, startY);
    
    // Set up camera to follow ghost with improved settings
    this.cameras.main.startFollow(this.ghost, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(150, 100);
    this.cameras.main.setLerp(0.1, 0.1);

    // Set up collisions
    this.setupCollisions();

    // Set up input
    this.setupInput();

    // Create background elements
    this.createBackground();
  }

  createLevelObjects(levelData: any) {
    const { Bodies } = window.Phaser.Physics.Matter.Matter;
    
    // Create platforms
    levelData.platforms.forEach((platformData: any) => {
      if (platformData.type === 'moving') {
        const platform = this.matter.add.sprite(
          platformData.x,
          platformData.y,
          'platform-moving'
        ) as Phaser.Physics.Matter.Sprite;
        
        platform.setScale(platformData.width / 100, 1);
        // Moving platforms should be kinematic (can be moved but not affected by gravity)
        const body = Bodies.rectangle(platformData.x, platformData.y, platformData.width, 20, { 
          isStatic: false,
          ignoreGravity: true
        });
        platform.setExistingBody(body);
        platform.setStatic(false);
        platform.setIgnoreGravity(true);
        platform.setData('movePattern', platformData.movePattern);
        platform.setData('originalX', platformData.x);
        platform.setData('originalY', platformData.y);
        platform.setData('type', 'moving');
        platform.setData('width', platformData.width);
        platform.setData('height', 20);
        this.movingPlatforms.push(platform);
      } else if (platformData.type === 'spike') {
        const spike = this.matter.add.sprite(
          platformData.x,
          platformData.y,
          'spike'
        ) as Phaser.Physics.Matter.Sprite;
        
        spike.setScale(0.5);
        const spikeBody = Bodies.rectangle(platformData.x, platformData.y, 20, 20, { 
          isStatic: true, 
          isSensor: true 
        });
        spike.setExistingBody(spikeBody);
        spike.setStatic(true);
        spike.setData('type', 'spike');
        this.hazards.push(spike);
      } else {
        // Handle different platform types with appropriate textures
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
        
        const platform = this.matter.add.sprite(
          platformData.x,
          platformData.y,
          textureKey
        ) as Phaser.Physics.Matter.Sprite;
        
        platform.setScale(platformData.width / 100, 1);
        const platformBody = Bodies.rectangle(platformData.x, platformData.y, platformData.width, 20, { 
          isStatic: true 
        });
        platform.setExistingBody(platformBody);
        platform.setStatic(true);
        platform.setData('type', platformData.type || 'solid');
        platform.setData('width', platformData.width);
        platform.setData('height', 20);
        platform.setData('originalY', platformData.y);
        
        if (platformData.type === 'crumbling') {
          platform.setData('isCrumbling', false);
        }
        
        // Apply visual effects for different platform types
        if (platformData.type === 'ice') {
          platform.setTint(0x88ddff);
        } else if (platformData.type === 'sticky') {
          platform.setTint(0xffaa00);
        }
        
        this.platforms.push(platform);
      }
    });

    // Create checkpoints
    levelData.checkpoints.forEach((checkpoint: any) => {
      const flag = this.matter.add.sprite(checkpoint.x, checkpoint.y, 'checkpoint') as Phaser.Physics.Matter.Sprite;
      const flagBody = Bodies.rectangle(checkpoint.x, checkpoint.y, 30, 40, { 
        isStatic: true, 
        isSensor: true 
      });
      flag.setExistingBody(flagBody);
      flag.setStatic(true);
      flag.setSensor(true);
      flag.setData('used', false);
      flag.setData('type', 'checkpoint');
      this.checkpoints.push(flag);
    });

    // Create collectibles
    levelData.collectibles.forEach((orb: any) => {
      const collectible = this.matter.add.sprite(orb.x, orb.y, 'orb') as Phaser.Physics.Matter.Sprite;
      const orbBody = Bodies.circle(orb.x, orb.y, 15, { 
        isStatic: true, 
        isSensor: true 
      });
      collectible.setExistingBody(orbBody);
      collectible.setStatic(true);
      collectible.setSensor(true);
      collectible.setData('value', 100);
      collectible.setData('type', 'orb');
      this.collectibles.push(collectible);
    });

    // Set initial checkpoint with safety check
    if (levelData?.checkpoints?.length > 0) {
      this.currentCheckpoint = levelData.checkpoints[0];
    } else {
      // Fallback checkpoint
      this.currentCheckpoint = { x: 400, y: 500 };
    }
  }

  setupCollisions() {
    // Collision detection is now handled directly in the Ghost class
    // through the checkPlatformCollision method
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

  startCrumbling(platform: Phaser.Physics.Matter.Sprite) {
    if (platform.getData('isCrumbling')) return;
    
    const { Body } = window.Phaser.Physics.Matter.Matter;
    const matterBody = platform.body as MatterJS.BodyType;
    
    platform.setData('isCrumbling', true);
    
    // Shake effect
    this.tweens.add({
      targets: platform,
      x: platform.x + Phaser.Math.Between(-2, 2),
      duration: 50,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        // Make platform non-collidable and fall
        Body.setStatic(matterBody, false);
        Body.setVelocity(matterBody, { x: 0, y: 5 });
        
        this.tweens.add({
          targets: platform,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            // Respawn after delay
            this.time.delayedCall(3000, () => {
              const originalY = platform.getData('originalY') || platform.y - 500;
              platform.setPosition(platform.x, originalY);
              platform.setAlpha(1);
              platform.setData('isCrumbling', false);
              Body.setStatic(matterBody, true);
              Body.setPosition(matterBody, { x: platform.x, y: originalY });
            });
          }
        });
      }
    });
  }

  respawnGhost() {
    // Safety check for currentCheckpoint
    if (!this.currentCheckpoint) {
      this.currentCheckpoint = { x: 400, y: 500 };
    }
    this.ghost.respawn(this.currentCheckpoint.x, this.currentCheckpoint.y);
  }

  gameOver() {
    this.scene.pause();
    // Show game over UI
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
    // Update the ghost
    if (this.ghost) {
      this.ghost.update(time, delta);
    }
    
    const { Body } = window.Phaser.Physics.Matter.Matter;
    
    // Update moving platforms with different patterns
    this.movingPlatforms.forEach((platform: Phaser.Physics.Matter.Sprite) => {
      const pattern = platform.getData('movePattern');
      const originalX = platform.getData('originalX');
      const originalY = platform.getData('originalY');
      const matterBody = platform.body as MatterJS.BodyType;
      
      // Store previous position for velocity calculation
      const prevX = platform.x;
      const prevY = platform.y;
      let newX = originalX;
      let newY = originalY;
      
      if (pattern === 'horizontal') {
        newX = originalX + Math.sin(time * 0.0015) * 120;
        newY = originalY;
      } else if (pattern === 'vertical') {
        newX = originalX;
        newY = originalY + Math.sin(time * 0.0018) * 60;
      } else if (pattern === 'circular') {
        const radius = 80;
        newX = originalX + Math.cos(time * 0.001) * radius;
        newY = originalY + Math.sin(time * 0.001) * radius * 0.5;
      }
      
      // Update position
      Body.setPosition(matterBody, { x: newX, y: newY });
      
      // Calculate and set velocity for smooth movement
      if (delta > 0) {
        const velX = (newX - prevX) / (delta / 1000);
        const velY = (newY - prevY) / (delta / 1000);
        Body.setVelocity(matterBody, { x: velX / 100, y: velY / 100 });
      }
    });

    // Check if reached top
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