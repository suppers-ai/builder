import type { SavedPainting, SavePaintingRequest, DrawingState } from "../types/paint.ts";
import { getAuthClient } from "./auth.ts";
import { showError, showSuccess, showWarning } from "./toast-manager.ts";

// API utility functions for paint application
// Base URL for centralized API
const API_BASE_URL = 'http://127.0.0.1:54321/functions/v1/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Enhanced error handling for API operations
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// User-friendly error messages for common API errors
export function getErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You don\'t have permission to perform this action';
      case 404:
        return 'The requested item was not found';
      case 413:
        return 'The file is too large to upload';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Server error. Please try again later';
      case 503:
        return 'Service temporarily unavailable';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
  
  if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
    return 'Network error. Please check your connection and try again';
  }
  
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again';
  }
  
  return error.message || 'An unexpected error occurred';
}

// Retry logic for failed API requests
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}

export interface PaintingListResponse {
  paintings: SavedPainting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch user's paintings with pagination
 */
export async function fetchPaintings(
  page: number = 1,
  limit: number = 20,
  includePublic: boolean = false,
): Promise<ApiResponse<PaintingListResponse>> {
  try {
    return await withRetry(async () => {
      const authClient = getAuthClient();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        include_public: includePublic.toString(),
      });

      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        throw new ApiError('Authentication required', 401);
      }

      const response = await fetch(`${API_BASE_URL}/storage/paint?list=true`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      });

      const apiData = await response.json();

      if (!response.ok) {
        const apiError = new ApiError(
          apiData.error || "Failed to fetch paintings",
          response.status,
          apiData.code
        );
        throw apiError;
      }

      if (!apiData.success || !apiData.data || !apiData.data.files) {
        return {
          success: true,
          data: {
            paintings: [],
            total: 0,
            page: page,
            limit: limit,
            totalPages: 1,
          }
        };
      }

      // Transform storage objects to SavedPainting format
      // For now, we'll need to fetch the actual painting data for each file
      // This is not optimal but necessary to get the painting metadata
      const paintings: SavedPainting[] = [];
      
      for (const file of apiData.data.files.slice((page - 1) * limit, page * limit)) {
        try {
          // Get the actual painting data from the file using download endpoint
          const paintingResponse = await fetch(`${API_BASE_URL}/storage/paint/${file.name}?download=true`, {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-User-ID': userId,
            },
          });

          if (paintingResponse.ok) {
            const paintingText = await paintingResponse.text();
            const paintingData = JSON.parse(paintingText);
            if (paintingData && typeof paintingData === 'object') {
              paintings.push({
                id: file.id,
                name: paintingData.name || file.name.replace('.json', ''),
                drawingData: paintingData.drawingData || { strokes: [], images: [], canvasSize: { width: 800, height: 600 }, backgroundColor: '#ffffff' },
                thumbnail: paintingData.thumbnail,
                isPublic: file.isPublic || false,
                shareToken: file.shareToken || null,
                fileName: file.name,
                createdAt: file.createdAt,
                updatedAt: file.lastModified,
                size: file.size,
                userId: userId,
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to load painting data for ${file.name}:`, error);
          // Create a basic painting entry even if we can't load the data
          paintings.push({
            id: file.id,
            name: file.name.replace('.json', ''),
            drawingData: { strokes: [], images: [], canvasSize: { width: 800, height: 600 }, backgroundColor: '#ffffff' },
            thumbnail: undefined,
            isPublic: file.isPublic || false,
            shareToken: file.shareToken || null,
            fileName: file.name,
            createdAt: file.createdAt,
            updatedAt: file.lastModified,
            size: file.size,
            userId: userId,
          });
        }
      }

      const totalFiles = apiData.data.files.length;
      const totalPages = Math.ceil(totalFiles / limit);

      return {
        success: true,
        data: {
          paintings,
          total: totalFiles,
          page: page,
          limit: limit,
          totalPages: totalPages,
        }
      };
    });
  } catch (error) {
    console.error("Fetch paintings error:", error);
    const errorMessage = getErrorMessage(error);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Fetch a specific painting by ID
 */
export async function fetchPainting(paintingId: string): Promise<ApiResponse<{ painting: SavedPainting }>> {
  try {
    return await withRetry(async () => {
      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        throw new ApiError('Authentication required', 401);
      }
      
      // First get the file info to get the filename
      const listResponse = await fetch(`${API_BASE_URL}/storage/paint?list=true`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      });

      if (!listResponse.ok) {
        throw new ApiError('Failed to fetch painting list', listResponse.status);
      }

      const listData = await listResponse.json();
      const file = listData.data?.files?.find((f: any) => f.id === paintingId);
      
      if (!file) {
        throw new ApiError('Painting not found', 404);
      }

      // Now download the actual painting content
      const response = await fetch(`${API_BASE_URL}/storage/paint/${file.name}?download=true`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        const apiError = new ApiError(
          errorData.error || "Failed to fetch painting content",
          response.status,
          errorData.code
        );
        throw apiError;
      }

      const paintingText = await response.text();
      const paintingData = JSON.parse(paintingText);

      // Transform to SavedPainting format
      const painting: SavedPainting = {
        id: file.id,
        name: paintingData.name || file.name.replace('.json', ''),
        drawingData: paintingData.drawingData || { strokes: [], images: [], canvasSize: { width: 800, height: 600 }, backgroundColor: '#ffffff' },
        thumbnail: paintingData.thumbnail,
        isPublic: file.isPublic || false,
        shareToken: file.shareToken || null,
        fileName: file.name,
        createdAt: file.createdAt,
        updatedAt: file.lastModified,
        size: file.size,
        userId: userId,
      };

      return {
        success: true,
        data: { painting },
      };
    });
  } catch (error) {
    console.error("Fetch painting error:", error);
    const errorMessage = getErrorMessage(error);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Save a new painting with automatic thumbnail generation
 */
export async function savePainting(
  name: string,
  drawingData: DrawingState,
  canvas?: HTMLCanvasElement,
  isPublic: boolean = false,
  applicationId?: string,
): Promise<ApiResponse<{ painting: SavedPainting }>> {
  try {
    // Validate painting name
    const nameValidation = validatePaintingName(name);
    if (!nameValidation.isValid) {
      const errorMessage = nameValidation.error || 'Invalid painting name';
      showError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Check drawing data size
    const dataSize = estimateDrawingSize(drawingData);
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (dataSize > maxSize) {
      const errorMessage = `Drawing data is too large (${formatFileSize(dataSize)}). Maximum size is ${formatFileSize(maxSize)}.`;
      showError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    return await withRetry(async () => {
      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        throw new ApiError('Authentication required', 401);
      }
      
      // Generate thumbnail if canvas is provided
      let thumbnail: string | undefined;
      if (canvas) {
        try {
          thumbnail = generateThumbnail(canvas, {
            maxWidth: 200,
            maxHeight: 200,
            quality: 0.8,
            format: 'jpeg',
            padding: 4,
          });
        } catch (thumbnailError) {
          console.warn('Failed to generate thumbnail:', thumbnailError);
          showWarning('Could not generate thumbnail, but painting will still be saved');
        }
      }

      // Create the painting data to save
      const paintingData = {
        name,
        drawingData,
        thumbnail,
        isPublic,
        applicationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Convert painting data to JSON and create a file
      const jsonString = JSON.stringify(paintingData, null, 2);
      const filename = `${name.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.json`;
      const file = new File([jsonString], filename, {
        type: 'application/json'
      });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/storage/paint`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = new ApiError(
          data.error || "Failed to save painting",
          response.status,
          data.code
        );
        throw apiError;
      }

      // Show success message
      showSuccess(`"${name}" saved successfully!`);

      return {
        success: true,
        data,
      };
    });
  } catch (error) {
    console.error("Save painting error:", error);
    const errorMessage = getErrorMessage(error);
    showError(`Failed to save painting: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Save a painting with custom thumbnail options
 */
export async function savePaintingWithThumbnail(
  name: string,
  drawingData: DrawingState,
  canvas: HTMLCanvasElement,
  thumbnailOptions: ThumbnailOptions = {},
  isPublic: boolean = false,
  applicationId?: string,
): Promise<ApiResponse<{ painting: SavedPainting }>> {
  try {
    // Validate painting name
    const nameValidation = validatePaintingName(name);
    if (!nameValidation.isValid) {
      const errorMessage = nameValidation.error || 'Invalid painting name';
      showError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    return await withRetry(async () => {
      const authClient = getAuthClient();
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        throw new ApiError('Authentication required', 401);
      }
      
      let thumbnail: string;
      try {
        thumbnail = generateThumbnail(canvas, thumbnailOptions);
      } catch (thumbnailError) {
        console.warn('Failed to generate custom thumbnail:', thumbnailError);
        showWarning('Could not generate custom thumbnail, using default settings');
        thumbnail = generateThumbnail(canvas); // Fallback to default
      }

      // Create the painting data to save
      const paintingData = {
        name,
        drawingData,
        thumbnail,
        isPublic,
        applicationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Convert painting data to JSON and create a file
      const jsonString = JSON.stringify(paintingData, null, 2);
      const filename = `${name.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.json`;
      const file = new File([jsonString], filename, {
        type: 'application/json'
      });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/storage/paint`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = new ApiError(
          data.error || "Failed to save painting",
          response.status,
          data.code
        );
        throw apiError;
      }

      showSuccess(`"${name}" saved successfully!`);

      return {
        success: true,
        data,
      };
    });
  } catch (error) {
    console.error("Save painting error:", error);
    const errorMessage = getErrorMessage(error);
    showError(`Failed to save painting: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete a painting
 */
export async function deletePainting(paintingId: string): Promise<ApiResponse<{ message: string }>> {
  try {
    return await withRetry(async () => {
      const authClient = getAuthClient();
      
      const userId = authClient.getUserId();
      const accessToken = await authClient.getAccessToken();

      if (!userId || !accessToken) {
        throw new ApiError('Authentication required', 401);
      }

      // First, we need to get the filename from the painting ID
      // Since we're now using file-based storage, we need the actual filename
      const listResponse = await fetch(`${API_BASE_URL}/storage/paint?list=true`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      });

      if (!listResponse.ok) {
        throw new ApiError('Failed to fetch painting list for deletion', listResponse.status);
      }

      const listData = await listResponse.json();
      const file = listData.data?.files?.find((f: any) => f.id === paintingId);
      
      if (!file) {
        throw new ApiError('Painting not found', 404);
      }

      const response = await fetch(`${API_BASE_URL}/storage/paint/${file.name}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = new ApiError(
          data.error || "Failed to delete painting",
          response.status,
          data.code
        );
        throw apiError;
      }

      showSuccess('Painting deleted successfully');

      return {
        success: true,
        data,
      };
    });
  } catch (error) {
    console.error("Delete painting error:", error);
    const errorMessage = getErrorMessage(error);
    showError(`Failed to delete painting: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Enhanced thumbnail generation options
 */
export interface ThumbnailOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  backgroundColor?: string;
  padding?: number;
}

/**
 * Generate a thumbnail from canvas with enhanced options
 */
export function generateThumbnail(
  canvas: HTMLCanvasElement, 
  options: ThumbnailOptions = {}
): string {
  const {
    maxWidth = 200,
    maxHeight = 200,
    quality = 0.8,
    format = 'jpeg',
    backgroundColor = '#ffffff',
    padding = 4,
  } = options;

  // Create a temporary canvas for the thumbnail
  const thumbnailCanvas = document.createElement("canvas");
  const ctx = thumbnailCanvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Failed to get canvas context for thumbnail");
  }

  // Calculate thumbnail dimensions maintaining aspect ratio
  const aspectRatio = canvas.width / canvas.height;
  let thumbWidth = maxWidth - (padding * 2);
  let thumbHeight = maxHeight - (padding * 2);

  if (aspectRatio > thumbWidth / thumbHeight) {
    // Landscape - fit to width
    thumbHeight = thumbWidth / aspectRatio;
  } else {
    // Portrait or square - fit to height
    thumbWidth = thumbHeight * aspectRatio;
  }

  // Set final canvas size including padding
  thumbnailCanvas.width = thumbWidth + (padding * 2);
  thumbnailCanvas.height = thumbHeight + (padding * 2);

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

  // Enable high-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the scaled image with padding
  ctx.drawImage(
    canvas, 
    padding, 
    padding, 
    thumbWidth, 
    thumbHeight
  );

  // Return as base64 data URL with specified format and quality
  const mimeType = `image/${format}`;
  return thumbnailCanvas.toDataURL(mimeType, quality);
}

/**
 * Generate multiple thumbnail sizes for different use cases
 */
export function generateThumbnailSet(canvas: HTMLCanvasElement): {
  small: string;
  medium: string;
  large: string;
} {
  return {
    small: generateThumbnail(canvas, { maxWidth: 100, maxHeight: 100, quality: 0.7 }),
    medium: generateThumbnail(canvas, { maxWidth: 200, maxHeight: 200, quality: 0.8 }),
    large: generateThumbnail(canvas, { maxWidth: 400, maxHeight: 400, quality: 0.9 }),
  };
}

/**
 * Generate thumbnail from drawing state without canvas
 */
export function generateThumbnailFromDrawingState(
  drawingState: DrawingState,
  options: ThumbnailOptions = {}
): string {
  const {
    maxWidth = 200,
    maxHeight = 200,
    quality = 0.8,
    format = 'jpeg',
    backgroundColor = '#ffffff',
  } = options;

  // Create a temporary canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Failed to get canvas context for thumbnail generation");
  }

  // Set canvas size to match drawing state
  canvas.width = drawingState.canvasSize.width;
  canvas.height = drawingState.canvasSize.height;

  // Fill background
  ctx.fillStyle = drawingState.backgroundColor || backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Configure context for high-quality rendering
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw all strokes
  drawingState.strokes.forEach(stroke => {
    if (stroke.points.length === 0) return;
    
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    
    if (stroke.points.length === 1) {
      // Single point - draw a small circle
      const point = stroke.points[0];
      ctx.arc(point.x, point.y, stroke.width / 2, 0, 2 * Math.PI);
      ctx.fill();
    } else if (stroke.points.length === 2) {
      // Simple line for two points
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
      ctx.stroke();
    } else {
      // Smooth curve for multiple points
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const currentPoint = stroke.points[i];
        const nextPoint = stroke.points[i + 1];
        
        const controlX = (currentPoint.x + nextPoint.x) / 2;
        const controlY = (currentPoint.y + nextPoint.y) / 2;
        
        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
      }
      
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
    }
  });

  // Note: Images would need to be loaded asynchronously, so we skip them for now
  // In a real implementation, you'd need to handle image loading

  // Generate thumbnail from the rendered canvas
  return generateThumbnail(canvas, options);
}

/**
 * Validate painting name
 */
export function validatePaintingName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Painting name is required" };
  }

  if (name.length > 255) {
    return { isValid: false, error: "Painting name must be 255 characters or less" };
  }

  return { isValid: true };
}

/**
 * Estimate drawing data size
 */
export function estimateDrawingSize(drawingData: DrawingState): number {
  const jsonString = JSON.stringify(drawingData);
  return new TextEncoder().encode(jsonString).length;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}