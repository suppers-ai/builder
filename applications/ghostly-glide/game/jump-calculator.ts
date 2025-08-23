/**
 * Jump Calculator - Calculates maximum jump distances based on physics parameters
 */

export class JumpCalculator {
  // Physics parameters (must match PhysicsEngine)
  private gravity: number = 1200;
  private jumpForce: number = -500;
  private doubleJumpForce: number = -450;
  private wallJumpForce: { x: number; y: number } = { x: 300, y: -400 };
  private moveSpeed: number = 250;
  private airControl: number = 0.8;

  /**
   * Calculate maximum jump height from ground (single jump)
   */
  public getMaxJumpHeight(): number {
    // Using kinematic equation: v² = u² + 2as
    // At max height, v = 0, u = jumpForce, a = gravity
    // 0 = jumpForce² + 2 * gravity * height
    // height = -jumpForce² / (2 * gravity)
    const height = -(this.jumpForce * this.jumpForce) / (2 * this.gravity);
    return height;
  }

  /**
   * Calculate maximum jump height with double jump
   */
  public getMaxDoubleJumpHeight(): number {
    // First jump height
    const firstJumpHeight = this.getMaxJumpHeight();
    
    // Second jump starts with velocity 0 at peak of first jump
    const secondJumpHeight = -(this.doubleJumpForce * this.doubleJumpForce) / (2 * this.gravity);
    
    return firstJumpHeight + secondJumpHeight;
  }

  /**
   * Calculate time to reach max height (single jump)
   */
  public getTimeToMaxHeight(): number {
    // v = u + at, at max height v = 0
    // 0 = jumpForce + gravity * t
    // t = -jumpForce / gravity
    return -this.jumpForce / this.gravity;
  }

  /**
   * Calculate maximum horizontal distance for a jump
   * @param withRunup - Whether the ghost has horizontal momentum
   */
  public getMaxJumpDistance(withRunup: boolean = true): number {
    const timeToMaxHeight = this.getTimeToMaxHeight();
    const totalAirTime = timeToMaxHeight * 2; // Up and down
    
    // Horizontal speed while jumping
    const horizontalSpeed = withRunup ? this.moveSpeed * this.airControl : 0;
    
    return horizontalSpeed * totalAirTime;
  }

  /**
   * Calculate maximum horizontal distance with double jump
   */
  public getMaxDoubleJumpDistance(): number {
    // Time for first jump
    const firstJumpTime = this.getTimeToMaxHeight() * 2;
    
    // Time for second jump (from peak of first)
    const secondJumpTime = (-this.doubleJumpForce / this.gravity) * 2;
    
    const totalTime = firstJumpTime + secondJumpTime;
    const horizontalSpeed = this.moveSpeed * this.airControl;
    
    return horizontalSpeed * totalTime;
  }

  /**
   * Calculate wall jump trajectory
   */
  public getWallJumpReach(): { height: number; distance: number } {
    // Wall jump gives both horizontal and vertical velocity
    const timeToMaxHeight = -this.wallJumpForce.y / this.gravity;
    const maxHeight = -(this.wallJumpForce.y * this.wallJumpForce.y) / (2 * this.gravity);
    
    // Horizontal distance (wall jump provides initial horizontal velocity)
    const totalAirTime = timeToMaxHeight * 2;
    const averageHorizontalSpeed = this.wallJumpForce.x; // Simplified, ignoring friction
    const distance = averageHorizontalSpeed * totalAirTime;
    
    return { height: maxHeight, distance };
  }

  /**
   * Check if a platform is reachable from another platform
   */
  public isPlatformReachable(
    fromX: number, fromY: number, fromWidth: number,
    toX: number, toY: number, toWidth: number,
    allowDoubleJump: boolean = true,
    allowWallJump: boolean = false
  ): { reachable: boolean; method: string } {
    // Calculate gaps
    const horizontalGap = Math.abs(toX - fromX) - (fromWidth + toWidth) / 2;
    const verticalGap = fromY - toY; // Positive means jumping up

    // Direct jump check
    if (verticalGap <= this.getMaxJumpHeight() && 
        horizontalGap <= this.getMaxJumpDistance()) {
      return { reachable: true, method: 'single_jump' };
    }

    // Double jump check
    if (allowDoubleJump) {
      if (verticalGap <= this.getMaxDoubleJumpHeight() && 
          horizontalGap <= this.getMaxDoubleJumpDistance()) {
        return { reachable: true, method: 'double_jump' };
      }
    }

    // Wall jump check (need a wall nearby)
    if (allowWallJump) {
      const wallJumpReach = this.getWallJumpReach();
      if (verticalGap <= wallJumpReach.height && 
          horizontalGap <= wallJumpReach.distance) {
        return { reachable: true, method: 'wall_jump' };
      }
    }

    // Check if platform is below (can drop down)
    if (verticalGap < 0) {
      // Can drop any distance horizontally with air control
      const dropTime = Math.sqrt(-2 * verticalGap / this.gravity);
      const maxDropDistance = this.moveSpeed * this.airControl * dropTime;
      
      if (horizontalGap <= maxDropDistance) {
        return { reachable: true, method: 'drop' };
      }
    }

    return { reachable: false, method: 'unreachable' };
  }

  /**
   * Get safe platform spacing for guaranteed reachability
   */
  public getSafePlatformSpacing(): {
    maxHorizontalGap: number;
    maxVerticalGap: number;
    maxDiagonalHorizontal: number;
    maxDiagonalVertical: number;
  } {
    // Use 80% of maximum capabilities for safety margin
    const safetyFactor = 0.8;
    
    return {
      maxHorizontalGap: this.getMaxJumpDistance() * safetyFactor,
      maxVerticalGap: this.getMaxJumpHeight() * safetyFactor,
      maxDiagonalHorizontal: this.getMaxJumpDistance() * safetyFactor * 0.7,
      maxDiagonalVertical: this.getMaxJumpHeight() * safetyFactor * 0.7
    };
  }

  /**
   * Calculate exact jump parameters
   */
  public getJumpStats(): {
    singleJumpHeight: number;
    doubleJumpHeight: number;
    horizontalReach: number;
    wallJumpHeight: number;
    wallJumpDistance: number;
  } {
    return {
      singleJumpHeight: Math.round(Math.abs(this.getMaxJumpHeight())),
      doubleJumpHeight: Math.round(Math.abs(this.getMaxDoubleJumpHeight())),
      horizontalReach: Math.round(Math.abs(this.getMaxJumpDistance())),
      wallJumpHeight: Math.round(Math.abs(this.getWallJumpReach().height)),
      wallJumpDistance: Math.round(Math.abs(this.getWallJumpReach().distance))
    };
  }
}