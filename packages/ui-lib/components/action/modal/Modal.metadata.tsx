import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const modalExamples: ComponentExample[] = [
  {
    title: "Basic Modal",
    description: "Simple modal dialog with title and content",
    code: `<Modal open={true} title="Modal Title">
  <p class="py-4">
    This is a basic modal dialog. It contains some content and demonstrates the default modal
    styling and layout.
  </p>
  <div class="modal-action">
    <button class="btn">Close</button>
    <button class="btn btn-primary">Save</button>
  </div>
</Modal>`,
    showCode: true,
  },
  {
    title: "Modal with Form",
    description: "Modal containing form elements and inputs",
    code: `<Modal open={true} title="Create Account">
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text">Username</span>
    </label>
    <input type="text" class="input input-bordered w-full" />

    <label class="label">
      <span class="label-text">Email</span>
    </label>
    <input type="email" class="input input-bordered w-full" />
  </div>

  <div class="modal-action">
    <button class="btn">Cancel</button>
    <button class="btn btn-primary">Create Account</button>
  </div>
</Modal>`,
    showCode: true,
  },
  {
    title: "Confirmation Modal",
    description: "Modal for dangerous actions requiring confirmation",
    code: `<Modal open={true} title="Confirm Deletion">
  <div class="alert alert-warning">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
    <span>Warning: This action cannot be undone!</span>
  </div>

  <p class="py-4">
    Are you sure you want to delete this item? This action is permanent and cannot be reversed.
  </p>

  <div class="modal-action">
    <button class="btn">Cancel</button>
    <button class="btn btn-error">Delete</button>
  </div>
</Modal>`,
    showCode: true,
  },
];

const modalProps: ComponentProp[] = [
  {
    name: "children",
    type: "ComponentChildren",
    description: "Modal content",
    required: true,
  },
  {
    name: "open",
    type: "boolean",
    description: "Controls modal visibility",
    default: "false",
  },
  {
    name: "title",
    type: "string",
    description: "Modal title displayed at the top",
  },
  {
    name: "backdrop",
    type: "boolean",
    description: "Show backdrop behind modal",
    default: "true",
  },
  {
    name: "responsive",
    type: "boolean",
    description: "Make modal responsive with max width",
    default: "true",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
  {
    name: "id",
    type: "string",
    description: "HTML id attribute",
  },
];

export const modalMetadata: ComponentMetadata = {
  name: "Modal",
  description: "Dialog boxes and overlays for displaying content and capturing user input",
  category: ComponentCategory.ACTION,
  path: "/components/action/modal",
  tags: ["dialog", "overlay", "popup"],
  relatedComponents: ["button", "alert"],
  interactive: true, // Can have interactive elements and close handlers
  preview: (
    <div class="mockup-window border bg-base-300 scale-75">
      <div class="flex justify-center px-4 py-16 bg-base-200">
        <div class="text-center">
          <h3 class="font-bold text-lg">Modal Dialog</h3>
          <p class="py-4">This is a modal example</p>
        </div>
      </div>
    </div>
  ),
  examples: modalExamples,
  props: modalProps,
  variants: ["default", "bottom sheet", "full screen", "confirmation"],
  useCases: ["User forms", "Confirmations", "Image gallery", "Settings"],
  usageNotes: [
    "Use Modal for server-side rendered modals that show static content",
    "For interactive modals with close handlers, create an island component",
    "Always provide a way to close the modal (close button, backdrop click, or escape key)",
    "Use modal-action class for button containers at the bottom",
    "Consider using alert styles for confirmation modals",
    "Set responsive={true} for modals with wide content like tables",
    "Modal backdrop provides visual separation from background content",
  ],
};
