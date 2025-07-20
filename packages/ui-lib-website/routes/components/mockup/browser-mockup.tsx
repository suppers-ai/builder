import { BrowserMockup } from "@suppers/ui-lib";

export default function BrowserMockupDemo() {
  return (
    <div class="min-h-screen bg-base-100 p-8">
      <div class="max-w-6xl mx-auto space-y-12">
        <header class="text-center">
          <h1 class="text-4xl font-bold mb-4">Browser Mockup Component</h1>
          <p class="text-lg opacity-70">
            DaisyUI Browser Mockup component for displaying web content
          </p>
        </header>

        {/* Basic Browser Mockup */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Basic Browser Mockup</h2>
          <BrowserMockup url="https://daisyui.com">
            <div class="bg-base-200 p-8 text-center">
              <h3 class="text-2xl font-bold mb-4">Welcome to DaisyUI</h3>
              <p class="mb-4">
                The most popular, free and open-source Tailwind CSS component library
              </p>
              <button class="btn btn-primary">Get Started</button>
            </div>
          </BrowserMockup>
        </section>

        {/* Browser Mockup with Website Content */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Browser Mockup with Content</h2>
          <BrowserMockup url="https://example.com">
            <div class="bg-gradient-to-r from-primary to-secondary p-8 text-white">
              <div class="max-w-4xl mx-auto">
                <h1 class="text-4xl font-bold mb-4">Modern Web Design</h1>
                <p class="text-lg mb-6">
                  Create beautiful, responsive websites with the latest technologies
                </p>
                <div class="flex gap-4">
                  <button class="btn btn-primary">Learn More</button>
                  <button class="btn btn-outline btn-primary">Get Started</button>
                </div>
              </div>
            </div>
          </BrowserMockup>
        </section>

        {/* Browser Mockup with Dashboard */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Browser Mockup with Dashboard</h2>
          <BrowserMockup url="https://dashboard.example.com">
            <div class="bg-base-100 p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Dashboard</h2>
                <button class="btn btn-primary">New Project</button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="card bg-base-200">
                  <div class="card-body">
                    <h3 class="card-title">Total Users</h3>
                    <p class="text-2xl font-bold">1,234</p>
                  </div>
                </div>
                <div class="card bg-base-200">
                  <div class="card-body">
                    <h3 class="card-title">Revenue</h3>
                    <p class="text-2xl font-bold">$12,345</p>
                  </div>
                </div>
                <div class="card bg-base-200">
                  <div class="card-body">
                    <h3 class="card-title">Orders</h3>
                    <p class="text-2xl font-bold">567</p>
                  </div>
                </div>
              </div>
            </div>
          </BrowserMockup>
        </section>

        {/* Usage Examples */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Browser Mockup</code></pre>
                <pre data-prefix=">"><code>{'<BrowserMockup url="https://example.com"><div>Content</div></BrowserMockup>'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
