import { Button, Alert } from "@suppers-ai/ui-lib";
import { 
  Video, 
  Play, 
  Download, 
  Share, 
  Trash2, 
  AlertCircle, 
  Loader2 
} from "lucide-preact";
import type { Recording } from "../types/recorder.ts";
import { formatFileSize, formatDate } from "../lib/recorder-utils.ts";

interface RecordingsListProps {
  recordings: Recording[];
  loading: boolean;
  error: string | null;
  currentPreviewRecording: Recording | null;
  onPreview: (recording: Recording) => void;
  onDownload: (recording: Recording) => void;
  onShare: (recording: Recording) => void;
  onDelete: (recording: Recording) => void;
}

export default function RecordingsList({
  recordings,
  loading,
  error,
  currentPreviewRecording,
  onPreview,
  onDownload,
  onShare,
  onDelete,
}: RecordingsListProps) {
  if (loading) {
    return (
      <div class="text-center py-8">
        <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
        <p class="text-base-content/70 text-sm">Loading recordings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="error" class="flex items-start gap-2">
        <AlertCircle class="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <div class="font-medium">Error Loading Recordings</div>
          <div class="text-sm mt-1">{error}</div>
        </div>
      </Alert>
    );
  }

  if (recordings.length === 0) {
    return (
      <div class="text-center py-8">
        <Video class="w-12 h-12 text-base-content/30 mx-auto mb-3" />
        <p class="text-base-content/60">No recordings yet</p>
        <p class="text-base-content/40 text-sm">Your recordings will appear here after you save them</p>
      </div>
    );
  }

  return (
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recordings.map(recording => (
            <tr 
              key={recording.id} 
              class={currentPreviewRecording?.id === recording.id ? "bg-primary/10 border-primary/20" : ""}
            >
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-6 bg-primary/10 rounded flex items-center justify-center">
                    <Video class="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <div class="font-medium text-sm">{recording.name}</div>
                    <div class="text-xs text-base-content/60">
                      {recording.mimeType}
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-sm">{formatFileSize(recording.size)}</td>
              <td class="text-sm">{formatDate(recording.createdAt)}</td>
              <td>
                <div class="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPreview(recording)}
                    title="Preview"
                    class="p-2"
                  >
                    <Play class="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(recording)}
                    title="Download"
                    class="p-2"
                  >
                    <Download class="w-4 h-4" />
                  </Button>
                  <Button
                    size="md"
                    color="primary"
                    onClick={() => onShare(recording)}
                    title="Share"
                    class="flex items-center gap-2 px-4 py-2"
                  >
                    <Share class="w-4 h-4" />
                    <span class="text-sm font-medium">Share</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(recording)}
                    title="Delete"
                    class="p-2 text-error hover:bg-error/10"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}