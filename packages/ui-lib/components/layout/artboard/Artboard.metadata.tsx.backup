import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Artboard } from "./Artboard.tsx";

const artboardExamples: ComponentExample[] = [
  {
    title: "Basic Artboard",
    description: "Simple design mockup container",
    code: `<Artboard size="2">
  <div class="bg-gradient-to-br from-blue-500 to-purple-600 h-full flex items-center justify-center text-white">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-2">Welcome</h1>
      <p>Your content goes here</p>
    </div>
  </div>
</Artboard>`,
    props: {
      size: "2",
      children: (
        <div class="bg-gradient-to-br from-blue-500 to-purple-600 h-full flex items-center justify-center text-white">
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-2">Welcome</h1>
            <p>Your content goes here</p>
          </div>
        </div>
      )
    },
    showCode: true,
  },
  {
    title: "Phone Artboard",
    description: "Mobile-sized artboard for app mockups",
    code: `<Artboard size="2" phone>
  <div class="bg-white h-full">
    <div class="bg-indigo-600 text-white p-4 text-center">
      <h2 class="text-xl font-bold">My Mobile App</h2>
    </div>
    <div class="p-4 space-y-4">
      <div class="bg-gray-100 p-4 rounded">
        <h3 class="font-semibold">Feature 1</h3>
        <p class="text-sm text-gray-600">App feature description</p>
      </div>
      <button class="w-full bg-indigo-600 text-white py-2 rounded">
        Get Started
      </button>
    </div>
  </div>
</Artboard>`,
    props: {
      size: "2",
      phone: true,
      children: (
        <div class="bg-white h-full">
          <div class="bg-indigo-600 text-white p-4 text-center">
            <h2 class="text-xl font-bold">My Mobile App</h2>
          </div>
          <div class="p-4 space-y-4">
            <div class="bg-gray-100 p-4 rounded">
              <h3 class="font-semibold">Feature 1</h3>
              <p class="text-sm text-gray-600">App feature description</p>
            </div>
            <button class="w-full bg-indigo-600 text-white py-2 rounded">
              Get Started
            </button>
          </div>
        </div>
      )
    },
    showCode: true,
  },
  {
    title: "Horizontal Artboard",
    description: "Wide artboard for desktop designs",
    code: `<Artboard size="3" horizontal>
  <div class="bg-gradient-to-r from-green-400 to-teal-500 h-full p-8">
    <div class="text-white text-center">
      <h1 class="text-4xl font-bold mb-4">Desktop Experience</h1>
      <p class="text-lg opacity-90 mb-6">
        Beautiful desktop interface design
      </p>
      <div class="flex gap-4 justify-center">
        <button class="bg-white text-green-600 px-6 py-2 rounded">
          Get Started
        </button>
        <button class="border-2 border-white text-white px-6 py-2 rounded">
          Learn More
        </button>
      </div>
    </div>
  </div>
</Artboard>`,
    props: {
      size: "3",
      horizontal: true,
      children: (
        <div class="bg-gradient-to-r from-green-400 to-teal-500 h-full p-8">
          <div class="text-white text-center">
            <h1 class="text-4xl font-bold mb-4">Desktop Experience</h1>
            <p class="text-lg opacity-90 mb-6">
              Beautiful desktop interface design
            </p>
            <div class="flex gap-4 justify-center">
              <button class="bg-white text-green-600 px-6 py-2 rounded">
                Get Started
              </button>
              <button class="border-2 border-white text-white px-6 py-2 rounded">
                Learn More
              </button>
            </div>
          </div>
        </div>
      )
    },
    showCode: true,
  },
  {
    title: "Demo Artboard",
    description: "Artboard with demo content showcase",
    code: `<Artboard size="4" class="bg-gray-50">
  <div class="h-full p-6">
    <div class="bg-white rounded-lg shadow-lg h-full p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Dashboard Demo</h2>
      
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-blue-600">1,234</div>
          <div class="text-sm text-gray-600">Users</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-green-600">$12K</div>
          <div class="text-sm text-gray-600">Revenue</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold text-purple-600">98%</div>
          <div class="text-sm text-gray-600">Satisfaction</div>
        </div>
      </div>
      
      <div class="bg-gray-100 rounded p-4">
        <h3 class="font-semibold mb-2">Recent Activity</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>User registration</span>
            <span class="text-gray-500">2 min ago</span>
          </div>
          <div class="flex justify-between">
            <span>New order</span>
            <span class="text-gray-500">5 min ago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</Artboard>`,
    props: {
      size: "4",
      class: "bg-gray-50",
      children: (
        <div class="h-full p-6">
          <div class="bg-white rounded-lg shadow-lg h-full p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Dashboard Demo</h2>
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-blue-600">1,234</div>
                <div class="text-sm text-gray-600">Users</div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-green-600">$12K</div>
                <div class="text-sm text-gray-600">Revenue</div>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-purple-600">98%</div>
                <div class="text-sm text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    showCode: true,
  },
  {
    title: "Responsive Artboard",
    description: "Artboard that adapts to different screen sizes",
    code: `<Artboard size="5" class="w-full max-w-4xl mx-auto">
  <div class="bg-gradient-to-br from-pink-400 to-yellow-500 h-full p-4 md:p-8">
    <div class="bg-white/90 backdrop-blur rounded-lg h-full p-6">
      <div class="text-center mb-6">
        <h1 class="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          Responsive Design
        </h1>
        <p class="text-gray-600">Adapts to any screen size</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-50 p-4 rounded text-center">
          <div class="w-8 h-8 bg-blue-500 rounded mx-auto mb-2"></div>
          <h3 class="font-semibold">Mobile</h3>
        </div>
        <div class="bg-gray-50 p-4 rounded text-center">
          <div class="w-8 h-8 bg-green-500 rounded mx-auto mb-2"></div>
          <h3 class="font-semibold">Tablet</h3>
        </div>
        <div class="bg-gray-50 p-4 rounded text-center">
          <div class="w-8 h-8 bg-purple-500 rounded mx-auto mb-2"></div>
          <h3 class="font-semibold">Desktop</h3>
        </div>
      </div>
    </div>
  </div>
</Artboard>`,
    props: {
      size: "5",
      class: "w-full max-w-4xl mx-auto",
      children: (
        <div class="bg-gradient-to-br from-pink-400 to-yellow-500 h-full p-4">
          <div class="bg-white/90 backdrop-blur rounded-lg h-full p-6">
            <div class="text-center mb-6">
              <h1 class="text-2xl font-bold text-gray-800 mb-2">Responsive Design</h1>
              <p class="text-gray-600">Adapts to any screen size</p>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-gray-50 p-4 rounded text-center">
                <div class="w-8 h-8 bg-blue-500 rounded mx-auto mb-2"></div>
                <h3 class="font-semibold">Mobile</h3>
              </div>
              <div class="bg-gray-50 p-4 rounded text-center">
                <div class="w-8 h-8 bg-green-500 rounded mx-auto mb-2"></div>
                <h3 class="font-semibold">Tablet</h3>
              </div>
              <div class="bg-gray-50 p-4 rounded text-center">
                <div class="w-8 h-8 bg-purple-500 rounded mx-auto mb-2"></div>
                <h3 class="font-semibold">Desktop</h3>
              </div>
            </div>
          </div>
        </div>
      )
    },
    showCode: true,
  },
];

export const artboardMetadata: ComponentMetadata = {
  name: "Artboard",
  description: "Device mockup frame",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/artboard",
  tags: ["artboard", "mockup", "device", "frame", "demo", "showcase"],
  examples: artboardExamples,
  relatedComponents: ["mockup", "hero", "card"],
  preview: (
    <div class="flex gap-4">
      <Artboard size="2" phone>
        <div class="bg-primary text-primary-content p-4 h-full flex items-center justify-center">
          Mobile View
        </div>
      </Artboard>
      <Artboard size="3" horizontal>
        <div class="bg-secondary text-secondary-content p-4 h-full flex items-center justify-center">
          Desktop View
        </div>
      </Artboard>
    </div>
  ),
};
