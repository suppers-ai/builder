export default class MenuScene extends Phaser.Scene {
  private highScore: number = 0;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Get high score
    this.highScore = this.registry.get('highScore') || 0;
    
    // Background
    this.createBackground();
    
    // Title
    this.createTitle();
    
    // Menu buttons
    this.createMenuButtons();
    
    // High score display
    this.createHighScoreDisplay();
    
    // Controls info
    this.createControlsInfo();
    
    // Start floating ghost animation
    this.createFloatingGhost();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Gradient background
    const bg = this.add.rectangle(0, 0, width, height, 0x1a1a2e);
    bg.setOrigin(0, 0);
    
    // Animated stars
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.8)
      );
      
      // Twinkle effect
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  private createTitle(): void {
    const { width } = this.cameras.main;
    
    // Main title
    const title = this.add.text(width / 2, 100, 'GHOSTLY', {
      fontSize: '72px',
      color: '#ffffff',
      fontFamily: 'Arial Black'
    });
    title.setOrigin(0.5);
    title.setShadow(4, 4, '#805ad5', 8, true, true);
    
    const subtitle = this.add.text(width / 2, 170, 'GLIDE', {
      fontSize: '72px',
      color: '#805ad5',
      fontFamily: 'Arial Black'
    });
    subtitle.setOrigin(0.5);
    subtitle.setShadow(4, 4, '#ffffff', 8, true, true);
    
    // Floating animation
    this.tweens.add({
      targets: [title, subtitle],
      y: '+=10',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createMenuButtons(): void {
    const { width, height } = this.cameras.main;
    
    // Play button
    const playButton = this.createButton(width / 2, height / 2, 'PLAY', () => {
      this.scene.start('GameScene');
    });
    
    // Scale effect on creation
    playButton.container.setScale(0);
    this.tweens.add({
      targets: playButton.container,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Settings button (placeholder)
    const settingsButton = this.createButton(width / 2, height / 2 + 80, 'SETTINGS', () => {
      // Toggle sound/music
      const soundEnabled = !this.registry.get('soundEnabled');
      this.registry.set('soundEnabled', soundEnabled);
      localStorage.setItem('ghostlyGlideSoundEnabled', soundEnabled.toString());
      
      // Visual feedback
      settingsButton.text.setText(soundEnabled ? 'SOUND: ON' : 'SOUND: OFF');
      this.time.delayedCall(1000, () => {
        settingsButton.text.setText('SETTINGS');
      });
    });
    
    settingsButton.container.setScale(0);
    this.tweens.add({
      targets: settingsButton.container,
      scale: 1,
      duration: 500,
      delay: 100,
      ease: 'Back.easeOut'
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): any {
    const container = this.add.container(x, y);
    
    // Button background
    const bg = this.add.sprite(0, 0, 'button');
    bg.setTint(0x805ad5);
    container.add(bg);
    
    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial Black'
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);
    
    // Make interactive
    bg.setInteractive({ useHandCursor: true });
    
    // Hover effects
    bg.on('pointerover', () => {
      bg.setTint(0x9969d5);
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 100
      });
    });
    
    bg.on('pointerout', () => {
      bg.setTint(0x805ad5);
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100
      });
    });
    
    bg.on('pointerdown', () => {
      bg.setTint(0x6040a5);
      container.setScale(0.95);
    });
    
    bg.on('pointerup', () => {
      bg.setTint(0x805ad5);
      container.setScale(1);
      callback();
    });
    
    return { container, bg, text: buttonText };
  }

  private createHighScoreDisplay(): void {
    const { width, height } = this.cameras.main;
    
    if (this.highScore > 0) {
      const highScoreText = this.add.text(width / 2, height - 100, `HIGH SCORE: ${this.highScore}`, {
        fontSize: '24px',
        color: '#ffd700',
        fontFamily: 'Arial'
      });
      highScoreText.setOrigin(0.5);
      
      // Glow effect
      highScoreText.setShadow(0, 0, '#ffd700', 10, true, true);
    }
  }

  private createControlsInfo(): void {
    const { width, height } = this.cameras.main;
    
    const controls = [
      'CONTROLS:',
      'A/D or ← → : Move',
      'W/SPACE/↑ : Jump',
      'Jump again in air for double jump!'
    ];
    
    const controlsText = this.add.text(width / 2, height - 50, controls.join('\n'), {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 5
    });
    controlsText.setOrigin(0.5);
    controlsText.setAlpha(0.7);
  }

  private createFloatingGhost(): void {
    const { width, height } = this.cameras.main;
    
    // Create multiple floating ghosts
    for (let i = 0; i < 3; i++) {
      const ghost = this.add.sprite(
        Phaser.Math.Between(100, width - 100),
        Phaser.Math.Between(250, height - 150),
        'ghost'
      );
      ghost.setAlpha(0.3);
      ghost.setScale(0.8);
      
      // Random floating pattern
      this.tweens.add({
        targets: ghost,
        x: `+=${Phaser.Math.Between(-50, 50)}`,
        y: `+=${Phaser.Math.Between(-30, 30)}`,
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 500
      });
      
      // Rotation
      this.tweens.add({
        targets: ghost,
        angle: Phaser.Math.Between(-10, 10),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
}