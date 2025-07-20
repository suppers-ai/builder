import { Artboard } from "@suppers/ui-lib";

export const handler = {
  GET(ctx: any) {
    ctx.state.title = "Artboard Component - DaisyUI Components";
    return ctx.render();
  },
};

export default function ArtboardPage() {
  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Artboard Component</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Showcase your content with predefined aspect ratios and consistent sizing. Perfect for
            design mockups, prototypes, and content presentation.
          </p>
        </div>

        {/* Size Variants */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Artboard Sizes</h2>
            <p className="text-base-content/70">
              Six different aspect ratios for various design needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Size 1 - Square */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Size 1 - Square (1:1)</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Perfect for profile pictures, icons, and square content
                </p>

                <Artboard
                  size="1"
                  demo
                  className="bg-gradient-to-br from-primary to-secondary text-primary-content"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-2">👤</div>
                      <div className="text-lg font-bold">Profile</div>
                    </div>
                  </div>
                </Artboard>
              </div>
            </div>

            {/* Size 2 - Portrait */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Size 2 - Portrait (3:4)</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Great for mobile screens, business cards, and posters
                </p>

                <Artboard
                  size="2"
                  demo
                  className="bg-gradient-to-br from-secondary to-accent text-secondary-content"
                >
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="text-3xl mb-4">📱</div>
                    <div className="text-lg font-bold mb-2">Mobile App</div>
                    <div className="text-sm opacity-80">Portrait Layout</div>
                  </div>
                </Artboard>
              </div>
            </div>

            {/* Size 3 - 4:3 */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Size 3 - Classic (4:3)</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Traditional computer monitor ratio, presentations
                </p>

                <Artboard
                  size="3"
                  demo
                  className="bg-gradient-to-br from-accent to-success text-accent-content"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🖥️</div>
                      <div className="text-lg font-bold">Desktop</div>
                      <div className="text-sm opacity-80">4:3 Display</div>
                    </div>
                  </div>
                </Artboard>
              </div>
            </div>

            {/* Size 4 - 16:9 */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Size 4 - Widescreen (16:9)</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Modern widescreen format for videos and displays
                </p>

                <Artboard
                  size="4"
                  demo
                  className="bg-gradient-to-br from-success to-warning text-success-content"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎬</div>
                      <div className="text-lg font-bold">Video Content</div>
                      <div className="text-sm opacity-80">16:9 Widescreen</div>
                    </div>
                  </div>
                </Artboard>
              </div>
            </div>

            {/* Size 5 - Ultra-wide */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Size 5 - Ultra-wide (21:9)</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Ultra-wide format for cinematic content
                </p>

                <Artboard
                  size="5"
                  demo
                  className="bg-gradient-to-br from-warning to-error text-warning-content"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏞️</div>
                      <div className="text-lg font-bold">Cinematic</div>
                      <div className="text-sm opacity-80">Ultra-wide View</div>
                    </div>
                  </div>
                </Artboard>
              </div>
            </div>

            {/* Size 6 - A4 */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Size 6 - Document (A4)</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Standard document ratio for print layouts
                </p>

                <Artboard
                  size="6"
                  demo
                  className="bg-gradient-to-br from-error to-primary text-error-content"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📄</div>
                      <div className="text-lg font-bold">Document</div>
                      <div className="text-sm opacity-80">A4 Paper Size</div>
                    </div>
                  </div>
                </Artboard>
              </div>
            </div>
          </div>
        </section>

        {/* Phone Mockups */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Phone Mockups</h2>
            <p className="text-base-content/70">
              Mobile device artboards with phone-specific styling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Phone Size 1 */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center text-sm">iPhone SE</h3>

                <Artboard
                  size="1"
                  phone
                  demo
                  className="bg-gradient-to-br from-primary to-secondary text-primary-content"
                >
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-bold mb-1">Compact Screen</div>
                    <div className="text-xs opacity-80">320x568</div>
                  </div>
                </Artboard>
              </div>
            </div>

            {/* Phone Size 2 */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center text-sm">iPhone 8</h3>

                <Artboard
                  size="2"
                  phone
                  demo
                  className="bg-gradient-to-br from-secondary to-accent text-secondary-content"
                >
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-bold mb-1">Standard Screen</div>
                    <div className="text-xs opacity-80">375x667</div>
                  </div>
                </Artboard>
              </div>
            </div>

            {/* Phone Size 3 */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center text-sm">iPhone X</h3>

                <Artboard
                  size="3"
                  phone
                  demo
                  className="bg-gradient-to-br from-accent to-success text-accent-content"
                >
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-bold mb-1">Edge Screen</div>
                    <div className="text-xs opacity-80">375x812</div>
                  </div>
                </Artboard>
              </div>
            </div>

            {/* Phone Size 4 */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center text-sm">iPhone Pro Max</h3>

                <Artboard
                  size="4"
                  phone
                  demo
                  className="bg-gradient-to-br from-success to-warning text-success-content"
                >
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-bold mb-1">Large Screen</div>
                    <div className="text-xs opacity-80">414x896</div>
                  </div>
                </Artboard>
              </div>
            </div>
          </div>
        </section>

        {/* Real-world Applications */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Real-world Applications</h2>
            <p className="text-base-content/70">
              See artboards in action with practical design examples
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Portfolio Showcase */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Portfolio Gallery</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Consistent artboard sizing for portfolio pieces
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Artboard
                    size="1"
                    demo
                    className="bg-gradient-to-br from-purple-500 to-pink-500"
                  >
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <div className="text-xl mb-1">🎨</div>
                        <div className="text-xs font-bold">Design 1</div>
                      </div>
                    </div>
                  </Artboard>

                  <Artboard
                    size="1"
                    demo
                    className="bg-gradient-to-br from-blue-500 to-cyan-500"
                  >
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <div className="text-xl mb-1">🖼️</div>
                        <div className="text-xs font-bold">Design 2</div>
                      </div>
                    </div>
                  </Artboard>

                  <Artboard
                    size="1"
                    demo
                    className="bg-gradient-to-br from-green-500 to-emerald-500"
                  >
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <div className="text-xl mb-1">✨</div>
                        <div className="text-xs font-bold">Design 3</div>
                      </div>
                    </div>
                  </Artboard>

                  <Artboard
                    size="1"
                    demo
                    className="bg-gradient-to-br from-orange-500 to-red-500"
                  >
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <div className="text-xl mb-1">🚀</div>
                        <div className="text-xs font-bold">Design 4</div>
                      </div>
                    </div>
                  </Artboard>
                </div>
              </div>
            </div>

            {/* App Mockup Comparison */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">App Design Comparison</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Compare designs across different screen sizes
                </p>

                <div className="flex justify-center items-end gap-4">
                  <Artboard
                    size="1"
                    phone
                    demo
                    className="bg-gradient-to-br from-primary to-secondary text-primary-content"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl mb-1">📱</div>
                          <div className="text-xs">Mobile</div>
                        </div>
                      </div>
                      <div className="h-8 bg-black/20 flex items-center justify-center">
                        <div className="text-xs">Navigation</div>
                      </div>
                    </div>
                  </Artboard>

                  <Artboard
                    size="2"
                    phone
                    demo
                    className="bg-gradient-to-br from-secondary to-accent text-secondary-content"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl mb-1">📱</div>
                          <div className="text-xs">Tablet</div>
                        </div>
                      </div>
                      <div className="h-8 bg-black/20 flex items-center justify-center">
                        <div className="text-xs">Navigation</div>
                      </div>
                    </div>
                  </Artboard>

                  <Artboard
                    size="4"
                    demo
                    className="bg-gradient-to-br from-accent to-success text-accent-content"
                  >
                    <div className="flex flex-col h-full">
                      <div className="h-8 bg-black/20 flex items-center justify-center">
                        <div className="text-xs">Header Navigation</div>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-2">🖥️</div>
                          <div className="text-sm">Desktop</div>
                        </div>
                      </div>
                    </div>
                  </Artboard>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Interactive Features</h2>
            <p className="text-base-content/70">
              Clickable artboards with dynamic behavior
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clickable Mockups */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Clickable Prototypes</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Click the artboards to simulate interactions
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Artboard
                    size="1"
                    demo
                    className="bg-gradient-to-br from-primary to-secondary text-primary-content cursor-pointer hover:scale-105 transition-transform"
                    onArtboardClick={() => alert("Login screen clicked!")}
                  >
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <div className="text-2xl mb-2">🔐</div>
                      <div className="text-sm font-bold">Login</div>
                      <div className="text-xs opacity-80">Click me!</div>
                    </div>
                  </Artboard>

                  <Artboard
                    size="1"
                    demo
                    className="bg-gradient-to-br from-success to-accent text-success-content cursor-pointer hover:scale-105 transition-transform"
                    onArtboardClick={() => alert("Dashboard clicked!")}
                  >
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm font-bold">Dashboard</div>
                      <div className="text-xs opacity-80">Interactive!</div>
                    </div>
                  </Artboard>
                </div>
              </div>
            </div>

            {/* Horizontal Variants */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Horizontal Layouts</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Landscape orientation artboards
                </p>

                <div className="space-y-4">
                  <Artboard
                    size="2"
                    horizontal
                    demo
                    className="bg-gradient-to-r from-info to-primary text-info-content"
                  >
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🌅</div>
                        <div className="text-sm font-bold">Landscape View</div>
                        <div className="text-xs opacity-80">Horizontal Layout</div>
                      </div>
                    </div>
                  </Artboard>

                  <Artboard
                    size="3"
                    horizontal
                    demo
                    className="bg-gradient-to-r from-warning to-error text-warning-content"
                  >
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📺</div>
                        <div className="text-sm font-bold">Wide Screen</div>
                        <div className="text-xs opacity-80">4:3 Horizontal</div>
                      </div>
                    </div>
                  </Artboard>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Design Workflow */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Design Workflow</h2>
            <p className="text-base-content/70">
              Complete design process with multiple artboard sizes
            </p>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-6">Mobile-First Design Process</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Step 1: Mobile */}
                <div className="text-center">
                  <h4 className="font-semibold mb-4">1. Mobile Design</h4>
                  <Artboard
                    size="1"
                    phone
                    demo
                    className="bg-gradient-to-br from-primary to-secondary text-primary-content mx-auto"
                  >
                    <div className="flex flex-col h-full p-3">
                      <div className="text-center mb-2">
                        <div className="text-lg">📱</div>
                        <div className="text-xs font-bold">Mobile First</div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-white/30 rounded"></div>
                        <div className="h-2 bg-white/20 rounded w-3/4"></div>
                        <div className="h-2 bg-white/30 rounded"></div>
                        <div className="h-2 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  </Artboard>
                </div>

                {/* Step 2: Tablet */}
                <div className="text-center">
                  <h4 className="font-semibold mb-4">2. Tablet Adaptation</h4>
                  <Artboard
                    size="3"
                    demo
                    className="bg-gradient-to-br from-secondary to-accent text-secondary-content mx-auto"
                  >
                    <div className="flex flex-col h-full p-4">
                      <div className="text-center mb-3">
                        <div className="text-xl">📱</div>
                        <div className="text-xs font-bold">Tablet View</div>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="h-2 bg-white/30 rounded"></div>
                          <div className="h-2 bg-white/20 rounded"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-white/20 rounded"></div>
                          <div className="h-2 bg-white/30 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </Artboard>
                </div>

                {/* Step 3: Desktop */}
                <div className="text-center">
                  <h4 className="font-semibold mb-4">3. Desktop Enhancement</h4>
                  <Artboard
                    size="4"
                    demo
                    className="bg-gradient-to-br from-accent to-success text-accent-content mx-auto"
                  >
                    <div className="flex flex-col h-full p-4">
                      <div className="h-6 bg-white/20 rounded mb-3 flex items-center justify-center">
                        <div className="text-xs font-bold">🖥️ Desktop Navigation</div>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <div className="h-2 bg-white/30 rounded"></div>
                          <div className="h-2 bg-white/20 rounded"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-white/20 rounded"></div>
                          <div className="h-2 bg-white/30 rounded"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-white/30 rounded"></div>
                          <div className="h-2 bg-white/20 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </Artboard>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
