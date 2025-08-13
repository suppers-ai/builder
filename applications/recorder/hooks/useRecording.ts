import { useState, useEffect } from "preact/hooks";
import {
  getBestSupportedFormat,
  getRecordingConstraints,
  generateRecordingFilename,
} from "../lib/recorder-utils.ts";
import { getAuthClient } from "../lib/auth.ts";
import type { RecordingState, RecordingOptions } from "../types/recorder.ts";

// Base URL for centralized API
const API_BASE_URL = 'http://127.0.0.1:54321/functions/v1/api/v1';

export function useRecording() {
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

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const startRecording = async (onError: (message: string) => void) => {
    try {
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
      };

      recorder.onerror = (event) => {
        const errorEvent = event as ErrorEvent;
        const errorMessage = 'Recording failed: ' + (errorEvent.error?.message || 'Unknown error');
        setRecordingState({
          status: 'error',
          duration: 0,
          error: errorMessage
        });
        combinedStream.getTracks().forEach(track => track.stop());
        setStream(null);
        onError(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      setRecordingState({
        status: 'error',
        duration: 0,
        error: errorMessage
      });
      onError(errorMessage);
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

  const saveRecording = async (
    onSuccess: (recordingId?: string) => void,
    onError: (message: string) => void
  ) => {
    if (!recordingState.recordedBlob) return;

    try {
      setRecordingState(prev => ({ ...prev, status: 'uploading', uploadProgress: 0 }));

      const authClient = getAuthClient();
      const filename = generateRecordingFilename();
      const file = new File([recordingState.recordedBlob], filename, {
        type: recordingState.recordedBlob.type
      });

      const formData = new FormData();
      formData.append('file', file);

      const accessToken = await authClient.getAccessToken();
      
      if (!accessToken) {
        throw new Error('No access token available. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/storage/recorder`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': authClient.getUserId() || '',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRecordingState(prev => ({ 
          ...prev, 
          status: 'idle', 
          duration: 0,
          // Keep the recordedBlob so share button still works
        }));
        onSuccess(result.recording?.id);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        
        if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
          authClient.signOut();
          throw new Error('Session expired. Please log in again.');
        }
        
        throw new Error('Upload failed: ' + (errorData.error || errorData.message || 'Unknown error'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setRecordingState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));
      onError(errorMessage);
    }
  };

  const resetRecording = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRecordingState({ status: 'idle', duration: 0 });
  };

  return {
    recordingState,
    recordingOptions,
    previewUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    saveRecording,
    resetRecording,
    setRecordingOptions,
  };
}