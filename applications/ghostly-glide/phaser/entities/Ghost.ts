export default class Ghost extends Phaser.GameObjects.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  
  // Physics properties
  private velocityX: number = 0;
  private velocityY: number = 0;
  private onFloor: boolean = false;
  private onIce: boolean = false;
  private onSticky: boolean = false;
  
  private canDoubleJump: boolean = true;
  private isWallSliding: boolean = false;
  private wallSlideSide: number = 0; // -1 for left, 1 for right
  private coyoteTime: number = 0;
  private jumpBufferTime: number = 0;
  private wasOnFloor: boolean = false;
  private wallJumpCooldown: number = 0;
  private isGroundPounding: boolean = false;
  
  // Movement constants
  private readonly MOVE_SPEED = 300;
  private readonly JUMP_VELOCITY = -520;
  private readonly DOUBLE_JUMP_VELOCITY = -480;
  private readonly WALL_JUMP_X = 350;
  private readonly WALL_JUMP_Y = -450;
  private readonly WALL_SLIDE_SPEED = 80;
  private readonly GROUND_POUND_FORCE = 800;
  private readonly COYOTE_TIME_MAX = 120; // milliseconds
  private readonly JUMP_BUFFER_MAX = 150; // milliseconds
  private readonly WALL_JUMP_COOLDOWN = 200; // milliseconds
  private readonly GRAVITY = 980;

  // Collision box
  private readonly WIDTH = 20;
  private readonly HEIGHT = 32;

  // Particles for trail effect
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ghost');
    
    scene.add.existing(this);
    
    this.setScale(1);
    this.setOrigin(0.5, 0.5);
    
    // Store reference for collision detection
    this.setData('type', 'ghost');
    this.setData('width', this.WIDTH);
    this.setData('height', this.HEIGHT);
    
    // Set up input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys('W,A,S,D,S');
    this.jumpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Create particle trail
    this.createParticleTrail();
  }

  createParticleTrail() {
    const particles = this.scene.add.particles(0, 0, 'particle', {
      follow: this,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.5, end: 0 },
      speed: { min: 20, max: 50 },
      lifespan: 300,
      frequency: 50,
      tint: 0xffffff
    });
    
    this.particles = particles;
  }

  update(time: number, delta: number) {
    const deltaSeconds = delta / 1000;
    
    // Update cooldowns
    if (this.wallJumpCooldown > 0) {
      this.wallJumpCooldown -= delta;
    }
    
    // Apply gravity
    if (!this.onFloor) {
      this.velocityY += this.GRAVITY * deltaSeconds;
      this.velocityY = Math.min(this.velocityY, 600); // Terminal velocity
    }
    
    // Handle input and movement
    this.handleInput();
    
    // Apply movement with collision
    this.moveWithCollision(deltaSeconds);
    
    // Check for special interactions
    this.checkInteractions();
    
    // Update particle effects
    this.updateParticles();
  }

  handleInput() {
    const deltaSeconds = 1/60; // Use fixed timestep for input
    
    // Handle coyote time
    if (this.onFloor) {
      this.coyoteTime = this.COYOTE_TIME_MAX;
      this.wasOnFloor = true;
      this.canDoubleJump = true;
      this.isGroundPounding = false;
    } else if (this.wasOnFloor) {
      this.coyoteTime -= 16; // Assume 60fps
      if (this.coyoteTime <= 0) {
        this.wasOnFloor = false;
      }
    }
    
    // Jump input
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                       Phaser.Input.Keyboard.JustDown(this.jumpKey) || 
                       Phaser.Input.Keyboard.JustDown(this.wasd.W);
    
    // Ground pound input
    const groundPoundPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
                              Phaser.Input.Keyboard.JustDown(this.wasd.S);
    
    // Jump buffer
    if (jumpPressed) {
      this.jumpBufferTime = this.JUMP_BUFFER_MAX;
    } else if (this.jumpBufferTime > 0) {
      this.jumpBufferTime -= 16;
    }
    
    // Check wall sliding
    this.checkWallSlide();
    
    // Handle ground pound
    if (groundPoundPressed && !this.onFloor && !this.isGroundPounding) {
      this.groundPound();
    }
    
    // Handle jumping
    if (this.jumpBufferTime > 0 && !this.isGroundPounding) {
      if (this.onFloor || this.coyoteTime > 0) {
        this.jump();
      } else if (this.isWallSliding && this.wallJumpCooldown <= 0) {
        this.wallJump();
      } else if (this.canDoubleJump) {
        this.doubleJump();
      }
    }
    
    // Variable jump height
    const jumpReleased = (this.cursors.up.isUp && this.jumpKey.isUp && this.wasd.W.isUp);
    if (jumpReleased && this.velocityY < -200 && !this.isGroundPounding) {
      this.velocityY *= 0.6;
    }
    
    // Horizontal movement
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    
    if (!this.isGroundPounding) {
      const maxSpeed = this.onSticky ? 150 : 300;
      const acceleration = this.onIce ? 200 : (this.onFloor ? 800 : 600);
      
      if (left) {
        this.velocityX -= acceleration * deltaSeconds;
        this.velocityX = Math.max(this.velocityX, -maxSpeed);
        this.setFlipX(true);
      } else if (right) {
        this.velocityX += acceleration * deltaSeconds;
        this.velocityX = Math.min(this.velocityX, maxSpeed);
        this.setFlipX(false);
      } else {
        // Apply friction
        let friction = 0.95;
        if (this.onIce) {
          friction = 0.98;
        } else if (this.onSticky) {
          friction = 0.7;
        } else if (this.onFloor) {
          friction = 0.85;
        }
        this.velocityX *= friction;
      }
    }
    
    // Handle wall sliding
    if (this.isWallSliding && this.velocityY > 0) {
      this.velocityY = Math.min(this.velocityY, this.WALL_SLIDE_SPEED);
      this.particles.frequency = 30;
      this.particles.tint = 0x808080;
    }
    
    // Handle ground pound
    if (this.isGroundPounding) {
      this.velocityX *= 0.9;
      this.velocityY = this.GROUND_POUND_FORCE;
      if (this.onFloor) {
        this.groundPoundLand();
      }
    }
  }

  moveWithCollision(deltaSeconds: number) {
    const scene = this.scene as any;
    const platforms = [...(scene.platforms || []), ...(scene.movingPlatforms || [])];
    
    // Calculate desired movement
    const moveX = this.velocityX * deltaSeconds;
    const moveY = this.velocityY * deltaSeconds;
    
    // Split movement into steps for tunneling prevention
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(moveX), Math.abs(moveY)) / 3));
    const stepX = moveX / steps;
    const stepY = moveY / steps;
    
    // Reset floor detection
    this.onFloor = false;
    this.onIce = false;
    this.onSticky = false;
    
    for (let step = 0; step < steps; step++) {
      // Store old position for rollback
      const oldX = this.x;
      const oldY = this.y;
      
      // Try horizontal movement first
      this.x += stepX;
      
      // Check horizontal collisions
      let horizontalCollision = false;
      for (const platform of platforms) {
        if (this.checkCollisionWith(platform)) {
          horizontalCollision = true;
          const platBox = this.getPlatformBox(platform);
          
          // Calculate penetration depth
          const leftPenetration = (this.x + this.WIDTH / 2) - platBox.left;
          const rightPenetration = platBox.right - (this.x - this.WIDTH / 2);
          
          // Push out by smallest distance
          if (leftPenetration < rightPenetration) {
            // Push left
            this.x = platBox.left - this.WIDTH / 2 - 0.1;
          } else {
            // Push right
            this.x = platBox.right + this.WIDTH / 2 + 0.1;
          }
          this.velocityX = 0;
          break;
        }
      }
      
      // Try vertical movement
      this.y += stepY;
      
      // Check vertical collisions
      for (const platform of platforms) {
        if (this.checkCollisionWith(platform)) {
          const platBox = this.getPlatformBox(platform);
          const type = platform.getData?.('type');
          
          // Calculate penetration depth
          const topPenetration = (this.y + this.HEIGHT / 2) - platBox.top;
          const bottomPenetration = platBox.bottom - (this.y - this.HEIGHT / 2);
          
          // Resolve based on smallest penetration
          if (topPenetration < bottomPenetration) {
            // Landing on platform (push up)
            this.y = platBox.top - this.HEIGHT / 2 - 0.1;
            
            // Check if it's a special platform
            if (type === 'bouncy') {
              this.bounce();
            } else {
              if (this.velocityY > 0) {
                this.velocityY = 0;
                this.onFloor = true;
                
                // Set surface type
                if (type === 'ice') {
                  this.onIce = true;
                } else if (type === 'sticky') {
                  this.onSticky = true;
                } else if (type === 'crumbling') {
                  scene.startCrumbling?.(platform);
                }
              }
            }
          } else {
            // Hit ceiling (push down)
            this.y = platBox.bottom + this.HEIGHT / 2 + 0.1;
            if (this.velocityY < 0) {
              this.velocityY = 0;
            }
          }
          break;
        }
      }
    }
    
    // Final ground check for standing detection
    const groundPlatform = this.getPlatformBelow();
    if (groundPlatform) {
      this.onFloor = true;
      const type = groundPlatform.getData?.('type');
      if (type === 'ice') this.onIce = true;
      if (type === 'sticky') this.onSticky = true;
    }
  }

  checkCollisionWith(platform: any): boolean {
    if (!platform || typeof platform.x !== 'number' || typeof platform.y !== 'number') {
      return false;
    }
    
    const platBox = this.getPlatformBox(platform);
    const ghostBox = this.getGhostBox();
    
    return ghostBox.left < platBox.right &&
           ghostBox.right > platBox.left &&
           ghostBox.top < platBox.bottom &&
           ghostBox.bottom > platBox.top;
  }

  getPlatformBox(platform: any) {
    // Get actual platform dimensions
    const width = platform.getData?.('width') || platform.width || 100;
    const height = platform.getData?.('height') || platform.height || 20;
    
    // Account for scale
    const scaleX = platform.scaleX || 1;
    const scaleY = platform.scaleY || 1;
    const actualWidth = width * scaleX;
    const actualHeight = height * scaleY;
    
    return {
      left: platform.x - actualWidth / 2,
      right: platform.x + actualWidth / 2,
      top: platform.y - actualHeight / 2,
      bottom: platform.y + actualHeight / 2
    };
  }

  getGhostBox() {
    return {
      left: this.x - this.WIDTH / 2,
      right: this.x + this.WIDTH / 2,
      top: this.y - this.HEIGHT / 2,
      bottom: this.y + this.HEIGHT / 2
    };
  }

  getPlatformBelow(): any {
    const scene = this.scene as any;
    const platforms = [...(scene.platforms || []), ...(scene.movingPlatforms || [])];
    
    // Check slightly below feet - use smaller value for tighter detection
    const checkY = this.y + this.HEIGHT / 2 + 1;
    const ghostLeft = this.x - this.WIDTH / 2;
    const ghostRight = this.x + this.WIDTH / 2;
    
    for (const platform of platforms) {
      if (!platform || typeof platform.x !== 'number' || typeof platform.y !== 'number') {
        continue;
      }
      
      const platBox = this.getPlatformBox(platform);
      
      // Check if we're just above the platform and overlapping horizontally
      const verticallyClose = checkY >= platBox.top - 1 && checkY <= platBox.top + 3;
      const horizontalOverlap = ghostRight > platBox.left && ghostLeft < platBox.right;
      
      if (verticallyClose && horizontalOverlap) {
        return platform;
      }
    }
    
    return null;
  }

  checkWallSlide() {
    const scene = this.scene as any;
    const platforms = [...(scene.platforms || []), ...(scene.movingPlatforms || [])];
    
    const leftPressed = this.cursors.left?.isDown || this.wasd.A?.isDown;
    const rightPressed = this.cursors.right?.isDown || this.wasd.D?.isDown;
    
    let touchingLeftWall = false;
    let touchingRightWall = false;
    
    // Check for walls
    for (const platform of platforms) {
      if (!platform || typeof platform.x !== 'number' || typeof platform.y !== 'number') {
        continue;
      }
      
      const platBox = this.getPlatformBox(platform);
      const ghostBox = this.getGhostBox();
      
      // Check if we're at the right height for wall contact
      if (ghostBox.bottom > platBox.top && ghostBox.top < platBox.bottom) {
        // Check left wall
        if (Math.abs(ghostBox.left - platBox.right) < 5) {
          touchingLeftWall = true;
        }
        // Check right wall
        if (Math.abs(ghostBox.right - platBox.left) < 5) {
          touchingRightWall = true;
        }
      }
    }
    
    const movingTowardsWall = 
      (touchingLeftWall && leftPressed) || 
      (touchingRightWall && rightPressed);
    
    if (!this.onFloor && movingTowardsWall && this.velocityY > 50 && !this.isGroundPounding) {
      this.isWallSliding = true;
      this.wallSlideSide = touchingLeftWall ? -1 : 1;
    } else {
      this.isWallSliding = false;
      this.wallSlideSide = 0;
    }
  }

  checkInteractions() {
    const scene = this.scene as any;
    const ghostBox = this.getGhostBox();
    
    // Check hazards
    if (scene.hazards) {
      for (const hazard of scene.hazards) {
        if (!hazard || !hazard.x || !hazard.y) continue;
        
        const hazardBox = {
          left: hazard.x - 10,
          right: hazard.x + 10,
          top: hazard.y - 10,
          bottom: hazard.y + 10
        };
        
        if (ghostBox.right > hazardBox.left &&
            ghostBox.left < hazardBox.right &&
            ghostBox.bottom > hazardBox.top &&
            ghostBox.top < hazardBox.bottom) {
          
          const type = hazard.getData?.('type');
          if (type === 'spike') {
            this.takeDamage();
            scene.lives--;
            scene.events.emit('livesChanged', scene.lives);
            
            if (scene.lives <= 0) {
              scene.gameOver();
            } else {
              scene.respawnGhost();
            }
          }
        }
      }
    }
    
    // Check collectibles
    if (scene.collectibles) {
      for (let i = scene.collectibles.length - 1; i >= 0; i--) {
        const collectible = scene.collectibles[i];
        if (!collectible || !collectible.x || !collectible.y) continue;
        
        const dist = Math.sqrt(
          Math.pow(this.x - collectible.x, 2) + 
          Math.pow(this.y - collectible.y, 2)
        );
        
        if (dist < 25) {
          scene.score += collectible.getData('value');
          scene.events.emit('scoreChanged', scene.score);
          
          scene.tweens.add({
            targets: collectible,
            scale: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              collectible.destroy();
            }
          });
          
          scene.collectibles.splice(i, 1);
        }
      }
    }
    
    // Check checkpoints
    if (scene.checkpoints) {
      for (const checkpoint of scene.checkpoints) {
        if (!checkpoint || !checkpoint.x || !checkpoint.y) continue;
        
        const dist = Math.sqrt(
          Math.pow(this.x - checkpoint.x, 2) + 
          Math.pow(this.y - checkpoint.y, 2)
        );
        
        if (dist < 30 && !checkpoint.getData('used')) {
          checkpoint.setData('used', true);
          scene.currentCheckpoint = { x: checkpoint.x, y: checkpoint.y - 50 };
          
          scene.tweens.add({
            targets: checkpoint,
            scale: 1.5,
            duration: 200,
            yoyo: true
          });
          
          this.setTint(0x00ff00);
          scene.time.delayedCall(200, () => this.clearTint());
        }
      }
    }
  }

  jump() {
    this.velocityY = this.JUMP_VELOCITY;
    this.jumpBufferTime = 0;
    this.coyoteTime = 0;
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 100,
      yoyo: true
    });
  }

  doubleJump() {
    this.velocityY = this.DOUBLE_JUMP_VELOCITY;
    this.canDoubleJump = false;
    this.jumpBufferTime = 0;
    
    this.particles.frequency = 20;
    this.particles.tint = 0x805ad5;
    this.scene.time.delayedCall(300, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
  }

  wallJump() {
    this.velocityX = this.WALL_JUMP_X * -this.wallSlideSide;
    this.velocityY = this.WALL_JUMP_Y;
    this.jumpBufferTime = 0;
    this.canDoubleJump = true;
    this.wallJumpCooldown = this.WALL_JUMP_COOLDOWN;
    this.isWallSliding = false;
    
    this.scene.tweens.add({
      targets: this,
      angle: this.wallSlideSide * 180,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    this.particles.frequency = 20;
    this.particles.tint = 0xff6b35;
    this.scene.time.delayedCall(400, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
  }

  groundPound() {
    this.velocityY = this.GROUND_POUND_FORCE;
    this.isGroundPounding = true;
    this.canDoubleJump = false;
    
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.7,
      scaleX: 1.3,
      duration: 200
    });
    
    this.particles.frequency = 15;
    this.particles.tint = 0xff0000;
  }

  groundPoundLand() {
    this.isGroundPounding = false;
    
    this.scene.tweens.add({
      targets: this,
      scaleY: 1,
      scaleX: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
    
    this.scene.cameras.main.shake(200, 0.02);
    
    this.particles.frequency = 50;
    this.particles.tint = 0xffffff;
  }

  bounce() {
    this.velocityY = -800;
    this.canDoubleJump = true;
    
    this.particles.frequency = 10;
    this.particles.tint = 0x10b981;
    this.scene.time.delayedCall(300, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
  }

  updateParticles() {
    if (this.isWallSliding) {
      this.particles.frequency = 30;
      this.particles.speed = { min: 50, max: 100 };
    } else if (Math.abs(this.velocityX) > 100 || Math.abs(this.velocityY) > 100) {
      this.particles.frequency = 50;
      this.particles.speed = { min: 20, max: 50 };
    } else {
      this.particles.frequency = 100;
      this.particles.speed = { min: 10, max: 20 };
    }
  }

  takeDamage() {
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => this.clearTint());
    this.velocityY = -200;
  }

  respawn(x: number, y: number) {
    this.setPosition(x, y);
    this.velocityX = 0;
    this.velocityY = 0;
    this.canDoubleJump = true;
    
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500
    });
  }
}