export enum PlatformType {
  NORMAL = 'normal',
  MOVING = 'moving',
  CRUMBLING = 'crumbling',
  BOUNCY = 'bouncy',
  ICE = 'ice',
  SPIKE = 'spike'
}

export default class Platform extends Phaser.Physics.Arcade.Sprite {
  public platformType: PlatformType = PlatformType.NORMAL;
  private originalX: number = 0;
  private originalY: number = 0;
  private movePattern?: 'horizontal' | 'vertical' | 'circular';
  private moveSpeed: number = 1;
  private moveRadius: number = 100;
  private moveTime: number = 0;
  private isCrumbling: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'platform');
    
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static by default
    
    this.setOrigin(0.5, 0.5);
  }
  
  spawn(x: number, y: number, type: PlatformType = PlatformType.NORMAL, width: number = 100): void {
    this.setPosition(x, y);
    this.originalX = x;
    this.originalY = y;
    this.platformType = type;
    this.isCrumbling = false;
    this.moveTime = 0;
    
    // Reset body
    this.setActive(true);
    this.setVisible(true);
    this.clearTint();
    this.setAlpha(1);
    
    // Configure based on type
    this.configureType(type, width);
    
    // Set display width
    this.displayWidth = width;
    this.refreshBody();
  }
  
  private configureType(type: PlatformType, width: number): void {
    // Reset to static first
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.StaticBody).setSize(width, 20);
    }
    
    switch (type) {
      case PlatformType.NORMAL:
        this.setTexture('platform');
        this.setTint(0x4a5568);
        break;
        
      case PlatformType.MOVING:
        this.setTexture('platform-moving');
        this.setTint(0x805ad5);
        // Convert to dynamic body for movement
        if (this.scene && this.scene.physics) {
          this.scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
          this.body!.setImmovable(true);
          this.body!.setAllowGravity(false);
        }
        this.movePattern = Phaser.Math.Between(0, 1) ? 'horizontal' : 'vertical';
        this.moveSpeed = Phaser.Math.FloatBetween(0.5, 2);
        this.moveRadius = Phaser.Math.Between(50, 150);
        break;
        
      case PlatformType.CRUMBLING:
        this.setTexture('platform');
        this.setTint(0xef4444);
        break;
        
      case PlatformType.BOUNCY:
        this.setTexture('platform');
        this.setTint(0x10b981);
        break;
        
      case PlatformType.ICE:
        this.setTexture('platform');
        this.setTint(0x88ddff);
        break;
        
      case PlatformType.SPIKE:
        this.setTexture('spike');
        this.setTint(0xdc2626);
        this.displayWidth = 30;
        break;
    }
  }
  
  update(time: number, delta: number): void {
    if (!this.active) return;
    
    // Update moving platforms
    if (this.platformType === PlatformType.MOVING && this.body) {
      this.moveTime += delta * 0.001 * this.moveSpeed;
      
      if (this.movePattern === 'horizontal') {
        const newX = this.originalX + Math.sin(this.moveTime) * this.moveRadius;
        this.body.velocity.x = (newX - this.x) * 60;
        this.x = newX;
      } else if (this.movePattern === 'vertical') {
        const newY = this.originalY + Math.sin(this.moveTime) * this.moveRadius * 0.5;
        this.body.velocity.y = (newY - this.y) * 60;
        this.y = newY;
      }
    }
    
    // Check if platform is too far below screen
    if (this.y > this.scene.cameras.main.scrollY + 800) {
      this.deactivate();
    }
  }
  
  startCrumbling(): void {
    if (this.isCrumbling || this.platformType !== PlatformType.CRUMBLING) return;
    
    this.isCrumbling = true;
    
    // Shake effect
    this.scene.tweens.add({
      targets: this,
      x: this.x + Phaser.Math.Between(-2, 2),
      duration: 50,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        // Fall and fade
        this.scene.tweens.add({
          targets: this,
          y: this.y + 300,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.deactivate();
          }
        });
      }
    });
  }
  
  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.body?.stop();
  }
  
  // Check if platform should trigger special behavior
  onPlayerContact(player: Phaser.Physics.Arcade.Sprite): void {
    switch (this.platformType) {
      case PlatformType.CRUMBLING:
        this.startCrumbling();
        break;
        
      case PlatformType.BOUNCY:
        // Bounce effect handled in collision callback
        break;
        
      case PlatformType.ICE:
        // Ice physics handled in player movement
        break;
        
      case PlatformType.SPIKE:
        // Damage handled in collision callback
        break;
    }
  }
}