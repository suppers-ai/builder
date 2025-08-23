import type { Ghost, Obstacle, Collectible, Level, GameState, InputState, Vector2D } from "../types/game.ts";
import { AudioManager } from "./audio.ts";
import { LevelGenerator } from "./levels.ts";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ghost: Ghost;
  private currentLevel: Level | null = null;
  private gameState: GameState;
  private inputState: InputState;
  private lastTime: number = 0;
  private animationId: number | null = null;
  private audio: AudioManager;
  private camera: { x: number; y: number };
  private levelHeight: number = 3000; // Total level height
  private scrollSpeed: number = 50; // Base scroll speed

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    
    this.audio = new AudioManager();

    this.ghost = this.createGhost();
    this.gameState = this.createInitialGameState();
    this.inputState = this.createInitialInputState();
    this.camera = { x: 0, y: 0 };
    
    this.setupEventListeners();
  }

  private createGhost(): Ghost {
    return {
      id: 'player-ghost',
      position: { x: 400, y: this.canvas.height - 100 }, // Start near bottom of screen
      velocity: { x: 0, y: 0 }, // No automatic movement
      width: 40,
      height: 50,
      active: true,
      health: 3,
      isEthereal: false,
      etherealTimer: 0,
      trail: []
    };
  }

  private createInitialGameState(): GameState {
    return {
      currentLevel: 1,
      score: 0,
      lives: 3,
      orbsCollected: 0,
      combo: 0,
      maxCombo: 0,
      gameOver: false,
      paused: false,
      victory: false,
      highScore: parseInt(localStorage.getItem('ghostly-glide-highscore') || '0'),
      powerUps: {
        speed: 0,
        invincibility: 0
      }
    };
  }

  private createInitialInputState(): InputState {
    return {
      left: false,
      right: false,
      up: false,
      down: false,
      ethereal: false,
      pause: false
    };
  }

  private setupEventListeners(): void {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
          this.inputState.left = true;
          break;
        case 'ArrowRight':
        case 'd':
          this.inputState.right = true;
          break;
        case 'ArrowUp':
        case 'w':
          this.inputState.up = true;
          break;
        case 'ArrowDown':
        case 's':
          this.inputState.down = true;
          break;
        case ' ':
          this.inputState.ethereal = true;
          break;
        case 'Escape':
        case 'p':
          this.togglePause();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
          this.inputState.left = false;
          break;
        case 'ArrowRight':
        case 'd':
          this.inputState.right = false;
          break;
        case 'ArrowUp':
        case 'w':
          this.inputState.up = false;
          break;
        case 'ArrowDown':
        case 's':
          this.inputState.down = false;
          break;
        case ' ':
          this.inputState.ethereal = false;
          break;
      }
    });

    // Touch/mouse controls
    this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouse.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleTouch(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    
    if (x < this.canvas.width / 2) {
      this.inputState.left = true;
      this.inputState.right = false;
    } else {
      this.inputState.right = true;
      this.inputState.left = false;
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    this.inputState.left = false;
    this.inputState.right = false;
  }

  private handleMouse(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    if (x < this.canvas.width / 2) {
      this.inputState.left = true;
      this.inputState.right = false;
    } else {
      this.inputState.right = true;
      this.inputState.left = false;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (e.buttons === 1) {
      this.handleMouse(e);
    }
  }

  private handleMouseUp(): void {
    this.inputState.left = false;
    this.inputState.right = false;
  }

  public loadLevel(level: Level): void {
    this.currentLevel = level;
    this.levelHeight = level.height || 3000;
    this.ghost.position = { x: this.canvas.width / 2, y: this.levelHeight - 100 };
    this.camera.x = 0;
    this.camera.y = this.levelHeight - this.canvas.height; // Start camera at bottom of level
    this.gameState.orbsCollected = 0;
    this.gameState.combo = 0;
  }

  private updateGhost(deltaTime: number): void {
    if (!this.currentLevel) return;

    // Update trail
    this.ghost.trail.unshift({ ...this.ghost.position });
    if (this.ghost.trail.length > 10) {
      this.ghost.trail.pop();
    }

    // Automatic upward scrolling of the camera
    const baseScrollSpeed = this.scrollSpeed;
    const speedMultiplier = this.gameState.powerUps.speed > 0 ? 1.5 : 1;
    
    // Move camera up (decreasing y)
    this.camera.y -= baseScrollSpeed * speedMultiplier * deltaTime;
    
    // Keep camera within level bounds
    this.camera.y = Math.max(0, Math.min(this.levelHeight - this.canvas.height, this.camera.y));

    // Horizontal movement based on input
    const horizontalSpeed = 200 * speedMultiplier;
    if (this.inputState.left) {
      this.ghost.position.x -= horizontalSpeed * deltaTime;
    }
    if (this.inputState.right) {
      this.ghost.position.x += horizontalSpeed * deltaTime;
    }

    // Vertical movement (player can move up/down slightly within screen)
    const verticalSpeed = 150 * speedMultiplier;
    if (this.inputState.up) {
      this.ghost.position.y -= verticalSpeed * deltaTime;
    }
    if (this.inputState.down) {
      this.ghost.position.y += verticalSpeed * deltaTime;
    }

    // Keep ghost within horizontal bounds
    this.ghost.position.x = Math.max(
      this.ghost.width / 2,
      Math.min(this.canvas.width - this.ghost.width / 2, this.ghost.position.x)
    );

    // Keep ghost on screen vertically (relative to camera)
    const screenTop = this.camera.y;
    const screenBottom = this.camera.y + this.canvas.height;
    
    // If ghost falls too far behind camera, lose life
    if (this.ghost.position.y > screenBottom - 50) {
      this.loseLife();
      return;
    }
    
    // Don't let ghost go too far ahead
    this.ghost.position.y = Math.max(
      screenTop + 50,
      Math.min(screenBottom - this.ghost.height - 20, this.ghost.position.y)
    );

    // Update ethereal timer
    if (this.ghost.etherealTimer > 0) {
      this.ghost.etherealTimer -= deltaTime;
      if (this.ghost.etherealTimer <= 0) {
        this.ghost.isEthereal = false;
      }
    }

    // Activate ethereal form
    if (this.inputState.ethereal && !this.ghost.isEthereal && this.ghost.etherealTimer <= -5) {
      this.ghost.isEthereal = true;
      this.ghost.etherealTimer = 3; // 3 seconds of ethereal form
      this.audio.playSound('ethereal');
    } else if (this.ghost.etherealTimer <= 0) {
      this.ghost.etherealTimer -= deltaTime; // Cooldown
    }

    // Update power-up timers
    if (this.gameState.powerUps.speed > 0) {
      this.gameState.powerUps.speed -= deltaTime;
    }
    if (this.gameState.powerUps.invincibility > 0) {
      this.gameState.powerUps.invincibility -= deltaTime;
    }

    // Check if reached the top of the level (level complete)
    if (this.camera.y <= 0 && this.ghost.position.y < 100) {
      this.completeLevel();
    }
  }

  private checkCollisions(): void {
    if (!this.currentLevel) return;

    // Check obstacle collisions
    for (const obstacle of this.currentLevel.obstacles) {
      if (!obstacle.active) continue;
      
      if (this.checkCollision(this.ghost, obstacle)) {
        if (!this.ghost.isEthereal && this.gameState.powerUps.invincibility <= 0) {
          if (obstacle.type === 'spooky_zone') {
            // Slow down in spooky zones
            this.ghost.velocity.y = -0.5;
          } else {
            // Take damage from solid obstacles
            this.takeDamage(obstacle.damage);
          }
        }
      }
    }

    // Check collectible collisions
    for (const collectible of this.currentLevel.collectibles) {
      if (!collectible.active || collectible.collected) continue;
      
      if (this.checkCollision(this.ghost, collectible)) {
        this.collectItem(collectible);
      }
    }
  }

  private checkCollision(a: { position: Vector2D; width: number; height: number },
                        b: { position: Vector2D; width: number; height: number }): boolean {
    return Math.abs(a.position.x - b.position.x) < (a.width + b.width) / 2 &&
           Math.abs(a.position.y - b.position.y) < (a.height + b.height) / 2;
  }

  private collectItem(collectible: Collectible): void {
    collectible.collected = true;
    collectible.active = false;

    switch (collectible.type) {
      case 'spirit_orb':
        this.gameState.orbsCollected++;
        this.gameState.score += collectible.value * (1 + this.gameState.combo * 0.1);
        this.gameState.combo++;
        if (this.gameState.combo > this.gameState.maxCombo) {
          this.gameState.maxCombo = this.gameState.combo;
        }
        this.audio.playSound('collect');
        break;
      case 'poltergeist_pearl':
        this.gameState.score += collectible.value;
        this.gameState.powerUps.speed = 5; // 5 seconds of speed
        this.audio.playSound('powerup');
        break;
      case 'speed_boost':
        this.gameState.powerUps.speed = 5;
        this.audio.playSound('powerup');
        break;
      case 'invincibility':
        this.gameState.powerUps.invincibility = 5;
        this.audio.playSound('powerup');
        break;
      case 'extra_life':
        this.gameState.lives++;
        this.audio.playSound('powerup');
        break;
    }
  }

  private takeDamage(amount: number): void {
    this.ghost.health -= amount;
    this.gameState.combo = 0; // Reset combo on damage
    this.audio.playSound('damage');
    
    if (this.ghost.health <= 0) {
      this.loseLife();
    }
  }

  private loseLife(): void {
    this.gameState.lives--;
    
    if (this.gameState.lives <= 0) {
      this.gameOver();
    } else {
      // Reset ghost position
      if (this.currentLevel) {
        this.ghost.position = { ...this.currentLevel.spawnPoint };
        this.ghost.health = 3;
        this.ghost.velocity.y = -1;
      }
    }
  }

  private completeLevel(): void {
    if (!this.currentLevel) return;
    
    if (this.gameState.orbsCollected >= this.currentLevel.requiredOrbs) {
      // Level complete!
      this.gameState.score += 1000;
      this.gameState.currentLevel++;
      this.audio.playSound('levelComplete');
      
      // Load next level or show victory
      if (this.gameState.currentLevel > 10) {
        this.victory();
      } else {
        // Load next level
        const levelGen = new LevelGenerator();
        const nextLevel = levelGen.getLevel(this.gameState.currentLevel);
        if (nextLevel) {
          this.loadLevel(nextLevel);
        } else {
          this.victory(); // No more levels
        }
      }
    } else {
      // Not enough orbs, show message
      console.log(`Need ${this.currentLevel.requiredOrbs - this.gameState.orbsCollected} more orbs!`);
    }
  }

  private gameOver(): void {
    this.gameState.gameOver = true;
    this.audio.playSound('gameOver');
    this.audio.stopBackgroundMusic();
    
    if (this.gameState.score > this.gameState.highScore) {
      this.gameState.highScore = this.gameState.score;
      localStorage.setItem('ghostly-glide-highscore', this.gameState.score.toString());
    }
    
    this.stop();
  }

  private victory(): void {
    this.gameState.victory = true;
    this.gameState.score += 5000; // Victory bonus
    
    if (this.gameState.score > this.gameState.highScore) {
      this.gameState.highScore = this.gameState.score;
      localStorage.setItem('ghostly-glide-highscore', this.gameState.score.toString());
    }
    
    this.stop();
  }

  private togglePause(): void {
    this.gameState.paused = !this.gameState.paused;
  }

  private updateObstacles(deltaTime: number): void {
    if (!this.currentLevel) return;

    for (const obstacle of this.currentLevel.obstacles) {
      if (!obstacle.active || obstacle.type === 'static') continue;

      // Update dynamic obstacles
      switch (obstacle.pattern) {
        case 'horizontal':
          obstacle.position.x += obstacle.velocity.x * 100 * deltaTime;
          if (obstacle.position.x < 50 || obstacle.position.x > this.canvas.width - 50) {
            obstacle.velocity.x *= -1;
          }
          break;
        case 'vertical':
          obstacle.position.y += obstacle.velocity.y * 100 * deltaTime;
          if (obstacle.position.y < 50 || obstacle.position.y > this.canvas.height - 50) {
            obstacle.velocity.y *= -1;
          }
          break;
        case 'circular':
          const time = Date.now() / 1000;
          const radius = obstacle.patternData?.radius || 50;
          const speed = obstacle.patternData?.speed || 1;
          obstacle.position.x = obstacle.patternData?.centerX + Math.cos(time * speed) * radius;
          obstacle.position.y = obstacle.patternData?.centerY + Math.sin(time * speed) * radius;
          break;
      }
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.currentLevel) {
      this.renderMenu();
      return;
    }

    // Save context state
    this.ctx.save();

    // Render parallax background layers
    this.renderBackground();

    // Apply camera transform for game objects
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // Only render objects that are visible on screen
    const screenTop = this.camera.y - 100;
    const screenBottom = this.camera.y + this.canvas.height + 100;

    // Render obstacles
    for (const obstacle of this.currentLevel.obstacles) {
      if (!obstacle.active) continue;
      
      // Skip if outside screen bounds
      if (obstacle.position.y < screenTop || obstacle.position.y > screenBottom) continue;
      
      this.ctx.save();
      if (obstacle.type === 'spooky_zone') {
        this.ctx.fillStyle = 'rgba(128, 0, 255, 0.3)';
      } else {
        this.ctx.fillStyle = '#4a0080';
      }
      
      this.ctx.fillRect(
        obstacle.position.x - obstacle.width / 2,
        obstacle.position.y - obstacle.height / 2,
        obstacle.width,
        obstacle.height
      );
      this.ctx.restore();
    }

    // Render collectibles
    for (const collectible of this.currentLevel.collectibles) {
      if (!collectible.active || collectible.collected) continue;
      
      // Skip if outside screen bounds
      if (collectible.position.y < screenTop || collectible.position.y > screenBottom) continue;
      
      this.ctx.save();
      
      // Add glow effect
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = collectible.type === 'spirit_orb' ? '#00ffff' : '#ff00ff';
      
      // Draw collectible with pulsing effect
      const pulse = Math.sin(Date.now() / 200) * 0.1 + 1;
      this.ctx.fillStyle = collectible.type === 'spirit_orb' ? '#00ffff' : '#ff00ff';
      this.ctx.beginPath();
      this.ctx.arc(
        collectible.position.x,
        collectible.position.y,
        collectible.width / 2 * pulse,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      this.ctx.restore();
    }

    // Render magical rainbow trail
    this.ctx.save();
    for (let i = 0; i < this.ghost.trail.length; i++) {
      const progress = i / this.ghost.trail.length;
      const alpha = (1 - progress) * 0.4;
      
      // Rainbow colors for trail
      const hue = (Date.now() / 20 - i * 15) % 360;
      const size = this.ghost.width * (1 - progress) * 0.8;
      
      // Add soft glow to trail
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = `hsla(${hue}, 70%, 60%, ${alpha})`;
      
      // Draw trail circles with gradient
      const gradient = this.ctx.createRadialGradient(
        this.ghost.trail[i].x,
        this.ghost.trail[i].y,
        0,
        this.ghost.trail[i].x,
        this.ghost.trail[i].y,
        size / 2
      );
      gradient.addColorStop(0, `hsla(${hue}, 100%, 80%, ${alpha})`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 60%, ${alpha * 0.5})`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(
        this.ghost.trail[i].x,
        this.ghost.trail[i].y,
        size / 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      // Add little sparkles to trail
      if (i % 2 === 0) {
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = `hsla(${hue}, 100%, 90%, ${alpha * 1.5})`;
        const sparkleSize = 2 * (1 - progress);
        this.ctx.fillRect(
          this.ghost.trail[i].x - sparkleSize / 2,
          this.ghost.trail[i].y - sparkleSize / 2,
          sparkleSize,
          sparkleSize
        );
      }
    }
    this.ctx.restore();

    // Render cute ghost
    this.renderCuteGhost();

    // Restore context (remove camera transform)
    this.ctx.restore();

    // Render UI (not affected by camera)
    this.renderUI();

    // Render pause overlay
    if (this.gameState.paused) {
      this.renderPauseOverlay();
    }

    // Render game over overlay
    if (this.gameState.gameOver) {
      this.renderGameOverOverlay();
    }

    // Render victory overlay
    if (this.gameState.victory) {
      this.renderVictoryOverlay();
    }
  }

  private renderCuteGhost(): void {
    this.ctx.save();
    
    const time = Date.now() / 1000;
    const bounce = Math.sin(time * 3) * 2; // Gentle bouncing
    const wobble = Math.sin(time * 2) * 0.02; // Slight rotation wobble
    
    // Position with bounce
    const ghostX = this.ghost.position.x;
    const ghostY = this.ghost.position.y + bounce;
    
    // Apply wobble rotation
    this.ctx.translate(ghostX, ghostY);
    this.ctx.rotate(wobble);
    this.ctx.translate(-ghostX, -ghostY);
    
    // Sparkles around ghost (when powered up or ethereal)
    if (this.ghost.isEthereal || this.gameState.powerUps.invincibility > 0) {
      this.ctx.fillStyle = this.ghost.isEthereal ? '#ff66ff' : '#ffff66';
      for (let i = 0; i < 6; i++) {
        const sparkleAngle = (time * 2 + i * Math.PI / 3) % (Math.PI * 2);
        const sparkleRadius = 35 + Math.sin(time * 4 + i) * 5;
        const sparkleX = ghostX + Math.cos(sparkleAngle) * sparkleRadius;
        const sparkleY = ghostY - 10 + Math.sin(sparkleAngle) * sparkleRadius;
        const sparkleSize = 2 + Math.sin(time * 8 + i) * 1;
        
        this.ctx.beginPath();
        // Draw star-shaped sparkle
        for (let j = 0; j < 4; j++) {
          const angle = j * Math.PI / 2;
          const x = sparkleX + Math.cos(angle) * sparkleSize;
          const y = sparkleY + Math.sin(angle) * sparkleSize;
          if (j === 0) {
            this.ctx.moveTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
    
    // Soft glow effect
    this.ctx.shadowBlur = 25;
    this.ctx.shadowColor = this.ghost.isEthereal ? '#ff99ff' : '#aaccff';
    
    // Ghost body - more rounded and chubby
    const alpha = this.ghost.isEthereal ? 0.6 : 0.95;
    
    // Body gradient for more depth
    const bodyGradient = this.ctx.createRadialGradient(
      ghostX, ghostY - 10,
      0,
      ghostX, ghostY,
      this.ghost.width / 2
    );
    bodyGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    bodyGradient.addColorStop(0.3, `rgba(230, 240, 255, ${alpha})`);
    bodyGradient.addColorStop(1, `rgba(200, 220, 255, ${alpha})`);
    
    this.ctx.fillStyle = bodyGradient;
    
    // Draw cute rounded ghost body
    this.ctx.beginPath();
    
    // Head (more rounded and chubby)
    this.ctx.arc(
      ghostX,
      ghostY - this.ghost.height / 3,
      this.ghost.width / 2 + 5,
      Math.PI, 0
    );
    
    // Body sides (smoother curves)
    this.ctx.bezierCurveTo(
      ghostX + this.ghost.width / 2 + 5, ghostY - this.ghost.height / 3,
      ghostX + this.ghost.width / 2 + 3, ghostY,
      ghostX + this.ghost.width / 2, ghostY + 5
    );
    
    // Wavy bottom with cute ruffles
    const waves = 4;
    const waveWidth = this.ghost.width / waves;
    for (let i = waves; i >= 0; i--) {
      const waveX = ghostX - this.ghost.width / 2 + (i * waveWidth);
      const waveY = ghostY + 5 + Math.sin(time * 3 + i * 0.5) * 4;
      
      if (i === waves) {
        this.ctx.lineTo(waveX, waveY);
      } else {
        const controlX = waveX + waveWidth / 2;
        const controlY = waveY + 8;
        this.ctx.quadraticCurveTo(controlX, controlY, waveX, waveY);
      }
    }
    
    // Complete the shape
    this.ctx.bezierCurveTo(
      ghostX - this.ghost.width / 2, ghostY,
      ghostX - this.ghost.width / 2 - 3, ghostY - this.ghost.height / 3,
      ghostX - this.ghost.width / 2 - 5, ghostY - this.ghost.height / 3
    );
    
    this.ctx.closePath();
    this.ctx.fill();
    
    // Remove shadow for facial features
    this.ctx.shadowBlur = 0;
    
    // Cute large eyes
    const eyeSize = 6;
    const eyeY = ghostY - 12;
    const eyeSpacing = 10;
    const blinkChance = Math.random();
    const isBlinking = blinkChance < 0.02; // Occasional blinking
    
    // Left eye
    this.ctx.fillStyle = '#000';
    if (!isBlinking) {
      // Eye white
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.ellipse(ghostX - eyeSpacing, eyeY, eyeSize, eyeSize * 1.2, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Eye pupil
      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      const pupilOffset = this.inputState.left ? -1 : this.inputState.right ? 1 : 0;
      this.ctx.ellipse(ghostX - eyeSpacing + pupilOffset, eyeY, eyeSize * 0.6, eyeSize * 0.7, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Eye shine
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(ghostX - eyeSpacing + pupilOffset - 1, eyeY - 2, eyeSize * 0.2, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Closed eye (cute line)
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(ghostX - eyeSpacing, eyeY, eyeSize * 0.8, 0, Math.PI);
      this.ctx.stroke();
    }
    
    // Right eye
    if (!isBlinking) {
      // Eye white
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.ellipse(ghostX + eyeSpacing, eyeY, eyeSize, eyeSize * 1.2, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Eye pupil
      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      const pupilOffset = this.inputState.left ? -1 : this.inputState.right ? 1 : 0;
      this.ctx.ellipse(ghostX + eyeSpacing + pupilOffset, eyeY, eyeSize * 0.6, eyeSize * 0.7, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Eye shine
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(ghostX + eyeSpacing + pupilOffset - 1, eyeY - 2, eyeSize * 0.2, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Closed eye (cute line)
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(ghostX + eyeSpacing, eyeY, eyeSize * 0.8, 0, Math.PI);
      this.ctx.stroke();
    }
    
    // Cute mouth
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    
    if (this.ghost.health < 2) {
      // Worried expression
      this.ctx.arc(ghostX, eyeY + 8, 4, Math.PI * 0.2, Math.PI * 0.8);
    } else if (this.gameState.combo > 3) {
      // Excited expression
      this.ctx.arc(ghostX, eyeY + 5, 5, 0, Math.PI);
    } else {
      // Happy expression
      this.ctx.arc(ghostX, eyeY + 6, 4, Math.PI * 0.1, Math.PI * 0.9);
    }
    this.ctx.stroke();
    
    // Rosy cheeks
    this.ctx.fillStyle = 'rgba(255, 150, 150, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(ghostX - 18, eyeY + 2, 5, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.ellipse(ghostX + 18, eyeY + 2, 5, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Little arms (when moving)
    if (this.inputState.left || this.inputState.right) {
      this.ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      
      // Left arm
      const leftArmAngle = this.inputState.left ? -0.8 : -0.3;
      this.ctx.save();
      this.ctx.translate(ghostX - 15, ghostY - 5);
      this.ctx.rotate(leftArmAngle + Math.sin(time * 8) * 0.1);
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      
      // Right arm
      const rightArmAngle = this.inputState.right ? 0.8 : 0.3;
      this.ctx.save();
      this.ctx.translate(ghostX + 15, ghostY - 5);
      this.ctx.rotate(rightArmAngle - Math.sin(time * 8) * 0.1);
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
    
    // Hearts when collecting orbs (combo indicator)
    if (this.gameState.combo > 0 && Math.random() < 0.3) {
      this.ctx.fillStyle = '#ff69b4';
      const heartY = ghostY - 35 - Math.random() * 10;
      const heartX = ghostX + (Math.random() - 0.5) * 20;
      const heartSize = 3 + this.gameState.combo * 0.5;
      
      // Draw heart shape
      this.ctx.beginPath();
      this.ctx.moveTo(heartX, heartY + heartSize / 4);
      this.ctx.bezierCurveTo(
        heartX, heartY,
        heartX - heartSize / 2, heartY,
        heartX - heartSize / 2, heartY + heartSize / 4
      );
      this.ctx.bezierCurveTo(
        heartX - heartSize / 2, heartY + heartSize / 2,
        heartX, heartY + heartSize * 0.7,
        heartX, heartY + heartSize
      );
      this.ctx.bezierCurveTo(
        heartX, heartY + heartSize * 0.7,
        heartX + heartSize / 2, heartY + heartSize / 2,
        heartX + heartSize / 2, heartY + heartSize / 4
      );
      this.ctx.bezierCurveTo(
        heartX + heartSize / 2, heartY,
        heartX, heartY,
        heartX, heartY + heartSize / 4
      );
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  private renderBackground(): void {
    // Multi-layer parallax background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    
    // Dark to light gradient for spooky atmosphere
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#2a2a3e');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw parallax fog/mist layers
    this.ctx.fillStyle = 'rgba(100, 100, 150, 0.1)';
    const time = Date.now() / 1000;
    
    // Far background layer (moves slowest)
    for (let i = 0; i < 5; i++) {
      const y = ((this.camera.y * 0.2 + i * 200 + time * 10) % this.canvas.height);
      this.ctx.fillRect(0, y, this.canvas.width, 50);
    }
    
    // Mid background layer
    this.ctx.fillStyle = 'rgba(120, 120, 170, 0.08)';
    for (let i = 0; i < 8; i++) {
      const y = ((this.camera.y * 0.4 + i * 150 + time * 20) % this.canvas.height);
      const width = Math.sin(time + i) * 50 + this.canvas.width;
      this.ctx.fillRect((Math.sin(time * 0.5 + i) * 100), y, width, 30);
    }
    
    // Near background layer (decorative elements)
    this.ctx.fillStyle = 'rgba(150, 100, 200, 0.05)';
    for (let i = 0; i < 10; i++) {
      const x = (Math.sin(time * 0.3 + i * 2) + 1) * this.canvas.width / 2;
      const y = ((this.camera.y * 0.6 + i * 100) % this.canvas.height);
      const size = Math.sin(time + i) * 20 + 40;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private renderUI(): void {
    // Score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 20px monospace';
    this.ctx.fillText(`Score: ${Math.floor(this.gameState.score)}`, 10, 30);
    
    // Lives
    this.ctx.fillText(`Lives: ${this.gameState.lives}`, 10, 60);
    
    // Orbs collected
    if (this.currentLevel) {
      this.ctx.fillText(
        `Orbs: ${this.gameState.orbsCollected}/${this.currentLevel.requiredOrbs}`,
        10, 90
      );
    }
    
    // Combo
    if (this.gameState.combo > 1) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.fillText(`Combo x${this.gameState.combo}`, 10, 120);
    }
    
    // Power-up indicators
    let powerUpY = 150;
    if (this.gameState.powerUps.speed > 0) {
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillText(`SPEED: ${Math.ceil(this.gameState.powerUps.speed)}s`, 10, powerUpY);
      powerUpY += 30;
    }
    if (this.gameState.powerUps.invincibility > 0) {
      this.ctx.fillStyle = '#ff00ff';
      this.ctx.fillText(`INVINCIBLE: ${Math.ceil(this.gameState.powerUps.invincibility)}s`, 10, powerUpY);
      powerUpY += 30;
    }
    if (this.ghost.isEthereal) {
      this.ctx.fillStyle = '#00ffff';
      this.ctx.fillText(`ETHEREAL: ${Math.ceil(this.ghost.etherealTimer)}s`, 10, powerUpY);
    } else if (this.ghost.etherealTimer > -5) {
      this.ctx.fillStyle = '#808080';
      this.ctx.fillText(`ETHEREAL: ${Math.ceil(5 + this.ghost.etherealTimer)}s`, 10, powerUpY);
    }
    
    // Level
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`Level: ${this.gameState.currentLevel}`, this.canvas.width - 120, 30);
    
    // High score
    this.ctx.fillText(`High: ${this.gameState.highScore}`, this.canvas.width - 150, 60);
  }

  private renderMenu(): void {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Ghostly Glide', this.canvas.width / 2, 200);
    
    this.ctx.font = '24px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, 300);
    
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Use LEFT/RIGHT arrows or A/D to move', this.canvas.width / 2, 350);
    this.ctx.fillText('Press SPACE for ethereal form (3s cooldown)', this.canvas.width / 2, 380);
    this.ctx.fillText('Collect spirit orbs to complete levels', this.canvas.width / 2, 410);
    
    this.ctx.textAlign = 'left';
  }

  private renderPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    
    this.ctx.font = '24px monospace';
    this.ctx.fillText('Press ESC or P to resume', this.canvas.width / 2, this.canvas.height / 2 + 50);
    
    this.ctx.textAlign = 'left';
  }

  private renderGameOverOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px monospace';
    this.ctx.fillText(`Final Score: ${Math.floor(this.gameState.score)}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText(`High Score: ${this.gameState.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    this.ctx.fillText('Press F5 to restart', this.canvas.width / 2, this.canvas.height / 2 + 100);
    
    this.ctx.textAlign = 'left';
  }

  private renderVictoryOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px monospace';
    this.ctx.fillText(`Final Score: ${Math.floor(this.gameState.score)}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText(`Max Combo: ${this.gameState.maxCombo}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    this.ctx.fillText('Congratulations!', this.canvas.width / 2, this.canvas.height / 2 + 100);
    
    this.ctx.textAlign = 'left';
  }

  private update(deltaTime: number): void {
    if (this.gameState.paused || this.gameState.gameOver || this.gameState.victory) {
      return;
    }

    this.updateGhost(deltaTime);
    this.updateObstacles(deltaTime);
    this.checkCollisions();
  }

  private gameLoop(currentTime: number): void {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  public start(): void {
    // Start with a demo level if no level is loaded
    if (!this.currentLevel) {
      this.loadDemoLevel();
    }
    
    // Start background music
    this.audio.resume();
    this.audio.playBackgroundMusic();
    
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public restart(): void {
    this.ghost = this.createGhost();
    this.gameState = this.createInitialGameState();
    this.inputState = this.createInitialInputState();
    
    if (this.currentLevel) {
      this.loadLevel(this.currentLevel);
    } else {
      this.loadDemoLevel();
    }
    
    this.start();
  }

  private loadDemoLevel(): void {
    // Use the level generator instead of hardcoded demo level
    const levelGen = new LevelGenerator();
    const firstLevel = levelGen.getLevel(1);
    if (firstLevel) {
      this.loadLevel(firstLevel);
      return;
    }
    
    // Fallback demo level if generator fails
    const demoLevel: Level = {
      id: 1,
      name: "Haunted Mansion Entry",
      background: "mansion",
      spawnPoint: { x: 400, y: 2400 },
      exitPoint: { x: 400, y: 100 },
      width: 800,
      height: 2500,
      requiredOrbs: 5,
      obstacles: [
        // Static obstacles
        {
          id: 'obs1',
          position: { x: 200, y: 400 },
          velocity: { x: 0, y: 0 },
          width: 80,
          height: 20,
          active: true,
          type: 'static',
          damage: 1
        },
        {
          id: 'obs2',
          position: { x: 600, y: 350 },
          velocity: { x: 0, y: 0 },
          width: 80,
          height: 20,
          active: true,
          type: 'static',
          damage: 1
        },
        // Dynamic obstacles
        {
          id: 'obs3',
          position: { x: 400, y: 300 },
          velocity: { x: 1, y: 0 },
          width: 60,
          height: 60,
          active: true,
          type: 'dynamic',
          damage: 1,
          pattern: 'horizontal'
        },
        {
          id: 'obs4',
          position: { x: 300, y: 200 },
          velocity: { x: 0, y: 1 },
          width: 40,
          height: 40,
          active: true,
          type: 'dynamic',
          damage: 1,
          pattern: 'vertical'
        },
        // Spooky zone
        {
          id: 'spooky1',
          position: { x: 400, y: 150 },
          velocity: { x: 0, y: 0 },
          width: 200,
          height: 100,
          active: true,
          type: 'spooky_zone',
          damage: 0
        }
      ],
      collectibles: [
        // Spirit orbs
        {
          id: 'orb1',
          position: { x: 150, y: 450 },
          velocity: { x: 0, y: 0 },
          width: 20,
          height: 20,
          active: true,
          type: 'spirit_orb',
          value: 100,
          collected: false
        },
        {
          id: 'orb2',
          position: { x: 650, y: 400 },
          velocity: { x: 0, y: 0 },
          width: 20,
          height: 20,
          active: true,
          type: 'spirit_orb',
          value: 100,
          collected: false
        },
        {
          id: 'orb3',
          position: { x: 400, y: 250 },
          velocity: { x: 0, y: 0 },
          width: 20,
          height: 20,
          active: true,
          type: 'spirit_orb',
          value: 100,
          collected: false
        },
        {
          id: 'orb4',
          position: { x: 250, y: 150 },
          velocity: { x: 0, y: 0 },
          width: 20,
          height: 20,
          active: true,
          type: 'spirit_orb',
          value: 100,
          collected: false
        },
        {
          id: 'orb5',
          position: { x: 550, y: 150 },
          velocity: { x: 0, y: 0 },
          width: 20,
          height: 20,
          active: true,
          type: 'spirit_orb',
          value: 100,
          collected: false
        },
        // Special collectible
        {
          id: 'pearl1',
          position: { x: 400, y: 100 },
          velocity: { x: 0, y: 0 },
          width: 30,
          height: 30,
          active: true,
          type: 'poltergeist_pearl',
          value: 500,
          collected: false
        }
      ]
    };
    
    this.loadLevel(demoLevel);
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }
}