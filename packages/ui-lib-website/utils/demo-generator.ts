// Demo Video/GIF Generator Utilities for Component Showcase

interface ComponentDemo {
  name: string;
  category: string;
  description: string;
  variants: string[];
  interactions: string[];
  useCases: string[];
}

interface DemoScript {
  component: string;
  scenes: Array<{
    name: string;
    duration: number;
    actions: string[];
    description: string;
  }>;
  totalDuration: number;
}

export class DemoGenerator {
  private components: ComponentDemo[] = [
    {
      name: "Button",
      category: "Action",
      description: "Interactive button component with multiple variants",
      variants: ["primary", "secondary", "accent", "ghost", "link", "outline"],
      interactions: ["hover", "click", "focus", "disabled"],
      useCases: ["Form submission", "Navigation", "Actions", "Loading states"],
    },
    {
      name: "Card",
      category: "Display",
      description: "Content container with flexible layout options",
      variants: ["default", "compact", "side", "image-overlay"],
      interactions: ["hover effects", "clickable", "expandable"],
      useCases: ["Product showcase", "User profiles", "Content preview", "Information display"],
    },
    {
      name: "Modal",
      category: "Action",
      description: "Dialog overlay for focused interactions",
      variants: ["default", "bottom sheet", "full screen", "confirmation"],
      interactions: ["open", "close", "backdrop click", "keyboard navigation"],
      useCases: ["User forms", "Confirmations", "Image gallery", "Settings"],
    },
    {
      name: "Navbar",
      category: "Navigation",
      description: "Top navigation bar with responsive design",
      variants: ["horizontal", "vertical", "with dropdown", "with search"],
      interactions: ["menu toggle", "dropdown", "search", "responsive collapse"],
      useCases: ["Site navigation", "App header", "User menu", "Brand display"],
    },
    {
      name: "Input",
      category: "Data Input",
      description: "Text input field with validation and styling",
      variants: ["text", "email", "password", "search", "textarea"],
      interactions: ["focus", "validation", "error states", "helper text"],
      useCases: ["Forms", "Search", "User input", "Data entry"],
    },
    {
      name: "ThemeController",
      category: "Action",
      description: "Theme switching interface with live preview",
      variants: ["dropdown", "toggle", "button grid", "modal selector"],
      interactions: ["theme change", "preview", "persistence", "smooth transitions"],
      useCases: ["User preferences", "Theme showcase", "Customization", "Brand switching"],
    },
  ];

  // Generate demo script for a component
  generateDemoScript(componentName: string): DemoScript | null {
    const component = this.components.find((c) => c.name === componentName);
    if (!component) return null;

    const scenes = [
      {
        name: "Introduction",
        duration: 3000,
        actions: [
          "Show component in default state",
          "Display component name and description",
          "Highlight key features",
        ],
        description: `Introduce the ${component.name} component`,
      },
      {
        name: "Variants Showcase",
        duration: 5000,
        actions: [
          "Cycle through all variants",
          "Show side-by-side comparison",
          "Highlight unique features of each variant",
        ],
        description: "Demonstrate different component variants",
      },
      {
        name: "Interactive Demo",
        duration: 6000,
        actions: [
          "Show hover states",
          "Demonstrate click interactions",
          "Show focus and keyboard navigation",
          "Display loading and disabled states",
        ],
        description: "Interactive features and states",
      },
      {
        name: "Use Cases",
        duration: 4000,
        actions: [
          "Show real-world examples",
          "Demonstrate in different contexts",
          "Show responsive behavior",
        ],
        description: "Practical usage examples",
      },
      {
        name: "Code Preview",
        duration: 3000,
        actions: [
          "Show code snippet",
          "Highlight key props",
          "Show TypeScript types",
        ],
        description: "Code implementation example",
      },
    ];

    return {
      component: componentName,
      scenes,
      totalDuration: scenes.reduce((total, scene) => total + scene.duration, 0),
    };
  }

  // Generate storyboard for demo video
  generateStoryboard(componentName: string): string {
    const script = this.generateDemoScript(componentName);
    if (!script) return "";

    let storyboard = `# ${script.component} Component Demo Storyboard\n\n`;
    storyboard += `**Total Duration:** ${(script.totalDuration / 1000).toFixed(1)} seconds\n\n`;

    script.scenes.forEach((scene, index) => {
      storyboard += `## Scene ${index + 1}: ${scene.name}\n`;
      storyboard += `**Duration:** ${(scene.duration / 1000).toFixed(1)}s\n`;
      storyboard += `**Description:** ${scene.description}\n\n`;
      storyboard += `**Actions:**\n`;

      scene.actions.forEach((action) => {
        storyboard += `- ${action}\n`;
      });

      storyboard += `\n**Visual Notes:**\n`;
      storyboard += `- Use smooth transitions between states\n`;
      storyboard += `- Highlight interactive elements with subtle animations\n`;
      storyboard += `- Show component in context with other UI elements\n`;
      storyboard += `- Use consistent branding and color scheme\n\n`;
    });

    return storyboard;
  }

  // Generate CSS animations for demo
  generateDemoAnimations(componentName: string): string {
    return `/* Demo Animations for ${componentName} Component */

.demo-container {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, hsl(var(--p)/0.1), hsl(var(--s)/0.1));
  border-radius: 1rem;
  overflow: hidden;
}

.demo-spotlight {
  position: relative;
}

.demo-spotlight::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: spotlight-rotate 8s linear infinite;
  pointer-events: none;
}

@keyframes spotlight-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.demo-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.demo-scale-in {
  animation: scaleIn 0.4s ease-out forwards;
  transform: scale(0.9);
  opacity: 0;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.demo-slide-in {
  animation: slideIn 0.5s ease-out forwards;
  transform: translateX(-30px);
  opacity: 0;
}

@keyframes slideIn {
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.demo-pulse {
  animation: demoPulse 2s ease-in-out infinite;
}

@keyframes demoPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.demo-hover-effect {
  transition: all 0.3s ease;
  cursor: pointer;
}

.demo-hover-effect:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.demo-loading {
  position: relative;
  overflow: hidden;
}

.demo-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.demo-variant-transition {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.demo-code-highlight {
  animation: codeHighlight 2s ease-in-out;
}

@keyframes codeHighlight {
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(var(--p), 0.1); }
}

/* Interactive Demo Specific Animations */
.demo-interaction-ripple {
  position: relative;
  overflow: hidden;
}

.demo-interaction-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(var(--p), 0.3);
  transform: translate(-50%, -50%);
  animation: ripple 0.6s linear;
}

@keyframes ripple {
  to {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

/* Responsive Demo Animations */
@media (max-width: 768px) {
  .demo-container {
    padding: 1rem;
  }
  
  .demo-spotlight::before {
    animation-duration: 6s;
  }
}

/* Theme-aware animations */
[data-theme="dark"] .demo-spotlight::before {
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
}

/* Accessibility: Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .demo-spotlight::before,
  .demo-pulse,
  .demo-loading::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
  
  .demo-fade-in,
  .demo-scale-in,
  .demo-slide-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
}`;
  }

  // Generate HTML template for demo recording
  generateDemoHTML(componentName: string): string {
    const component = this.components.find((c) => c.name === componentName);
    if (!component) return "";

    return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${component.name} Component Demo</title>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.4.24/dist/full.min.css" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${this.generateDemoAnimations(componentName)}
  </style>
</head>
<body class="bg-base-100">
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="demo-container max-w-4xl w-full">
      <!-- Demo Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-base-content mb-2">${component.name}</h1>
        <p class="text-lg text-base-content/70">${component.description}</p>
        <div class="badge badge-primary mt-2">${component.category}</div>
      </div>

      <!-- Component Showcase Area -->
      <div id="demo-stage" class="demo-spotlight bg-base-200 rounded-lg p-8 mb-8 min-h-[300px] flex items-center justify-center">
        <!-- Dynamic component content will be inserted here -->
        <div id="component-container" class="w-full text-center">
          <!-- Component examples will be dynamically loaded -->
        </div>
      </div>

      <!-- Demo Controls -->
      <div class="flex flex-wrap gap-4 justify-center mb-8">
        <button class="btn btn-primary" onclick="showVariants()">Show Variants</button>
        <button class="btn btn-secondary" onclick="showInteractions()">Interactions</button>
        <button class="btn btn-accent" onclick="showUseCases()">Use Cases</button>
        <button class="btn btn-ghost" onclick="showCode()">View Code</button>
      </div>

      <!-- Info Panel -->
      <div id="info-panel" class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Component Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold mb-2">Variants</h4>
              <ul class="list-disc list-inside space-y-1">
                ${component.variants.map((variant) => `<li>${variant}</li>`).join("")}
              </ul>
            </div>
            <div>
              <h4 class="font-semibold mb-2">Use Cases</h4>
              <ul class="list-disc list-inside space-y-1">
                ${component.useCases.map((useCase) => `<li>${useCase}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Demo orchestration script
    let currentDemo = 'default';
    
    function showVariants() {
      // Implementation for showing component variants
      updateDemoContent('variants');
    }
    
    function showInteractions() {
      // Implementation for showing interactions
      updateDemoContent('interactions');
    }
    
    function showUseCases() {
      // Implementation for showing use cases
      updateDemoContent('useCases');
    }
    
    function showCode() {
      // Implementation for showing code examples
      updateDemoContent('code');
    }
    
    function updateDemoContent(type) {
      const container = document.getElementById('component-container');
      container.classList.add('demo-fade-in');
      
      // Content would be dynamically updated based on type
      setTimeout(() => {
        container.classList.remove('demo-fade-in');
      }, 600);
    }
    
    // Auto-play demo sequence
    function autoPlayDemo() {
      const sequence = ['variants', 'interactions', 'useCases', 'code'];
      let currentIndex = 0;
      
      setInterval(() => {
        updateDemoContent(sequence[currentIndex]);
        currentIndex = (currentIndex + 1) % sequence.length;
      }, 4000);
    }
    
    // Start auto-play after page load
    window.addEventListener('load', () => {
      setTimeout(autoPlayDemo, 2000);
    });
  </script>
</body>
</html>`;
  }

  // Generate demo recording instructions
  generateRecordingInstructions(): string {
    return `# Component Demo Recording Instructions

## Equipment & Software Setup

### Recording Software Options:
1. **OBS Studio** (Free, cross-platform)
   - Resolution: 1920x1080 (1080p)
   - Frame Rate: 60 FPS
   - Format: MP4 (H.264)

2. **ScreenFlow** (Mac) / **Camtasia** (Windows)
   - High-quality screen recording
   - Built-in editing capabilities

3. **Loom** (Web-based)
   - Quick and easy sharing
   - Good for draft recordings

### Browser Setup:
- Use Chrome/Firefox in incognito mode
- Disable extensions that might interfere
- Set browser zoom to 100%
- Use consistent window size (1440x900 recommended)

## Recording Settings

### Video Specifications:
- **Resolution:** 1920x1080 (4K if targeting high-end)
- **Frame Rate:** 60 FPS (30 FPS minimum)
- **Bitrate:** 8-12 Mbps for 1080p
- **Duration:** 15-30 seconds per component
- **Format:** MP4 (H.264 codec)

### Audio (if needed):
- Sample Rate: 48kHz
- Bitrate: 320 kbps
- Use external microphone for narration

## Recording Process

### Pre-Recording Checklist:
1. ✅ Clear browser cache and cookies
2. ✅ Close unnecessary applications
3. ✅ Disable notifications (Do Not Disturb)
4. ✅ Prepare demo HTML files
5. ✅ Test all interactions beforehand
6. ✅ Set up proper lighting (if showing hands/cursor)

### Recording Steps:
1. **Start Recording**
   - Begin with component in default state
   - Show component name and category

2. **Demonstrate Variants** (5-8 seconds)
   - Cycle through all visual variants
   - Use smooth transitions
   - Highlight unique features

3. **Show Interactions** (8-12 seconds)
   - Hover effects
   - Click interactions
   - Focus states
   - Disabled states

4. **Context Examples** (5-8 seconds)
   - Show component in realistic layouts
   - Demonstrate responsive behavior
   - Show with other components

5. **Code Preview** (3-5 seconds)
   - Quick glimpse of implementation
   - Highlight key props

### Recording Best Practices:
- **Smooth Movements:** Slow, deliberate cursor movements
- **Consistent Timing:** Hold each state for 1-2 seconds
- **Visual Polish:** Use consistent themes and styling
- **Responsive Demo:** Show mobile and desktop views
- **Error States:** Include loading and error demonstrations

## Post-Processing

### Video Editing:
1. **Trim** excess footage from beginning/end
2. **Add Transitions** between sections (fade/dissolve)
3. **Color Correction** for consistent appearance
4. **Add Captions** for accessibility
5. **Optimize** file size without quality loss

### Export Settings:
- **Web (GitHub/Social):** MP4, 1080p, 30fps, 5-8 Mbps
- **Documentation:** GIF, 720p, 15fps, optimized
- **High Quality:** MP4, 4K, 60fps, 15-20 Mbps

### GIF Conversion:
\`\`\`bash
# Using FFmpeg for high-quality GIF conversion
ffmpeg -i input.mp4 -vf "fps=15,scale=720:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i input.mp4 -i palette.png -vf "fps=15,scale=720:-1:flags=lanczos,paletteuse" output.gif

# Optimize GIF size
gifsicle -O3 --lossy=80 output.gif -o optimized.gif
\`\`\`

## Quality Standards

### Visual Quality:
- ✅ Crisp, clear text and UI elements
- ✅ Consistent color reproduction
- ✅ Smooth animations (no stuttering)
- ✅ Proper aspect ratio maintained

### Content Quality:
- ✅ All major features demonstrated
- ✅ Realistic use case examples
- ✅ Responsive behavior shown
- ✅ Error/loading states included

### Accessibility:
- ✅ Captions for any audio content
- ✅ High contrast for visual elements
- ✅ Descriptive filename and alt text
- ✅ Keyboard navigation demonstrated

## File Organization

### Naming Convention:
\`\`\`
component-name-demo.mp4
component-name-demo.gif
component-name-demo-mobile.mp4
component-name-interactions.gif
\`\`\`

### Directory Structure:
\`\`\`
demos/
├── videos/
│   ├── actions/
│   │   ├── button-demo.mp4
│   │   ├── modal-demo.mp4
│   │   └── theme-controller-demo.mp4
│   ├── display/
│   │   ├── card-demo.mp4
│   │   └── avatar-demo.mp4
│   └── navigation/
│       └── navbar-demo.mp4
├── gifs/
│   ├── button-variants.gif
│   ├── modal-interactions.gif
│   └── theme-switching.gif
└── thumbnails/
    ├── button-thumb.jpg
    └── modal-thumb.jpg
\`\`\`

## Distribution

### Platform Specifications:
- **GitHub README:** 720p GIF, <5MB
- **Social Media:** 1080p MP4, 16:9 aspect ratio
- **Documentation:** 720p MP4 with fallback GIF
- **Component Library:** Embedded HTML5 video

### Optimization Tips:
- Use modern codecs (H.265/AV1) when supported
- Implement lazy loading for demo videos
- Provide multiple formats for browser compatibility
- Include poster images for faster loading`;
  }

  // Generate all demo assets for a component
  generateComponentDemoAssets(componentName: string): {
    storyboard: string;
    html: string;
    css: string;
    instructions: string;
  } {
    return {
      storyboard: this.generateStoryboard(componentName),
      html: this.generateDemoHTML(componentName),
      css: this.generateDemoAnimations(componentName),
      instructions: this.generateRecordingInstructions(),
    };
  }

  // Get list of all components that need demos
  getAllComponents(): ComponentDemo[] {
    return this.components;
  }
}

// Usage example
export function generateAllDemoAssets(): void {
  const generator = new DemoGenerator();
  const components = generator.getAllComponents();

  components.forEach((component) => {
    const assets = generator.generateComponentDemoAssets(component.name);

    console.log(`\n=== ${component.name} Demo Assets ===`);
    console.log("Storyboard generated ✓");
    console.log("HTML template generated ✓");
    console.log("CSS animations generated ✓");
    console.log("Recording instructions ready ✓");
  });
}

// Auto-run when imported
if (typeof window !== "undefined") {
  console.log("Demo Generator utilities loaded");
  console.log("Use generateAllDemoAssets() to create demo assets");
}
