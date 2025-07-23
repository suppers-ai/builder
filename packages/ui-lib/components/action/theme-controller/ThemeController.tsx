import { BaseComponentProps, SizeProps } from "../../types.ts";
import { useEffect, useState } from "preact/hooks";
import { globalTheme, loadSavedTheme, setGlobalTheme } from "../../../utils/signals.ts";

// Theme controller interfaces
export interface ThemeControllerProps extends BaseComponentProps, SizeProps {
  currentTheme?: string;
  themes?: string[];
  variant?: "dropdown" | "toggle" | "radio";
  showLabel?: boolean;
  showPreview?: boolean;
  enableTransitions?: boolean;
  // Controlled mode props
  onThemeChange?: (theme: string) => void;
  // Global state features
  useGlobalState?: boolean;
  autoLoadSavedTheme?: boolean;
  autoSaveTheme?: boolean;
  showControls?: boolean;
  allowManualThemeEntry?: boolean;
}

export function ThemeController({
  class: className = "",
  currentTheme = "light",
  themes = ["light", "dark"],
  size = "md",
  showLabel = true,
  showPreview = false,
  enableTransitions = true,
  variant = "dropdown",
  onThemeChange,
  useGlobalState = false,
  autoLoadSavedTheme = false,
  autoSaveTheme = false,
  showControls = false,
  allowManualThemeEntry = false,
  id,
  ...props
}: ThemeControllerProps) {
  const [manualTheme, setManualTheme] = useState("");
  const [internalTheme, setInternalTheme] = useState(currentTheme);

  // Load saved theme on mount
  useEffect(() => {
    if (autoLoadSavedTheme && useGlobalState) {
      loadSavedTheme();
    }
  }, [autoLoadSavedTheme, useGlobalState]);

  // Use global state if enabled, otherwise use internal/props
  const activeTheme = useGlobalState ? globalTheme.value : internalTheme;

  // Handle theme changes
  const handleThemeChange = (newTheme: string) => {
    if (useGlobalState) {
      setGlobalTheme(newTheme);
    } else {
      setInternalTheme(newTheme);
    }
    onThemeChange?.(newTheme);
  };

  // Controls component
  const renderControls = () => {
    if (!showControls) return null;

    return (
      <div class="bg-base-200 p-4 border border-base-300 rounded-lg mb-4">
        <h3 class="text-lg font-bold mb-4">Theme Controller Settings</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Use Global State</span>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                checked={useGlobalState}
                disabled
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Auto Save Theme</span>
              <input
                type="checkbox"
                class="toggle toggle-secondary"
                checked={autoSaveTheme}
                disabled
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Show Preview</span>
              <input
                type="checkbox"
                class="toggle toggle-accent"
                checked={showPreview}
                disabled
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Enable Transitions</span>
              <input
                type="checkbox"
                class="toggle toggle-info"
                checked={enableTransitions}
                disabled
              />
            </label>
          </div>
        </div>

        {allowManualThemeEntry && (
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">Manual Theme Entry</span>
            </label>
            <div class="input-group">
              <input
                type="text"
                class="input input-bordered flex-1"
                placeholder="Enter theme name..."
                value={manualTheme}
                onChange={(e) => setManualTheme((e.target as HTMLInputElement).value)}
              />
              <button
                class="btn btn-primary"
                onClick={() => {
                  if (manualTheme.trim()) {
                    handleThemeChange(manualTheme.trim());
                    setManualTheme("");
                  }
                }}
                disabled={!manualTheme.trim()}
              >
                Apply
              </button>
            </div>
          </div>
        )}

        <div class="stats stats-horizontal shadow mt-4">
          <div class="stat">
            <div class="stat-title">Current Theme</div>
            <div class="stat-value text-sm">{activeTheme}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Available Themes</div>
            <div class="stat-value text-sm">{themes.length}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Variant</div>
            <div class="stat-value text-sm">{variant}</div>
          </div>
        </div>
      </div>
    );
  };

  const themeOptions = [
    {
      value: "light",
      emoji: "☀️",
      label: "Light",
      description: "Clean and bright",
      colors: {
        primary: "#570df8",
        secondary: "#f000b8",
        accent: "#37cdbe",
        background: "#ffffff",
      },
    },
    {
      value: "dark",
      emoji: "🌙",
      label: "Dark",
      description: "Easy on the eyes",
      colors: {
        primary: "#661ae6",
        secondary: "#d926aa",
        accent: "#1fb2a5",
        background: "#1d232a",
      },
    },
    {
      value: "cupcake",
      emoji: "🧁",
      label: "Cupcake",
      description: "Sweet and colorful",
      colors: {
        primary: "#65c3c8",
        secondary: "#ef9fbc",
        accent: "#eeaf3a",
        background: "#faf7f5",
      },
    },
    {
      value: "bumblebee",
      emoji: "🐝",
      label: "Bumblebee",
      description: "Bright and energetic",
      colors: {
        primary: "#e0a82e",
        secondary: "#f9d72f",
        accent: "#181830",
        background: "#ffffff",
      },
    },
    {
      value: "emerald",
      emoji: "💚",
      label: "Emerald",
      description: "Rich and natural",
      colors: {
        primary: "#66cc8a",
        secondary: "#377cfb",
        accent: "#ea5234",
        background: "#ffffff",
      },
    },
    {
      value: "corporate",
      emoji: "💼",
      label: "Corporate",
      description: "Professional and clean",
      colors: {
        primary: "#4b6bfb",
        secondary: "#7b92b2",
        accent: "#67cba0",
        background: "#ffffff",
      },
    },
    {
      value: "synthwave",
      emoji: "🎮",
      label: "Synthwave",
      description: "Retro neon vibes",
      colors: {
        primary: "#e779c1",
        secondary: "#58c7f3",
        accent: "#f3cc30",
        background: "#1a103d",
      },
    },
    {
      value: "retro",
      emoji: "📻",
      label: "Retro",
      description: "Classic and nostalgic",
      colors: {
        primary: "#ef9995",
        secondary: "#a4cbb4",
        accent: "#dc8850",
        background: "#ede6d3",
      },
    },
    {
      value: "cyberpunk",
      emoji: "🤖",
      label: "Cyberpunk",
      description: "Futuristic and edgy",
      colors: {
        primary: "#ff7598",
        secondary: "#75d1f0",
        accent: "#c7f59b",
        background: "#0e0e23",
      },
    },
    {
      value: "valentine",
      emoji: "💕",
      label: "Valentine",
      description: "Romantic and warm",
      colors: {
        primary: "#e96d7b",
        secondary: "#a991f7",
        accent: "#88dbdd",
        background: "#f8ddd4",
      },
    },
    {
      value: "halloween",
      emoji: "🎃",
      label: "Halloween",
      description: "Spooky and fun",
      colors: {
        primary: "#f28c18",
        secondary: "#6d3a9c",
        accent: "#51a800",
        background: "#1f2937",
      },
    },
    {
      value: "garden",
      emoji: "🌿",
      label: "Garden",
      description: "Natural and fresh",
      colors: {
        primary: "#5c7f67",
        secondary: "#ecf4e7",
        accent: "#fae5e5",
        background: "#ffffff",
      },
    },
    {
      value: "forest",
      emoji: "🌲",
      label: "Forest",
      description: "Deep and earthy",
      colors: {
        primary: "#1eb854",
        secondary: "#1db584",
        accent: "#1db5a6",
        background: "#171212",
      },
    },
    {
      value: "aqua",
      emoji: "🌊",
      label: "Aqua",
      description: "Cool and refreshing",
      colors: {
        primary: "#09ecf3",
        secondary: "#966fb3",
        accent: "#ffe999",
        background: "#345ca8",
      },
    },
    {
      value: "lofi",
      emoji: "🎧",
      label: "Lo-Fi",
      description: "Chill and relaxed",
      colors: {
        primary: "#0d0d0d",
        secondary: "#1a1a1a",
        accent: "#262626",
        background: "#0f0f0f",
      },
    },
    {
      value: "pastel",
      emoji: "🎨",
      label: "Pastel",
      description: "Soft and gentle",
      colors: {
        primary: "#d1c1d7",
        secondary: "#f6cbd1",
        accent: "#b4e9d1",
        background: "#ffffff",
      },
    },
    {
      value: "fantasy",
      emoji: "🏰",
      label: "Fantasy",
      description: "Magical and dreamy",
      colors: {
        primary: "#6e0b75",
        secondary: "#007ebd",
        accent: "#f471b5",
        background: "#ffffff",
      },
    },
    {
      value: "wireframe",
      emoji: "📐",
      label: "Wireframe",
      description: "Minimal and structured",
      colors: {
        primary: "#b8b8b8",
        secondary: "#b8b8b8",
        accent: "#b8b8b8",
        background: "#ffffff",
      },
    },
    {
      value: "black",
      emoji: "⚫",
      label: "Black",
      description: "Bold and dramatic",
      colors: {
        primary: "#373737",
        secondary: "#373737",
        accent: "#373737",
        background: "#000000",
      },
    },
    {
      value: "luxury",
      emoji: "💎",
      label: "Luxury",
      description: "Premium and elegant",
      colors: {
        primary: "#ffffff",
        secondary: "#152747",
        accent: "#513448",
        background: "#09090b",
      },
    },
    {
      value: "dracula",
      emoji: "🧛",
      label: "Dracula",
      description: "Gothic and mysterious",
      colors: {
        primary: "#ff79c6",
        secondary: "#bd93f9",
        accent: "#ffb86c",
        background: "#282a36",
      },
    },
    {
      value: "cmyk",
      emoji: "🖨️",
      label: "CMYK",
      description: "Print-inspired colors",
      colors: {
        primary: "#45aeee",
        secondary: "#e8488a",
        accent: "#fff232",
        background: "#ffffff",
      },
    },
    {
      value: "autumn",
      emoji: "🍂",
      label: "Autumn",
      description: "Warm and cozy",
      colors: {
        primary: "#8c0327",
        secondary: "#d85251",
        accent: "#f2cc8f",
        background: "#f3f4f6",
      },
    },
    {
      value: "business",
      emoji: "🏢",
      label: "Business",
      description: "Professional and modern",
      colors: {
        primary: "#1c4ed8",
        secondary: "#7c3aed",
        accent: "#f59e0b",
        background: "#ffffff",
      },
    },
    {
      value: "acid",
      emoji: "💚",
      label: "Acid",
      description: "Vibrant and bold",
      colors: {
        primary: "#ff00ff",
        secondary: "#ffff00",
        accent: "#00ffff",
        background: "#000000",
      },
    },
    {
      value: "lemonade",
      emoji: "🍋",
      label: "Lemonade",
      description: "Fresh and zesty",
      colors: {
        primary: "#519903",
        secondary: "#e9e92f",
        accent: "#bf95f9",
        background: "#ffffff",
      },
    },
    {
      value: "night",
      emoji: "🌃",
      label: "Night",
      description: "Dark and mysterious",
      colors: {
        primary: "#38bdf8",
        secondary: "#818cf8",
        accent: "#f471b5",
        background: "#0f1419",
      },
    },
    {
      value: "coffee",
      emoji: "☕",
      label: "Coffee",
      description: "Rich and warm",
      colors: {
        primary: "#db924b",
        secondary: "#263e3f",
        accent: "#10576d",
        background: "#1f2937",
      },
    },
    {
      value: "winter",
      emoji: "❄️",
      label: "Winter",
      description: "Cool and crisp",
      colors: {
        primary: "#047aed",
        secondary: "#463aa2",
        accent: "#c148ac",
        background: "#ffffff",
      },
    },
  ];

  const availableThemes = themeOptions.filter((theme) => themes.includes(theme.value));
  const currentThemeData = themeOptions.find((theme) => theme.value === currentTheme);

  const sizeClasses = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
    xl: "btn-xl",
  };

  const handleThemeSelection = (newTheme: string) => {
    if (newTheme === activeTheme) return;
    handleThemeChange(newTheme);
  };

  if (variant === "toggle") {
    return (
      <div class={`form-control ${className}`} id={id} {...props}>
        {renderControls()}
        {showLabel && (
          <label class="label cursor-pointer">
            <span class="label-text">Dark mode</span>
            <input
              type="checkbox"
              class={`toggle toggle-primary ${sizeClasses[size]}`}
              checked={activeTheme === "dark"}
              onChange={() => handleThemeSelection(activeTheme === "dark" ? "light" : "dark")}
              data-theme={activeTheme}
            />
          </label>
        )}
        {!showLabel && (
          <input
            type="checkbox"
            class={`toggle toggle-primary ${sizeClasses[size]}`}
            checked={activeTheme === "dark"}
            onChange={() => handleThemeSelection(activeTheme === "dark" ? "light" : "dark")}
            data-theme={activeTheme}
          />
        )}
      </div>
    );
  }

  if (variant === "radio") {
    return (
      <div class={`form-control ${className}`} id={id} {...props}>
        {renderControls()}
        {showLabel && (
          <label class="label">
            <span class="label-text">Choose Theme</span>
          </label>
        )}
        <div class="flex flex-wrap gap-2">
          {availableThemes.map((theme) => (
            <label key={theme.value} class="label cursor-pointer">
              <input
                type="radio"
                name="theme-radio"
                class="radio radio-primary"
                value={theme.value}
                checked={activeTheme === theme.value}
                onChange={() => handleThemeSelection(theme.value)}
                data-theme={theme.value}
              />
              <span class="label-text ml-2">{theme.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Default dropdown variant - daisyUI native style
  return (
    <div class="space-y-4">
      {renderControls()}
      <div class={`dropdown dropdown-end ${className}`} id={id} {...props}>
        <div
          tabIndex={0}
          role="button"
          class={`btn ${sizeClasses[size]} btn-ghost gap-3`}
          aria-label="Theme"
        >
          <span class="hidden md:inline">Theme</span>
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
        <div class="dropdown-content bg-base-200 text-base-content rounded-t-box rounded-b-box top-px max-h-96 h-[70vh] w-64 overflow-y-auto shadow-2xl mt-16">
          <div class="grid grid-cols-1 gap-2 p-2" tabIndex={0}>
            {availableThemes.map((theme) => {
              const isActive = theme.value === activeTheme;

              return (
                <div
                  key={theme.value}
                  class={`outline-base-content overflow-hidden rounded-lg outline-2 outline-offset-2 ${
                    isActive ? "outline" : ""
                  }`}
                  tabIndex={0}
                  data-set-theme={theme.value}
                  data-act-class="outline"
                >
                  <div
                    data-theme={theme.value}
                    class="bg-base-100 text-base-content w-full cursor-pointer font-sans hover:outline hover:outline-base-content hover:outline-2"
                    onClick={() => handleThemeSelection(theme.value)}
                  >
                    <div class="flex items-center justify-between py-2 px-3 min-w-0">
                      <div class="flex items-center gap-2 min-w-0 flex-1">
                        <div class="text-sm font-bold truncate">
                          {theme.emoji}
                        </div>
                        <div class="text-sm font-bold truncate">
                          {theme.label}
                        </div>
                      </div>
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <div class="flex gap-1">
                          <div class="bg-primary w-2 h-2 rounded"></div>
                          <div class="bg-secondary w-2 h-2 rounded"></div>
                          <div class="bg-accent w-2 h-2 rounded"></div>
                          <div class="bg-neutral w-2 h-2 rounded"></div>
                        </div>
                        {isActive && <div class="text-primary font-bold text-xs">✓</div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
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
      useGlobalState={true}
      autoLoadSavedTheme={true}
      autoSaveTheme={true}
    />
  );
}
