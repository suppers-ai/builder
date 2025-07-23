import type { User, CustomTheme } from "@suppers/shared/utils/type-mappers.ts";
import { Loading } from "../../components/feedback/loading/Loading.tsx";
import { Button } from "../../components/action/button/Button.tsx";
import { Badge } from "../../components/display/badge/Badge.tsx";
import { globalTheme, loadSavedTheme, setGlobalTheme } from "../../utils/signals.ts";
import { useEffect } from "preact/hooks";

interface ThemeSelectorProps {
  user: User;
  currentTheme: string;
  currentCustomTheme?: CustomTheme | null;
  customThemes: CustomTheme[];
  isUpdating: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  allowCustomThemes?: boolean;
  onThemeChange: (theme: string, customTheme?: CustomTheme) => void;
  onCreateCustomTheme?: () => void;
}

// DaisyUI predefined themes
const DAISY_THEMES = [
  { value: "light", label: "☀️ Light", description: "Clean and bright" },
  { value: "dark", label: "🌙 Dark", description: "Easy on the eyes" },
  { value: "cupcake", label: "🧁 Cupcake", description: "Sweet and colorful" },
  { value: "bumblebee", label: "🐝 Bumblebee", description: "Bright and energetic" },
  { value: "emerald", label: "💚 Emerald", description: "Rich and natural" },
  { value: "corporate", label: "💼 Corporate", description: "Professional and clean" },
  { value: "synthwave", label: "🎮 Synthwave", description: "Retro neon vibes" },
  { value: "retro", label: "📻 Retro", description: "Classic and nostalgic" },
  { value: "cyberpunk", label: "🤖 Cyberpunk", description: "Futuristic and edgy" },
  { value: "valentine", label: "💕 Valentine", description: "Romantic and warm" },
  { value: "halloween", label: "🎃 Halloween", description: "Spooky and fun" },
  { value: "garden", label: "🌿 Garden", description: "Natural and fresh" },
  { value: "forest", label: "🌲 Forest", description: "Deep and earthy" },
  { value: "aqua", label: "🌊 Aqua", description: "Cool and refreshing" },
  { value: "lofi", label: "🎧 Lo-Fi", description: "Chill and relaxed" },
  { value: "pastel", label: "🎨 Pastel", description: "Soft and gentle" },
  { value: "fantasy", label: "🏰 Fantasy", description: "Magical and dreamy" },
  { value: "wireframe", label: "📐 Wireframe", description: "Minimal and structured" },
  { value: "black", label: "⚫ Black", description: "Bold and dramatic" },
  { value: "luxury", label: "💎 Luxury", description: "Premium and elegant" },
  { value: "dracula", label: "🧛 Dracula", description: "Gothic and mysterious" },
  { value: "cmyk", label: "🖨️ CMYK", description: "Print-inspired colors" },
  { value: "autumn", label: "🍂 Autumn", description: "Warm and cozy" },
  { value: "business", label: "📊 Business", description: "Professional and modern" },
  { value: "acid", label: "🧪 Acid", description: "Bright and electric" },
  { value: "lemonade", label: "🍋 Lemonade", description: "Fresh and zesty" },
  { value: "night", label: "🌌 Night", description: "Deep and mysterious" },
  { value: "coffee", label: "☕ Coffee", description: "Rich and warm" },
  { value: "winter", label: "❄️ Winter", description: "Cool and crisp" },
];

export function ThemeSelector({
  user,
  currentTheme,
  currentCustomTheme,
  customThemes,
  isUpdating,
  className = "",
  size = "sm",
  allowCustomThemes = true,
  onThemeChange,
  onCreateCustomTheme,
}: ThemeSelectorProps) {
  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);
  const getCurrentThemeData = () => {
    if (currentCustomTheme) {
      return {
        label: currentCustomTheme.label,
        description: currentCustomTheme.description,
        isCustom: true,
      };
    }

    const daisyTheme = DAISY_THEMES.find((t) => t.value === currentTheme);
    return {
      label: daisyTheme?.label || "🎨 Custom",
      description: daisyTheme?.description || "Custom theme",
      isCustom: false,
    };
  };

  const currentThemeData = getCurrentThemeData();

  return (
    <>
      <div class={`dropdown dropdown-end ${className}`}>
        <Button as="div" tabIndex={0} role="button" variant="ghost" size={size} class="gap-2">
          {currentThemeData.label}
          <svg class="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </Button>

        <ul
          tabindex={0}
          class="dropdown-content menu bg-base-100 rounded-box z-[1] w-80 p-2 shadow-lg border border-base-300"
        >
          {/* Header */}
          <li class="menu-title">
            <div class="flex items-center justify-between w-full">
              <span>Choose Theme</span>
              {allowCustomThemes && onCreateCustomTheme && (
                <Button
                  color="primary"
                  size="xs"
                  onClick={onCreateCustomTheme}
                >
                  + Custom
                </Button>
              )}
            </div>
          </li>

          <div class="max-h-96 overflow-y-auto">
            {/* DaisyUI Themes */}
            <li class="menu-title mt-2">
              <span class="text-xs">Built-in Themes</span>
            </li>
            {DAISY_THEMES.map((theme) => (
              <li key={theme.value}>
                <button
                  class={`flex items-center justify-between p-3 ${
                    currentTheme === theme.value && !currentCustomTheme ? "active" : ""
                  }`}
                  onClick={() => {
                    setGlobalTheme(theme.value);
                    onThemeChange(theme.value);
                  }}
                  disabled={isUpdating}
                >
                  <div class="flex flex-col items-start">
                    <span class="font-medium">{theme.label}</span>
                    <span class="text-xs opacity-70">{theme.description}</span>
                  </div>
                  {currentTheme === theme.value && !currentCustomTheme && (
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}

            {/* Custom Themes */}
            {allowCustomThemes && customThemes.length > 0 && (
              <>
                <li class="menu-title mt-2">
                  <span class="text-xs">Custom Themes</span>
                </li>
                {customThemes.map((theme) => (
                  <li key={theme.id}>
                    <button
                      class={`flex items-center justify-between p-3 ${
                        currentCustomTheme?.id === theme.id ? "active" : ""
                      }`}
                      onClick={() => {
                        setGlobalTheme(theme.name);
                        onThemeChange(theme.name, theme);
                      }}
                      disabled={isUpdating}
                    >
                      <div class="flex flex-col items-start">
                        <span class="font-medium">{theme.label}</span>
                        <span class="text-xs opacity-70">{theme.description}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        {theme.createdBy === user.id && (
                          <Badge variant="outline" size="xs">Mine</Badge>
                        )}
                        {currentCustomTheme?.id === theme.id && (
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </>
            )}
          </div>
        </ul>
      </div>

      {/* Loading overlay */}
      {isUpdating && (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-base-100 p-6 rounded-box shadow-xl">
            <div class="flex items-center gap-3">
              <Loading size="sm" variant="spinner" />
              <span>Updating theme...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ThemeSelector;
