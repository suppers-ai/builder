import { Collapse } from "@suppers/ui-lib";

export default function CollapsePage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Collapse Component</h1>
        <p>
          Simple collapsible content container with various trigger styles and interactive features
        </p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Collapse</h2>
          <div class="max-w-lg mx-auto space-y-4">
            <Collapse
              title="Click to toggle content"
              open={false}
            >
              <p>
                This is some hidden content that becomes visible when you expand the collapse
                element.
              </p>
              <p>You can put any content in here - text, images, forms, or other components.</p>
            </Collapse>

            <Collapse
              title="This one starts open"
              open={true}
            >
              <div class="space-y-2">
                <p>This collapse element starts in the open state.</p>
                <div class="alert alert-info">
                  <span>You can include other components inside collapse content.</span>
                </div>
              </div>
            </Collapse>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Collapse Styles</h2>
          <div class="max-w-lg mx-auto space-y-4">
            <Collapse
              title="Collapse with Arrow"
              arrow={true}
            >
              <p>This collapse element uses the arrow style indicator.</p>
              <p>The arrow rotates when you expand or collapse the content.</p>
            </Collapse>

            <Collapse
              title="Collapse with Plus/Minus"
              plus={true}
            >
              <p>This collapse element uses the plus/minus style indicator.</p>
              <p>The icon changes from plus to minus when expanded.</p>
            </Collapse>

            <Collapse
              title="Collapse with Checkbox"
              checkbox={true}
            >
              <p>This collapse element uses a checkbox style indicator.</p>
              <p>It shows a checkmark when the content is expanded.</p>
            </Collapse>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Collapse</h2>
          <Collapse
            title="Interactive Collapse Example"
            showControls={true}
            allowStyleChange={true}
            allowCustomIcon={true}
            showStatus={true}
            controlsPosition="top"
            class="max-w-lg mx-auto border border-base-300"
          >
            <div class="space-y-4">
              <p>This is an interactive collapse example that responds to the controls above.</p>
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
                  />
                </svg>
                <span>
                  Try changing the controls above to see how the collapse behavior changes!
                </span>
              </div>
            </div>
          </Collapse>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">FAQ Example</h2>
          <div class="max-w-2xl mx-auto space-y-2">
            <Collapse
              title="What is DaisyUI?"
              arrow={true}
              class="bg-base-200"
            >
              <p>
                DaisyUI is a semantic component library for Tailwind CSS. It provides a set of
                semantic color names and utility classes for building beautiful interfaces quickly.
              </p>
            </Collapse>

            <Collapse
              title="How do I install DaisyUI?"
              arrow={true}
              class="bg-base-200"
            >
              <div class="space-y-2">
                <p>You can install DaisyUI using npm or yarn:</p>
                <div class="mockup-code">
                  <pre data-prefix="$"><code>npm install daisyui</code></pre>
                </div>
                <p>Then add it to your Tailwind CSS config file.</p>
              </div>
            </Collapse>

            <Collapse
              title="Can I customize DaisyUI themes?"
              arrow={true}
              class="bg-base-200"
            >
              <p>
                Yes! DaisyUI supports theme customization. You can create custom themes by defining
                CSS variables or use the built-in theme generator.
              </p>
            </Collapse>

            <Collapse
              title="Is DaisyUI compatible with React?"
              arrow={true}
              class="bg-base-200"
            >
              <p>
                DaisyUI is framework-agnostic since it's just CSS classes. It works with React, Vue,
                Svelte, vanilla JavaScript, and any other framework.
              </p>
            </Collapse>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Content Examples</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <Collapse
                title="📊 Product Specifications"
                plus={true}
                class="border border-base-300"
              >
                <div class="overflow-x-auto">
                  <table class="table table-zebra w-full">
                    <tbody>
                      <tr>
                        <td>Weight</td>
                        <td>1.2 kg</td>
                      </tr>
                      <tr>
                        <td>Dimensions</td>
                        <td>30 x 20 x 5 cm</td>
                      </tr>
                      <tr>
                        <td>Material</td>
                        <td>Aluminum</td>
                      </tr>
                      <tr>
                        <td>Color</td>
                        <td>Space Gray</td>
                      </tr>
                      <tr>
                        <td>Warranty</td>
                        <td>2 years</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Collapse>

              <Collapse
                title="🎨 Theme Settings"
                checkbox={true}
                class="border border-base-300"
              >
                <div class="space-y-4">
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">Dark mode</span>
                      <input type="checkbox" class="toggle toggle-primary" />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">High contrast</span>
                      <input type="checkbox" class="toggle toggle-secondary" />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">Reduced motion</span>
                      <input type="checkbox" class="toggle toggle-accent" />
                    </label>
                  </div>
                </div>
              </Collapse>
            </div>

            <div class="space-y-4">
              <Collapse
                title="🔔 Notification Settings"
                arrow={true}
                class="border border-base-300"
              >
                <div class="space-y-4">
                  <div class="alert alert-info">
                    <span>Configure how you want to receive notifications</span>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">Email notifications</span>
                      <input type="checkbox" class="checkbox checkbox-primary" checked />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">Push notifications</span>
                      <input type="checkbox" class="checkbox checkbox-primary" />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">SMS notifications</span>
                      <input type="checkbox" class="checkbox checkbox-primary" />
                    </label>
                  </div>
                </div>
              </Collapse>

              <Collapse
                title="📈 Analytics Data"
                plus={true}
                class="border border-base-300"
              >
                <div class="stats stats-vertical w-full">
                  <div class="stat">
                    <div class="stat-title">Page Views</div>
                    <div class="stat-value">89,400</div>
                    <div class="stat-desc">21% more than last month</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Unique Visitors</div>
                    <div class="stat-value">34,200</div>
                    <div class="stat-desc">14% increase</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Bounce Rate</div>
                    <div class="stat-value">24.5%</div>
                    <div class="stat-desc">3% decrease</div>
                  </div>
                </div>
              </Collapse>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Nested Collapse</h2>
          <div class="max-w-lg mx-auto">
            <Collapse
              title="📁 Project Files"
              arrow={true}
              class="border border-base-300"
            >
              <div class="space-y-2 pl-4">
                <Collapse
                  title="📂 src"
                  plus={true}
                  class="border border-base-300"
                >
                  <div class="space-y-1 pl-4">
                    <Collapse
                      title="📂 components"
                      checkbox={true}
                      class="bg-base-100"
                    >
                      <div class="space-y-1 pl-4 text-sm">
                        <div>📄 Button.tsx</div>
                        <div>📄 Card.tsx</div>
                        <div>📄 Modal.tsx</div>
                      </div>
                    </Collapse>
                    <div class="text-sm pl-4">📄 main.tsx</div>
                    <div class="text-sm pl-4">📄 App.tsx</div>
                  </div>
                </Collapse>
                <div class="text-sm pl-4">📄 package.json</div>
                <div class="text-sm pl-4">📄 README.md</div>
              </div>
            </Collapse>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Collapse Display</code></pre>
                <pre data-prefix=">"><code>{'<Collapse title="Click me" open={false}>Content</Collapse>'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive Collapse with arrow</code></pre>
                <pre data-prefix=">"><code>{'<Collapse title="FAQ Item" arrow onToggle={handleToggle}>Answer</Collapse>'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Checkbox style collapse</code></pre>
                <pre data-prefix=">"><code>{'<Collapse title="Settings" checkbox>Form content</Collapse>'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
