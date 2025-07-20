import { RadialProgress } from "@suppers/ui-lib";
import { useState } from "preact/hooks";

export default function RadialProgressPage() {
  const [demoValue, setDemoValue] = useState(75);

  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Radial Progress Component</h1>
        <p>Circular progress indicators with smooth animations and customizable styling</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Radial Progress</h2>
          <div class="grid md:grid-cols-4 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <RadialProgress value={25} label="Low" />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <RadialProgress value={50} label="Medium" />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <RadialProgress value={75} label="High" />
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <RadialProgress value={100} label="Complete" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Sizes</h2>
          <div class="flex flex-wrap items-center justify-center gap-8">
            <RadialProgress value={60} size="xs" label="Extra Small" />
            <RadialProgress value={60} size="sm" label="Small" />
            <RadialProgress value={60} size="md" label="Medium" />
            <RadialProgress value={60} size="lg" label="Large" />
            <RadialProgress value={60} size="xl" label="Extra Large" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Color Variants</h2>
          <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div class="text-center">
              <RadialProgress value={70} color="primary" label="Primary" />
            </div>
            <div class="text-center">
              <RadialProgress value={70} color="secondary" label="Secondary" />
            </div>
            <div class="text-center">
              <RadialProgress value={70} color="accent" label="Accent" />
            </div>
            <div class="text-center">
              <RadialProgress value={70} color="neutral" label="Neutral" />
            </div>
            <div class="text-center">
              <RadialProgress value={70} color="info" label="Info" />
            </div>
            <div class="text-center">
              <RadialProgress value={70} color="success" label="Success" />
            </div>
            <div class="text-center">
              <RadialProgress value={70} color="warning" label="Warning" />
            </div>
            <div class="text-center">
              <RadialProgress value={70} color="error" label="Error" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Demo</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <div class="grid md:grid-cols-2 gap-8 items-center">
                <div class="text-center">
                  <RadialProgress
                    value={demoValue}
                    size="xl"
                    color="primary"
                    label="Interactive Progress"
                  />
                </div>
                <div class="space-y-4">
                  <h3 class="text-lg font-bold">Control Progress</h3>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Progress Value: {demoValue}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={demoValue}
                      class="range range-primary"
                      onChange={(e) => setDemoValue(parseInt((e.target as HTMLInputElement).value))}
                    />
                  </div>
                  <div class="flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline" onClick={() => setDemoValue(0)}>
                      0%
                    </button>
                    <button class="btn btn-sm btn-outline" onClick={() => setDemoValue(25)}>
                      25%
                    </button>
                    <button class="btn btn-sm btn-outline" onClick={() => setDemoValue(50)}>
                      50%
                    </button>
                    <button class="btn btn-sm btn-outline" onClick={() => setDemoValue(75)}>
                      75%
                    </button>
                    <button class="btn btn-sm btn-outline" onClick={() => setDemoValue(100)}>
                      100%
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Different Thickness</h2>
          <div class="flex flex-wrap items-center justify-center gap-8">
            <RadialProgress value={65} thickness={2} label="Thin (2px)" />
            <RadialProgress value={65} thickness={4} label="Default (4px)" />
            <RadialProgress value={65} thickness={6} label="Medium (6px)" />
            <RadialProgress value={65} thickness={8} label="Thick (8px)" />
            <RadialProgress value={65} thickness={10} label="Extra Thick (10px)" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Without Value Display</h2>
          <div class="flex flex-wrap items-center justify-center gap-8">
            <RadialProgress value={30} showValue={false} color="info" label="Hidden Value" />
            <RadialProgress value={60} showValue={false} color="success" label="Clean Look" />
            <RadialProgress value={90} showValue={false} color="warning" label="Minimal Style" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Dashboard Example</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <RadialProgress
                  value={85}
                  color="success"
                  size="lg"
                  label="CPU Usage"
                />
                <div class="mt-2">
                  <div class="text-xs opacity-70">8.5 / 10 cores</div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <RadialProgress
                  value={62}
                  color="warning"
                  size="lg"
                  label="Memory"
                />
                <div class="mt-2">
                  <div class="text-xs opacity-70">12.4 / 20 GB</div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <RadialProgress
                  value={45}
                  color="info"
                  size="lg"
                  label="Storage"
                />
                <div class="mt-2">
                  <div class="text-xs opacity-70">450 / 1000 GB</div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <RadialProgress
                  value={92}
                  color="error"
                  size="lg"
                  label="Network"
                />
                <div class="mt-2">
                  <div class="text-xs opacity-70">920 / 1000 Mbps</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Progress Tracking</h2>
          <div class="space-y-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center gap-4">
                  <RadialProgress
                    value={35}
                    color="primary"
                    size="lg"
                    label="Project Alpha"
                  />
                  <div class="flex-1">
                    <h4 class="font-bold">Project Alpha Development</h4>
                    <p class="text-sm opacity-70">Frontend implementation in progress</p>
                    <div class="text-xs mt-1">
                      <span class="badge badge-primary badge-sm mr-2">In Progress</span>
                      <span>Due: Dec 15, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center gap-4">
                  <RadialProgress
                    value={78}
                    color="success"
                    size="lg"
                    label="Beta Testing"
                  />
                  <div class="flex-1">
                    <h4 class="font-bold">Beta Testing Phase</h4>
                    <p class="text-sm opacity-70">User feedback collection and bug fixes</p>
                    <div class="text-xs mt-1">
                      <span class="badge badge-success badge-sm mr-2">On Track</span>
                      <span>Due: Nov 30, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <div class="flex items-center gap-4">
                  <RadialProgress
                    value={100}
                    color="success"
                    size="lg"
                    label="Documentation"
                  />
                  <div class="flex-1">
                    <h4 class="font-bold">Documentation</h4>
                    <p class="text-sm opacity-70">User guides and API documentation</p>
                    <div class="text-xs mt-1">
                      <span class="badge badge-success badge-sm mr-2">Complete</span>
                      <span>Completed: Nov 20, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Skills Assessment</h2>
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title">Technical Skills</h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="flex items-center gap-4">
                    <RadialProgress value={90} color="primary" size="sm" showValue={false} />
                    <span class="flex-1">JavaScript</span>
                    <span class="text-sm font-bold">90%</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <RadialProgress value={85} color="secondary" size="sm" showValue={false} />
                    <span class="flex-1">TypeScript</span>
                    <span class="text-sm font-bold">85%</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <RadialProgress value={75} color="accent" size="sm" showValue={false} />
                    <span class="flex-1">React</span>
                    <span class="text-sm font-bold">75%</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <RadialProgress value={70} color="info" size="sm" showValue={false} />
                    <span class="flex-1">Node.js</span>
                    <span class="text-sm font-bold">70%</span>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="flex items-center gap-4">
                    <RadialProgress value={65} color="success" size="sm" showValue={false} />
                    <span class="flex-1">Python</span>
                    <span class="text-sm font-bold">65%</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <RadialProgress value={80} color="warning" size="sm" showValue={false} />
                    <span class="flex-1">CSS/Tailwind</span>
                    <span class="text-sm font-bold">80%</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <RadialProgress value={60} color="error" size="sm" showValue={false} />
                    <span class="flex-1">Docker</span>
                    <span class="text-sm font-bold">60%</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <RadialProgress value={55} color="neutral" size="sm" showValue={false} />
                    <span class="flex-1">AWS</span>
                    <span class="text-sm font-bold">55%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Static Display Examples</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <h3 class="card-title">Server-safe Display</h3>
                <RadialProgress value={45} size="lg" label="Static Progress" />
                <p class="text-sm opacity-70 mt-2">No JavaScript required</p>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <h3 class="card-title">Custom Thickness</h3>
                <RadialProgress
                  value={75}
                  size="lg"
                  thickness={8}
                  color="success"
                  label="Thick Border"
                />
                <p class="text-sm opacity-70 mt-2">8px thickness</p>
              </div>
            </div>

            <div class="card bg-base-100 shadow-md">
              <div class="card-body items-center text-center">
                <h3 class="card-title">No Value Text</h3>
                <RadialProgress
                  value={60}
                  size="lg"
                  showValue={false}
                  color="accent"
                  label="Clean Style"
                />
                <p class="text-sm opacity-70 mt-2">Value hidden</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
