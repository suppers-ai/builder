import { BaseComponentProps, SizeProps } from "../../types.ts";
import { useEffect, useState } from "preact/hooks";
import { globalTheme, loadSavedTheme, setGlobalTheme } from "../../../utils/signals.ts";
import { Check, Palette, X } from "lucide-preact";

// Theme controller interfaces
export interface ThemeControllerProps extends BaseComponentProps {
  currentTheme?: string;
  themes?: string[];
  showLabel?: boolean;
  showButton?: boolean;
  onThemeChange?: (theme: string) => void;
  onClose?: () => void;
  useGlobalState?: boolean;
  autoLoadSavedTheme?: boolean;
  autoSaveTheme?: boolean;
}


const THEMES = [
  // Light themes
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

// Shared theme modal content component
interface ThemeModalContentProps {
  activeTheme: string;
  lightThemes: typeof THEMES;
  darkThemes: typeof THEMES;
  onThemeChange: (theme: string) => void;
  onClose?: () => void;
  isStatic?: boolean;
}

function ThemeModalContent({ 
  activeTheme, 
  lightThemes, 
  darkThemes, 
  onThemeChange, 
  onClose,
  isStatic = false 
}: ThemeModalContentProps) {
  return (
    <div class="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-base-300">
      {/* Modal Header */}
      <div class="flex items-center justify-between p-6 border-b border-base-300">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Palette size={20} class="text-primary" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-base-content">Choose Theme</h2>
            <p class="text-sm text-base-content/60">Current: {activeTheme}</p>
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
          {lightThemes.length > 0 && (
            <div>
              <h3 class="text-sm font-semibold text-base-content/70 mb-4 uppercase tracking-wider">
                Light Themes
              </h3>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {lightThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={isStatic ? undefined : () => onThemeChange(theme.name)}
                    class={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                      isStatic ? '' : 'hover:scale-105'
                    } ${
                      activeTheme === theme.name
                        ? "border-primary bg-primary/5 shadow-md"
                        : `border-base-300 ${isStatic ? '' : 'hover:border-base-400'}`
                    }`}
                  >
                    <div class="text-center space-y-2">
                      <div 
                        class="w-12 h-8 mx-auto overflow-hidden border border-base-300/50 shadow-sm"
                        data-theme={theme.name}
                        style={{ 
                          borderRadius: 'var(--rounded-btn, 0.5rem)',
                          backgroundColor: 'var(--b1, #ffffff)'
                        }}
                      >
                        <div class="flex h-full">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              class="flex-1"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <span class="text-xs font-medium text-base-content block">{theme.label}</span>
                    </div>
                    {activeTheme === theme.name && (
                      <div class="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check size={12} class="text-primary-content" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dark Themes */}
          {darkThemes.length > 0 && (
            <div>
              <h3 class="text-sm font-semibold text-base-content/70 mb-4 uppercase tracking-wider">
                Dark Themes
              </h3>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {darkThemes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={isStatic ? undefined : () => onThemeChange(theme.name)}
                    class={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                      isStatic ? '' : 'hover:scale-105'
                    } ${
                      activeTheme === theme.name
                        ? "border-primary bg-primary/5 shadow-md"
                        : `border-base-300 ${isStatic ? '' : 'hover:border-base-400'}`
                    }`}
                  >
                    <div class="text-center space-y-2">
                      <div 
                        class="w-12 h-8 mx-auto overflow-hidden border border-base-300/50 shadow-sm"
                        data-theme={theme.name}
                        style={{ 
                          borderRadius: 'var(--rounded-btn, 0.5rem)',
                          backgroundColor: 'var(--b1, #ffffff)'
                        }}
                      >
                        <div class="flex h-full">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              class="flex-1"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <span class="text-xs font-medium text-base-content block">{theme.label}</span>
                    </div>
                    {activeTheme === theme.name && (
                      <div class="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check size={12} class="text-primary-content" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ThemeController({
  class: className = "",
  currentTheme = "light",
  themes,
  showLabel = true,
  showButton = true,
  onThemeChange,
  onClose,
  useGlobalState = false,
  autoLoadSavedTheme = false,
  autoSaveTheme = false,
  id,
  ...props
}: ThemeControllerProps) {
  const [internalTheme, setInternalTheme] = useState(currentTheme);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    if (autoLoadSavedTheme && useGlobalState) {
      loadSavedTheme();
    }
  }, [autoLoadSavedTheme, useGlobalState]);

  // Use global state if enabled, otherwise use internal/props
  const activeTheme = useGlobalState ? globalTheme.value : internalTheme;

  // Filter themes based on provided themes prop, or use all themes
  const availableThemes = themes ? THEMES.filter(theme => themes.includes(theme.name)) : THEMES;
  const lightThemes = availableThemes.filter(theme => theme.category === "Light");
  const darkThemes = availableThemes.filter(theme => theme.category === "Dark");

  // Handle theme changes
  const handleThemeChange = (newTheme: string) => {
    if (useGlobalState) {
      setGlobalTheme(newTheme);
    } else {
      setInternalTheme(newTheme);
    }
    onThemeChange?.(newTheme);
    setIsModalOpen(false);
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  // If showButton is false, show just the modal content as static preview
  if (!showButton) {
    return (
      <div class="relative max-w-2xl mx-auto">
        <ThemeModalContent
          activeTheme={activeTheme}
          lightThemes={lightThemes}
          darkThemes={darkThemes}
          onThemeChange={handleThemeChange}
          onClose={onClose}
          isStatic={false}
        />
      </div>
    );
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsModalOpen(true)}
        class={`btn btn-ghost gap-3 ${className}`}
        aria-label="Choose theme"
        id={id}
        {...props}
      >
        <Palette size={20} />
        {showLabel && <span class="hidden md:inline">Theme</span>}
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          <ThemeModalContent
            activeTheme={activeTheme}
            lightThemes={lightThemes}
            darkThemes={darkThemes}
            onThemeChange={handleThemeChange}
            onClose={() => setIsModalOpen(false)}
            isStatic={false}
          />
        </div>
      )}
    </>
  );
}

// Enhanced version with global state management
export function GlobalThemeController(
  props: Omit<ThemeControllerProps, "currentTheme" | "useGlobalState">,
) {
  return (
    <ThemeController
      {...props}
      currentTheme={globalTheme.value}
      useGlobalState
      autoLoadSavedTheme
      autoSaveTheme
    />
  );
}
