import { Select } from "@suppers/ui-lib";

const sampleOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3", disabled: true },
  { value: "option4", label: "Option 4" },
];

const fruitOptions = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
];

export default function SelectPage() {
  return (
    <div class="container mx-auto p-6 space-y-8">
      <div class="prose max-w-none">
        <h1>Select Component</h1>
        <p>Dropdown selection component with options</p>
      </div>

      <div class="grid gap-8">
        <section>
          <h2 class="text-xl font-bold mb-4">Sizes</h2>
          <div class="space-y-4">
            <Select size="xs" options={sampleOptions} placeholder="Extra small" />
            <Select size="sm" options={sampleOptions} placeholder="Small" />
            <Select size="md" options={sampleOptions} placeholder="Medium" />
            <Select size="lg" options={sampleOptions} placeholder="Large" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Colors</h2>
          <div class="space-y-4">
            <Select color="primary" options={sampleOptions} placeholder="Primary" />
            <Select color="secondary" options={sampleOptions} placeholder="Secondary" />
            <Select color="accent" options={sampleOptions} placeholder="Accent" />
            <Select color="success" options={sampleOptions} placeholder="Success" />
            <Select color="warning" options={sampleOptions} placeholder="Warning" />
            <Select color="error" options={sampleOptions} placeholder="Error" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Variants</h2>
          <div class="space-y-4">
            <Select bordered options={sampleOptions} placeholder="Bordered (default)" />
            <Select ghost options={sampleOptions} placeholder="Ghost style" />
            <Select bordered={false} options={sampleOptions} placeholder="No border" />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">States</h2>
          <div class="space-y-4">
            <Select disabled options={sampleOptions} placeholder="Disabled" />
            <Select value="option2" options={sampleOptions} />
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold mb-4">Interactive</h2>
          <div class="space-y-4">
            <Select
              options={fruitOptions}
              placeholder="Choose a fruit"
              onChange={(value) => console.log("Selected fruit:", value)}
            />
            <Select
              options={sampleOptions}
              value="option1"
              size="lg"
              color="primary"
              onChange={(value) => console.log("Large select:", value)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
