import { Button } from "@suppers-ai/ui-lib";
import type { Recording } from "../types/recorder.ts";
import { formatFileSize, formatDate } from "../lib/recorder-utils.ts";

interface ShareModalProps {
  recording: Recording | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (recording: Recording) => void;
}

export default function ShareModal({
  recording,
  isOpen,
  onClose,
  onDownload,
}: ShareModalProps) {
  if (!isOpen || !recording) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full m-4 relative z-10">
        <h3 class="text-lg font-semibold mb-4">Share: {recording.name}</h3>
        <div class="space-y-4">
          <div class="text-sm text-base-content/70 mb-4">
            Recording details:
          </div>
          <div class="bg-base-200 p-4 rounded-lg space-y-2">
            <div class="flex justify-between">
              <span class="font-medium">Name:</span>
              <span class="text-sm">{recording.name}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Size:</span>
              <span class="text-sm">{formatFileSize(recording.size)}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Created:</span>
              <span class="text-sm">{formatDate(recording.createdAt)}</span>
            </div>
          </div>
          <div class="text-sm text-base-content/60">
            Note: Direct sharing is not yet implemented. You can download the recording and share it manually.
          </div>
          <div class="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              onClick={() => onDownload(recording)}
            >
              Download to Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}