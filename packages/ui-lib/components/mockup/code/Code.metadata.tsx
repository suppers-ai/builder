import { ComponentMetadata } from "../../types.ts";
import { CodeMockup } from "./CodeMockup.tsx";

export const codeMetadata: ComponentMetadata = {
  name: "Code",
  description: "Code block mockup",
  category: "Mockup",
  path: "/components/mockup/code",
  tags: ["code", "mockup", "terminal", "syntax", "programming", "editor"],
  examples: ["basic", "with-prefix", "multi-line", "colored", "responsive"],
  relatedComponents: ["browser", "kbd", "diff"],
  preview: (
    <div class="w-80">
      <CodeMockup
        language="javascript"
        filename="example.js"
        code={`function hello() {\n  console.log('Hello World!');\n  return true;\n}`}
        showLineNumbers
      />
    </div>
  ),
};
