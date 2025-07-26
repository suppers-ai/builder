/**
 * UI Constants
 * Common UI-related constants used across packages
 */

// Theme constants
export const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
] as const;

export type Theme = typeof THEMES[number];

// Default theme
export const DEFAULT_THEME: Theme = "light";

// Component sizes
export const COMPONENT_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
export type ComponentSize = typeof COMPONENT_SIZES[number];

// Component variants
export const BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "accent",
  "ghost",
  "link",
  "info",
  "success",
  "warning",
  "error",
] as const;

export type ButtonVariant = typeof BUTTON_VARIANTS[number];

// Color variants
export const COLOR_VARIANTS = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "base",
  "info",
  "success",
  "warning",
  "error",
] as const;

export type ColorVariant = typeof COLOR_VARIANTS[number];