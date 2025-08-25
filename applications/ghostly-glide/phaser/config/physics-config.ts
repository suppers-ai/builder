export const physicsConfig: Phaser.Types.Core.PhysicsConfig = {
  default: 'matter',
  matter: {
    gravity: { y: 1.2 },
    debug: false, // Set to true to see collision bodies
    setBounds: {
      left: true,
      right: true,
      top: false,
      bottom: false
    },
    // Performance optimizations
    autoUpdate: true,
    fixedStep: true,
    fps: 60,
    correction: 1,
    overlapBias: 0.01,
    // Enable sleeping for better performance
    enableSleeping: false, // Keep false for platformer - we need constant updates
    // Collision settings
    positionIterations: 6,
    velocityIterations: 4,
    constraintIterations: 2,
    // Timing settings for smoother physics
    timing: {
      timestamp: 0,
      timeScale: 1
    }
  }
};

export const matterConfig = {
  // Collision categories bit masks
  categories: {
    GHOST: 0x0001,
    PLATFORM: 0x0002,
    HAZARD: 0x0004,
    COLLECTIBLE: 0x0008,
    CHECKPOINT: 0x0010,
    MOVING_PLATFORM: 0x0020
  },
  
  // Physics constants
  physics: {
    ghostMass: 1,
    ghostFriction: 0,
    ghostFrictionAir: 0.01,
    ghostBounce: 0,
    
    platformFriction: 0.8,
    platformBounce: 0,
    
    iceFriction: 0.05,
    stickyFriction: 2,
    bouncyRestitution: 1.5,
    
    // Movement forces
    moveSpeed: 4.5,
    jumpForce: 14,
    doubleJumpForce: 13,
    wallJumpX: 5,
    wallJumpY: 12,
    groundPoundForce: 15,
    
    // Timing windows (ms)
    coyoteTime: 120,
    jumpBuffer: 150,
    wallJumpCooldown: 200
  },
  
  // Debug visualization
  debug: {
    showVelocity: false,
    showAngleIndicator: false,
    showBroadphase: false,
    showBounds: false,
    showAxes: false,
    showPositions: false,
    showConvexHulls: false,
    showInternalEdges: false,
    showIds: false,
    showShadows: false,
    showSensors: true,
    showCollisions: true,
    showSeparations: false,
    showBodies: true,
    showStaticBodies: true,
    showSleeping: false,
    showIndicators: true,
    showVelocityVectors: false,
    
    // Colors
    staticFillColor: 0x1b3a4b,
    staticLineColor: 0x277da1,
    bodyFillColor: 0x0d47a1,
    bodyLineColor: 0x1976d2,
    sensorFillColor: 0x6b35ff,
    sensorLineColor: 0x805ad5,
    
    lineThickness: 1,
    staticLineThickness: 1,
    
    alpha: 0.7,
    fillAlpha: 0.3
  }
};

export function enablePhysicsDebug(scene: Phaser.Scene) {
  const world = scene.matter.world;
  
  // Initialize debug graphics if it doesn't exist
  if (!world.debugGraphic) {
    world.debugGraphic = scene.add.graphics();
    world.debugGraphic.setDepth(999);
  }
  
  world.drawDebug = false; // Start with debug off
  world.debugGraphic.clear();
  
  // Create custom debug graphics for additional visuals
  const customGraphics = scene.add.graphics();
  customGraphics.setDepth(1000);
  
  // Add debug toggle key
  scene.input.keyboard?.on('keydown-F1', () => {
    world.drawDebug = !world.drawDebug;
    
    if (world.drawDebug) {
      // Enable Matter.js debug rendering
      scene.matter.world.createDebugGraphic();
      scene.matter.world.drawDebug = true;
      
      console.log('Physics Debug: ON (Bodies visible)');
    } else {
      // Clear debug graphics
      if (world.debugGraphic) {
        world.debugGraphic.clear();
      }
      customGraphics.clear();
      world.drawDebug = false;
      
      console.log('Physics Debug: OFF');
    }
  });
  
  // Custom debug rendering for velocity vectors
  scene.events.on('postupdate', () => {
    customGraphics.clear();
    
    if (!world.drawDebug) return;
    
    // Draw velocity vectors for moving bodies
    const bodies = scene.matter.world.localWorld.bodies;
    bodies.forEach((body: any) => {
      if (body.label === 'ghost' || body.label === 'ghostBody') {
        // Draw velocity vector
        const vel = body.velocity;
        const pos = body.position;
        
        if (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1) {
          customGraphics.lineStyle(2, 0x00ff00, 0.8);
          customGraphics.beginPath();
          customGraphics.moveTo(pos.x, pos.y);
          customGraphics.lineTo(
            pos.x + vel.x * 15,
            pos.y + vel.y * 15
          );
          customGraphics.strokePath();
          
          // Draw velocity magnitude
          customGraphics.fillStyle(0x00ff00, 0.8);
          customGraphics.fillCircle(pos.x + vel.x * 15, pos.y + vel.y * 15, 3);
        }
      }
    });
  });
  
  console.log('Physics Debug Ready - Press F1 to toggle visualization');
  
  return customGraphics;
}