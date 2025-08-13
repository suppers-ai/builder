import { useState, useEffect } from "preact/hooks";
import { Toast } from "@suppers-ai/ui-lib";
import { Loader2 } from "lucide-preact";
import { isRecordingSupported, formatDuration, generateRecordingFilename, formatFileSize, formatDate } from "../lib/recorder-utils.ts";

// Import hooks
import { useAuth } from "../hooks/useAuth.ts";
import { useToasts } from "../hooks/useToasts.ts";
import { useStorage } from "../hooks/useStorage.ts";
import { useRecording } from "../hooks/useRecording.ts";
import { useRecordings } from "../hooks/useRecordings.ts";

// Import components
import RecordingControls from "../components/RecordingControls.tsx";
import RecordingStatus from "../components/RecordingStatus.tsx";
import VideoPreview from "../components/VideoPreview.tsx";
import RecordingsList from "../components/RecordingsList.tsx";
import ShareModal from "../components/ShareModal.tsx";
import DeleteModal from "../components/DeleteModal.tsx";

// Import services
import { recordingService } from "../services/recordingService.ts";
import type { Recording } from "../types/recorder.ts";

export default function UnifiedRecorderIsland() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Custom hooks
  const { isAuthenticated, signIn } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const { storageInfo, fetchStorageInfo, clearStorageInfo } = useStorage();
  const { 
    recordingState, 
    recordingOptions, 
    previewUrl, 
    startRecording, 
    stopRecording, 
    pauseRecording, 
    resumeRecording, 
    saveRecording, 
    setRecordingOptions 
  } = useRecording();
  const { 
    recordings, 
    loading: recordingsLoading, 
    error: recordingsError, 
    currentPreviewRecording, 
    currentPreviewUrl, 
    loadRecordings, 
    clearRecordings, 
    findRecordingById, 
    setCurrentPreview,
    setRecordings 
  } = useRecordings();

  // Initialize on mount
  useEffect(() => {
    setIsSupported(isRecordingSupported());
  }, []);

  // Handle authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadRecordings();
      fetchStorageInfo();
    } else {
      clearRecordings();
      clearStorageInfo();
    }
  }, [isAuthenticated]);

  // Auto-save recording when stopped
  useEffect(() => {
    if (recordingState.status === 'stopped' && recordingState.recordedBlob && isAuthenticated) {
      const timer = setTimeout(() => {
        handleSaveRecording();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [recordingState.status, isAuthenticated]);

  // Event handlers
  const handleStartRecording = () => {
    if (storageInfo && storageInfo.percentage > 95) {
      addToast("Storage is full! Please delete some recordings or upgrade your plan.", "error");
      return;
    }
    startRecording((error) => addToast(error, "error"));
  };

  const handleSaveRecording = () => {
    addToast("Auto-saving recording...", "success");
    saveRecording(
      async (recordingId) => {
        addToast("Recording saved successfully!", "success");
        if (previewUrl) {
          setCurrentPreview(null, previewUrl);
        }
        await loadRecordings();
        
        // Set current preview to saved recording
        if (recordingId) {
          setRecordings(currentRecordings => {
            const savedRecording = currentRecordings.find(r => r.id === recordingId);
            if (savedRecording && previewUrl) {
              setCurrentPreview(savedRecording, previewUrl);
            } else if (currentRecordings.length > 0 && previewUrl) {
              setCurrentPreview(currentRecordings[0], previewUrl);
            }
            return currentRecordings;
          });
        }
      },
      (error) => addToast(error, "error")
    );
  };

  const handlePreviewRecording = async (recording: Recording) => {
    try {
      if (currentPreviewRecording?.id === recording.id) {
        setCurrentPreview(null);
        return;
      }

      const url = await recordingService.getPreviewUrl(recording);
      setCurrentPreview(recording, url);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Preview failed', 'error');
    }
  };

  const handleDownloadExisting = async (recording: Recording) => {
    try {
      await recordingService.downloadExisting(recording);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Download failed', 'error');
    }
  };

  const handleDownloadRecording = async (recording: Recording) => {
    try {
      await recordingService.downloadExisting(recording);
    } catch (error) {
      addToast('Failed to download video', 'error');
    }
  };

  const handleShareRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setShowShareModal(true);
  };

  const handleDeleteRecording = async (recording: Recording) => {
    try {
      await recordingService.delete(recording);
      setRecordings(prev => prev.filter(r => r.id !== recording.id));
      setShowDeleteModal(false);
      setSelectedRecording(null);
      addToast("Recording deleted successfully", "success");
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Delete failed', 'error');
    }
  };

  const handleShareModalDownload = async (recording: Recording) => {
    await handleDownloadExisting(recording);
  };

  // Loading states
  if (isSupported === null || isAuthenticated === null) {
    return (
      <div class="flex items-center justify-center py-8">
        <Loader2 class="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div class="bg-error/10 border border-error/20 rounded-lg p-4">
        <div>
          <h3 class="font-bold text-error">Browser Not Supported</h3>
          <div class="text-sm text-error/80">Your browser doesn't support screen recording. Please use Chrome, Firefox, or Edge.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Container */}
      <div class="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            dismissible={true}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div class="space-y-8">
        {/* Recording Section */}
        <div>
          <RecordingStatus recordingState={recordingState} />
          
          <RecordingControls
            recordingState={recordingState}
            recordingOptions={recordingOptions}
            isAuthenticated={isAuthenticated}
            storageInfo={storageInfo}
            onStartRecording={handleStartRecording}
            onStopRecording={stopRecording}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
            onRecordingOptionsChange={setRecordingOptions}
            onSignIn={signIn}
          />
        </div>

        {/* Consolidated Video Preview Section */}
        {(currentPreviewUrl || previewUrl) && (
          <VideoPreview
            videoUrl={currentPreviewUrl || previewUrl!}
            title={
              currentPreviewRecording 
                ? `Preview: ${currentPreviewRecording.name}` 
                : recordingState.status === 'stopped' 
                ? "Your Recording" 
                : "Preview"
            }
            metadata={
              currentPreviewRecording
                ? `${formatFileSize(currentPreviewRecording.size)} • ${formatDate(currentPreviewRecording.createdAt)}`
                : recordingState.recordedBlob
                ? `${formatDuration(recordingState.duration)} • ${(recordingState.recordedBlob.size / (1024 * 1024)).toFixed(1)} MB`
                : undefined
            }
            showDownloadShare={true}
            onDownload={() => {
              if (currentPreviewRecording && currentPreviewRecording.id !== 'preview') {
                // Existing recording - use API with bandwidth tracking
                handleDownloadExisting(currentPreviewRecording);
              } else {
                // Fresh recording blob - download directly without bandwidth tracking
                const url = currentPreviewUrl || previewUrl!;
                const filename = currentPreviewRecording?.name || generateRecordingFilename();
                recordingService.downloadFromBlob(url, filename);
              }
            }}
            onShare={() => {
              if (currentPreviewRecording) {
                handleShareRecording(currentPreviewRecording);
              } else if (recordingState.recordedBlob && previewUrl) {
                // Create temporary recording object for share modal
                const tempRecording: Recording = {
                  id: 'preview',
                  name: generateRecordingFilename(),
                  duration: recordingState.duration,
                  size: recordingState.recordedBlob.size,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  filePath: 'preview',
                  publicUrl: previewUrl,
                  isPublic: false,
                  mimeType: recordingState.recordedBlob.type || 'video/webm',
                };
                handleShareRecording(tempRecording);
              }
            }}
          />
        )}

        {/* Recordings Section */}
        {isAuthenticated && (
          <div>
            <h2 class="text-lg font-semibold mb-4">My Recordings</h2>
            <RecordingsList
              recordings={recordings}
              loading={recordingsLoading}
              error={recordingsError}
              currentPreviewRecording={currentPreviewRecording}
              onPreview={handlePreviewRecording}
              onDownload={handleDownloadExisting}
              onShare={handleShareRecording}
              onDelete={(recording) => {
                setSelectedRecording(recording);
                setShowDeleteModal(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ShareModal
        recording={selectedRecording}
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedRecording(null);
        }}
        onDownload={handleShareModalDownload}
      />

      <DeleteModal
        recording={selectedRecording}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRecording(null);
        }}
        onConfirm={handleDeleteRecording}
      />
    </>
  );
}