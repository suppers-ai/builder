import { Diff } from "@suppers/ui-lib";

export default function DiffPage() {
  const codeBefore = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

  const codeAfter = `function calculateTotal(items) {
  let total = 0;
  let tax = 0;
  for (const item of items) {
    total += item.price;
    tax += item.price * 0.08;
  }
  return { total, tax, grandTotal: total + tax };
}`;

  const textBefore = `Hello world!
This is a simple document.
It has multiple lines.
Some content here.`;

  const textAfter = `Hello beautiful world!
This is a comprehensive document.
It has multiple lines and sections.
Some updated content here.
New section added.`;

  const configBefore = `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^17.0.0"
  }
}`;

  const configAfter = `{
  "name": "my-app",
  "version": "1.1.0",
  "dependencies": {
    "react": "^18.0.0",
    "preact": "^10.0.0"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build"
  }
}`;

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Diff Component</h1>
        <p>Visual comparison component for showing differences between content, code, and text</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Code Diff</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">JavaScript Function Comparison</h3>
              <p class="text-sm opacity-70 mb-4">
                Click the edit button to modify the content and see real-time differences
              </p>
              <Diff
                oldContent={codeBefore}
                newContent={codeAfter}
                oldLabel="Original Version"
                newLabel="Refactored Version"
                type="split"
                onContentChange={(old, new_) => console.log("Content changed:", { old, new_ })}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Unified Diff View</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">Text Document Changes</h3>
              <p class="text-sm opacity-70 mb-4">
                Traditional unified diff format showing additions and deletions
              </p>
              <Diff
                oldContent={textBefore}
                newContent={textAfter}
                oldLabel="Draft"
                newLabel="Final"
                type="unified"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Configuration Changes</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Split View</h3>
                <Diff
                  oldContent={configBefore}
                  newContent={configAfter}
                  oldLabel="package.json (old)"
                  newLabel="package.json (new)"
                  type="split"
                  size="sm"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Unified View</h3>
                <Diff
                  oldContent={configBefore}
                  newContent={configAfter}
                  oldLabel="Before"
                  newLabel="After"
                  type="unified"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">GitHub-style Diff</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <div class="flex items-center justify-between mb-4">
                <h3 class="card-title">📝 Pull Request #123</h3>
                <div class="flex gap-2">
                  <span class="badge badge-success">+15</span>
                  <span class="badge badge-error">-8</span>
                </div>
              </div>

              <div class="text-sm mb-4">
                <div class="flex items-center gap-2">
                  <div class="avatar avatar-xs">
                    <div class="w-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                      JD
                    </div>
                  </div>
                  <span>john.doe committed 2 hours ago</span>
                </div>
                <p class="mt-1 opacity-70">
                  Refactor: Improve calculation performance and add tax support
                </p>
              </div>

              <Diff
                oldContent={codeBefore}
                newContent={codeAfter}
                oldLabel="src/utils/calculator.js"
                newLabel="src/utils/calculator.js"
                type="split"
              />

              <div class="mt-4 flex justify-end gap-2">
                <button class="btn btn-outline btn-sm">💬 Add Comment</button>
                <button class="btn btn-success btn-sm">✅ Approve</button>
                <button class="btn btn-error btn-sm">❌ Request Changes</button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Sizes</h2>
          <div class="space-y-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Small Size</h3>
                <Diff
                  oldContent="const message = 'Hello';"
                  newContent="const message = 'Hello World!';"
                  size="sm"
                  showLabels={false}
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Large Size</h3>
                <Diff
                  oldContent="function greet() { return 'Hi'; }"
                  newContent="function greet(name) { return `Hello, ${name}!`; }"
                  size="lg"
                  oldLabel="Simple"
                  newLabel="Enhanced"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Documentation Changes</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">📚 README.md Updates</h3>
              <Diff
                oldContent={`# My Project

A simple web application.

## Installation
\`\`\`
npm install
\`\`\`

## Usage
Run the development server.`}
                newContent={`# My Awesome Project

A comprehensive web application built with modern technologies.

## Features
- ⚡ Fast and responsive
- 🎨 Beautiful UI with DaisyUI
- 📱 Mobile-friendly design

## Installation
\`\`\`bash
npm install
npm run setup
\`\`\`

## Usage
Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## Contributing
Please read our contributing guidelines before submitting PRs.`}
                oldLabel="README.md (v1.0)"
                newLabel="README.md (v2.0)"
                type="split"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Version Comparison</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="card-title">API Response</h3>
                  <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
                      v1.0 → v1.1
                    </div>
                  </div>
                </div>

                <Diff
                  oldContent={`{
  "status": "success",
  "data": {
    "users": [
      {"id": 1, "name": "John"}
    ]
  }
}`}
                  newContent={`{
  "status": "success",
  "version": "1.1",
  "data": {
    "users": [
      {"id": 1, "name": "John", "email": "john@example.com"}
    ],
    "meta": {
      "total": 1,
      "page": 1
    }
  }
}`}
                  oldLabel="API v1.0"
                  newLabel="API v1.1"
                  size="xs"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="card-title">CSS Changes</h3>
                  <span class="badge badge-info">Styling</span>
                </div>

                <Diff
                  oldContent={`.button {
  padding: 8px 16px;
  background: blue;
  color: white;
}`}
                  newContent={`.button {
  padding: 12px 24px;
  background: linear-gradient(45deg, blue, purple);
  color: white;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}`}
                  oldLabel="Old Styles"
                  newLabel="Enhanced Styles"
                  size="xs"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Commit History</h2>
          <div class="space-y-4">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center gap-4 mb-4">
                  <div class="avatar">
                    <div class="w-8 rounded-full bg-accent text-accent-content flex items-center justify-center text-xs font-bold">
                      AB
                    </div>
                  </div>
                  <div>
                    <div class="font-semibold">Alice Brown</div>
                    <div class="text-xs opacity-70">3 hours ago • commit abc123f</div>
                  </div>
                  <div class="ml-auto">
                    <span class="badge badge-sm badge-success">+5</span>
                    <span class="badge badge-sm badge-error ml-1">-2</span>
                  </div>
                </div>

                <p class="text-sm mb-4">feat: Add user authentication system</p>

                <Diff
                  oldContent="// TODO: Add authentication"
                  newContent={`import { authenticateUser } from './auth.js';

function login(username, password) {
  return authenticateUser(username, password);
}`}
                  showLabels={false}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Static Display Examples</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Server-safe Display</h3>
                <p class="text-sm opacity-70 mb-4">No JavaScript required</p>
                <Diff
                  oldContent="Hello world"
                  newContent="Hello beautiful world"
                  oldLabel="Before"
                  newLabel="After"
                />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Without Labels</h3>
                <p class="text-sm opacity-70 mb-4">Clean diff view</p>
                <Diff
                  oldContent="const x = 1;"
                  newContent="const x = 2;"
                  showLabels={false}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
