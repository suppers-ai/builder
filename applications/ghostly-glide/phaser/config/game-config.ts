import BootScene from '../scenes/BootScene';
import PreloaderScene from '../scenes/PreloaderScene';
import MenuScene from '../scenes/MenuScene';
import GameScene from '../scenes/GameScene';
import GameOverScene from '../scenes/GameOverScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloaderScene,
    MenuScene,
    GameScene,
    GameOverScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container'
  },
  input: {
    keyboard: true,
    mouse: true,
    touch: true
  }
};

export default gameConfig;