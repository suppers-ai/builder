import { BaseComponentProps, StepProps } from "../../types.ts";
import { ComponentChildren } from "preact";

export interface StepsProps extends BaseComponentProps {
  steps: StepProps[];
  vertical?: boolean;
  responsive?: boolean;
  // Controlled mode props
  currentStep?: number;
  onStepClick?: (stepIndex: number) => void;
}

export function Steps({
  class: className = "",
  steps,
  vertical = false,
  responsive = false,
  currentStep,
  onStepClick,
  id,
  ...props
}: StepsProps) {
  const stepsClasses = [
    "steps",
    vertical ? "steps-vertical" : "steps-horizontal",
    responsive ? "lg:steps-horizontal" : "",
    className,
  ].filter(Boolean).join(" ");

  // Use controlled mode if currentStep is provided
  const isControlled = currentStep !== undefined;

  const getStepClasses = (status: string, index: number) => {
    const baseClasses = "step";
    const statusClasses = {
      completed: "step-primary",
      current: "step-primary",
      error: "step-error",
      pending: "",
    };

    // Override status based on current step if controlled
    let effectiveStatus = status;
    if (isControlled) {
      if (index < currentStep) {
        effectiveStatus = "completed";
      } else if (index === currentStep) {
        effectiveStatus = "current";
      } else {
        effectiveStatus = "pending";
      }
    }

    return `${baseClasses} ${statusClasses[effectiveStatus as keyof typeof statusClasses] || ""}`;
  };

  const getStepIcon = (status: string, index: number, defaultIcon?: ComponentChildren) => {
    if (defaultIcon) return defaultIcon;

    // Override status based on current step if controlled
    let effectiveStatus = status;
    if (isControlled) {
      if (index < currentStep) {
        effectiveStatus = "completed";
      } else if (index === currentStep) {
        effectiveStatus = "current";
      } else {
        effectiveStatus = "pending";
      }
    }

    switch (effectiveStatus) {
      case "completed":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (onStepClick) {
      onStepClick(stepIndex);
    }
  };

  const isClickable = !!onStepClick;

  return (
    <ul class={stepsClasses} id={id} {...props}>
      {steps.map((step, index) => (
        <li
          key={index}
          class={getStepClasses(step.status, index)}
          data-content={getStepIcon(step.status, index, step.icon) ? "" : (index + 1).toString()}
          onClick={isClickable ? () => handleStepClick(index) : undefined}
          style={isClickable ? { cursor: "pointer" } : {}}
        >
          <div class="step-content">
            {getStepIcon(step.status, index, step.icon) && (
              <div class="step-icon">
                {getStepIcon(step.status, index, step.icon)}
              </div>
            )}
            <div>
              <div class="font-medium">{step.title}</div>
              {step.description && <div class="text-sm opacity-70">{step.description}</div>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
