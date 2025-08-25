export default class GhostPhysics extends Phaser.Physics.Matter.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  
  // Physics properties
  private touchingGround: number = 0;
  private touchingLeft: boolean = false;
  private touchingRight: boolean = false;
  private onIce: boolean = false;
  private onSticky: boolean = false;
  private currentPlatform: Phaser.Physics.Matter.Sprite | null = null;
  
  private canDoubleJump: boolean = true;
  private isWallSliding: boolean = false;
  private wallSlideSide: number = 0;
  private coyoteTime: number = 0;
  private jumpBufferTime: number = 0;
  private wallJumpCooldown: number = 0;
  private isGroundPounding: boolean = false;
  
  // Movement constants
  private readonly MOVE_SPEED = 4.5;
  private readonly JUMP_FORCE = 0.014;
  private readonly DOUBLE_JUMP_FORCE = 0.013;
  private readonly WALL_JUMP_X = 5;
  private readonly WALL_JUMP_Y = 0.012;
  private readonly GROUND_POUND_FORCE = 15;
  private readonly COYOTE_TIME_MAX = 120;
  private readonly JUMP_BUFFER_MAX = 150;
  private readonly WALL_JUMP_COOLDOWN = 200;
  
  // Collision categories
  private readonly CATEGORY_GHOST = 0x0001;
  private readonly CATEGORY_PLATFORM = 0x0002;
  private readonly CATEGORY_HAZARD = 0x0004;
  private readonly CATEGORY_COLLECTIBLE = 0x0008;
  private readonly CATEGORY_CHECKPOINT = 0x0010;
  
  // Particles for trail effect
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  
  // Ground sensor
  private groundSensor!: MatterJS.BodyType;
  private leftSensor!: MatterJS.BodyType;
  private rightSensor!: MatterJS.BodyType;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'ghost');
    
    // Create compound body with sensors
    this.createPhysicsBody();
    
    scene.add.existing(this);
    
    // Set up collision filtering
    this.setCollisionCategory(this.CATEGORY_GHOST);
    this.setCollidesWith([
      this.CATEGORY_PLATFORM,
      this.CATEGORY_HAZARD,
      this.CATEGORY_COLLECTIBLE,
      this.CATEGORY_CHECKPOINT
    ]);
    
    // Configure physics properties
    this.setFriction(0.0);
    this.setFrictionAir(0.01);
    this.setBounce(0);
    this.setMass(1);
    
    // Store reference for identification
    this.setData('type', 'ghost');
    this.setData('categoryBits', this.CATEGORY_GHOST);
    
    // Set up input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys('W,A,S,D');
    this.jumpKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Create particle trail
    this.createParticleTrail();
    
    // Set up collision detection
    this.setupCollisionDetection();
  }
  
  createPhysicsBody() {
    const { Bodies, Body } = (window as any).Phaser.Physics.Matter.Matter;
    
    // Use a capsule shape (two circles + rectangle) to prevent edge catching
    const topCircle = Bodies.circle(0, -10, 9, {
      label: 'ghostBody'
    });
    
    const bottomCircle = Bodies.circle(0, 10, 9, {
      label: 'ghostBody'  
    });
    
    const middleRect = Bodies.rectangle(0, 0, 18, 20, {
      label: 'ghostBody'
    });
    
    // Ground sensor (thin rectangle below main body)
    this.groundSensor = Bodies.rectangle(0, 16, 14, 4, {
      isSensor: true,
      label: 'groundSensor'
    });
    
    // Wall sensors
    this.leftSensor = Bodies.rectangle(-10, 0, 4, 26, {
      isSensor: true,
      label: 'leftSensor'
    });
    
    this.rightSensor = Bodies.rectangle(10, 0, 4, 26, {
      isSensor: true,
      label: 'rightSensor'
    });
    
    // Create compound body with capsule shape
    const compoundBody = Body.create({
      parts: [topCircle, bottomCircle, middleRect, this.groundSensor, this.leftSensor, this.rightSensor],
      friction: 0.0,
      restitution: 0,
      label: 'ghost',
      inertia: Infinity, // Prevent rotation
      inverseInertia: 0, // Prevent rotation
      angle: 0,
      angularVelocity: 0,
      torque: 0
    });
    
    this.setExistingBody(compoundBody);
    this.setFixedRotation(); // Prevent rotation
    
    // Force rotation constraints
    Body.setInertia(compoundBody, Infinity);
    Body.setAngularVelocity(compoundBody, 0);
    Body.setAngle(compoundBody, 0);
    
    // Set additional properties to prevent rotation
    compoundBody.frictionAir = 0.01;
    compoundBody.slop = 0.05; // Reduce position correction tolerance
  }
  
  setupCollisionDetection() {
    this.scene.matter.world.on('collisionstart', (event: any) => {
      event.pairs.forEach((pair: any) => {
        const { bodyA, bodyB } = pair;
        
        // Check ground sensor collisions
        if ((bodyA === this.groundSensor || bodyB === this.groundSensor)) {
          const otherBody = bodyA === this.groundSensor ? bodyB : bodyA;
          if (otherBody.label === 'platform' || otherBody.label === 'platformBody') {
            this.touchingGround++;
            this.handlePlatformContact(otherBody);
          }
        }
        
        // Check wall sensor collisions
        if (bodyA === this.leftSensor || bodyB === this.leftSensor) {
          const otherBody = bodyA === this.leftSensor ? bodyB : bodyA;
          if (otherBody.label === 'platform' || otherBody.label === 'platformBody') {
            this.touchingLeft = true;
          }
        }
        
        if (bodyA === this.rightSensor || bodyB === this.rightSensor) {
          const otherBody = bodyA === this.rightSensor ? bodyB : bodyA;
          if (otherBody.label === 'platform' || otherBody.label === 'platformBody') {
            this.touchingRight = true;
          }
        }
        
        // Check main body collisions for hazards and collectibles
        if (bodyA.label === 'ghostBody' || bodyB.label === 'ghostBody') {
          const otherBody = bodyA.label === 'ghostBody' ? bodyB : bodyA;
          
          if (otherBody.label === 'hazard') {
            this.handleHazardCollision(otherBody);
          } else if (otherBody.label === 'collectible') {
            this.handleCollectibleCollision(otherBody);
          } else if (otherBody.label === 'checkpoint') {
            this.handleCheckpointCollision(otherBody);
          }
        }
      });
    });
    
    this.scene.matter.world.on('collisionend', (event: any) => {
      event.pairs.forEach((pair: any) => {
        const { bodyA, bodyB } = pair;
        
        // Check ground sensor
        if ((bodyA === this.groundSensor || bodyB === this.groundSensor)) {
          const otherBody = bodyA === this.groundSensor ? bodyB : bodyA;
          if (otherBody.label === 'platform' || otherBody.label === 'platformBody') {
            this.touchingGround = Math.max(0, this.touchingGround - 1);
            if (this.touchingGround === 0) {
              this.onIce = false;
              this.onSticky = false;
              this.currentPlatform = null;
            }
          }
        }
        
        // Check wall sensors
        if (bodyA === this.leftSensor || bodyB === this.leftSensor) {
          this.touchingLeft = false;
        }
        
        if (bodyA === this.rightSensor || bodyB === this.rightSensor) {
          this.touchingRight = false;
        }
      });
    });
  }
  
  handlePlatformContact(platformBody: any) {
    // Find the sprite associated with this body
    const scene = this.scene as any;
    const allPlatforms = [...(scene.platforms || []), ...(scene.movingPlatforms || [])];
    
    for (const platform of allPlatforms) {
      if (platform.body === platformBody.parent || platform.body === platformBody) {
        const type = platform.getData('type');
        this.currentPlatform = platform;
        
        if (type === 'ice') {
          this.onIce = true;
        } else if (type === 'sticky') {
          this.onSticky = true;
        } else if (type === 'bouncy') {
          this.bounce();
        } else if (type === 'crumbling') {
          scene.startCrumbling?.(platform);
        }
        break;
      }
    }
  }
  
  handleHazardCollision(hazardBody: any) {
    const scene = this.scene as any;
    
    // Find the hazard sprite
    for (const hazard of (scene.hazards || [])) {
      if (hazard.body === hazardBody.parent || hazard.body === hazardBody) {
        const type = hazard.getData('type');
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
        break;
      }
    }
  }
  
  handleCollectibleCollision(collectibleBody: any) {
    const scene = this.scene as any;
    
    // Find and collect the collectible
    for (let i = (scene.collectibles || []).length - 1; i >= 0; i--) {
      const collectible = scene.collectibles[i];
      if (collectible.body === collectibleBody.parent || collectible.body === collectibleBody) {
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
        break;
      }
    }
  }
  
  handleCheckpointCollision(checkpointBody: any) {
    const scene = this.scene as any;
    
    // Find and activate checkpoint
    for (const checkpoint of (scene.checkpoints || [])) {
      if (checkpoint.body === checkpointBody.parent || checkpoint.body === checkpointBody) {
        if (!checkpoint.getData('used')) {
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
        break;
      }
    }
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
    // Force ghost to stay upright every frame
    const { Body } = (window as any).Phaser.Physics.Matter.Matter;
    Body.setAngle(this.body as MatterJS.BodyType, 0);
    Body.setAngularVelocity(this.body as MatterJS.BodyType, 0);
    this.rotation = 0; // Also reset sprite rotation
    
    // Update cooldowns
    if (this.wallJumpCooldown > 0) {
      this.wallJumpCooldown -= delta;
    }
    
    // Handle input and movement
    this.handleInput(delta);
    
    // Update particle effects
    this.updateParticles();
  }
  
  handleInput(delta: number) {
    const onFloor = this.touchingGround > 0;
    
    // Handle coyote time and double jump
    if (onFloor) {
      this.coyoteTime = this.COYOTE_TIME_MAX;
      this.canDoubleJump = true; // Reset double jump when on ground
      this.isGroundPounding = false;
    } else {
      // Only decrease coyote time when not on floor
      if (this.coyoteTime > 0) {
        this.coyoteTime -= delta;
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
      this.jumpBufferTime -= delta;
    }
    
    // Check wall sliding
    this.checkWallSlide();
    
    // Handle ground pound
    if (groundPoundPressed && !onFloor && !this.isGroundPounding) {
      this.groundPound();
    }
    
    // Handle jumping
    if (this.jumpBufferTime > 0 && !this.isGroundPounding) {
      if (onFloor || this.coyoteTime > 0) {
        this.jump();
        this.jumpBufferTime = 0; // Clear buffer after jump
      } else if (this.isWallSliding && this.wallJumpCooldown <= 0) {
        this.wallJump();
        this.jumpBufferTime = 0;
      } else if (this.canDoubleJump && !onFloor) {
        // Double jump only when in air and haven't used it yet
        this.doubleJump();
        this.jumpBufferTime = 0;
      }
    }
    
    // Variable jump height
    const jumpReleased = (this.cursors.up.isUp && this.jumpKey.isUp && this.wasd.W.isUp);
    if (jumpReleased && this.body.velocity.y < -3 && !this.isGroundPounding) {
      this.setVelocityY(this.body.velocity.y * 0.6);
    }
    
    // Horizontal movement
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    
    if (!this.isGroundPounding) {
      let moveForce = this.MOVE_SPEED;
      
      // Adjust movement based on surface
      if (this.onIce) {
        moveForce *= 0.4;
      } else if (this.onSticky) {
        moveForce *= 0.5;
      } else if (!onFloor) {
        moveForce *= 0.8;
      }
      
      if (left && !right) {
        this.setVelocityX(Math.max(-5, this.body.velocity.x - moveForce));
        this.setFlipX(true);
      } else if (right && !left) {
        this.setVelocityX(Math.min(5, this.body.velocity.x + moveForce));
        this.setFlipX(false);
      } else {
        // Apply friction
        let friction = 0.92;
        if (this.onIce) {
          friction = 0.98;
        } else if (this.onSticky) {
          friction = 0.7;
        } else if (!onFloor) {
          friction = 0.95;
        }
        this.setVelocityX(this.body.velocity.x * friction);
      }
    }
    
    // Handle wall sliding physics
    if (this.isWallSliding && this.body.velocity.y > 1.5) {
      this.setVelocityY(1.5);
      this.particles.frequency = 30;
      this.particles.tint = 0x808080;
    }
    
    // Handle ground pound physics
    if (this.isGroundPounding) {
      this.setVelocityX(this.body.velocity.x * 0.9);
      this.setVelocityY(Math.min(this.GROUND_POUND_FORCE, this.body.velocity.y + 0.8));
      if (onFloor) {
        this.groundPoundLand();
      }
    }
    
    // Add platform velocity if on moving platform
    if (this.currentPlatform && this.currentPlatform.getData('type') === 'moving') {
      const platformVel = this.currentPlatform.body.velocity;
      this.setVelocity(
        this.body.velocity.x + platformVel.x,
        this.body.velocity.y
      );
    }
  }
  
  checkWallSlide() {
    const leftPressed = this.cursors.left?.isDown || this.wasd.A?.isDown;
    const rightPressed = this.cursors.right?.isDown || this.wasd.D?.isDown;
    const onFloor = this.touchingGround > 0;
    
    const movingTowardsWall = 
      (this.touchingLeft && leftPressed) || 
      (this.touchingRight && rightPressed);
    
    if (!onFloor && movingTowardsWall && this.body.velocity.y > 0.5 && !this.isGroundPounding) {
      this.isWallSliding = true;
      this.wallSlideSide = this.touchingLeft ? -1 : 1;
    } else {
      this.isWallSliding = false;
      this.wallSlideSide = 0;
    }
  }
  
  jump() {
    this.setVelocityY(-this.JUMP_FORCE * 1000);
    this.coyoteTime = 0;
    // Don't reset canDoubleJump here - it should be available after first jump
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 100,
      yoyo: true
    });
    
    console.log('Jump! canDoubleJump:', this.canDoubleJump);
  }
  
  doubleJump() {
    console.log('Double Jump!');
    this.setVelocityY(-this.DOUBLE_JUMP_FORCE * 1000);
    this.canDoubleJump = false; // Now consumed
    
    this.particles.frequency = 20;
    this.particles.tint = 0x805ad5;
    this.scene.time.delayedCall(300, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
    
    // Visual feedback for double jump
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 0.7,
      duration: 150,
      yoyo: true
    });
  }
  
  wallJump() {
    this.setVelocity(
      this.WALL_JUMP_X * -this.wallSlideSide,
      -this.WALL_JUMP_Y * 1000
    );
    this.jumpBufferTime = 0;
    this.canDoubleJump = true;
    this.wallJumpCooldown = this.WALL_JUMP_COOLDOWN;
    this.isWallSliding = false;
    
    // Removed rotation tween to keep ghost upright
    // Just do a scale effect instead
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2 * -this.wallSlideSide, // Flip horizontally based on wall side
      scaleY: 1.2,
      duration: 150,
      yoyo: true
    });
    
    this.particles.frequency = 20;
    this.particles.tint = 0xff6b35;
    this.scene.time.delayedCall(400, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
  }
  
  groundPound() {
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
    this.setVelocityY(-16);
    this.canDoubleJump = true;
    
    this.particles.frequency = 10;
    this.particles.tint = 0x10b981;
    this.scene.time.delayedCall(300, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
  }
  
  updateParticles() {
    const speed = Math.sqrt(
      this.body.velocity.x * this.body.velocity.x + 
      this.body.velocity.y * this.body.velocity.y
    );
    
    if (this.isWallSliding) {
      this.particles.frequency = 30;
      this.particles.speed = { min: 50, max: 100 };
    } else if (speed > 3) {
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
    this.setVelocityY(-5);
  }
  
  respawn(x: number, y: number) {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.canDoubleJump = true;
    this.touchingGround = 0;
    this.isGroundPounding = false;
    
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500
    });
  }
  
  getCategoryBits() {
    return {
      CATEGORY_GHOST: this.CATEGORY_GHOST,
      CATEGORY_PLATFORM: this.CATEGORY_PLATFORM,
      CATEGORY_HAZARD: this.CATEGORY_HAZARD,
      CATEGORY_COLLECTIBLE: this.CATEGORY_COLLECTIBLE,
      CATEGORY_CHECKPOINT: this.CATEGORY_CHECKPOINT
    };
  }
}