import { Indicator } from "@suppers/ui-lib";
import { Button } from "@suppers/ui-lib";

export const handler = {
  GET(ctx: any) {
    ctx.state.title = "Indicator Component - DaisyUI Components";
    return ctx.render();
  },
};

export default function IndicatorPage() {
  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Indicator Component</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Add badges, notifications, and status indicators to any element. Perfect for showing
            counts, status, and drawing attention to important content.
          </p>
        </div>

        {/* Basic Indicators */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Basic Indicators</h2>
            <p className="text-base-content/70">
              Simple badge indicators with different positions and styles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Notification Badge */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center">Notification Badge</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Classic notification count
                </p>

                <Indicator content="5" position="top-end">
                  <Button color="primary">Messages</Button>
                </Indicator>
              </div>
            </div>

            {/* Status Dot */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center">Status Dot</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Simple online/offline indicator
                </p>

                <Indicator variant="dot" color="success" position="top-end">
                  <div className="avatar">
                    <div className="w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content text-xl font-bold">
                      JD
                    </div>
                  </div>
                </Indicator>
              </div>
            </div>

            {/* Animated Ping */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center">Animated Ping</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Attention-grabbing animation
                </p>

                <Indicator variant="ping" color="error" position="top-end">
                  <Button variant="outline">⚠️ Alert</Button>
                </Indicator>
              </div>
            </div>

            {/* High Count */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center">High Count</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Large numbers display
                </p>

                <Indicator content="99+" color="warning" position="top-end">
                  <Button color="accent">📧 Inbox</Button>
                </Indicator>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Interactive Features</h2>
            <p className="text-base-content/70">
              Clickable indicators with dynamic behavior
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clickable Notifications */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Clickable Notifications</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Click the indicators to interact with them
                </p>

                <div className="space-y-4">
                  <Indicator
                    content="3"
                    color="primary"
                    position="top-end"
                    onIndicatorClick={() => alert("3 new messages!")}
                  >
                    <Button variant="outline">📧 Email</Button>
                  </Indicator>

                  <Indicator
                    content="!"
                    color="warning"
                    position="top-end"
                    onIndicatorClick={() => alert("System update available!")}
                  >
                    <Button variant="outline">⚙️ System</Button>
                  </Indicator>

                  <Indicator
                    variant="dot"
                    color="success"
                    position="top-end"
                    onIndicatorClick={() => alert("User is online!")}
                  >
                    <Button variant="outline">👤 Profile</Button>
                  </Indicator>
                </div>
              </div>
            </div>

            {/* Real-world Navigation */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Navigation Menu</h3>
                <p className="text-sm text-base-content/70 mb-6">
                  Menu items with notification counts
                </p>

                <div className="menu bg-base-100 rounded-lg">
                  <li>
                    <Indicator content="12" color="primary" position="top-end">
                      <a>📧 Messages</a>
                    </Indicator>
                  </li>
                  <li>
                    <Indicator content="3" color="warning" position="top-end">
                      <a>🔔 Notifications</a>
                    </Indicator>
                  </li>
                  <li>
                    <Indicator variant="dot" color="success" position="top-end">
                      <a>👥 Friends Online</a>
                    </Indicator>
                  </li>
                  <li>
                    <a>📊 Dashboard</a>
                  </li>
                  <li>
                    <Indicator content="!" color="error" position="top-end">
                      <a>⚙️ Settings</a>
                    </Indicator>
                  </li>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
