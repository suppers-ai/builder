import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { BrowserMockup } from "./BrowserMockup.tsx";

const browserExamples: ComponentExample[] = [
  {
    title: "Basic Browser",
    description: "Simple browser window mockup",
    code: `<BrowserMockup>
  <div class="bg-white h-full p-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Welcome to Our Website</h1>
      <p class="text-gray-600 mb-6">This is how your website looks in a browser.</p>
      <button class="bg-blue-600 text-white px-6 py-2 rounded-lg">
        Get Started
      </button>
    </div>
  </div>
</BrowserMockup>`,
    showCode: true,
  },
  {
    title: "Browser with Toolbar",
    description: "Browser mockup with address bar and controls",
    code: `<BrowserMockup url="https://mywebsite.com" showControls>
  <div class="bg-gradient-to-br from-purple-500 to-pink-500 h-full p-8 text-white">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-4">Modern Web Design</h1>
      <p class="text-xl opacity-90">Beautiful and user-friendly</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white/20 backdrop-blur rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-2">Fast</h3>
        <p class="opacity-90">Lightning fast loading</p>
      </div>
      <div class="bg-white/20 backdrop-blur rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-2">Secure</h3>
        <p class="opacity-90">Top-notch security</p>
      </div>
      <div class="bg-white/20 backdrop-blur rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-2">Scalable</h3>
        <p class="opacity-90">Grows with you</p>
      </div>
    </div>
  </div>
</BrowserMockup>`,
    showCode: true,
  },
  {
    title: "Browser with Custom URL",
    description: "Browser showing dashboard with specific URL",
    code: `<BrowserMockup url="https://dashboard.example.com/analytics" showControls>
  <div class="bg-gray-50 h-full p-6">
    <div class="bg-white rounded-lg shadow-sm h-full p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-blue-600">12,345</div>
          <div class="text-sm text-gray-600">Page Views</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-green-600">1,234</div>
          <div class="text-sm text-gray-600">Visitors</div>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-yellow-600">5:32</div>
          <div class="text-sm text-gray-600">Avg Session</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-purple-600">67%</div>
          <div class="text-sm text-gray-600">Bounce Rate</div>
        </div>
      </div>
      
      <div class="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center">
        <div class="text-gray-500">📊 Chart visualization</div>
      </div>
    </div>
  </div>
</BrowserMockup>`,
    showCode: true,
  },
  {
    title: "Dark Theme Browser",
    description: "Browser mockup with dark theme",
    code: `<BrowserMockup url="https://code-editor.dev" theme="dark" showControls>
  <div class="bg-gray-900 h-full p-6 text-white">
    <div class="bg-gray-800 rounded-lg h-full p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">Code Editor</h2>
        <div class="flex gap-2">
          <button class="bg-green-600 px-3 py-1 rounded text-sm">Run</button>
          <button class="bg-gray-700 px-3 py-1 rounded text-sm">Save</button>
        </div>
      </div>
      
      <div class="bg-gray-900 rounded p-4 font-mono text-sm">
        <div class="text-blue-400">function <span class="text-yellow-400">calculateSum</span><span class="text-white">(a, b) {</span></div>
        <div class="text-purple-400 ml-4">return <span class="text-white">a + b;</span></div>
        <div class="text-white">}</div>
      </div>
    </div>
  </div>
</BrowserMockup>`,
    showCode: true,
  },
  {
    title: "Responsive Browser",
    description: "Browser that adapts to different screen sizes",
    code: `<BrowserMockup url="https://responsive-site.com" showControls class="w-full max-w-4xl">
  <div class="bg-white h-full">
    <div class="bg-indigo-600 text-white p-4 md:p-8 text-center">
      <h1 class="text-2xl md:text-4xl font-bold mb-2">Responsive Design</h1>
      <p class="text-sm md:text-lg opacity-90">Looks great on any device</p>
    </div>
    
    <div class="p-4 md:p-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-100 p-4 rounded">
          <h3 class="font-semibold mb-2">Mobile</h3>
          <p class="text-sm text-gray-600">Mobile optimized</p>
        </div>
        <div class="bg-gray-100 p-4 rounded">
          <h3 class="font-semibold mb-2">Tablet</h3>
          <p class="text-sm text-gray-600">Tablet experience</p>
        </div>
        <div class="bg-gray-100 p-4 rounded">
          <h3 class="font-semibold mb-2">Desktop</h3>
          <p class="text-sm text-gray-600">Full features</p>
        </div>
      </div>
    </div>
  </div>
</BrowserMockup>`,
    showCode: true,
  },
];

export const browserMetadata: ComponentMetadata = {
  name: "Browser",
  description: "Browser window mockup",
  category: ComponentCategory.MOCKUP,
  path: "/components/mockup/browser",
  tags: ["browser", "mockup", "window", "frame", "demo", "showcase"],
  examples: browserExamples,
  relatedComponents: ["artboard", "window", "code"],
  preview: (
    <div class="w-80">
      <BrowserMockup url="https://example.com" showControls>
        <div class="bg-base-200 p-8 h-32 flex items-center justify-center">
          Website content goes here
        </div>
      </BrowserMockup>
    </div>
  ),
};
