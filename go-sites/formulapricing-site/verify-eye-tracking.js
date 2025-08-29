// Verification script for Professor Gopher eye tracking
// This can be run in browser console to test functionality

function verifyEyeTracking() {
  console.log('🔍 Verifying Professor Gopher Eye Tracking...');
  
  // Check if elements exist
  const leftEye = document.getElementById('left-eye');
  const rightEye = document.getElementById('right-eye');
  const container = document.getElementById('gopher-container');
  
  if (!leftEye || !rightEye || !container) {
    console.error('❌ Required elements not found');
    return false;
  }
  
  console.log('✅ All required elements found');
  
  // Test eye positioning
  const leftSocket = leftEye.parentElement;
  const rightSocket = rightEye.parentElement;
  
  const leftStyle = window.getComputedStyle(leftSocket);
  const rightStyle = window.getComputedStyle(rightSocket);
  
  console.log('👁️ Left eye position:', leftStyle.top, leftStyle.left);
  console.log('👁️ Right eye position:', rightStyle.top, rightStyle.left);
  
  // Simulate mouse movement to test tracking
  const testPositions = [
    { x: 100, y: 100 },
    { x: 500, y: 200 },
    { x: 300, y: 400 },
    { x: 800, y: 300 }
  ];
  
  console.log('🎯 Testing eye tracking with simulated mouse positions...');
  
  testPositions.forEach((pos, index) => {
    setTimeout(() => {
      const event = new MouseEvent('mousemove', {
        clientX: pos.x,
        clientY: pos.y
      });
      
      window.dispatchEvent(event);
      
      setTimeout(() => {
        const leftTransform = leftEye.style.transform;
        const rightTransform = rightEye.style.transform;
        
        console.log(`Position ${index + 1} (${pos.x}, ${pos.y}):`);
        console.log(`  Left eye: ${leftTransform}`);
        console.log(`  Right eye: ${rightTransform}`);
        
        if (index === testPositions.length - 1) {
          console.log('✅ Eye tracking verification complete!');
        }
      }, 100);
    }, index * 500);
  });
  
  return true;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(verifyEyeTracking, 1000);
  });
}