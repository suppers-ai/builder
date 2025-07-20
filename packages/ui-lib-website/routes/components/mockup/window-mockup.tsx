import { WindowMockup } from "@suppers/ui-lib";

export default function WindowMockupDemo() {
  return (
    <div class="min-h-screen bg-base-100 p-8">
      <div class="max-w-6xl mx-auto space-y-12">
        <header class="text-center">
          <h1 class="text-4xl font-bold mb-4">Window Mockup Component</h1>
          <p class="text-lg opacity-70">
            DaisyUI Window Mockup component for displaying desktop applications
          </p>
        </header>

        {/* Basic Window Mockup */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Basic Window Mockup</h2>
          <WindowMockup title="My Application">
            <div class="bg-base-200 p-8 text-center">
              <h3 class="text-2xl font-bold mb-4">Desktop Application</h3>
              <p class="mb-4">This is a mockup of a desktop application window</p>
              <div class="flex gap-4 justify-center">
                <button class="btn btn-primary">Primary Action</button>
                <button class="btn btn-outline">Secondary Action</button>
              </div>
            </div>
          </WindowMockup>
        </section>

        {/* Window Mockup with Editor */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Window Mockup with Code Editor</h2>
          <WindowMockup title="Code Editor - main.tsx">
            <div class="bg-base-300 p-4 font-mono text-sm">
              <div class="mb-2 text-primary">// React component example</div>
              <div class="mb-2">import React from 'react';</div>
              <div class="mb-2"></div>
              <div class="mb-2">function App() {`{`}</div>
              <div class="mb-2 ml-4">return (</div>
              <div class="mb-2 ml-8">{'<div className="app">'}</div>
              <div class="mb-2 ml-12">{"<h1>Hello World</h1>"}</div>
              <div class="mb-2 ml-8">{"</div>"}</div>
              <div class="mb-2 ml-4">);</div>
              <div class="mb-2">{`}`}</div>
              <div class="mb-2"></div>
              <div class="text-secondary">export default App;</div>
            </div>
          </WindowMockup>
        </section>

        {/* Window Mockup with Form */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Window Mockup with Form</h2>
          <WindowMockup title="User Registration">
            <div class="bg-base-100 p-6">
              <form class="space-y-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    class="input input-bordered"
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Email</span>
                  </label>
                  <input type="email" placeholder="Enter your email" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    class="input input-bordered"
                  />
                </div>
                <div class="form-control mt-6">
                  <button class="btn btn-primary">Register</button>
                </div>
              </form>
            </div>
          </WindowMockup>
        </section>

        {/* Usage Examples */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Window Mockup</code></pre>
                <pre data-prefix=">"><code>{'<WindowMockup title="My App"><div>Content</div></WindowMockup>'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
