/**
 * UI Constants
 * Common UI-related constants used across packages
 */

// Theme constants
const THEMES = [
  {
    name: "light",
    label: "Light",
    category: "Light",
    colors: ["#570df8", "#f000b8", "#37cdbe", "#3abff8"],
  },
  {
    name: "cupcake",
    label: "Cupcake",
    category: "Light",
    colors: ["#65c3c8", "#ef9fbc", "#eeaf3a", "#f7f3e9"],
  },
  {
    name: "bumblebee",
    label: "Bumblebee",
    category: "Light",
    colors: ["#e0a82e", "#f9d72f", "#181830", "#f9f7fd"],
  },
  {
    name: "emerald",
    label: "Emerald",
    category: "Light",
    colors: ["#66cc8a", "#377cfb", "#ea5234", "#f3f4f6"],
  },
  {
    name: "corporate",
    label: "Corporate",
    category: "Light",
    colors: ["#4b6bfb", "#7b92b2", "#67cba0", "#ffffff"],
  },
  {
    name: "retro",
    label: "Retro",
    category: "Light",
    colors: ["#ef9995", "#a4cbb4", "#dc8850", "#faf7f2"],
  },
  {
    name: "cyberpunk",
    label: "Cyberpunk",
    category: "Light",
    colors: ["#ff7598", "#75d1f0", "#c07eec", "#ffffff"],
  },
  {
    name: "valentine",
    label: "Valentine",
    category: "Light",
    colors: ["#e96d7b", "#a991f7", "#88dbdd", "#f8ddd4"],
  },
  {
    name: "garden",
    label: "Garden",
    category: "Light",
    colors: ["#5c7f67", "#ecf4e7", "#90a17d", "#f9f7fd"],
  },
  {
    name: "lofi",
    label: "Lofi",
    category: "Light",
    colors: ["#0d0d0d", "#1a1a1a", "#262626", "#fafafa"],
  },
  {
    name: "pastel",
    label: "Pastel",
    category: "Light",
    colors: ["#d1c1d7", "#f6cbd1", "#b4e9d6", "#70acc7"],
  },
  {
    name: "fantasy",
    label: "Fantasy",
    category: "Light",
    colors: ["#6e0b75", "#007ebd", "#f28c18", "#f7f8fd"],
  },
  {
    name: "wireframe",
    label: "Wireframe",
    category: "Light",
    colors: ["#b8b8b8", "#b8b8b8", "#b8b8b8", "#ffffff"],
  },
  {
    name: "cmyk",
    label: "CMYK",
    category: "Light",
    colors: ["#45aeee", "#e8488a", "#ffc23c", "#ffffff"],
  },
  {
    name: "autumn",
    label: "Autumn",
    category: "Light",
    colors: ["#8c0327", "#d85251", "#f3cc30", "#f7f7f2"],
  },
  {
    name: "acid",
    label: "Acid",
    category: "Light",
    colors: ["#ff00f4", "#ff7400", "#ffff00", "#ffffff"],
  },
  {
    name: "lemonade",
    label: "Lemonade",
    category: "Light",
    colors: ["#519903", "#e9e92f", "#af4ab1", "#ffffff"],
  },
  {
    name: "winter",
    label: "Winter",
    category: "Light",
    colors: ["#047aed", "#463aa2", "#c148ac", "#ffffff"],
  },

  // Dark themes
  {
    name: "dark",
    label: "Dark",
    category: "Dark",
    colors: ["#661ae6", "#d926aa", "#1fb2a5", "#191d24"],
  },
  {
    name: "synthwave",
    label: "Synthwave",
    category: "Dark",
    colors: ["#e779c1", "#58c7f3", "#f806cc", "#2d1b69"],
  },
  {
    name: "halloween",
    label: "Halloween",
    category: "Dark",
    colors: ["#f28c18", "#6d3a9c", "#51a800", "#1f2937"],
  },
  {
    name: "forest",
    label: "Forest",
    category: "Dark",
    colors: ["#1eb854", "#1fd65f", "#c148ac", "#171212"],
  },
  {
    name: "aqua",
    label: "Aqua",
    category: "Dark",
    colors: ["#09ecf3", "#966fb3", "#fbbf24", "#345da7"],
  },
  {
    name: "black",
    label: "Black",
    category: "Dark",
    colors: ["#373737", "#373737", "#373737", "#000000"],
  },
  {
    name: "luxury",
    label: "Luxury",
    category: "Dark",
    colors: ["#ffffff", "#be185d", "#a3a3a3", "#09090b"],
  },
  {
    name: "dracula",
    label: "Dracula",
    category: "Dark",
    colors: ["#ff79c6", "#bd93f9", "#50fa7b", "#282a36"],
  },
  {
    name: "business",
    label: "Business",
    category: "Dark",
    colors: ["#1c4ed8", "#7c3aed", "#059669", "#1e293b"],
  },
  {
    name: "night",
    label: "Night",
    category: "Dark",
    colors: ["#38bdf8", "#818cf8", "#f471b5", "#0f172a"],
  },
  {
    name: "coffee",
    label: "Coffee",
    category: "Dark",
    colors: ["#db924b", "#263e3f", "#10576d", "#20161f"],
  },
  {
    name: "dim",
    label: "Dim",
    category: "Dark",
    colors: ["#9ca3af", "#9ca3af", "#9ca3af", "#2a323c"],
  },
  {
    name: "nord",
    label: "Nord",
    category: "Dark",
    colors: ["#5e81ac", "#bf616a", "#a3be8c", "#2e3440"],
  },
  {
    name: "sunset",
    label: "Sunset",
    category: "Dark",
    colors: ["#ff8a4c", "#ff5722", "#af4261", "#1a103d"],
  },
  {
    name: "caramellatte",
    label: "Caramel Latte",
    category: "Light",
    colors: ["#a0522d", "#deb887", "#d2691e", "#faf0e6"],
  },
  {
    name: "abyss",
    label: "Abyss",
    category: "Dark",
    colors: ["#008080", "#20b2aa", "#40e0d0", "#0f2027"],
  },
  {
    name: "silk",
    label: "Silk",
    category: "Light",
    colors: ["#ff6b9d", "#4ecdc4", "#45b7d1", "#f8f9fa"],
  },
];

export const DEFAULT_THEME: string = "light";

export const THEME_NAMES: string[] = THEMES.map((theme) => theme.name);

// Export the themes object
export { THEMES };
