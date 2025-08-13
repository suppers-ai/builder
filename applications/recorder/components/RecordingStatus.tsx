import { Progress } from "@suppers-ai/ui-lib";
import { Pause, Cloud } from "lucide-preact";
import type { RecordingState } from "../types/recorder.ts";
import { formatDuration } from "../lib/recorder-utils.ts";

interface RecordingStatusProps {
  recordingState: RecordingState;
}

export default function RecordingStatus({ recordingState }: RecordingStatusProps) {
  if (recordingState.status === 'idle') return null;

  return (
    <div class="text-center mb-6">
      <div class="flex justify-center items-center gap-3 mb-4">
        {recordingState.status === 'recording' && (
          <div class="flex items-center gap-2 text-red-600">
            <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium">Recording</span>
          </div>
        )}
        {recordingState.status === 'paused' && (
          <div class="flex items-center gap-2 text-yellow-600">
            <Pause class="w-4 h-4" />
            <span class="text-sm font-medium">Paused</span>
          </div>
        )}
        {recordingState.status === 'uploading' && (
          <div class="flex items-center gap-2 text-blue-600">
            <Cloud class="w-4 h-4 animate-pulse" />
            <span class="text-sm font-medium">Uploading</span>
          </div>
        )}
        
        {recordingState.duration > 0 && (
          <div class="text-lg font-mono font-semibold">
            {formatDuration(recordingState.duration)}
          </div>
        )}
      </div>

      {recordingState.status === 'uploading' && (
        <div class="w-full max-w-sm mx-auto">
          <Progress value={recordingState.uploadProgress || 0} class="w-full" />
        </div>
      )}
    </div>
  );
}