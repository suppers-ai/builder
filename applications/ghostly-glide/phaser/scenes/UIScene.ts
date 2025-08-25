export default class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private jumpsText!: Phaser.GameObjects.Text;
  
  private score: number = 0;
  private lives: number = 99;
  private level: number = 1;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Create UI container
    const uiContainer = this.add.container(0, 0);
    
    // Create semi-transparent background for UI
    const uiBg = this.add.graphics();
    uiBg.fillStyle(0x000000, 0.5);
    uiBg.fillRoundedRect(10, 10, 200, 120, 10);
    uiContainer.add(uiBg);
    
    // Score text
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    uiContainer.add(this.scoreText);
    
    // Lives text
    this.livesText = this.add.text(20, 45, 'Lives: 99', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    uiContainer.add(this.livesText);
    
    // Level text
    this.levelText = this.add.text(20, 70, 'Level: 1/10', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    uiContainer.add(this.levelText);
    
    // Jumps indicator
    this.jumpsText = this.add.text(20, 95, 'Jumps: 2/2', {
      fontSize: '18px',
      color: '#10b981',
      fontFamily: 'Arial'
    });
    uiContainer.add(this.jumpsText);
    
    // Controls help (top right)
    const helpBg = this.add.graphics();
    helpBg.fillStyle(0x000000, 0.3);
    helpBg.fillRoundedRect(550, 10, 240, 100, 10);
    
    const helpText = this.add.text(560, 20, 
      'Controls:\n' +
      'A/D or ← → : Move\n' +
      'W/SPACE/↑ : Jump\n' +
      'R: Restart | P/ESC: Pause', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    
    // Listen for events from MainSceneArcade
    const mainScene = this.scene.get('MainSceneArcade');
    
    if (mainScene && mainScene.events) {
      mainScene.events.on('scoreChanged', (score: number) => {
        this.score = score;
        this.scoreText.setText(`Score: ${score}`);
      });
      
      mainScene.events.on('livesChanged', (lives: number) => {
        this.lives = lives;
        this.livesText.setText(`Lives: ${lives}`);
        
        // Flash red when losing a life
        this.livesText.setColor('#ff0000');
        this.time.delayedCall(200, () => {
          this.livesText.setColor('#ffffff');
        });
      });
      
      mainScene.events.on('levelChanged', (level: number) => {
        this.level = level;
        this.levelText.setText(`Level: ${level}/10`);
      });
      
      mainScene.events.on('gameOver', (finalScore: number) => {
        this.showGameOver(finalScore);
      });
      
      mainScene.events.on('gameComplete', (finalScore: number) => {
        this.showVictory(finalScore);
      });
    }
  }

  showGameOver(finalScore: number) {
    // Create game over overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, 800, 600);
    
    const gameOverText = this.add.text(400, 250, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);
    
    const scoreText = this.add.text(400, 320, `Final Score: ${finalScore}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    scoreText.setOrigin(0.5);
    
    const restartText = this.add.text(400, 380, 'Press R to Restart', {
      fontSize: '20px',
      color: '#805ad5',
      fontFamily: 'Arial'
    });
    restartText.setOrigin(0.5);
    
    // Blink restart text
    this.tweens.add({
      targets: restartText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Listen for restart
    this.input.keyboard?.once('keydown-R', () => {
      this.scene.stop('MainScene');
      this.scene.stop('UIScene');
      this.scene.start('MainScene', { level: 1 });
      this.scene.start('UIScene');
    });
  }

  showVictory(finalScore: number) {
    // Create victory overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, 800, 600);
    
    const victoryText = this.add.text(400, 250, 'VICTORY!', {
      fontSize: '48px',
      color: '#10b981',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    victoryText.setOrigin(0.5);
    
    // Animate victory text
    this.tweens.add({
      targets: victoryText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    const scoreText = this.add.text(400, 320, `Final Score: ${finalScore}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    scoreText.setOrigin(0.5);
    
    const thanksText = this.add.text(400, 380, 'Thanks for playing!', {
      fontSize: '20px',
      color: '#805ad5',
      fontFamily: 'Arial'
    });
    thanksText.setOrigin(0.5);
    
    // Create confetti effect
    for (let i = 0; i < 50; i++) {
      const confetti = this.add.rectangle(
        Phaser.Math.Between(0, 800),
        -20,
        Phaser.Math.Between(5, 15),
        Phaser.Math.Between(5, 15),
        Phaser.Math.RND.pick([0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff])
      );
      
      this.tweens.add({
        targets: confetti,
        y: 620,
        x: confetti.x + Phaser.Math.Between(-100, 100),
        angle: Phaser.Math.Between(0, 360),
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  update() {
    // Update jump indicator based on ghost state
    // This would need to be connected to the actual ghost's jump state
    // For now, we'll just show it as a static indicator
  }
}