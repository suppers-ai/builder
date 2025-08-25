export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load any initial assets needed for the preloader
    this.createBasicAssets();
  }

  create(): void {
    // Initialize game settings
    this.initializeGame();
    
    // Move to preloader
    this.scene.start('PreloaderScene');
  }

  private createBasicAssets(): void {
    // Create a simple loading bar graphic
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x805ad5);
    graphics.fillRect(0, 0, 100, 10);
    graphics.generateTexture('loading-bar', 100, 10);
    graphics.destroy();
  }

  private initializeGame(): void {
    // Set up any global game settings
    this.registry.set('highScore', parseInt(localStorage.getItem('ghostlyGlideHighScore') || '0'));
    this.registry.set('soundEnabled', localStorage.getItem('ghostlyGlideSoundEnabled') !== 'false');
    this.registry.set('musicEnabled', localStorage.getItem('ghostlyGlideMusicEnabled') !== 'false');
  }
}