import { assertEquals, assertExists, assert } from "@std/assert";
import { CanvasHistoryManager } from "./paint-utils.ts";

// Mock canvas for testing
function createMockCanvas(width = 800, height = 600): HTMLCanvasElement {
  const canvas = {
    width,
    height,
    getContext: () => ({
      getImageData: (x: number, y: number, w: number, h: number) => {
        // Create mock ImageData
        const data = new Uint8ClampedArray(w * h * 4);
        // Fill with some test pattern
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255;     // R
          data[i + 1] = 0;   // G
          data[i + 2] = 0;   // B
          data[i + 3] = 255; // A
        }
        return { data, width: w, height: h };
      },
      putImageData: (imageData: ImageData, x: number, y: number) => {
        // Mock implementation - just verify it's called
      },
    }),
  } as unknown as HTMLCanvasElement;
  
  return canvas;
}

Deno.test("CanvasHistoryManager - initialization", () => {
  const canvas = createMockCanvas();
  const historyManager = new CanvasHistoryManager(canvas, 10);
  
  const historyInfo = historyManager.getHistoryInfo();
  
  assertEquals(historyInfo.canUndo, false, "Should not be able to undo initially");
  assertEquals(historyInfo.canRedo, false, "Should not be able to redo initially");
  assertEquals(historyInfo.currentIndex, 0, "Should start at index 0");
  assertEquals(historyInfo.totalStates, 1, "Should have initial state saved");
});

Deno.test("CanvasHistoryManager - save state", () => {
  const canvas = createMockCanvas();
  const historyManager = new CanvasHistoryManager(canvas, 10);
  
  // Save a new state
  historyManager.saveState();
  
  const historyInfo = historyManager.getHistoryInfo();
  
  assertEquals(historyInfo.canUndo, true, "Should be able to undo after saving state");
  assertEquals(historyInfo.canRedo, false, "Should not be able to redo");
  assertEquals(historyInfo.currentIndex, 1, "Should be at index 1");
  assertEquals(historyInfo.totalStates, 2, "Should have 2 states");
});

Deno.test("CanvasHistoryManager - undo functionality", () => {
  const canvas = createMockCanvas();
  const historyManager = new CanvasHistoryManager(canvas, 10);
  
  // Save a new state
  historyManager.saveState();
  
  // Undo
  const undoResult = historyManager.undo();
  
  assertEquals(undoResult, true, "Undo should succeed");
  
  const historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.canUndo, false, "Should not be able to undo further");
  assertEquals(historyInfo.canRedo, true, "Should be able to redo");
  assertEquals(historyInfo.currentIndex, 0, "Should be back at index 0");
});

Deno.test("CanvasHistoryManager - redo functionality", () => {
  const canvas = createMockCanvas();
  const historyManager = new CanvasHistoryManager(canvas, 10);
  
  // Save a new state and undo
  historyManager.saveState();
  historyManager.undo();
  
  // Redo
  const redoResult = historyManager.redo();
  
  assertEquals(redoResult, true, "Redo should succeed");
  
  const historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.canUndo, true, "Should be able to undo");
  assertEquals(historyInfo.canRedo, false, "Should not be able to redo further");
  assertEquals(historyInfo.currentIndex, 1, "Should be at index 1");
});

Deno.test("CanvasHistoryManager - multiple states", () => {
  const canvas = createMockCanvas();
  const historyManager = new CanvasHistoryManager(canvas, 10);
  
  // Save multiple states
  historyManager.saveState(); // State 1
  historyManager.saveState(); // State 2
  historyManager.saveState(); // State 3
  
  let historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.totalStates, 4, "Should have 4 states (including initial)");
  assertEquals(historyInfo.currentIndex, 3, "Should be at index 3");
  
  // Undo twice
  historyManager.undo(); // Back to state 2
  historyManager.undo(); // Back to state 1
  
  historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.currentIndex, 1, "Should be at index 1");
  assertEquals(historyInfo.canUndo, true, "Should still be able to undo");
  assertEquals(historyInfo.canRedo, true, "Should be able to redo");
  
  // Redo once
  historyManager.redo(); // Forward to state 2
  
  historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.currentIndex, 2, "Should be at index 2");
  assertEquals(historyInfo.canRedo, true, "Should still be able to redo");
});

Deno.test("CanvasHistoryManager - history limit", () => {
  const canvas = createMockCanvas();
  const maxStates = 3;
  const historyManager = new CanvasHistoryManager(canvas, maxStates);
  
  // Save more states than the limit
  for (let i = 0; i < maxStates + 2; i++) {
    historyManager.saveState();
  }
  
  const historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.totalStates, maxStates, `Should not exceed ${maxStates} states`);
  assertEquals(historyInfo.currentIndex, maxStates - 1, "Should be at the last index");
});

Deno.test("CanvasHistoryManager - new action after undo clears redo", () => {
  const canvas = createMockCanvas();
  const historyManager = new CanvasHistoryManager(canvas, 10);
  
  // Save states and undo
  historyManager.saveState(); // State 1
  historyManager.saveState(); // State 2
  historyManager.undo(); // Back to state 1
  
  let historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.canRedo, true, "Should be able to redo");
  
  // Save new state (should clear redo history)
  historyManager.saveState(); // New state 2
  
  historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.canRedo, false, "Should not be able to redo after new action");
  assertEquals(historyInfo.totalStates, 3, "Should have 3 states total");
});

Deno.test("CanvasHistoryManager - cannot undo/redo when not possible", () => {
  const canvas = createMockCanvas();
  const historyManager = new CanvasHistoryManager(canvas, 10);
  
  // Try to undo when nothing to undo
  const undoResult = historyManager.undo();
  assertEquals(undoResult, false, "Should not be able to undo initially");
  
  // Try to redo when nothing to redo
  const redoResult = historyManager.redo();
  assertEquals(redoResult, false, "Should not be able to redo initially");
});

Deno.test("CanvasHistoryManager - clear history", () => {
  const canvas = createMockCanvas();
  const historyManager = new CanvasHistoryManager(canvas, 10);
  
  // Save some states
  historyManager.saveState();
  historyManager.saveState();
  
  let historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.totalStates, 3, "Should have 3 states before clearing");
  
  // Clear history
  historyManager.clearHistory();
  
  historyInfo = historyManager.getHistoryInfo();
  assertEquals(historyInfo.totalStates, 1, "Should have 1 state after clearing");
  assertEquals(historyInfo.currentIndex, 0, "Should be at index 0");
  assertEquals(historyInfo.canUndo, false, "Should not be able to undo");
  assertEquals(historyInfo.canRedo, false, "Should not be able to redo");
});