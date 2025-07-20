import { Divider } from "@suppers/ui-lib";

export default function DividerPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Divider Component</h1>
        <p>Visual separator component for organizing content with optional text labels</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Dividers</h2>
          <div class="max-w-lg mx-auto space-y-6">
            <div>
              <p>Content above the divider</p>
              <Divider />
              <p>Content below the divider</p>
            </div>

            <div>
              <p>Another section above</p>
              <Divider text="OR" />
              <p>Another section below</p>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Text Positioning</h2>
          <div class="max-w-lg mx-auto space-y-6">
            <div>
              <p>Content above</p>
              <Divider text="Start" position="start" />
              <p>Text aligned to start</p>
            </div>

            <div>
              <p>Content above</p>
              <Divider text="Center" position="center" />
              <p>Text centered (default)</p>
            </div>

            <div>
              <p>Content above</p>
              <Divider text="End" position="end" />
              <p>Text aligned to end</p>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Vertical Dividers</h2>
          <div class="flex items-center justify-center gap-4 p-8 bg-base-200 rounded-box">
            <div class="text-center">
              <div class="stat">
                <div class="stat-title">Downloads</div>
                <div class="stat-value">31K</div>
              </div>
            </div>

            <Divider vertical />

            <div class="text-center">
              <div class="stat">
                <div class="stat-title">Users</div>
                <div class="stat-value">4.2K</div>
              </div>
            </div>

            <Divider vertical />

            <div class="text-center">
              <div class="stat">
                <div class="stat-title">Stars</div>
                <div class="stat-value">1.2K</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Login Form Example</h2>
          <div class="max-w-md mx-auto">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title justify-center">Sign In</h2>

                <button class="btn btn-outline">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <Divider text="OR" />

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    class="input input-bordered"
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Password</span>
                  </label>
                  <input type="password" placeholder="••••••••" class="input input-bordered" />
                </div>

                <div class="form-control mt-6">
                  <button class="btn btn-primary">Sign In</button>
                </div>

                <Divider />

                <div class="text-center">
                  <span class="text-sm">Don't have an account?</span>
                  <a class="link link-primary text-sm">Sign up</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Content Sections</h2>
          <div class="max-w-3xl mx-auto space-y-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Product Features</h3>
                <div class="grid md:grid-cols-3 gap-6">
                  <div class="text-center">
                    <div class="text-4xl mb-2">⚡</div>
                    <h4 class="font-bold">Fast</h4>
                    <p class="text-sm opacity-70">Lightning fast performance</p>
                  </div>

                  <Divider vertical class="hidden md:block" />
                  <Divider class="md:hidden" />

                  <div class="text-center">
                    <div class="text-4xl mb-2">🔒</div>
                    <h4 class="font-bold">Secure</h4>
                    <p class="text-sm opacity-70">Enterprise-grade security</p>
                  </div>

                  <Divider vertical class="hidden md:block" />
                  <Divider class="md:hidden" />

                  <div class="text-center">
                    <div class="text-4xl mb-2">🎨</div>
                    <h4 class="font-bold">Beautiful</h4>
                    <p class="text-sm opacity-70">Stunning user interface</p>
                  </div>
                </div>
              </div>
            </div>

            <Divider text="Why Choose Us?" />

            <div class="grid md:grid-cols-2 gap-6">
              <div class="card bg-base-100 shadow-md">
                <div class="card-body">
                  <h4 class="card-title">For Developers</h4>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li>Easy to integrate</li>
                    <li>Comprehensive documentation</li>
                    <li>Active community support</li>
                  </ul>
                </div>
              </div>

              <div class="card bg-base-100 shadow-md">
                <div class="card-body">
                  <h4 class="card-title">For Businesses</h4>
                  <ul class="list-disc list-inside space-y-1 text-sm">
                    <li>Scalable solutions</li>
                    <li>24/7 customer support</li>
                    <li>Enterprise features</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Timeline Example</h2>
          <div class="max-w-2xl mx-auto">
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h4 class="font-bold">Project Kickoff</h4>
                  <p class="text-sm opacity-70">Team assembled and goals defined</p>
                </div>
              </div>

              <Divider vertical class="ml-6 h-8" />

              <div class="flex items-center gap-4">
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full bg-secondary text-secondary-content flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h4 class="font-bold">Development Phase</h4>
                  <p class="text-sm opacity-70">Core features implementation</p>
                </div>
              </div>

              <Divider vertical class="ml-6 h-8" />

              <div class="flex items-center gap-4">
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full bg-accent text-accent-content flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h4 class="font-bold">Testing & QA</h4>
                  <p class="text-sm opacity-70">Quality assurance and bug fixes</p>
                </div>
              </div>

              <Divider vertical class="ml-6 h-8" />

              <div class="flex items-center gap-4">
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full bg-success text-success-content flex items-center justify-center font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h4 class="font-bold">Launch</h4>
                  <p class="text-sm opacity-70">Product goes live!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Pricing Table</h2>
          <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div class="card bg-base-100 shadow-lg">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Basic</h3>
                <div class="text-4xl font-bold my-4">
                  $9<span class="text-lg">/mo</span>
                </div>
                <Divider />
                <ul class="space-y-2 text-sm">
                  <li>✅ 10 Projects</li>
                  <li>✅ Basic Support</li>
                  <li>✅ 1GB Storage</li>
                </ul>
                <div class="card-actions justify-center mt-6">
                  <button class="btn btn-outline">Choose Plan</button>
                </div>
              </div>
            </div>

            <div class="card bg-primary text-primary-content shadow-lg">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Pro</h3>
                <div class="text-4xl font-bold my-4">
                  $29<span class="text-lg">/mo</span>
                </div>
                <div class="divider divider-neutral">Most Popular</div>
                <ul class="space-y-2 text-sm">
                  <li>✅ Unlimited Projects</li>
                  <li>✅ Priority Support</li>
                  <li>✅ 100GB Storage</li>
                  <li>✅ Advanced Analytics</li>
                </ul>
                <div class="card-actions justify-center mt-6">
                  <button class="btn btn-secondary">Choose Plan</button>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-lg">
              <div class="card-body text-center">
                <h3 class="card-title justify-center">Enterprise</h3>
                <div class="text-4xl font-bold my-4">
                  $99<span class="text-lg">/mo</span>
                </div>
                <Divider />
                <ul class="space-y-2 text-sm">
                  <li>✅ Everything in Pro</li>
                  <li>✅ Dedicated Support</li>
                  <li>✅ Unlimited Storage</li>
                  <li>✅ Custom Integrations</li>
                </ul>
                <div class="card-actions justify-center mt-6">
                  <button class="btn btn-outline">Contact Sales</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Divider</code></pre>
                <pre data-prefix=">"><code>{'<Divider />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Divider with text</code></pre>
                <pre data-prefix=">"><code>{'<Divider text="OR" position="center" />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Vertical divider</code></pre>
                <pre data-prefix=">"><code>{'<Divider vertical />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Text positioned to start</code></pre>
                <pre data-prefix=">"><code>{'<Divider text="Section" position="start" />'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
