import { useState, useEffect } from "preact/hooks";
import { Button, Alert, Progress, Badge, Toast } from "@suppers-ai/ui-lib";
import { 
  Video, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Cloud, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Share,
  Loader2
} from "lucide-preact";
import {
  isRecordingSupported,
  getBestSupportedFormat,
  getRecordingConstraints,
  formatDuration,
  generateRecordingFilename,
  downloadBlob,
  formatFileSize,
  formatDate,
} from "../lib/recorder-utils.ts";
import { getAuthClient } from "../lib/auth.ts";
import type { RecordingState, RecordingOptions, Recording } from "../types/recorder.ts";

export default function UnifiedRecorderIsland() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    status: 'idle',
    duration: 0,
  });
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingOptions, setRecordingOptions] = useState<RecordingOptions>({
    includeAudio: true,
    includeMicrophone: false,
    quality: 'high',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);
  
  // Recordings list state
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingsLoading, setRecordingsLoading] = useState(true);
  const [recordingsError, setRecordingsError] = useState<string | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPreviewRecording, setCurrentPreviewRecording] = useState<Recording | null>(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);
  
  // Storage tracking state
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    limit: number;
    percentage: number;
    remaining: number;
  } | null>(null);

  // Fetch user storage info from storage API
  const fetchUserStorageInfo = async () => {
    try {
      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        return;
      }

      const response = await fetch('http://127.0.0.1:54321/functions/v1/api/v1/user-storage', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.storage) {
          setStorageInfo({
            used: data.storage.used,
            limit: data.storage.limit,
            percentage: data.storage.percentage,
            remaining: data.storage.remaining,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
    }
  };

  // Add toast function
  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Check browser support and authentication on mount
  useEffect(() => {
    // Use microtask to prevent initial flicker
    Promise.resolve().then(() => {
      setIsSupported(isRecordingSupported());

      const authClient = getAuthClient();
      setIsAuthenticated(authClient.isAuthenticated());

      if (authClient.isAuthenticated()) {
        loadRecordings();
        fetchUserStorageInfo();
      } else {
        setRecordingsLoading(false);
      }

      // Listen for auth changes
      authClient.addEventListener('login', () => {
        setIsAuthenticated(true);
        loadRecordings();
        fetchUserStorageInfo();
      });
      authClient.addEventListener('logout', () => {
        setIsAuthenticated(false);
        setRecordings([]);
        setRecordingsLoading(false);
        setStorageInfo(null);
      });
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Timer effect for active recording
  useEffect(() => {
    let interval: number | undefined;

    if (recordingState.status === 'recording') {
      interval = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState.status]);

  const getLatestRecordings = async (): Promise<Recording[]> => {
    const authClient = getAuthClient();
    const userId = authClient.getUserId();
    const accessToken = await authClient.getAccessToken();

    if (!userId || !accessToken) return [];

    const response = await fetch('/api/recordings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-User-ID': userId,
      },
    });

    if (!response.ok) return [];

    const result = await response.json();
    if (!result.success) return [];

    return result.recordings.map((file: any) => {
      const createdDate = file.createdAt ? new Date(file.createdAt) : new Date();
      const updatedDate = file.updatedAt ? new Date(file.updatedAt) : createdDate;
      
      return {
        id: file.id,
        name: file.name,
        duration: 0,
        size: file.size || 0,
        createdAt: createdDate,
        updatedAt: updatedDate,
        filePath: file.filePath,
        publicUrl: '',
        isPublic: false,
        mimeType: file.mimeType || 'video/webm',
      };
    }).sort((a: Recording, b: Recording) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const loadRecordings = async () => {
    try {
      setRecordingsLoading(true);
      setRecordingsError(null);

      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        setRecordingsError('Authentication required');
        return;
      }

      const response = await fetch('/api/recordings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load recordings' }));
        
        if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
          setRecordingsError('Your session has expired. Please log in again.');
          const authClient = getAuthClient();
          authClient.signOut();
          return;
        }
        
        setRecordingsError(errorData.error || 'Failed to load recordings');
        return;
      }

      const result = await response.json();

      if (result.success) {
        const recordingsList: Recording[] = result.recordings.map((file: any) => {
          const createdDate = file.createdAt ? new Date(file.createdAt) : new Date();
          const updatedDate = file.updatedAt ? new Date(file.updatedAt) : createdDate;
          
          return {
            id: file.id,
            name: file.name,
            duration: 0,
            size: file.size || 0,
            createdAt: createdDate,
            updatedAt: updatedDate,
            filePath: file.filePath,
            publicUrl: '',
            isPublic: false,
            mimeType: file.mimeType || 'video/webm',
          };
        });

        setRecordings(recordingsList.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        
        // Extract storage info from the response if available
        if (result.totalStorage !== undefined) {
          // Get user's storage limit from storage API
          fetchUserStorageInfo();
        }
      } else {
        setRecordingsError('Failed to load recordings');
      }
    } catch (err) {
      setRecordingsError(err instanceof Error ? err.message : 'Failed to load recordings');
    } finally {
      setRecordingsLoading(false);
    }
  };

  // Recording functions (from original RecorderIsland)
  const startRecording = async () => {
    try {
      // Check storage limits before starting recording
      if (storageInfo && storageInfo.percentage > 95) {
        addToast("Storage is full! Please delete some recordings or upgrade your plan.", "error");
        return;
      }
      
      setRecordingState({ status: 'preparing', duration: 0 });

      const constraints = getRecordingConstraints(recordingOptions);
      const displayStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      const combinedStream = displayStream;

      if (recordingOptions.includeMicrophone) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTrack = audioStream.getAudioTracks()[0];
          if (audioTrack) {
            combinedStream.addTrack(audioTrack);
          }
        } catch (err) {
          console.warn('Could not add microphone:', err);
        }
      }

      const mimeType = getBestSupportedFormat();
      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setRecordingState(prev => ({
          ...prev,
          status: 'stopped',
          recordedBlob: blob
        }));

        combinedStream.getTracks().forEach(track => track.stop());
        setStream(null);

        // Auto-save the recording
        setTimeout(() => {
          if (blob) {
            saveRecordingBlob(blob);
          }
        }, 1000);
      };

      recorder.onerror = (event) => {
        const errorEvent = event as ErrorEvent;
        setRecordingState({
          status: 'error',
          duration: 0,
          error: 'Recording failed: ' + (errorEvent.error?.message || 'Unknown error')
        });
        combinedStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      setMediaRecorder(recorder);
      setStream(combinedStream);
      recorder.start(1000);
      setRecordingState({ status: 'recording', duration: 0 });

      displayStream.getVideoTracks()[0].onended = () => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      };

    } catch (error) {
      setRecordingState({
        status: 'error',
        duration: 0,
        error: error instanceof Error ? error.message : 'Failed to start recording'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setRecordingState(prev => ({ ...prev, status: 'paused' }));
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setRecordingState(prev => ({ ...prev, status: 'recording' }));
    }
  };

  const saveRecordingBlob = async (blob: Blob) => {
    if (!isAuthenticated) return;

    try {
      setRecordingState(prev => ({ ...prev, status: 'uploading', uploadProgress: 0 }));
      addToast("Auto-saving recording...", "success");

      const authClient = getAuthClient();
      const filename = generateRecordingFilename();
      const file = new File([blob], filename, {
        type: blob.type
      });

      const formData = new FormData();
      formData.append('file', file);

      const accessToken = await authClient.getAccessToken();
      
      if (!accessToken) {
        addToast("Authentication failed. Please log in again.", "error");
        setRecordingState(prev => ({
          ...prev,
          status: 'error',
          error: 'No access token available. Please log in again.'
        }));
        return;
      }

      const response = await fetch('/api/recordings', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': authClient.getUserId() || '',
        },
      });

      if (response.ok) {
        const result = await response.json();
        addToast("Recording saved successfully!", "success");

        setRecordingState({ status: 'idle', duration: 0 });
        
        // Reload recordings to show the new one
        await loadRecordings();
        
        // Keep the preview active for the newly saved recording
        if (previewUrl) {
          setCurrentPreviewUrl(previewUrl);
          // Find the newly added recording and set it as current preview
          setTimeout(async () => {
            const updatedRecordings = await getLatestRecordings();
            if (updatedRecordings.length > 0) {
              setCurrentPreviewRecording(updatedRecordings[0]);
            }
          }, 500);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        
        if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
          addToast("Your session has expired. Please log in again.", "error");
          const authClient = getAuthClient();
          authClient.signOut();
          setRecordingState(prev => ({
            ...prev,
            status: 'error',
            error: 'Session expired. Please log in again.'
          }));
          return;
        }
        
        const errorMessage = 'Upload failed: ' + (errorData.error || errorData.message || 'Unknown error');
        addToast(errorMessage, "error");
        setRecordingState(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      addToast(errorMessage, "error");
      setRecordingState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));
    }
  };


  const downloadRecording = () => {
    if (recordingState.recordedBlob) {
      downloadBlob(recordingState.recordedBlob, generateRecordingFilename());
    }
  };

  const discardRecording = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRecordingState({ status: 'idle', duration: 0 });
  };

  // Recording list functions
  const downloadExistingRecording = async (recording: Recording) => {
    try {
      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        alert('Authentication required for download');
        return;
      }

      const response = await fetch(`/api/recordings/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
        body: JSON.stringify({
          filePath: recording.filePath
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get download URL' }));
        alert('Download failed: ' + errorData.error);
        return;
      }

      const result = await response.json();
      
      if (result.success && result.downloadUrl) {
        const fileResponse = await fetch(result.downloadUrl);
        if (!fileResponse.ok) {
          alert('Failed to fetch file for download');
          return;
        }
        
        const blob = await fileResponse.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = recording.name;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to get download URL');
      }
    } catch (error) {
      alert('Download failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const previewRecording = async (recording: Recording) => {
    try {
      // If clicking on the same recording that's already being previewed, hide the preview
      if (currentPreviewRecording?.id === recording.id) {
        setCurrentPreviewRecording(null);
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl);
          setCurrentPreviewUrl(null);
        }
        return;
      }

      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        alert('Authentication required for preview');
        return;
      }

      const response = await fetch(`/api/recordings/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
        body: JSON.stringify({
          filePath: recording.filePath
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get preview URL' }));
        alert('Preview failed: ' + errorData.error);
        return;
      }

      const result = await response.json();
      
      if (result.success && result.downloadUrl) {
        // Clean up previous preview URL
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl);
        }
        
        setCurrentPreviewUrl(result.downloadUrl);
        setCurrentPreviewRecording(recording);
      } else {
        alert('Failed to get preview URL');
      }
    } catch (error) {
      alert('Preview failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const shareRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setShowShareModal(true);
  };

  const deleteRecording = async (recording: Recording) => {
    try {
      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        alert('Authentication required for delete');
        return;
      }

      const response = await fetch(`/api/recordings/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
        body: JSON.stringify({
          filePath: recording.filePath
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete recording' }));
        alert('Delete failed: ' + errorData.error);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        setRecordings(prev => prev.filter(r => r.id !== recording.id));
        setShowDeleteModal(false);
        setSelectedRecording(null);
      } else {
        alert('Failed to delete recording');
      }
    } catch (error) {
      alert('Delete failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Show loading state while checking browser support and authentication
  if (isSupported === null || isAuthenticated === null) {
    return (
      <div class="flex items-center justify-center py-8">
        <Loader2 class="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSupported) {
    return (
      <Alert color="error">
        <div>
          <h3 class="font-bold">Browser Not Supported</h3>
          <div class="text-sm">Your browser doesn't support screen recording. Please use Chrome, Firefox, or Edge.</div>
        </div>
      </Alert>
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
                      {Math.round(storageInfo.used / (1024 * 1024))}MB of {Math.round(storageInfo.limit / (1024 * 1024))}MB used 
                      ({storageInfo.percentage}%)
                    </div>
                  </div>
                </div>
              </Alert>
            </div>
          )}
          
          {/* Status Display */}
          {recordingState.status !== 'idle' && (
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
          )}

          {/* Video Preview - Only show during recording states, not after save */}
          {recordingState.status === 'stopped' && previewUrl && (
            <div class="space-y-3 mb-6">
              <video
                src={previewUrl}
                controls
                class="w-full rounded-lg bg-black max-h-96 mx-auto"
              >
                Your browser does not support video playback.
              </video>
              <div class="text-center text-sm text-base-content/60">
                {formatDuration(recordingState.duration)} • {recordingState.recordedBlob ? (recordingState.recordedBlob.size / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown'}
              </div>
            </div>
          )}

          {/* Recording Controls Row */}
          <div class="flex items-center justify-center gap-8">
            {/* Main Controls */}
            <div class="flex justify-center gap-3">
              {recordingState.status === 'idle' && isAuthenticated && (
                <Button
                  onClick={startRecording}
                  color="primary"
                  size="lg"
                  class="flex items-center gap-2"
                >
                  <Video class="w-5 h-5" />
                  Start Recording
                </Button>
              )}

              {recordingState.status === 'recording' && (
                <>
                  <Button
                    onClick={pauseRecording}
                    color="warning"
                    size="lg"
                    class="flex items-center gap-2"
                  >
                    <Pause class="w-4 h-4" />
                    Pause
                  </Button>
                  <Button
                    onClick={stopRecording}
                    color="error"
                    size="lg"
                    class="flex items-center gap-2"
                  >
                    <Square class="w-4 h-4" />
                    Stop
                  </Button>
                </>
              )}

              {recordingState.status === 'paused' && (
                <>
                  <Button
                    onClick={resumeRecording}
                    color="success"
                    size="lg"
                    class="flex items-center gap-2"
                  >
                    <Play class="w-4 h-4" />
                    Resume
                  </Button>
                  <Button
                    onClick={stopRecording}
                    color="error"
                    size="lg"
                    class="flex items-center gap-2"
                  >
                    <Square class="w-4 h-4" />
                    Stop
                  </Button>
                </>
              )}


              {recordingState.status === 'uploading' && (
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
            {recordingState.status === 'idle' && isAuthenticated && (
              <div class="bg-base-200/30 rounded-lg p-4 space-y-3">
                <div class="form-control">
                  <select
                    class="select select-bordered select-sm w-32"
                    value={recordingOptions.quality}
                    onChange={(e) => {
                      const target = e.currentTarget as HTMLSelectElement;
                      if (target) {
                        setRecordingOptions(prev => ({
                          ...prev,
                          quality: target.value as RecordingOptions['quality']
                        }));
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
                      onChange={(e) => setRecordingOptions(prev => ({
                        ...prev,
                        includeAudio: e.currentTarget.checked
                      }))}
                    />
                    <span class="text-xs">Audio</span>
                  </label>

                  <label class="flex items-center gap-1">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      checked={recordingOptions.includeMicrophone}
                      onChange={(e) => setRecordingOptions(prev => ({
                        ...prev,
                        includeMicrophone: e.currentTarget.checked
                      }))}
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
                onClick={() => {
                  const authClient = getAuthClient();
                  authClient.signIn();
                }}
                color="primary"
                size="lg"
              >
                Login to Record
              </Button>
            </div>
          )}
        </div>

        {/* Preview Section - Shows selected recording or freshly recorded video */}
        {(currentPreviewUrl || (recordingState.status === 'idle' && previewUrl)) && (
          <div class="bg-base-200/20 rounded-lg p-6">
            <h2 class="text-lg font-semibold mb-4">
              {currentPreviewRecording ? `Preview: ${currentPreviewRecording.name}` : 'Your Recording'}
            </h2>
            <div class="space-y-3">
              <video
                src={currentPreviewUrl || previewUrl}
                controls
                class="w-full rounded-lg bg-black max-h-96 mx-auto"
              >
                Your browser does not support video playback.
              </video>
              {currentPreviewRecording && (
                <div class="text-center text-sm text-base-content/60">
                  {formatFileSize(currentPreviewRecording.size)} • {formatDate(currentPreviewRecording.createdAt)}
                </div>
              )}
              {!currentPreviewRecording && recordingState.recordedBlob && (
                <div class="text-center text-sm text-base-content/60">
                  {formatDuration(recordingState.duration)} • {(recordingState.recordedBlob.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recordings Section */}
        {isAuthenticated && (
          <div>
            <h2 class="text-lg font-semibold mb-4">My Recordings</h2>
            
            {recordingsLoading && (
              <div class="text-center py-8">
                <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p class="text-base-content/70 text-sm">Loading recordings...</p>
              </div>
            )}

            {recordingsError && (
              <Alert color="error" class="flex items-start gap-2">
                <AlertCircle class="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div class="font-medium">Error Loading Recordings</div>
                  <div class="text-sm mt-1">{recordingsError}</div>
                </div>
              </Alert>
            )}

            {!recordingsLoading && !recordingsError && recordings.length === 0 && (
              <div class="text-center py-8">
                <Video class="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                <p class="text-base-content/60">No recordings yet</p>
                <p class="text-base-content/40 text-sm">Your recordings will appear here after you save them</p>
              </div>
            )}

            {!recordingsLoading && !recordingsError && recordings.length > 0 && (
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
                              onClick={() => previewRecording(recording)}
                              title="Preview"
                              class="p-2"
                            >
                              <Play class="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadExistingRecording(recording)}
                              title="Download"
                              class="p-2"
                            >
                              <Download class="w-4 h-4" />
                            </Button>
                            <Button
                              size="md"
                              color="primary"
                              onClick={() => shareRecording(recording)}
                              title="Share"
                              class="flex items-center gap-2 px-4 py-2"
                            >
                              <Share class="w-4 h-4" />
                              <span class="text-sm font-medium">Share</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedRecording(recording);
                                setShowDeleteModal(true);
                              }}
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
            )}
          </div>
        )}
      </div>


      {/* Share Modal */}
      {showShareModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowShareModal(false)}></div>
          <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full m-4 relative z-10">
            <h3 class="text-lg font-semibold mb-4">Share: {selectedRecording?.name || 'Recording'}</h3>
            <div class="space-y-4">
              <div class="text-sm text-base-content/70 mb-4">
                Recording details:
              </div>
              {selectedRecording && (
                <div class="bg-base-200 p-4 rounded-lg space-y-2">
                  <div class="flex justify-between">
                    <span class="font-medium">Name:</span>
                    <span class="text-sm">{selectedRecording.name}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Size:</span>
                    <span class="text-sm">{formatFileSize(selectedRecording.size)}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Created:</span>
                    <span class="text-sm">{formatDate(selectedRecording.createdAt)}</span>
                  </div>
                </div>
              )}
              <div class="text-sm text-base-content/60">
                Note: Direct sharing is not yet implemented. You can download the recording and share it manually.
              </div>
              <div class="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowShareModal(false);
                    setSelectedRecording(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => selectedRecording && downloadExistingRecording(selectedRecording)}
                >
                  Download to Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowDeleteModal(false);
            setSelectedRecording(null);
          }}></div>
          <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full m-4 relative z-10">
            <h3 class="text-lg font-semibold mb-4 text-error">Delete Recording</h3>
            <div class="space-y-4">
              <p class="text-base-content">
                Are you sure you want to delete "<span class="font-medium">{selectedRecording?.name}</span>"?
              </p>
              <p class="text-sm text-base-content/70">
                This action cannot be undone.
              </p>
              <div class="flex justify-end gap-2 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRecording(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="error"
                  onClick={() => selectedRecording && deleteRecording(selectedRecording)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}