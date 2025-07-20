import { CodeMockup } from "@suppers/ui-lib";

export default function CodeMockupDemo() {
  return (
    <div class="min-h-screen bg-base-100 p-8">
      <div class="max-w-6xl mx-auto space-y-12">
        <header class="text-center">
          <h1 class="text-4xl font-bold mb-4">Code Mockup Component</h1>
          <p class="text-lg opacity-70">
            DaisyUI Code Mockup component for displaying code snippets
          </p>
        </header>

        {/* Basic Code Mockup */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Basic Code Mockup</h2>
          <CodeMockup>
            <pre data-prefix="$"><code>npm install daisyui</code></pre>
            <pre data-prefix=">"><code>Installing...</code></pre>
            <pre data-prefix=">"><code>Success! Installed daisyui</code></pre>
          </CodeMockup>
        </section>

        {/* Code Mockup with Different Prefixes */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Code Mockup with Different Prefixes</h2>
          <CodeMockup>
            <pre data-prefix="$"><code>npm create fresh@latest</code></pre>
            <pre data-prefix=">"><code>Creating new Fresh project...</code></pre>
            <pre data-prefix=">"><code>Installing dependencies...</code></pre>
            <pre data-prefix="✓"><code>Project created successfully!</code></pre>
            <pre data-prefix="→"><code>cd my-fresh-app</code></pre>
            <pre data-prefix="$"><code>deno task start</code></pre>
          </CodeMockup>
        </section>

        {/* Code Mockup with TypeScript */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Code Mockup with TypeScript</h2>
          <CodeMockup>
            <pre data-prefix="1"><code>interface User {`{`}</code></pre>
            <pre data-prefix="2"><code>  id: number;</code></pre>
            <pre data-prefix="3"><code>  name: string;</code></pre>
            <pre data-prefix="4"><code>  email: string;</code></pre>
            <pre data-prefix="5"><code>{`}`}</code></pre>
            <pre data-prefix="6"><code></code></pre>
            <pre data-prefix="7"><code>const user: User = {`{`}</code></pre>
            <pre data-prefix="8"><code>  id: 1,</code></pre>
            <pre data-prefix="9"><code>  name: "John Doe",</code></pre>
            <pre data-prefix="10"><code>  email: "john@example.com"</code></pre>
            <pre data-prefix="11"><code>{`}`};</code></pre>
          </CodeMockup>
        </section>

        {/* Code Mockup with Git Commands */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Code Mockup with Git Commands</h2>
          <CodeMockup>
            <pre data-prefix="$"><code>git init</code></pre>
            <pre data-prefix=">"><code>Initialized empty Git repository</code></pre>
            <pre data-prefix="$"><code>git add .</code></pre>
            <pre data-prefix="$"><code>git commit -m "Initial commit"</code></pre>
            <pre data-prefix=">"><code>[main (root-commit) a1b2c3d] Initial commit</code></pre>
            <pre data-prefix=">"><code>5 files changed, 100 insertions(+)</code></pre>
          </CodeMockup>
        </section>

        {/* Code Mockup with Errors */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Code Mockup with Errors</h2>
          <CodeMockup>
            <pre data-prefix="$"><code>deno run app.ts</code></pre>
            <pre
              data-prefix="❌"
              class="text-error"
            ><code>error: Uncaught ReferenceError: foo is not defined</code></pre>
            <pre data-prefix="" class="text-error"><code>    at file:///app.ts:5:13</code></pre>
            <pre data-prefix="$"><code>deno run --allow-read app.ts</code></pre>
            <pre data-prefix="✅" class="text-success"><code>App running successfully!</code></pre>
          </CodeMockup>
        </section>

        {/* Code Mockup with JSON */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Code Mockup with JSON</h2>
          <CodeMockup>
            <pre data-prefix="1"><code>{`{`}</code></pre>
            <pre data-prefix="2"><code>  "name": "my-app",</code></pre>
            <pre data-prefix="3"><code>  "version": "1.0.0",</code></pre>
            <pre data-prefix="4"><code>  "scripts": {`{`}</code></pre>
            <pre data-prefix="5"><code>    "start": "deno run --allow-all main.ts",</code></pre>
            <pre data-prefix="6"><code>    "dev": "deno run --allow-all --watch main.ts"</code></pre>
            <pre data-prefix="7"><code>  {`}`}</code></pre>
            <pre data-prefix="8"><code>{`}`}</code></pre>
          </CodeMockup>
        </section>

        {/* Usage Examples */}
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold">Usage Examples</h2>
          <div class="bg-base-200 p-6 rounded-box">
            <h3 class="text-lg font-medium mb-4">Code Examples</h3>
            <div class="space-y-4">
              <div class="mockup-code">
                <pre data-prefix="$"><code>// Basic Code Mockup</code></pre>
                <pre data-prefix=">"><code>{'<CodeMockup><pre data-prefix="$"><code>npm install</code></pre></CodeMockup>'}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
