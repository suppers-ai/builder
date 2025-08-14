import { useState, useEffect } from "preact/hooks";
import Layout from "../components/Layout.tsx";
import { Palette, Images } from "lucide-preact";
import PaintCanvasIsland from "../islands/PaintCanvasIsland.tsx";
import ToolbarIsland from "../islands/ToolbarIsland.tsx";
import ToastContainer from "../islands/ToastContainer.tsx";
import { ErrorBoundary, CanvasErrorBoundary } from "../components/ErrorBoundary.tsx";
import { DEFAULT_PENCIL_COLOR, DEFAULT_PENCIL_WIDTH } from "../lib/paint-utils.ts";
import { showSuccess, showInfo } from "../lib/toast-manager.ts";
import type { SavedPainting } from "../types/paint.ts";

export default function Home() {
  // Shared state for color and width between toolbar and canvas
  const [pencilColor, setPencilColor] = useState(DEFAULT_PENCIL_COLOR);
  const [pencilWidth, setPencilWidth] = useState(DEFAULT_PENCIL_WIDTH);
  
  // Undo/redo state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Loading state for paintings
  const [loadedPainting, setLoadedPainting] = useState<SavedPainting | null>(null);

  // Handle color changes from toolbar
  const handleColorChange = (color: string) => {
    setPencilColor(color);
  };

  // Handle width changes from toolbar
  const handleWidthChange = (width: number) => {
    setPencilWidth(width);
  };

  // Handle image insertion from toolbar
  const handleImageInsert = (file: File, dataUrl: string) => {
    // Use the global handler set by PaintCanvasIsland
    if ((window as any).__paintCanvasImageInsert) {
      (window as any).__paintCanvasImageInsert(file, dataUrl);
    }
  };

  // Handle undo action
  const handleUndo = () => {
    // Use the global handler set by PaintCanvasIsland
    if ((window as any).__paintCanvasUndo) {
      (window as any).__paintCanvasUndo();
    }
  };

  // Handle redo action
  const handleRedo = () => {
    // Use the global handler set by PaintCanvasIsland
    if ((window as any).__paintCanvasRedo) {
      (window as any).__paintCanvasRedo();
    }
  };

  // Handle save action
  const handleSave = (format: string, filename?: string) => {
    console.log(`Saving canvas as ${format}${filename ? ` with filename: ${filename}` : ''}`);
    // Additional save logic can be added here if needed
  };

  // Handle clear action
  const handleClear = () => {
    console.log('Canvas cleared');
    // Additional clear logic can be added here if needed
  };

  // Handle history state changes from canvas
  const handleHistoryChange = (undoAvailable: boolean, redoAvailable: boolean) => {
    setCanUndo(undoAvailable);
    setCanRedo(redoAvailable);
  };

  // Check for loaded painting from gallery
  useEffect(() => {
    const loadPaintingData = sessionStorage.getItem('loadPainting');
    if (loadPaintingData) {
      try {
        const painting: SavedPainting = JSON.parse(loadPaintingData);
        setLoadedPainting(painting);
        showSuccess(`Loaded painting: ${painting.name}`);
        // Clear from sessionStorage after loading
        sessionStorage.removeItem('loadPainting');
      } catch (error) {
        console.error('Error parsing loaded painting data:', error);
        showInfo('Failed to load painting data from gallery');
      }
    }
  }, []);

  // Listen for global events from islands
  useEffect(() => {
    console.log('🏠 Main route setting up event listeners');
    
    // Listen for color changes from toolbar
    const handleColorChange = (event: CustomEvent) => {
      console.log('🏠 Main route received color change:', event.detail);
      setPencilColor(event.detail);
      console.log('🏠 Main route updated pencilColor to:', event.detail);
    };

    // Listen for width changes from toolbar
    const handleWidthChange = (event: CustomEvent) => {
      console.log('🏠 Main route received width change:', event.detail);
      setPencilWidth(event.detail);
      console.log('🏠 Main route updated pencilWidth to:', event.detail);
    };

    // Listen for history changes from canvas
    const handleHistoryChange = (event: CustomEvent) => {
      setCanUndo(event.detail.canUndo);
      setCanRedo(event.detail.canRedo);
    };

    // Add event listeners
    window.addEventListener('paintColorChange', handleColorChange as EventListener);
    window.addEventListener('paintWidthChange', handleWidthChange as EventListener);
    window.addEventListener('paintHistoryChange', handleHistoryChange as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('paintColorChange', handleColorChange as EventListener);
      window.removeEventListener('paintWidthChange', handleWidthChange as EventListener);
      window.removeEventListener('paintHistoryChange', handleHistoryChange as EventListener);
    };
  }, []);

  // Enhanced keyboard shortcuts for common actions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) {
          handleUndo();
          showInfo('Undid last action');
        }
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      else if (
        ((event.ctrlKey || event.metaKey) && event.key === 'y') ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Z')
      ) {
        event.preventDefault();
        if (canRedo) {
          handleRedo();
          showInfo('Redid last action');
        }
      }
      // Save: Ctrl+S or Cmd+S
      else if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave('png');
        showInfo('Saving canvas...');
      }
      // Clear: Ctrl+Delete or Cmd+Delete
      else if ((event.ctrlKey || event.metaKey) && event.key === 'Delete') {
        event.preventDefault();
        if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
          handleClear();
          showInfo('Canvas cleared');
        }
      }
      // Gallery: Ctrl+G or Cmd+G
      else if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        window.location.href = '/gallery';
      }
      // Help: F1 or ?
      else if (event.key === 'F1' || (event.shiftKey && event.key === '?')) {
        event.preventDefault();
        showKeyboardShortcutsHelp();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  // Show keyboard shortcuts help
  const showKeyboardShortcutsHelp = () => {
    const shortcuts = [
      'Ctrl/Cmd + Z: Undo',
      'Ctrl/Cmd + Y: Redo',
      'Ctrl/Cmd + S: Save',
      'Ctrl/Cmd + Delete: Clear canvas',
      'Ctrl/Cmd + G: Go to gallery',
      'F1 or Shift + ?: Show this help'
    ];
    showInfo(`Keyboard Shortcuts:\n${shortcuts.join('\n')}`, { duration: 8000 });
  };

  return (
    <Layout title="Paint App">
      <ErrorBoundary context="Paint Application">
        {/* Skip to main content link for screen readers */}
        <a 
          href="#main-canvas" 
          class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 btn btn-primary btn-sm"
        >
          Skip to canvas
        </a>

        <div class="max-w-6xl mx-auto">
          {/* Header Section with enhanced accessibility */}
          <header class="text-center mb-6" role="banner">
            <div class="flex justify-center mb-3">
              <Palette class="w-12 h-12 text-primary" aria-hidden="true" />
            </div>
            <h1 class="text-2xl font-semibold text-base-content mb-2">
              Paint App
            </h1>
            <p class="text-base-content/60 text-sm" id="app-description">
              Create digital artwork with our intuitive paint application. 
              Use keyboard shortcuts for faster workflow.
            </p>
            
            {/* Navigation to Gallery */}
            <nav class="mt-4" aria-label="Application navigation">
              <a 
                href="/gallery" 
                class="btn btn-outline btn-sm hover:btn-primary transition-colors"
                aria-describedby="app-description"
              >
                <Images class="w-4 h-4 mr-2" aria-hidden="true" />
                My Gallery
              </a>
              
              {/* Help button */}
              <button
                onClick={showKeyboardShortcutsHelp}
                class="btn btn-ghost btn-sm ml-2 hover:btn-primary transition-colors"
                aria-label="Show keyboard shortcuts help"
                title="Show keyboard shortcuts (F1 or Shift+?)"
              >
                <span class="text-sm">?</span>
              </button>
            </nav>

            {/* Loaded Painting Indicator with enhanced accessibility */}
            {loadedPainting && (
              <div 
                class="alert alert-info mt-4 max-w-md mx-auto shadow-sm"
                role="status"
                aria-live="polite"
              >
                <div class="text-sm">
                  <p class="font-medium">Loaded: {loadedPainting.name}</p>
                  <p class="text-xs opacity-75">
                    Created {new Date(loadedPainting.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </header>

          {/* Paint Interface Structure with enhanced layout */}
          <main class="grid grid-cols-1 lg:grid-cols-4 gap-6" role="main">
            {/* Toolbar Section */}
            <aside class="lg:col-span-1" role="complementary" aria-label="Drawing tools">
              <div class="card bg-base-200 shadow-lg border border-base-300 hover:shadow-xl transition-shadow">
                <div class="card-body p-4">
                  <h2 class="card-title text-lg mb-4 flex items-center">
                    <span class="w-2 h-2 bg-primary rounded-full mr-2" aria-hidden="true"></span>
                    Tools
                  </h2>
                  <ErrorBoundary context="Toolbar">
                    <ToolbarIsland
                      canUndo={canUndo}
                      canRedo={canRedo}
                      initialColor={pencilColor}
                      initialWidth={pencilWidth}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            </aside>

            {/* Canvas Section */}
            <section class="lg:col-span-3" aria-label="Drawing canvas">
              <div class="card bg-base-200 shadow-lg border border-base-300 hover:shadow-xl transition-shadow">
                <div class="card-body p-4">
                  <h2 class="card-title text-lg mb-4 flex items-center justify-between">
                    <span class="flex items-center">
                      <span class="w-2 h-2 bg-secondary rounded-full mr-2" aria-hidden="true"></span>
                      Canvas
                    </span>
                    
                    {/* Canvas status indicators */}
                    <div class="flex items-center gap-2 text-xs text-base-content/60">
                      <span class="badge badge-outline badge-xs">
                        {pencilColor}
                      </span>
                      <span class="badge badge-outline badge-xs">
                        {pencilWidth}px
                      </span>
                      {(canUndo || canRedo) && (
                        <span class="badge badge-primary badge-xs">
                          {canUndo ? 'Modified' : 'Saved'}
                        </span>
                      )}
                    </div>
                  </h2>
                  
                  <CanvasErrorBoundary>
                    <div id="main-canvas" tabindex="-1">
                      <PaintCanvasIsland 
                        width={800}
                        height={600}
                        className="w-full"
                        pencilColor={pencilColor}
                        pencilWidth={pencilWidth}
                        loadedPainting={loadedPainting}
                      />
                    </div>
                  </CanvasErrorBoundary>
                </div>
              </div>
            </section>
          </main>

        </div>
      </ErrorBoundary>
      
      {/* Toast Container for notifications */}
      <ToastContainer />
    </Layout>
  );
}