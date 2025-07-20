import { Stack } from "@suppers/ui-lib";
import { Button } from "@suppers/ui-lib";

export const handler = {
  GET(ctx: any) {
    ctx.state.title = "Stack Component - DaisyUI Components";
    return ctx.render();
  },
};

export default function StackPage() {
  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Stack Component</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Organize elements with flexible stacking layouts. Perfect for building responsive
            interfaces with precise control over spacing, alignment, and direction.
          </p>
        </div>

        {/* Direction Examples */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Stack Directions</h2>
            <p className="text-base-content/70">
              Vertical and horizontal stacking for different layout needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vertical Stack */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Vertical Stack</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Stack elements vertically with consistent spacing
                </p>

                <Stack direction="vertical" gap="md" className="bg-base-100 p-4 rounded-lg">
                  <Button color="primary">First Item</Button>
                  <Button color="secondary">Second Item</Button>
                  <Button color="accent">Third Item</Button>
                  <Button color="neutral">Fourth Item</Button>
                </Stack>
              </div>
            </div>

            {/* Horizontal Stack */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Horizontal Stack</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Stack elements horizontally in a row
                </p>

                <Stack
                  direction="horizontal"
                  gap="md"
                  className="bg-base-100 p-4 rounded-lg"
                >
                  <Button color="primary" size="sm">A</Button>
                  <Button color="secondary" size="sm">B</Button>
                  <Button color="accent" size="sm">C</Button>
                  <Button color="neutral" size="sm">D</Button>
                </Stack>
              </div>
            </div>
          </div>
        </section>

        {/* Gap Variations */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Gap Sizes</h2>
            <p className="text-base-content/70">
              Control spacing between stacked elements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Extra Small Gap */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Extra Small Gap</h3>

                <Stack direction="vertical" gap="xs" className="bg-base-100 p-3 rounded-lg">
                  <div className="bg-primary text-primary-content p-2 rounded text-center text-xs">
                    Item 1
                  </div>
                  <div className="bg-secondary text-secondary-content p-2 rounded text-center text-xs">
                    Item 2
                  </div>
                  <div className="bg-accent text-accent-content p-2 rounded text-center text-xs">
                    Item 3
                  </div>
                </Stack>
              </div>
            </div>

            {/* Medium Gap */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Medium Gap</h3>

                <Stack direction="vertical" gap="md" className="bg-base-100 p-3 rounded-lg">
                  <div className="bg-primary text-primary-content p-2 rounded text-center text-xs">
                    Item 1
                  </div>
                  <div className="bg-secondary text-secondary-content p-2 rounded text-center text-xs">
                    Item 2
                  </div>
                  <div className="bg-accent text-accent-content p-2 rounded text-center text-xs">
                    Item 3
                  </div>
                </Stack>
              </div>
            </div>

            {/* Extra Large Gap */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-sm">Extra Large Gap</h3>

                <Stack direction="vertical" gap="xl" className="bg-base-100 p-3 rounded-lg">
                  <div className="bg-primary text-primary-content p-2 rounded text-center text-xs">
                    Item 1
                  </div>
                  <div className="bg-secondary text-secondary-content p-2 rounded text-center text-xs">
                    Item 2
                  </div>
                  <div className="bg-accent text-accent-content p-2 rounded text-center text-xs">
                    Item 3
                  </div>
                </Stack>
              </div>
            </div>
          </div>
        </section>

        {/* Alignment Options */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Alignment & Justification</h2>
            <p className="text-base-content/70">
              Control how elements are aligned and distributed
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vertical Alignment */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Vertical Alignment</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Different alignment options for vertical stacks
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold">Start Aligned</label>
                    <Stack
                      direction="vertical"
                      align="start"
                      gap="sm"
                      className="bg-base-100 p-3 rounded-lg"
                    >
                      <div className="bg-primary text-primary-content p-1 rounded text-xs w-16 text-center">
                        Short
                      </div>
                      <div className="bg-secondary text-secondary-content p-1 rounded text-xs w-24 text-center">
                        Medium
                      </div>
                      <div className="bg-accent text-accent-content p-1 rounded text-xs w-32 text-center">
                        Longer Text
                      </div>
                    </Stack>
                  </div>

                  <div>
                    <label className="text-xs font-semibold">Center Aligned</label>
                    <Stack
                      direction="vertical"
                      align="center"
                      gap="sm"
                      className="bg-base-100 p-3 rounded-lg"
                    >
                      <div className="bg-primary text-primary-content p-1 rounded text-xs w-16 text-center">
                        Short
                      </div>
                      <div className="bg-secondary text-secondary-content p-1 rounded text-xs w-24 text-center">
                        Medium
                      </div>
                      <div className="bg-accent text-accent-content p-1 rounded text-xs w-32 text-center">
                        Longer Text
                      </div>
                    </Stack>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Justification */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Horizontal Justification</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Control spacing distribution in horizontal stacks
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold">Space Between</label>
                    <Stack
                      direction="horizontal"
                      justify="between"
                      className="bg-base-100 p-3 rounded-lg"
                    >
                      <div className="bg-primary text-primary-content p-1 rounded text-xs">A</div>
                      <div className="bg-secondary text-secondary-content p-1 rounded text-xs">
                        B
                      </div>
                      <div className="bg-accent text-accent-content p-1 rounded text-xs">C</div>
                    </Stack>
                  </div>

                  <div>
                    <label className="text-xs font-semibold">Center Justified</label>
                    <Stack
                      direction="horizontal"
                      justify="center"
                      gap="sm"
                      className="bg-base-100 p-3 rounded-lg"
                    >
                      <div className="bg-primary text-primary-content p-1 rounded text-xs">A</div>
                      <div className="bg-secondary text-secondary-content p-1 rounded text-xs">
                        B
                      </div>
                      <div className="bg-accent text-accent-content p-1 rounded text-xs">C</div>
                    </Stack>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Real-world Applications</h2>
            <p className="text-base-content/70">
              Practical examples of stack layouts in modern interfaces
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Layout */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Form Layout</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Vertical stack for form elements
                </p>

                <Stack direction="vertical" gap="md" className="bg-base-100 p-4 rounded-lg">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="input input-bordered input-sm"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered input-sm"
                    />
                  </div>

                  <Stack direction="horizontal" justify="between" align="center" gap="sm">
                    <label className="label cursor-pointer">
                      <input type="checkbox" className="checkbox checkbox-sm mr-2" />
                      <span className="label-text text-xs">Remember me</span>
                    </label>
                    <Button color="primary" size="sm">Sign In</Button>
                  </Stack>
                </Stack>
              </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Dashboard Widgets</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Mixed stack layouts for dashboard components
                </p>

                <Stack direction="vertical" gap="sm" className="bg-base-100 p-4 rounded-lg">
                  {/* Header */}
                  <Stack direction="horizontal" justify="between" align="center">
                    <h4 className="font-semibold text-sm">Analytics</h4>
                    <Button variant="ghost" size="sm">⋯</Button>
                  </Stack>

                  {/* Stats */}
                  <Stack direction="horizontal" justify="between" gap="sm">
                    <div className="stat bg-primary/10 rounded p-2 flex-1">
                      <div className="stat-value text-primary text-lg">2.4K</div>
                      <div className="stat-title text-xs">Views</div>
                    </div>
                    <div className="stat bg-secondary/10 rounded p-2 flex-1">
                      <div className="stat-value text-secondary text-lg">1.2K</div>
                      <div className="stat-title text-xs">Users</div>
                    </div>
                  </Stack>

                  {/* Actions */}
                  <Stack direction="horizontal" gap="xs">
                    <Button variant="outline" size="sm" className="flex-1">
                      Details
                    </Button>
                    <Button color="primary" size="sm" className="flex-1">
                      Export
                    </Button>
                  </Stack>
                </Stack>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Navigation Menu</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Vertical stack for menu items
                </p>

                <Stack direction="vertical" gap="xs" className="bg-base-100 p-3 rounded-lg">
                  <Stack
                    direction="horizontal"
                    align="center"
                    gap="sm"
                    className="p-2 hover:bg-base-200 rounded cursor-pointer"
                  >
                    <span className="text-lg">🏠</span>
                    <span className="text-sm">Dashboard</span>
                  </Stack>

                  <Stack
                    direction="horizontal"
                    align="center"
                    gap="sm"
                    className="p-2 bg-primary/10 rounded"
                  >
                    <span className="text-lg">📊</span>
                    <span className="text-sm font-semibold">Analytics</span>
                  </Stack>

                  <Stack
                    direction="horizontal"
                    align="center"
                    gap="sm"
                    className="p-2 hover:bg-base-200 rounded cursor-pointer"
                  >
                    <span className="text-lg">👥</span>
                    <span className="text-sm">Users</span>
                  </Stack>

                  <Stack
                    direction="horizontal"
                    align="center"
                    gap="sm"
                    className="p-2 hover:bg-base-200 rounded cursor-pointer"
                  >
                    <span className="text-lg">⚙️</span>
                    <span className="text-sm">Settings</span>
                  </Stack>
                </Stack>
              </div>
            </div>

            {/* Card Grid */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Card Layout</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Horizontal stack with wrapping for responsive cards
                </p>

                <Stack
                  direction="horizontal"
                  wrap
                  gap="sm"
                  className="bg-base-100 p-3 rounded-lg"
                >
                  <div className="card bg-primary/10 flex-1 min-w-0">
                    <div className="card-body p-3">
                      <h5 className="card-title text-xs">Project A</h5>
                      <p className="text-xs opacity-70">In Progress</p>
                    </div>
                  </div>

                  <div className="card bg-secondary/10 flex-1 min-w-0">
                    <div className="card-body p-3">
                      <h5 className="card-title text-xs">Project B</h5>
                      <p className="text-xs opacity-70">Complete</p>
                    </div>
                  </div>

                  <div className="card bg-accent/10 flex-1 min-w-0">
                    <div className="card-body p-3">
                      <h5 className="card-title text-xs">Project C</h5>
                      <p className="text-xs opacity-70">Planning</p>
                    </div>
                  </div>
                </Stack>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Interactive Features</h2>
            <p className="text-base-content/70">
              Clickable stacks with dynamic behavior
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clickable Stack */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Clickable Stack</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Click the stack container for interactions
                </p>

                <Stack
                  direction="vertical"
                  gap="sm"
                  className="bg-base-100 p-4 rounded-lg cursor-pointer hover:bg-base-200 transition-colors"
                  onStackClick={() => alert("Stack clicked!")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <span className="font-semibold">Task List</span>
                  </div>
                  <p className="text-sm opacity-70">Click anywhere on this stack</p>
                  <div className="text-xs text-primary">Interactive content area</div>
                </Stack>
              </div>
            </div>

            {/* Dynamic Layout */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Responsive Layout</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Stack adapts to different screen sizes
                </p>

                <Stack
                  direction="horizontal"
                  wrap
                  gap="sm"
                  className="bg-base-100 p-4 rounded-lg"
                >
                  <Button color="primary" size="sm" className="flex-1 min-w-fit">
                    Action 1
                  </Button>
                  <Button color="secondary" size="sm" className="flex-1 min-w-fit">
                    Action 2
                  </Button>
                  <Button color="accent" size="sm" className="flex-1 min-w-fit">
                    Action 3
                  </Button>
                  <Button color="neutral" size="sm" className="flex-1 min-w-fit">
                    Action 4
                  </Button>
                </Stack>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
