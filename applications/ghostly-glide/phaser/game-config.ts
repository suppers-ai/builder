import MainScene from './scenes/MainScene.ts';
import PreloadScene from './scenes/PreloadScene.ts';
import UIScene from './scenes/UIScene.ts';

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
      default: 'matter',
      matter: {
        gravity: { y: 1 },
        debug: false,
        enableSleeping: false,
        positionIterations: 6,
        velocityIterations: 4,
        constraintIterations: 2
      }
    },
    scene: [PreloadScene, MainScene, UIScene],
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