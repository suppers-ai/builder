import { OAuthAuthClient } from "@suppers/auth-client";
import { handleSessionExpiredError } from "@suppers/ui-lib";

export interface UploadResponse {
  url: string;
  publicUrl?: string;
  filename?: string;
  size?: number;
}

export class ImageUploadApiClient {
  private authClient: OAuthAuthClient;
  private baseUrl: string;

  constructor(
    authClient: OAuthAuthClient,
    baseUrl: string = "http://127.0.0.1:54321/functions/v1"
  ) {
    this.authClient = authClient;
    this.baseUrl = baseUrl;
  }

  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      if (!this.authClient.isAuthenticated()) {
        throw new Error("Not authenticated");
      }

      const token = await this.authClient.getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          // Use default error message if JSON parsing fails
        }

        // Check if this is a session expired error
        const sessionError = new Error(errorMessage);
        (sessionError as any).status = response.status;
        if (handleSessionExpiredError(sessionError)) {
          // Session expired error was handled by the global session manager
          throw sessionError;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files: File[]): Promise<UploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }
}