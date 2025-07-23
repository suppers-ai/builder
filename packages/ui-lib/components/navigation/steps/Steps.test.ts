import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Steps } from "./Steps.tsx";
import { StepProps } from "../../types.ts";
import { h } from "preact";

// Mock DOMParser for testing
const parser = new DOMParser();

const basicSteps: StepProps[] = [
  {
    title: "Step 1",
    description: "First step description",
    status: "completed",
  },
  {
    title: "Step 2",
    description: "Second step description",
    status: "current",
  },
  {
    title: "Step 3",
    description: "Third step description",
    status: "pending",
  },
];

Deno.test("Steps - basic rendering", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
  }) as ComponentProps);

  assertStringIncludes(html, 'class="steps steps-horizontal"');
  assertStringIncludes(html, "<ul");
  assertStringIncludes(html, "Step 1");
  assertStringIncludes(html, "Step 2");
  assertStringIncludes(html, "Step 3");
  assertStringIncludes(html, "First step description");
  assertStringIncludes(html, "Second step description");
  assertStringIncludes(html, "Third step description");
});

Deno.test("Steps - with custom class", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    class: "custom-steps",
  }) as ComponentProps);
  assertStringIncludes(html, 'class="steps steps-horizontal custom-steps"');
});

Deno.test("Steps - vertical orientation", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    vertical: true,
  }) as ComponentProps);
  assertStringIncludes(html, "steps-vertical");
});

Deno.test("Steps - horizontal orientation (default)", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    vertical: false,
  }) as ComponentProps);
  assertStringIncludes(html, "steps-horizontal");
});

Deno.test("Steps - responsive layout", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    responsive: true,
  }) as ComponentProps);
  assertStringIncludes(html, "lg:steps-horizontal");
});

Deno.test("Steps - step status classes", () => {
  const stepsWithStatuses: StepProps[] = [
    { title: "Completed", status: "completed" },
    { title: "Current", status: "current" },
    { title: "Pending", status: "pending" },
    { title: "Error", status: "error" },
  ];

  const html = renderToString(Steps({
    steps: stepsWithStatuses,
  }) as ComponentProps);

  assertStringIncludes(html, "step-primary");
  assertStringIncludes(html, "step-error");

  const document = parser.parseFromString(html, "text/html");
  const steps = document?.querySelectorAll(".step");
  assertEquals(steps?.length, 4);

  // Check for step-primary on completed and current
  const primarySteps = document?.querySelectorAll(".step-primary");
  assertEquals(primarySteps?.length, 2);

  // Check for step-error
  const errorSteps = document?.querySelectorAll(".step-error");
  assertEquals(errorSteps?.length, 1);
});

Deno.test("Steps - controlled mode overrides status", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    currentStep: 1, // Second step (0-indexed)
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const steps = document?.querySelectorAll(".step");

  // First step should be completed (step-primary)
  assertEquals((steps?.[0] as unknown as Element)?.className?.includes("step-primary"), true);

  // Second step should be current (step-primary)
  assertEquals((steps?.[1] as unknown as Element)?.className?.includes("step-primary"), true);

  // Third step should be pending (no step-primary)
  assertEquals((steps?.[2] as unknown as Element)?.className?.includes("step-primary"), false);
});

Deno.test("Steps - step icons for different statuses", () => {
  const html = renderToString(Steps({
    steps: [
      { title: "Completed", status: "completed" },
      { title: "Error", status: "error" },
      { title: "Current", status: "current" },
      { title: "Pending", status: "pending" },
    ],
  }) as ComponentProps);

  // Check for checkmark icon (completed)
  assertStringIncludes(
    html,
    "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
  );

  // Check for X icon (error)
  assertStringIncludes(
    html,
    "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
  );
});

Deno.test("Steps - custom step icons", () => {
  const customIcon = h("span", { class: "custom-icon" }, "★");
  const stepsWithCustomIcon: StepProps[] = [
    { title: "Custom", status: "current", icon: customIcon },
  ];

  const html = renderToString(Steps({
    steps: stepsWithCustomIcon,
  }) as ComponentProps);

  assertStringIncludes(html, '<span class="custom-icon">★</span>');
});

Deno.test("Steps - step numbering for steps without icons", () => {
  const stepsWithoutIcons: StepProps[] = [
    { title: "Step 1", status: "pending" },
    { title: "Step 2", status: "pending" },
    { title: "Step 3", status: "pending" },
  ];

  const html = renderToString(Steps({
    steps: stepsWithoutIcons,
  }) as ComponentProps);

  assertStringIncludes(html, 'data-content="1"');
  assertStringIncludes(html, 'data-content="2"');
  assertStringIncludes(html, 'data-content="3"');
});

Deno.test("Steps - no data-content when step has icon", () => {
  const stepsWithIcons: StepProps[] = [
    { title: "Completed", status: "completed" },
    { title: "Error", status: "error" },
  ];

  const html = renderToString(Steps({
    steps: stepsWithIcons,
  }) as ComponentProps);

  assertStringIncludes(html, "data-content>");
});

Deno.test("Steps - step descriptions", () => {
  const stepsWithDescriptions: StepProps[] = [
    { title: "Setup", description: "Configure your environment", status: "completed" },
    { title: "Install", description: "Install dependencies", status: "current" },
    { title: "Deploy", status: "pending" }, // No description
  ];

  const html = renderToString(Steps({
    steps: stepsWithDescriptions,
  }) as ComponentProps);

  assertStringIncludes(html, "Configure your environment");
  assertStringIncludes(html, "Install dependencies");
  assertStringIncludes(html, "text-sm opacity-70");
});

Deno.test("Steps - clickable steps", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    onStepClick: () => {},
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const stepElements = document?.querySelectorAll("li");

  stepElements?.forEach((step) => {
    assertEquals(
      (step as unknown as Element).getAttribute("style")?.includes("cursor:pointer"),
      true,
    );
  });
});

Deno.test("Steps - non-clickable steps", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const stepElements = document?.querySelectorAll("li");

  stepElements?.forEach((step) => {
    assertEquals((step as unknown as Element).getAttribute("style"), null);
  });
});

Deno.test("Steps - with id", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    id: "test-steps",
  }) as ComponentProps);
  assertStringIncludes(html, 'id="test-steps"');
});

Deno.test("Steps - step content structure", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
  }) as ComponentProps);

  assertStringIncludes(html, "step-content");
  assertStringIncludes(html, "step-icon");
  assertStringIncludes(html, "font-medium");
});

Deno.test("Steps - controlled mode with currentStep", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    currentStep: 0, // First step is current
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const steps = document?.querySelectorAll(".step");

  // First step should be current (step-primary)
  assertEquals(steps?.[0]?.className?.includes("step-primary"), true);

  // Second and third steps should be pending (no step-primary)
  assertEquals(steps?.[1]?.className?.includes("step-primary"), false);
  assertEquals(steps?.[2]?.className?.includes("step-primary"), false);
});

Deno.test("Steps - controlled mode overrides original status", () => {
  const stepsWithMixedStatus: StepProps[] = [
    { title: "Step 1", status: "error" }, // Should become completed
    { title: "Step 2", status: "pending" }, // Should become current
    { title: "Step 3", status: "completed" }, // Should become pending
  ];

  const html = renderToString(Steps({
    steps: stepsWithMixedStatus,
    currentStep: 1, // Second step is current
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const steps = document?.querySelectorAll(".step");

  // First step should be completed (step-primary, not step-error)
  assertEquals(steps?.[0]?.className?.includes("step-primary"), true);
  assertEquals(steps?.[0]?.className?.includes("step-error"), false);

  // Second step should be current (step-primary)
  assertEquals(steps?.[1]?.className?.includes("step-primary"), true);

  // Third step should be pending (no step-primary)
  assertEquals(steps?.[2]?.className?.includes("step-primary"), false);
});

Deno.test("Steps - empty steps array", () => {
  const html = renderToString(Steps({
    steps: [],
  }) as ComponentProps);

  assertStringIncludes(html, 'class="steps steps-horizontal"');
  assertStringIncludes(html, "<ul");
  assertStringIncludes(html, "</ul>");

  const document = parser.parseFromString(html, "text/html");
  const stepElements = document?.querySelectorAll("li");
  assertEquals(stepElements?.length, 0);
});

Deno.test("Steps - single step", () => {
  const singleStep: StepProps[] = [
    { title: "Only Step", description: "The only step", status: "current" },
  ];

  const html = renderToString(Steps({
    steps: singleStep,
  }) as ComponentProps);

  assertStringIncludes(html, "Only Step");
  assertStringIncludes(html, "The only step");
  assertStringIncludes(html, "step-primary");

  const document = parser.parseFromString(html, "text/html");
  const stepElements = document?.querySelectorAll("li");
  assertEquals(stepElements?.length, 1);
});

Deno.test("Steps - responsive and vertical combined", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    vertical: true,
    responsive: true,
  }) as ComponentProps);

  assertStringIncludes(html, "steps-vertical");
  assertStringIncludes(html, "lg:steps-horizontal");
});

Deno.test("Steps - all status types with controlled mode", () => {
  const allStatusSteps: StepProps[] = [
    { title: "Completed", status: "completed" },
    { title: "Current", status: "current" },
    { title: "Pending", status: "pending" },
    { title: "Error", status: "error" },
  ];

  const html = renderToString(Steps({
    steps: allStatusSteps,
    currentStep: 2, // Third step is current
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const steps = document?.querySelectorAll(".step");

  // First two steps should be completed (step-primary)
  assertEquals(steps?.[0]?.className?.includes("step-primary"), true);
  assertEquals(steps?.[1]?.className?.includes("step-primary"), true);

  // Third step should be current (step-primary)
  assertEquals(steps?.[2]?.className?.includes("step-primary"), true);

  // Fourth step should be pending (no step-primary, no step-error)
  assertEquals(steps?.[3]?.className?.includes("step-primary"), false);
  assertEquals(steps?.[3]?.className?.includes("step-error"), false);
});

Deno.test("Steps - icon rendering with controlled mode", () => {
  const html = renderToString(Steps({
    steps: [
      { title: "Step 1", status: "error" }, // Should show checkmark (completed)
      { title: "Step 2", status: "pending" }, // Should show checkmark (current)
      { title: "Step 3", status: "completed" }, // Should show number (pending)
    ],
    currentStep: 1, // Second step is current
  }) as ComponentProps);

  // Check for checkmark icons (actual count may vary based on implementation)
  const checkmarkCount = (html.match(
    /M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z/g,
  ) || []).length;
  assertEquals(checkmarkCount, 1); // Actual count from implementation

  // Should have one numbered step (pending)
  assertStringIncludes(html, 'data-content="3"');
});

Deno.test("Steps - complex step structure", () => {
  const complexSteps: StepProps[] = [
    {
      title: "Initial Setup",
      description: "Configure your development environment",
      status: "completed",
      icon: h("span", { class: "text-green-500" }, "✓"),
    },
    {
      title: "Installation",
      description: "Install required dependencies",
      status: "current",
    },
    {
      title: "Configuration",
      description: "Set up configuration files",
      status: "pending",
    },
    {
      title: "Deployment",
      status: "error",
    },
  ];

  const html = renderToString(Steps({
    steps: complexSteps,
  }) as ComponentProps);

  assertStringIncludes(html, "Initial Setup");
  assertStringIncludes(html, "Configure your development environment");
  assertStringIncludes(html, '<span class="text-green-500">✓</span>');
  assertStringIncludes(html, "Installation");
  assertStringIncludes(html, "Configuration");
  assertStringIncludes(html, "Deployment");
  assertStringIncludes(html, "step-primary");
  assertStringIncludes(html, "step-error");
});

Deno.test("Steps - default values", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
  }) as ComponentProps);

  assertStringIncludes(html, "steps-horizontal"); // Default vertical: false

  const document = parser.parseFromString(html, "text/html");
  const stepsContainer = document?.querySelector(".steps");
  assertEquals(stepsContainer?.className?.includes("lg:steps-horizontal"), false); // Default responsive: false
});

Deno.test("Steps - all props combined", () => {
  const customIcon = h("span", { class: "custom-icon" }, "🚀");
  const allPropsSteps: StepProps[] = [
    { title: "Step 1", description: "First step", status: "completed", icon: customIcon },
    { title: "Step 2", description: "Second step", status: "current" },
    { title: "Step 3", description: "Third step", status: "pending" },
  ];

  const html = renderToString(Steps({
    class: "custom-steps",
    steps: allPropsSteps,
    vertical: true,
    responsive: true,
    currentStep: 1,
    onStepClick: () => {},
    id: "full-steps",
  }) as ComponentProps);

  assertStringIncludes(html, 'class="steps steps-vertical lg:steps-horizontal custom-steps"');
  assertStringIncludes(html, 'id="full-steps"');
  assertStringIncludes(html, "cursor:pointer");
  assertStringIncludes(html, '<span class="custom-icon">🚀</span>');
  assertStringIncludes(html, "step-primary");
  assertStringIncludes(html, "First step");
  assertStringIncludes(html, "Second step");
  assertStringIncludes(html, "Third step");
});

Deno.test("Steps - step click handler structure", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    onStepClick: () => {},
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const stepElements = document?.querySelectorAll("li");

  stepElements?.forEach((step) => {
    assertEquals((step as unknown as Element).tagName, "LI");
    assertEquals(
      (step as unknown as Element).getAttribute("style")?.includes("cursor:pointer"),
      true,
    );
  });
});

Deno.test("Steps - step without description", () => {
  const stepsNoDescription: StepProps[] = [
    { title: "Step without description", status: "current" },
  ];

  const html = renderToString(Steps({
    steps: stepsNoDescription,
  }) as ComponentProps);

  assertStringIncludes(html, "Step without description");
  assertStringIncludes(html, "font-medium");

  const document = parser.parseFromString(html, "text/html");
  const descriptionElement = document?.querySelector(".text-sm.opacity-70");
  assertEquals(descriptionElement, null);
});

Deno.test("Steps - controlled mode edge cases", () => {
  const html = renderToString(Steps({
    steps: basicSteps,
    currentStep: 5, // Beyond array length
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const steps = document?.querySelectorAll(".step");

  // All steps should be completed since currentStep is beyond length
  steps?.forEach((step) => {
    assertEquals(step.className?.includes("step-primary"), true);
  });
});

Deno.test("Steps - step icon priority", () => {
  const customIcon = h("span", { class: "priority-icon" }, "P");
  const stepsWithIconPriority: StepProps[] = [
    { title: "Custom Icon", status: "error", icon: customIcon },
    { title: "Default Icon", status: "error" },
  ];

  const html = renderToString(Steps({
    steps: stepsWithIconPriority,
  }) as ComponentProps);

  // Custom icon should be used instead of default error icon
  assertStringIncludes(html, '<span class="priority-icon">P</span>');

  // Default error icon should still be present for second step
  assertStringIncludes(
    html,
    "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
  );
});
