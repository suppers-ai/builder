import { useEffect, useState, useRef } from "preact/hooks";
import { DEFAULT_PENCIL_COLOR, DEFAULT_PENCIL_WIDTH } from "../lib/paint-utils.ts";
import { validateImageFile, loadImageFile, downloadCanvasAsImage, generateCanvasFilename } from "../lib/paint-utils.ts";
import { savePainting } from "../lib/api-utils.ts";
import { getAuthClient, isAuthenticated } from "../lib/auth.ts";
import { showError, showSuccess, showWarning, showInfo } from "../lib/toast-manager.ts";
import type { FileValidationOptions, CanvasExportFormat, DrawingState } from "../types/paint.ts";
import { Image, Upload, AlertCircle, Download, Trash2, LogIn } from "lucide-preact";

interface ToolbarIslandProps {
  canUndo?: boolean;
  canRedo?: boolean;
  initialColor?: string;
  initialWidth?: number;
}

// Predefined color palette for quick selection
const COLOR_PALETTE = [
  '#000000', // Black (default)
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080', // Gray
  '#FFFFFF', // White
];

// Image validation options
const IMAGE_VALIDATION_OPTIONS: FileValidationOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxDimensions: {
    width: 2000,
    height: 2000,
  },
};

export default function ToolbarIsland({
  canUndo = false,
  canRedo = false,
  initialColor = DEFAULT_PENCIL_COLOR,
  initialWidth = DEFAULT_PENCIL_WIDTH,
}: ToolbarIslandProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [customColor, setCustomColor] = useState(initialColor);
  const [pencilWidth, setPencilWidth] = useState(initialWidth);
  
  // Test island hydration
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    console.log('🏝️ ToolbarIsland hydrated!');
    console.log('🎨 COLOR_PALETTE:', COLOR_PALETTE);
    setIsHydrated(true);
    // Visual feedback that island is working
    document.title = '🎨 Paint App - Interactive Tools Ready!';
  }, []);
  
  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication state
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<any>(null);

  // Save functionality state
  const [saveFormat, setSaveFormat] = useState<CanvasExportFormat>('png');
  const [customFilename, setCustomFilename] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveToServer, setSaveToServer] = useState(false);

  // Clear functionality state
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Initialize authentication and set default color on application load
  useEffect(() => {
    // Emit initial color change event
    window.dispatchEvent(new CustomEvent('paintColorChange', { detail: selectedColor }));

    // Initialize authentication
    const initAuth = async () => {
      try {
        const client = getAuthClient();
        setAuthClient(client);
        
        // Check initial authentication state
        const authenticated = await isAuthenticated();
        setIsUserAuthenticated(authenticated);

        // Listen for authentication state changes
        client.addEventListener('login', () => {
          setIsUserAuthenticated(true);
        });

        client.addEventListener('logout', () => {
          setIsUserAuthenticated(false);
        });

        // Initialize the auth client
        await client.initialize();
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
      }
    };

    initAuth();
  }, []);

  // Handle color selection from palette
  const handleColorSelect = (color: string) => {
    console.log('🎨 Color selected:', color);
    setSelectedColor(color);
    setCustomColor(color);
    // Emit color change event
    window.dispatchEvent(new CustomEvent('paintColorChange', { detail: color }));
    console.log('🎨 Color change event dispatched');
  };

  // Handle custom color input change
  const handleCustomColorChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const color = target.value;
    setCustomColor(color);
    setSelectedColor(color);
    // Emit color change event
    window.dispatchEvent(new CustomEvent('paintColorChange', { detail: color }));
  };

  // Handle width change
  const handleWidthChange = (event: Event) => {
    console.log('📏 Width changed:', event);
    const target = event.target as HTMLInputElement;
    const width = parseInt(target.value, 10);
    console.log('📏 New width:', width);
    setPencilWidth(width);
    // Emit width change event
    window.dispatchEvent(new CustomEvent('paintWidthChange', { detail: width }));
    console.log('📏 Width change event dispatched');
  };

  // Handle image upload button click
  const handleImageUploadClick = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    // Clear previous error
    setUploadError(null);
    setIsUploading(true);

    try {
      // Validate file
      const validation = validateImageFile(file, IMAGE_VALIDATION_OPTIONS);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ');
        setUploadError(errorMessage);
        showError(`Image validation failed: ${errorMessage}`);
        return;
      }

      // Show loading info
      showInfo(`Loading image: ${file.name}...`);

      // Load and process image
      const result = await loadImageFile(file);
      if (!result.success) {
        const errorMessage = result.error || 'Failed to load image';
        setUploadError(errorMessage);
        showError(`Failed to load image: ${errorMessage}`);
        return;
      }

      // Read file as data URL for canvas insertion
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          // Use the global handler set by PaintCanvasIsland
          console.log('🖼️ Attempting to insert image, global function available:', !!(window as any).__paintCanvasImageInsert);
          if ((window as any).__paintCanvasImageInsert) {
            (window as any).__paintCanvasImageInsert(file, dataUrl);
            showSuccess(`Image "${file.name}" inserted successfully!`);
            console.log('🖼️ Image insertion called successfully');
          } else {
            console.error('🖼️ Global image insert function not available');
            showError('Image insertion function not available');
          }
        }
      };
      reader.onerror = () => {
        const errorMessage = 'Failed to read image file';
        setUploadError(errorMessage);
        showError(errorMessage);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadError(errorMessage);
      showError(`Image upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be selected again
      if (target) {
        target.value = '';
      }
    }
  };

  // Handle save format change
  const handleSaveFormatChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    setSaveFormat(target.value as CanvasExportFormat);
  };

  // Handle custom filename change
  const handleFilenameChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setCustomFilename(target.value);
  };

  // Handle login button click
  const handleLoginClick = () => {
    if (authClient) {
      authClient.showLoginModal();
    }
  };

  // Handle save button click
  const handleSaveClick = async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      // Get canvas from global handler
      const canvas = (window as any).__paintCanvasSave?.();
      if (!canvas) {
        const errorMessage = 'Canvas not available for saving';
        setSaveError(errorMessage);
        showError(errorMessage);
        return;
      }

      // Generate filename
      const filename = customFilename.trim() || generateCanvasFilename('painting', saveFormat);
      
      // Show saving progress
      showInfo('Saving artwork...');
      
      // Always download locally first
      try {
        downloadCanvasAsImage(canvas, filename.replace(/\.[^/.]+$/, ''), saveFormat, 0.9);
        showSuccess(`Artwork downloaded as "${filename}"`);
      } catch (downloadError) {
        const errorMessage = 'Failed to download artwork locally';
        showError(errorMessage);
        setSaveError(errorMessage);
        return;
      }
      
      // If user is authenticated and wants to save to server
      if (isUserAuthenticated && saveToServer) {
        try {
          showInfo('Saving to server...');
          
          // Get drawing state from global handler
          const getDrawingState = (window as any).__paintCanvasGetDrawingState;
          if (getDrawingState && typeof getDrawingState === 'function') {
            const drawingState: DrawingState = getDrawingState();
            
            // Save to server (this will show its own success/error toasts)
            const result = await savePainting(
              filename.replace(/\.[^/.]+$/, ''), // Remove extension for server storage
              drawingState,
              canvas,
              false // isPublic - default to private
            );

            if (!result.success) {
              const errorMessage = `Server save failed: ${result.error}`;
              setSaveError(errorMessage);
              showWarning('Local save completed, but server save failed');
            }
          } else {
            const errorMessage = 'Drawing state not available for server save';
            setSaveError(errorMessage);
            showWarning('Local save completed, but server save failed: Drawing state not available');
          }
        } catch (serverError) {
          const errorMessage = `Server save failed: ${serverError instanceof Error ? serverError.message : 'Unknown error'}`;
          setSaveError(errorMessage);
          showWarning('Local save completed, but server save failed');
        }
      }
      
      // Save completed successfully

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save canvas';
      setSaveError(errorMessage);
      showError(`Save failed: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle clear button click - show confirmation dialog
  const handleClearClick = () => {
    setShowClearConfirmation(true);
  };

  // Handle clear confirmation
  const handleClearConfirm = async () => {
    setIsClearing(true);
    
    try {
      showInfo('Clearing canvas...');
      
      // Get clear function from global handler
      const clearCanvas = (window as any).__paintCanvasClear;
      if (clearCanvas && typeof clearCanvas === 'function') {
        const success = clearCanvas();
        if (success) {
          showSuccess('Canvas cleared successfully!');
        } else {
          showError('Failed to clear canvas');
        }
      } else {
        showError('Clear function not available');
      }
    } catch (error) {
      console.error('Failed to clear canvas:', error);
      showError(`Failed to clear canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsClearing(false);
      setShowClearConfirmation(false);
    }
  };

  // Handle clear cancellation
  const handleClearCancel = () => {
    setShowClearConfirmation(false);
  };

  return (
    <div class="space-y-4 sm:space-y-6">
      {/* Color Selection Section */}
      <div class="space-y-3">

        {/* Custom Color Picker */}
        <div class="space-y-2">
          <label class="text-sm text-base-content/70">Custom Color</label>
          <div class="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              class="w-12 h-8 rounded border border-base-300 cursor-pointer"
              title="Pick custom color"
              aria-label="Custom color picker"
            />
            <input
              type="text"
              value={customColor}
              onChange={handleCustomColorChange}
              class="input input-sm input-bordered flex-1 font-mono text-xs"
              placeholder="#000000"
              pattern="^#[0-9A-Fa-f]{6}$"
              title="Enter hex color code"
              aria-label="Hex color input"
            />
          </div>
        </div>

      </div>

      {/* Pencil Width Section */}
      <div class="space-y-3">
        <h4 class="font-medium text-base-content flex items-center gap-2">
          <div
            class="w-4 h-4 rounded-full border border-base-300"
            style={{
              backgroundColor: selectedColor,
              width: `${Math.max(4, Math.min(16, pencilWidth))}px`,
              height: `${Math.max(4, Math.min(16, pencilWidth))}px`,
            }}
          ></div>
          Pencil Width
        </h4>
        <div class="space-y-3">
          <input
            type="range"
            min="1"
            max="20"
            value={pencilWidth}
            onChange={handleWidthChange}
            class="width-slider range-sm w-full"
            style={{ "--value": `${(pencilWidth / 20) * 100}%` }}
            aria-label="Pencil width"
            aria-valuemin="1"
            aria-valuemax="20"
            aria-valuenow={pencilWidth}
            aria-valuetext={`${pencilWidth} pixels`}
          />
          <div class="flex justify-between items-center text-xs text-base-content/60">
            <span>1px</span>
            <span class="font-medium text-sm px-2 py-1 bg-base-100 rounded">
              {pencilWidth}px
            </span>
            <span>20px</span>
          </div>
          {/* Visual width preview */}
          <div class="flex justify-center py-3 bg-base-100 rounded">
            <div
              class="rounded-full transition-all duration-200"
              style={{
                width: `${Math.max(2, pencilWidth)}px`,
                height: `${Math.max(2, pencilWidth)}px`,
                backgroundColor: selectedColor,
                border: selectedColor === '#FFFFFF' ? '1px solid #ccc' : 'none',
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Image Insertion Section */}
      <div class="space-y-3">
        <h4 class="font-medium text-base-content flex items-center gap-2">
          <Image class="w-4 h-4" />
          Insert Image
        </h4>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_VALIDATION_OPTIONS.allowedTypes.join(',')}
          onChange={handleFileSelect}
          class="hidden"
          aria-label="Select image file"
        />
        
        {/* Upload button */}
        <button
          onClick={() => {
            handleImageUploadClick();
          }}
          disabled={isUploading}
          class={`btn btn-outline btn-sm w-full transition-all duration-200 ${isUploading ? 'loading' : 'hover:btn-primary'}`}
          aria-label="Upload image"
        >
          {isUploading ? (
            <>
              <span class="loading loading-spinner loading-xs"></span>
              Uploading...
            </>
          ) : (
            <>
              <Upload class="w-4 h-4" />
              <span class="hidden sm:inline">Upload Image</span>
              <span class="sm:hidden">Upload</span>
            </>
          )}
        </button>
        
        {/* Upload error display */}
        {uploadError && (
          <div class="alert alert-error alert-sm">
            <AlertCircle class="w-4 h-4" />
            <span class="text-xs">{uploadError}</span>
          </div>
        )}
        
        {/* Upload guidelines - Collapsible on mobile */}
        <details class="text-xs text-base-content/50">
          <summary class="cursor-pointer hover:text-base-content/70 transition-colors">
            Upload Guidelines & Tips
          </summary>
          <div class="mt-2 space-y-1 pl-2 border-l-2 border-base-300">
            <div>Max size: 5MB</div>
            <div>Formats: JPG, PNG, GIF, WebP</div>
            <div>Max dimensions: 2000x2000px</div>
            <div class="mt-2 pt-1 border-t border-base-300/50">
              <div class="font-medium text-primary">Drawing Tips:</div>
              <div>• Draw directly over images</div>
              <div>• Hold Alt/Cmd + click to move images</div>
            </div>
          </div>
        </details>
      </div>

      {/* Clear Canvas Section */}
      <div class="space-y-3">
        <h4 class="font-medium text-base-content flex items-center gap-2">
          <Trash2 class="w-4 h-4 text-error" />
          Clear Canvas
        </h4>
        
        {/* Clear Button */}
        <button
          onClick={handleClearClick}
          disabled={isClearing}
          class={`btn btn-error btn-outline btn-sm w-full transition-all duration-200 ${
            isClearing ? 'loading' : 'hover:btn-error hover:scale-105 active:scale-95'
          }`}
          aria-label="Clear canvas"
        >
          {isClearing ? (
            <>
              <span class="loading loading-spinner loading-xs"></span>
              Clearing...
            </>
          ) : (
            <>
              <Trash2 class="w-4 h-4" />
              <span class="hidden sm:inline">Clear Canvas</span>
              <span class="sm:hidden">Clear</span>
            </>
          )}
        </button>
        
      </div>

      {/* Save Canvas Section */}
      <div class="space-y-3">
        <h4 class="font-medium text-base-content flex items-center gap-2">
          <Download class="w-4 h-4 text-primary" />
          Save Artwork
        </h4>
        
        {/* Format and Filename - Responsive Layout */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Format Selection */}
          <div class="space-y-2">
            <label class="text-sm text-base-content/70">Format</label>
            <select
              value={saveFormat}
              onChange={handleSaveFormatChange}
              class="select select-sm select-bordered w-full"
              aria-label="Select save format"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          {/* Custom Filename */}
          <div class="space-y-2">
            <label class="text-sm text-base-content/70">Filename</label>
            <input
              type="text"
              value={customFilename}
              onChange={handleFilenameChange}
              placeholder="my-painting"
              class="input input-sm input-bordered w-full"
              aria-label="Custom filename"
            />
          </div>
        </div>

        {/* Authentication Status and Server Save Option */}
        {isUserAuthenticated ? (
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-xs text-success">
              <div class="w-2 h-2 bg-success rounded-full"></div>
              <span>Logged in - Server save available</span>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToServer}
                onChange={(e) => setSaveToServer((e.target as HTMLInputElement).checked)}
                class="checkbox checkbox-sm checkbox-primary"
              />
              <span class="text-sm text-base-content/70">Also save to server</span>
            </label>
          </div>
        ) : (
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-xs text-base-content/50">
              <div class="w-2 h-2 bg-base-content/30 rounded-full"></div>
              <span>Not logged in - Local save only</span>
            </div>
            <button
              onClick={handleLoginClick}
              class="btn btn-outline btn-sm w-full"
              aria-label="Login to save to server"
            >
              <LogIn class="w-4 h-4" />
              <span class="text-xs">Login to save paintings online</span>
            </button>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          disabled={isSaving}
          class={`btn btn-primary btn-sm w-full transition-all duration-200 ${
            isSaving ? 'loading' : 'hover:btn-primary hover:scale-105 active:scale-95'
          }`}
          title="Save canvas as image (Ctrl+S)"
          aria-label="Save canvas as image"
        >
          {isSaving ? (
            <>
              <span class="loading loading-spinner loading-xs"></span>
              Saving...
            </>
          ) : (
            <>
              <Download class="w-4 h-4" />
              <span class="hidden sm:inline">
                {isUserAuthenticated && saveToServer ? 'Save & Download + Server' : 'Save & Download'}
              </span>
              <span class="sm:hidden">Save</span>
            </>
          )}
        </button>

        {/* Save error display */}
        {saveError && (
          <div class="alert alert-error alert-sm">
            <AlertCircle class="w-4 h-4" />
            <span class="text-xs">{saveError}</span>
          </div>
        )}

        {/* Save format info - Collapsible */}
        <details class="text-xs text-base-content/50">
          <summary class="cursor-pointer hover:text-base-content/70 transition-colors">
            Format Information
          </summary>
          <div class="mt-2 space-y-1 pl-2 border-l-2 border-primary/30">
            {saveFormat === 'png' && (
              <div>PNG: Best quality, larger file size</div>
            )}
            {saveFormat === 'jpeg' && (
              <div>JPEG: Smaller file, slight quality loss</div>
            )}
            {saveFormat === 'webp' && (
              <div>WebP: Modern format, good compression</div>
            )}
            <div class="text-xs opacity-70 mt-1">
              Extension will be added automatically
            </div>
          </div>
        </details>
      </div>

      {/* Keyboard Shortcuts Info - Collapsible */}
      <details class="text-xs text-base-content/50">
        <summary class="cursor-pointer hover:text-base-content/70 transition-colors">
          Keyboard Shortcuts
        </summary>
        <div class="mt-2 space-y-1 pl-2 border-l-2 border-primary/30">
          <div class="grid grid-cols-2 gap-2">
            <span class="font-mono">Ctrl/Cmd + Z</span>
            <span>Undo</span>
            <span class="font-mono">Ctrl/Cmd + Y</span>
            <span>Redo</span>
            <span class="font-mono">Ctrl/Cmd + S</span>
            <span>Save</span>
            <span class="font-mono">Ctrl/Cmd + G</span>
            <span>Gallery</span>
            <span class="font-mono">F1 or Shift + ?</span>
            <span>Help</span>
          </div>
          <div class="text-xs opacity-70 mt-1">
            Alt/Cmd + click to move images
          </div>
        </div>
      </details>

      {/* Clear Confirmation Dialog */}
      {showClearConfirmation && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-base-100 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div class="flex items-center gap-3 mb-4">
              <AlertCircle class="w-6 h-6 text-warning" />
              <h3 class="font-semibold text-lg">Clear Canvas?</h3>
            </div>
            
            <p class="text-base-content/70 mb-6">
              This will permanently remove all drawings and images from the canvas. 
              This action cannot be undone.
            </p>
            
            <div class="flex gap-3 justify-end">
              <button
                onClick={handleClearCancel}
                disabled={isClearing}
                class="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleClearConfirm}
                disabled={isClearing}
                class={`btn btn-error btn-sm ${isClearing ? 'loading' : ''}`}
              >
                {isClearing ? (
                  <>
                    <span class="loading loading-spinner loading-xs"></span>
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 class="w-4 h-4" />
                    Clear Canvas
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}