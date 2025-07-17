// JSON configuration parser and validator
import { 
  AppConfig, 
  CompilationError, 
  ErrorLocation 
} from "../../shared/src/types.ts";
import { 
  validator, 
  validateAppConfig, 
  toCompilationErrors 
} from "../../shared/src/validators.ts";

/**
 * Error thrown when there's an issue with parsing or validating a configuration file
 */
export class ConfigParseError extends Error {
  errors: CompilationError[];
  
  constructor(message: string, errors: CompilationError[] = []) {
    super(message);
    this.name = "ConfigParseError";
    this.errors = errors;
  }
}

/**
 * Options for parsing a configuration file
 */
export interface ParseOptions {
  /** Whether to throw an error on validation failure */
  throwOnError?: boolean;
  /** Whether to include line numbers in error messages */
  includeLineNumbers?: boolean;
  /** Whether to include suggestions for fixing errors */
  includeSuggestions?: boolean;
}

/**
 * Result of parsing a configuration file
 */
export interface ParseResult {
  /** The parsed configuration */
  config: AppConfig | null;
  /** Any errors that occurred during parsing or validation */
  errors: CompilationError[];
  /** Whether the parsing was successful */
  success: boolean;
}

/**
 * Parses and validates a JSON configuration file
 */
export class ConfigParser {
  /**
   * Parse a JSON string into an AppConfig object
   * 
   * @param jsonString The JSON string to parse
   * @param options Parsing options
   * @returns The parse result containing the config and any errors
   */
  parseString(jsonString: string, options: ParseOptions = {}): ParseResult {
    const { throwOnError = false, includeLineNumbers = true } = options;
    const errors: CompilationError[] = [];
    let config: AppConfig | null = null;
    
    try {
      // Parse the JSON string
      const parsedJson = JSON.parse(jsonString);
      
      // Validate the parsed JSON against the AppConfig schema
      const validationResult = validateAppConfig(parsedJson);
      
      if (!validationResult.valid) {
        // Convert validation errors to compilation errors
        const validationErrors = toCompilationErrors(validationResult);
        
        // Add line numbers to errors if requested
        if (includeLineNumbers) {
          validationErrors.forEach(error => {
            if (error.location?.path) {
              const lineInfo = this.findLineNumber(jsonString, error.location.path);
              if (lineInfo) {
                error.location = { ...error.location, ...lineInfo };
              }
            }
          });
        }
        
        errors.push(...validationErrors);
      }
      
      // If there are no errors, or we're not throwing on error, set the config
      if (errors.length === 0 || !throwOnError) {
        config = parsedJson as AppConfig;
      }
      
      // If there are errors and we're throwing on error, throw a ConfigParseError
      if (errors.length > 0 && throwOnError) {
        throw new ConfigParseError("Configuration validation failed", errors);
      }
      
      return {
        config,
        errors,
        success: errors.length === 0
      };
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        const lineInfo = this.findJsonSyntaxErrorLine(jsonString, error);
        const compilationError: CompilationError = {
          type: "validation",
          message: `JSON syntax error: ${error.message}`,
          details: error.message,
          location: lineInfo
        };
        errors.push(compilationError);
      } else if (error instanceof ConfigParseError) {
        // Re-throw ConfigParseError
        throw error;
      } else {
        // Handle other errors
        const compilationError: CompilationError = {
          type: "validation",
          message: `Error parsing configuration: ${error instanceof Error ? error.message : String(error)}`,
        };
        errors.push(compilationError);
      }
      
      if (throwOnError) {
        throw new ConfigParseError("Configuration parsing failed", errors);
      }
      
      return {
        config: null,
        errors,
        success: false
      };
    }
  }
  
  /**
   * Parse a JSON file into an AppConfig object
   * 
   * @param filePath The path to the JSON file
   * @param options Parsing options
   * @returns The parse result containing the config and any errors
   */
  async parseFile(filePath: string, options: ParseOptions = {}): Promise<ParseResult> {
    try {
      // Read the file
      const fileContent = await Deno.readTextFile(filePath);
      
      // Parse the file content
      const result = this.parseString(fileContent, options);
      
      // Add file information to error locations
      result.errors.forEach(error => {
        error.location = {
          ...error.location,
          file: filePath
        };
      });
      
      return result;
    } catch (error) {
      // Handle file reading errors
      if (error instanceof Deno.errors.NotFound) {
        const compilationError: CompilationError = {
          type: "file",
          message: `Configuration file not found: ${filePath}`,
          location: { file: filePath }
        };
        
        return {
          config: null,
          errors: [compilationError],
          success: false
        };
      } else if (error instanceof ConfigParseError) {
        // Update error locations with file information
        error.errors.forEach(err => {
          err.location = {
            ...err.location,
            file: filePath
          };
        });
        
        if (options.throwOnError) {
          throw error;
        }
        
        return {
          config: null,
          errors: error.errors,
          success: false
        };
      } else {
        // Handle other errors
        const compilationError: CompilationError = {
          type: "file",
          message: `Error reading configuration file: ${error instanceof Error ? error.message : String(error)}`,
          location: { file: filePath }
        };
        
        if (options.throwOnError) {
          throw new ConfigParseError("Configuration file reading failed", [compilationError]);
        }
        
        return {
          config: null,
          errors: [compilationError],
          success: false
        };
      }
    }
  }
  
  /**
   * Find the line and column number for a JSON path in a string
   * 
   * @param jsonString The JSON string
   * @param path The JSON path (e.g., "metadata.name")
   * @returns The line and column number, or undefined if not found
   */
  private findLineNumber(jsonString: string, path: string): ErrorLocation | undefined {
    // Split the path into parts
    const pathParts = path.split(".");
    
    // Start with the whole JSON string
    let currentJson = jsonString;
    let currentOffset = 0;
    
    // For each part of the path, find the corresponding location in the JSON string
    for (const part of pathParts) {
      // Handle array indices
      const isArrayIndex = /^\d+$/.test(part);
      
      // Create a pattern to find the part in the JSON string
      let pattern: string;
      if (isArrayIndex) {
        // For array indices, we need to find the nth item
        const index = parseInt(part, 10);
        pattern = `[`;
        
        // Skip to the correct array index
        let foundIndex = -1;
        let arrayStart = currentJson.indexOf(pattern);
        if (arrayStart !== -1) {
          let depth = 0;
          let pos = arrayStart + 1;
          
          while (pos < currentJson.length) {
            const char = currentJson[pos];
            
            if (char === "[") depth++;
            else if (char === "]") {
              if (depth === 0) break;
              depth--;
            } else if (char === "{" || char === "\"") {
              // Found an item
              foundIndex++;
              
              if (foundIndex === index) {
                // Found the correct index
                currentOffset += pos;
                currentJson = currentJson.substring(pos);
                break;
              }
              
              // Skip over the item
              if (char === "{") {
                // Skip over object
                let objDepth = 1;
                pos++;
                
                while (pos < currentJson.length && objDepth > 0) {
                  const objChar = currentJson[pos];
                  if (objChar === "{") objDepth++;
                  else if (objChar === "}") objDepth--;
                  pos++;
                }
              } else {
                // Skip over string
                pos++;
                while (pos < currentJson.length && currentJson[pos] !== "\"") {
                  if (currentJson[pos] === "\\") pos++; // Skip escape character
                  pos++;
                }
                pos++;
              }
              
              continue;
            }
            
            pos++;
          }
        }
        
        // If we couldn't find the array index, return undefined
        if (foundIndex !== index) {
          return undefined;
        }
      } else {
        // For object properties, find the key
        pattern = `"${part}"\\s*:`;
        
        const match = new RegExp(pattern).exec(currentJson);
        if (!match) {
          return undefined;
        }
        
        currentOffset += match.index + match[0].length;
        currentJson = currentJson.substring(match.index + match[0].length);
      }
    }
    
    // Calculate line and column number
    const upToOffset = jsonString.substring(0, currentOffset);
    const lines = upToOffset.split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    return { line, column };
  }
  
  /**
   * Find the line and column number for a JSON syntax error
   * 
   * @param jsonString The JSON string
   * @param error The syntax error
   * @returns The line and column number
   */
  private findJsonSyntaxErrorLine(jsonString: string, error: SyntaxError): ErrorLocation {
    // Extract position from error message if possible
    const positionMatch = /position\s+(\d+)/.exec(error.message);
    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      const upToPosition = jsonString.substring(0, position);
      const lines = upToPosition.split("\n");
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      
      return { line, column };
    }
    
    // If we couldn't extract the position, return line 1, column 1
    return { line: 1, column: 1 };
  }
  
  /**
   * Generate suggestions for fixing common configuration errors
   * 
   * @param error The compilation error
   * @returns An array of suggestions, or undefined if no suggestions are available
   */
  generateSuggestions(error: CompilationError): string[] | undefined {
    // If the error already has suggestions, return them
    if (error.suggestions && error.suggestions.length > 0) {
      return error.suggestions;
    }
    
    // Generate suggestions based on error type and message
    const suggestions: string[] = [];
    
    if (error.type === "validation") {
      if (error.message.includes("Missing required property")) {
        const propertyMatch = /Missing required property: (.+)/.exec(error.message);
        if (propertyMatch) {
          const property = propertyMatch[1];
          suggestions.push(`Add the missing "${property}" property`);
          
          // Add type-specific suggestions
          if (property === "name") {
            suggestions.push(`"name": "my-app"`);
          } else if (property === "version") {
            suggestions.push(`"version": "1.0.0"`);
          } else if (property === "metadata") {
            suggestions.push(`"metadata": { "name": "my-app", "version": "1.0.0" }`);
          } else if (property === "components") {
            suggestions.push(`"components": []`);
          } else if (property === "routes") {
            suggestions.push(`"routes": [{ "path": "/", "component": "HomePage" }]`);
          } else if (property === "api") {
            suggestions.push(`"api": { "endpoints": [] }`);
          }
        }
      } else if (error.message.includes("Additional property not allowed")) {
        const propertyMatch = /Additional property not allowed: (.+)/.exec(error.message);
        if (propertyMatch) {
          const property = propertyMatch[1];
          suggestions.push(`Remove the "${property}" property`);
          suggestions.push(`Check for typos in property name "${property}"`);
        }
      } else if (error.message.includes("Expected type")) {
        const typeMatch = /Expected type (.+), got (.+)/.exec(error.message);
        if (typeMatch) {
          const expectedType = typeMatch[1];
          const actualType = typeMatch[2];
          suggestions.push(`Change the value to be of type ${expectedType} instead of ${actualType}`);
          
          if (expectedType.includes("string")) {
            suggestions.push(`Wrap the value in double quotes: "value"`);
          } else if (expectedType.includes("array")) {
            suggestions.push(`Use square brackets: []`);
          } else if (expectedType.includes("object")) {
            suggestions.push(`Use curly braces: {}`);
          }
        }
      } else if (error.message.includes("String does not match pattern")) {
        suggestions.push("Check the format of the string value");
        
        if (error.location?.path?.includes("version")) {
          suggestions.push("Use semantic versioning format: e.g., 1.0.0");
        } else if (error.location?.path?.includes("name")) {
          suggestions.push("Use lowercase letters, numbers, and hyphens only");
        }
      }
    } else if (error.type === "file") {
      if (error.message.includes("not found")) {
        suggestions.push("Check that the file path is correct");
        suggestions.push("Create the configuration file if it doesn't exist");
      }
    }
    
    return suggestions.length > 0 ? suggestions : undefined;
  }
}

// Export a default instance
export const configParser = new ConfigParser();