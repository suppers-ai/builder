import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { WindowMockup } from "./WindowMockup.tsx";

const windowExamples: ComponentExample[] = [
  {
    title: "Basic Window",
    description: "Simple OS window mockup",
    code: `<WindowMockup title="My Application" showControls>
  <div class="bg-white p-6 h-48 flex items-center justify-center">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome</h2>
      <p class="text-gray-600">Your application content goes here</p>
    </div>
  </div>
</WindowMockup>`,
    showCode: true,
  },
  {
    title: "Window with Toolbar",
    description: "Window with toolbar and menu items",
    code: `<WindowMockup title="Code Editor" showControls showToolbar>
  <div class="bg-gray-900 text-white h-64">
    <div class="bg-gray-800 px-4 py-2 border-b border-gray-700">
      <div class="flex gap-4 text-sm">
        <span class="text-blue-400">File</span>
        <span class="text-blue-400">Edit</span>
        <span class="text-blue-400">View</span>
        <span class="text-blue-400">Help</span>
      </div>
    </div>
    <div class="p-4 font-mono text-sm">
      <div class="text-blue-400">function <span class="text-yellow-400">calculateSum</span><span class="text-white">(a, b) {</span></div>
      <div class="text-purple-400 ml-4">return <span class="text-white">a + b;</span></div>
      <div class="text-white">}</div>
      <div class="text-green-400 mt-2">// This function adds two numbers</div>
    </div>
  </div>
</WindowMockup>`,
    showCode: true,
  },
  {
    title: "Colored Window",
    description: "Window with custom title bar color",
    code: `<WindowMockup title="Music Player" showControls titleBarColor="bg-purple-600">
  <div class="bg-gradient-to-br from-purple-100 to-pink-100 p-6 h-56">
    <div class="text-center mb-6">
      <div class="w-24 h-24 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-800">Now Playing</h3>
      <p class="text-gray-600">Song Title - Artist Name</p>
    </div>
    <div class="flex justify-center gap-4">
      <button class="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center">⏮</button>
      <button class="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center">▶</button>
      <button class="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center">⏭</button>
    </div>
  </div>
</WindowMockup>`,
    showCode: true,
  },
  {
    title: "Responsive Window",
    description: "Window that adapts to different screen sizes",
    code: `<WindowMockup title="Dashboard" showControls class="w-full max-w-4xl">
  <div class="bg-gray-50 p-4 md:p-6 min-h-64">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-2xl font-bold text-blue-600">1,234</div>
        <div class="text-sm text-gray-600">Total Users</div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-2xl font-bold text-green-600">$12,345</div>
        <div class="text-sm text-gray-600">Revenue</div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-2xl font-bold text-purple-600">98%</div>
        <div class="text-sm text-gray-600">Satisfaction</div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="font-semibold mb-3">Recent Activity</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between py-2 border-b">
          <span>New user registration</span>
          <span class="text-gray-500">2 min ago</span>
        </div>
        <div class="flex justify-between py-2 border-b">
          <span>Payment processed</span>
          <span class="text-gray-500">5 min ago</span>
        </div>
        <div class="flex justify-between py-2">
          <span>Report generated</span>
          <span class="text-gray-500">10 min ago</span>
        </div>
      </div>
    </div>
  </div>
</WindowMockup>`,
    showCode: true,
  },
  {
    title: "Minimized Window",
    description: "Window in minimized state with reduced content",
    code: `<WindowMockup title="Calculator" showControls minimized>
  <div class="bg-gray-100 p-4 h-32 flex items-center justify-center">
    <div class="text-center text-gray-500">
      <div class="text-2xl mb-2">🧮</div>
      <div class="text-sm">Window minimized</div>
    </div>
  </div>
</WindowMockup>`,
    showCode: true,
  },
];

export const windowMetadata: ComponentMetadata = {
  name: "Window",
  description: "OS window mockup",
  category: ComponentCategory.MOCKUP,
  path: "/components/mockup/window",
  tags: ["window", "mockup", "os", "frame", "demo", "showcase"],
  examples: windowExamples,
  relatedComponents: ["browser", "artboard", "phone"],
  preview: (
    <div class="w-80">
      <WindowMockup title="My Application" showControls>
        <div class="bg-base-100 p-6 h-32 flex items-center justify-center border-t">
          Application content area
        </div>
      </WindowMockup>
    </div>
  ),
};
