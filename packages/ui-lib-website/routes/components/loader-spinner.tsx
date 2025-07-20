import { LoaderSpinner } from "../../shared/components/LoaderSpinner.tsx";

export default function LoaderSpinnerDemo() {
  return (
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">LoaderSpinner Component</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Demo */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Live Demo</h2>

              <div class="space-y-6">
                <div>
                  <h3 class="text-sm font-medium mb-2">Small</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <LoaderSpinner size="sm" />
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">Medium (Default)</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <LoaderSpinner size="md" />
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">Large</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <LoaderSpinner size="lg" />
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">With Text</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <LoaderSpinner size="md" text="Loading..." />
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">Custom Text</h3>
                  <div class="p-4 bg-base-200 rounded">
                    <LoaderSpinner size="lg" text="Processing your request..." />
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
                    <pre><code>{`<LoaderSpinner />`}</code></pre>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">With Size</h3>
                  <div class="mockup-code">
                    <pre><code>{`<LoaderSpinner size="lg" />`}</code></pre>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">With Text</h3>
                  <div class="mockup-code">
                    <pre><code>{`<LoaderSpinner
  size="md"
  text="Loading..."
/>`}</code></pre>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium mb-2">With Custom Classes</h3>
                  <div class="mockup-code">
                    <pre><code>{`<LoaderSpinner
  size="lg"
  className="my-4"
  text="Processing..."
/>`}</code></pre>
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
                      <code class="badge badge-neutral">size</code>
                    </td>
                    <td>
                      <code>"sm" | "md" | "lg"</code>
                    </td>
                    <td>
                      <code>"md"</code>
                    </td>
                    <td>Size of the spinner</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">text</code>
                    </td>
                    <td>
                      <code>string</code>
                    </td>
                    <td>
                      <code>undefined</code>
                    </td>
                    <td>Optional text to display below spinner</td>
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

        {/* Usage Examples */}
        <div class="mt-8 card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Common Usage Patterns</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-2">Loading Page</h3>
                <div class="p-4 bg-base-200 rounded">
                  <LoaderSpinner size="lg" text="Loading page..." />
                </div>
              </div>

              <div>
                <h3 class="font-semibold mb-2">Button Loading</h3>
                <div class="p-4 bg-base-200 rounded flex items-center justify-center">
                  <button class="btn" disabled>
                    <LoaderSpinner size="sm" />
                    Loading
                  </button>
                </div>
              </div>

              <div>
                <h3 class="font-semibold mb-2">Inline Loading</h3>
                <div class="p-4 bg-base-200 rounded">
                  <p class="flex items-center gap-2">
                    <LoaderSpinner size="sm" />
                    Saving changes...
                  </p>
                </div>
              </div>

              <div>
                <h3 class="font-semibold mb-2">Full Screen Loading</h3>
                <div class="p-4 bg-base-200 rounded relative h-32">
                  <div class="absolute inset-0 bg-base-100/80 flex items-center justify-center">
                    <LoaderSpinner size="lg" text="Processing..." />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
