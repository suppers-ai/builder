export default class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  
  // Movement states
  private jumpsCount: number = 0;
  private maxJumps: number = 2;
  private isJumping: boolean = false;
  
  // Movement constants
  private readonly MOVE_SPEED = 200;
  private readonly JUMP_SPEED = 500;
  private readonly DOUBLE_JUMP_SPEED = 450;
  
  // Effects
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private jumpSound?: Phaser.Sound.BaseSound;
  private doubleJumpSound?: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ghost');
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Setup physics body
    this.setupPhysics();
    
    // Setup controls
    this.setupControls();
    
    // Setup particle effects
    this.setupParticles();
    
    // Setup animations
    this.setupAnimations();
  }
  
  private setupPhysics(): void {
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setDragX(100);
    this.setSize(24, 36);
    this.setOffset(3, 2);
    this.setMaxVelocity(300, 600);
  }
  
  private setupControls(): void {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.jumpKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Add WASD controls
    const wasd = this.scene.input.keyboard!.addKeys('W,A,S,D');
    
    // Merge WASD with cursor keys
    this.scene.input.keyboard!.on('keydown-A', () => {
      this.cursors.left.isDown = true;
    });
    this.scene.input.keyboard!.on('keyup-A', () => {
      this.cursors.left.isDown = false;
    });
    this.scene.input.keyboard!.on('keydown-D', () => {
      this.cursors.right.isDown = true;
    });
    this.scene.input.keyboard!.on('keyup-D', () => {
      this.cursors.right.isDown = false;
    });
    this.scene.input.keyboard!.on('keydown-W', () => {
      this.cursors.up.isDown = true;
    });
    this.scene.input.keyboard!.on('keyup-W', () => {
      this.cursors.up.isDown = false;
    });
  }
  
  private setupParticles(): void {
    this.particles = this.scene.add.particles(0, 0, 'particle', {
      follow: this,
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.6, end: 0 },
      speed: { min: 20, max: 60 },
      lifespan: 400,
      frequency: 50,
      tint: 0xffffff,
      blendMode: 'ADD'
    });
  }
  
  private setupAnimations(): void {
    // Create idle animation
    if (!this.scene.anims.exists('ghost-idle')) {
      this.scene.anims.create({
        key: 'ghost-idle',
        frames: [{ key: 'ghost', frame: 0 }],
        frameRate: 1,
        repeat: -1
      });
    }
    
    // Create jump animation
    if (!this.scene.anims.exists('ghost-jump')) {
      this.scene.anims.create({
        key: 'ghost-jump',
        frames: [{ key: 'ghost', frame: 0 }],
        frameRate: 1
      });
    }
    
    // Play idle by default
    this.play('ghost-idle');
  }
  
  update(): void {
    if (!this.body || !this.active) return;
    
    const onFloor = this.body.blocked.down || this.body.touching.down;
    
    // Reset jump count when on floor
    if (onFloor && this.body.velocity.y >= 0) {
      this.jumpsCount = 0;
      this.isJumping = false;
    }
    
    // Handle horizontal movement
    this.handleHorizontalMovement();
    
    // Handle jumping
    this.handleJumping(onFloor);
    
    // Update particles based on movement
    this.updateParticles();
    
    // Update animation
    this.updateAnimation(onFloor);
  }
  
  private handleHorizontalMovement(): void {
    if (this.cursors.left.isDown) {
      this.setVelocityX(-this.MOVE_SPEED);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(this.MOVE_SPEED);
      this.setFlipX(false);
    } else {
      // Apply friction
      this.setVelocityX(this.body!.velocity.x * 0.9);
    }
  }
  
  private handleJumping(onFloor: boolean): void {
    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                           Phaser.Input.Keyboard.JustDown(this.jumpKey);
    
    if (jumpJustPressed && this.jumpsCount < this.maxJumps) {
      this.jump();
    }
    
    // Variable jump height
    const jumpReleased = this.cursors.up.isUp && this.jumpKey.isUp;
    if (jumpReleased && this.body!.velocity.y < -100 && this.isJumping) {
      this.setVelocityY(this.body!.velocity.y * 0.6);
      this.isJumping = false;
    }
  }
  
  private jump(): void {
    const isDoubleJump = this.jumpsCount > 0;
    const jumpSpeed = isDoubleJump ? this.DOUBLE_JUMP_SPEED : this.JUMP_SPEED;
    
    this.setVelocityY(-jumpSpeed);
    this.jumpsCount++;
    this.isJumping = true;
    
    // Visual effects
    if (isDoubleJump) {
      this.doubleJumpEffect();
    } else {
      this.jumpEffect();
    }
    
    // Play jump animation
    this.play('ghost-jump');
  }
  
  private jumpEffect(): void {
    // Scale tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
    
    // Particle burst
    this.particles.frequency = 20;
    this.scene.time.delayedCall(200, () => {
      this.particles.frequency = 50;
    });
  }
  
  private doubleJumpEffect(): void {
    // Spin effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 0.7,
      duration: 150,
      yoyo: true,
      ease: 'Back'
    });
    
    // Purple particle burst
    this.particles.frequency = 10;
    this.particles.tint = 0x805ad5;
    this.scene.time.delayedCall(300, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
  }
  
  private updateParticles(): void {
    const speed = Math.abs(this.body!.velocity.x) + Math.abs(this.body!.velocity.y);
    
    if (speed > 300) {
      this.particles.frequency = 20;
    } else if (speed > 100) {
      this.particles.frequency = 40;
    } else {
      this.particles.frequency = 80;
    }
  }
  
  private updateAnimation(onFloor: boolean): void {
    if (!onFloor) {
      // In air
      if (this.anims.currentAnim?.key !== 'ghost-jump') {
        this.play('ghost-jump');
      }
    } else if (Math.abs(this.body!.velocity.x) > 10) {
      // Moving on ground
      if (this.anims.currentAnim?.key !== 'ghost-idle') {
        this.play('ghost-idle');
      }
    } else {
      // Standing still
      if (this.anims.currentAnim?.key !== 'ghost-idle') {
        this.play('ghost-idle');
      }
    }
  }
  
  // Power-up methods
  enableTripleJump(): void {
    this.maxJumps = 3;
    this.setTint(0x00ff00);
    this.scene.time.delayedCall(5000, () => {
      this.maxJumps = 2;
      this.clearTint();
    });
  }
  
  bounce(): void {
    this.setVelocityY(-600);
    this.jumpsCount = 0; // Reset jumps after bounce
    
    // Green particle effect
    this.particles.frequency = 10;
    this.particles.tint = 0x10b981;
    this.scene.time.delayedCall(300, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
  }
  
  hit(): void {
    // Flash red
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => this.clearTint());
    
    // Knockback
    this.setVelocityY(-200);
  }
  
  reset(x: number, y: number): void {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.jumpsCount = 0;
    this.isJumping = false;
    this.clearTint();
    
    // Fade in effect
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500
    });
  }
}