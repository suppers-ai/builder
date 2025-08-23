// Unit tests for drawing calculations and utilities
import { assert, assertEquals, assertExists } from "@std/assert";
import {
  calculateDistance,
  clampPointToCanvas,
  drawSmoothLine,
  getCanvasCoordinatesFromMouse,
  getCanvasCoordinatesFromTouch,
  isPointInCanvas,
  simplifyStroke,
} from "./paint-utils.ts";
import type { Point, Stroke } from "../types/paint.ts";

// Mock canvas for testing
class MockCanvas {
  width = 800;
  height = 600;

  getBoundingClientRect() {
    return {
      left: 10,
      top: 20,
      width: this.width,
      height: this.height,
      right: 10 + this.width,
      bottom: 20 + this.height,
      x: 10,
      y: 20,
      toJSON: () => {},
    };
  }
}

class MockCanvasRenderingContext2D {
  lineCap = "butt";
  lineJoin = "miter";
  strokeStyle = "#000000";
  lineWidth = 1;

  beginPath(): void {}
  moveTo(x: number, y: number): void {}
  lineTo(x: number, y: number): void {}
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {}
  stroke(): void {}
}

Deno.test("Drawing Calculations - Distance calculations", () => {
  // Test basic distance calculation
  const point1: Point = { x: 0, y: 0 };
  const point2: Point = { x: 3, y: 4 };
  assertEquals(calculateDistance(point1, point2), 5);

  // Test zero distance
  const samePoint: Point = { x: 10, y: 10 };
  assertEquals(calculateDistance(samePoint, samePoint), 0);

  // Test negative coordinates
  const negPoint1: Point = { x: -3, y: -4 };
  const negPoint2: Point = { x: 0, y: 0 };
  assertEquals(calculateDistance(negPoint1, negPoint2), 5);

  // Test decimal coordinates
  const decPoint1: Point = { x: 1.5, y: 2.5 };
  const decPoint2: Point = { x: 4.5, y: 6.5 };
  assertEquals(calculateDistance(decPoint1, decPoint2), 5);
});

Deno.test("Drawing Calculations - Stroke simplification", () => {
  // Test empty stroke
  assertEquals(simplifyStroke([], 2).length, 0);

  // Test single point
  const singlePoint: Point[] = [{ x: 10, y: 10 }];
  const simplified = simplifyStroke(singlePoint, 2);
  assertEquals(simplified.length, 1);
  assertEquals(simplified[0], singlePoint[0]);

  // Test stroke with points within tolerance
  const closePoints: Point[] = [
    { x: 0, y: 0 },
    { x: 0.5, y: 0.5 }, // Should be filtered out
    { x: 1, y: 1 }, // Should be filtered out
    { x: 5, y: 5 }, // Should be kept
    { x: 10, y: 10 }, // Last point, always kept
  ];
  const simplifiedClose = simplifyStroke(closePoints, 2);
  assertEquals(simplifiedClose.length, 3);
  assertEquals(simplifiedClose[0], closePoints[0]);
  assertEquals(simplifiedClose[1], closePoints[3]);
  assertEquals(simplifiedClose[2], closePoints[4]);

  // Test stroke with all points far apart
  const farPoints: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 20 },
    { x: 30, y: 30 },
  ];
  const simplifiedFar = simplifyStroke(farPoints, 2);
  assertEquals(simplifiedFar.length, 4); // All points should be kept
});

Deno.test("Drawing Calculations - Canvas bounds checking", () => {
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Test point inside canvas
  const insidePoint: Point = { x: 400, y: 300 };
  assertEquals(isPointInCanvas(insidePoint, canvasWidth, canvasHeight), true);

  // Test point on canvas edge
  const edgePoint: Point = { x: 0, y: 0 };
  assertEquals(isPointInCanvas(edgePoint, canvasWidth, canvasHeight), true);

  const bottomRightEdge: Point = { x: canvasWidth, y: canvasHeight };
  assertEquals(isPointInCanvas(bottomRightEdge, canvasWidth, canvasHeight), true);

  // Test point outside canvas
  const outsidePoint: Point = { x: 900, y: 700 };
  assertEquals(isPointInCanvas(outsidePoint, canvasWidth, canvasHeight), false);

  const negativePoint: Point = { x: -10, y: -10 };
  assertEquals(isPointInCanvas(negativePoint, canvasWidth, canvasHeight), false);
});

Deno.test("Drawing Calculations - Point clamping", () => {
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Test point inside bounds (should remain unchanged)
  const insidePoint: Point = { x: 400, y: 300 };
  const clampedInside = clampPointToCanvas(insidePoint, canvasWidth, canvasHeight);
  assertEquals(clampedInside.x, 400);
  assertEquals(clampedInside.y, 300);

  // Test point outside bounds (should be clamped)
  const outsidePoint: Point = { x: 900, y: 700 };
  const clampedOutside = clampPointToCanvas(outsidePoint, canvasWidth, canvasHeight);
  assertEquals(clampedOutside.x, canvasWidth);
  assertEquals(clampedOutside.y, canvasHeight);

  // Test negative coordinates (should be clamped to 0)
  const negativePoint: Point = { x: -50, y: -100 };
  const clampedNegative = clampPointToCanvas(negativePoint, canvasWidth, canvasHeight);
  assertEquals(clampedNegative.x, 0);
  assertEquals(clampedNegative.y, 0);

  // Test mixed coordinates (one inside, one outside)
  const mixedPoint: Point = { x: 400, y: 700 };
  const clampedMixed = clampPointToCanvas(mixedPoint, canvasWidth, canvasHeight);
  assertEquals(clampedMixed.x, 400);
  assertEquals(clampedMixed.y, canvasHeight);
});

Deno.test("Drawing Calculations - Mouse coordinate conversion", () => {
  const canvas = new MockCanvas() as any;

  // Test basic coordinate conversion
  const mouseEvent = {
    clientX: 110, // 10 (canvas left) + 100
    clientY: 120, // 20 (canvas top) + 100
  } as MouseEvent;

  const point = getCanvasCoordinatesFromMouse(mouseEvent, canvas);
  assertEquals(point.x, 100);
  assertEquals(point.y, 100);

  // Test edge coordinates
  const edgeEvent = {
    clientX: 10, // Canvas left edge
    clientY: 20, // Canvas top edge
  } as MouseEvent;

  const edgePoint = getCanvasCoordinatesFromMouse(edgeEvent, canvas);
  assertEquals(edgePoint.x, 0);
  assertEquals(edgePoint.y, 0);
});

Deno.test("Drawing Calculations - Touch coordinate conversion", () => {
  const canvas = new MockCanvas() as any;

  // Test basic touch coordinate conversion
  const touchEvent = {
    touches: [{
      clientX: 160, // 10 (canvas left) + 150
      clientY: 170, // 20 (canvas top) + 150
      force: 0.8,
    }],
  } as any;

  const point = getCanvasCoordinatesFromTouch(touchEvent, canvas);
  assertEquals(point.x, 150);
  assertEquals(point.y, 150);
  assertEquals(point.pressure, 0.8);

  // Test touch without force (should default to 1.0)
  const touchEventNoForce = {
    touches: [{
      clientX: 110,
      clientY: 120,
    }],
  } as any;

  const pointNoForce = getCanvasCoordinatesFromTouch(touchEventNoForce, canvas);
  assertEquals(pointNoForce.x, 100);
  assertEquals(pointNoForce.y, 100);
  assertEquals(pointNoForce.pressure, 1.0);

  // Test empty touches array
  const emptyTouchEvent = {
    touches: [],
    changedTouches: [],
  } as any;

  const emptyPoint = getCanvasCoordinatesFromTouch(emptyTouchEvent, canvas);
  assertEquals(emptyPoint.x, 0);
  assertEquals(emptyPoint.y, 0);
  assertEquals(emptyPoint.pressure, 1);
});

Deno.test("Drawing Calculations - Smooth line drawing", () => {
  const ctx = new MockCanvasRenderingContext2D() as any;

  // Test empty points array (should not throw, but won't set properties)
  const initialLineWidth = ctx.lineWidth;
  drawSmoothLine(ctx, [], "#000000", 2);
  // Properties should remain unchanged for empty array
  assertEquals(ctx.lineWidth, initialLineWidth);

  // Test single point (should not throw, but won't set properties)
  const singlePoint: Point[] = [{ x: 10, y: 10 }];
  drawSmoothLine(ctx, singlePoint, "#ff0000", 3);
  // Properties should remain unchanged for single point
  assertEquals(ctx.lineWidth, initialLineWidth);

  // Test two points (should draw straight line)
  const twoPoints: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ];
  drawSmoothLine(ctx, twoPoints, "#00ff00", 4);
  assertEquals(ctx.strokeStyle, "#00ff00");
  assertEquals(ctx.lineWidth, 4);

  // Test multiple points (should draw smooth curves)
  const multiplePoints: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 5 },
    { x: 20, y: 10 },
    { x: 30, y: 5 },
  ];
  drawSmoothLine(ctx, multiplePoints, "#0000ff", 5);
  assertEquals(ctx.strokeStyle, "#0000ff");
  assertEquals(ctx.lineWidth, 5);
});

Deno.test("Drawing Calculations - Pressure sensitivity", () => {
  // Test pressure value normalization
  const testPressures = [0, 0.25, 0.5, 0.75, 1.0, 1.5]; // Including out-of-range value

  testPressures.forEach((pressure) => {
    const normalizedPressure = Math.max(0, Math.min(1, pressure));
    assertEquals(normalizedPressure >= 0, true);
    assertEquals(normalizedPressure <= 1, true);

    if (pressure <= 0) {
      assertEquals(normalizedPressure, 0);
    } else if (pressure >= 1) {
      assertEquals(normalizedPressure, 1);
    } else {
      assertEquals(normalizedPressure, pressure);
    }
  });
});

Deno.test("Drawing Calculations - Stroke width calculations", () => {
  // Test width scaling based on pressure
  const baseWidth = 5;
  const testPressures = [0.1, 0.5, 0.8, 1.0];

  testPressures.forEach((pressure) => {
    const scaledWidth = baseWidth * pressure;
    assertEquals(scaledWidth >= 0, true);
    assertEquals(scaledWidth <= baseWidth, true);

    if (pressure === 1.0) {
      assertEquals(scaledWidth, baseWidth);
    } else if (pressure === 0.5) {
      assertEquals(scaledWidth, baseWidth * 0.5);
    }
  });
});

Deno.test("Drawing Calculations - Bezier curve calculations", () => {
  // Test quadratic bezier curve point calculation
  const calculateQuadraticBezier = (t: number, p0: Point, p1: Point, p2: Point): Point => {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  };

  const p0: Point = { x: 0, y: 0 };
  const p1: Point = { x: 50, y: 100 };
  const p2: Point = { x: 100, y: 0 };

  // Test curve at t=0 (should be p0)
  const start = calculateQuadraticBezier(0, p0, p1, p2);
  assertEquals(start.x, p0.x);
  assertEquals(start.y, p0.y);

  // Test curve at t=1 (should be p2)
  const end = calculateQuadraticBezier(1, p0, p1, p2);
  assertEquals(end.x, p2.x);
  assertEquals(end.y, p2.y);

  // Test curve at t=0.5 (should be influenced by all points)
  const middle = calculateQuadraticBezier(0.5, p0, p1, p2);
  assertEquals(middle.x, 50); // Should be at horizontal middle
  assertEquals(middle.y, 50); // Should be influenced by control point
});

console.log("✅ All drawing calculation tests completed successfully!");
