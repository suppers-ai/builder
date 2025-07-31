import { computed, useSignal } from "@preact/signals";
import { Button, Card, Input, Modal, Steps } from "@suppers/ui-lib";
import type { ApplicationTemplate } from "./MarketplaceHomepage.tsx";
import type { ApplicationSpec, Route } from "@suppers/shared/types/application";

interface AppGeneratorFormProps {
  selectedTemplate?: ApplicationTemplate;
  onGenerate: (spec: ApplicationSpec) => Promise<void>;
  onCancel: () => void;
}

interface GeneratorFormData {
  application: {
    name: string;
    description: string;
    version: string;
  };
  template: string;
  features: {
    authentication: boolean;
    database: boolean;
    api: boolean;
    analytics: boolean;
    seo: boolean;
  };
  routes: Route[];
  styling: {
    theme: string;
    customCSS?: string;
  };
  deployment: {
    platform: string;
    domain?: string;
  };
}

export default function AppGeneratorForm({
  selectedTemplate,
  onGenerate,
  onCancel,
}: AppGeneratorFormProps) {
  const currentStep = useSignal(0);
  const isGenerating = useSignal(false);
  const showPreview = useSignal(false);

  // Form data
  const formData = useSignal<GeneratorFormData>({
    application: {
      name: "",
      description: "",
      version: "1.0.0",
    },
    template: selectedTemplate?.id || "fresh-basic",
    features: {
      authentication: false,
      database: false,
      api: false,
      analytics: false,
      seo: true,
    },
    routes: [
      {
        path: "/",
        type: "page",
        components: [],
      },
    ],
    styling: {
      theme: "default",
    },
    deployment: {
      platform: "deno-deploy",
    },
  });

  // Validation errors
  const errors = useSignal<Record<string, string>>({});

  // Steps configuration
  const steps = computed(() => [
    {
      title: "Application Info",
      description: "Basic information about your app",
      status: currentStep.value > 0 ? "completed" : currentStep.value === 0 ? "current" : "pending",
    },
    {
      title: "Features",
      description: "Select features to include",
      status: currentStep.value > 1 ? "completed" : currentStep.value === 1 ? "current" : "pending",
    },
    {
      title: "Routes",
      description: "Configure your app routes",
      status: currentStep.value > 2 ? "completed" : currentStep.value === 2 ? "current" : "pending",
    },
    {
      title: "Styling",
      description: "Choose theme and styling",
      status: currentStep.value > 3 ? "completed" : currentStep.value === 3 ? "current" : "pending",
    },
    {
      title: "Review",
      description: "Review and generate",
      status: currentStep.value === 4 ? "current" : "pending",
    },
  ]);

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep.value) {
      case 0: // Application Info
        if (!formData.value.application.name.trim()) {
          newErrors.name = "Application name is required";
        }
        if (!formData.value.application.description.trim()) {
          newErrors.description = "Application description is required";
        }
        break;
      case 1: // Features - no validation needed
        break;
      case 2: // Routes
        if (formData.value.routes.length === 0) {
          newErrors.routes = "At least one route is required";
        }
        break;
      case 3: // Styling - no validation needed
        break;
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep.value < 4) {
      currentStep.value++;
    }
  };

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };

  const addRoute = () => {
    const newRoute: Route = {
      path: "/new-page",
      type: "page",
      components: [],
    };
    formData.value = {
      ...formData.value,
      routes: [...formData.value.routes, newRoute],
    };
  };

  const removeRoute = (index: number) => {
    formData.value = {
      ...formData.value,
      routes: formData.value.routes.filter((_, i) => i !== index),
    };
  };

  const updateRoute = (index: number, path: string) => {
    const updatedRoutes = [...formData.value.routes];
    updatedRoutes[index] = { ...updatedRoutes[index], path };
    formData.value = {
      ...formData.value,
      routes: updatedRoutes,
    };
  };

  const handleGenerate = async () => {
    if (!validateCurrentStep()) return;

    isGenerating.value = true;

    try {
      // Convert form data to ApplicationSpec
      const spec: ApplicationSpec = {
        application: {
          id: formData.value.application.name.toLowerCase().replace(/\s+/g, "-"),
          name: formData.value.application.name,
          version: formData.value.application.version,
          description: formData.value.application.description,
        },
        compiler: {
          id: "suppers-compiler",
          version: "1.0.0",
        },
        data: {
          routes: formData.value.routes,
        },
      };

      await onGenerate(spec);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      isGenerating.value = false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep.value) {
      case 0: // Application Info
        return (
          <div class="space-y-6">
            <div>
              <label class="label">
                <span class="label-text">Application Name *</span>
              </label>
              <Input
                type="text"
                placeholder="My Awesome App"
                value={formData.value.application.name}
                onInput={(e) => {
                  formData.value = {
                    ...formData.value,
                    application: {
                      ...formData.value.application,
                      name: (e.target as HTMLInputElement).value,
                    },
                  };
                }}
                class={`w-full ${errors.value.name ? "input-error" : ""}`}
              />
              {errors.value.name && (
                <div class="label">
                  <span class="label-text-alt text-error">{errors.value.name}</span>
                </div>
              )}
            </div>

            <div>
              <label class="label">
                <span class="label-text">Description *</span>
              </label>
              <textarea
                class={`textarea textarea-bordered w-full ${
                  errors.value.description ? "textarea-error" : ""
                }`}
                placeholder="Describe what your application does..."
                rows={3}
                value={formData.value.application.description}
                onInput={(e) => {
                  formData.value = {
                    ...formData.value,
                    application: {
                      ...formData.value.application,
                      description: (e.target as HTMLTextAreaElement).value,
                    },
                  };
                }}
              />
              {errors.value.description && (
                <div class="label">
                  <span class="label-text-alt text-error">{errors.value.description}</span>
                </div>
              )}
            </div>

            <div>
              <label class="label">
                <span class="label-text">Version</span>
              </label>
              <Input
                type="text"
                placeholder="1.0.0"
                value={formData.value.application.version}
                onInput={(e) => {
                  formData.value = {
                    ...formData.value,
                    application: {
                      ...formData.value.application,
                      version: (e.target as HTMLInputElement).value,
                    },
                  };
                }}
                class="w-full"
              />
            </div>

            {selectedTemplate && (
              <div class="bg-base-200 p-4 rounded-lg">
                <h4 class="font-semibold mb-2">Selected Template:</h4>
                <p class="text-sm text-base-content/80">{selectedTemplate.name}</p>
              </div>
            )}
          </div>
        );

      case 1: // Features
        return (
          <div class="space-y-6">
            <h3 class="text-lg font-semibold">Select Features</h3>
            <div class="grid md:grid-cols-2 gap-4">
              {Object.entries(formData.value.features).map(([key, value]) => (
                <div key={key} class="form-control">
                  <label class="label cursor-pointer">
                    <span class="label-text capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <input
                      type="checkbox"
                      class="checkbox checkbox-primary"
                      checked={value}
                      onChange={(e) => {
                        formData.value = {
                          ...formData.value,
                          features: {
                            ...formData.value.features,
                            [key]: (e.target as HTMLInputElement).checked,
                          },
                        };
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 2: // Routes
        return (
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Configure Routes</h3>
              <Button size="sm" onClick={addRoute}>
                Add Route
              </Button>
            </div>

            <div class="space-y-4">
              {formData.value.routes.map((route, index) => (
                <Card key={index} class="p-4">
                  <div class="flex gap-4 items-center">
                    <div class="flex-1">
                      <Input
                        type="text"
                        placeholder="/path"
                        value={route.path}
                        onInput={(e) => updateRoute(index, (e.target as HTMLInputElement).value)}
                        class="w-full"
                      />
                    </div>
                    <select class="select select-bordered">
                      <option value="page">Page</option>
                      <option value="api">API</option>
                    </select>
                    {formData.value.routes.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        color="error"
                        onClick={() => removeRoute(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {errors.value.routes && <div class="text-error text-sm">{errors.value.routes}</div>}
          </div>
        );

      case 3: // Styling
        return (
          <div class="space-y-6">
            <h3 class="text-lg font-semibold">Styling Options</h3>

            <div>
              <label class="label">
                <span class="label-text">Theme</span>
              </label>
              <select
                class="select select-bordered w-full"
                value={formData.value.styling.theme}
                onChange={(e) => {
                  formData.value = {
                    ...formData.value,
                    styling: {
                      ...formData.value.styling,
                      theme: (e.target as HTMLSelectElement).value,
                    },
                  };
                }}
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="cupcake">Cupcake</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label class="label">
                <span class="label-text">Custom CSS (Optional)</span>
              </label>
              <textarea
                class="textarea textarea-bordered w-full"
                placeholder="/* Add your custom CSS here */"
                rows={6}
                value={formData.value.styling.customCSS || ""}
                onInput={(e) => {
                  formData.value = {
                    ...formData.value,
                    styling: {
                      ...formData.value.styling,
                      customCSS: (e.target as HTMLTextAreaElement).value,
                    },
                  };
                }}
              />
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div class="space-y-6">
            <h3 class="text-lg font-semibold">Review Your Application</h3>

            <div class="grid md:grid-cols-2 gap-6">
              <Card class="p-4">
                <h4 class="font-semibold mb-2">Application Info</h4>
                <div class="space-y-1 text-sm">
                  <p>
                    <strong>Name:</strong> {formData.value.application.name}
                  </p>
                  <p>
                    <strong>Version:</strong> {formData.value.application.version}
                  </p>
                  <p>
                    <strong>Description:</strong> {formData.value.application.description}
                  </p>
                </div>
              </Card>

              <Card class="p-4">
                <h4 class="font-semibold mb-2">Features</h4>
                <div class="space-y-1 text-sm">
                  {Object.entries(formData.value.features)
                    .filter(([_, enabled]) => enabled)
                    .map(([feature, _]) => (
                      <p key={feature}>✓ {feature.replace(/([A-Z])/g, " $1")}</p>
                    ))}
                </div>
              </Card>

              <Card class="p-4">
                <h4 class="font-semibold mb-2">Routes</h4>
                <div class="space-y-1 text-sm">
                  {formData.value.routes.map((route, index) => (
                    <p key={index}>{route.path} ({route.type})</p>
                  ))}
                </div>
              </Card>

              <Card class="p-4">
                <h4 class="font-semibold mb-2">Styling</h4>
                <div class="space-y-1 text-sm">
                  <p>
                    <strong>Theme:</strong> {formData.value.styling.theme}
                  </p>
                  {formData.value.styling.customCSS && <p>✓ Custom CSS included</p>}
                </div>
              </Card>
            </div>

            <div class="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => showPreview.value = true}
              >
                Preview Spec
              </Button>
              <Button
                color="primary"
                size="lg"
                onClick={handleGenerate}
                loading={isGenerating.value}
              >
                {isGenerating.value ? "Generating..." : "Generate Application"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div class="min-h-screen bg-base-100 py-8">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-base-content mb-4">
            Create New Application
          </h1>
          <p class="text-base-content/80">
            Follow the steps below to configure and generate your application.
          </p>
        </div>

        {/* Steps */}
        <div class="mb-8">
          <Steps
            steps={steps.value}
            currentStep={currentStep.value}
            onStepClick={(stepIndex) => {
              if (stepIndex < currentStep.value) {
                currentStep.value = stepIndex;
              }
            }}
          />
        </div>

        {/* Form Content */}
        <Card class="p-8 mb-8">
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div class="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>

          <div class="flex gap-4">
            {currentStep.value > 0 && (
              <Button
                variant="outline"
                onClick={prevStep}
              >
                Previous
              </Button>
            )}

            {currentStep.value < 4 && (
              <Button
                color="primary"
                onClick={nextStep}
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview.value && (
          <Modal
            isOpen={true}
            onClose={() => showPreview.value = false}
            title="Application Specification Preview"
            size="lg"
          >
            <pre class="bg-base-200 p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify({
                application: formData.value.application,
                features: formData.value.features,
                routes: formData.value.routes,
                styling: formData.value.styling
              }, null, 2)}
            </pre>
          </Modal>
        )}
      </div>
    </div>
  );
}
