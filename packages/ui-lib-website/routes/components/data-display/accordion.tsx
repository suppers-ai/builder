import { Accordion } from "@suppers/ui-lib";

const basicItems = [
  {
    id: "item1",
    title: "What is DaisyUI?",
    content: (
      <div>
        <p>
          DaisyUI is a component library for Tailwind CSS that provides semantic class names for
          styling.
        </p>
        <p>It makes it easier to build beautiful and responsive user interfaces.</p>
      </div>
    ),
  },
  {
    id: "item2",
    title: "How to install DaisyUI?",
    content: (
      <div>
        <p>You can install DaisyUI using npm or yarn:</p>
        <div class="mockup-code mt-2">
          <pre><code>npm install daisyui</code></pre>
        </div>
        <p class="mt-2">Then add it to your Tailwind CSS configuration.</p>
      </div>
    ),
  },
  {
    id: "item3",
    title: "What components are available?",
    content: (
      <div>
        <p>DaisyUI provides over 60 components including:</p>
        <ul class="list-disc list-inside mt-2 space-y-1">
          <li>Buttons and form elements</li>
          <li>Navigation components</li>
          <li>Data display components</li>
          <li>Layout components</li>
          <li>Feedback components</li>
        </ul>
      </div>
    ),
  },
];

const complexItems = [
  {
    id: "complex1",
    title: "📋 Project Planning",
    content: (
      <div class="space-y-4">
        <p>Comprehensive project planning involves multiple phases:</p>
        <div class="steps steps-vertical lg:steps-horizontal">
          <div class="step step-primary">Requirements</div>
          <div class="step step-primary">Design</div>
          <div class="step">Development</div>
          <div class="step">Testing</div>
          <div class="step">Deployment</div>
        </div>
      </div>
    ),
  },
  {
    id: "complex2",
    title: "🎨 Design System",
    content: (
      <div class="space-y-4">
        <p>Our design system includes:</p>
        <div class="grid grid-cols-2 gap-4">
          <div class="card bg-base-200 p-4">
            <h4 class="font-bold">Colors</h4>
            <div class="flex gap-2 mt-2">
              <div class="w-6 h-6 rounded bg-primary"></div>
              <div class="w-6 h-6 rounded bg-secondary"></div>
              <div class="w-6 h-6 rounded bg-accent"></div>
            </div>
          </div>
          <div class="card bg-base-200 p-4">
            <h4 class="font-bold">Typography</h4>
            <p class="text-sm">Multiple font sizes and weights</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "complex3",
    title: "⚙️ Configuration",
    disabled: true,
    content: <div>This section is currently unavailable.</div>,
  },
];

export default function AccordionPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Accordion Component</h1>
        <p>Collapsible content areas for organizing information</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Accordion (Single Open)</h2>
          <Accordion items={basicItems} defaultOpen={["item1"]} />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Multiple Open Accordion</h2>
          <Accordion
            items={basicItems}
            multiple={true}
            defaultOpen={["item1", "item2"]}
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Complex Content</h2>
          <Accordion items={complexItems} />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Accordion</h2>
          <Accordion
            items={basicItems}
            onToggle={(itemId, isOpen) => {
              console.log(`Item ${itemId} ${isOpen ? "opened" : "closed"}`);
            }}
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Multiple Interactive</h2>
          <Accordion
            items={complexItems}
            multiple={true}
            defaultOpen={["complex1"]}
            onToggle={(itemId, isOpen) => {
              console.log(`Multi: Item ${itemId} ${isOpen ? "opened" : "closed"}`);
            }}
          />
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">FAQ Example</h2>
          <Accordion
            items={[
              {
                id: "faq1",
                title: "How do I reset my password?",
                content: (
                  <div>
                    <p>To reset your password:</p>
                    <ol class="list-decimal list-inside mt-2 space-y-1">
                      <li>Go to the login page</li>
                      <li>Click "Forgot Password"</li>
                      <li>Enter your email address</li>
                      <li>Check your email for reset instructions</li>
                    </ol>
                    <div class="alert alert-info mt-4">
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
                        >
                        </path>
                      </svg>
                      <span>Password reset links expire after 24 hours.</span>
                    </div>
                  </div>
                ),
              },
              {
                id: "faq2",
                title: "How can I contact support?",
                content: (
                  <div>
                    <p>You can reach our support team through:</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div class="card bg-base-200 p-4 text-center">
                        <div class="text-2xl mb-2">📧</div>
                        <p class="font-bold">Email</p>
                        <p class="text-sm">support@example.com</p>
                      </div>
                      <div class="card bg-base-200 p-4 text-center">
                        <div class="text-2xl mb-2">💬</div>
                        <p class="font-bold">Live Chat</p>
                        <p class="text-sm">Available 24/7</p>
                      </div>
                      <div class="card bg-base-200 p-4 text-center">
                        <div class="text-2xl mb-2">📞</div>
                        <p class="font-bold">Phone</p>
                        <p class="text-sm">1-800-EXAMPLE</p>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: "faq3",
                title: "What are your business hours?",
                content: (
                  <div>
                    <div class="overflow-x-auto">
                      <table class="table table-zebra">
                        <thead>
                          <tr>
                            <th>Day</th>
                            <th>Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Monday - Friday</td>
                            <td>9:00 AM - 6:00 PM</td>
                          </tr>
                          <tr>
                            <td>Saturday</td>
                            <td>10:00 AM - 4:00 PM</td>
                          </tr>
                          <tr>
                            <td>Sunday</td>
                            <td>Closed</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
