export default class GhostArcade extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  
  // Movement properties
  private canDoubleJump: boolean = true;
  private isGroundPounding: boolean = false;
  private coyoteTime: number = 0;
  private jumpBufferTime: number = 0;
  
  // Movement constants
  private readonly MOVE_SPEED = 160;
  private readonly JUMP_VELOCITY = -330;
  private readonly DOUBLE_JUMP_VELOCITY = -300;
  private readonly GROUND_POUND_SPEED = 600;
  private readonly COYOTE_TIME_MAX = 100;
  private readonly JUMP_BUFFER_MAX = 100;
  
  // Particles for trail effect
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ghost');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics body
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    this.setGravityY(600);
    this.setDrag(100, 0);
    this.setSize(20, 32);
    this.setOffset(6, 0);
    
    // Store reference for identification
    this.setData('type', 'ghost');
    
    // Set up input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys('W,A,S,D');
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
  
  update() {
    if (!this.body) return;
    
    const onFloor = this.body.blocked.down || this.body.touching.down;
    
    // Update coyote time
    if (onFloor) {
      this.coyoteTime = this.COYOTE_TIME_MAX;
      this.canDoubleJump = true;
      this.isGroundPounding = false;
    } else if (this.coyoteTime > 0) {
      this.coyoteTime--;
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
      this.jumpBufferTime--;
    }
    
    // Handle ground pound
    if (groundPoundPressed && !onFloor && !this.isGroundPounding) {
      this.groundPound();
    }
    
    // Handle jumping
    if (this.jumpBufferTime > 0 && !this.isGroundPounding) {
      if (onFloor || this.coyoteTime > 0) {
        this.jump();
      } else if (this.canDoubleJump) {
        this.doubleJump();
      }
    }
    
    // Variable jump height
    const jumpReleased = this.cursors.up.isUp && this.jumpKey.isUp && this.wasd.W.isUp;
    if (jumpReleased && this.body.velocity.y < -100 && !this.isGroundPounding) {
      this.setVelocityY(this.body.velocity.y * 0.5);
    }
    
    // Horizontal movement
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    
    if (left) {
      this.setVelocityX(-this.MOVE_SPEED);
      this.setFlipX(true);
    } else if (right) {
      this.setVelocityX(this.MOVE_SPEED);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }
    
    // Handle ground pound physics
    if (this.isGroundPounding) {
      this.setVelocityY(this.GROUND_POUND_SPEED);
      if (onFloor) {
        this.groundPoundLand();
      }
    }
    
    // Update particles
    this.updateParticles();
  }
  
  jump() {
    this.setVelocityY(this.JUMP_VELOCITY);
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
    this.setVelocityY(this.DOUBLE_JUMP_VELOCITY);
    this.canDoubleJump = false;
    this.jumpBufferTime = 0;
    
    this.particles.frequency = 20;
    this.particles.tint = 0x805ad5;
    this.scene.time.delayedCall(300, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
    
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 0.7,
      duration: 150,
      yoyo: true
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
    this.setVelocityY(-500);
    this.canDoubleJump = true;
    
    this.particles.frequency = 10;
    this.particles.tint = 0x10b981;
    this.scene.time.delayedCall(300, () => {
      this.particles.frequency = 50;
      this.particles.tint = 0xffffff;
    });
  }
  
  updateParticles() {
    const speed = Math.abs(this.body?.velocity.x || 0) + Math.abs(this.body?.velocity.y || 0);
    
    if (speed > 200) {
      this.particles.frequency = 30;
    } else if (speed > 50) {
      this.particles.frequency = 50;
    } else {
      this.particles.frequency = 100;
    }
  }
  
  takeDamage() {
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => this.clearTint());
    this.setVelocityY(-200);
  }
  
  respawn(x: number, y: number) {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.canDoubleJump = true;
    this.isGroundPounding = false;
    
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500
    });
  }
}