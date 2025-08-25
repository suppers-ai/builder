import BootScene from './scenes/BootScene.ts';
import PreloaderScene from './scenes/PreloaderScene.ts';
import MenuScene from './scenes/MenuScene.ts';
import GameScene from './scenes/GameScene.ts';
import GameOverScene from './scenes/GameOverScene.ts';

declare global {
  interface Window {
    Phaser: any;
  }
}

export default function createGame(parent: HTMLElement) {
  const config = {
    type: window.Phaser.AUTO,
    parent: parent,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a2e',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 800 },
        debug: false
      }
    },
    scene: [BootScene, PreloaderScene, MenuScene, GameScene, GameOverScene],
    scale: {
      mode: window.Phaser.Scale.FIT,
      autoCenter: window.Phaser.Scale.CENTER_BOTH
    },
    input: {
      keyboard: true
    }
  };

  return new window.Phaser.Game(config);
}