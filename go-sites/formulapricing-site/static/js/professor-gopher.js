document.addEventListener('DOMContentLoaded', function() {
  const leftEye = document.getElementById('left-eye');
  const rightEye = document.getElementById('right-eye');
  const container = document.getElementById('gopher-container');

  // Graceful degradation - if elements not found, exit silently
  if (!leftEye || !rightEye || !container) {
    console.warn('Professor Gopher eye tracking: Required elements not found');
    return;
  }

  console.log('Professor Gopher eye tracking initialized successfully');

  // Performance optimization: throttle mouse move events
  let animationFrameId = null;
  
  function handleMouseMove(e) {
    // Cancel previous animation frame if it exists
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    // Schedule the eye update for the next animation frame
    animationFrameId = requestAnimationFrame(function() {
      try {
        // Get bounding rectangles for calculations
        const leftSocket = leftEye.parentElement.getBoundingClientRect();
        const rightSocket = rightEye.parentElement.getBoundingClientRect();

        // Calculate angle for left eye - exact same math as original
        const leftCenterX = leftSocket.left + leftSocket.width / 2;
        const leftCenterY = leftSocket.top + leftSocket.height / 2;
        const leftAngle = Math.atan2(e.clientY - leftCenterY, e.clientX - leftCenterX);
        const leftDegrees = leftAngle * (180 / Math.PI);

        // Calculate angle for right eye - exact same math as original
        const rightCenterX = rightSocket.left + rightSocket.width / 2;
        const rightCenterY = rightSocket.top + rightSocket.height / 2;
        const rightAngle = Math.atan2(e.clientY - rightCenterY, e.clientX - rightCenterX);
        const rightDegrees = rightAngle * (180 / Math.PI);

        // Apply rotation to eyes with smooth transitions
        leftEye.style.transform = `rotate(${leftDegrees}deg)`;
        rightEye.style.transform = `rotate(${rightDegrees}deg)`;
      } catch (error) {
        // Silently handle any errors to prevent breaking the page
        console.warn('Eye tracking error:', error);
      }
    });
  }

  // Add mouse move event listener to window for global tracking
  window.addEventListener('mousemove', handleMouseMove);
  
  // Add touch support for mobile devices
  window.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    }
  });

  // Handle window resize to recalculate positions
  window.addEventListener('resize', function() {
    // Clear any pending animation frame on resize
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });
});