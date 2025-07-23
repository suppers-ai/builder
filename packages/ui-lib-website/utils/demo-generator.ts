// Demo Video/GIF Generator Utilities for Component Showcase
// Reads component metadata from examples.md files
import { parse as parseYaml } from "https://deno.land/std@0.224.0/yaml/mod.ts";

interface ComponentDemo {
  name: string;
  category: string;
  description: string;
  variants: string[];
  interactions: string[];
  useCases: string[];
  examples: ComponentExample[];
}

interface ComponentExample {
  title: string;
  description: string;
  code: string;
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

// Component path mappings
const COMPONENT_PATHS: Record<string, string> = {
  "Button": "../ui-lib/components/action/button/Button.examples.md",
  "Card": "../ui-lib/components/display/card/Card.examples.md",
  "Modal": "../ui-lib/components/action/modal/Modal.examples.md",
  "Navbar": "../ui-lib/components/layout/navbar/Navbar.examples.md",
  "Input": "../ui-lib/components/input/input/Input.examples.md",
  "ThemeController": "../ui-lib/components/action/theme-controller/Theme Controller.examples.md",
};

export class DemoGenerator {
  private componentsCache: Map<string, ComponentDemo> = new Map();

  // Load component data from examples.md file
  private async loadComponentData(componentName: string): Promise<ComponentDemo | null> {
    const cached = this.componentsCache.get(componentName);
    if (cached) return cached;

    const filePath = COMPONENT_PATHS[componentName];
    if (!filePath) return null;

    try {
      const content = await Deno.readTextFile(filePath);
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
      
      if (!frontmatterMatch) return null;
      
      const frontmatter = parseYaml(frontmatterMatch[1]) as any;
      
      const examples = this.extractExamplesFromMarkdown(content);
      
      const componentData: ComponentDemo = {
        name: componentName,
        category: frontmatter.category || "Unknown",
        description: frontmatter.description || "",
        variants: frontmatter.demoInfo?.variants || [],
        interactions: frontmatter.demoInfo?.interactions || [],
        useCases: frontmatter.demoInfo?.useCases || [],
        examples,
      };
      
      this.componentsCache.set(componentName, componentData);
      return componentData;
    } catch (error) {
      console.error(`Failed to load component data for ${componentName}:`, error);
      return null;
    }
  }

  // Extract examples from markdown content
  private extractExamplesFromMarkdown(content: string): ComponentExample[] {
    const examples: ComponentExample[] = [];
    
    // Remove frontmatter
    const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
    
    // Match all sections with ## headers and code blocks
    const sectionRegex = /## ([^\n]+)\n\n([^#]*?)```tsx\n([\s\S]*?)```/g;
    let match;
    
    while ((match = sectionRegex.exec(contentWithoutFrontmatter)) !== null) {
      const title = match[1].trim();
      const description = match[2].trim();
      const code = match[3].trim();
      
      if (code) {
        examples.push({ title, description, code });
      }
    }
    
    return examples;
  }

  // Get all available components
  async getAllComponents(): Promise<ComponentDemo[]> {
    const components = await Promise.all(
      Object.keys(COMPONENT_PATHS).map(name => this.loadComponentData(name))
    );
    return components.filter(Boolean) as ComponentDemo[];
  }

  // Generate demo script based on actual examples
  async generateDemoScript(componentName: string): Promise<DemoScript | null> {
    const component = await this.loadComponentData(componentName);
    if (!component || !component.examples.length) return null;

    const scenes = component.examples.map((example, index) => ({
      name: example.title,
      duration: 4000, // 4 seconds per example
      actions: [
        `Show ${example.title.toLowerCase()}`,
        "Demonstrate functionality",
        "Highlight key features",
        "Show code implementation"
      ],
      description: example.description || `Demonstrate ${example.title}`,
    }));
    
    // Add introduction scene
    scenes.unshift({
      name: "Introduction",
      duration: 3000,
      actions: [
        "Show component overview",
        "Display component name and description",
        "Highlight category and purpose",
      ],
      description: `Introduce the ${component.name} component`,
    });

    return {
      component: componentName,
      scenes,
      totalDuration: scenes.reduce((total, scene) => total + scene.duration, 0),
    };
  }

  // Generate storyboard for demo video
  async generateStoryboard(componentName: string): Promise<string> {
    const script = await this.generateDemoScript(componentName);
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

  // Generate minimal CSS for demo display (no hardcoded animations)
  generateBasicDemoStyles(): string {
    return `/* Basic Demo Styles */
.demo-preview {
  border: 1px solid hsl(var(--border));
  transition: all 0.2s ease;
}

.demo-preview:hover {
  border-color: hsl(var(--primary));
}

.example-content {
  transition: opacity 0.3s ease;
}

.example-content.hidden {
  opacity: 0;
  pointer-events: none;
  position: absolute;
  left: -9999px;
}

.example-content.active {
  opacity: 1;
  pointer-events: auto;
  position: relative;
  left: auto;
}

/* Accessibility: Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}`;
  }

  // Generate HTML template for demo recording using actual examples
  async generateDemoHTML(componentName: string): Promise<string> {
    const component = await this.loadComponentData(componentName);
    if (!component || !component.examples.length) return "";

    const exampleTabs = component.examples.map((example, index) => 
      `<button class="tab tab-lifted ${index === 0 ? 'tab-active' : ''}" onclick="showExample(${index})">${example.title}</button>`
    ).join('');
    
    const exampleContents = component.examples.map((example, index) => 
      `<div id="example-${index}" class="example-content ${index === 0 ? 'active' : 'hidden'}">
        <div class="mb-4">
          <p class="text-base-content/70">${example.description}</p>
        </div>
        <div class="demo-preview bg-base-200 rounded-lg p-8 mb-4">
          ${this.convertTsxToHtml(example.code)}
        </div>
        <div class="mockup-code">
          <pre><code>${this.escapeHtml(example.code)}</code></pre>
        </div>
      </div>`
    ).join('');

    return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${component.name} Component Demo</title>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.4.24/dist/full.min.css" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-base-100">
  <div class="container mx-auto p-8">
    <!-- Demo Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-base-content mb-2">${component.name}</h1>
      <p class="text-lg text-base-content/70">${component.description}</p>
      <div class="badge badge-primary mt-2">${component.category}</div>
    </div>

    <!-- Example Tabs -->
    <div class="tabs tabs-lifted mb-4">
      ${exampleTabs}
    </div>

    <!-- Example Contents -->
    <div id="examples-container">
      ${exampleContents}
    </div>

    <!-- Component Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title">Variants</h3>
          <ul class="list-disc list-inside space-y-1">
            ${component.variants.map((variant) => `<li>${variant}</li>`).join("")}
          </ul>
        </div>
      </div>
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title">Use Cases</h3>
          <ul class="list-disc list-inside space-y-1">
            ${component.useCases.map((useCase) => `<li>${useCase}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  </div>

  <script>
    function showExample(index) {
      // Hide all examples
      document.querySelectorAll('.example-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
      });
      
      // Remove active class from all tabs
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('tab-active');
      });
      
      // Show selected example
      const selectedExample = document.getElementById('example-' + index);
      if (selectedExample) {
        selectedExample.classList.remove('hidden');
        selectedExample.classList.add('active');
      }
      
      // Activate selected tab
      const selectedTab = document.querySelectorAll('.tab')[index];
      if (selectedTab) {
        selectedTab.classList.add('tab-active');
      }
    }
  </script>
</body>
</html>`;
  }

  // Helper method to convert TSX to HTML (basic conversion)
  private convertTsxToHtml(tsxCode: string): string {
    // This is a basic conversion - in a real implementation you'd want a proper JSX parser
    return tsxCode
      .replace(/class=/g, 'class=')
      .replace(/{([^}]+)}/g, '$1')
      .replace(/className=/g, 'class=')
      .replace(/<([A-Z]\w+)([^>]*)>/g, '<div$2>') // Convert components to divs for demo
      .replace(/<\/[A-Z]\w+>/g, '</div>');
  }

  // Helper method to escape HTML
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
  async generateComponentDemoAssets(componentName: string): Promise<{
    storyboard: string;
    html: string;
    css: string;
    instructions: string;
  }> {
    return {
      storyboard: await this.generateStoryboard(componentName),
      html: await this.generateDemoHTML(componentName),
      css: this.generateBasicDemoStyles(),
      instructions: this.generateRecordingInstructions(),
    };
  }

}

// Usage example
export async function generateAllDemoAssets(): Promise<void> {
  const generator = new DemoGenerator();
  const components = await generator.getAllComponents();

  for (const component of components) {
    const assets = await generator.generateComponentDemoAssets(component.name);

    console.log(`\n=== ${component.name} Demo Assets ===`);
    console.log("Storyboard generated ✓");
    console.log("HTML template generated ✓");
    console.log("CSS animations generated ✓");
    console.log("Recording instructions ready ✓");
  }
}

// Auto-run when imported
if (typeof window !== "undefined") {
  console.log("Demo Generator utilities loaded");
  console.log("Use generateAllDemoAssets() to create demo assets");
}
