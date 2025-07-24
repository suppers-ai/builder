import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Mask } from "./Mask.tsx";

const maskExamples: ComponentExample[] = [
  {
    title: "Squircle Mask",
    description: "Rounded square mask shape",
    code: `<Mask variant="squircle">
  <div class="bg-primary w-20 h-20 flex items-center justify-center text-primary-content">
    Squircle
  </div>
</Mask>`,
    showCode: true,
  },
  {
    title: "Heart Mask",
    description: "Heart-shaped mask for romantic themes",
    code: `<Mask variant="heart">
  <div class="bg-secondary w-20 h-20 flex items-center justify-center text-secondary-content">
    ❤️
  </div>
</Mask>`,
    showCode: true,
  },
  {
    title: "Hexagon Mask",
    description: "Hexagonal mask for geometric designs",
    code: `<Mask variant="hexagon">
  <div class="bg-accent w-20 h-20 flex items-center justify-center text-accent-content">
    HEX
  </div>
</Mask>`,
    showCode: true,
  },
  {
    title: "Triangle Mask",
    description: "Triangular mask for dynamic layouts",
    code: `<Mask variant="triangle">
  <div class="bg-info w-20 h-20 flex items-center justify-center text-info-content">
    △
  </div>
</Mask>`,
    showCode: true,
  },
  {
    title: "Star Mask",
    description: "Star-shaped mask for special highlights",
    code: `<Mask variant="star">
  <div class="bg-warning w-20 h-20 flex items-center justify-center text-warning-content">
    ⭐
  </div>
</Mask>`,
    showCode: true,
  },
  {
    title: "Circle Mask",
    description: "Perfect circle mask for avatars",
    code: `<Mask variant="circle">
  <div class="bg-success w-20 h-20 flex items-center justify-center text-success-content">
    ●
  </div>
</Mask>`,
    showCode: true,
  },
  {
    title: "Image Masks",
    description: "Masks applied to images",
    code: `<div class="flex gap-4">
  <Mask variant="heart">
    <img 
      src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" 
      alt="Heart"
      class="w-20 h-20 object-cover"
    />
  </Mask>
  <Mask variant="hexagon">
    <img 
      src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg" 
      alt="Hexagon"
      class="w-20 h-20 object-cover"
    />
  </Mask>
  <Mask variant="star">
    <img 
      src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg" 
      alt="Star"
      class="w-20 h-20 object-cover"
    />
  </Mask>
</div>`,
    showCode: true,
  },
  {
    title: "Mask Gallery",
    description: "Grid showcasing all available mask shapes",
    code: `<div class="grid grid-cols-3 gap-4">
  <Mask variant="circle">
    <div class="bg-blue-500 w-16 h-16"></div>
  </Mask>
  <Mask variant="squircle">
    <div class="bg-green-500 w-16 h-16"></div>
  </Mask>
  <Mask variant="hexagon">
    <div class="bg-purple-500 w-16 h-16"></div>
  </Mask>
  <Mask variant="triangle">
    <div class="bg-red-500 w-16 h-16"></div>
  </Mask>
  <Mask variant="star">
    <div class="bg-yellow-500 w-16 h-16"></div>
  </Mask>
  <Mask variant="heart">
    <div class="bg-pink-500 w-16 h-16"></div>
  </Mask>
</div>`,
    showCode: true,
  },
];

export const maskMetadata: ComponentMetadata = {
  name: "Mask",
  description: "Shape masking utility",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/mask",
  tags: ["mask", "shape", "clip", "cut", "geometric", "design"],
  examples: maskExamples,
  relatedComponents: ["avatar", "artboard", "card"],
  preview: (
    <div class="flex gap-3">
      <Mask variant="heart">
        <div class="bg-primary w-16 h-16"></div>
      </Mask>
      <Mask variant="hexagon">
        <div class="bg-secondary w-16 h-16"></div>
      </Mask>
      <Mask variant="star">
        <div class="bg-accent w-16 h-16"></div>
      </Mask>
    </div>
  ),
};
