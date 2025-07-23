import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { render } from "https://esm.sh/preact-render-to-string@6.2.2";
import SyntaxHighlighter, { CodeFile } from "./SyntaxHighlighter.tsx";

Deno.test("SyntaxHighlighter renders single file correctly", () => {
  const testFiles: CodeFile[] = [
    {
      filename: "Button.tsx",
      content: `import { Button } from "@suppers/ui-lib";

export default function MyButton() {
  return <Button>Click me</Button>;
}`,
      language: "tsx",
    },
  ];

  const html = render(
    <SyntaxHighlighter
      files={testFiles}
      title="Button Example"
      showCopy={true}
    />,
  );

  // Check that the component renders
  assertExists(html);

  // Check that the title is included
  assertEquals(html.includes("Button Example"), true);

  // Check that the filename is included
  assertEquals(html.includes("Button.tsx"), true);

  // Check that the code content is included
  assertEquals(html.includes("Click me"), true);
});

Deno.test("SyntaxHighlighter renders multiple files with tabs", () => {
  const testFiles: CodeFile[] = [
    {
      filename: "Button.tsx",
      content: `export default function Button() { return <button>Click</button>; }`,
      language: "tsx",
    },
    {
      filename: "styles.css",
      content: `.button { color: blue; }`,
      language: "css",
    },
  ];

  const html = render(
    <SyntaxHighlighter
      files={testFiles}
      title="Multi-file Example"
    />,
  );

  // Check that both filenames are included (as tabs)
  assertEquals(html.includes("Button.tsx"), true);
  assertEquals(html.includes("styles.css"), true);

  // Check that both file contents are present
  assertEquals(html.includes("Click"), true);
  assertEquals(html.includes("color: blue"), true);
});

Deno.test("SyntaxHighlighter handles empty files array", () => {
  const html = render(
    <SyntaxHighlighter
      files={[]}
      title="Empty Example"
    />,
  );

  // Should render error message
  assertEquals(html.includes("No code files provided"), true);
});
