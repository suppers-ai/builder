import type { Ghost, Platform, Collectible, Level, GameState, InputState, Vector2D } from "../types/game.ts";
import { AudioManager } from "./audio.ts";
import { ValidatedLevelGenerator } from "./validated-levels.ts";
import { PhysicsEngine } from "./physics.ts";
import { JumpCalculator } from "./jump-calculator.ts";

export class ParkourGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ghost: Ghost;
  private currentLevel: Level | null = null;
  private gameState: GameState;
  private inputState: InputState;
  private lastTime: number = 0;
  private animationId: number | null = null;
  private audio: AudioManager;
  private physics: PhysicsEngine;
  private camera: { x: number; y: number };
  private levelHeight: number = 3000;
  private currentCheckpoint: Vector2D | null = null;
  private deathCount: number = 0;
  private debugMode: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    
    this.audio = new AudioManager();
    this.physics = new PhysicsEngine();

    this.ghost = this.createGhost();
    this.gameState = this.createInitialGameState();
    this.inputState = this.createInitialInputState();
    this.camera = { x: 0, y: 0 };
    
    this.setupEventListeners();
  }

  private createGhost(): Ghost {
    return {
      id: 'player-ghost',
      position: { x: 400, y: 500 },
      velocity: { x: 0, y: 0 },
      width: 30,
      height: 40,
      active: true,
      health: 1,
      grounded: false,
      jumpCount: 0,
      maxJumps: 2, // Double jump
      wallSliding: false,
      facingRight: true,
      trail: [],
      lastGroundedPosition: { x: 400, y: 500 }
    };
  }

  private createInitialGameState(): GameState {
    return {
      currentLevel: 1,
      score: 0,
      lives: 99, // Many lives for difficult parkour
      orbsCollected: 0,
      combo: 0,
      maxCombo: 0,
      gameOver: false,
      paused: false,
      victory: false,
      highScore: parseInt(localStorage.getItem('ghostly-parkour-highscore') || '0'),
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
      jump: false,
      jumpPressed: false,
      dash: false,
      pause: false
    };
  }

  private setupEventListeners(): void {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.inputState.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.inputState.right = true;
          e.preventDefault();
          break;
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (!this.inputState.jumpPressed) {
            this.inputState.jump = true;
            this.inputState.jumpPressed = true;
          }
          e.preventDefault();
          break;
        case 'Shift':
          this.inputState.dash = true;
          e.preventDefault();
          break;
        case 'Escape':
        case 'p':
        case 'P':
          this.togglePause();
          break;
        case 'r':
        case 'R':
          // Quick restart from checkpoint
          this.respawnAtCheckpoint();
          break;
        case 'F1':
          // Toggle debug mode
          this.debugMode = !this.debugMode;
          console.log('Debug mode:', this.debugMode);
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.inputState.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.inputState.right = false;
          break;
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.inputState.jump = false;
          this.inputState.jumpPressed = false;
          break;
        case 'Shift':
          this.inputState.dash = false;
          break;
      }
    });

    // Touch controls for mobile
    let touchStartX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      
      // Jump on tap
      if (!this.inputState.jumpPressed) {
        this.inputState.jump = true;
        this.inputState.jumpPressed = true;
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      
      this.inputState.left = deltaX < -20;
      this.inputState.right = deltaX > 20;
    });

    this.canvas.addEventListener('touchend', () => {
      this.inputState.left = false;
      this.inputState.right = false;
      this.inputState.jump = false;
      this.inputState.jumpPressed = false;
    });
  }

  public loadLevel(level: Level): void {
    this.currentLevel = level;
    this.levelHeight = level.height;
    this.ghost.position = { ...level.spawnPoint };
    this.ghost.velocity = { x: 0, y: 0 };
    this.ghost.grounded = false;
    this.currentCheckpoint = level.spawnPoint;
    this.camera.x = 0;
    this.camera.y = level.spawnPoint.y - this.canvas.height / 2;
    this.gameState.orbsCollected = 0;
    this.gameState.combo = 0;
    this.deathCount = 0;
  }

  private updateGhost(deltaTime: number): void {
    if (!this.currentLevel) return;

    // Store position for trail
    this.ghost.trail.unshift({ ...this.ghost.position });
    if (this.ghost.trail.length > 15) {
      this.ghost.trail.pop();
    }

    // Handle input
    if (this.inputState.jump && !this.gameState.paused) {
      this.physics.applyJump(this.ghost);
      this.inputState.jump = false; // Consume jump input
      this.audio.playSound('collect'); // Use collect sound for jump
    }

    // Horizontal movement
    let moveDirection = 0;
    if (this.inputState.left) moveDirection -= 1;
    if (this.inputState.right) moveDirection += 1;
    
    if (moveDirection !== 0) {
      this.physics.applyMovement(this.ghost, moveDirection, deltaTime);
    }

    // Update physics
    this.physics.updatePhysics(this.ghost, deltaTime, this.currentLevel.platforms);

    // Check platform collisions
    const hitPlatform = this.physics.checkPlatformCollisions(this.ghost, this.currentLevel.platforms);
    
    // Handle spike damage
    if (hitPlatform && hitPlatform.type === 'spike') {
      this.die();
      return;
    }

    // Update moving platforms
    this.physics.updateMovingPlatforms(this.currentLevel.platforms, deltaTime, Date.now() / 1000);

    // Keep ghost within level bounds
    this.ghost.position.x = Math.max(15, Math.min(this.canvas.width - 15, this.ghost.position.x));

    // Check if fell off the bottom
    if (this.ghost.position.y > this.levelHeight) {
      this.die();
      return;
    }

    // Check if reached the top (victory)
    if (this.ghost.position.y < this.currentLevel.exitPoint.y) {
      this.completeLevel();
    }

    // Update camera to follow ghost
    this.updateCamera();

    // Check for checkpoint
    this.checkCheckpoints();

    // Store last grounded position for respawning
    if (this.ghost.grounded) {
      this.ghost.lastGroundedPosition = { ...this.ghost.position };
    }
  }

  private updateCamera(): void {
    // Smooth camera follow
    const targetY = this.ghost.position.y - this.canvas.height / 2;
    const targetX = this.ghost.position.x - this.canvas.width / 2;
    
    // Vertical camera with some lookahead
    this.camera.y += (targetY - this.camera.y) * 0.1;
    
    // Slight horizontal follow
    this.camera.x += (targetX - this.camera.x) * 0.05;
    
    // Clamp camera
    this.camera.x = Math.max(0, Math.min(0, this.camera.x)); // Keep X centered
    this.camera.y = Math.max(0, Math.min(this.levelHeight - this.canvas.height, this.camera.y));
  }

  private checkCheckpoints(): void {
    if (!this.currentLevel) return;

    for (const checkpoint of this.currentLevel.checkpoints) {
      const distance = Math.sqrt(
        Math.pow(this.ghost.position.x - checkpoint.x, 2) +
        Math.pow(this.ghost.position.y - checkpoint.y, 2)
      );

      if (distance < 50 && 
          (!this.currentCheckpoint || 
           this.currentCheckpoint.y > checkpoint.y)) {
        // Reached a new checkpoint
        this.currentCheckpoint = checkpoint;
        this.audio.playSound('powerup');
        console.log('Checkpoint reached!');
      }
    }
  }

  private checkCollisions(): void {
    if (!this.currentLevel) return;

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
    this.gameState.orbsCollected++;
    this.gameState.score += collectible.value * (1 + this.gameState.combo * 0.1);
    this.gameState.combo++;
    
    if (this.gameState.combo > this.gameState.maxCombo) {
      this.gameState.maxCombo = this.gameState.combo;
    }
    
    this.audio.playSound('collect');
  }

  private die(): void {
    this.deathCount++;
    this.gameState.lives--;
    this.gameState.combo = 0;
    this.audio.playSound('damage');
    
    if (this.gameState.lives <= 0) {
      this.gameOver();
    } else {
      this.respawnAtCheckpoint();
    }
  }

  private respawnAtCheckpoint(): void {
    if (this.currentCheckpoint) {
      this.ghost.position = { ...this.currentCheckpoint };
      this.ghost.velocity = { x: 0, y: 0 };
      this.ghost.grounded = false;
      this.ghost.jumpCount = 0;
      
      // Reset camera
      this.camera.y = this.currentCheckpoint.y - this.canvas.height / 2;
    }
  }

  private completeLevel(): void {
    if (!this.currentLevel) return;
    
    // Level complete!
    this.gameState.score += 1000;
    this.gameState.score -= this.deathCount * 50; // Penalty for deaths
    this.gameState.currentLevel++;
    this.audio.playSound('levelComplete');
    
    // Load next level or show victory
    if (this.gameState.currentLevel > 10) {
      this.victory();
    } else {
      const levelGen = new ValidatedLevelGenerator();
      const nextLevel = levelGen.getLevel(this.gameState.currentLevel);
      if (nextLevel) {
        this.loadLevel(nextLevel);
      } else {
        this.victory();
      }
    }
  }

  private gameOver(): void {
    this.gameState.gameOver = true;
    this.audio.playSound('gameOver');
    this.audio.stopBackgroundMusic();
    
    if (this.gameState.score > this.gameState.highScore) {
      this.gameState.highScore = this.gameState.score;
      localStorage.setItem('ghostly-parkour-highscore', this.gameState.score.toString());
    }
    
    this.stop();
  }

  private victory(): void {
    this.gameState.victory = true;
    this.gameState.score += 5000;
    
    if (this.gameState.score > this.gameState.highScore) {
      this.gameState.highScore = this.gameState.score;
      localStorage.setItem('ghostly-parkour-highscore', this.gameState.score.toString());
    }
    
    this.stop();
  }

  private togglePause(): void {
    this.gameState.paused = !this.gameState.paused;
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

    // Render background
    this.renderBackground();

    // Apply camera transform
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // Render platforms
    this.renderPlatforms();

    // Render collectibles
    this.renderCollectibles();

    // Render checkpoints
    this.renderCheckpoints();

    // Render ghost trail
    this.renderTrail();

    // Render ghost
    this.renderGhost();
    
    // Render debug info if enabled
    if (this.debugMode) {
      this.renderDebugInfo();
    }

    // Restore context
    this.ctx.restore();

    // Render UI (not affected by camera)
    this.renderUI();

    // Render overlays
    if (this.gameState.paused) {
      this.renderPauseOverlay();
    }
    if (this.gameState.gameOver) {
      this.renderGameOverOverlay();
    }
    if (this.gameState.victory) {
      this.renderVictoryOverlay();
    }
  }

  private renderBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Parallax stars
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % this.canvas.width;
      const y = ((i * 137) - this.camera.y * 0.3) % this.canvas.height;
      const size = (i % 3) + 1;
      this.ctx.fillRect(x, y, size, size);
    }
  }

  private renderPlatforms(): void {
    if (!this.currentLevel) return;

    const screenTop = this.camera.y - 100;
    const screenBottom = this.camera.y + this.canvas.height + 100;

    for (const platform of this.currentLevel.platforms) {
      if (!platform.active) continue;
      if (platform.position.y < screenTop || platform.position.y > screenBottom) continue;

      this.ctx.save();

      // Platform color based on type
      let color = platform.color || '#4a5568';
      if (platform.type === 'crumbling' && platform.crumbleTimer !== undefined) {
        // Make crumbling platforms shake and fade
        const shake = platform.crumbleTimer < 0.5 ? Math.random() * 4 - 2 : 0;
        this.ctx.translate(shake, 0);
        this.ctx.globalAlpha = Math.min(1, platform.crumbleTimer + 0.3);
      }

      this.ctx.fillStyle = color;
      
      if (platform.type === 'spike') {
        // Draw spikes
        this.ctx.fillStyle = '#dc2626';
        const spikeCount = Math.floor(platform.width / 10);
        for (let i = 0; i < spikeCount; i++) {
          const spikeX = platform.position.x - platform.width / 2 + (i + 0.5) * (platform.width / spikeCount);
          this.ctx.beginPath();
          this.ctx.moveTo(spikeX - 5, platform.position.y + platform.height / 2);
          this.ctx.lineTo(spikeX, platform.position.y - platform.height / 2);
          this.ctx.lineTo(spikeX + 5, platform.position.y + platform.height / 2);
          this.ctx.closePath();
          this.ctx.fill();
        }
      } else {
        // Regular platform
        this.ctx.fillRect(
          platform.position.x - platform.width / 2,
          platform.position.y - platform.height / 2,
          platform.width,
          platform.height
        );

        // Add some visual detail
        if (platform.type === 'bouncy') {
          this.ctx.strokeStyle = '#10b981';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(
            platform.position.x - platform.width / 2,
            platform.position.y - platform.height / 2,
            platform.width,
            platform.height
          );
        }
      }

      this.ctx.restore();
    }
  }

  private renderCollectibles(): void {
    if (!this.currentLevel) return;

    const screenTop = this.camera.y - 100;
    const screenBottom = this.camera.y + this.canvas.height + 100;

    for (const collectible of this.currentLevel.collectibles) {
      if (!collectible.active || collectible.collected) continue;
      if (collectible.position.y < screenTop || collectible.position.y > screenBottom) continue;

      this.ctx.save();
      
      // Glow effect
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = '#00ffff';
      
      // Pulsing effect
      const pulse = Math.sin(Date.now() / 200) * 0.1 + 1;
      this.ctx.fillStyle = '#00ffff';
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
  }

  private renderCheckpoints(): void {
    if (!this.currentLevel) return;

    const screenTop = this.camera.y - 100;
    const screenBottom = this.camera.y + this.canvas.height + 100;

    for (const checkpoint of this.currentLevel.checkpoints) {
      if (checkpoint.y < screenTop || checkpoint.y > screenBottom) continue;

      const isActive = this.currentCheckpoint && 
                      checkpoint.x === this.currentCheckpoint.x && 
                      checkpoint.y === this.currentCheckpoint.y;

      this.ctx.save();
      
      // Flag pole
      this.ctx.fillStyle = '#6b7280';
      this.ctx.fillRect(checkpoint.x - 2, checkpoint.y - 40, 4, 40);
      
      // Flag
      this.ctx.fillStyle = isActive ? '#10b981' : '#ef4444';
      this.ctx.beginPath();
      this.ctx.moveTo(checkpoint.x + 2, checkpoint.y - 40);
      this.ctx.lineTo(checkpoint.x + 25, checkpoint.y - 30);
      this.ctx.lineTo(checkpoint.x + 2, checkpoint.y - 20);
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }

  private renderTrail(): void {
    this.ctx.save();
    
    for (let i = 0; i < this.ghost.trail.length; i++) {
      const progress = i / this.ghost.trail.length;
      const alpha = (1 - progress) * 0.3;
      
      this.ctx.fillStyle = `rgba(200, 200, 255, ${alpha})`;
      const size = this.ghost.width * (1 - progress) * 0.5;
      
      this.ctx.beginPath();
      this.ctx.arc(
        this.ghost.trail[i].x,
        this.ghost.trail[i].y,
        size / 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  private renderDebugInfo(): void {
    if (!this.currentLevel) return;
    
    // Draw jump arc from ghost position
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    // Single jump arc
    const jumpHeight = 104; // Calculated from physics
    const jumpDistance = 208; // Calculated from physics
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.ghost.position.x, this.ghost.position.y);
    
    // Draw parabolic arc
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = this.ghost.position.x + (this.ghost.facingRight ? 1 : -1) * jumpDistance * t;
      const y = this.ghost.position.y - (jumpHeight * 4 * t * (1 - t));
      this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    
    // Double jump arc
    this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.moveTo(this.ghost.position.x, this.ghost.position.y);
    
    const doubleJumpHeight = 188;
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = this.ghost.position.x + (this.ghost.facingRight ? 1 : -1) * jumpDistance * t;
      const y = this.ghost.position.y - (doubleJumpHeight * 4 * t * (1 - t));
      this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    
    // Platform connections - show which platforms are reachable
    const calculator = new JumpCalculator();
    const ghostPlatform = this.findPlatformUnder(this.ghost.position);
    
    if (ghostPlatform) {
      for (const platform of this.currentLevel.platforms) {
        if (platform === ghostPlatform || !platform.active) continue;
        
        const reachable = calculator.isPlatformReachable(
          ghostPlatform.position.x,
          ghostPlatform.position.y,
          ghostPlatform.width,
          platform.position.x,
          platform.position.y,
          platform.width,
          true,
          false
        );
        
        if (reachable.reachable) {
          // Draw line to reachable platforms
          this.ctx.strokeStyle = reachable.method === 'single_jump' ? 
            'rgba(0, 255, 0, 0.2)' : 
            'rgba(255, 255, 0, 0.2)';
          this.ctx.lineWidth = 1;
          this.ctx.setLineDash([]);
          this.ctx.beginPath();
          this.ctx.moveTo(ghostPlatform.position.x, ghostPlatform.position.y);
          this.ctx.lineTo(platform.position.x, platform.position.y);
          this.ctx.stroke();
        }
      }
    }
    
    this.ctx.restore();
    
    // Show debug text
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`Vel: ${Math.round(this.ghost.velocity.x)}, ${Math.round(this.ghost.velocity.y)}`, 
      this.ghost.position.x - 40, this.ghost.position.y - 50);
    this.ctx.fillText(`Grounded: ${this.ghost.grounded}`, 
      this.ghost.position.x - 40, this.ghost.position.y - 65);
    this.ctx.fillText(`Wall: ${this.ghost.wallSliding}`, 
      this.ghost.position.x - 40, this.ghost.position.y - 80);
    this.ctx.restore();
  }
  
  private findPlatformUnder(position: Vector2D): Platform | null {
    if (!this.currentLevel) return null;
    
    for (const platform of this.currentLevel.platforms) {
      if (!platform.active) continue;
      
      const platLeft = platform.position.x - platform.width / 2;
      const platRight = platform.position.x + platform.width / 2;
      const platTop = platform.position.y - platform.height / 2;
      
      if (position.x >= platLeft && position.x <= platRight &&
          position.y >= platTop - 50 && position.y <= platTop + 50) {
        return platform;
      }
    }
    
    return null;
  }

  private renderGhost(): void {
    this.ctx.save();
    
    // Position
    const ghostX = this.ghost.position.x;
    const ghostY = this.ghost.position.y;
    
    // Flip sprite if facing left
    if (!this.ghost.facingRight) {
      this.ctx.translate(ghostX, ghostY);
      this.ctx.scale(-1, 1);
      this.ctx.translate(-ghostX, -ghostY);
    }
    
    // Ghost glow
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = this.ghost.wallSliding ? '#ffaa00' : '#aaccff';
    
    // Ghost body - simple but visible
    this.ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
    
    // Draw rectangular ghost for better platforming visibility
    this.ctx.fillRect(
      ghostX - this.ghost.width / 2,
      ghostY - this.ghost.height / 2,
      this.ghost.width,
      this.ghost.height
    );
    
    // Eyes
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(ghostX - 8, ghostY - 10, 4, 4);
    this.ctx.fillRect(ghostX + 4, ghostY - 10, 4, 4);
    
    // Visual indicators
    if (this.ghost.grounded) {
      // Green glow when grounded
      this.ctx.strokeStyle = '#10b981';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        ghostX - this.ghost.width / 2 - 2,
        ghostY - this.ghost.height / 2 - 2,
        this.ghost.width + 4,
        this.ghost.height + 4
      );
    } else if (this.ghost.wallSliding) {
      // Orange glow when wall sliding
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        ghostX - this.ghost.width / 2 - 2,
        ghostY - this.ghost.height / 2 - 2,
        this.ghost.width + 4,
        this.ghost.height + 4
      );
    }
    
    this.ctx.restore();
  }

  private renderUI(): void {
    // Score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 20px monospace';
    this.ctx.fillText(`Score: ${Math.floor(this.gameState.score)}`, 10, 30);
    
    // Lives
    this.ctx.fillText(`Lives: ${this.gameState.lives}`, 10, 60);
    
    // Deaths this level
    this.ctx.fillText(`Deaths: ${this.deathCount}`, 10, 90);
    
    // Level
    this.ctx.fillText(`Level: ${this.gameState.currentLevel}/10`, 10, 120);
    
    // Jump indicator
    const jumpsLeft = this.ghost.maxJumps - this.ghost.jumpCount;
    this.ctx.fillStyle = jumpsLeft > 0 ? '#10b981' : '#6b7280';
    this.ctx.fillText(`Jumps: ${jumpsLeft}/${this.ghost.maxJumps}`, 10, 150);
    
    // Controls hint
    this.ctx.fillStyle = '#9ca3af';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('A/D or ← → : Move', 10, this.canvas.height - 60);
    this.ctx.fillText('W or SPACE: Jump/Wall Jump', 10, this.canvas.height - 40);
    this.ctx.fillText('R: Restart from checkpoint', 10, this.canvas.height - 20);
    
    // High score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 20px monospace';
    this.ctx.fillText(`High: ${this.gameState.highScore}`, this.canvas.width - 150, 30);
  }

  private renderMenu(): void {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Ghostly Parkour', this.canvas.width / 2, 200);
    
    this.ctx.font = '24px monospace';
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, 300);
    
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Jump and climb your way to the top!', this.canvas.width / 2, 350);
    this.ctx.fillText('Wall jump by jumping while sliding on walls', this.canvas.width / 2, 380);
    this.ctx.fillText('Reach checkpoints to save progress', this.canvas.width / 2, 410);
    
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
    this.ctx.fillText('You mastered all 10 levels!', this.canvas.width / 2, this.canvas.height / 2 + 40);
    this.ctx.fillText('Congratulations!', this.canvas.width / 2, this.canvas.height / 2 + 100);
    
    this.ctx.textAlign = 'left';
  }

  private update(deltaTime: number): void {
    if (this.gameState.paused || this.gameState.gameOver || this.gameState.victory) {
      return;
    }

    this.updateGhost(deltaTime);
    this.checkCollisions();
  }

  private gameLoop(currentTime: number): void {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016); // Cap at 60fps
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  public start(): void {
    // Start with first level
    if (!this.currentLevel) {
      const levelGen = new ValidatedLevelGenerator();
      const firstLevel = levelGen.getLevel(1);
      if (firstLevel) {
        this.loadLevel(firstLevel);
      }
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
    
    const levelGen = new ValidatedLevelGenerator();
    const firstLevel = levelGen.getLevel(1);
    if (firstLevel) {
      this.loadLevel(firstLevel);
    }
    
    this.start();
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }
}