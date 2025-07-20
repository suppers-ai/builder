import { ComponentPageTemplate } from "@suppers/ui-lib";
import { Loading } from "@suppers/ui-lib";

export default function LoadingDemo() {
  const examples = [
    {
      title: "Basic Loading",
      description: "Simple loading spinners",
      code: `<Loading />
<Loading size="lg" />`,
      preview: (
        <div class="flex items-center gap-4">
          <Loading />
          <Loading size="sm" />
          <Loading size="lg" />
        </div>
      ),
    },
    {
      title: "Loading Types",
      description: "Different loading animation styles",
      code: `<Loading type="spinner" />
<Loading type="dots" />
<Loading type="ring" />`,
      preview: (
        <div class="flex items-center gap-4">
          <Loading variant="spinner" />
          <Loading variant="dots" />
          <Loading variant="ring" />
          <Loading variant="ball" />
          <Loading variant="bars" />
        </div>
      ),
    },
    {
      title: "Loading Sizes",
      description: "Different sizes from xs to xl",
      code: `<Loading size="xl" type="spinner" />`,
      preview: (
        <div class="flex items-center gap-4">
          <Loading size="xs" variant="spinner" />
          <Loading size="sm" variant="spinner" />
          <Loading size="md" variant="spinner" />
          <Loading size="lg" variant="spinner" />
          <Loading size="xl" variant="spinner" />
        </div>
      ),
    },
    {
      title: "Loading with Text",
      description: "Loading indicators with descriptive text",
      code: `<div class="flex items-center gap-2">
  <Loading size="sm" />
  <span>Loading...</span>
</div>`,
      preview: (
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <Loading size="sm" />
            <span>Loading...</span>
          </div>
          <div class="flex items-center gap-2">
            <Loading size="sm" variant="dots" />
            <span>Saving changes...</span>
          </div>
          <div class="flex items-center gap-2">
            <Loading size="sm" variant="ring" />
            <span>Processing data...</span>
          </div>
        </div>
      ),
    },
    {
      title: "Loading States",
      description: "Loading in different contexts and layouts",
      code: `<div class="card bg-base-100 shadow-xl">
  <div class="card-body items-center text-center">
    <Loading size="lg" />
    <h2 class="card-title">Loading Content</h2>
    <p>Please wait while we fetch your data...</p>
  </div>
</div>`,
      preview: (
        <div class="space-y-4">
          <div class="card bg-base-100 shadow-xl max-w-sm">
            <div class="card-body items-center text-center">
              <Loading size="lg" />
              <h2 class="card-title">Loading Content</h2>
              <p>Please wait while we fetch your data...</p>
            </div>
          </div>
          <div class="alert">
            <Loading size="sm" />
            <span>Uploading file... Please don't close this window.</span>
          </div>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "type",
      type: "spinner | dots | ring | ball | bars",
      default: "spinner",
      description: "Loading animation type",
    },
    {
      name: "size",
      type: "xs | sm | md | lg | xl",
      default: "md",
      description: "Loading indicator size",
    },
    {
      name: "color",
      type: "primary | secondary | accent | neutral | info | success | warning | error",
      description: "Loading indicator color",
    },
    {
      name: "class",
      type: "string",
      description: "Additional CSS classes",
    },
  ];

  const usageNotes = [
    "Use loading indicators for operations that take more than a few seconds",
    "Choose loading types that match your application's design language",
    "Provide context about what is loading when possible",
    "Spinner type is most common and universally understood",
    "Dots type works well for subtle loading states",
    "Ring type provides a modern, minimal appearance",
    "Always include accessible text for screen readers",
  ];

  const accessibilityNotes = [
    "Loading indicators should have appropriate ARIA labels",
    "Use aria-live regions to announce loading state changes",
    "Provide meaningful text descriptions of what is loading",
    "Ensure loading indicators have sufficient color contrast",
    "Consider focus management during loading states",
    "Don't rely solely on visual indicators - provide text alternatives",
    "Loading states should be announced to screen readers",
  ];

  const relatedComponents = [
    { name: "Progress", path: "/components/feedback/progress" },
    { name: "Skeleton", path: "/components/feedback/skeleton" },
    { name: "Alert", path: "/components/feedback/alert" },
    { name: "Button", path: "/components/action/button" },
  ];

  return (
    <ComponentPageTemplate
      title="Loading"
      description="Loading spinners and indicators for asynchronous operations"
      category="Feedback"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
