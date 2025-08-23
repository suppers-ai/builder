import { Button } from "@suppers/ui-lib";
import { Download, Share } from "lucide-preact";
import type { Recording } from "../types/recorder.ts";

interface VideoPreviewProps {
  videoUrl: string;
  title: string;
  metadata?: string;
  showDownloadShare?: boolean;
  isRecording?: Recording; // If this is a saved recording
  onDownload?: () => void;
  onShare?: () => void;
}

export default function VideoPreview({
  videoUrl,
  title,
  metadata,
  showDownloadShare = false,
  isRecording,
  onDownload,
  onShare,
}: VideoPreviewProps) {
  return (
    <div class="bg-base-200/20 rounded-lg p-6">
      <h2 class="text-lg font-semibold mb-4">{title}</h2>
      <div class="space-y-3">
        <video
          src={videoUrl}
          controls
          class="w-full rounded-lg bg-black max-h-96 mx-auto"
        >
          Your browser does not support video playback.
        </video>

        {metadata && (
          <div class="text-center text-sm text-base-content/60">
            {metadata}
          </div>
        )}

        {showDownloadShare && (onDownload || onShare) && (
          <div class="flex justify-center gap-3 pt-2">
            {console.log("VideoPreview: Rendering buttons", {
              showDownloadShare,
              hasOnDownload: !!onDownload,
              hasOnShare: !!onShare,
            })}
            {onDownload && (
              <Button
                onClick={onDownload}
                color="primary"
                variant="outline"
                size="sm"
                class="flex items-center gap-2"
              >
                <Download class="w-4 h-4" />
                Download
              </Button>
            )}
            {onShare && (
              <Button
                onClick={() => {
                  console.log("VideoPreview: Share button clicked!");
                  onShare();
                }}
                color="primary"
                size="sm"
                class="flex items-center gap-2"
              >
                <Share class="w-4 h-4" />
                Share
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
