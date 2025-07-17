// File system operations for copying and creating project files
import { fs, logger, type FileOperationResult } from "../../shared/src/utils.ts";
import type { AppConfig } from "../../shared/src/types.ts";

/**
 * Options for file operations
 */
export interface FileOperationOptions {
  /** Whether to overwrite existing files (default: false) */
  overwrite?: boolean;
  /** Whether to create parent directories if they don't exist (default: true) */
  createDirs?: boolean;
  /** Whether to log operations (default: true) */
  verbose?: boolean;
  /** Whether to perform a dry run without actually writing files (default: false) */
  dryRun?: boolean;
}

/**
 * Directory structure definition for project generation
 */
export interface DirectoryStructure {
  /** Name of the directory */
  name: string;
  /** Subdirectories */
  directories?: DirectoryStructure[];
  /** Files to create in this directory */
  files?: {
    /** Name of the file */
    name: string;
    /** Content of the file (optional) */
    content?: string;
    /** Template path to copy from (optional) */
    template?: string;
    /** Whether to process the file as a template (default: true) */
    process?: boolean;
  }[];
}

/**
 * Result of directory structure generation
 */
export interface DirectoryGenerationResult {
  /** Whether the generation was successful */
  success: boolean;
  /** Path to the root directory */
  rootPath: string;
  /** Results of individual file operations */
  results: FileOperationResult[];
  /** Any errors that occurred during generation */
  errors: string[];
}

/**
 * File manager for handling file system operations during compilation
 */
export class FileManager {
  /**
   * Create a file with the given content
   * 
   * @param path Path to the file
   * @param content Content to write
   * @param options File operation options
   * @returns Result of the operation
   */
  async createFile(
    path: string,
    content: string | Uint8Array,
    options: FileOperationOptions = {}
  ): Promise<FileOperationResult> {
    const {
      overwrite = false,
      createDirs = true,
      verbose = true,
      dryRun = false
    } = options;
    
    const normalizedPath = fs.normalizePath(path);
    
    try {
      // Check if file exists
      try {
        const stat = await Deno.stat(normalizedPath);
        if (stat.isFile && !overwrite) {
          return {
            success: false,
            path: normalizedPath,
            error: `File already exists: ${normalizedPath}`
          };
        }
      } catch (error) {
        // File doesn't exist, which is fine
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
      
      // Create parent directories if needed
      if (createDirs) {
        const dirPath = fs.getDirname(normalizedPath);
        await this.createDirectory(dirPath, { verbose: false, dryRun });
      }
      
      // Write the file
      if (!dryRun) {
        if (typeof content === 'string') {
          await Deno.writeTextFile(normalizedPath, content);
        } else {
          await Deno.writeFile(normalizedPath, content);
        }
      }
      
      const size = typeof content === 'string' ? 
        new TextEncoder().encode(content).length : 
        content.length;
      
      if (verbose) {
        const action = dryRun ? 'Would create' : 'Created';
        logger.info(`${action} file: ${normalizedPath} (${size} bytes)`);
      }
      
      return {
        success: true,
        path: normalizedPath,
        size
      };
    } catch (error) {
      const errorMessage = `Failed to create file ${normalizedPath}: ${error instanceof Error ? error.message : String(error)}`;
      if (verbose) {
        logger.error(errorMessage);
      }
      
      return {
        success: false,
        path: normalizedPath,
        error: errorMessage
      };
    }
  }
  
  /**
   * Create a directory and its parent directories
   * 
   * @param path Path to the directory
   * @param options File operation options
   * @returns Result of the operation
   */
  async createDirectory(
    path: string,
    options: FileOperationOptions = {}
  ): Promise<FileOperationResult> {
    const { verbose = true, dryRun = false } = options;
    const normalizedPath = fs.normalizePath(path);
    
    try {
      // Check if directory exists
      try {
        const stat = await Deno.stat(normalizedPath);
        if (stat.isDirectory) {
          return {
            success: true,
            path: normalizedPath
          };
        }
      } catch (error) {
        // Directory doesn't exist, which is fine
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
      
      // Create the directory
      if (!dryRun) {
        await Deno.mkdir(normalizedPath, { recursive: true });
      }
      
      if (verbose) {
        const action = dryRun ? 'Would create' : 'Created';
        logger.info(`${action} directory: ${normalizedPath}`);
      }
      
      return {
        success: true,
        path: normalizedPath
      };
    } catch (error) {
      const errorMessage = `Failed to create directory ${normalizedPath}: ${error instanceof Error ? error.message : String(error)}`;
      if (verbose) {
        logger.error(errorMessage);
      }
      
      return {
        success: false,
        path: normalizedPath,
        error: errorMessage
      };
    }
  }
  
  /**
   * Copy a file from source to destination
   * 
   * @param source Source file path
   * @param destination Destination file path
   * @param options File operation options
   * @returns Result of the operation
   */
  async copyFile(
    source: string,
    destination: string,
    options: FileOperationOptions = {}
  ): Promise<FileOperationResult> {
    const {
      overwrite = false,
      createDirs = true,
      verbose = true,
      dryRun = false
    } = options;
    
    const normalizedSource = fs.normalizePath(source);
    const normalizedDest = fs.normalizePath(destination);
    
    try {
      // Check if source file exists
      try {
        await Deno.stat(normalizedSource);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return {
            success: false,
            path: normalizedDest,
            error: `Source file not found: ${normalizedSource}`
          };
        }
        throw error;
      }
      
      // Check if destination file exists
      try {
        const stat = await Deno.stat(normalizedDest);
        if (stat.isFile && !overwrite) {
          return {
            success: false,
            path: normalizedDest,
            error: `Destination file already exists: ${normalizedDest}`
          };
        }
      } catch (error) {
        // Destination doesn't exist, which is fine
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
      
      // Create parent directories if needed
      if (createDirs) {
        const dirPath = fs.getDirname(normalizedDest);
        await this.createDirectory(dirPath, { verbose: false, dryRun });
      }
      
      // Copy the file
      if (!dryRun) {
        await Deno.copyFile(normalizedSource, normalizedDest);
      }
      
      // Get file size
      const fileInfo = await Deno.stat(normalizedSource);
      const size = fileInfo.size;
      
      if (verbose) {
        const action = dryRun ? 'Would copy' : 'Copied';
        logger.info(`${action} file: ${normalizedSource} -> ${normalizedDest} (${size} bytes)`);
      }
      
      return {
        success: true,
        path: normalizedDest,
        size
      };
    } catch (error) {
      const errorMessage = `Failed to copy file ${normalizedSource} to ${normalizedDest}: ${error instanceof Error ? error.message : String(error)}`;
      if (verbose) {
        logger.error(errorMessage);
      }
      
      return {
        success: false,
        path: normalizedDest,
        error: errorMessage
      };
    }
  }
  
  /**
   * Copy a directory recursively
   * 
   * @param source Source directory path
   * @param destination Destination directory path
   * @param options File operation options
   * @returns Results of the operations
   */
  async copyDirectory(
    source: string,
    destination: string,
    options: FileOperationOptions = {}
  ): Promise<FileOperationResult[]> {
    const {
      overwrite = false,
      verbose = true,
      dryRun = false
    } = options;
    
    const normalizedSource = fs.normalizePath(source);
    const normalizedDest = fs.normalizePath(destination);
    
    try {
      // Check if source directory exists
      try {
        const stat = await Deno.stat(normalizedSource);
        if (!stat.isDirectory) {
          return [{
            success: false,
            path: normalizedDest,
            error: `Source is not a directory: ${normalizedSource}`
          }];
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return [{
            success: false,
            path: normalizedDest,
            error: `Source directory not found: ${normalizedSource}`
          }];
        }
        throw error;
      }
      
      // Create destination directory
      await this.createDirectory(normalizedDest, { verbose: false, dryRun });
      
      // Read source directory
      const entries = [];
      for await (const entry of Deno.readDir(normalizedSource)) {
        entries.push(entry);
      }
      
      // Copy all entries
      const results: FileOperationResult[] = [];
      
      for (const entry of entries) {
        const sourcePath = fs.joinPath(normalizedSource, entry.name);
        const destPath = fs.joinPath(normalizedDest, entry.name);
        
        if (entry.isDirectory) {
          const dirResults = await this.copyDirectory(sourcePath, destPath, options);
          results.push(...dirResults);
        } else {
          const fileResult = await this.copyFile(sourcePath, destPath, { ...options, createDirs: false });
          results.push(fileResult);
        }
      }
      
      if (verbose) {
        const action = dryRun ? 'Would copy' : 'Copied';
        const successCount = results.filter(r => r.success).length;
        logger.info(`${action} directory: ${normalizedSource} -> ${normalizedDest} (${successCount} files)`);
      }
      
      return results;
    } catch (error) {
      const errorMessage = `Failed to copy directory ${normalizedSource} to ${normalizedDest}: ${error instanceof Error ? error.message : String(error)}`;
      if (verbose) {
        logger.error(errorMessage);
      }
      
      return [{
        success: false,
        path: normalizedDest,
        error: errorMessage
      }];
    }
  }
  
  /**
   * Delete a file
   * 
   * @param path Path to the file
   * @param options File operation options
   * @returns Result of the operation
   */
  async deleteFile(
    path: string,
    options: FileOperationOptions = {}
  ): Promise<FileOperationResult> {
    const { verbose = true, dryRun = false } = options;
    const normalizedPath = fs.normalizePath(path);
    
    try {
      // Check if file exists
      try {
        const stat = await Deno.stat(normalizedPath);
        if (!stat.isFile) {
          return {
            success: false,
            path: normalizedPath,
            error: `Not a file: ${normalizedPath}`
          };
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return {
            success: false,
            path: normalizedPath,
            error: `File not found: ${normalizedPath}`
          };
        }
        throw error;
      }
      
      // Delete the file
      if (!dryRun) {
        await Deno.remove(normalizedPath);
      }
      
      if (verbose) {
        const action = dryRun ? 'Would delete' : 'Deleted';
        logger.info(`${action} file: ${normalizedPath}`);
      }
      
      return {
        success: true,
        path: normalizedPath
      };
    } catch (error) {
      const errorMessage = `Failed to delete file ${normalizedPath}: ${error instanceof Error ? error.message : String(error)}`;
      if (verbose) {
        logger.error(errorMessage);
      }
      
      return {
        success: false,
        path: normalizedPath,
        error: errorMessage
      };
    }
  }
  
  /**
   * Delete a directory recursively
   * 
   * @param path Path to the directory
   * @param options File operation options
   * @returns Result of the operation
   */
  async deleteDirectory(
    path: string,
    options: FileOperationOptions = {}
  ): Promise<FileOperationResult> {
    const { verbose = true, dryRun = false } = options;
    const normalizedPath = fs.normalizePath(path);
    
    try {
      // Check if directory exists
      try {
        const stat = await Deno.stat(normalizedPath);
        if (!stat.isDirectory) {
          return {
            success: false,
            path: normalizedPath,
            error: `Not a directory: ${normalizedPath}`
          };
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return {
            success: false,
            path: normalizedPath,
            error: `Directory not found: ${normalizedPath}`
          };
        }
        throw error;
      }
      
      // Delete the directory
      if (!dryRun) {
        await Deno.remove(normalizedPath, { recursive: true });
      }
      
      if (verbose) {
        const action = dryRun ? 'Would delete' : 'Deleted';
        logger.info(`${action} directory: ${normalizedPath}`);
      }
      
      return {
        success: true,
        path: normalizedPath
      };
    } catch (error) {
      const errorMessage = `Failed to delete directory ${normalizedPath}: ${error instanceof Error ? error.message : String(error)}`;
      if (verbose) {
        logger.error(errorMessage);
      }
      
      return {
        success: false,
        path: normalizedPath,
        error: errorMessage
      };
    }
  }
  
  /**
   * Check if a file exists
   * 
   * @param path Path to the file
   * @returns Whether the file exists
   */
  async fileExists(path: string): Promise<boolean> {
    const normalizedPath = fs.normalizePath(path);
    
    try {
      const stat = await Deno.stat(normalizedPath);
      return stat.isFile;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return false;
      }
      throw error;
    }
  }
  
  /**
   * Check if a directory exists
   * 
   * @param path Path to the directory
   * @returns Whether the directory exists
   */
  async directoryExists(path: string): Promise<boolean> {
    const normalizedPath = fs.normalizePath(path);
    
    try {
      const stat = await Deno.stat(normalizedPath);
      return stat.isDirectory;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return false;
      }
      throw error;
    }
  }
  
  /**
   * Generate a directory structure based on a configuration
   * 
   * @param rootPath Path to the root directory
   * @param structure Directory structure definition
   * @param options File operation options
   * @returns Result of the directory structure generation
   */
  async generateDirectoryStructure(
    rootPath: string,
    structure: DirectoryStructure,
    options: FileOperationOptions = {}
  ): Promise<DirectoryGenerationResult> {
    const normalizedRootPath = fs.normalizePath(rootPath);
    const results: FileOperationResult[] = [];
    const errors: string[] = [];
    
    try {
      // Create the root directory
      const dirPath = fs.joinPath(normalizedRootPath, structure.name);
      const dirResult = await this.createDirectory(dirPath, options);
      results.push(dirResult);
      
      if (!dirResult.success) {
        errors.push(dirResult.error || `Failed to create directory: ${dirPath}`);
        return {
          success: false,
          rootPath: dirPath,
          results,
          errors
        };
      }
      
      // Create files in this directory
      if (structure.files && structure.files.length > 0) {
        for (const file of structure.files) {
          const filePath = fs.joinPath(dirPath, file.name);
          let fileResult: FileOperationResult;
          
          if (file.template) {
            // Copy from template
            fileResult = await this.copyFile(file.template, filePath, options);
          } else if (file.content !== undefined) {
            // Create with content
            fileResult = await this.createFile(filePath, file.content, options);
          } else {
            // Create empty file
            fileResult = await this.createFile(filePath, "", options);
          }
          
          results.push(fileResult);
          
          if (!fileResult.success) {
            errors.push(fileResult.error || `Failed to create file: ${filePath}`);
          }
        }
      }
      
      // Create subdirectories
      if (structure.directories && structure.directories.length > 0) {
        for (const subdir of structure.directories) {
          const subdirResult = await this.generateDirectoryStructure(dirPath, subdir, options);
          results.push(...subdirResult.results);
          
          if (!subdirResult.success) {
            errors.push(...subdirResult.errors);
          }
        }
      }
      
      return {
        success: errors.length === 0,
        rootPath: dirPath,
        results,
        errors
      };
    } catch (error) {
      const errorMessage = `Failed to generate directory structure at ${normalizedRootPath}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      errors.push(errorMessage);
      
      return {
        success: false,
        rootPath: normalizedRootPath,
        results,
        errors
      };
    }
  }
  
  /**
   * Generate a project structure based on an app configuration
   * 
   * @param outputPath Path to the output directory
   * @param config App configuration
   * @param templateRoot Path to the template root directory
   * @param options File operation options
   * @returns Result of the project structure generation
   */
  async generateProjectStructure(
    outputPath: string,
    config: AppConfig,
    templateRoot: string,
    options: FileOperationOptions = {}
  ): Promise<DirectoryGenerationResult> {
    const normalizedOutputPath = fs.normalizePath(outputPath);
    const normalizedTemplateRoot = fs.normalizePath(templateRoot);
    const results: FileOperationResult[] = [];
    const errors: string[] = [];
    
    try {
      // Create the project root directory
      const projectName = config.metadata.name;
      const projectDir = fs.joinPath(normalizedOutputPath, projectName);
      const dirResult = await this.createDirectory(projectDir, options);
      results.push(dirResult);
      
      if (!dirResult.success) {
        errors.push(dirResult.error || `Failed to create project directory: ${projectDir}`);
        return {
          success: false,
          rootPath: projectDir,
          results,
          errors
        };
      }
      
      // Create standard Fresh project structure
      const standardDirs = [
        'routes',
        'islands',
        'components',
        'static',
        'static/styles',
        'static/images',
        'utils',
        'data'
      ];
      
      for (const dir of standardDirs) {
        const dirPath = fs.joinPath(projectDir, dir);
        const result = await this.createDirectory(dirPath, { ...options, verbose: false });
        results.push(result);
        
        if (!result.success) {
          errors.push(result.error || `Failed to create directory: ${dirPath}`);
        }
      }
      
      // Copy base template files
      const baseTemplateDir = fs.joinPath(normalizedTemplateRoot, 'base');
      if (await this.directoryExists(baseTemplateDir)) {
        const copyResults = await this.copyDirectory(baseTemplateDir, projectDir, {
          ...options,
          overwrite: true
        });
        results.push(...copyResults);
        
        // Check for errors in copy results
        for (const result of copyResults) {
          if (!result.success) {
            errors.push(result.error || `Failed to copy template file: ${result.path}`);
          }
        }
      } else {
        errors.push(`Base template directory not found: ${baseTemplateDir}`);
      }
      
      // Create API routes directory if API endpoints are defined
      if (config.api && config.api.endpoints && config.api.endpoints.length > 0) {
        const apiDir = fs.joinPath(projectDir, 'routes/api');
        const result = await this.createDirectory(apiDir, options);
        results.push(result);
        
        if (!result.success) {
          errors.push(result.error || `Failed to create API directory: ${apiDir}`);
        }
      }
      
      // Create component directories based on component definitions
      if (config.components && config.components.length > 0) {
        // Group components by type to organize them in directories
        const componentTypes = new Set<string>();
        for (const component of config.components) {
          if (component.type) {
            componentTypes.add(component.type.split('/')[0]);
          }
        }
        
        for (const type of componentTypes) {
          const componentDir = fs.joinPath(projectDir, `components/${type}`);
          const result = await this.createDirectory(componentDir, { ...options, verbose: false });
          results.push(result);
          
          if (!result.success) {
            errors.push(result.error || `Failed to create component directory: ${componentDir}`);
          }
        }
      }
      
      return {
        success: errors.length === 0,
        rootPath: projectDir,
        results,
        errors
      };
    } catch (error) {
      const errorMessage = `Failed to generate project structure at ${normalizedOutputPath}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      
      errors.push(errorMessage);
      
      return {
        success: false,
        rootPath: normalizedOutputPath,
        results,
        errors
      };
    }
  }
}

// Export a default instance
export const fileManager = new FileManager();