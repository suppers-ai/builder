import type { User } from "../lib/api-helpers.ts";
import type { CustomTheme } from "../lib/theme-types.ts";
import { DAISYUI_CSS_VARIABLES, DEFAULT_THEME_VARIABLES } from "../lib/theme-types.ts";
import { Loading } from "../../components/feedback/loading/Loading.tsx";

interface CustomThemeCreatorProps {
  user: User;
  themeName: string;
  themeLabel: string;
  themeDescription: string;
  variables: Record<string, string | number>;
  isPublic: boolean;
  previewMode: boolean;
  isSaving: boolean;
  editingTheme?: CustomTheme;
  onThemeNameChange: (value: string) => void;
  onThemeLabelChange: (value: string) => void;
  onThemeDescriptionChange: (value: string) => void;
  onVariableChange: (variableKey: string, value: string | number) => void;
  onIsPublicChange: (value: boolean) => void;
  onPreviewToggle: () => void;
  onApplyPreset: (preset: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

const THEME_PRESETS = [
  {
    name: "Blue Ocean",
    variables: {
      "color-primary": "#0ea5e9",
      "color-secondary": "#06b6d4",
      "color-accent": "#22d3ee",
      "color-neutral": "#3d4451",
      "color-base-100": "#ffffff",
      "color-base-200": "#f2f2f2",
      "color-base-300": "#e6e6e6",
      "color-info": "#3abff8",
      "color-success": "#36d399",
      "color-warning": "#fbbd23",
      "color-error": "#f87272",
    },
  },
  {
    name: "Green Forest",
    variables: {
      "color-primary": "#059669",
      "color-secondary": "#10b981",
      "color-accent": "#34d399",
      "color-neutral": "#3d4451",
      "color-base-100": "#ffffff",
      "color-base-200": "#f2f2f2",
      "color-base-300": "#e6e6e6",
      "color-info": "#3abff8",
      "color-success": "#36d399",
      "color-warning": "#fbbd23",
      "color-error": "#f87272",
    },
  },
  {
    name: "Purple Magic",
    variables: {
      "color-primary": "#7c3aed",
      "color-secondary": "#a855f7",
      "color-accent": "#c084fc",
      "color-neutral": "#3d4451",
      "color-base-100": "#ffffff",
      "color-base-200": "#f2f2f2",
      "color-base-300": "#e6e6e6",
      "color-info": "#3abff8",
      "color-success": "#36d399",
      "color-warning": "#fbbd23",
      "color-error": "#f87272",
    },
  },
  {
    name: "Orange Sunset",
    variables: {
      "color-primary": "#ea580c",
      "color-secondary": "#f97316",
      "color-accent": "#fb923c",
      "color-neutral": "#3d4451",
      "color-base-100": "#ffffff",
      "color-base-200": "#f2f2f2",
      "color-base-300": "#e6e6e6",
      "color-info": "#3abff8",
      "color-success": "#36d399",
      "color-warning": "#fbbd23",
      "color-error": "#f87272",
    },
  },
  {
    name: "Pink Rose",
    variables: {
      "color-primary": "#ec4899",
      "color-secondary": "#f472b6",
      "color-accent": "#fb7185",
      "color-neutral": "#3d4451",
      "color-base-100": "#ffffff",
      "color-base-200": "#f2f2f2",
      "color-base-300": "#e6e6e6",
      "color-info": "#3abff8",
      "color-success": "#36d399",
      "color-warning": "#fbbd23",
      "color-error": "#f87272",
    },
  },
];

export function CustomThemeCreator({
  user,
  themeName,
  themeLabel,
  themeDescription,
  variables,
  isPublic,
  previewMode,
  isSaving,
  editingTheme,
  onThemeNameChange,
  onThemeLabelChange,
  onThemeDescriptionChange,
  onVariableChange,
  onIsPublicChange,
  onPreviewToggle,
  onApplyPreset,
  onSave,
  onCancel,
}: CustomThemeCreatorProps) {
  // Dynamic variable fields based on DaisyUI structure
  const variableFields = [
    // Color variables
    { key: "color-primary", label: "Primary", description: "Main brand color", type: "color" },
    {
      key: "color-primary-content",
      label: "Primary Content",
      description: "Text on primary background",
      type: "color",
    },
    {
      key: "color-secondary",
      label: "Secondary",
      description: "Secondary brand color",
      type: "color",
    },
    {
      key: "color-secondary-content",
      label: "Secondary Content",
      description: "Text on secondary background",
      type: "color",
    },
    { key: "color-accent", label: "Accent", description: "Accent/highlight color", type: "color" },
    {
      key: "color-accent-content",
      label: "Accent Content",
      description: "Text on accent background",
      type: "color",
    },
    {
      key: "color-neutral",
      label: "Neutral",
      description: "Text and neutral elements",
      type: "color",
    },
    {
      key: "color-neutral-content",
      label: "Neutral Content",
      description: "Text on neutral background",
      type: "color",
    },
    { key: "color-base-100", label: "Base 100", description: "Main background", type: "color" },
    {
      key: "color-base-200",
      label: "Base 200",
      description: "Secondary background",
      type: "color",
    },
    {
      key: "color-base-300",
      label: "Base 300",
      description: "Borders and dividers",
      type: "color",
    },
    {
      key: "color-base-content",
      label: "Base Content",
      description: "Main text color",
      type: "color",
    },
    { key: "color-info", label: "Info", description: "Information messages", type: "color" },
    {
      key: "color-info-content",
      label: "Info Content",
      description: "Text on info background",
      type: "color",
    },
    { key: "color-success", label: "Success", description: "Success messages", type: "color" },
    {
      key: "color-success-content",
      label: "Success Content",
      description: "Text on success background",
      type: "color",
    },
    { key: "color-warning", label: "Warning", description: "Warning messages", type: "color" },
    {
      key: "color-warning-content",
      label: "Warning Content",
      description: "Text on warning background",
      type: "color",
    },
    { key: "color-error", label: "Error", description: "Error messages", type: "color" },
    {
      key: "color-error-content",
      label: "Error Content",
      description: "Text on error background",
      type: "color",
    },
    // Layout variables
    {
      key: "radius-box",
      label: "Box Radius",
      description: "Border radius for cards, modals",
      type: "text",
    },
    {
      key: "radius-field",
      label: "Field Radius",
      description: "Border radius for buttons, inputs",
      type: "text",
    },
    {
      key: "radius-selector",
      label: "Selector Radius",
      description: "Border radius for checkboxes, toggles",
      type: "text",
    },
    { key: "border", label: "Border Width", description: "Default border width", type: "text" },
    {
      key: "depth",
      label: "Depth Effect",
      description: "3D depth effect (0 or 1)",
      type: "number",
    },
    {
      key: "noise",
      label: "Noise Effect",
      description: "Background noise effect (0 or 1)",
      type: "number",
    },
  ];

  return (
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-base-100 rounded-box shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          {/* Header */}
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">
              {editingTheme ? "Edit Custom Theme" : "Create Custom Theme"}
            </h2>
            <div class="flex gap-2">
              <button
                class={`btn btn-sm ${previewMode ? "btn-warning" : "btn-outline"}`}
                onClick={onPreviewToggle}
              >
                {previewMode ? "Stop Preview" : "Preview Theme"}
              </button>
              <button class="btn btn-ghost btn-sm" onClick={onCancel}>✕</button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Theme Info */}
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Theme Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="my-awesome-theme"
                  class="input input-bordered"
                  value={themeName}
                  onChange={(e) => onThemeNameChange((e.target as HTMLInputElement).value)}
                />
                <label class="label">
                  <span class="label-text-alt">Used internally (lowercase, no spaces)</span>
                </label>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Display Label *</span>
                </label>
                <input
                  type="text"
                  placeholder="🎨 My Awesome Theme"
                  class="input input-bordered"
                  value={themeLabel}
                  onChange={(e) => onThemeLabelChange((e.target as HTMLInputElement).value)}
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Description</span>
                </label>
                <textarea
                  placeholder="A beautiful custom theme for..."
                  class="textarea textarea-bordered"
                  value={themeDescription}
                  onChange={(e) =>
                    onThemeDescriptionChange((e.target as HTMLTextAreaElement).value)}
                />
              </div>

              <div class="form-control">
                <label class="cursor-pointer label">
                  <span class="label-text">Make theme public</span>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={isPublic}
                    onChange={(e) => onIsPublicChange((e.target as HTMLInputElement).checked)}
                  />
                </label>
                <label class="label">
                  <span class="label-text-alt">Other users can use your theme</span>
                </label>
              </div>

              {/* Theme Presets */}
              <div>
                <h3 class="font-semibold mb-3">Quick Presets</h3>
                <div class="grid grid-cols-1 gap-2">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      class="btn btn-ghost btn-sm justify-start"
                      onClick={() => onApplyPreset(preset)}
                    >
                      <div class="flex items-center gap-2">
                        <div class="flex gap-1">
                          <div
                            class="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preset.variables["color-primary"] as string }}
                          >
                          </div>
                          <div
                            class="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: preset.variables["color-secondary"] as string,
                            }}
                          >
                          </div>
                          <div
                            class="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preset.variables["color-accent"] as string }}
                          >
                          </div>
                        </div>
                        <span>{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Variable Editor */}
            <div class="space-y-4">
              <h3 class="font-semibold">Theme Variables</h3>
              <div class="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {variableFields.map((field) => (
                  <div key={field.key} class="form-control">
                    <label class="label">
                      <span class="label-text">{field.label}</span>
                      <span class="label-text-alt">{field.description}</span>
                    </label>
                    <div class="flex gap-2">
                      {field.type === "color" && (
                        <input
                          type="color"
                          class="input input-bordered w-16 h-12 p-1 cursor-pointer"
                          value={variables[field.key] as string || "#000000"}
                          onChange={(e) =>
                            onVariableChange(field.key, (e.target as HTMLInputElement).value)}
                        />
                      )}
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        class="input input-bordered flex-1"
                        value={variables[field.key] || ""}
                        onChange={(e) =>
                          onVariableChange(
                            field.key,
                            field.type === "number"
                              ? Number((e.target as HTMLInputElement).value)
                              : (e.target as HTMLInputElement).value,
                          )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div class="mt-6 p-4 bg-base-200 rounded-box">
            <h3 class="font-semibold mb-3">Preview</h3>
            <div class="space-y-4">
              <div class="flex gap-2">
                <button class="btn btn-primary btn-sm">Primary</button>
                <button class="btn btn-secondary btn-sm">Secondary</button>
                <button class="btn btn-accent btn-sm">Accent</button>
                <button class="btn btn-neutral btn-sm">Neutral</button>
              </div>
              <div class="flex gap-2">
                <div class="alert alert-info">
                  <span>Info alert</span>
                </div>
                <div class="alert alert-success">
                  <span>Success alert</span>
                </div>
                <div class="alert alert-warning">
                  <span>Warning alert</span>
                </div>
                <div class="alert alert-error">
                  <span>Error alert</span>
                </div>
              </div>
              <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                  <h2 class="card-title">Sample Card</h2>
                  <p>This is how your theme will look on cards and other components.</p>
                  <div class="card-actions justify-end">
                    <button class="btn btn-primary">Action</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div class="flex justify-end gap-3 mt-6">
            <button class="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button
              class="btn btn-primary"
              onClick={onSave}
              disabled={isSaving || !themeName || !themeLabel}
            >
              {isSaving
                ? (
                  <>
                    <Loading size="sm" variant="spinner" />
                    Saving...
                  </>
                )
                : (
                  <>
                    💾 {editingTheme ? "Update Theme" : "Save Theme"}
                  </>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomThemeCreator;
