import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { PhoneMockup } from "./PhoneMockup.tsx";

const phoneExamples: ComponentExample[] = [
  {
    title: "Basic Phone Mockup",
    description: "Simple mobile device frame mockup",
    code: `<PhoneMockup>
  <div class="bg-gradient-to-br from-primary to-secondary h-full flex items-center justify-center text-primary-content">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-2">My App</h1>
      <p>Welcome to mobile</p>
    </div>
  </div>
</PhoneMockup>`,
    showCode: true,
  },
  {
    title: "iPhone with Camera",
    description: "iPhone mockup with camera cutout detail",
    code: `<PhoneMockup variant="iphone" color="black">
  <div class="bg-base-100 h-full">
    <div class="bg-info text-info-content p-4">
      <h2 class="text-xl font-bold">Social App</h2>
    </div>
    <div class="p-4 space-y-4">
      <div class="flex items-center gap-3">
        <div class="avatar">
          <div class="w-10 h-10 rounded-full bg-base-300"></div>
        </div>
        <div>
          <p class="font-semibold text-base-content">John Doe</p>
          <p class="text-sm text-base-content/60">2 hours ago</p>
        </div>
      </div>
      <p class="text-base-content">Just launched our new app! 🚀</p>
    </div>
  </div>
</PhoneMockup>`,
    showCode: true,
  },
  {
    title: "Different Colors",
    description: "Phone mockups with different frame colors",
    code: `<div class="flex gap-4">
  <PhoneMockup variant="iphone" color="black">
    <div class="bg-neutral text-neutral-content h-full flex items-center justify-center">
      <p>Dark Theme</p>
    </div>
  </PhoneMockup>
  <PhoneMockup variant="iphone" color="white">
    <div class="bg-base-100 text-base-content h-full flex items-center justify-center">
      <p>Light Theme</p>
    </div>
  </PhoneMockup>
  <PhoneMockup variant="android" color="blue">
    <div class="bg-info/20 text-info-content h-full flex items-center justify-center">
      <p>Android</p>
    </div>
  </PhoneMockup>
</div>`,
    showCode: true,
  },
  {
    title: "Different Sizes",
    description: "Phone mockups in various sizes",
    code: `<div class="flex items-end gap-4">
  <PhoneMockup size="sm">
    <div class="bg-success text-success-content h-full flex items-center justify-center text-sm">
      <p>Small</p>
    </div>
  </PhoneMockup>
  <PhoneMockup size="md">
    <div class="bg-info text-info-content h-full flex items-center justify-center">
      <p>Medium</p>
    </div>
  </PhoneMockup>
  <PhoneMockup size="lg">
    <div class="bg-accent text-accent-content h-full flex items-center justify-center text-lg">
      <p>Large</p>
    </div>
  </PhoneMockup>
</div>`,
    showCode: true,
  },
  {
    title: "Responsive E-commerce App",
    description: "Phone mockup showcasing a mobile app interface",
    code: `<PhoneMockup variant="iphone" class="mx-auto">
  <div class="bg-base-100 h-full flex flex-col">
    <div class="bg-primary text-primary-content p-4 text-center">
      <h3 class="text-lg font-bold">E-Commerce</h3>
    </div>
    <div class="flex-1 p-4 space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-base-200 p-3 rounded text-center">
          <div class="w-full h-16 bg-base-300 rounded mb-2"></div>
          <p class="text-sm font-medium text-base-content">Product 1</p>
          <p class="text-xs text-base-content/60">$29.99</p>
        </div>
        <div class="bg-base-200 p-3 rounded text-center">
          <div class="w-full h-16 bg-base-300 rounded mb-2"></div>
          <p class="text-sm font-medium text-base-content">Product 2</p>
          <p class="text-xs text-base-content/60">$39.99</p>
        </div>
      </div>
      <button class="w-full bg-primary text-primary-content py-2 rounded">
        View All
      </button>
    </div>
  </div>
</PhoneMockup>`,
    showCode: true,
  },
];

export const phoneMetadata: ComponentMetadata = {
  name: "Phone",
  description: "Mobile device mockup",
  category: ComponentCategory.MOCKUP,
  path: "/components/mockup/phone",
  tags: ["phone", "mobile", "mockup", "device", "demo", "showcase"],
  examples: phoneExamples,
  relatedComponents: ["artboard", "browser", "window"],
  preview: (
    <div class="flex gap-4">
      <PhoneMockup variant="iphone" color="black">
        <div class="bg-primary text-primary-content p-4 h-full flex items-center justify-center">
          iPhone App
        </div>
      </PhoneMockup>
      <PhoneMockup variant="android" color="white">
        <div class="bg-secondary text-secondary-content p-4 h-full flex items-center justify-center">
          Android App
        </div>
      </PhoneMockup>
    </div>
  ),
};
