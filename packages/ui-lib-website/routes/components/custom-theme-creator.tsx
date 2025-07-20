import { CustomThemeCreator as CustomThemeCreatorDisplay } from "../../shared/components/CustomThemeCreator.tsx";

export default function CustomThemeCreatorDemo() {
  // Mock user for demo
  const mockUser = {
    id: "demo-user",
    email: "demo@example.com",
    first_name: "Demo",
    last_name: "User",
    display_name: "Demo User",
    avatar_url: null,
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Mock state
  const mockState = {
    themeName: "demo-theme",
    themeLabel: "🎨 Demo Theme",
    themeDescription: "A beautiful demo theme showcasing the theme creator",
    colors: {
      primary: "#570df8",
      secondary: "#f000b8",
      accent: "#37cdbe",
      neutral: "#3d4451",
      base100: "#ffffff",
      base200: "#f2f2f2",
      base300: "#e6e6e6",
      info: "#3abff8",
      success: "#36d399",
      warning: "#fbbd23",
      error: "#f87272",
    },
    isPublic: false,
    previewMode: false,
    isSaving: false,
  };

  const handleSaveTheme = () => {
    console.log("Theme saved (demo)");
    alert(`Demo: Theme "${mockState.themeLabel}" saved successfully!`);
  };

  const handleCancel = () => {
    console.log("Theme creation cancelled (demo)");
    alert("Demo: Theme creation cancelled");
  };

  const handlePreviewToggle = () => {
    console.log("Preview toggled (demo)");
    alert(`Demo: Preview ${mockState.previewMode ? "stopped" : "started"}`);
  };

  const handleApplyPreset = (preset: any) => {
    console.log("Preset applied (demo):", preset.name);
    alert(`Demo: Applied "${preset.name}" preset`);
  };

  const handleFieldChange = (field: string, value: any) => {
    console.log(`Demo: ${field} changed to:`, value);
  };

  return (
    <div class="px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">CustomThemeCreator Component</h1>

        <div class="space-y-6">
          {/* Introduction */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Interactive Demo</h2>
              <p class="text-base-content/70 mb-4">
                The CustomThemeCreator provides a full-featured interface for creating and editing
                custom themes with real-time preview, color presets, and form validation. This demo
                shows the component with mocked state (no SSR issues).
              </p>

              <div class="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  >
                  </path>
                </svg>
                <span>
                  Click the button below to see the theme creator interface with mocked
                  functionality!
                </span>
              </div>
            </div>
          </div>

          {/* Live Demo */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Live Demo</h2>
              <p class="text-base-content/70 mb-4">
                Interactive theme creator with all features enabled.
              </p>

              <CustomThemeCreatorDisplay
                user={mockUser as any}
                themeName={mockState.themeName}
                themeLabel={mockState.themeLabel}
                themeDescription={mockState.themeDescription}
                colors={mockState.colors}
                isPublic={mockState.isPublic}
                previewMode={mockState.previewMode}
                isSaving={mockState.isSaving}
                onThemeNameChange={(value) => handleFieldChange("themeName", value)}
                onThemeLabelChange={(value) => handleFieldChange("themeLabel", value)}
                onThemeDescriptionChange={(value) => handleFieldChange("themeDescription", value)}
                onColorChange={(key, value) => handleFieldChange(`colors.${key}`, value)}
                onIsPublicChange={(value) => handleFieldChange("isPublic", value)}
                onPreviewToggle={handlePreviewToggle}
                onApplyPreset={handleApplyPreset}
                onSave={handleSaveTheme}
                onCancel={handleCancel}
              />
            </div>
          </div>

          {/* Features */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Features</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="flex items-start gap-3">
                  <div class="badge badge-primary">🎨</div>
                  <div>
                    <h4 class="font-medium">Color Picker Interface</h4>
                    <p class="text-sm text-base-content/70">
                      Visual color picker for all DaisyUI color variables
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="badge badge-secondary">👁️</div>
                  <div>
                    <h4 class="font-medium">Real-time Preview</h4>
                    <p class="text-sm text-base-content/70">
                      See your theme applied to sample components instantly
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="badge badge-accent">🎯</div>
                  <div>
                    <h4 class="font-medium">Color Presets</h4>
                    <p class="text-sm text-base-content/70">
                      Quick start with Blue Ocean, Green Forest, and more
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="badge badge-info">📝</div>
                  <div>
                    <h4 class="font-medium">Theme Metadata</h4>
                    <p class="text-sm text-base-content/70">
                      Name, label, description, and visibility settings
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="badge badge-success">✅</div>
                  <div>
                    <h4 class="font-medium">Form Validation</h4>
                    <p class="text-sm text-base-content/70">
                      Ensures all required fields are properly filled
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="badge badge-warning">🔄</div>
                  <div>
                    <h4 class="font-medium">Edit Existing Themes</h4>
                    <p class="text-sm text-base-content/70">
                      Load and modify previously created themes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Code Example</h2>

              <div class="mockup-code">
                <pre><code>{`import { useState } from "preact/hooks";
import { CustomThemeCreator } from "./CustomThemeCreator.tsx";

export function MyThemeSettings({ user }) {
  const [showThemeCreator, setShowThemeCreator] = useState(false);

  const handleSaveTheme = async (theme) => {
    // Save to database
    await ApiHelpers.saveCustomTheme(theme);
    setShowThemeCreator(false);

    // Apply the new theme
    applyCustomTheme(theme);
  };

  return (
    <>
      <button
        class="btn btn-primary"
        onClick={() => setShowThemeCreator(true)}
      >
        Create Custom Theme
      </button>

      {showThemeCreator && (
        <CustomThemeCreator
          user={user}
          onSave={handleSaveTheme}
          onCancel={() => setShowThemeCreator(false)}
          editingTheme={existingTheme} // Optional
        />
      )}
    </>
  );
}`}</code></pre>
              </div>
            </div>
          </div>

          {/* Props Documentation */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Props</h2>

              <div class="overflow-x-auto">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Prop</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code class="badge badge-neutral">user</code>
                      </td>
                      <td>
                        <code>User</code>
                      </td>
                      <td>
                        <span class="badge badge-error">Yes</span>
                      </td>
                      <td>Current user object for ownership tracking</td>
                    </tr>
                    <tr>
                      <td>
                        <code class="badge badge-neutral">onSave</code>
                      </td>
                      <td>
                        <code>(theme: CustomTheme) =&gt; void</code>
                      </td>
                      <td>
                        <span class="badge badge-error">Yes</span>
                      </td>
                      <td>Callback when theme is saved</td>
                    </tr>
                    <tr>
                      <td>
                        <code class="badge badge-neutral">onCancel</code>
                      </td>
                      <td>
                        <code>() =&gt; void</code>
                      </td>
                      <td>
                        <span class="badge badge-error">Yes</span>
                      </td>
                      <td>Callback when creation is cancelled</td>
                    </tr>
                    <tr>
                      <td>
                        <code class="badge badge-neutral">editingTheme</code>
                      </td>
                      <td>
                        <code>CustomTheme</code>
                      </td>
                      <td>
                        <span class="badge badge-success">No</span>
                      </td>
                      <td>Existing theme to edit (for edit mode)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
