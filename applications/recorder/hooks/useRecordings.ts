import { useState } from "preact/hooks";
import { getAuthClient } from "../lib/auth.ts";
import type { Recording } from "../types/recorder.ts";

// Base URL for centralized API
const API_BASE_URL = 'http://127.0.0.1:54321/functions/v1/api/v1';

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPreviewRecording, setCurrentPreviewRecording] = useState<Recording | null>(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      setError(null);

      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/storage/recorder?list=true`, {
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
          setError('Your session has expired. Please log in again.');
          authClient.signOut();
          return;
        }
        
        setError(errorData.error || 'Failed to load recordings');
        return;
      }

      const result = await response.json();

      if (result.success && result.data?.files) {
        const recordingsList: Recording[] = result.data.files.map((file: any) => {
          const createdDate = file.lastModified ? new Date(file.lastModified) : new Date();
          
          return {
            id: file.path, // Use full path as ID
            name: file.name,
            duration: 0,
            size: file.size || 0,
            createdAt: createdDate,
            updatedAt: createdDate,
            filePath: file.path,
            publicUrl: file.publicUrl || '',
            isPublic: false,
            mimeType: file.contentType || 'video/webm',
          };
        });

        setRecordings(recordingsList.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } else {
        setError('Failed to load recordings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const clearRecordings = () => {
    setRecordings([]);
    setLoading(false);
    setCurrentPreviewRecording(null);
    if (currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
      setCurrentPreviewUrl(null);
    }
  };

  const findRecordingById = (id: string): Recording | undefined => {
    return recordings.find(r => r.id === id);
  };

  const setCurrentPreview = (recording: Recording | null, url?: string) => {
    // Clean up previous preview URL
    if (currentPreviewUrl && url !== currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
    }
    
    setCurrentPreviewRecording(recording);
    setCurrentPreviewUrl(url || null);
  };

  return {
    recordings,
    loading,
    error,
    currentPreviewRecording,
    currentPreviewUrl,
    loadRecordings,
    clearRecordings,
    findRecordingById,
    setCurrentPreview,
    setRecordings,
  };
}