import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
  ComponentSchema} from "../../types.ts";
import { Modal } from "./Modal.tsx";
import {
  ModalPropsSchema,
  safeValidateModalProps,
  validateModalProps} from "./Modal.schema.ts";

const modalExamples: ComponentExample[] = [
  {
    title: "Basic Modal",
    description: "Simple modal dialog with title and content",
    props: {
      open: false,
      title: "Basic Modal",
      children: (
        <>
          <p class="py-4">
            This is a basic modal with some content. You can put any content here.
          </p>
          <div class="modal-action">
            <button class="btn">Close</button>
            <button class="btn btn-primary">Save</button>
          </div>
        </>
      )
    }
  },
  {
    title: "Form Modal",
    description: "Modal containing a form for user input",
    props: {
      open: false,
      title: "Create Account",
      children: (
        <>
          <form class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Name</span>
              </label>
              <input type="text" placeholder="Enter your name" class="input input-bordered" />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input type="email" placeholder="Enter your email" class="input input-bordered" />
            </div>
          </form>
          <div class="modal-action">
            <button class="btn">Cancel</button>
            <button class="btn btn-primary">Create Account</button>
          </div>
        </>
      )
    }
  },
  {
    title: "Confirmation Modal",
    description: "Modal for confirming dangerous actions",
    props: {
      open: false,
      title: "Delete Item",
      children: (
        <>
          <div class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 3h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>This action cannot be undone. Are you sure you want to delete this item?</span>
          </div>
          <div class="modal-action">
            <button class="btn">Cancel</button>
            <button class="btn btn-error">Delete</button>
          </div>
        </>
      )
    }
  },
  {
    title: "Modal without Backdrop",
    description: "Modal that doesn't show a backdrop overlay",
    props: {
      open: false,
      title: "No Backdrop",
      backdrop: false,
      children: (
        <>
          <p class="py-4">
            This modal doesn't have a backdrop, so the background remains interactive.
          </p>
          <div class="modal-action">
            <button class="btn btn-primary">Got it</button>
          </div>
        </>
      )
    }
  },
  {
    title: "Non-Responsive Modal",
    description: "Modal with fixed width, not responsive",
    props: {
      open: false,
      title: "Fixed Width",
      responsive: false,
      children: (
        <>
          <p class="py-4">
            This modal has a fixed width and doesn't adapt to screen size.
          </p>
          <div class="modal-action">
            <button class="btn btn-primary">Close</button>
          </div>
        </>
      )}
        }
      ];;

const modalProps: ComponentProp[] = [
  {
    name: "children",
    type: "ComponentChildren",
    description: "Modal content",
    required: true},
  {
    name: "open",
    type: "boolean",
    description: "Controls modal visibility",
    default: "false"},
  {
    name: "title",
    type: "string",
    description: "Modal title displayed at the top"},
  {
    name: "backdrop",
    type: "boolean",
    description: "Show backdrop behind modal",
    default: "true"},
  {
    name: "responsive",
    type: "boolean",
    description: "Make modal responsive with max width",
    default: "true"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
  {
    name: "id",
    type: "string",
    description: "HTML id attribute"},
];

const modalSchema: ComponentSchema = {
  schema: ModalPropsSchema,
  validateFn: validateModalProps,
  safeValidateFn: safeValidateModalProps};

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
          <p class="py-4">Dialog box for displaying content and capturing user input</p>
          <div class="flex gap-2 justify-center">
            <button class="btn btn-sm">Close</button>
            <button class="btn btn-primary btn-sm">Save</button>
          </div>
        </div>
      </div>
    </div>
  ),
  examples: modalExamples,
  schema: modalSchema,
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
  ]};
