/**
 * Image processing types and interfaces
 */

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  maintainAspectRatio?: boolean;
}

export interface ThumbnailOptions extends ImageProcessingOptions {
  width: number;
  height: number;
}

export interface ImageProcessingResult {
  success: boolean;
  outputPath?: string;
  outputBuffer?: Uint8Array;
  error?: string;
  metadata?: {
    originalSize: number;
    processedSize: number;
    originalDimensions?: { width: number; height: number };
    processedDimensions?: { width: number; height: number };
    processingTime: number;
  };
}

export interface ImageToolRequest {
  tool: string;
  inputPath?: string;
  inputBuffer?: Uint8Array;
  options: Record<string, any>;
  outputFormat?: "file" | "buffer" | "base64";
}

export interface ImageToolResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export type ImageProcessingFunction = (
  input: string | Uint8Array,
  options: Record<string, any>
) => Promise<ImageProcessingResult>;

export interface ImageTool {
  name: string;
  description: string;
  process: ImageProcessingFunction;
  supportedFormats: string[];
  defaultOptions: Record<string, any>;
}