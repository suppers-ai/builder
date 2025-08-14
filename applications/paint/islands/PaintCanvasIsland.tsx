import { useEffect, useRef, useState, useCallback } from "preact/hooks";
import type {
  Stroke,
  CanvasState,
  CanvasPointerEvent,
  InsertedImage,
  Point,
  SavedPainting,
  DrawingState,
} from "../types/paint.ts";
import {
  initializeCanvas,
  drawStroke,
  attachCanvasEventListeners,
  DEFAULT_PENCIL_COLOR,
  DEFAULT_PENCIL_WIDTH,
  DEFAULT_CANVAS_SETTINGS,
  simplifyStroke,
  clampPointToCanvas,
  drawInsertedImage,
  CanvasHistoryManager,
  clearCanvas,
} from "../lib/paint-utils.ts";
import { OptimizedCanvasRenderer } from "../lib/canvas-renderer.ts";
import { AdvancedMemoryManager } from "../lib/memory-manager.ts";
import { PerformanceMonitor } from "../lib/performance-monitor.ts";

interface PaintCanvasIslandProps {
  width?: number;
  height?: number;
  className?: string;
  pencilColor?: string;
  pencilWidth?: number;
  loadedPainting?: SavedPainting | null;
}

export default function PaintCanvasIsland({
  width = DEFAULT_CANVAS_SETTINGS.width,
  height = DEFAULT_CANVAS_SETTINGS.height,
  className = "",
  pencilColor = DEFAULT_PENCIL_COLOR,
  pencilWidth = DEFAULT_PENCIL_WIDTH,
  loadedPainting = null,
}: PaintCanvasIslandProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const historyManagerRef = useRef<CanvasHistoryManager | null>(null);
  
  // Test island hydration
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    console.log('🏝️ PaintCanvasIsland hydrated!');
    setIsHydrated(true);
  }, []);
  
  // Performance optimization systems
  const rendererRef = useRef<OptimizedCanvasRenderer | null>(null);
  const memoryManagerRef = useRef<AdvancedMemoryManager | null>(null);
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  
  // Responsive canvas dimensions
  const [canvasDimensions, setCanvasDimensions] = useState({ width, height });
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  
  // Canvas state management
  const [canvasState, setCanvasState] = useState<CanvasState>({
    isDrawing: false,
    currentTool: 'pencil',
    pencilColor: pencilColor,
    pencilWidth: pencilWidth,
    canvasHistory: [],
    historyStep: -1,
    insertedImages: [],
  });

  // Update canvas state when props change
  useEffect(() => {
    console.log('🎨 PaintCanvasIsland received prop changes:', { pencilColor, pencilWidth });
    setCanvasState(prev => ({
      ...prev,
      pencilColor: pencilColor,
      pencilWidth: pencilWidth,
    }));
    console.log('🎨 PaintCanvasIsland updated canvas state');
  }, [pencilColor, pencilWidth]);

  // Listen for events directly in the canvas island
  useEffect(() => {
    console.log('🎨 PaintCanvasIsland setting up direct event listeners');
    
    const handleColorChange = (event: CustomEvent) => {
      console.log('🎨 Canvas received color change:', event.detail);
      setCanvasState(prev => ({
        ...prev,
        pencilColor: event.detail,
      }));
    };

    const handleWidthChange = (event: CustomEvent) => {
      console.log('🎨 Canvas received width change:', event.detail);
      setCanvasState(prev => ({
        ...prev,
        pencilWidth: event.detail,
      }));
    };

    window.addEventListener('paintColorChange', handleColorChange as EventListener);
    window.addEventListener('paintWidthChange', handleWidthChange as EventListener);

    return () => {
      window.removeEventListener('paintColorChange', handleColorChange as EventListener);
      window.removeEventListener('paintWidthChange', handleWidthChange as EventListener);
    };
  }, []);

  // Current stroke being drawn
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  // All completed strokes
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  
  // Inserted images state
  const [insertedImages, setInsertedImages] = useState<InsertedImage[]>([]);
  
  // Image cache for loaded images
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  
  // Image dragging state
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Handle image insertion from toolbar
  const handleImageInsert = useCallback((file: File, dataUrl: string) => {
    console.log('🖼️ handleImageInsert called with:', { fileName: file.name, dataUrlLength: dataUrl.length });
    console.log('🖼️ Canvas dimensions:', canvasDimensions);
    
    // Create new image object with temporary dimensions (will be updated after loading)
    const imageId = crypto.randomUUID();
    const newImage: InsertedImage = {
      id: imageId,
      src: dataUrl,
      x: 0, // Will be centered after calculating actual dimensions
      y: 0, // Will be centered after calculating actual dimensions
      width: canvasDimensions.width, // Temporary, will be updated
      height: canvasDimensions.height, // Temporary, will be updated
      timestamp: Date.now(),
    };

    console.log('🖼️ Created new image object:', newImage);
    
    // Load the image to get actual dimensions and cache it
    const img = new Image();
    img.onload = () => {
      console.log('🖼️ Image loaded successfully:', { 
        width: img.width, 
        height: img.height, 
        src: img.src.substring(0, 50) + '...' 
      });
      
      // Cache the loaded image
      imageCache.current.set(imageId, img);
      console.log('🖼️ Image cached with ID:', imageId);
      console.log('🖼️ Image cache now contains:', Array.from(imageCache.current.keys()));

      // Calculate scaled dimensions to fit the entire canvas while maintaining aspect ratio
      const canvasWidth = canvasDimensions.width;
      const canvasHeight = canvasDimensions.height;
      const aspectRatio = img.width / img.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      
      let scaledWidth, scaledHeight;
      
      // Scale to fit the entire canvas (fill the canvas while maintaining aspect ratio)
      if (aspectRatio > canvasAspectRatio) {
        // Image is wider than canvas ratio - fit to canvas width
        scaledWidth = canvasWidth;
        scaledHeight = canvasWidth / aspectRatio;
      } else {
        // Image is taller than canvas ratio - fit to canvas height
        scaledHeight = canvasHeight;
        scaledWidth = canvasHeight * aspectRatio;
      }

      console.log('🖼️ Calculated scaled dimensions:', { 
        original: { width: img.width, height: img.height }, 
        canvas: { width: canvasWidth, height: canvasHeight },
        scaled: { width: scaledWidth, height: scaledHeight },
        aspectRatio,
        canvasAspectRatio
      });

      // Center the image on the canvas
      const centeredX = (canvasWidth - scaledWidth) / 2;
      const centeredY = (canvasHeight - scaledHeight) / 2;

      // Update image with actual dimensions and centered position
      const updatedImage = {
        ...newImage,
        width: Math.round(scaledWidth),
        height: Math.round(scaledHeight),
        x: Math.round(centeredX),
        y: Math.round(centeredY),
      };

      console.log('🖼️ Adding image to state:', updatedImage);
      setInsertedImages(prev => {
        console.log('🖼️ Previous inserted images:', prev.length);
        const newState = [...prev, updatedImage];
        console.log('🖼️ New inserted images state:', newState.length);
        
        // Force immediate redraw after state update using a micro-task
        setTimeout(() => {
          console.log('🖼️ Forcing canvas redraw after image insertion');
          console.log('🖼️ Current insertedImages length:', newState.length);
          console.log('🖼️ Image cache has keys:', Array.from(imageCache.current.keys()));
          
          // Call basicRedraw with the new state directly to ensure it happens
          basicRedraw(newState);
        }, 0); // Use 0 to execute in next tick
        
        return newState;
      });
      
      // Save state after image insertion for undo/redo
      setTimeout(() => {
        const manager = memoryManagerRef.current || historyManagerRef.current;
        if (manager) {
          manager.saveState();
          // Emit history change event
          const historyInfo = manager.getHistoryInfo();
          window.dispatchEvent(new CustomEvent('paintHistoryChange', { 
            detail: { canUndo: historyInfo.canUndo, canRedo: historyInfo.canRedo }
          }));
        }
      }, 100); // Small delay to ensure image is rendered
    };
    img.onerror = () => {
      console.error('Failed to load inserted image');
      // Import and use toast manager for error notifications
      import("../lib/toast-manager.ts").then(({ showError }) => {
        showError('Failed to load inserted image');
      });
    };
    img.src = dataUrl;
  }, [canvasDimensions]);

  // Undo function with performance monitoring
  const handleUndo = useCallback(() => {
    const performUndo = () => {
      // Use advanced memory manager if available, otherwise fallback to basic
      const manager = memoryManagerRef.current || historyManagerRef.current;
      if (manager && manager.undo()) {
        // Emit history change event
        const historyInfo = manager.getHistoryInfo();
        window.dispatchEvent(new CustomEvent('paintHistoryChange', { 
          detail: { canUndo: historyInfo.canUndo, canRedo: historyInfo.canRedo }
        }));
        return true;
      }
      return false;
    };

    // Measure undo performance if monitor is available
    if (performanceMonitorRef.current) {
      performanceMonitorRef.current.measureInputLatency(performUndo);
    } else {
      performUndo();
    }
  }, []);

  // Redo function with performance monitoring
  const handleRedo = useCallback(() => {
    const performRedo = () => {
      // Use advanced memory manager if available, otherwise fallback to basic
      const manager = memoryManagerRef.current || historyManagerRef.current;
      if (manager && manager.redo()) {
        // Emit history change event
        const historyInfo = manager.getHistoryInfo();
        window.dispatchEvent(new CustomEvent('paintHistoryChange', { 
          detail: { canUndo: historyInfo.canUndo, canRedo: historyInfo.canRedo }
        }));
        return true;
      }
      return false;
    };

    // Measure redo performance if monitor is available
    if (performanceMonitorRef.current) {
      performanceMonitorRef.current.measureInputLatency(performRedo);
    } else {
      performRedo();
    }
  }, []);

  // Handle save functionality
  const handleSave = useCallback(() => {
    if (canvasRef.current) {
      return canvasRef.current;
    }
    return null;
  }, []);

  // Handle clear functionality
  const handleClear = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current) return false;

    // Clear the canvas
    clearCanvas(ctxRef.current, DEFAULT_CANVAS_SETTINGS.backgroundColor);
    
    // Reset all drawing state
    setStrokes([]);
    setInsertedImages([]);
    setCurrentStroke(null);
    setCanvasState(prev => ({ 
      ...prev, 
      isDrawing: false,
      insertedImages: [],
    }));
    
    // Clear image cache
    imageCache.current.clear();
    
    // Reset history managers (both advanced and basic)
    const manager = memoryManagerRef.current || historyManagerRef.current;
    if (manager) {
      manager.clearHistory();
      // Emit history change event
      const historyInfo = manager.getHistoryInfo();
      window.dispatchEvent(new CustomEvent('paintHistoryChange', { 
        detail: { canUndo: historyInfo.canUndo, canRedo: historyInfo.canRedo }
      }));
    }
    
    // Mark full redraw for optimized renderer
    if (rendererRef.current) {
      rendererRef.current.markFullRedraw();
    }
    
    return true;
  }, []);

  // Handle getting drawing state for server saving
  const handleGetDrawingState = useCallback(() => {
    return {
      strokes: strokes,
      images: insertedImages,
      canvasSize: { width: canvasDimensions.width, height: canvasDimensions.height },
      backgroundColor: DEFAULT_CANVAS_SETTINGS.backgroundColor,
    };
  }, [strokes, insertedImages, canvasDimensions]);

  // Load painting data from a saved painting
  const loadPaintingData = useCallback(async (drawingState: DrawingState) => {
    try {
      // Clear current state
      setStrokes([]);
      setInsertedImages([]);
      setCurrentStroke(null);
      imageCache.current.clear();

      // Load strokes
      if (drawingState.strokes && drawingState.strokes.length > 0) {
        setStrokes(drawingState.strokes);
      }

      // Load images if they exist
      if (drawingState.images && drawingState.images.length > 0) {
        const loadedImages: InsertedImage[] = [];
        
        // Load each image and cache it
        for (const imageData of drawingState.images) {
          try {
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                // Cache the loaded image
                imageCache.current.set(imageData.id, img);
                loadedImages.push(imageData);
                resolve();
              };
              img.onerror = () => {
                console.warn(`Failed to load image: ${imageData.id}`);
                reject(new Error(`Failed to load image: ${imageData.id}`));
              };
              img.src = imageData.src;
            });
          } catch (error) {
            console.warn(`Skipping failed image: ${imageData.id}`, error);
          }
        }
        
        setInsertedImages(loadedImages);
      }

      // Update canvas dimensions if they differ significantly
      if (drawingState.canvasSize) {
        const { width: loadedWidth, height: loadedHeight } = drawingState.canvasSize;
        if (Math.abs(loadedWidth - canvasDimensions.width) > 10 || 
            Math.abs(loadedHeight - canvasDimensions.height) > 10) {
          setCanvasDimensions({ width: loadedWidth, height: loadedHeight });
        }
      }

      // Reset history after loading
      setTimeout(() => {
        if (historyManagerRef.current) {
          historyManagerRef.current.clearHistory();
          historyManagerRef.current.saveState();
          // Emit history change event
          const historyInfo = historyManagerRef.current.getHistoryInfo();
          window.dispatchEvent(new CustomEvent('paintHistoryChange', { 
            detail: { canUndo: historyInfo.canUndo, canRedo: historyInfo.canRedo }
          }));
        }
      }, 200); // Delay to ensure everything is rendered

    } catch (error) {
      console.error('Error loading painting data:', error);
    }
  }, [canvasDimensions]);

  // Expose undo/redo/save functions to parent
  useEffect(() => {
    console.log('🎨 Canvas setting up global functions');
    // Expose undo/redo/save/clear/getDrawingState functions globally for toolbar access
    (window as any).__paintCanvasImageInsert = handleImageInsert;
    (window as any).__paintCanvasUndo = handleUndo;
    (window as any).__paintCanvasRedo = handleRedo;
    (window as any).__paintCanvasSave = handleSave;
    (window as any).__paintCanvasClear = handleClear;
    (window as any).__paintCanvasGetDrawingState = handleGetDrawingState;
    console.log('🎨 Canvas global functions set up:', {
      imageInsert: !!(window as any).__paintCanvasImageInsert,
      undo: !!(window as any).__paintCanvasUndo,
      redo: !!(window as any).__paintCanvasRedo,
      save: !!(window as any).__paintCanvasSave,
      clear: !!(window as any).__paintCanvasClear,
      getDrawingState: !!(window as any).__paintCanvasGetDrawingState
    });
  }, [handleImageInsert, handleUndo, handleRedo, handleSave, handleClear, handleGetDrawingState]);

  // Check if a point is within an image bounds
  const getImageAtPoint = useCallback((point: Point): InsertedImage | null => {
    // Check images in reverse order (top to bottom)
    for (let i = insertedImages.length - 1; i >= 0; i--) {
      const image = insertedImages[i];
      if (
        point.x >= image.x &&
        point.x <= image.x + image.width &&
        point.y >= image.y &&
        point.y <= image.y + image.height
      ) {
        return image;
      }
    }
    return null;
  }, [insertedImages]);

  // Handle responsive canvas sizing
  const updateCanvasSize = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const aspectRatio = width / height;
    
    let newWidth = Math.min(containerRect.width, width);
    let newHeight = newWidth / aspectRatio;
    
    // Ensure canvas fits within container height
    if (newHeight > containerRect.height) {
      newHeight = containerRect.height;
      newWidth = newHeight * aspectRatio;
    }
    
    // Update device pixel ratio for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    setDevicePixelRatio(dpr);
    
    setCanvasDimensions({ 
      width: Math.floor(newWidth), 
      height: Math.floor(newHeight) 
    });
  }, [width, height]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    updateCanvasSize();
    
    const handleResize = () => {
      updateCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [updateCanvasSize]);

  // Initialize canvas with responsive dimensions and high-DPI support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas ref is null, skipping initialization');
      return;
    }

    console.log('Initializing canvas with dimensions:', canvasDimensions);

    try {
      // Set actual canvas size for high-DPI displays
      canvas.width = canvasDimensions.width * devicePixelRatio;
      canvas.height = canvasDimensions.height * devicePixelRatio;
      
      // Scale canvas back down using CSS
      canvas.style.width = `${canvasDimensions.width}px`;
      canvas.style.height = `${canvasDimensions.height}px`;
      
      console.log('Canvas size set:', {
        actualSize: { width: canvas.width, height: canvas.height },
        cssSize: { width: canvas.style.width, height: canvas.style.height }
      });
      
      const ctx = initializeCanvas(canvas, { 
        width: canvasDimensions.width * devicePixelRatio, 
        height: canvasDimensions.height * devicePixelRatio 
      });
      
      // Scale the drawing context for high-DPI displays
      ctx.scale(devicePixelRatio, devicePixelRatio);
      
      ctxRef.current = ctx;
      console.log('Canvas context initialized successfully');

      // Initialize basic history manager first (always works)
      historyManagerRef.current = new CanvasHistoryManager(canvas, DEFAULT_CANVAS_SETTINGS.maxHistorySteps);
      console.log('Basic history manager initialized');

      // Try to initialize performance optimization systems (optional)
      try {
        // Initialize optimized renderer
        rendererRef.current = new OptimizedCanvasRenderer(canvas);
        
        // Initialize advanced memory manager
        memoryManagerRef.current = new AdvancedMemoryManager(canvas, {
          maxHistorySteps: DEFAULT_CANVAS_SETTINGS.maxHistorySteps,
          maxMemoryUsage: 50 * 1024 * 1024, // 50MB limit for mobile compatibility
          enableCompression: true,
          enableLazyLoading: true,
        });
        
        // Initialize performance monitor
        performanceMonitorRef.current = new PerformanceMonitor({
          maxStrokeDrawTime: 16, // 60fps target
          maxCanvasRedrawTime: 16,
          maxInputLatency: 50,
          minFrameRate: 30,
        });
        
        // Start performance monitoring
        performanceMonitorRef.current.startMonitoring(2000); // Monitor every 2 seconds
        
        console.log('Performance optimization systems initialized');
      } catch (optimizationError) {
        console.warn('Failed to initialize performance optimizations, using basic systems:', optimizationError);
      }
      
      // Emit initial history state
      const historyInfo = memoryManagerRef.current?.getHistoryInfo() || historyManagerRef.current?.getHistoryInfo();
      if (historyInfo) {
        window.dispatchEvent(new CustomEvent('paintHistoryChange', { 
          detail: { canUndo: historyInfo.canUndo, canRedo: historyInfo.canRedo }
        }));
      }

      // Initialize canvas with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

      console.log('Canvas initialization completed successfully');
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
      // Import and use toast manager for error notifications
      import("../lib/toast-manager.ts").then(({ showError }) => {
        showError(`Canvas initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
    }
  }, [canvasDimensions, devicePixelRatio]);

  // Handle pointer down (start drawing or image dragging) - updated for responsive canvas
  const handlePointerDown = useCallback((pointerEvent: CanvasPointerEvent) => {
    console.log('🎯 Pointer down event:', pointerEvent);
    if (!canvasRef.current) return;

    const point = clampPointToCanvas(
      { x: pointerEvent.x, y: pointerEvent.y, pressure: pointerEvent.pressure },
      canvasDimensions.width,
      canvasDimensions.height,
    );
    console.log('🎯 Clamped point:', point);

    // Check if clicking on an image
    const imageAtPoint = getImageAtPoint(point);
    
    // Prioritize drawing when pencil tool is active
    // Only allow image dragging when Alt key is held down or when not using pencil tool
    const isAltKeyHeld = pointerEvent.altKey || pointerEvent.metaKey; // Alt on Windows/Linux, Cmd on Mac
    const shouldDragImage = imageAtPoint && (isAltKeyHeld || canvasState.currentTool !== 'pencil');
    
    if (shouldDragImage) {
      console.log('🎯 Starting image drag mode');
      // Start dragging the image
      setIsDraggingImage(true);
      setDraggedImageId(imageAtPoint.id);
      setDragOffset({
        x: point.x - imageAtPoint.x,
        y: point.y - imageAtPoint.y,
      });
      return;
    }

    // Start drawing when using pencil tool (even over images)
    if (canvasState.currentTool === 'pencil') {
      console.log('🎯 Starting drawing mode');
      const newStroke: Stroke = {
        id: crypto.randomUUID(),
        points: [point],
        color: canvasState.pencilColor,
        width: canvasState.pencilWidth * (pointerEvent.pressure || 1), // Apply pressure to width
        timestamp: Date.now(),
      };

      setCurrentStroke(newStroke);
      setCanvasState(prev => ({ ...prev, isDrawing: true }));
    }
  }, [canvasState.currentTool, canvasState.pencilColor, canvasState.pencilWidth, canvasDimensions, getImageAtPoint]);

  // Handle pointer move (continue drawing or image dragging) - updated for responsive canvas
  const handlePointerMove = useCallback((pointerEvent: CanvasPointerEvent) => {
    const point = clampPointToCanvas(
      { x: pointerEvent.x, y: pointerEvent.y, pressure: pointerEvent.pressure },
      canvasDimensions.width,
      canvasDimensions.height,
    );

    // Handle image dragging
    if (isDraggingImage && draggedImageId) {
      const newX = Math.max(0, Math.min(canvasDimensions.width - 50, point.x - dragOffset.x)); // 50px minimum for visibility
      const newY = Math.max(0, Math.min(canvasDimensions.height - 50, point.y - dragOffset.y));

      setInsertedImages(prev => prev.map(img => 
        img.id === draggedImageId 
          ? { ...img, x: newX, y: newY }
          : img
      ));
      return;
    }

    // Handle drawing
    if (canvasState.isDrawing && currentStroke && ctxRef.current) {
      // Add point to current stroke with pressure-sensitive width
      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, point],
        width: canvasState.pencilWidth * (pointerEvent.pressure || 1), // Dynamic width based on pressure
      };

      setCurrentStroke(updatedStroke);

      // Draw the stroke incrementally for smooth feedback
      drawStroke(ctxRef.current, updatedStroke);
    }
  }, [canvasState.isDrawing, currentStroke, canvasState.pencilWidth, canvasDimensions, isDraggingImage, draggedImageId, dragOffset]);

  // Handle pointer up (end drawing or image dragging) - updated for responsive canvas
  const handlePointerUp = useCallback((pointerEvent: CanvasPointerEvent) => {
    const point = clampPointToCanvas(
      { x: pointerEvent.x, y: pointerEvent.y, pressure: pointerEvent.pressure },
      canvasDimensions.width,
      canvasDimensions.height,
    );

    // Handle end of image dragging
    if (isDraggingImage) {
      setIsDraggingImage(false);
      setDraggedImageId(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    // Handle end of drawing
    if (canvasState.isDrawing && currentStroke) {
      // Finalize the stroke
      const finalStroke = {
        ...currentStroke,
        points: simplifyStroke([...currentStroke.points, point]),
      };

      // Add completed stroke to strokes array
      setStrokes(prev => [...prev, finalStroke]);
      
      // Reset drawing state
      setCurrentStroke(null);
      setCanvasState(prev => ({ ...prev, isDrawing: false }));

      // Save state after stroke completion for undo/redo
      setTimeout(() => {
        const manager = memoryManagerRef.current || historyManagerRef.current;
        if (manager) {
          manager.saveState();
          // Emit history change event
          const historyInfo = manager.getHistoryInfo();
          window.dispatchEvent(new CustomEvent('paintHistoryChange', { 
            detail: { canUndo: historyInfo.canUndo, canRedo: historyInfo.canRedo }
          }));
        }
      }, 50); // Small delay to ensure stroke is rendered
    }

    // Canvas will be redrawn automatically via useEffect
  }, [canvasState.isDrawing, currentStroke, canvasDimensions, isDraggingImage]);

  // Redraw entire canvas with all strokes and images - updated for responsive canvas with optimizations
  const redrawCanvas = useCallback(() => {
    if (!ctxRef.current) return;

    // Use optimized renderer if available
    if (rendererRef.current && performanceMonitorRef.current) {
      performanceMonitorRef.current.measureCanvasRedraw(() => {
        // Render background
        rendererRef.current!.renderBackground(DEFAULT_CANVAS_SETTINGS.backgroundColor);
        
        // Render images
        rendererRef.current!.renderImages(insertedImages, imageCache.current);
        
        // Render completed strokes
        rendererRef.current!.renderStrokes(strokes);
        
        // Render current stroke if drawing
        if (currentStroke) {
          rendererRef.current!.renderCurrentStroke(currentStroke);
        }
      });
    } else {
      // Fallback to basic rendering
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.measureCanvasRedraw(() => {
          basicRedraw();
        });
      } else {
        basicRedraw();
      }
    }
  }, [strokes, currentStroke, canvasDimensions, insertedImages]);

  // Basic redraw function for fallback - with optional override for images
  const basicRedraw = useCallback((overrideImages?: InsertedImage[]) => {
    const imagesToDraw = overrideImages || insertedImages;
    console.log('🎨 basicRedraw called with', imagesToDraw.length, 'images');
    
    if (!ctxRef.current) {
      console.error('🎨 basicRedraw: No canvas context available');
      return;
    }

    console.log('🎨 Canvas dimensions:', canvasDimensions);
    console.log('🎨 Canvas context state:', {
      fillStyle: ctxRef.current.fillStyle,
      globalAlpha: ctxRef.current.globalAlpha,
      transform: ctxRef.current.getTransform()
    });

    // Clear canvas with responsive dimensions
    ctxRef.current.fillStyle = DEFAULT_CANVAS_SETTINGS.backgroundColor;
    ctxRef.current.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    console.log('🎨 Canvas cleared with background:', DEFAULT_CANVAS_SETTINGS.backgroundColor);

    // Draw all inserted images first (behind strokes)
    console.log('🖼️ Drawing', imagesToDraw.length, 'inserted images');
    console.log('🖼️ Image cache size:', imageCache.current.size);
    
    imagesToDraw.forEach((image, index) => {
      const cachedImg = imageCache.current.get(image.id);
      console.log(`🖼️ Image ${index}:`, { 
        id: image.id, 
        cached: !!cachedImg, 
        position: { x: image.x, y: image.y }, 
        size: { width: image.width, height: image.height },
        imgDimensions: cachedImg ? { width: cachedImg.width, height: cachedImg.height } : null
      });
      
      if (cachedImg && ctxRef.current) {
        try {
          if (performanceMonitorRef.current) {
            performanceMonitorRef.current.measureImageDrawing(image, () => {
              ctxRef.current!.drawImage(
                cachedImg,
                image.x,
                image.y,
                image.width,
                image.height
              );
              console.log(`🖼️ Drew image ${index} at (${image.x}, ${image.y}) with size (${image.width}, ${image.height})`);
            });
          } else {
            ctxRef.current.drawImage(
              cachedImg,
              image.x,
              image.y,
              image.width,
              image.height
            );
            console.log(`🖼️ Drew image ${index} at (${image.x}, ${image.y}) with size (${image.width}, ${image.height})`);
          }
        } catch (error) {
          console.error(`🖼️ Error drawing image ${index}:`, error);
        }
      } else {
        console.warn(`🖼️ Skipping image ${index}: cached=${!!cachedImg}, ctx=${!!ctxRef.current}`);
      }
    });

    // Draw all completed strokes
    strokes.forEach(stroke => {
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.measureStrokeDrawing(stroke, () => {
          drawStroke(ctxRef.current!, stroke);
        });
      } else {
        drawStroke(ctxRef.current!, stroke);
      }
    });

    // Draw current stroke if drawing
    if (currentStroke) {
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.measureStrokeDrawing(currentStroke, () => {
          drawStroke(ctxRef.current!, currentStroke);
        });
      } else {
        drawStroke(ctxRef.current, currentStroke);
      }
    }
  }, [strokes, currentStroke, canvasDimensions, insertedImages]);

  // Attach event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanup = attachCanvasEventListeners(
      canvas,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
    );

    return cleanup;
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  // Load painting data when loadedPainting prop changes
  useEffect(() => {
    if (loadedPainting && loadedPainting.drawingData) {
      loadPaintingData(loadedPainting.drawingData);
    }
  }, [loadedPainting, loadPaintingData]);

  // Redraw canvas when strokes change or canvas is resized
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Cleanup performance optimization systems on unmount
  useEffect(() => {
    return () => {
      // Cleanup optimized renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }

      // Cleanup advanced memory manager
      if (memoryManagerRef.current) {
        memoryManagerRef.current.dispose();
        memoryManagerRef.current = null;
      }

      // Cleanup performance monitor
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.dispose();
        performanceMonitorRef.current = null;
      }

      // Clear image cache
      imageCache.current.clear();

      console.log('Performance optimization systems cleaned up');
    };
  }, []);

  return (
    <div ref={containerRef} class={`paint-canvas-container w-full h-full ${className}`}>
      {/* Canvas with enhanced accessibility */}
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        class={`paint-canvas ${
          isDraggingImage ? 'cursor-grabbing' : ''
        }`}
        style={{
          width: `${canvasDimensions.width}px`,
          height: `${canvasDimensions.height}px`,
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'block',
          margin: '0 auto',
          // Prevent text selection and context menu on touch devices
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        role="img"
        aria-label={`Drawing canvas with ${strokes.length} strokes and ${insertedImages.length} images. Current tool: ${canvasState.currentTool}, color: ${canvasState.pencilColor}, width: ${canvasState.pencilWidth}px`}
        aria-describedby="canvas-instructions"
        tabIndex={0}
        onKeyDown={(e) => {
          // Handle keyboard navigation for accessibility
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Focus on canvas for drawing
          }
        }}
      />
      
      {/* Screen reader instructions */}
      <div id="canvas-instructions" class="sr-only">
        Interactive drawing canvas. Use mouse or touch to draw. 
        Current settings: {canvasState.pencilColor} color, {canvasState.pencilWidth}px width.
        Canvas contains {strokes.length} drawn strokes and {insertedImages.length} inserted images.
        Use toolbar controls to change drawing settings.
      </div>

      {/* Canvas status for screen readers */}
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {canvasState.isDrawing && "Drawing in progress"}
        {isDraggingImage && "Moving image"}
      </div>
      
      {/* Canvas info panel - only show in development or when requested */}
      {(typeof window !== 'undefined' && (window.location.hostname === 'localhost' || new URLSearchParams(window.location.search).has('debug'))) && (
        <details class="mt-4 max-w-md mx-auto">
          <summary class="cursor-pointer text-xs text-base-content/60 hover:text-base-content">
            Canvas Debug Info
          </summary>
          <div class="mt-2 p-3 bg-base-200 rounded text-xs text-base-content/70 space-y-1">
            <div class="grid grid-cols-2 gap-2">
              <span>Drawing:</span>
              <span class={canvasState.isDrawing ? 'text-success' : 'text-base-content/60'}>
                {canvasState.isDrawing ? 'Active' : 'Idle'}
              </span>
              
              <span>Dragging:</span>
              <span class={isDraggingImage ? 'text-warning' : 'text-base-content/60'}>
                {isDraggingImage ? 'Yes' : 'No'}
              </span>
              
              <span>Strokes:</span>
              <span class="font-mono">{strokes.length}</span>
              
              <span>Images:</span>
              <span class="font-mono">{insertedImages.length}</span>
              
              <span>Tool:</span>
              <span class="capitalize">{canvasState.currentTool}</span>
              
              <span>Color:</span>
              <span class="font-mono">{canvasState.pencilColor}</span>
              
              <span>Width:</span>
              <span class="font-mono">{canvasState.pencilWidth}px</span>
              
              <span>Canvas:</span>
              <span class="font-mono">{canvasDimensions.width}×{canvasDimensions.height}</span>
              
              <span>DPR:</span>
              <span class="font-mono">{devicePixelRatio}</span>
              
              <span>Performance:</span>
              <span class={performanceMonitorRef.current ? 'text-success' : 'text-base-content/60'}>
                {performanceMonitorRef.current ? 'Monitored' : 'Basic'}
              </span>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}