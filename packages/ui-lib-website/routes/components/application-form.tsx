import { ApplicationForm } from "../../shared/components/ApplicationForm.tsx";
import { useState } from "preact/hooks";

export default function ApplicationFormDemo() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
  });

  const handleSubmit = async (data: any) => {
    console.log("Form submitted:", data);
    alert(`Application submitted!\nTitle: ${data.title}\nDescription: ${data.description}`);
    return Promise.resolve();
  };

  const handleCancel = () => {
    console.log("Form cancelled");
  };

  return (
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">ApplicationForm Component</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Live Demo</h2>
              <p class="text-base-content/70 mb-4">
                Interactive application form with validation and submission.
              </p>
              <ApplicationForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                className="w-full"
              />
            </div>
          </div>

          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Features</h2>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="badge badge-primary">✓</div>
                  <span class="text-sm">Form validation</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="badge badge-primary">✓</div>
                  <span class="text-sm">Required field handling</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="badge badge-primary">✓</div>
                  <span class="text-sm">Loading states</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="badge badge-primary">✓</div>
                  <span class="text-sm">Error handling</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="badge badge-primary">✓</div>
                  <span class="text-sm">Success feedback</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div class="mt-8 card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Code Example</h2>
            <div class="mockup-code">
              <pre><code>{`<ApplicationForm
  onSubmit={(data) => {
    console.log('Application submitted:', data);
  }}
  initialValues={{
    title: "My Application",
    description: "Application description"
  }}
  className="w-full"
/>`}</code></pre>
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
                      <code class="badge badge-neutral">onSubmit</code>
                    </td>
                    <td>
                      <code>(data: ApplicationData) =&gt; void</code>
                    </td>
                    <td>
                      <code>required</code>
                    </td>
                    <td>Callback when form is submitted</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">initialValues</code>
                    </td>
                    <td>
                      <code>ApplicationData</code>
                    </td>
                    <td>
                      <code>{}</code>
                    </td>
                    <td>Initial form values</td>
                  </tr>
                  <tr>
                    <td>
                      <code class="badge badge-neutral">isLoading</code>
                    </td>
                    <td>
                      <code>boolean</code>
                    </td>
                    <td>
                      <code>false</code>
                    </td>
                    <td>Whether form is in loading state</td>
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
      </div>
    </div>
  );
}
