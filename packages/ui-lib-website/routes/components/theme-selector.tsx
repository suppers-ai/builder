import { ThemeSelector as ThemeSelectorDisplay } from "../../shared/components/ThemeSelector.tsx";
import { setGlobalTheme } from "../../utils/signals.ts";

export default function ThemeSelectorDemo() {
  // Mock user for demo
  const mockUser = {
    id: "demo-user",
    email: "demo@example.com",
    first_name: "Demo",
    last_name: "User",
    display_name: "Demo User",
    avatar_url: null,
    role: "user",
    theme_preference: "light",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Mock custom themes
  const mockCustomThemes = [
    {
      id: "custom-ocean",
      name: "ocean",
      label: "🌊 Ocean Breeze",
      description: "Custom ocean-inspired theme",
      colors: {
        primary: "#0ea5e9",
        secondary: "#06b6d4",
        accent: "#22d3ee",
        neutral: "#1e293b",
        base100: "#f8fafc",
        base200: "#e2e8f0",
        base300: "#cbd5e1",
        info: "#3b82f6",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
      },
      createdBy: "demo-user",
      isPublic: false,
    },
  ];

  const handleThemeChange = (theme: string, custom?: any) => {
    console.log("Theme changed:", { theme, custom });

    // Use the global theme system
    setGlobalTheme(theme);

    // Show demo alert
    const alertTimeout = setTimeout(() => {
      alert(`Demo: Theme changed to ${theme}${custom ? ` (custom: ${custom.label})` : ""}`);
    }, 100); // Small delay to allow theme to apply first

    // Clear timeout if component unmounts
    return () => clearTimeout(alertTimeout);
  };

  const handleCreateCustomTheme = () => {
    console.log("Create custom theme clicked");
    alert(
      "Demo: Custom theme creator would open here!\nCheck the /components/custom-theme-creator route for the full creator interface.",
    );
  };

  return (
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">ThemeSelector Component</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Demo */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Live Demo</h2>
              <p class="text-base-content/70 mb-4">
                Interactive theme selector with mocked state (no SSR issues).
              </p>

              <div class="space-y-6">
                <div>
                  <h3 class="text-sm font-medium mb-2">Default Size</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <ThemeSelectorDisplay
                      user={mockUser as any}
                      currentTheme="light"
                      currentCustomTheme={null}
                      customThemes={mockCustomThemes as any}
                      isUpdating={false}
                      onThemeChange={handleThemeChange}
                      onCreateCustomTheme={handleCreateCustomTheme}
                    />
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">Large Size</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <ThemeSelectorDisplay
                      user={mockUser as any}
                      currentTheme="dark"
                      currentCustomTheme={null}
                      customThemes={mockCustomThemes as any}
                      isUpdating={false}
                      size="lg"
                      onThemeChange={handleThemeChange}
                      onCreateCustomTheme={handleCreateCustomTheme}
                    />
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">With Custom Theme Selected</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <ThemeSelectorDisplay
                      user={mockUser as any}
                      currentTheme="ocean"
                      currentCustomTheme={mockCustomThemes[0] as any}
                      customThemes={mockCustomThemes as any}
                      isUpdating={false}
                      onThemeChange={handleThemeChange}
                      onCreateCustomTheme={handleCreateCustomTheme}
                    />
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">Without Custom Themes</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <ThemeSelectorDisplay
                      user={mockUser as any}
                      currentTheme="cupcake"
                      currentCustomTheme={null}
                      customThemes={[]}
                      isUpdating={false}
                      allowCustomThemes={false}
                      onThemeChange={handleThemeChange}
                    />
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">Loading State</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <ThemeSelectorDisplay
                      user={mockUser as any}
                      currentTheme="synthwave"
                      currentCustomTheme={null}
                      customThemes={mockCustomThemes as any}
                      isUpdating={true}
                      onThemeChange={handleThemeChange}
                      onCreateCustomTheme={handleCreateCustomTheme}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Code Examples</h2>

              <div class="space-y-4">
                <div>
                  <h3 class="text-sm font-medium mb-2">Basic Usage</h3>
                  <div class="mockup-code">
                    <pre><code>{`<ThemeSelector
  user={currentUser}
  onThemeChange={(theme, customTheme) => {
    console.log('Theme changed:', theme);
  }}
/>`}</code></pre>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">With Custom Theme Support</h3>
                  <div class="mockup-code">
                    <pre><code>{`<ThemeSelector
  user={currentUser}
  allowCustomThemes={true}
  onCreateCustomTheme={() => {
    setShowThemeCreator(true);
  }}
  onThemeChange={handleThemeChange}
/>`}</code></pre>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">In Navigation</h3>
                  <div class="mockup-code">
                    <pre><code>{`<nav class="navbar bg-base-100">
  <div class="navbar-end">
    <ThemeSelector
      user={user}
      size="sm"
      className="mr-2"
    />
  </div>
</nav>`}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Props Documentation */}
        <div class="mt-8 card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Props</h2>

            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Type</th>
                    <th>Default</th>
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
                      <code>required</code>
                    </td>
                    <td>Current user object with theme preferences</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">onThemeChange</code>
                    </td>
                    <td>
                      <code>(theme: string, customTheme?: CustomTheme) =&gt; void</code>
                    </td>
                    <td>
                      <code>undefined</code>
                    </td>
                    <td>Callback when theme changes</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">onCreateCustomTheme</code>
                    </td>
                    <td>
                      <code>() =&gt; void</code>
                    </td>
                    <td>
                      <code>undefined</code>
                    </td>
                    <td>Callback to open custom theme creator</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">allowCustomThemes</code>
                    </td>
                    <td>
                      <code>boolean</code>
                    </td>
                    <td>
                      <code>true</code>
                    </td>
                    <td>Whether to allow custom themes</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">size</code>
                    </td>
                    <td>
                      <code>"sm" | "md" | "lg"</code>
                    </td>
                    <td>
                      <code>"sm"</code>
                    </td>
                    <td>Size of the theme selector button</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">className</code>
                    </td>
                    <td>
                      <code>string</code>
                    </td>
                    <td>
                      <code>""</code>
                    </td>
                    <td>Additional CSS classes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div class="mt-8 card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Features</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-start gap-3">
                <div class="badge badge-primary">✓</div>
                <div>
                  <h4 class="font-medium">29 DaisyUI Themes</h4>
                  <p class="text-sm text-base-content/70">
                    Light, Dark, Cupcake, Synthwave, and more
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="badge badge-primary">✓</div>
                <div>
                  <h4 class="font-medium">Custom Themes</h4>
                  <p class="text-sm text-base-content/70">Create unlimited custom color schemes</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="badge badge-primary">✓</div>
                <div>
                  <h4 class="font-medium">Real-time Preview</h4>
                  <p class="text-sm text-base-content/70">
                    See changes instantly across all components
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="badge badge-primary">✓</div>
                <div>
                  <h4 class="font-medium">Database Persistence</h4>
                  <p class="text-sm text-base-content/70">Themes saved per user across sessions</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="badge badge-primary">✓</div>
                <div>
                  <h4 class="font-medium">SSR Safe</h4>
                  <p class="text-sm text-base-content/70">Works with Fresh server-side rendering</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="badge badge-primary">✓</div>
                <div>
                  <h4 class="font-medium">Theme Sharing</h4>
                  <p class="text-sm text-base-content/70">Share custom themes with other users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
