/**
 * Type definitions for the Screen Recorder application
 */

export interface Recording {
  id: string;
  name: string;
  duration: number;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  filePath: string;
  publicUrl?: string;
  isPublic: boolean;
  shareId?: string;
  mimeType: string;
  thumbnail?: string;
}

export interface RecordingOptions {
  includeAudio: boolean;
  includeMicrophone: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  maxDuration?: number; // in seconds
}

export interface RecordingState {
  status: 'idle' | 'preparing' | 'recording' | 'paused' | 'stopped' | 'uploading' | 'error';
  duration: number;
  error?: string;
  recordedBlob?: Blob;
  uploadProgress?: number;
}

export interface ShareSettings {
  isPublic: boolean;
  allowDownload: boolean;
  expiresAt?: Date;
  password?: string;
}

export interface RecorderConfig {
  maxFileSize: number; // in bytes
  maxDuration: number; // in seconds
  supportedFormats: string[];
  uploadChunkSize: number; // in bytes
}