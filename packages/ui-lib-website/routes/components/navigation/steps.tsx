import { useState } from "preact/hooks";
import { Steps } from "@suppers/ui-lib";

export default function StepsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardStep, setWizardStep] = useState(0);

  const basicSteps = [
    { title: "Register", description: "Create your account", status: "completed" as const },
    { title: "Choose plan", description: "Select your subscription", status: "completed" as const },
    { title: "Purchase", description: "Complete payment", status: "current" as const },
    { title: "Receive Product", description: "Get your items", status: "pending" as const },
  ];

  const wizardSteps = [
    { title: "Personal Info", description: "Basic information", status: "pending" as const },
    { title: "Account Details", description: "Login credentials", status: "pending" as const },
    { title: "Preferences", description: "Your settings", status: "pending" as const },
    { title: "Review", description: "Confirm details", status: "pending" as const },
    { title: "Complete", description: "Finish setup", status: "pending" as const },
  ];

  const projectSteps = [
    {
      title: "Planning",
      description: "Define requirements and scope",
      status: "completed" as const,
    },
    { title: "Design", description: "Create mockups and prototypes", status: "completed" as const },
    { title: "Development", description: "Build the application", status: "current" as const },
    { title: "Testing", description: "Quality assurance and testing", status: "pending" as const },
    { title: "Deployment", description: "Launch to production", status: "pending" as const },
  ];

  const deliverySteps = [
    { title: "Order Placed", description: "Order confirmed", status: "completed" as const },
    { title: "Processing", description: "Preparing your order", status: "completed" as const },
    { title: "Shipped", description: "On the way to you", status: "current" as const },
    { title: "Out for Delivery", description: "Final delivery stage", status: "pending" as const },
    { title: "Delivered", description: "Package received", status: "pending" as const },
  ];

  const errorSteps = [
    { title: "Start Process", description: "Initialize workflow", status: "completed" as const },
    { title: "Validation", description: "Check requirements", status: "completed" as const },
    { title: "Process Data", description: "Handle information", status: "error" as const },
    { title: "Complete", description: "Finish process", status: "pending" as const },
  ];

  const handleWizardNext = () => {
    if (wizardStep < wizardSteps.length - 1) {
      setWizardStep(wizardStep + 1);
    }
  };

  const handleWizardPrev = () => {
    if (wizardStep > 0) {
      setWizardStep(wizardStep - 1);
    }
  };

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Steps Component</h1>
        <p>Progress indicators for multi-step processes, wizards, and workflows</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Steps</h2>
          <div class="max-w-2xl">
            <Steps steps={basicSteps} />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Step Navigation</h2>
          <div class="max-w-3xl">
            <Steps
              steps={basicSteps.map((step, index) => ({
                ...step,
                status: index < currentStep
                  ? "completed"
                  : index === currentStep
                  ? "current"
                  : "pending",
              }))}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />

            <div class="flex justify-center mt-6 gap-4">
              <button
                class="btn btn-outline"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              >
                Previous
              </button>
              <span class="badge badge-primary badge-lg">
                Step {currentStep + 1} of {basicSteps.length}
              </span>
              <button
                class="btn btn-primary"
                disabled={currentStep === basicSteps.length - 1}
                onClick={() => setCurrentStep(Math.min(basicSteps.length - 1, currentStep + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Vertical Steps</h2>
          <div class="max-w-md">
            <Steps steps={projectSteps} vertical />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Responsive Steps</h2>
          <div class="max-w-4xl">
            <p class="text-sm text-base-content/70 mb-4">
              These steps are vertical on mobile and horizontal on larger screens
            </p>
            <Steps steps={deliverySteps} responsive />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Steps with Error State</h2>
          <div class="max-w-2xl">
            <Steps steps={errorSteps} />
            <div class="alert alert-error mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Error occurred during data processing. Please review and try again.</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Setup Wizard Example</h2>
          <div class="max-w-4xl">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Account Setup Wizard</h2>

                <Steps
                  steps={wizardSteps}
                  currentStep={wizardStep}
                />

                <div class="divider"></div>

                {/* Wizard Content */}
                <div class="min-h-40">
                  {wizardStep === 0 && (
                    <div class="space-y-4">
                      <h3 class="text-lg font-semibold">Personal Information</h3>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="First Name" class="input input-bordered" />
                        <input type="text" placeholder="Last Name" class="input input-bordered" />
                        <input type="email" placeholder="Email" class="input input-bordered" />
                        <input type="tel" placeholder="Phone" class="input input-bordered" />
                      </div>
                    </div>
                  )}

                  {wizardStep === 1 && (
                    <div class="space-y-4">
                      <h3 class="text-lg font-semibold">Account Details</h3>
                      <div class="space-y-4">
                        <input
                          type="text"
                          placeholder="Username"
                          class="input input-bordered w-full"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          class="input input-bordered w-full"
                        />
                        <input
                          type="password"
                          placeholder="Confirm Password"
                          class="input input-bordered w-full"
                        />
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div class="space-y-4">
                      <h3 class="text-lg font-semibold">Preferences</h3>
                      <div class="space-y-4">
                        <div class="form-control">
                          <label class="label cursor-pointer">
                            <span class="label-text">Email notifications</span>
                            <input type="checkbox" checked class="toggle toggle-primary" />
                          </label>
                        </div>
                        <div class="form-control">
                          <label class="label cursor-pointer">
                            <span class="label-text">SMS notifications</span>
                            <input type="checkbox" class="toggle toggle-primary" />
                          </label>
                        </div>
                        <select class="select select-bordered w-full">
                          <option disabled selected>Select timezone</option>
                          <option>UTC-8 (Pacific Time)</option>
                          <option>UTC-5 (Eastern Time)</option>
                          <option>UTC+0 (GMT)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div class="space-y-4">
                      <h3 class="text-lg font-semibold">Review Your Information</h3>
                      <div class="bg-base-200 p-4 rounded-lg space-y-2">
                        <div>
                          <strong>Name:</strong> John Doe
                        </div>
                        <div>
                          <strong>Email:</strong> john@example.com
                        </div>
                        <div>
                          <strong>Username:</strong> johndoe
                        </div>
                        <div>
                          <strong>Notifications:</strong> Email enabled
                        </div>
                        <div>
                          <strong>Timezone:</strong> UTC-8 (Pacific Time)
                        </div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 4 && (
                    <div class="text-center space-y-4">
                      <div class="text-6xl">🎉</div>
                      <h3 class="text-lg font-semibold">Setup Complete!</h3>
                      <p>Your account has been successfully created and configured.</p>
                      <button class="btn btn-primary">Get Started</button>
                    </div>
                  )}
                </div>

                <div class="card-actions justify-between mt-6">
                  <button
                    class="btn btn-outline"
                    disabled={wizardStep === 0}
                    onClick={handleWizardPrev}
                  >
                    Previous
                  </button>

                  <button
                    class="btn btn-primary"
                    disabled={wizardStep === wizardSteps.length - 1}
                    onClick={handleWizardNext}
                  >
                    {wizardStep === wizardSteps.length - 2 ? "Complete" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Order Tracking Example</h2>
          <div class="max-w-3xl">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h2 class="card-title">Order #12345</h2>
                    <p class="text-sm text-base-content/70">
                      Estimated delivery: Tomorrow, 2:00 PM
                    </p>
                  </div>
                  <div class="badge badge-primary">In Transit</div>
                </div>

                <Steps steps={deliverySteps} />

                <div class="mt-4 p-4 bg-base-200 rounded-lg">
                  <div class="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-primary"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                    </svg>
                    <span class="font-medium">Your package is currently in transit</span>
                  </div>
                  <p class="text-sm text-base-content/70 mt-1">
                    Last updated: Today, 10:30 AM - Left sorting facility
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Custom Icons Steps</h2>
          <div class="max-w-2xl">
            <Steps
              steps={[
                {
                  title: "Design",
                  description: "Create the design",
                  status: "completed",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Develop",
                  description: "Write the code",
                  status: "current",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Deploy",
                  description: "Release to production",
                  status: "pending",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  ),
                },
              ]}
            />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Steps Display</code></pre>
                <pre data-prefix=">"><code>{'<Steps steps={steps} />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Interactive Steps</code></pre>
                <pre data-prefix=">"><code>{'<Steps steps={steps} currentStep={current} onStepClick={setStep} />'}</code></pre>
              </div>
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Vertical/Responsive Steps</code></pre>
                <pre data-prefix=">"><code>{'<Steps steps={steps} vertical responsive />'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
