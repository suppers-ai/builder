export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x805ad5, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Since we don't have actual image files, we'll create them programmatically
    this.createAssets();
  }

  createAssets() {
    // Create ghost sprite
    const ghostGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    ghostGraphics.fillStyle(0xffffff, 0.9);
    ghostGraphics.fillRoundedRect(0, 0, 30, 40, 10);
    ghostGraphics.fillStyle(0x000000);
    ghostGraphics.fillCircle(10, 15, 3);
    ghostGraphics.fillCircle(20, 15, 3);
    ghostGraphics.generateTexture('ghost', 30, 40);
    ghostGraphics.destroy();

    // Create platform textures
    this.createPlatformTexture('platform', 0x4a5568);
    this.createPlatformTexture('platform-moving', 0x805ad5);
    this.createPlatformTexture('platform-crumbling', 0xef4444);
    this.createPlatformTexture('platform-bouncy', 0x10b981);
    this.createPlatformTexture('platform-ice', 0x88ddff);
    this.createPlatformTexture('platform-sticky', 0xffaa00);
    this.createPlatformTexture('spike', 0xdc2626);

    // Create collectible orb
    const orbGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    orbGraphics.fillStyle(0x00ffff, 1);
    orbGraphics.fillCircle(10, 10, 10);
    orbGraphics.fillStyle(0xffffff, 0.5);
    orbGraphics.fillCircle(10, 10, 6);
    orbGraphics.generateTexture('orb', 20, 20);
    orbGraphics.destroy();

    // Create checkpoint flag
    const checkpointGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    checkpointGraphics.fillStyle(0xff0000);
    checkpointGraphics.fillTriangle(5, 5, 25, 10, 5, 15);
    checkpointGraphics.fillStyle(0x666666);
    checkpointGraphics.fillRect(3, 5, 2, 30);
    checkpointGraphics.generateTexture('checkpoint', 30, 35);
    checkpointGraphics.destroy();

    // Create particle for trail
    const particleGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(2, 2, 2);
    particleGraphics.generateTexture('particle', 4, 4);
    particleGraphics.destroy();
  }

  createPlatformTexture(key: string, color: number) {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(color);
    graphics.fillRoundedRect(0, 0, 100, 20, 3);
    graphics.generateTexture(key, 100, 20);
    graphics.destroy();
  }

  create() {
    this.scene.start('MainSceneArcade', { level: 1 });
    this.scene.start('UIScene');
  }
}