import type { Ghost, Platform, Vector2D } from "../types/game.ts";

export class PhysicsEngine {
  private gravity: number = 1200; // Pixels per second squared
  private maxFallSpeed: number = 800;
  private jumpForce: number = -500;
  private doubleJumpForce: number = -450;
  private wallJumpForce: { x: number; y: number } = { x: 300, y: -400 };
  private moveSpeed: number = 250;
  private airControl: number = 0.8;
  private friction: number = 0.85;
  private wallSlideSpeed: number = 100;

  public updatePhysics(ghost: Ghost, deltaTime: number, platforms: Platform[]): void {
    // Apply gravity
    if (!ghost.grounded) {
      ghost.velocity.y += this.gravity * deltaTime;
      ghost.velocity.y = Math.min(ghost.velocity.y, this.maxFallSpeed);
    }

    // Check for wall sliding
    ghost.wallSliding = false;
    if (!ghost.grounded && ghost.velocity.y > 0) {
      // Check if touching a wall
      const wallLeft = this.checkWallCollision(ghost, platforms, -1);
      const wallRight = this.checkWallCollision(ghost, platforms, 1);
      
      if ((wallLeft && ghost.velocity.x < 0) || (wallRight && ghost.velocity.x > 0)) {
        ghost.wallSliding = true;
        ghost.velocity.y = Math.min(ghost.velocity.y, this.wallSlideSpeed);
      }
    }

    // Update position
    ghost.position.x += ghost.velocity.x * deltaTime;
    ghost.position.y += ghost.velocity.y * deltaTime;

    // Apply friction when grounded
    if (ghost.grounded) {
      ghost.velocity.x *= this.friction;
    } else {
      // Air resistance
      ghost.velocity.x *= 0.98;
    }
  }

  public applyJump(ghost: Ghost): void {
    if (ghost.grounded) {
      // Normal jump from ground
      ghost.velocity.y = this.jumpForce;
      ghost.jumpCount = 1;
      ghost.grounded = false;
    } else if (ghost.wallSliding) {
      // Wall jump
      const direction = ghost.facingRight ? -1 : 1;
      ghost.velocity.x = this.wallJumpForce.x * direction;
      ghost.velocity.y = this.wallJumpForce.y;
      ghost.jumpCount = 1;
      ghost.wallSliding = false;
    } else if (ghost.jumpCount < ghost.maxJumps) {
      // Double/triple jump
      ghost.velocity.y = this.doubleJumpForce;
      ghost.jumpCount++;
    }
  }

  public applyMovement(ghost: Ghost, direction: number, deltaTime: number): void {
    const speed = ghost.grounded ? this.moveSpeed : this.moveSpeed * this.airControl;
    ghost.velocity.x += direction * speed * deltaTime * 3;
    
    // Clamp horizontal velocity
    const maxSpeed = this.moveSpeed;
    ghost.velocity.x = Math.max(-maxSpeed, Math.min(maxSpeed, ghost.velocity.x));
    
    // Update facing direction
    if (direction !== 0) {
      ghost.facingRight = direction > 0;
    }
  }

  public checkPlatformCollisions(ghost: Ghost, platforms: Platform[]): Platform | null {
    let landedPlatform: Platform | null = null;
    ghost.grounded = false;

    for (const platform of platforms) {
      if (!platform.active) continue;

      const collision = this.getCollisionInfo(ghost, platform);
      if (!collision.colliding) continue;

      // Handle different platform types
      if (platform.type === 'spike') {
        // Spikes kill instantly
        return platform; // Return spike for damage handling
      }

      // Resolve collision based on direction
      if (collision.fromTop && ghost.velocity.y > 0) {
        // Landing on platform
        ghost.position.y = platform.position.y - platform.height / 2 - ghost.height / 2;
        ghost.velocity.y = 0;
        ghost.grounded = true;
        ghost.jumpCount = 0;
        landedPlatform = platform;

        // Handle special platform types
        if (platform.type === 'bouncy') {
          ghost.velocity.y = -(platform.bounceForce || 800);
          ghost.grounded = false;
        } else if (platform.type === 'crumbling') {
          // Start crumbling timer
          if (!platform.crumbleTimer) {
            platform.crumbleTimer = 1.0; // 1 second before collapse
          }
        }
      } else if (collision.fromBottom && ghost.velocity.y < 0) {
        // Hit ceiling
        ghost.position.y = platform.position.y + platform.height / 2 + ghost.height / 2;
        ghost.velocity.y = 0;
      } else if (collision.fromLeft && ghost.velocity.x > 0) {
        // Hit wall from left
        ghost.position.x = platform.position.x - platform.width / 2 - ghost.width / 2;
        ghost.velocity.x = 0;
      } else if (collision.fromRight && ghost.velocity.x < 0) {
        // Hit wall from right
        ghost.position.x = platform.position.x + platform.width / 2 + ghost.width / 2;
        ghost.velocity.x = 0;
      }
    }

    return landedPlatform;
  }

  private getCollisionInfo(ghost: Ghost, platform: Platform): {
    colliding: boolean;
    fromTop: boolean;
    fromBottom: boolean;
    fromLeft: boolean;
    fromRight: boolean;
  } {
    const ghostLeft = ghost.position.x - ghost.width / 2;
    const ghostRight = ghost.position.x + ghost.width / 2;
    const ghostTop = ghost.position.y - ghost.height / 2;
    const ghostBottom = ghost.position.y + ghost.height / 2;

    const platLeft = platform.position.x - platform.width / 2;
    const platRight = platform.position.x + platform.width / 2;
    const platTop = platform.position.y - platform.height / 2;
    const platBottom = platform.position.y + platform.height / 2;

    const colliding = ghostLeft < platRight &&
                     ghostRight > platLeft &&
                     ghostTop < platBottom &&
                     ghostBottom > platTop;

    if (!colliding) {
      return { colliding: false, fromTop: false, fromBottom: false, fromLeft: false, fromRight: false };
    }

    // Calculate overlap on each axis
    const overlapLeft = ghostRight - platLeft;
    const overlapRight = platRight - ghostLeft;
    const overlapTop = ghostBottom - platTop;
    const overlapBottom = platBottom - ghostTop;

    // Find smallest overlap to determine collision direction
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    return {
      colliding: true,
      fromTop: minOverlap === overlapTop,
      fromBottom: minOverlap === overlapBottom,
      fromLeft: minOverlap === overlapLeft,
      fromRight: minOverlap === overlapRight
    };
  }

  private checkWallCollision(ghost: Ghost, platforms: Platform[], direction: number): boolean {
    const checkX = ghost.position.x + (ghost.width / 2 + 5) * direction;
    const checkY = ghost.position.y;

    for (const platform of platforms) {
      if (!platform.active || platform.type === 'spike') continue;

      const platLeft = platform.position.x - platform.width / 2;
      const platRight = platform.position.x + platform.width / 2;
      const platTop = platform.position.y - platform.height / 2;
      const platBottom = platform.position.y + platform.height / 2;

      if (checkX > platLeft && checkX < platRight &&
          checkY > platTop && checkY < platBottom) {
        return true;
      }
    }

    return false;
  }

  public updateMovingPlatforms(platforms: Platform[], deltaTime: number, time: number): void {
    for (const platform of platforms) {
      if (!platform.active || platform.type !== 'moving' || !platform.pattern) continue;

      switch (platform.pattern) {
        case 'horizontal':
          platform.position.x = platform.patternData.centerX + 
            Math.sin(time * platform.patternData.speed) * platform.patternData.radius;
          break;
        case 'vertical':
          platform.position.y = platform.patternData.centerY + 
            Math.sin(time * platform.patternData.speed) * platform.patternData.radius;
          break;
        case 'circular':
          platform.position.x = platform.patternData.centerX + 
            Math.cos(time * platform.patternData.speed) * platform.patternData.radius;
          platform.position.y = platform.patternData.centerY + 
            Math.sin(time * platform.patternData.speed) * platform.patternData.radius;
          break;
      }
    }

    // Update crumbling platforms
    for (const platform of platforms) {
      if (platform.type === 'crumbling' && platform.crumbleTimer !== undefined) {
        platform.crumbleTimer -= deltaTime;
        if (platform.crumbleTimer <= 0) {
          platform.active = false;
        }
      }
    }
  }
}