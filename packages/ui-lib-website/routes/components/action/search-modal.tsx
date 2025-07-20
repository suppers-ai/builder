import { type PageProps } from "fresh";
import { ComponentPageTemplate } from "@suppers/ui-lib";

export default function SearchModalDemo(props: PageProps) {
  if (props.state) {
    (props.state as any).title = "SearchModal - DaisyUI Component Library";
  }

  const examples = [
    {
      title: "Search Modal",
      description: "Full-featured search modal with keyboard navigation",
      code: `// SearchModal is typically used in header layouts
// See HeaderLayout component for usage example`,
      preview: (
        <div class="p-4 text-center">
          <p class="text-base-content/60">SearchModal is integrated into HeaderLayout</p>
          <p class="text-sm text-base-content/40">Press Ctrl/Cmd+K to see it in action</p>
        </div>
      ),
    },
  ];

  return (
    <ComponentPageTemplate
      title="SearchModal"
      description="Full-featured search modal with keyboard navigation and live results"
      category="Actions"
      examples={examples}
    />
  );
}