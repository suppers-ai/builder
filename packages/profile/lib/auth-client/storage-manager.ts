import type {
  BaseManager,
  ManagerDependencies,
  StorageManagerInterface,
  StorageUploadResult,
  FileListResult,
} from "./types.ts";

/**
 * StorageManager handles all file and storage operations for the DirectAuthClient.
 * This includes uploading files, downloading content, and managing file metadata.
 */
export class StorageManager implements StorageManagerInterface, BaseManager {
  private dependencies?: ManagerDependencies;

  /**
   * Initialize the storage manager with dependencies
   */
  initialize(dependencies: ManagerDependencies): void {
    this.dependencies = dependencies;
  }

  /**
   * Get access token for authenticated requests
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.dependencies?.supabase) {
      return null;
    }

    try {
      const { data: { session } } = await this.dependencies.supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  /**
   * Upload file to application storage
   */
  async uploadFile(
    applicationSlug: string,
    file: File,
    filePath?: string,
  ): Promise<StorageUploadResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: "No access token available" };
      }

      const formData = new FormData();
      formData.append("file", file);

      const endpoint = filePath
        ? `/api/v1/storage/${applicationSlug}/${filePath}`
        : `/api/v1/storage/${applicationSlug}`;

      // Add timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for file uploads

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Upload failed" };
        }

        return { success: true, data: result.data };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          return { success: false, error: "Upload timeout - please try again" };
        }
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Upload raw content to application storage
   */
  async uploadContent(
    applicationSlug: string,
    filePath: string,
    content: string | ArrayBuffer,
    contentType: string = "text/plain",
  ): Promise<StorageUploadResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: "No access token available" };
      }

      const endpoint = `/api/v1/storage/${applicationSlug}/${filePath}`;

      // Add timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": contentType,
          },
          body: content,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Upload failed" };
        }

        return { success: true, data: result.data };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          return { success: false, error: "Upload timeout - please try again" };
        }
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Download file content from application storage
   */
  async downloadFile(
    applicationSlug: string,
    filePath: string,
  ): Promise<StorageUploadResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: "No access token available" };
      }

      const endpoint = `/api/v1/storage/${applicationSlug}/${filePath}?content=true`;

      // Add timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for downloads

      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const result = await response.json();
          return { success: false, error: result.error || "Download failed" };
        }

        const blob = await response.blob();
        return { success: true, data: blob };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          return { success: false, error: "Download timeout - please try again" };
        }
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      };
    }
  }

  /**
   * List files in application storage
   */
  async listFiles(
    applicationSlug: string,
    path?: string,
  ): Promise<FileListResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: "No access token available" };
      }

      let endpoint = `/api/v1/storage/${applicationSlug}?list=true`;
      if (path) {
        endpoint += `&path=${encodeURIComponent(path)}`;
      }

      // Add timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "List failed" };
        }

        return { success: true, files: result.data };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          return { success: false, error: "List timeout - please try again" };
        }
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "List failed",
      };
    }
  }

  /**
   * Get file metadata from application storage
   */
  async getFileInfo(
    applicationSlug: string,
    filePath: string,
  ): Promise<StorageUploadResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: "No access token available" };
      }

      const endpoint = `/api/v1/storage/${applicationSlug}/${filePath}`;

      // Add timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Get file info failed" };
        }

        return { success: true, data: result.data };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          return { success: false, error: "Get file info timeout - please try again" };
        }
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Get file info failed",
      };
    }
  }

  /**
   * Delete file from application storage
   */
  async deleteFile(
    applicationSlug: string,
    filePath: string,
  ): Promise<StorageUploadResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: "No access token available" };
      }

      const endpoint = `/api/v1/storage/${applicationSlug}/${filePath}`;

      // Add timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(endpoint, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || "Delete failed" };
        }

        return { success: true, data: result.data };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          return { success: false, error: "Delete timeout - please try again" };
        }
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.dependencies = undefined;
  }
}