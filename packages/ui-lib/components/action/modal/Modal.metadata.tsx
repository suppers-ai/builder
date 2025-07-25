import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const modalExamples: ComponentExample[] = [
  {
    title: "Basic Modal Trigger",
    description: "Button that would open a basic modal dialog",
    code: `<button class="btn btn-primary">Open Basic Modal</button>`,
    showCode: true,
  },
  {
    title: "Form Modal Trigger", 
    description: "Button that would open a form modal",
    code: `<button class="btn btn-secondary">Create Account</button>`,
    showCode: true,
  },
  {
    title: "Confirmation Modal Trigger",
    description: "Button that would open a dangerous action confirmation",
    code: `<button class="btn btn-error">Delete Item</button>`,
    showCode: true,
  },
  {
    title: "Modal Content Preview",
    description: "What modal content looks like when opened",
    code: `<div class="mockup-window border bg-base-300 w-full max-w-md mx-auto">
  <div class="bg-base-200 px-6 py-8">
    <h3 class="font-bold text-lg mb-4">Modal Title</h3>
    <p class="py-2">
      This is what the modal content looks like when displayed.
    </p>
    <div class="modal-action pt-4">
      <button class="btn btn-sm">Close</button>
      <button class="btn btn-primary btn-sm">Save</button>
    </div>
  </div>
</div>`,
    showCode: true,
  },
  {
    title: "Complete Modal Implementation",
    description: "Full modal implementation with trigger and content",
    code: `{/* Trigger Button */}
<button class="btn btn-primary" onclick="document.getElementById('my_modal').showModal()">
  Open Modal
</button>

{/* Modal Dialog */}
<dialog id="my_modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Hello!</h3>
    <p class="py-4">Press ESC key or click the button below to close</p>
    <div class="modal-action">
      <button class="btn" onclick="document.getElementById('my_modal').close()">Close</button>
    </div>
  </div>
</dialog>`,
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
