import { Textarea } from "@suppers/ui-lib";

export default function TextareaPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Textarea Component</h1>
        <p>Multi-line text input component</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="space-y-4">
            <Textarea size="xs" placeholder="Extra small textarea" />
            <Textarea size="sm" placeholder="Small textarea" />
            <Textarea size="md" placeholder="Medium textarea" />
            <Textarea size="lg" placeholder="Large textarea" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="space-y-4">
            <Textarea color="primary" placeholder="Primary textarea" />
            <Textarea color="secondary" placeholder="Secondary textarea" />
            <Textarea color="accent" placeholder="Accent textarea" />
            <Textarea color="success" placeholder="Success textarea" />
            <Textarea color="warning" placeholder="Warning textarea" />
            <Textarea color="error" placeholder="Error textarea" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="space-y-4">
            <Textarea bordered placeholder="Bordered (default)" />
            <Textarea ghost placeholder="Ghost style" />
            <Textarea bordered={false} placeholder="No border" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Rows</h2>
          <div class="space-y-4">
            <Textarea rows={2} placeholder="2 rows" />
            <Textarea rows={5} placeholder="5 rows" />
            <Textarea rows={8} placeholder="8 rows" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="space-y-4">
            <Textarea disabled placeholder="Disabled textarea" />
            <Textarea value="Pre-filled content" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive</h2>
          <div class="space-y-4">
            <Textarea
              placeholder="Type something..."
              onChange={(value) => console.log("Textarea value:", value)}
            />
            <Textarea
              value="Initial content"
              rows={4}
              color="primary"
              onChange={(value) => console.log("Large textarea:", value)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
