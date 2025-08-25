export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  preload(): void {
    // Create loading UI
    this.createLoadingScreen();
    
    // Create all game assets
    this.createGameAssets();
  }

  create(): void {
    // Move to menu
    this.scene.start('MenuScene');
  }

  private createLoadingScreen(): void {
    const { width, height } = this.cameras.main;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    
    // Title
    const titleText = this.add.text(width / 2, height / 2 - 100, 'GHOSTLY GLIDE', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial Black'
    });
    titleText.setOrigin(0.5);
    
    // Loading text
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#805ad5'
    });
    loadingText.setOrigin(0.5);
    
    // Progress bar background
    const progressBox = this.add.rectangle(width / 2, height / 2 + 50, 320, 30, 0x222222);
    progressBox.setStrokeStyle(2, 0x805ad5);
    
    // Progress bar
    const progressBar = this.add.rectangle(width / 2 - 155, height / 2 + 50, 0, 20, 0x805ad5);
    progressBar.setOrigin(0, 0.5);
    
    // Update progress
    this.load.on('progress', (value: number) => {
      progressBar.width = 310 * value;
    });
    
    this.load.on('complete', () => {
      loadingText.setText('Complete!');
    });
  }

  private createGameAssets(): void {
    // Ghost sprite
    this.createGhostSprite();
    
    // Platform textures
    this.createPlatformTextures();
    
    // Collectibles
    this.createCollectibles();
    
    // Particles
    this.createParticles();
    
    // UI elements
    this.createUIElements();
  }

  private createGhostSprite(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    
    // Ghost body
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillRoundedRect(0, 0, 30, 40, 10);
    
    // Eyes
    graphics.fillStyle(0x000000);
    graphics.fillCircle(10, 15, 3);
    graphics.fillCircle(20, 15, 3);
    
    // Wavy bottom
    graphics.fillStyle(0xffffff, 0.9);
    graphics.beginPath();
    graphics.moveTo(0, 35);
    for (let i = 0; i <= 30; i += 5) {
      graphics.lineTo(i, 35 + Math.sin(i * 0.5) * 3);
    }
    graphics.lineTo(30, 40);
    graphics.lineTo(0, 40);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.generateTexture('ghost', 30, 40);
    graphics.destroy();
  }

  private createPlatformTextures(): void {
    const types = [
      { key: 'platform', color: 0x4a5568 },
      { key: 'platform-moving', color: 0x805ad5 },
      { key: 'platform-crumbling', color: 0xef4444 },
      { key: 'platform-bouncy', color: 0x10b981 },
      { key: 'platform-ice', color: 0x88ddff }
    ];
    
    types.forEach(({ key, color }) => {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(color);
      graphics.fillRoundedRect(0, 0, 100, 20, 3);
      
      // Add some detail
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillRect(0, 15, 100, 5);
      
      graphics.generateTexture(key, 100, 20);
      graphics.destroy();
    });
    
    // Spike platform
    const spikeGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    spikeGraphics.fillStyle(0xdc2626);
    for (let i = 0; i < 3; i++) {
      spikeGraphics.fillTriangle(
        i * 10 + 5, 20,
        i * 10, 10,
        i * 10 + 10, 10
      );
    }
    spikeGraphics.generateTexture('spike', 30, 20);
    spikeGraphics.destroy();
  }

  private createCollectibles(): void {
    // Orb
    const orbGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    orbGraphics.fillStyle(0x00ffff, 1);
    orbGraphics.fillCircle(15, 15, 12);
    orbGraphics.fillStyle(0xffffff, 0.6);
    orbGraphics.fillCircle(15, 15, 8);
    orbGraphics.fillStyle(0xffffff, 0.9);
    orbGraphics.fillCircle(12, 12, 3);
    orbGraphics.generateTexture('orb', 30, 30);
    orbGraphics.destroy();
    
    // Power-up
    const powerupGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    powerupGraphics.fillStyle(0xffd700);
    powerupGraphics.fillStar(15, 15, 5, 12, 6);
    powerupGraphics.generateTexture('powerup', 30, 30);
    powerupGraphics.destroy();
  }

  private createParticles(): void {
    const particleGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    particleGraphics.fillStyle(0xffffff);
    particleGraphics.fillCircle(3, 3, 3);
    particleGraphics.generateTexture('particle', 6, 6);
    particleGraphics.destroy();
  }

  private createUIElements(): void {
    // Button background
    const buttonGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    buttonGraphics.fillStyle(0x805ad5);
    buttonGraphics.fillRoundedRect(0, 0, 200, 50, 10);
    buttonGraphics.generateTexture('button', 200, 50);
    buttonGraphics.destroy();
    
    // Panel background
    const panelGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    panelGraphics.fillStyle(0x000000, 0.8);
    panelGraphics.fillRoundedRect(0, 0, 300, 200, 15);
    panelGraphics.lineStyle(2, 0x805ad5);
    panelGraphics.strokeRoundedRect(0, 0, 300, 200, 15);
    panelGraphics.generateTexture('panel', 300, 200);
    panelGraphics.destroy();
  }
}