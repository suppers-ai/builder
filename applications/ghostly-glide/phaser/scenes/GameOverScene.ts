export default class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private highScore: number = 0;
  private isNewHighScore: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; highScore: number }): void {
    this.score = data.score || 0;
    this.highScore = data.highScore || 0;
    this.isNewHighScore = this.score >= this.highScore && this.score > 0;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Background
    this.createBackground();
    
    // Game Over title
    this.createGameOverTitle();
    
    // Score display
    this.createScoreDisplay();
    
    // Menu buttons
    this.createButtons();
    
    // Add some floating ghosts
    this.createFloatingGhosts();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    
    // Dark overlay
    const bg = this.add.rectangle(0, 0, width, height, 0x0a0a0f);
    bg.setOrigin(0, 0);
    
    // Add some stars
    for (let i = 0; i < 30; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.5)
      );
      
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

  private createGameOverTitle(): void {
    const { width } = this.cameras.main;
    
    const title = this.add.text(width / 2, 100, 'GAME OVER', {
      fontSize: '64px',
      color: '#dc2626',
      fontFamily: 'Arial Black'
    });
    title.setOrigin(0.5);
    title.setShadow(4, 4, '#000000', 8, true, true);
    
    // Pulse effect
    this.tweens.add({
      targets: title,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createScoreDisplay(): void {
    const { width, height } = this.cameras.main;
    const centerY = height / 2 - 50;
    
    // Score panel background
    const panel = this.add.sprite(width / 2, centerY, 'panel');
    panel.setScale(1.2, 0.8);
    panel.setAlpha(0.9);
    
    // Your Score
    const scoreLabel = this.add.text(width / 2, centerY - 40, 'SCORE', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    scoreLabel.setOrigin(0.5);
    
    const scoreText = this.add.text(width / 2, centerY, this.score.toString(), {
      fontSize: '48px',
      color: '#ffd700',
      fontFamily: 'Arial Black'
    });
    scoreText.setOrigin(0.5);
    scoreText.setShadow(2, 2, '#000000', 4, true, true);
    
    // High Score
    const highScoreText = this.add.text(width / 2, centerY + 50, `BEST: ${this.highScore}`, {
      fontSize: '20px',
      color: '#805ad5',
      fontFamily: 'Arial'
    });
    highScoreText.setOrigin(0.5);
    
    // New high score celebration
    if (this.isNewHighScore) {
      const newRecordText = this.add.text(width / 2, centerY - 80, 'NEW RECORD!', {
        fontSize: '28px',
        color: '#00ff00',
        fontFamily: 'Arial Black'
      });
      newRecordText.setOrigin(0.5);
      newRecordText.setShadow(0, 0, '#00ff00', 10, true, true);
      
      // Flash effect
      this.tweens.add({
        targets: newRecordText,
        alpha: 0.5,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
      
      // Create celebration particles
      this.createCelebrationParticles();
    }
    
    // Animate score counting up
    const counter = { value: 0 };
    this.tweens.add({
      targets: counter,
      value: this.score,
      duration: 1500,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        scoreText.setText(Math.floor(counter.value).toString());
      }
    });
  }

  private createButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = height / 2 + 100;
    
    // Retry button
    const retryButton = this.createButton(width / 2 - 70, buttonY, 'RETRY', () => {
      this.scene.start('GameScene');
    });
    
    retryButton.container.setScale(0);
    this.tweens.add({
      targets: retryButton.container,
      scale: 1,
      duration: 500,
      delay: 500,
      ease: 'Back.easeOut'
    });
    
    // Menu button
    const menuButton = this.createButton(width / 2 + 70, buttonY, 'MENU', () => {
      this.scene.start('MenuScene');
    });
    
    menuButton.container.setScale(0);
    this.tweens.add({
      targets: menuButton.container,
      scale: 1,
      duration: 500,
      delay: 600,
      ease: 'Back.easeOut'
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): any {
    const container = this.add.container(x, y);
    
    // Button background (smaller size)
    const bg = this.add.rectangle(0, 0, 120, 40, 0x805ad5);
    bg.setStrokeStyle(2, 0xffffff);
    container.add(bg);
    
    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial Black'
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);
    
    // Make interactive
    bg.setInteractive({ useHandCursor: true });
    
    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(0x9969d5);
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 100
      });
    });
    
    bg.on('pointerout', () => {
      bg.setFillStyle(0x805ad5);
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 100
      });
    });
    
    bg.on('pointerdown', () => {
      bg.setFillStyle(0x6040a5);
      container.setScale(0.95);
    });
    
    bg.on('pointerup', () => {
      bg.setFillStyle(0x805ad5);
      container.setScale(1);
      // Add a small delay for visual feedback
      this.time.delayedCall(100, callback);
    });
    
    return { container, bg, text: buttonText };
  }

  private createFloatingGhosts(): void {
    const { width, height } = this.cameras.main;
    
    // Create sad ghosts floating around
    for (let i = 0; i < 2; i++) {
      const ghost = this.add.sprite(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(200, height - 100),
        'ghost'
      );
      ghost.setAlpha(0.2);
      ghost.setScale(0.6);
      ghost.setTint(0x8888ff);
      
      // Floating animation
      this.tweens.add({
        targets: ghost,
        y: ghost.y - 30,
        x: ghost.x + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(2000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 500
      });
      
      // Rotation
      this.tweens.add({
        targets: ghost,
        angle: Phaser.Math.Between(-5, 5),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createCelebrationParticles(): void {
    const { width } = this.cameras.main;
    
    // Create confetti-like particles
    for (let i = 0; i < 20; i++) {
      const particle = this.add.rectangle(
        width / 2 + Phaser.Math.Between(-100, 100),
        100,
        Phaser.Math.Between(5, 10),
        Phaser.Math.Between(5, 10),
        Phaser.Math.Pick([0xffd700, 0x00ff00, 0xff00ff, 0x00ffff])
      );
      
      particle.setAlpha(0.8);
      
      this.tweens.add({
        targets: particle,
        y: 500,
        x: particle.x + Phaser.Math.Between(-50, 50),
        angle: Phaser.Math.Between(180, 720),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 3000),
        delay: i * 50,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
}