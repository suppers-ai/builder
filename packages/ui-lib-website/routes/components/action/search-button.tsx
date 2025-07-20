import { type PageProps } from "fresh";
import { ComponentPageTemplate, SearchButton } from "@suppers/ui-lib";

export default function SearchButtonDemo(props: PageProps) {
  if (props.state) {
    (props.state as any).title = "SearchButton - DaisyUI Component Library";
  }

  const examples = [
    {
      title: "Basic Search Button",
      description: "Search button with icon",
      code: `<SearchButton onClick={() => console.log('Search clicked')} />`,
      preview: (
        <div class="flex gap-4">
          <SearchButton onClick={() => console.log("Search clicked")} />
        </div>
      ),
    },
  ];

  return (
    <ComponentPageTemplate
      title="SearchButton"
      description="Search button component with keyboard shortcut support"
      category="Actions"
      examples={examples}
    />
  );
}
