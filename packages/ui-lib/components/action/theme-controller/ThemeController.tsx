import { BaseComponentProps } from "../../types.ts";
import { useState } from "preact/hooks";
import { globalTheme } from "../../../utils/signals.ts";
import { Check, Palette, X } from "lucide-preact";
import { THEMES } from "@suppers/shared/constants";
import { getCurrentTheme, User } from "@suppers/shared";

// Theme controller interfaces
export interface ThemeControllerProps extends BaseComponentProps {
  currentTheme?: string;
  themes?: string[];
  showLabel?: boolean;
  showButton?: boolean;
  onThemeChange?: (theme: string) => void;
  onClose?: () => void;
  user?: User;
}

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
  isStatic = false,
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
                      isStatic ? "" : "hover:scale-105"
                    } ${
                      activeTheme === theme.name
                        ? "border-primary bg-primary/5 shadow-md"
                        : `border-base-300 ${isStatic ? "" : "hover:border-base-400"}`
                    }`}
                  >
                    <div class="text-center space-y-2">
                      <div
                        class="w-12 h-8 mx-auto overflow-hidden border border-base-300/50 shadow-sm"
                        data-theme={theme.name}
                        style={{
                          borderRadius: "var(--rounded-btn, 0.5rem)",
                          backgroundColor: "var(--b1, #ffffff)",
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
                      isStatic ? "" : "hover:scale-105"
                    } ${
                      activeTheme === theme.name
                        ? "border-primary bg-primary/5 shadow-md"
                        : `border-base-300 ${isStatic ? "" : "hover:border-base-400"}`
                    }`}
                  >
                    <div class="text-center space-y-2">
                      <div
                        class="w-12 h-8 mx-auto overflow-hidden border border-base-300/50 shadow-sm"
                        data-theme={theme.name}
                        style={{
                          borderRadius: "var(--rounded-btn, 0.5rem)",
                          backgroundColor: "var(--b1, #ffffff)",
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
  themes,
  showLabel = true,
  showButton = true,
  onThemeChange,
  onClose,
  id,
  user,
  ...props
}: ThemeControllerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use global state if enabled, otherwise use internal/props
  const activeTheme = getCurrentTheme(user);

  // Filter themes based on provided themes prop, or use all themes
  const availableThemes = themes ? THEMES.filter((theme) => themes.includes(theme.name)) : THEMES;
  const lightThemes = availableThemes.filter((theme) => theme.category === "Light");
  const darkThemes = availableThemes.filter((theme) => theme.category === "Dark");

  // Handle theme changes
  const handleThemeChange = (newTheme: string) => {
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
    />
  );
}
