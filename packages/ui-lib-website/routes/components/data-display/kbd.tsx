import { Kbd } from "@suppers/ui-lib";

export default function KbdPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Kbd Component</h1>
        <p>Display keyboard keys and shortcuts with proper styling and accessibility</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Keyboard Keys</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Single Keys</h3>
                <div class="flex flex-wrap gap-2">
                  <Kbd>A</Kbd>
                  <Kbd>Enter</Kbd>
                  <Kbd>Shift</Kbd>
                  <Kbd>Space</Kbd>
                  <Kbd>Esc</Kbd>
                  <Kbd>Tab</Kbd>
                  <Kbd>Alt</Kbd>
                  <Kbd>Ctrl</Kbd>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Interactive Keys</h3>
                <div class="flex flex-wrap gap-2">
                  <Kbd onClick={() => alert("Q pressed!")}>Q</Kbd>
                  <Kbd onClick={() => alert("W pressed!")}>W</Kbd>
                  <Kbd onClick={() => alert("E pressed!")}>E</Kbd>
                  <Kbd onClick={() => alert("R pressed!")}>R</Kbd>
                  <Kbd onClick={() => alert("T pressed!")}>T</Kbd>
                  <Kbd onClick={() => alert("Y pressed!")}>Y</Kbd>
                </div>
                <p class="text-sm opacity-70 mt-2">Click the keys above to trigger actions</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Sizes</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="w-16">Extra Small:</span>
              <Kbd size="xs">Ctrl</Kbd>
              <span>+</span>
              <Kbd size="xs">C</Kbd>
            </div>
            <div class="flex items-center gap-4">
              <span class="w-16">Small:</span>
              <Kbd size="sm">Ctrl</Kbd>
              <span>+</span>
              <Kbd size="sm">V</Kbd>
            </div>
            <div class="flex items-center gap-4">
              <span class="w-16">Medium:</span>
              <Kbd size="md">Ctrl</Kbd>
              <span>+</span>
              <Kbd size="md">Z</Kbd>
            </div>
            <div class="flex items-center gap-4">
              <span class="w-16">Large:</span>
              <Kbd size="lg">Ctrl</Kbd>
              <span>+</span>
              <Kbd size="lg">Y</Kbd>
            </div>
            <div class="flex items-center gap-4">
              <span class="w-16">Extra Large:</span>
              <Kbd size="xl">Enter</Kbd>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Keyboard Shortcuts</h2>
          <div class="grid gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">🎮 Gaming Controls</h3>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-semibold mb-2">Movement</h4>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <Kbd>W</Kbd>
                        <span class="text-sm">Move Forward</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Kbd>A</Kbd>
                        <Kbd>S</Kbd>
                        <Kbd>D</Kbd>
                        <span class="text-sm">Move Left/Back/Right</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Kbd>Space</Kbd>
                        <span class="text-sm">Jump</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 class="font-semibold mb-2">Actions</h4>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <Kbd>E</Kbd>
                        <span class="text-sm">Interact</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Kbd>R</Kbd>
                        <span class="text-sm">Reload</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Kbd>Shift</Kbd>
                        <span class="text-sm">Run/Sprint</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">💻 Development Shortcuts</h3>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-semibold mb-2">Editor</h4>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <Kbd>Ctrl</Kbd>
                        <span>+</span>
                        <Kbd>S</Kbd>
                        <span class="text-sm">Save</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Kbd>Ctrl</Kbd>
                        <span>+</span>
                        <Kbd>F</Kbd>
                        <span class="text-sm">Find</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Kbd>Ctrl</Kbd>
                        <span>+</span>
                        <Kbd>Shift</Kbd>
                        <span>+</span>
                        <Kbd>P</Kbd>
                        <span class="text-sm">Command Palette</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 class="font-semibold mb-2">Navigation</h4>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <Kbd>Ctrl</Kbd>
                        <span>+</span>
                        <Kbd>Tab</Kbd>
                        <span class="text-sm">Switch Tab</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Kbd>Ctrl</Kbd>
                        <span>+</span>
                        <Kbd>`</Kbd>
                        <span class="text-sm">Toggle Terminal</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Kbd>F12</Kbd>
                        <span class="text-sm">Developer Tools</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">System Shortcuts</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">🪟 Windows</h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Kbd size="sm">Win</Kbd>
                    <span>+</span>
                    <Kbd size="sm">L</Kbd>
                    <span class="text-xs">Lock</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Kbd size="sm">Alt</Kbd>
                    <span>+</span>
                    <Kbd size="sm">Tab</Kbd>
                    <span class="text-xs">Switch Apps</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Kbd size="sm">Win</Kbd>
                    <span>+</span>
                    <Kbd size="sm">D</Kbd>
                    <span class="text-xs">Desktop</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">🍎 macOS</h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Kbd size="sm">⌘</Kbd>
                    <span>+</span>
                    <Kbd size="sm">Space</Kbd>
                    <span class="text-xs">Spotlight</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Kbd size="sm">⌘</Kbd>
                    <span>+</span>
                    <Kbd size="sm">Tab</Kbd>
                    <span class="text-xs">Switch Apps</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Kbd size="sm">⌘</Kbd>
                    <span>+</span>
                    <Kbd size="sm">Q</Kbd>
                    <span class="text-xs">Quit App</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">🐧 Linux</h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Kbd size="sm">Ctrl</Kbd>
                    <span>+</span>
                    <Kbd size="sm">Alt</Kbd>
                    <span>+</span>
                    <Kbd size="sm">T</Kbd>
                    <span class="text-xs">Terminal</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Kbd size="sm">Super</Kbd>
                    <span class="text-xs">Activities</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Kbd size="sm">Alt</Kbd>
                    <span>+</span>
                    <Kbd size="sm">F4</Kbd>
                    <span class="text-xs">Close Window</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Special Keys</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Function Keys</h3>
                <div class="flex flex-wrap gap-2">
                  <Kbd>F1</Kbd>
                  <Kbd>F2</Kbd>
                  <Kbd>F3</Kbd>
                  <Kbd>F4</Kbd>
                  <Kbd>F5</Kbd>
                  <Kbd>F6</Kbd>
                  <Kbd>F7</Kbd>
                  <Kbd>F8</Kbd>
                  <Kbd>F9</Kbd>
                  <Kbd>F10</Kbd>
                  <Kbd>F11</Kbd>
                  <Kbd>F12</Kbd>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title">Navigation Keys</h3>
                <div class="grid grid-cols-3 gap-2">
                  <div></div>
                  <Kbd>↑</Kbd>
                  <div></div>
                  <Kbd>←</Kbd>
                  <Kbd>↓</Kbd>
                  <Kbd>→</Kbd>
                </div>
                <div class="flex flex-wrap gap-2 mt-4">
                  <Kbd>Home</Kbd>
                  <Kbd>End</Kbd>
                  <Kbd>PgUp</Kbd>
                  <Kbd>PgDn</Kbd>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Help Documentation</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">📖 Application Help</h3>
              <div class="overflow-x-auto">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Shortcut</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Copy</td>
                      <td>
                        <div class="flex items-center gap-1">
                          <Kbd size="xs">Ctrl</Kbd>
                          <span>+</span>
                          <Kbd size="xs">C</Kbd>
                        </div>
                      </td>
                      <td>Copy selected content to clipboard</td>
                    </tr>
                    <tr>
                      <td>Paste</td>
                      <td>
                        <div class="flex items-center gap-1">
                          <Kbd size="xs">Ctrl</Kbd>
                          <span>+</span>
                          <Kbd size="xs">V</Kbd>
                        </div>
                      </td>
                      <td>Paste content from clipboard</td>
                    </tr>
                    <tr>
                      <td>Undo</td>
                      <td>
                        <div class="flex items-center gap-1">
                          <Kbd size="xs">Ctrl</Kbd>
                          <span>+</span>
                          <Kbd size="xs">Z</Kbd>
                        </div>
                      </td>
                      <td>Undo the last action</td>
                    </tr>
                    <tr>
                      <td>Redo</td>
                      <td>
                        <div class="flex items-center gap-1">
                          <Kbd size="xs">Ctrl</Kbd>
                          <span>+</span>
                          <Kbd size="xs">Y</Kbd>
                        </div>
                      </td>
                      <td>Redo the last undone action</td>
                    </tr>
                    <tr>
                      <td>Select All</td>
                      <td>
                        <div class="flex items-center gap-1">
                          <Kbd size="xs">Ctrl</Kbd>
                          <span>+</span>
                          <Kbd size="xs">A</Kbd>
                        </div>
                      </td>
                      <td>Select all content</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Tutorial Interface</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">🎯 Interactive Tutorial</h3>
              <div class="space-y-6">
                <div class="alert alert-info">
                  <div>
                    <h4 class="font-bold">Step 1: Basic Movement</h4>
                    <p>
                      Use <Kbd size="sm">W</Kbd> <Kbd size="sm">A</Kbd> <Kbd size="sm">S</Kbd>{" "}
                      <Kbd size="sm">D</Kbd> keys to move your character around the map.
                    </p>
                  </div>
                </div>

                <div class="alert alert-success">
                  <div>
                    <h4 class="font-bold">Step 2: Interactions</h4>
                    <p>
                      Press <Kbd size="sm">E</Kbd> when near objects to interact with them, or hold
                      {" "}
                      <Kbd size="sm">F</Kbd> to focus on targets.
                    </p>
                  </div>
                </div>

                <div class="alert alert-warning">
                  <div>
                    <h4 class="font-bold">Step 3: Advanced Controls</h4>
                    <p>
                      Combine <Kbd size="sm">Shift</Kbd> + movement keys to run faster, or use{" "}
                      <Kbd size="sm">Ctrl</Kbd> + <Kbd size="sm">Click</Kbd> for multi-selection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
