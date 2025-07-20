import { Dock, DockItem } from "@suppers/ui-lib";

export const handler = {
  GET(ctx: any) {
    ctx.state.title = "Dock Component - DaisyUI Components";
    return ctx.render();
  },
};

export default function DockPage() {
  // Navigation dock items
  const navItems: DockItem[] = [
    {
      id: "home",
      label: "Home",
      icon: "🏠",
      active: true,
    },
    {
      id: "search",
      label: "Search",
      icon: "🔍",
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: "❤️",
      badge: "3",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
    },
  ];

  // Social media dock items
  const socialItems: DockItem[] = [
    {
      id: "twitter",
      label: "Twitter",
      icon: "🐦",
      href: "https://twitter.com",
    },
    {
      id: "github",
      label: "GitHub",
      icon: "🐙",
      href: "https://github.com",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: "💼",
      href: "https://linkedin.com",
    },
    {
      id: "youtube",
      label: "YouTube",
      icon: "📺",
      href: "https://youtube.com",
    },
  ];

  // App dock items
  const appItems: DockItem[] = [
    {
      id: "mail",
      label: "Mail",
      icon: "📧",
      badge: "12",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "📅",
      badge: "!",
    },
    {
      id: "photos",
      label: "Photos",
      icon: "📷",
    },
    {
      id: "music",
      label: "Music",
      icon: "🎵",
    },
    {
      id: "files",
      label: "Files",
      icon: "📁",
    },
    {
      id: "calculator",
      label: "Calculator",
      icon: "🧮",
      disabled: true,
    },
  ];

  // Gaming dock items
  const gamingItems: DockItem[] = [
    {
      id: "game1",
      label: "Action",
      icon: "🎮",
    },
    {
      id: "game2",
      label: "Strategy",
      icon: "♠️",
    },
    {
      id: "game3",
      label: "Puzzle",
      icon: "🧩",
    },
    {
      id: "game4",
      label: "Sports",
      icon: "⚽",
    },
  ];

  // Developer tools dock
  const devItems: DockItem[] = [
    {
      id: "vscode",
      label: "VS Code",
      icon: "💻",
    },
    {
      id: "terminal",
      label: "Terminal",
      icon: "⌨️",
    },
    {
      id: "browser",
      label: "Browser",
      icon: "🌐",
    },
    {
      id: "database",
      label: "Database",
      icon: "🗄️",
    },
    {
      id: "api",
      label: "API",
      icon: "🔗",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 p-8">
      {/* Header */}
      <div className="bg-base-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-base-content mb-2">
            Dock Component
          </h1>
          <p className="text-base-content/70 text-lg">
            Interactive bottom navigation and dock components for mobile and desktop apps
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Mobile Navigation Example */}
        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Mobile Bottom Navigation</h2>
            <p className="text-base-content/70 mb-6">
              Perfect for mobile app navigation with active states and badges
            </p>

            <div className="bg-base-200 rounded-lg p-4 relative min-h-[300px]">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold mb-2">Mobile App Screen</h3>
                <p className="text-base-content/70">Main content area</p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-base-100 p-4 rounded-lg">
                    <div className="h-16 bg-primary/20 rounded mb-2"></div>
                    <div className="h-4 bg-base-300 rounded"></div>
                  </div>
                  <div className="bg-base-100 p-4 rounded-lg">
                    <div className="h-16 bg-secondary/20 rounded mb-2"></div>
                    <div className="h-4 bg-base-300 rounded"></div>
                  </div>
                </div>
              </div>

              <Dock
                items={navItems}
                position="bottom"
                size="md"
                variant="default"
                fixed={false}
                showLabels={true}
                onItemClick={(item) => console.log("Clicked:", item.label)}
              />
            </div>
          </div>
        </section>

        {/* Fixed Bottom Dock */}
        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Fixed Social Media Dock</h2>
            <p className="text-base-content/70 mb-6">
              Fixed position dock that stays at the bottom of the screen
            </p>

            <div className="bg-base-200 rounded-lg p-4 min-h-[200px]">
              <div className="text-center py-8">
                <p className="text-base-content/70">
                  This dock is fixed to the browser window bottom (scroll down to see it)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Different Sizes */}
        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Different Sizes</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Small</h3>
                <Dock
                  items={gamingItems.slice(0, 4)}
                  size="sm"
                  showLabels={true}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Medium (Default)</h3>
                <Dock
                  items={gamingItems.slice(0, 4)}
                  size="md"
                  showLabels={true}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Large</h3>
                <Dock
                  items={gamingItems.slice(0, 4)}
                  size="lg"
                  showLabels={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Different Variants */}
        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Color Variants</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Primary</h3>
                <Dock
                  items={devItems.slice(0, 4)}
                  variant="primary"
                  showLabels={false}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Secondary</h3>
                <Dock
                  items={devItems.slice(0, 4)}
                  variant="secondary"
                  showLabels={false}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Accent</h3>
                <Dock
                  items={devItems.slice(0, 4)}
                  variant="accent"
                  showLabels={false}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Neutral</h3>
                <Dock
                  items={devItems.slice(0, 4)}
                  variant="neutral"
                  showLabels={false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Vertical Sidebar */}
        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Vertical Sidebar Dock</h2>
            <p className="text-base-content/70 mb-6">
              Vertical layout perfect for desktop sidebars
            </p>

            <div className="bg-base-200 rounded-lg p-4 min-h-[400px] flex">
              <Dock
                items={appItems}
                position="left"
                size="md"
                variant="default"
                showLabels={false}
                onItemClick={(item) => console.log("Sidebar clicked:", item.label)}
              />

              <div className="flex-1 p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Main Content Area</h3>
                <p className="text-base-content/70">
                  The sidebar dock provides easy access to different app sections
                </p>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-base-100 p-4 rounded-lg">
                      <div className="h-20 bg-accent/20 rounded mb-2"></div>
                      <div className="h-3 bg-base-300 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Example */}
        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Interactive App Launcher</h2>
            <p className="text-base-content/70 mb-6">
              Try clicking the apps! Some have badges and disabled states
            </p>

            <div className="bg-base-200 rounded-lg p-4 min-h-[300px]">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold mb-2">Desktop Environment</h3>
                <p className="text-base-content/70">Click any app icon to launch</p>

                <div className="grid grid-cols-4 gap-4 mt-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-base-100 p-6 rounded-lg">
                      <div className="h-24 bg-info/20 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              <Dock
                items={appItems}
                position="bottom"
                size="lg"
                variant="default"
                showLabels={true}
                onItemClick={(item) => {
                  if (!item.disabled) {
                    alert(`Launching ${item.label}!`);
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Without Labels */}
        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Icon-Only Dock</h2>
            <p className="text-base-content/70 mb-6">
              Minimal design without labels for clean interfaces
            </p>

            <Dock
              items={socialItems}
              showLabels={false}
              size="lg"
              variant="ghost"
            />
          </div>
        </section>

        {/* Code Examples */}
        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Usage Examples</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Basic Dock</h3>
                <div className="mockup-code">
                  <pre><code>{`import { Dock } from "./islands/Dock.tsx";

const items = [
  { id: "home", label: "Home", icon: "🏠", active: true },
  { id: "search", label: "Search", icon: "🔍" },
  { id: "profile", label: "Profile", icon: "👤" }
];

<Dock
  items={items}
  position="bottom"
  size="md"
  showLabels={true}
/>`}</code></pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">With Navigation</h3>
                <div className="mockup-code">
                  <pre><code>{`const navItems = [
  { id: "home", label: "Home", icon: "🏠", href: "/" },
  { id: "about", label: "About", icon: "ℹ️", href: "/about" },
  { id: "contact", label: "Contact", icon: "📧", href: "/contact" }
];

<Dock
  items={navItems}
  fixed={true}
  variant="primary"
  onItemClick={(item) => console.log('Navigate to:', item.href)}
/>`}</code></pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Vertical Sidebar</h3>
                <div className="mockup-code">
                  <pre><code>{`<Dock
  items={sidebarItems}
  position="left"
  size="lg"
  showLabels={false}
  variant="neutral"
/>`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Social Dock */}
      <Dock
        items={socialItems}
        position="bottom"
        size="md"
        variant="primary"
        fixed={true}
        showLabels={false}
        onItemClick={(item) => {
          if (item.href) {
            window.open(item.href, "_blank");
          }
        }}
      />
    </div>
  );
}
