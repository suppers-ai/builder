import { useState } from "preact/hooks";
import { Button, Modal } from "@suppers/ui-lib";
import type { Application } from "@suppers/shared";

interface DeleteConfirmationModalProps {
  application: Application | null;
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  application,
  isOpen,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!application) return;

    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Failed to delete application:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!application) return null;

  return (
    <Modal
      open={isOpen}
      title="Delete Application"
      backdrop={true}
      responsive={true}
    >
      <div class="space-y-4 p-1">
        <h2 id="delete-modal-title" class="sr-only">Delete Application Confirmation</h2>

        {/* Warning Message */}
        <div class="alert alert-warning" role="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span>This action cannot be undone!</span>
        </div>

        {/* Application Details */}
        <div
          class="bg-base-200 p-3 sm:p-4 rounded-lg"
          role="region"
          aria-labelledby="app-details-heading"
        >
          <h4
            id="app-details-heading"
            class="font-semibold text-base-content mb-2 text-sm sm:text-base"
          >
            Application to be deleted:
          </h4>
          <div class="space-y-2 text-xs sm:text-sm">
            <div class="flex flex-col sm:flex-row sm:justify-between">
              <span class="font-medium">Name:</span>
              <span class="text-base-content/80 break-words">{application.name}</span>
            </div>
            {application.description && (
              <div class="flex flex-col sm:flex-row sm:justify-between">
                <span class="font-medium">Description:</span>
                <span class="text-base-content/80 break-words">{application.description}</span>
              </div>
            )}
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <span class="font-medium">Status:</span>
              <span
                class={`badge badge-sm mt-1 sm:mt-0 ${
                  application.status === "published"
                    ? "badge-success"
                    : application.status === "pending"
                    ? "badge-warning"
                    : application.status === "archived"
                    ? "badge-neutral"
                    : "badge-ghost"
                }`}
              >
                {application.status}
              </span>
            </div>
            <div class="flex flex-col sm:flex-row sm:justify-between">
              <span class="font-medium">Created:</span>
              <span class="text-base-content/80">
                {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Consequences Warning */}
        <div class="space-y-2" id="delete-modal-description">
          <h4 class="font-semibold text-base-content text-sm sm:text-base">
            This will permanently delete:
          </h4>
          <ul class="list-disc list-inside text-xs sm:text-sm text-base-content/80 space-y-1 pl-2">
            <li>All application data and configuration</li>
            <li>Any associated user access permissions</li>
            <li>Application history and metadata</li>
            <li>Generated files and deployments</li>
          </ul>
        </div>

        {/* Confirmation Notice */}
        <div class="bg-error/10 border border-error/20 p-3 sm:p-4 rounded-lg">
          <p class="text-xs sm:text-sm text-error font-medium mb-2">
            Please confirm you want to delete this application:
          </p>
          <p class="text-xs sm:text-sm font-mono bg-base-100 px-2 py-1 rounded border break-all">
            {application.name}
          </p>
        </div>
      </div>

      {/* Modal Actions */}
      <div class="modal-action flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isDeleting}
          class="w-full sm:w-auto order-2 sm:order-1"
          aria-label="Cancel deletion and close dialog"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="error"
          onClick={handleConfirm}
          disabled={isDeleting}
          class="w-full sm:w-auto order-1 sm:order-2"
          aria-label={isDeleting
            ? "Deleting application, please wait"
            : `Delete application ${application.name}`}
        >
          {isDeleting
            ? (
              <>
                <span class="loading loading-spinner loading-sm mr-2" aria-hidden="true"></span>
                Deleting...
              </>
            )
            : (
              "Delete Application"
            )}
        </Button>
      </div>
    </Modal>
  );
}
