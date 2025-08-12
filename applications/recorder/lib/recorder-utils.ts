/**
 * Utility functions for screen recording functionality
 */

import type { RecordingOptions, RecorderConfig } from "../types/recorder.ts";

// Default recorder configuration
export const RECORDER_CONFIG: RecorderConfig = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  maxDuration: 30 * 60, // 30 minutes
  supportedFormats: ['video/webm', 'video/mp4'],
  uploadChunkSize: 5 * 1024 * 1024, // 5MB chunks
};

// Check if screen recording is supported in the current browser
export function isRecordingSupported(): boolean {
  if (typeof navigator === "undefined" || typeof MediaRecorder === "undefined") {
    return false; // Server-side or unsupported environment
  }

  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getDisplayMedia &&
    MediaRecorder.isTypeSupported &&
    (MediaRecorder.isTypeSupported('video/webm') || MediaRecorder.isTypeSupported('video/mp4'))
  );
}

// Get the best supported video format for recording
export function getBestSupportedFormat(): string {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
    return 'video/webm'; // Default fallback for server-side
  }

  const formats = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];

  for (const format of formats) {
    if (MediaRecorder.isTypeSupported(format)) {
      return format;
    }
  }

  return 'video/webm'; // fallback
}

// Convert recording quality setting to MediaRecorder constraints
export function getRecordingConstraints(options: RecordingOptions): MediaStreamConstraints {
  const video: MediaTrackConstraints = {
    mediaSource: 'screen',
  };

  // Set quality constraints
  switch (options.quality) {
    case 'low':
      video.width = { max: 1280 };
      video.height = { max: 720 };
      video.frameRate = { max: 15 };
      break;
    case 'medium':
      video.width = { max: 1920 };
      video.height = { max: 1080 };
      video.frameRate = { max: 30 };
      break;
    case 'high':
      video.width = { max: 2560 };
      video.height = { max: 1440 };
      video.frameRate = { max: 30 };
      break;
    case 'ultra':
      video.width = { max: 3840 };
      video.height = { max: 2160 };
      video.frameRate = { max: 60 };
      break;
  }

  return {
    video,
    audio: options.includeAudio,
  };
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration for display (seconds to HH:MM:SS or MM:SS)
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Generate a unique recording filename
export function generateRecordingFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5); // Remove milliseconds and 'Z'

  return `recording_${timestamp}.webm`;
}

// Validate recording options
export function validateRecordingOptions(options: RecordingOptions): string[] {
  const errors: string[] = [];

  if (options.maxDuration && options.maxDuration > RECORDER_CONFIG.maxDuration) {
    errors.push(`Maximum duration cannot exceed ${RECORDER_CONFIG.maxDuration / 60} minutes`);
  }

  if (options.maxDuration && options.maxDuration < 1) {
    errors.push('Minimum duration is 1 second');
  }

  return errors;
}

// Format date for display
export function formatDate(date: Date): string {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  // If less than 24 hours ago, show relative time
  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes}m ago`;
    } else {
      return `${Math.floor(diffInHours)}h ago`;
    }
  }

  // Otherwise show date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Create a download link for a blob
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}