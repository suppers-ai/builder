import { DateInput } from "@suppers/ui-lib";

export default function DateInputPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Date Input Component</h1>
        <p>Date input component for selecting date values</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Date Input</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DateInput />
                <DateInput value="2023-12-25" />
                <DateInput placeholder="Select date" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DateInput size="xs" placeholder="Extra small" />
                <DateInput size="sm" placeholder="Small" />
                <DateInput size="md" placeholder="Medium (default)" />
                <DateInput size="lg" placeholder="Large" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DateInput color="primary" placeholder="Primary" />
                <DateInput color="secondary" placeholder="Secondary" />
                <DateInput color="accent" placeholder="Accent" />
                <DateInput color="success" placeholder="Success" />
                <DateInput color="warning" placeholder="Warning" />
                <DateInput color="error" placeholder="Error" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DateInput bordered placeholder="Bordered (default)" />
                <DateInput ghost placeholder="Ghost" />
                <DateInput bordered={false} placeholder="No border" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DateInput disabled placeholder="Disabled" />
                <DateInput required placeholder="Required" />
                <DateInput value="2023-12-25" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Constraints</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <DateInput min="2023-01-01" max="2023-12-31" placeholder="2023 only" />
                <DateInput min="2023-06-01" placeholder="From June 2023" />
                <DateInput max="2023-12-31" placeholder="Until 2023" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
