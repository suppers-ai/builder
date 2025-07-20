import { Tooltip } from "@suppers/ui-lib";

export default function TooltipPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Tooltip Component</h1>
        <p>Hover tooltips for providing additional information</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Positions</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Tooltip tip="Top tooltip" position="top">
              <button class="btn btn-primary">Top</button>
            </Tooltip>
            <Tooltip tip="Bottom tooltip" position="bottom">
              <button class="btn btn-primary">Bottom</button>
            </Tooltip>
            <Tooltip tip="Left tooltip" position="left">
              <button class="btn btn-primary">Left</button>
            </Tooltip>
            <Tooltip tip="Right tooltip" position="right">
              <button class="btn btn-primary">Right</button>
            </Tooltip>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="flex flex-wrap gap-4">
            <Tooltip tip="Primary tooltip" color="primary">
              <button class="btn btn-outline">Primary</button>
            </Tooltip>
            <Tooltip tip="Secondary tooltip" color="secondary">
              <button class="btn btn-outline">Secondary</button>
            </Tooltip>
            <Tooltip tip="Accent tooltip" color="accent">
              <button class="btn btn-outline">Accent</button>
            </Tooltip>
            <Tooltip tip="Success tooltip" color="success">
              <button class="btn btn-outline">Success</button>
            </Tooltip>
            <Tooltip tip="Warning tooltip" color="warning">
              <button class="btn btn-outline">Warning</button>
            </Tooltip>
            <Tooltip tip="Error tooltip" color="error">
              <button class="btn btn-outline">Error</button>
            </Tooltip>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Always Open</h2>
          <div class="flex gap-4">
            <Tooltip tip="This tooltip is always visible" open>
              <button class="btn btn-ghost">Always Open</button>
            </Tooltip>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">With Different Elements</h2>
          <div class="flex flex-wrap gap-4 items-center">
            <Tooltip tip="Tooltip on avatar">
              <div class="avatar">
                <div class="w-12 rounded-full">
                  <img
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    alt="Avatar"
                  />
                </div>
              </div>
            </Tooltip>

            <Tooltip tip="Tooltip on badge">
              <div class="badge badge-primary">Badge</div>
            </Tooltip>

            <Tooltip
              tip="This is helpful information about this input field"
              position="bottom"
            >
              <input type="text" placeholder="Hover me" class="input input-bordered" />
            </Tooltip>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive Tooltips</h2>
          <div class="flex gap-4">
            <Tooltip
              tip="Interactive tooltip with callbacks"
              onShow={() => console.log("Tooltip shown")}
              onHide={() => console.log("Tooltip hidden")}
            >
              <button class="btn btn-secondary">Hover with Logging</button>
            </Tooltip>

            <Tooltip
              tip="Long tooltip text that demonstrates how tooltips can handle multiple lines of content gracefully"
              position="bottom"
            >
              <button class="btn btn-accent">Long Content</button>
            </Tooltip>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Tooltip Grid Example</h2>
          <div class="grid grid-cols-3 gap-4 max-w-md">
            <Tooltip tip="Top Left" position="top">
              <div class="card bg-base-200 p-4 text-center cursor-pointer">TL</div>
            </Tooltip>
            <Tooltip tip="Top Center" position="top">
              <div class="card bg-base-200 p-4 text-center cursor-pointer">TC</div>
            </Tooltip>
            <Tooltip tip="Top Right" position="top">
              <div class="card bg-base-200 p-4 text-center cursor-pointer">TR</div>
            </Tooltip>
            <Tooltip tip="Middle Left" position="left">
              <div class="card bg-base-200 p-4 text-center cursor-pointer">ML</div>
            </Tooltip>
            <Tooltip tip="Center" position="top">
              <div class="card bg-primary text-primary-content p-4 text-center cursor-pointer">
                C
              </div>
            </Tooltip>
            <Tooltip tip="Middle Right" position="right">
              <div class="card bg-base-200 p-4 text-center cursor-pointer">MR</div>
            </Tooltip>
            <Tooltip tip="Bottom Left" position="bottom">
              <div class="card bg-base-200 p-4 text-center cursor-pointer">BL</div>
            </Tooltip>
            <Tooltip tip="Bottom Center" position="bottom">
              <div class="card bg-base-200 p-4 text-center cursor-pointer">BC</div>
            </Tooltip>
            <Tooltip tip="Bottom Right" position="bottom">
              <div class="card bg-base-200 p-4 text-center cursor-pointer">BR</div>
            </Tooltip>
          </div>
        </section>
      </div>
    </div>
  );
}
