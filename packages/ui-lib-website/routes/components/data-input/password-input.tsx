import { PasswordInput } from "@suppers/ui-lib";

export default function PasswordInputPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Password Input Component</h1>
        <p>Password input component with visibility toggle</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Basic Password Input</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <PasswordInput />
                <PasswordInput value="password123" />
                <PasswordInput placeholder="Enter password" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <PasswordInput size="xs" placeholder="Extra small" />
                <PasswordInput size="sm" placeholder="Small" />
                <PasswordInput size="md" placeholder="Medium (default)" />
                <PasswordInput size="lg" placeholder="Large" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <PasswordInput color="primary" placeholder="Primary" />
                <PasswordInput color="secondary" placeholder="Secondary" />
                <PasswordInput color="accent" placeholder="Accent" />
                <PasswordInput color="success" placeholder="Success" />
                <PasswordInput color="warning" placeholder="Warning" />
                <PasswordInput color="error" placeholder="Error" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <PasswordInput bordered placeholder="Bordered (default)" />
                <PasswordInput ghost placeholder="Ghost" />
                <PasswordInput bordered={false} placeholder="No border" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <PasswordInput disabled placeholder="Disabled" />
                <PasswordInput required placeholder="Required" />
                <PasswordInput value="secretpassword" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Toggle Options</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <PasswordInput showToggle={true} placeholder="With toggle (default)" />
                <PasswordInput showToggle={false} placeholder="Without toggle" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">AutoComplete</h2>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-4">
                <PasswordInput autoComplete="current-password" placeholder="Current password" />
                <PasswordInput autoComplete="new-password" placeholder="New password" />
                <PasswordInput autoComplete="off" placeholder="No autocomplete" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
