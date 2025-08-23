import { Alert, Button } from "@suppers/ui-lib";
import { AlertCircle, Cloud, Pause, Play, Square, Video } from "lucide-preact";
import type { RecordingOptions, RecordingState } from "../types/recorder.ts";

interface RecordingControlsProps {
  recordingState: RecordingState;
  recordingOptions: RecordingOptions;
  isAuthenticated: boolean;
  storageInfo: {
    used: number;
    limit: number;
    percentage: number;
    remaining: number;
  } | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onRecordingOptionsChange: (options: RecordingOptions) => void;
  onSignIn: () => void;
}

export default function RecordingControls({
  recordingState,
  recordingOptions,
  isAuthenticated,
  storageInfo,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onRecordingOptionsChange,
  onSignIn,
}: RecordingControlsProps) {
  return (
    <div class="bg-base-200/20 rounded-lg p-6">
      {/* Storage Warning */}
      {storageInfo && storageInfo.percentage > 80 && (
        <div class="mb-4">
          <Alert color={storageInfo.percentage > 95 ? "error" : "warning"}>
            <div class="flex items-center gap-2">
              <AlertCircle class="w-4 h-4" />
              <div class="text-sm">
                <div class="font-medium">
                  {storageInfo.percentage > 95 ? "Storage almost full!" : "Storage running low"}
                </div>
                <div>
                  {Math.round(storageInfo.used / (1024 * 1024))}MB of{" "}
                  {Math.round(storageInfo.limit / (1024 * 1024))}MB used ({storageInfo.percentage}%)
                </div>
              </div>
            </div>
          </Alert>
        </div>
      )}

      {/* Recording Controls Row */}
      <div class="flex items-center justify-center gap-8">
        {/* Main Controls */}
        <div class="flex justify-center gap-3">
          {recordingState.status === "idle" && isAuthenticated && (
            <Button
              onClick={onStartRecording}
              color="primary"
              size="lg"
              class="flex items-center gap-2"
            >
              <Video class="w-5 h-5" />
              Start Recording
            </Button>
          )}

          {recordingState.status === "recording" && (
            <>
              <Button
                onClick={onPauseRecording}
                color="warning"
                size="lg"
                class="flex items-center gap-2"
              >
                <Pause class="w-4 h-4" />
                Pause
              </Button>
              <Button
                onClick={onStopRecording}
                color="error"
                size="lg"
                class="flex items-center gap-2"
              >
                <Square class="w-4 h-4" />
                Stop
              </Button>
            </>
          )}

          {recordingState.status === "paused" && (
            <>
              <Button
                onClick={onResumeRecording}
                color="success"
                size="lg"
                class="flex items-center gap-2"
              >
                <Play class="w-4 h-4" />
                Resume
              </Button>
              <Button
                onClick={onStopRecording}
                color="error"
                size="lg"
                class="flex items-center gap-2"
              >
                <Square class="w-4 h-4" />
                Stop
              </Button>
            </>
          )}

          {recordingState.status === "uploading" && (
            <Button
              disabled
              size="lg"
              class="flex items-center gap-2"
            >
              <Cloud class="w-4 h-4 animate-pulse" />
              Uploading...
            </Button>
          )}
        </div>

        {/* Recording Settings - Only show when idle and authenticated */}
        {recordingState.status === "idle" && isAuthenticated && (
          <div class="bg-base-200/30 rounded-lg p-4 space-y-3">
            <div class="form-control">
              <select
                class="select select-bordered select-sm w-32"
                value={recordingOptions.quality}
                onChange={(e) => {
                  const target = e.currentTarget as HTMLSelectElement;
                  if (target) {
                    onRecordingOptionsChange({
                      ...recordingOptions,
                      quality: target.value as RecordingOptions["quality"],
                    });
                  }
                }}
              >
                <option value="low">720p</option>
                <option value="medium">1080p</option>
                <option value="high">1440p</option>
                <option value="ultra">4K</option>
              </select>
            </div>

            <div class="flex gap-4">
              <label class="flex items-center gap-1">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={recordingOptions.includeAudio}
                  onChange={(e) =>
                    onRecordingOptionsChange({
                      ...recordingOptions,
                      includeAudio: e.currentTarget.checked,
                    })}
                />
                <span class="text-xs">Audio</span>
              </label>

              <label class="flex items-center gap-1">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={recordingOptions.includeMicrophone}
                  onChange={(e) =>
                    onRecordingOptionsChange({
                      ...recordingOptions,
                      includeMicrophone: e.currentTarget.checked,
                    })}
                />
                <span class="text-xs">Mic</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {recordingState.error && (
        <Alert color="error" class="flex items-start gap-2 mt-6">
          <AlertCircle class="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <div class="font-medium">Recording Error</div>
            <div class="text-sm mt-1">{recordingState.error}</div>
          </div>
        </Alert>
      )}

      {/* Unauthenticated State */}
      {!isAuthenticated && (
        <div class="text-center">
          <p class="text-base-content/70 mb-4">
            Quickly create and share videos
          </p>
          <Button
            onClick={onSignIn}
            color="primary"
            size="lg"
          >
            Login to Record
          </Button>
        </div>
      )}
    </div>
  );
}
