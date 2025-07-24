import { useState } from "preact/hooks";
import { X, Check, Palette } from "lucide-preact";
import { globalTheme } from "@suppers/ui-lib";

const THEMES = [
  // Light themes
  { name: "light", label: "Light", category: "Light" },
  { name: "cupcake", label: "Cupcake", category: "Light" },
  { name: "bumblebee", label: "Bumblebee", category: "Light" },
  { name: "emerald", label: "Emerald", category: "Light" },
  { name: "corporate", label: "Corporate", category: "Light" },
  { name: "retro", label: "Retro", category: "Light" },
  { name: "cyberpunk", label: "Cyberpunk", category: "Light" },
  { name: "valentine", label: "Valentine", category: "Light" },
  { name: "garden", label: "Garden", category: "Light" },
  { name: "lofi", label: "Lofi", category: "Light" },
  { name: "pastel", label: "Pastel", category: "Light" },
  { name: "fantasy", label: "Fantasy", category: "Light" },
  { name: "wireframe", label: "Wireframe", category: "Light" },
  { name: "cmyk", label: "CMYK", category: "Light" },
  { name: "autumn", label: "Autumn", category: "Light" },
  { name: "acid", label: "Acid", category: "Light" },
  { name: "lemonade", label: "Lemonade", category: "Light" },
  { name: "winter", label: "Winter", category: "Light" },
  
  // Dark themes
  { name: "dark", label: "Dark", category: "Dark" },
  { name: "synthwave", label: "Synthwave", category: "Dark" },
  { name: "halloween", label: "Halloween", category: "Dark" },
  { name: "forest", label: "Forest", category: "Dark" },
  { name: "aqua", label: "Aqua", category: "Dark" },
  { name: "black", label: "Black", category: "Dark" },
  { name: "luxury", label: "Luxury", category: "Dark" },
  { name: "dracula", label: "Dracula", category: "Dark" },
  { name: "business", label: "Business", category: "Dark" },
  { name: "night", label: "Night", category: "Dark" },
  { name: "coffee", label: "Coffee", category: "Dark" },
  { name: "dim", label: "Dim", category: "Dark" },
  { name: "nord", label: "Nord", category: "Dark" },
  { name: "sunset", label: "Sunset", category: "Dark" },
];

export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const currentTheme = globalTheme.value;

  const handleThemeChange = (themeName: string) => {
    // Update theme
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    globalTheme.value = themeName;
    onClose();
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const lightThemes = THEMES.filter(theme => theme.category === "Light");
  const darkThemes = THEMES.filter(theme => theme.category === "Dark");

  return (
    <div 
      class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div class="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div class="flex items-center justify-between p-6 border-b border-base-300">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Palette size={20} class="text-primary" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-base-content">Choose Theme</h2>
              <p class="text-sm text-base-content/60">Current: {currentTheme}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            class="btn btn-ghost btn-sm btn-circle"
            aria-label="Close theme modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="space-y-8">
            {/* Light Themes */}
            <div>
              <h3 class="text-sm font-semibold text-base-content/70 mb-4 uppercase tracking-wider">Light Themes</h3>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {lightThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme.name)}
                    class={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      currentTheme === theme.name
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-base-300 hover:border-base-400"
                    }`}
                  >
                    <div class="text-center space-y-2">
                      <div 
                        class="w-8 h-8 mx-auto rounded-lg border border-base-300"
                        data-theme={theme.name}
                        style="background: hsl(var(--p)); border-color: hsl(var(--bc) / 0.2);"
                      />
                      <span class="text-xs font-medium text-base-content block">{theme.label}</span>
                    </div>
                    {currentTheme === theme.name && (
                      <div class="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check size={12} class="text-primary-content" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Themes */}
            <div>
              <h3 class="text-sm font-semibold text-base-content/70 mb-4 uppercase tracking-wider">Dark Themes</h3>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {darkThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme.name)}
                    class={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      currentTheme === theme.name
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-base-300 hover:border-base-400"
                    }`}
                  >
                    <div class="text-center space-y-2">
                      <div 
                        class="w-8 h-8 mx-auto rounded-lg border border-base-300"
                        data-theme={theme.name}
                        style="background: hsl(var(--p)); border-color: hsl(var(--bc) / 0.2);"
                      />
                      <span class="text-xs font-medium text-base-content block">{theme.label}</span>
                    </div>
                    {currentTheme === theme.name && (
                      <div class="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check size={12} class="text-primary-content" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}