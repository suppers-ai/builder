import { TimeInput } from "@suppers/ui-lib";

export default function TimeInputPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Time Input Component</h1>
        <p>Time input component for selecting time values</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Time Input</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <TimeInput />
                <TimeInput value="14:30" />
                <TimeInput placeholder="Select time" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <TimeInput size="xs" placeholder="Extra small" />
                <TimeInput size="sm" placeholder="Small" />
                <TimeInput size="md" placeholder="Medium (default)" />
                <TimeInput size="lg" placeholder="Large" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <TimeInput color="primary" placeholder="Primary" />
                <TimeInput color="secondary" placeholder="Secondary" />
                <TimeInput color="accent" placeholder="Accent" />
                <TimeInput color="success" placeholder="Success" />
                <TimeInput color="warning" placeholder="Warning" />
                <TimeInput color="error" placeholder="Error" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <TimeInput bordered placeholder="Bordered (default)" />
                <TimeInput ghost placeholder="Ghost" />
                <TimeInput bordered={false} placeholder="No border" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <TimeInput disabled placeholder="Disabled" />
                <TimeInput required placeholder="Required" />
                <TimeInput value="09:00" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Constraints</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <TimeInput min="09:00" max="17:00" placeholder="9 AM - 5 PM" />
                <TimeInput step="900" placeholder="15 minute intervals" />
                <TimeInput min="12:00" placeholder="Afternoon only" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
