import { EntityForm } from "./EntityForm.tsx";

export const componentMetadata = {
  component: EntityForm,
  category: "Input",
  name: "EntityForm",
  description: "Generic form component for creating and editing entities with configurable fields",
  props: {
    title: {
      type: "string",
      required: true,
      description: "Form title displayed at the top",
    },
    fields: {
      type: "FormField[]",
      required: true,
      description: "Array of field configurations defining the form structure",
    },
    initialData: {
      type: "Record<string, any>",
      default: "{}",
      description: "Initial form data for editing existing entities",
    },
    onSubmit: {
      type: "(data: Record<string, any>) => Promise<void>",
      required: true,
      description: "Callback function called when form is submitted",
    },
    onCancel: {
      type: "() => void",
      required: true,
      description: "Callback function called when form is cancelled",
    },
    isLoading: {
      type: "boolean",
      default: "false",
      description: "Whether form is in loading state",
    },
    submitLabel: {
      type: "string",
      default: '"Save"',
      description: "Label for the submit button",
    },
    cancelLabel: {
      type: "string",
      default: '"Cancel"',
      description: "Label for the cancel button",
    },
  },
  examples: [
    {
      name: "Basic Entity Form",
      code: `<EntityForm
  title="Edit User"
  fields={[
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "Email", type: "text", required: true
        }
      ]}
  onSubmit={async (data) => console.log(data)}
  onCancel={() => console.log("cancelled")}
/>`,
      props: {},
    },
  ],
};
