import { Button } from "@suppers-ai/ui-lib";
import type { Recording } from "../types/recorder.ts";

interface DeleteModalProps {
  recording: Recording | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (recording: Recording) => void;
}

export default function DeleteModal({
  recording,
  isOpen,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!isOpen || !recording) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full m-4 relative z-10">
        <h3 class="text-lg font-semibold mb-4 text-error">Delete Recording</h3>
        <div class="space-y-4">
          <p class="text-base-content">
            Are you sure you want to delete "<span class="font-medium">{recording.name}</span>"?
          </p>
          <p class="text-sm text-base-content/70">
            This action cannot be undone.
          </p>
          <div class="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              color="error"
              onClick={() => onConfirm(recording)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}