// TypeScript interfaces for the paint application

// Core drawing data structures
export interface Point {
  x: number;
  y: number;
  pressure?: number; // For future stylus support
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
}

export interface InsertedImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  timestamp: number;
}

export interface DrawingState {
  strokes: Stroke[];
  images: InsertedImage[];
  canvasSize: { width: number; height: number };
  backgroundColor: string;
}

// Canvas state management
export interface CanvasState {
  isDrawing: boolean;
  currentTool: ToolType;
  pencilColor: string;
  pencilWidth: number;
  canvasHistory: ImageData[];
  historyStep: number;
  insertedImages: InsertedImage[];
}

// Tool settings and configurations
export type ToolType = 'pencil' | 'eraser' | 'image';

export interface ToolSettings {
  pencil: {
    color: string;
    width: number;
  };
  eraser: {
    width: number;
  };
  image: {
    maxFileSize: number; // in bytes
    allowedTypes: string[];
  };
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  maxHistorySteps: number;
}

// Canvas operations
export interface DrawingOperations {
  startStroke(point: Point): void;
  addPointToStroke(point: Point): void;
  endStroke(): void;
  drawStroke(stroke: Stroke): void;
  clearCanvas(): void;
  insertImage(file: File, position: Point): Promise<void>;
  exportCanvas(): Blob;
  undo(): void;
  redo(): void;
}

export interface CanvasEventHandlers {
  onMouseDown: (event: MouseEvent) => void;
  onMouseMove: (event: MouseEvent) => void;
  onMouseUp: (event: MouseEvent) => void;
  onTouchStart: (event: TouchEvent) => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchEnd: (event: TouchEvent) => void;
}

// Storage object structure (unified storage for all file types)
export interface StorageObject {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  object_type: string; // 'painting', 'recording', 'image', 'document', etc.
  metadata: Record<string, any>; // Flexible metadata (drawing_data for paintings, duration for videos, etc.)
  thumbnail_url: string | null; // URL to thumbnail image
  is_public: boolean;
  share_token: string | null;
  application_id: string | null; // Optional application association
  created_at: Date;
  updated_at: Date;
}

// Saved painting data structures - now based on storage_objects
export interface SavedPainting {
  id: string;
  name: string;
  userId: string;
  drawingData: DrawingState;
  thumbnail: string | null; // URL to thumbnail image (not base64)
  createdAt: Date;
  updatedAt: Date;
  size: number; // File size in bytes
  isPublic: boolean;
  shareToken?: string | null; // Private share token
  fileName?: string; // Actual filename in storage
  applicationId?: string | null; // Optional application association
}

// API response types
export interface PaintingListResponse {
  paintings: SavedPainting[];
  total: number;
  page: number;
  limit: number;
}

export interface PaintingResponse {
  painting: SavedPainting;
}

export interface SavePaintingRequest {
  name: string;
  drawingData: DrawingState;
  thumbnail?: string; // URL to thumbnail image
  isPublic?: boolean;
  applicationId?: string; // Optional application association
}

export interface UpdatePaintingRequest {
  name?: string;
  drawingData?: DrawingState;
  thumbnail?: string; // URL to thumbnail image
  isPublic?: boolean;
  applicationId?: string; // Optional application association
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Utility types for canvas operations
export type CanvasExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportOptions {
  format: CanvasExportFormat;
  quality?: number; // 0-1 for jpeg/webp
  width?: number;
  height?: number;
}

export interface ImageUploadResult {
  success: boolean;
  imageId?: string;
  error?: string;
}

export interface CanvasHistory {
  states: ImageData[];
  currentIndex: number;
  maxStates: number;
}

// Event types for canvas interactions
export interface CanvasPointerEvent {
  x: number;
  y: number;
  pressure?: number;
  type: 'mouse' | 'touch';
}

export interface ToolChangeEvent {
  previousTool: ToolType;
  newTool: ToolType;
  settings: ToolSettings;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileValidationOptions {
  maxSize: number;
  allowedTypes: string[];
  maxDimensions?: {
    width: number;
    height: number;
  };
}