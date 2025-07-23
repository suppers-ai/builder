import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { CodeMockup } from "./CodeMockup.tsx";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("CodeMockup - basic rendering with default code", () => {
  const html = renderToString(CodeMockup({}));

  assertStringIncludes(html, 'class="mockup-code"');
  assertStringIncludes(html, "console.log('Hello World!');");
  assertStringIncludes(html, "<pre");
  assertStringIncludes(html, "<code>");
});

Deno.test("CodeMockup - with custom code", () => {
  const customCode = `function greet(name) {
  return \`Hello, \${name}!\`;
}`;

  const html = renderToString(CodeMockup({
    code: customCode,
  }));

  assertStringIncludes(html, "function greet(name)");
  assertStringIncludes(html, "return `Hello, ${name}!`;");
});

Deno.test("CodeMockup - with custom class", () => {
  const html = renderToString(CodeMockup({
    class: "custom-code-mockup",
  }));
  assertStringIncludes(html, 'class="mockup-code custom-code-mockup"');
});

Deno.test("CodeMockup - language variants", () => {
  const languages = ["javascript", "typescript", "python", "html", "css", "json", "bash", "sql"];

  languages.forEach((language) => {
    const html = renderToString(CodeMockup({
      language: language as 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json' | 'bash' | 'sql',
      code: "// Test code",
    }));

    // Language prop exists but doesn't affect rendering currently
    assertStringIncludes(html, "mockup-code");
    assertStringIncludes(html, "// Test code");
  });
});

Deno.test("CodeMockup - variant styles", () => {
  const defaultHtml = renderToString(CodeMockup({
    variant: "default",
  }));

  const darkHtml = renderToString(CodeMockup({
    variant: "dark",
  }));

  const terminalHtml = renderToString(CodeMockup({
    variant: "terminal",
  }));

  assertStringIncludes(defaultHtml, 'class="mockup-code"');
  assertStringIncludes(darkHtml, "bg-neutral text-neutral-content");
  assertStringIncludes(terminalHtml, "bg-black text-green-400");
});

Deno.test("CodeMockup - with line numbers", () => {
  const multiLineCode = `const x = 1;
const y = 2;
const sum = x + y;`;

  const html = renderToString(CodeMockup({
    code: multiLineCode,
    showLineNumbers: true,
  }));

  assertStringIncludes(html, 'data-prefix="1"');
  assertStringIncludes(html, 'data-prefix="2"');
  assertStringIncludes(html, 'data-prefix="3"');
});

Deno.test("CodeMockup - without line numbers", () => {
  const multiLineCode = `line 1
line 2`;

  const html = renderToString(CodeMockup({
    code: multiLineCode,
    showLineNumbers: false,
  }));

  assertStringIncludes(html, "data-prefix"); // Empty data-prefix attribute
  const document = parser.parseFromString(html, "text/html");
  const prefixedElements = document?.querySelectorAll('[data-prefix="1"]');
  assertEquals(prefixedElements?.length, 0);
});

Deno.test("CodeMockup - terminal variant with prefix", () => {
  const html = renderToString(CodeMockup({
    code: "npm install react",
    variant: "terminal",
  }));

  assertStringIncludes(html, "bg-black text-green-400");
  assertStringIncludes(html, 'data-prefix="$"');
  assertStringIncludes(html, "npm install react");
});

Deno.test("CodeMockup - with filename", () => {
  const html = renderToString(CodeMockup({
    code: "export default function App() {}",
    filename: "App.tsx",
  }));

  assertStringIncludes(html, '<div class="px-4 py-2 bg-base-300 border-b text-sm font-medium">');
  assertStringIncludes(html, "App.tsx");
});

Deno.test("CodeMockup - without filename", () => {
  const html = renderToString(CodeMockup({
    code: "test code",
  }));

  const document = parser.parseFromString(html, "text/html");
  const filenameHeader = document?.querySelector(".bg-base-300");
  assertEquals(filenameHeader, null);
});

Deno.test("CodeMockup - multiline code rendering", () => {
  const multiLineCode = `import React from 'react';

function Component() {
  const [state, setState] = useState(false);
  
  return (
    <div>
      <h1>Title</h1>
      <button onClick={() => setState(!state)}>
        Toggle
      </button>
    </div>
  );
}

export default Component;`;

  const html = renderToString(CodeMockup({
    code: multiLineCode,
    showLineNumbers: true,
  }));

  assertStringIncludes(html, "import React from 'react';");
  assertStringIncludes(html, "function Component()");
  assertStringIncludes(html, "useState(false)");
  assertStringIncludes(html, "export default Component;");

  const document = parser.parseFromString(html, "text/html");
  const preElements = document?.querySelectorAll("pre");
  assertEquals(preElements?.length, 16); // 16 lines of code including empty lines
});

Deno.test("CodeMockup - empty code", () => {
  const html = renderToString(CodeMockup({
    code: "",
  }));

  const document = parser.parseFromString(html, "text/html");
  const codeElement = document?.querySelector("code");
  assertEquals(codeElement?.textContent, "");
});

Deno.test("CodeMockup - single line code", () => {
  const html = renderToString(CodeMockup({
    code: "const greeting = 'Hello World!';",
    showLineNumbers: true,
  }));

  assertStringIncludes(html, 'data-prefix="1"');
  assertStringIncludes(html, "const greeting = 'Hello World!';");

  const document = parser.parseFromString(html, "text/html");
  const preElements = document?.querySelectorAll("pre");
  assertEquals(preElements?.length, 1);
});

Deno.test("CodeMockup - code with special characters", () => {
  const specialCode = `const obj = { key: "value" };
const html = \`<div class="test">\${obj.key}</div>\`;
const regex = /[a-zA-Z]+/g;`;

  const html = renderToString(CodeMockup({
    code: specialCode,
  }));

  assertStringIncludes(html, "const obj = { key: &quot;value&quot; };"); // HTML entities
  assertStringIncludes(html, "`&lt;div class=&quot;test&quot;>${obj.key}&lt;/div>`"); // HTML entities
  assertStringIncludes(html, "/[a-zA-Z]+/g;");
});

Deno.test("CodeMockup - default values", () => {
  const html = renderToString(CodeMockup({}));

  // Default: code="console.log('Hello World!');", language="javascript", showLineNumbers=false, variant="default"
  assertStringIncludes(html, "console.log('Hello World!');");
  assertStringIncludes(html, 'class="mockup-code"');
  assertStringIncludes(html, "data-prefix"); // Empty data-prefix attribute

  const document = parser.parseFromString(html, "text/html");
  const mockup = document?.querySelector(".mockup-code");
  assertEquals(mockup?.className?.includes("bg-neutral"), false);
  assertEquals(mockup?.className?.includes("bg-black"), false);
});

Deno.test("CodeMockup - all props combined", () => {
  const complexCode = `#!/bin/bash
echo "Starting deployment..."
npm run build
docker build -t myapp .
docker run -p 3000:3000 myapp`;

  const html = renderToString(CodeMockup({
    code: complexCode,
    language: "bash",
    showLineNumbers: true,
    variant: "dark",
    filename: "deploy.sh",
    class: "deployment-script",
  }));

  assertStringIncludes(
    html,
    'class="mockup-code bg-neutral text-neutral-content deployment-script"',
  );
  assertStringIncludes(html, "deploy.sh");
  assertStringIncludes(html, "#!/bin/bash");
  assertStringIncludes(html, "docker build -t myapp .");
  assertStringIncludes(html, 'data-prefix="1"');
  assertStringIncludes(html, 'data-prefix="5"');
});
