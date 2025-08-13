import { getAuthClient } from "../lib/auth.ts";
import { downloadBlob } from "../lib/recorder-utils.ts";
import type { Recording } from "../types/recorder.ts";

// Base URL for centralized API
const API_BASE_URL = 'http://127.0.0.1:54321/functions/v1/api/v1';

export const recordingService = {
  async downloadExisting(recording: Recording): Promise<void> {
    const authClient = getAuthClient();
    const userId = authClient.getUserId();
    const accessToken = await authClient.getAccessToken();

    if (!userId || !accessToken) {
      throw new Error('Authentication required for download');
    }

    // Extract filename from filePath (e.g., "userId/recorder/filename.webm" -> "filename.webm")
    const filename = recording.filePath.split('/').pop();
    
    const response = await fetch(`${API_BASE_URL}/storage/recorder/${filename}?download=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-User-ID': userId,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Bandwidth limit exceeded - get detailed error message
        try {
          const errorData = await response.json();
          if (errorData.error) {
            throw new Error(errorData.error);
          }
        } catch (jsonError) {
          // If we can't parse JSON, fall back to a descriptive message
          throw new Error('Download failed: Bandwidth limit exceeded');
        }
        throw new Error('Download failed: Bandwidth limit exceeded');
      } else {
        throw new Error('Download failed: ' + response.statusText);
      }
    }

    // Download endpoint returns the file content directly, not JSON
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = recording.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async getPreviewUrl(recording: Recording): Promise<string> {
    // For video previews, we need to validate bandwidth limits first
    const authClient = getAuthClient();
    const userId = authClient.getUserId();
    const accessToken = await authClient.getAccessToken();

    if (!userId || !accessToken) {
      throw new Error('Authentication required for preview');
    }

    // Extract filename from filePath (e.g., "userId/recorder/filename.webm" -> "filename.webm")
    const filename = recording.filePath.split('/').pop();
    
    // First, test the download URL to check for bandwidth limits
    // We do a HEAD request to check without actually downloading
    const testUrl = `${API_BASE_URL}/storage/recorder/${filename}?download=true`;
    
    try {
      const testResponse = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      });

      if (!testResponse.ok) {
        if (testResponse.status === 429) {
          // Bandwidth limit exceeded
          const errorText = await testResponse.text().catch(() => '');
          let errorMessage = 'Bandwidth limit exceeded';
          
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // If we can't parse the error, use default message
          }
          
          throw new Error(errorMessage);
        } else {
          throw new Error(`Preview failed: ${testResponse.statusText}`);
        }
      }
    } catch (error) {
      // Re-throw the error to be handled by the calling code
      throw error;
    }
    
    // If the test passed, create a signed URL for video preview
    // This allows the video element to load the content without CORS issues
    return `${API_BASE_URL}/storage/recorder/${filename}?download=true&token=${accessToken}&userId=${userId}`;
  },

  async delete(recording: Recording): Promise<void> {
    const authClient = getAuthClient();
    const userId = authClient.getUserId();
    const accessToken = await authClient.getAccessToken();

    if (!userId || !accessToken) {
      throw new Error('Authentication required for delete');
    }

    // Extract filename from filePath (e.g., "userId/recorder/filename.webm" -> "filename.webm")
    const filename = recording.filePath.split('/').pop();
    
    const response = await fetch(`${API_BASE_URL}/storage/recorder/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-User-ID': userId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete recording' }));
      throw new Error('Delete failed: ' + errorData.error);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to delete recording');
    }
  },

  async downloadFromBlob(videoUrl: string, filename: string): Promise<void> {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    downloadBlob(blob, filename);
  },
};