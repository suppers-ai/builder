/**
 * Image tools module exports
 */

export { handleImageTools } from "./handler.ts";
export { 
  getTool, 
  getAvailableTools, 
  registerTool, 
  getToolsInfo,
  checkDependencies 
} from "./tools-registry.ts";
export type { 
  ImageTool, 
  ImageToolRequest, 
  ImageToolResponse, 
  ImageProcessingOptions,
  ThumbnailOptions,
  ImageProcessingResult 
} from "./types.ts";
export { 
  createThumbnail, 
  resizeImage, 
  convertFormat,
  checkFFmpegAvailable 
} from "./ffmpeg-processor.ts";
export { 
  isValidImageFormat,
  generateTempPath,
  cleanupTempFiles,
  validateImageOptions,
  SUPPORTED_INPUT_FORMATS,
  SUPPORTED_OUTPUT_FORMATS
} from "./utils.ts";