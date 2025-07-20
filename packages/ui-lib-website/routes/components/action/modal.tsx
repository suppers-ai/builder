import { Alert, Badge, Button, ComponentPageTemplate, Input, Modal } from "@suppers/ui-lib";

export default function ModalDemo() {
  const examples = [
    {
      title: "Basic Modal",
      description: "Simple modal dialog with title and content",
      code: `<Modal open={true} title="Modal Title">
  <p class="py-4">
    This is a basic modal dialog. It contains some content and demonstrates
    the default modal styling and layout.
  </p>
  <div class="modal-action">
    <Button>Close</Button>
    <Button color="primary">Save</Button>
  </div>
</Modal>`,
      preview: (
        <div class="mockup-window border bg-base-300 scale-75">
          <div class="flex justify-center px-4 py-16 bg-base-200">
            <div class="modal-box bg-base-100 shadow-xl">
              <h3 class="font-bold text-lg mb-4">Modal Title</h3>
              <p class="py-4">
                This is a basic modal dialog. It contains some content and demonstrates the default
                modal styling and layout.
              </p>
              <div class="modal-action">
                <Button>Close</Button>
                <Button color="primary">Save</Button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Modal with Form",
      description: "Modal containing form elements and inputs",
      code: `<Modal open={true} title="Create Account">
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text">Username</span>
    </label>
    <Input type="text" bordered fullWidth />
    
    <label class="label">
      <span class="label-text">Email</span>
    </label>
    <Input type="email" bordered fullWidth />
    
    <label class="label">
      <span class="label-text">Password</span>
    </label>
    <Input type="password" bordered fullWidth />
  </div>
  
  <div class="modal-action">
    <Button>Cancel</Button>
    <Button color="primary">Create Account</Button>
  </div>
</Modal>`,
      preview: (
        <div class="mockup-window border bg-base-300 scale-75">
          <div class="flex justify-center px-4 py-16 bg-base-200">
            <div class="modal-box bg-base-100 shadow-xl">
              <h3 class="font-bold text-lg mb-4">Create Account</h3>
              <div class="form-control w-full space-y-4">
                <div>
                  <label class="label">
                    <span class="label-text">Username</span>
                  </label>
                  <Input type="text" bordered fullWidth />
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">Email</span>
                  </label>
                  <Input type="email" bordered fullWidth />
                </div>
                <div>
                  <label class="label">
                    <span class="label-text">Password</span>
                  </label>
                  <Input type="password" bordered fullWidth />
                </div>
              </div>
              <div class="modal-action">
                <Button>Cancel</Button>
                <Button color="primary">Create Account</Button>
              </div>
            </div>
          </div>
        </div>
      ),
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
    All associated data will be permanently removed.
  </p>
  
  <div class="modal-action">
    <Button>Cancel</Button>
    <Button color="error">Delete</Button>
  </div>
</Modal>`,
      preview: (
        <div class="mockup-window border bg-base-300 scale-75">
          <div class="flex justify-center px-4 py-16 bg-base-200">
            <div class="modal-box bg-base-100 shadow-xl">
              <h3 class="font-bold text-lg mb-4">Confirm Deletion</h3>
              <div class="alert alert-warning mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>Warning: This action cannot be undone!</span>
              </div>
              <p class="py-4">
                Are you sure you want to delete this item? This action is permanent and cannot be
                reversed.
              </p>
              <div class="modal-action">
                <Button>Cancel</Button>
                <Button color="error">Delete</Button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Wide Modal",
      description: "Responsive modal that adapts to content width",
      code: `<Modal open={true} title="Data Table" responsive={true}>
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Doe</td>
          <td>john@example.com</td>
          <td>Admin</td>
          <td><Badge color="success">Active</Badge></td>
        </tr>
        <tr>
          <td>Jane Smith</td>
          <td>jane@example.com</td>
          <td>User</td>
          <td><Badge color="warning">Pending</Badge></td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="modal-action">
    <Button>Close</Button>
    <Button color="primary">Export</Button>
  </div>
</Modal>`,
      preview: (
        <div class="mockup-window border bg-base-300 scale-75">
          <div class="flex justify-center px-4 py-16 bg-base-200">
            <div class="modal-box bg-base-100 shadow-xl w-11/12 max-w-5xl">
              <h3 class="font-bold text-lg mb-4">Data Table</h3>
              <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>John Doe</td>
                      <td>john@example.com</td>
                      <td>Admin</td>
                      <td>
                        <span class="badge badge-success">Active</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Jane Smith</td>
                      <td>jane@example.com</td>
                      <td>User</td>
                      <td>
                        <span class="badge badge-warning">Pending</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="modal-action">
                <button class="btn">Close</button>
                <button class="btn btn-primary">Export</button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "children",
      type: "ComponentChildren",
      description: "Modal content",
      required: true,
    },
    {
      name: "open",
      type: "boolean",
      default: "false",
      description: "Controls modal visibility",
    },
    {
      name: "title",
      type: "string",
      description: "Modal title displayed at the top",
    },
    {
      name: "backdrop",
      type: "boolean",
      default: "true",
      description: "Show backdrop behind modal",
    },
    {
      name: "responsive",
      type: "boolean",
      default: "true",
      description: "Make modal responsive with max width",
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

  const usageNotes = [
    "Use Modal for server-side rendered modals that show static content",
    "For interactive modals with close handlers, create an island component",
    "Always provide a way to close the modal (close button, backdrop click, or escape key)",
    "Use modal-action class for button containers at the bottom",
    "Consider using alert styles for confirmation modals",
    "Set responsive={true} for modals with wide content like tables",
    "Modal backdrop provides visual separation from background content",
  ];

  const accessibilityNotes = [
    "Modal should trap focus when opened to prevent navigation outside",
    "Provide keyboard navigation with Tab and Shift+Tab",
    "Close modal with Escape key for better UX",
    "Use aria-labelledby to associate modal with its title",
    "Add aria-describedby for modal content description",
    "Ensure sufficient color contrast for modal content",
    "Return focus to trigger element when modal closes",
    "Use role='dialog' for proper screen reader announcement",
  ];

  const relatedComponents = [
    { name: "Button", path: "/components/action/button" },
    { name: "Alert", path: "/components/feedback/alert" },
    { name: "Card", path: "/components/display/card" },
    { name: "Dropdown", path: "/components/action/dropdown" },
  ];

  return (
    <ComponentPageTemplate
      title="Modal"
      description="Dialog boxes and overlays for displaying content and capturing user input"
      category="Actions"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
