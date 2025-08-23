// Tests for paint utilities
import { assert, assertEquals, assertExists, assertThrows } from "@std/assert";
import {
  calculateDistance,
  clampPointToCanvas,
  clearCanvas,
  createThumbnail,
  createTouchEventHandlers,
  DEFAULT_CANVAS_SETTINGS,
  DEFAULT_PENCIL_COLOR,
  DEFAULT_PENCIL_WIDTH,
  drawSmoothLine,
  drawStroke,
  exportCanvasAsDataURL,
  getCanvasCoordinatesFromMouse,
  getCanvasCoordinatesFromTouch,
  initializeCanvas,
  isPointInCanvas,
  restoreCanvasState,
  saveCanvasState,
  simplifyStroke,
  validateImageFile,
} from "./paint-utils.ts";
import type { FileValidationOptions, Point, Stroke } from "../types/paint.ts";

// Mock DOM elements for testing
class MockCanvas {
  width = 800;
  height = 600;

  getContext(type: string): MockCanvasRenderingContext2D | null {
    return type === "2d" ? new MockCanvasRenderingContext2D() : null;
  }

  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      width: this.width,
      height: this.height,
    };
  }

  toDataURL(type?: string, quality?: number): string {
    return `data:${type || "image/png"};base64,mockdata`;
  }

  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void {
    const blob = new Blob(["mock"], { type: type || "image/png" });
    callback(blob);
  }
}

class MockCanvasRenderingContext2D {
  lineCap = "butt";
  lineJoin = "miter";
  imageSmoothingEnabled = true;
  imageSmoothingQuality = "low";
  fillStyle = "#000000";
  strokeStyle = "#000000";
  lineWidth = 1;
  canvas = { width: 800, height: 600 };

  fillRect(x: number, y: number, width: number, height: number): void {}
  beginPath(): void {}
  moveTo(x: number, y: number): void {}
  lineTo(x: number, y: number): void {}
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {}
  stroke(): void {}
  drawImage(image: any, dx: number, dy: number, dw?: number, dh?: number): void {}
  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
    return new ImageData(sw, sh);
  }
  putImageData(imageData: ImageData, dx: number, dy: number): void {}
}

// Mock File for testing
class MockFile {
  name: string;
  size: number;
  type: string;

  constructor(name: string, size: number, type: string) {
    this.name = name;
    this.size = size;
    this.type = type;
  }
}

Deno.test("DEFAULT_CANVAS_SETTINGS should have correct values", () => {
  assertEquals(DEFAULT_CANVAS_SETTINGS.width, 800);
  assertEquals(DEFAULT_CANVAS_SETTINGS.height, 600);
  assertEquals(DEFAULT_CANVAS_SETTINGS.backgroundColor, "#ffffff");
  assertEquals(DEFAULT_CANVAS_SETTINGS.maxHistorySteps, 50);
});

Deno.test("DEFAULT_PENCIL_COLOR should be black", () => {
  assertEquals(DEFAULT_PENCIL_COLOR, "#000000");
});

Deno.test("DEFAULT_PENCIL_WIDTH should be 3", () => {
  assertEquals(DEFAULT_PENCIL_WIDTH, 3);
});

Deno.test("initializeCanvas should configure canvas correctly", () => {
  const canvas = new MockCanvas() as any;
  const ctx = initializeCanvas(canvas);

  assertExists(ctx);
  assertEquals(canvas.width, 800);
  assertEquals(canvas.height, 600);
  assertEquals(ctx.lineCap, "round");
  assertEquals(ctx.lineJoin, "round");
  assertEquals(ctx.imageSmoothingEnabled, true);
  assertEquals(ctx.imageSmoothingQuality, "high");
});

Deno.test("initializeCanvas should throw error if no context", () => {
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => null,
  } as any;

  assertThrows(() => initializeCanvas(canvas), Error, "Failed to get 2D rendering context");
});

Deno.test("getCanvasCoordinatesFromMouse should calculate correct coordinates", () => {
  const canvas = new MockCanvas() as any;
  const event = {
    clientX: 100,
    clientY: 50,
  } as MouseEvent;

  const point = getCanvasCoordinatesFromMouse(event, canvas);

  assertEquals(point.x, 100);
  assertEquals(point.y, 50);
});

Deno.test("getCanvasCoordinatesFromTouch should calculate correct coordinates", () => {
  const canvas = new MockCanvas() as any;
  const event = {
    touches: [{
      clientX: 150,
      clientY: 75,
      force: 0.8,
    }],
  } as any;

  const point = getCanvasCoordinatesFromTouch(event, canvas);

  assertEquals(point.x, 150);
  assertEquals(point.y, 75);
  assertEquals(point.pressure, 0.8);
});

Deno.test("drawSmoothLine should handle empty points array", () => {
  const ctx = new MockCanvasRenderingContext2D() as any;
  const points: Point[] = [];

  // Should not throw
  drawSmoothLine(ctx, points, "#000000", 2);
});

Deno.test("drawSmoothLine should handle single point", () => {
  const ctx = new MockCanvasRenderingContext2D() as any;
  const points: Point[] = [{ x: 10, y: 10 }];

  // Should not throw
  drawSmoothLine(ctx, points, "#000000", 2);
});

Deno.test("drawSmoothLine should handle two points", () => {
  const ctx = new MockCanvasRenderingContext2D() as any;
  const points: Point[] = [
    { x: 10, y: 10 },
    { x: 20, y: 20 },
  ];

  // Should not throw
  drawSmoothLine(ctx, points, "#ff0000", 3);
  assertEquals(ctx.strokeStyle, "#ff0000");
  assertEquals(ctx.lineWidth, 3);
});

Deno.test("drawStroke should handle empty stroke", () => {
  const ctx = new MockCanvasRenderingContext2D() as any;
  const stroke: Stroke = {
    id: "1",
    points: [],
    color: "#000000",
    width: 2,
    timestamp: Date.now(),
  };

  // Should not throw
  drawStroke(ctx, stroke);
});

Deno.test("clearCanvas should set fill style and fill rect", () => {
  const ctx = new MockCanvasRenderingContext2D() as any;
  ctx.canvas.width = 100;
  ctx.canvas.height = 100;

  clearCanvas(ctx, "#ff0000");

  assertEquals(ctx.fillStyle, "#ff0000");
});

Deno.test("exportCanvasAsDataURL should return data URL", () => {
  const canvas = new MockCanvas() as any;

  const dataURL = exportCanvasAsDataURL(canvas, "png", 0.9);

  assertEquals(dataURL, "data:image/png;base64,mockdata");
});

Deno.test("createThumbnail should create scaled thumbnail", () => {
  const canvas = new MockCanvas() as any;

  // Mock document.createElement
  const originalCreateElement = globalThis.document?.createElement;
  globalThis.document = {
    createElement: (tagName: string) => {
      if (tagName === "canvas") {
        return new MockCanvas() as any;
      }
      return null;
    },
  } as any;

  const thumbnail = createThumbnail(canvas, 100, 75);

  assertEquals(thumbnail, "data:image/png;base64,mockdata");

  // Restore original
  if (originalCreateElement) {
    globalThis.document.createElement = originalCreateElement;
  }
});

Deno.test("saveCanvasState should add to history", () => {
  const canvas = new MockCanvas() as any;
  const history: ImageData[] = [];

  const newHistory = saveCanvasState(canvas, history, 10);

  assertEquals(newHistory.length, 1);
});

Deno.test("saveCanvasState should limit history size", () => {
  const canvas = new MockCanvas() as any;
  const history: ImageData[] = [
    new ImageData(10, 10),
    new ImageData(10, 10),
  ];

  const newHistory = saveCanvasState(canvas, history, 2);

  assertEquals(newHistory.length, 2);
});

Deno.test("validateImageFile should validate file size", () => {
  const file = new MockFile("test.png", 2000000, "image/png") as any;
  const options: FileValidationOptions = {
    maxSize: 1000000,
    allowedTypes: ["image/png", "image/jpeg"],
  };

  const result = validateImageFile(file, options);

  assertEquals(result.isValid, false);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0], "File size exceeds maximum of 0.95367431640625MB");
});

Deno.test("validateImageFile should validate file type", () => {
  const file = new MockFile("test.gif", 500000, "image/gif") as any;
  const options: FileValidationOptions = {
    maxSize: 1000000,
    allowedTypes: ["image/png", "image/jpeg"],
  };

  const result = validateImageFile(file, options);

  assertEquals(result.isValid, false);
  assertEquals(result.errors.length, 1);
  assertEquals(result.errors[0], "File type image/gif is not allowed");
});

Deno.test("validateImageFile should pass valid file", () => {
  const file = new MockFile("test.png", 500000, "image/png") as any;
  const options: FileValidationOptions = {
    maxSize: 1000000,
    allowedTypes: ["image/png", "image/jpeg"],
  };

  const result = validateImageFile(file, options);

  assertEquals(result.isValid, true);
  assertEquals(result.errors.length, 0);
});

Deno.test("calculateDistance should calculate correct distance", () => {
  const point1: Point = { x: 0, y: 0 };
  const point2: Point = { x: 3, y: 4 };

  const distance = calculateDistance(point1, point2);

  assertEquals(distance, 5);
});

Deno.test("simplifyStroke should handle empty array", () => {
  const points: Point[] = [];
  const simplified = simplifyStroke(points, 2);

  assertEquals(simplified.length, 0);
});

Deno.test("simplifyStroke should handle single point", () => {
  const points: Point[] = [{ x: 10, y: 10 }];
  const simplified = simplifyStroke(points, 2);

  assertEquals(simplified.length, 1);
  assertEquals(simplified[0], points[0]);
});

Deno.test("simplifyStroke should handle two points", () => {
  const points: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ];
  const simplified = simplifyStroke(points, 2);

  assertEquals(simplified.length, 2);
});

Deno.test("simplifyStroke should reduce points based on tolerance", () => {
  const points: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 1 }, // Should be filtered out (distance < tolerance)
    { x: 5, y: 5 }, // Should be kept (distance >= tolerance)
    { x: 10, y: 10 }, // Last point, always kept
  ];
  const simplified = simplifyStroke(points, 2);

  assertEquals(simplified.length, 3);
  assertEquals(simplified[0], points[0]);
  assertEquals(simplified[1], points[2]);
  assertEquals(simplified[2], points[3]);
});

Deno.test("isPointInCanvas should return true for point inside canvas", () => {
  const point: Point = { x: 50, y: 50 };
  const result = isPointInCanvas(point, 100, 100);

  assertEquals(result, true);
});

Deno.test("isPointInCanvas should return false for point outside canvas", () => {
  const point: Point = { x: 150, y: 50 };
  const result = isPointInCanvas(point, 100, 100);

  assertEquals(result, false);
});

Deno.test("clampPointToCanvas should clamp point to canvas bounds", () => {
  const point: Point = { x: 150, y: -10 };
  const clamped = clampPointToCanvas(point, 100, 100);

  assertEquals(clamped.x, 100);
  assertEquals(clamped.y, 0);
});

Deno.test("clampPointToCanvas should preserve point inside bounds", () => {
  const point: Point = { x: 50, y: 50 };
  const clamped = clampPointToCanvas(point, 100, 100);

  assertEquals(clamped.x, 50);
  assertEquals(clamped.y, 50);
});

// Touch-specific tests
Deno.test("getCanvasCoordinatesFromTouch should handle missing touch gracefully", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;

  // Mock touch event with no touches
  const mockEvent = {
    touches: [],
    changedTouches: [],
  } as unknown as TouchEvent;

  const result = getCanvasCoordinatesFromTouch(mockEvent, canvas);

  assertEquals(result.x, 0);
  assertEquals(result.y, 0);
  assertEquals(result.pressure, 1);
});

Deno.test("getCanvasCoordinatesFromTouch should handle pressure correctly", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;

  // Mock getBoundingClientRect
  canvas.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  // Mock touch event with force
  const mockTouch = {
    clientX: 50,
    clientY: 50,
    force: 0.5,
  };

  const mockEvent = {
    touches: [mockTouch],
    changedTouches: [],
  } as unknown as TouchEvent;

  const result = getCanvasCoordinatesFromTouch(mockEvent, canvas);

  assertEquals(result.x, 50);
  assertEquals(result.y, 50);
  assertEquals(result.pressure, 0.5);
});

Deno.test("createTouchEventHandlers should create proper handlers", () => {
  const canvas = document.createElement("canvas");
  let pointerDownCalled = false;
  let pointerMoveCalled = false;
  let pointerUpCalled = false;

  const handlers = createTouchEventHandlers(
    canvas,
    () => {
      pointerDownCalled = true;
    },
    () => {
      pointerMoveCalled = true;
    },
    () => {
      pointerUpCalled = true;
    },
  );

  // Verify handlers exist
  assert(typeof handlers.handleTouchStart === "function");
  assert(typeof handlers.handleTouchMove === "function");
  assert(typeof handlers.handleTouchEnd === "function");
  assert(typeof handlers.handleTouchCancel === "function");
});
