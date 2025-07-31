/**
 * Generation Progress Island
 * Real-time progress tracking for application generation
 */

import { useSignal, useSignalEffect } from "@preact/signals";
import { Alert, Button, Card, Progress } from "@suppers/ui-lib";
import type { GenerationResult } from "@suppers/shared";

export interface GenerationProgressProps {
  /** Whether generation is currently active */
  isGenerating: boolean;
  /** Current generation progress (0-100) */
  progress: number;
  /** Current generation step description */
  currentStep: string;
  /** Generation result when completed */
  result?: GenerationResult;
  /** Callback when user wants to start over */
  onStartOver?: () => void;
  /** Callback when user wants to download result */
  onDownload?: (result: GenerationResult) => void;
}

export interface GenerationStep {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "pending" | "active" | "completed" | "error";
  error?: string;
}

export default function GenerationProgress({
  isGenerating,
  progress,
  currentStep,
  result,
  onStartOver,
  onDownload,
}: GenerationProgressProps) {
  const steps = useSignal<GenerationStep[]>([
    {
      id: "validation",
      name: "Validation",
      description: "Validating application specification",
      progress: 0,
      status: "pending",
    },
    {
      id: "setup",
      name: "Setup",
      description: "Setting up project structure",
      progress: 0,
      status: "pending",
    },
    {
      id: "generation",
      name: "Generation",
      description: "Generating application files",
      progress: 0,
      status: "pending",
    },
    {
      id: "finalization",
      name: "Finalization",
      description: "Finalizing and packaging application",
      progress: 0,
      status: "pending",
    },
  ]);

  // Update steps based on current progress
  useSignalEffect(() => {
    const newSteps = [...steps.value];

    if (progress >= 0 && progress < 25) {
      newSteps[0].status = "active";
      newSteps[0].progress = (progress / 25) * 100;
    } else if (progress >= 25 && progress < 50) {
      newSteps[0].status = "completed";
      newSteps[0].progress = 100;
      newSteps[1].status = "active";
      newSteps[1].progress = ((progress - 25) / 25) * 100;
    } else if (progress >= 50 && progress < 75) {
      newSteps[0].status = "completed";
      newSteps[0].progress = 100;
      newSteps[1].status = "completed";
      newSteps[1].progress = 100;
      newSteps[2].status = "active";
      newSteps[2].progress = ((progress - 50) / 25) * 100;
    } else if (progress >= 75 && progress < 100) {
      newSteps[0].status = "completed";
      newSteps[0].progress = 100;
      newSteps[1].status = "completed";
      newSteps[1].progress = 100;
      newSteps[2].status = "completed";
      newSteps[2].progress = 100;
      newSteps[3].status = "active";
      newSteps[3].progress = ((progress - 75) / 25) * 100;
    } else if (progress >= 100) {
      newSteps.forEach((step) => {
        step.status = "completed";
        step.progress = 100;
      });
    }

    steps.value = newSteps;
  });

  // Handle generation errors
  useSignalEffect(() => {
    if (result && !result.success && result.errors) {
      const newSteps = [...steps.value];
      const activeStep = newSteps.find((step) => step.status === "active");
      if (activeStep) {
        activeStep.status = "error";
        activeStep.error = result.errors[0];
      }
      steps.value = newSteps;
    }
  });

  const getStepIcon = (step: GenerationStep) => {
    switch (step.status) {
      case "completed":
        return "✅";
      case "active":
        return "⏳";
      case "error":
        return "❌";
      default:
        return "⏸️";
    }
  };

  const getStepClass = (step: GenerationStep) => {
    switch (step.status) {
      case "completed":
        return "text-success";
      case "active":
        return "text-primary";
      case "error":
        return "text-error";
      default:
        return "text-base-content/50";
    }
  };

  return (
    <div class="w-full max-w-2xl mx-auto space-y-6">
      {/* Overall Progress */}
      <Card>
        <div class="card-body">
          <h3 class="card-title">
            {isGenerating
              ? "Generating Application..."
              : result?.success
              ? "Generation Complete!"
              : "Generation Failed"}
          </h3>

          <div class="space-y-4">
            <Progress
              value={progress}
              max={100}
              class={`progress ${
                result?.success
                  ? "progress-success"
                  : result && !result.success
                  ? "progress-error"
                  : "progress-primary"
              }`}
            />

            <div class="flex justify-between text-sm">
              <span class="text-base-content/70">{currentStep}</span>
              <span class="font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Steps */}
      <Card>
        <div class="card-body">
          <h4 class="font-semibold mb-4">Generation Steps</h4>

          <div class="space-y-3">
            {steps.value.map((step) => (
              <div key={step.id} class={`flex items-center space-x-3 ${getStepClass(step)}`}>
                <span class="text-lg">{getStepIcon(step)}</span>

                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{step.name}</span>
                    {step.status === "active" && (
                      <span class="text-xs">{Math.round(step.progress)}%</span>
                    )}
                  </div>

                  <p class="text-sm opacity-70">{step.description}</p>

                  {step.status === "active" && (
                    <Progress
                      value={step.progress}
                      max={100}
                      class="progress progress-primary progress-xs mt-1"
                    />
                  )}

                  {step.error && (
                    <Alert variant="error" class="mt-2">
                      <span class="text-sm">{step.error}</span>
                    </Alert>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Result Display */}
      {result && (
        <Card>
          <div class="card-body">
            {result.success
              ? (
                <div class="space-y-4">
                  <Alert variant="success">
                    <div>
                      <h4 class="font-semibold">Application Generated Successfully!</h4>
                      <p class="text-sm mt-1">
                        Your application "{result.applicationName}" has been generated and is ready
                        to use.
                      </p>
                    </div>
                  </Alert>

                  <div class="bg-base-200 rounded-lg p-4">
                    <h5 class="font-medium mb-2">Generated Application Details</h5>
                    <div class="space-y-1 text-sm">
                      <div>
                        <strong>Name:</strong> {result.applicationName}
                      </div>
                      <div>
                        <strong>Output Path:</strong> {result.outputPath}
                      </div>
                    </div>
                  </div>

                  {result.warnings && result.warnings.length > 0 && (
                    <Alert variant="warning">
                      <div>
                        <h5 class="font-medium">Warnings</h5>
                        <ul class="text-sm mt-1 list-disc list-inside">
                          {result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                        </ul>
                      </div>
                    </Alert>
                  )}

                  <div class="flex gap-2">
                    {onDownload && (
                      <Button
                        variant="primary"
                        onClick={() => onDownload(result)}
                      >
                        Download Application
                      </Button>
                    )}

                    {onStartOver && (
                      <Button
                        variant="ghost"
                        onClick={onStartOver}
                      >
                        Generate Another
                      </Button>
                    )}
                  </div>
                </div>
              )
              : (
                <div class="space-y-4">
                  <Alert variant="error">
                    <div>
                      <h4 class="font-semibold">Generation Failed</h4>
                      <p class="text-sm mt-1">
                        There was an error generating your application. Please review the errors
                        below and try again.
                      </p>
                    </div>
                  </Alert>

                  {result.errors && result.errors.length > 0 && (
                    <div class="bg-error/10 border border-error/20 rounded-lg p-4">
                      <h5 class="font-medium text-error mb-2">Errors</h5>
                      <ul class="space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index} class="text-sm text-error/80 flex items-start">
                            <span class="mr-2">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div class="space-y-2">
                    <h5 class="font-medium">Common Solutions</h5>
                    <ul class="text-sm space-y-1 text-base-content/70">
                      <li>• Check that all required fields are filled out correctly</li>
                      <li>
                        • Ensure your application name contains only letters, numbers, and hyphens
                      </li>
                      <li>• Verify that all selected components are available</li>
                      <li>• Try using a different application name if there's a conflict</li>
                    </ul>
                  </div>

                  {onStartOver && (
                    <Button
                      variant="primary"
                      onClick={onStartOver}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              )}
          </div>
        </Card>
      )}
    </div>
  );
}
