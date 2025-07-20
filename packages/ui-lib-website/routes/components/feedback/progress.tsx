import { ComponentPageTemplate } from "@suppers/ui-lib";
import { Progress } from "@suppers/ui-lib";

export default function ProgressDemo() {
  const examples = [
    {
      title: "Basic Progress",
      description: "Simple progress bars with different values",
      code: `<Progress value={30} max={100} />
<Progress value={70} max={100} />`,
      preview: (
        <div class="space-y-4 w-full">
          <Progress value={0} max={100} />
          <Progress value={30} max={100} />
          <Progress value={70} max={100} />
          <Progress value={100} max={100} />
        </div>
      ),
    },
    {
      title: "Progress Colors",
      description: "Different color variants for various states",
      code: `<Progress value={50} max={100} color="primary" />
<Progress value={75} max={100} color="success" />
<Progress value={25} max={100} color="error" />`,
      preview: (
        <div class="space-y-4 w-full">
          <Progress value={60} max={100} color="primary" />
          <Progress value={80} max={100} color="secondary" />
          <Progress value={45} max={100} color="accent" />
          <Progress value={90} max={100} color="success" />
          <Progress value={35} max={100} color="warning" />
          <Progress value={25} max={100} color="error" />
        </div>
      ),
    },
    {
      title: "Progress Sizes",
      description: "Different heights for various contexts",
      code: `<Progress value={60} max={100} size="lg" color="primary" />`,
      preview: (
        <div class="space-y-4 w-full">
          <Progress value={60} max={100} size="xs" color="primary" />
          <Progress value={60} max={100} size="sm" color="primary" />
          <Progress value={60} max={100} size="md" color="primary" />
          <Progress value={60} max={100} size="lg" color="primary" />
        </div>
      ),
    },
    {
      title: "Progress with Labels",
      description: "Progress bars with descriptive text",
      code: `<div class="w-full">
  <div class="flex justify-between text-sm mb-1">
    <span>Download Progress</span>
    <span>75%</span>
  </div>
  <Progress value={75} max={100} color="primary" />
</div>`,
      preview: (
        <div class="space-y-6 w-full">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Download Progress</span>
              <span>75%</span>
            </div>
            <Progress value={75} max={100} color="primary" />
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Upload Status</span>
              <span>3 of 5 files</span>
            </div>
            <Progress value={3} max={5} color="success" />
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Storage Used</span>
              <span>8.5 GB of 10 GB</span>
            </div>
            <Progress value={85} max={100} color="warning" />
          </div>
        </div>
      ),
    },
    {
      title: "Indeterminate Progress",
      description: "Progress bars for unknown completion time",
      code: `<Progress indeterminate color="primary" />`,
      preview: (
        <div class="space-y-4 w-full">
          <div>
            <div class="text-sm mb-1">Processing...</div>
            <Progress indeterminate color="primary" />
          </div>
          <div>
            <div class="text-sm mb-1">Analyzing data...</div>
            <Progress indeterminate color="secondary" />
          </div>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "value",
      type: "number",
      description: "Current progress value",
      required: true,
    },
    {
      name: "max",
      type: "number",
      default: "100",
      description: "Maximum progress value",
    },
    {
      name: "indeterminate",
      type: "boolean",
      default: "false",
      description: "Show indeterminate/loading state",
    },
    {
      name: "color",
      type: "primary | secondary | accent | success | warning | error | info",
      description: "Progress bar color",
    },
    {
      name: "size",
      type: "xs | sm | md | lg",
      default: "md",
      description: "Progress bar height",
    },
    {
      name: "class",
      type: "string",
      description: "Additional CSS classes",
    },
  ];

  const usageNotes = [
    "Use progress bars for operations with known completion percentage",
    "Include descriptive labels to explain what is progressing",
    "Choose colors that reflect the nature of the operation",
    "Use indeterminate state when completion time is unknown",
    "Update progress values smoothly for better user experience",
    "Consider showing actual values alongside percentages",
    "Progress bars work well in cards, modals, and forms",
  ];

  const accessibilityNotes = [
    "Progress bars should use appropriate ARIA attributes",
    "Provide text alternatives that describe current progress",
    "Use aria-valuenow, aria-valuemin, and aria-valuemax",
    "Include descriptive labels using aria-label or aria-labelledby",
    "Announce progress changes to screen readers",
    "Don't rely solely on color to indicate progress state",
    "Ensure sufficient color contrast for progress indicators",
  ];

  const relatedComponents = [
    { name: "Loading", path: "/components/feedback/loading" },
    { name: "Skeleton", path: "/components/feedback/skeleton" },
    { name: "Alert", path: "/components/feedback/alert" },
    { name: "Badge", path: "/components/display/badge" },
  ];

  return (
    <ComponentPageTemplate
      title="Progress"
      description="Progress bars for showing completion status and loading states"
      category="Feedback"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
