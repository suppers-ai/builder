
// Test JavaScript for visual regression testing
document.addEventListener('DOMContentLoaded', function() {
  console.log('Formula Pricing Site loaded');
  
  // Simple eye tracking simulation for testing
  const professorGopher = document.querySelector('.professor-gopher');
  if (professorGopher) {
    console.log('Professor Gopher found');
    
    // Add eye tracking functionality
    document.addEventListener('mousemove', function(e) {
      // Simple eye tracking logic for testing
      const rect = professorGopher.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      // Calculate angle for eye rotation
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      
      // Apply transformation (this would be more complex in real implementation)
      professorGopher.style.filter = 'hue-rotate(' + (angle / 10) + 'deg)';
    });
  }
});
