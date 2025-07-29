import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Mask } from "./Mask.tsx";

const maskExamples: ComponentExample[] = [
  {
    title: "Squircle Mask",
    description: "Rounded square mask shape",
    props: {
      variant: "squircle",
      children: (
        <div class="bg-primary w-20 h-20 flex items-center justify-center text-primary-content">
          Squircle
        </div>
      )
    }
  },
  {
    title: "Heart Mask",
    description: "Heart-shaped mask for romantic themes"},
  {
    title: "Hexagon Mask",
    description: "Hexagonal mask for geometric designs"},
  {
    title: "Triangle Mask",
    description: "Triangular mask for dynamic layouts"},
  {
    title: "Star Mask",
    description: "Star-shaped mask for special highlights"},
  {
    title: "Circle Mask",
    description: "Perfect circle mask for avatars"},
  {
    title: "Image Masks",
    description: "Masks applied to images"},
  {
    title: "Mask Gallery",
    description: "Grid showcasing all available mask shapes"},
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
  )};
