import FormData from 'form-data';
import { BaseService } from './base.service';
import { StorageObject, Bucket, UploadOptions, QueryOptions, PaginatedResponse } from '../types';

export class StorageService extends BaseService {
  /**
   * Upload a file to storage
   * @param bucketName - The name of the bucket
   * @param file - The file to upload (File in browser, Buffer in Node.js)
   * @param fileName - The name to save the file as
   * @param options - Upload options
   */
  async upload(
    bucketName: string,
    file: File | Buffer | Blob,
    fileName: string,
    options?: UploadOptions
  ): Promise<StorageObject> {
    const formData = new FormData();
    
    // Handle different file types
    if (typeof globalThis.window !== 'undefined' && file instanceof File) {
      formData.append('file', file, fileName);
    } else if (Buffer.isBuffer(file)) {
      formData.append('file', file, {
        filename: fileName,
        contentType: options?.contentType || 'application/octet-stream',
      });
    } else if (file instanceof Blob) {
      formData.append('file', file, fileName);
    } else {
      throw new Error('Invalid file type');
    }

    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }
    if (options?.public !== undefined) {
      formData.append('public', String(options.public));
    }

    // Use the bucket parameter directly
    return this.request<StorageObject>({
      method: 'POST',
      url: `/storage/buckets/${bucketName}/upload`,
      data: formData,
      headers: {
        ...formData.getHeaders?.(), // For Node.js
      },
      onUploadProgress: options?.onProgress
        ? (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            options.onProgress!(progress);
          }
        : undefined,
    });
  }

  /**
   * Download a file from storage
   * @param bucketName - The name of the bucket
   * @param fileName - The name of the file
   */
  async download(bucketName: string, fileName: string): Promise<Blob> {
    const response = await this.request<Blob>({
      method: 'GET',
      // Need to get the object ID first, then download
      // For now, use the direct download endpoint
      url: `/storage/buckets/${bucketName}/objects/${fileName}/download`,
      responseType: 'blob',
    });
    return response;
  }

  /**
   * Get a signed URL for a file
   * @param bucketName - The name of the bucket
   * @param fileName - The name of the file
   * @param expiresIn - URL expiration time in seconds (default: 3600)
   */
  async getSignedUrl(
    bucketName: string,
    fileName: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const response = await this.request<{ url: string }>({
      method: 'POST',
      url: '/storage/signed-url',
      data: {
        bucket: bucketName,
        file: fileName,
        expires_in: expiresIn,
      },
    });
    return response.url;
  }

  /**
   * Delete a file from storage
   * @param bucketName - The name of the bucket
   * @param fileName - The name of the file
   */
  async delete(bucketName: string, fileName: string): Promise<void> {
    await this.request<void>({
      method: 'DELETE',
      url: `/storage/buckets/${bucketName}/objects/${fileName}`,
    });
  }

  /**
   * List files in a bucket
   * @param bucketName - The name of the bucket
   * @param options - Query options
   */
  async list(
    bucketName: string,
    options?: QueryOptions
  ): Promise<PaginatedResponse<StorageObject>> {
    const queryString = options ? this.buildQueryString(options) : '';
    return this.request<PaginatedResponse<StorageObject>>({
      method: 'GET',
      url: `/storage/buckets/${bucketName}/objects${queryString ? `?${queryString}` : ''}`,
    });
  }

  /**
   * Create a new bucket
   * @param name - The name of the bucket
   * @param isPublic - Whether the bucket should be public
   */
  async createBucket(name: string, isPublic: boolean = false): Promise<Bucket> {
    return this.request<Bucket>({
      method: 'POST',
      url: '/storage/buckets',
      data: {
        name,
        public: isPublic,
      },
    });
  }

  /**
   * Delete a bucket
   * @param name - The name of the bucket
   */
  async deleteBucket(name: string): Promise<void> {
    await this.request<void>({
      method: 'DELETE',
      url: `/storage/buckets/${name}`,
    });
  }

  /**
   * List all buckets
   */
  async listBuckets(): Promise<Bucket[]> {
    return this.request<Bucket[]>({
      method: 'GET',
      url: '/storage/buckets',
    });
  }

  /**
   * Get storage statistics for the current user
   */
  async getStats(): Promise<{
    total_size: number;
    file_count: number;
    bucket_count: number;
    quota?: {
      max_storage: number;
      used_storage: number;
      max_bandwidth: number;
      used_bandwidth: number;
    };
  }> {
    return this.request({
      method: 'GET',
      url: '/storage/stats',
    });
  }

  /**
   * Move a file to a different bucket or rename it
   * @param fromBucket - Source bucket
   * @param fromPath - Source file path
   * @param toBucket - Destination bucket
   * @param toPath - Destination file path
   */
  async move(
    fromBucket: string,
    fromPath: string,
    toBucket: string,
    toPath: string
  ): Promise<StorageObject> {
    return this.request<StorageObject>({
      method: 'POST',
      url: '/storage/move',
      data: {
        from_bucket: fromBucket,
        from_path: fromPath,
        to_bucket: toBucket,
        to_path: toPath,
      },
    });
  }

  /**
   * Copy a file
   * @param fromBucket - Source bucket
   * @param fromPath - Source file path
   * @param toBucket - Destination bucket
   * @param toPath - Destination file path
   */
  async copy(
    fromBucket: string,
    fromPath: string,
    toBucket: string,
    toPath: string
  ): Promise<StorageObject> {
    return this.request<StorageObject>({
      method: 'POST',
      url: '/storage/copy',
      data: {
        from_bucket: fromBucket,
        from_path: fromPath,
        to_bucket: toBucket,
        to_path: toPath,
      },
    });
  }

  /**
   * Update file metadata
   * @param bucketName - The name of the bucket
   * @param fileName - The name of the file
   * @param metadata - New metadata
   */
  async updateMetadata(
    bucketName: string,
    fileName: string,
    metadata: Record<string, any>
  ): Promise<StorageObject> {
    return this.request<StorageObject>({
      method: 'PATCH',
      url: `/storage/buckets/${bucketName}/objects/${fileName}/metadata`,
      data: { metadata },
    });
  }
}