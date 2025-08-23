/**
 * FFmpeg-based image processing functions
 */

import type { ImageProcessingResult, ThumbnailOptions } from "./types.ts";
import {
  cleanupTempFiles,
  ensureDir,
  generateTempPath,
  getFileSize,
  readFileAsBytes,
  writeBytesToFile,
} from "./utils.ts";

/**
 * Checks if FFmpeg is available in the system
 */
export async function checkFFmpegAvailable(): Promise<boolean> {
  try {
    const process = new Deno.Command("ffmpeg", {
      args: ["-version"],
      stdout: "null",
      stderr: "null",
    });
    const result = await process.output();
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Generates image metadata using FFprobe
 */
export async function getImageMetadata(inputPath: string): Promise<{
  width?: number;
  height?: number;
  format?: string;
  duration?: number;
}> {
  try {
    const process = new Deno.Command("ffprobe", {
      args: [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        inputPath,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const result = await process.output();

    if (!result.success) {
      throw new Error("FFprobe failed to analyze image");
    }

    const output = new TextDecoder().decode(result.stdout);
    const metadata = JSON.parse(output);

    const videoStream = metadata.streams?.find((stream: any) => stream.codec_type === "video");

    return {
      width: videoStream?.width,
      height: videoStream?.height,
      format: metadata.format?.format_name,
      duration: parseFloat(metadata.format?.duration || "0"),
    };
  } catch (error) {
    console.warn("Failed to get image metadata:", error);
    return {};
  }
}

/**
 * Creates a thumbnail using FFmpeg
 */
export async function createThumbnail(
  input: string | Uint8Array,
  options: ThumbnailOptions,
): Promise<ImageProcessingResult> {
  const startTime = Date.now();
  const tempFiles: string[] = [];

  try {
    // Ensure temp directory exists
    await ensureDir("/tmp");

    // Handle input
    let inputPath: string;
    if (typeof input === "string") {
      inputPath = input;
    } else {
      inputPath = generateTempPath("input", ".tmp");
      await writeBytesToFile(input, inputPath);
      tempFiles.push(inputPath);
    }

    // Get original file size and metadata
    const originalSize = await getFileSize(inputPath);
    const originalMetadata = await getImageMetadata(inputPath);

    // Generate output path
    const outputFormat = options.format || "jpeg";
    const outputPath = generateTempPath("thumbnail", `.${outputFormat}`);
    tempFiles.push(outputPath);

    // Build FFmpeg command
    const ffmpegArgs = [
      "-i",
      inputPath,
      "-vf",
      `scale=${options.width}:${options.height}${
        options.maintainAspectRatio
          ? ":force_original_aspect_ratio=decrease,pad=${options.width}:${options.height}:(ow-iw)/2:(oh-ih)/2"
          : ""
      }`,
      "-y", // Overwrite output file
    ];

    // Add quality settings
    if (options.quality !== undefined) {
      if (outputFormat === "jpeg") {
        ffmpegArgs.push("-q:v", Math.round((100 - options.quality) * 31 / 100).toString());
      } else if (outputFormat === "webp") {
        ffmpegArgs.push("-quality", options.quality.toString());
      }
    }

    // Add format-specific options
    if (outputFormat === "png") {
      ffmpegArgs.push("-pix_fmt", "rgba");
    } else if (outputFormat === "jpeg") {
      ffmpegArgs.push("-pix_fmt", "yuv420p");
    }

    ffmpegArgs.push(outputPath);

    // Execute FFmpeg
    const process = new Deno.Command("ffmpeg", {
      args: ffmpegArgs,
      stdout: "piped",
      stderr: "piped",
    });

    const result = await process.output();

    if (!result.success) {
      const errorOutput = new TextDecoder().decode(result.stderr);
      throw new Error(`FFmpeg failed: ${errorOutput}`);
    }

    // Read the output
    const outputBuffer = await readFileAsBytes(outputPath);
    const processedSize = outputBuffer.length;
    const processingTime = Date.now() - startTime;

    // Cleanup temp files
    await cleanupTempFiles(tempFiles);

    return {
      success: true,
      outputBuffer,
      metadata: {
        originalSize,
        processedSize,
        originalDimensions: {
          width: originalMetadata.width || 0,
          height: originalMetadata.height || 0,
        },
        processedDimensions: {
          width: options.width,
          height: options.height,
        },
        processingTime,
      },
    };
  } catch (error) {
    // Cleanup temp files on error
    await cleanupTempFiles(tempFiles);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Resizes an image using FFmpeg
 */
export async function resizeImage(
  input: string | Uint8Array,
  options: {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
    format?: string;
    quality?: number;
  },
): Promise<ImageProcessingResult> {
  const startTime = Date.now();
  const tempFiles: string[] = [];

  try {
    await ensureDir("/tmp");

    // Handle input
    let inputPath: string;
    if (typeof input === "string") {
      inputPath = input;
    } else {
      inputPath = generateTempPath("input", ".tmp");
      await writeBytesToFile(input, inputPath);
      tempFiles.push(inputPath);
    }

    const originalSize = await getFileSize(inputPath);
    const originalMetadata = await getImageMetadata(inputPath);

    const outputFormat = options.format || "jpeg";
    const outputPath = generateTempPath("resized", `.${outputFormat}`);
    tempFiles.push(outputPath);

    // Build scale filter
    let scaleFilter = "";
    if (options.width && options.height) {
      scaleFilter = `scale=${options.width}:${options.height}`;
      if (options.maintainAspectRatio) {
        scaleFilter += ":force_original_aspect_ratio=decrease";
      }
    } else if (options.width) {
      scaleFilter = `scale=${options.width}:-1`;
    } else if (options.height) {
      scaleFilter = `scale=-1:${options.height}`;
    } else {
      scaleFilter = "scale=iw:ih"; // No scaling
    }

    const ffmpegArgs = [
      "-i",
      inputPath,
      "-vf",
      scaleFilter,
      "-y",
    ];

    if (options.quality !== undefined && outputFormat === "jpeg") {
      ffmpegArgs.push("-q:v", Math.round((100 - options.quality) * 31 / 100).toString());
    }

    ffmpegArgs.push(outputPath);

    const process = new Deno.Command("ffmpeg", {
      args: ffmpegArgs,
      stdout: "piped",
      stderr: "piped",
    });

    const result = await process.output();

    if (!result.success) {
      const errorOutput = new TextDecoder().decode(result.stderr);
      throw new Error(`FFmpeg failed: ${errorOutput}`);
    }

    const outputBuffer = await readFileAsBytes(outputPath);
    const processedSize = outputBuffer.length;
    const processingTime = Date.now() - startTime;

    await cleanupTempFiles(tempFiles);

    return {
      success: true,
      outputBuffer,
      metadata: {
        originalSize,
        processedSize,
        originalDimensions: {
          width: originalMetadata.width || 0,
          height: originalMetadata.height || 0,
        },
        processingTime,
      },
    };
  } catch (error) {
    await cleanupTempFiles(tempFiles);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Converts image format using FFmpeg
 */
export async function convertFormat(
  input: string | Uint8Array,
  options: {
    format: string;
    quality?: number;
  },
): Promise<ImageProcessingResult> {
  const startTime = Date.now();
  const tempFiles: string[] = [];

  try {
    await ensureDir("/tmp");

    let inputPath: string;
    if (typeof input === "string") {
      inputPath = input;
    } else {
      inputPath = generateTempPath("input", ".tmp");
      await writeBytesToFile(input, inputPath);
      tempFiles.push(inputPath);
    }

    const originalSize = await getFileSize(inputPath);
    const outputPath = generateTempPath("converted", `.${options.format}`);
    tempFiles.push(outputPath);

    const ffmpegArgs = ["-i", inputPath, "-y"];

    if (options.quality !== undefined && options.format === "jpeg") {
      ffmpegArgs.push("-q:v", Math.round((100 - options.quality) * 31 / 100).toString());
    }

    ffmpegArgs.push(outputPath);

    const process = new Deno.Command("ffmpeg", {
      args: ffmpegArgs,
      stdout: "piped",
      stderr: "piped",
    });

    const result = await process.output();

    if (!result.success) {
      const errorOutput = new TextDecoder().decode(result.stderr);
      throw new Error(`FFmpeg failed: ${errorOutput}`);
    }

    const outputBuffer = await readFileAsBytes(outputPath);
    const processedSize = outputBuffer.length;
    const processingTime = Date.now() - startTime;

    await cleanupTempFiles(tempFiles);

    return {
      success: true,
      outputBuffer,
      metadata: {
        originalSize,
        processedSize,
        processingTime,
      },
    };
  } catch (error) {
    await cleanupTempFiles(tempFiles);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
