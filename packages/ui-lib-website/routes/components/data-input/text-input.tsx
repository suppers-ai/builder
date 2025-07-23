import { Input } from "@suppers/ui-lib";

export default function TextInputPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Text Input Component</h1>
        <p>Basic text input component for single-line text entry</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Text Input</h2>
          <div class="space-y-4">
            <Input type="text" placeholder="Enter text..." />
            <Input type="text" placeholder="With default value" value="Default text" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Input Sizes</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">Extra Small</h3>
              <Input type="text" size="xs" placeholder="Extra small input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Small</h3>
              <Input type="text" size="sm" placeholder="Small input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Medium (Default)</h3>
              <Input type="text" size="md" placeholder="Medium input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Large</h3>
              <Input type="text" size="lg" placeholder="Large input" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Input Colors</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">Primary</h3>
              <Input type="text" color="primary" placeholder="Primary input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Secondary</h3>
              <Input type="text" color="secondary" placeholder="Secondary input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Accent</h3>
              <Input type="text" color="accent" placeholder="Accent input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Info</h3>
              <Input type="text" color="info" placeholder="Info input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Success</h3>
              <Input type="text" color="success" placeholder="Success input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Warning</h3>
              <Input type="text" color="warning" placeholder="Warning input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Error</h3>
              <Input type="text" color="error" placeholder="Error input" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Input States</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">Normal</h3>
              <Input type="text" placeholder="Normal input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Focused</h3>
              <Input type="text" placeholder="Focused input" class="input-focus" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Disabled</h3>
              <Input type="text" placeholder="Disabled input" disabled />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Read Only</h3>
              <Input type="text" value="Read only text" readOnly />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Input Variants</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">Default</h3>
              <Input type="text" placeholder="Default input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Bordered</h3>
              <Input type="text" variant="bordered" placeholder="Bordered input" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Ghost</h3>
              <Input type="text" variant="ghost" placeholder="Ghost input" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">With Labels and Help Text</h2>
          <div class="space-y-6">
            <div class="form-control w-full max-w-xs">
              <label class="label">
                <span class="label-text">First Name</span>
              </label>
              <Input type="text" placeholder="Enter your first name" />
            </div>

            <div class="form-control w-full max-w-xs">
              <label class="label">
                <span class="label-text">Email Address</span>
                <span class="label-text-alt">Required</span>
              </label>
              <Input type="text" placeholder="your@email.com" />
              <label class="label">
                <span class="label-text-alt">We'll never share your email</span>
              </label>
            </div>

            <div class="form-control w-full max-w-xs">
              <label class="label">
                <span class="label-text">Username</span>
              </label>
              <Input type="text" placeholder="Choose a username" color="error" />
              <label class="label">
                <span class="label-text-alt text-error">Username already taken</span>
              </label>
            </div>

            <div class="form-control w-full max-w-xs">
              <label class="label">
                <span class="label-text">Website URL</span>
              </label>
              <Input type="text" placeholder="https://example.com" color="success" />
              <label class="label">
                <span class="label-text-alt text-success">URL is valid</span>
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Input Groups</h2>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-2">With Button</h3>
              <div class="join">
                <Input type="text" placeholder="Search..." class="join-item" />
                <button class="btn join-item">Search</button>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-2">With Prefix</h3>
              <div class="join">
                <span class="btn join-item">@</span>
                <Input type="text" placeholder="username" class="join-item" />
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-2">With Suffix</h3>
              <div class="join">
                <Input type="text" placeholder="Enter amount" class="join-item" />
                <span class="btn join-item">USD</span>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-2">Complex Group</h3>
              <div class="join">
                <select class="select select-bordered join-item">
                  <option>https://</option>
                  <option>http://</option>
                </select>
                <Input type="text" placeholder="example.com" class="join-item flex-1" />
                <button class="btn join-item">Go</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Form Examples</h2>
          <div class="space-y-6">
            <div class="card bg-base-200 p-6">
              <h3 class="text-lg font-semibold mb-4">Contact Form</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">First Name</span>
                  </label>
                  <Input type="text" placeholder="John" />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Last Name</span>
                  </label>
                  <Input type="text" placeholder="Doe" />
                </div>
                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text">Email</span>
                  </label>
                  <Input type="text" placeholder="john.doe@example.com" />
                </div>
                <div class="form-control md:col-span-2">
                  <label class="label">
                    <span class="label-text">Company</span>
                  </label>
                  <Input type="text" placeholder="Acme Corp" />
                </div>
              </div>
            </div>

            <div class="card bg-base-200 p-6">
              <h3 class="text-lg font-semibold mb-4">Search Interface</h3>
              <div class="space-y-4">
                <div class="join w-full">
                  <Input 
                    type="text" 
                    placeholder="Search products, categories, brands..." 
                    class="join-item flex-1" 
                  />
                  <button class="btn btn-primary join-item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
                <div class="flex gap-2">
                  <Input type="text" size="sm" placeholder="Min price" />
                  <Input type="text" size="sm" placeholder="Max price" />
                  <Input type="text" size="sm" placeholder="Location" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Validation Examples</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Success States</h3>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Valid Email</span>
                </label>
                <Input type="text" value="user@example.com" color="success" />
                <label class="label">
                  <span class="label-text-alt text-success">✓ Email format is valid</span>
                </label>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Strong Password</span>
                </label>
                <Input type="text" value="••••••••••" color="success" />
                <label class="label">
                  <span class="label-text-alt text-success">✓ Password meets requirements</span>
                </label>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Error States</h3>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Invalid Email</span>
                </label>
                <Input type="text" value="invalid-email" color="error" />
                <label class="label">
                  <span class="label-text-alt text-error">✗ Please enter a valid email</span>
                </label>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Required Field</span>
                </label>
                <Input type="text" placeholder="This field is required" color="error" />
                <label class="label">
                  <span class="label-text-alt text-error">✗ This field cannot be empty</span>
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}