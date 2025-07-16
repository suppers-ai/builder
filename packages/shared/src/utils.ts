// Shared utility functions for the JSON App Compiler system

import { LogLevel } from './enums.ts';
import type { TemplateVariable } from './types.ts';

// File system utilities for cross-platform operations
export class FileSystemUtils {
  // Normalize path separators for cross-platform compatibility
  static normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
  }

  // Join path segments safely
  static joinPath(...segments: string[]): string {
    const joined = segments
      .filter(segment => segment && segment.length > 0)
      .join('/')
      .replace(/\/+/g, '/');
    
    return this.normalizePath(joined);
  }

  // Get file extension
  static getExtension(filePath: string): string {
    const lastDot = filePath.lastIndexOf('.');
    return lastDot === -1 ? '' : filePath.substring(lastDot + 1);
  }

  // Get filename without extension
  static getBasename(filePath: string, includeExtension = true): string {
    const normalized = this.normalizePath(filePath);
    const lastSlash = normalized.lastIndexOf('/');
    const filename = lastSlash === -1 ? normalized : normalized.substring(lastSlash + 1);
    
    if (!includeExtension) {
      const lastDot = filename.lastIndexOf('.');
      return lastDot === -1 ? filename : filename.substring(0, lastDot);
    }
    
    return filename;
  }

  // Get directory path
  static getDirname(filePath: string): string {
    const normalized = this.normalizePath(filePath);
    const lastSlash = normalized.lastIndexOf('/');
    return lastSlash === -1 ? '.' : normalized.substring(0, lastSlash);
  }

  // Check if path is absolute
  static isAbsolute(path: string): boolean {
    const normalized = this.normalizePath(path);
    return normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized);
  }

  // Resolve relative path
  static resolve(basePath: string, relativePath: string): string {
    if (this.isAbsolute(relativePath)) {
      return this.normalizePath(relativePath);
    }
    
    return this.normalizePath(this.joinPath(basePath, relativePath));
  }
}

// String manipulation helpers for template processing
export class StringUtils {
  // Replace template variables in string
  static replaceTemplateVariables(template: string, variables: TemplateVariable[]): string {
    let result = template;
    
    for (const variable of variables) {
      const placeholder = `{{${variable.name}}}`;
      const value = this.formatValue(variable.value, variable.type);
      // Use simple string replacement to avoid regex escaping issues
      while (result.includes(placeholder)) {
        result = result.replace(placeholder, value);
      }
    }
    
    return result;
  }

  // Format value based on type
  private static formatValue(value: unknown, type?: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value).toString();
      case 'boolean':
        return Boolean(value).toString();
      case 'object':
      case 'array':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  // Convert string to camelCase
  static toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  // Convert string to PascalCase
  static toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  // Convert string to kebab-case
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  // Convert string to snake_case
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  // Capitalize first letter
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Truncate string with ellipsis
  static truncate(str: string, maxLength: number, suffix = '...'): string {
    if (str.length <= maxLength) {
      return str;
    }
    
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  // Escape special characters for regex
  static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Generate random string
  static randomString(length: number, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  // Check if string is valid identifier
  static isValidIdentifier(str: string): boolean {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
  }

  // Pluralize word (simple English rules)
  static pluralize(word: string): string {
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    } else if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
      return word + 'es';
    } else {
      return word + 's';
    }
  }

  // Singularize word (simple English rules)
  static singularize(word: string): string {
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    } else if (word.endsWith('es')) {
      return word.slice(0, -2);
    } else if (word.endsWith('s') && !word.endsWith('ss')) {
      return word.slice(0, -1);
    } else {
      return word;
    }
  }
}

// Logging utilities with different verbosity levels
export class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(level: LogLevel = LogLevel.INFO, prefix = '') {
    this.level = level;
    this.prefix = prefix;
  }

  // Set log level
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  // Set prefix for all log messages
  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  // Debug logging
  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      this.logInternal('DEBUG', message, ...args);
    }
  }

  // Info logging
  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      this.logInternal('INFO', message, ...args);
    }
  }

  // Warning logging
  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      this.logInternal('WARN', message, ...args);
    }
  }

  // Error logging
  error(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      this.logInternal('ERROR', message, ...args);
    }
  }

  // Generic log method
  private logInternal(level: string, message: string, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    const prefixStr = this.prefix ? `[${this.prefix}] ` : '';
    const logMessage = `${timestamp} [${level}] ${prefixStr}${message}`;
    
    if (args.length > 0) {
      console.log(logMessage, ...args);
    } else {
      console.log(logMessage);
    }
  }

  // Log with custom level
  log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (this.level <= level) {
      const levelName = LogLevel[level];
      this.logInternal(levelName, message, ...args);
    }
  }

  // Create child logger with additional prefix
  child(childPrefix: string): Logger {
    const newPrefix = this.prefix ? `${this.prefix}:${childPrefix}` : childPrefix;
    return new Logger(this.level, newPrefix);
  }
}

// Array utilities
export class ArrayUtils {
  // Remove duplicates from array
  static unique<T>(array: T[]): T[] {
    return array.filter((item, index) => array.indexOf(item) === index);
  }

  // Group array items by key
  static groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
    const result = {} as Record<K, T[]>;
    
    for (const item of array) {
      const key = keyFn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    }
    
    return result;
  }

  // Chunk array into smaller arrays
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Flatten nested arrays
  static flatten<T>(array: (T | T[])[]): T[] {
    const result: T[] = [];
    for (const item of array) {
      if (Array.isArray(item)) {
        result.push(...this.flatten(item));
      } else {
        result.push(item);
      }
    }
    return result;
  }

  // Find intersection of arrays
  static intersection<T>(...arrays: T[][]): T[] {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0];
    
    return arrays.reduce((acc, current) => 
      acc.filter(item => current.indexOf(item) !== -1)
    );
  }

  // Find difference between arrays
  static difference<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(item => array2.indexOf(item) === -1);
  }
}

// Object utilities
export class ObjectUtils {
  // Deep clone object
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }
    
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    
    return cloned;
  }

  // Deep merge objects
  static deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Array<Record<string, unknown>>): T {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    
    return this.deepMerge(target, ...sources);
  }

  // Check if value is object
  private static isObject(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
  }

  // Get nested property value
  static get(obj: Record<string, unknown>, path: string, defaultValue?: unknown): unknown {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key] as Record<string, unknown>;
    }
    
    return current === undefined ? defaultValue : current;
  }

  // Set nested property value
  static set(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    
    current[keys[keys.length - 1]] = value;
  }

  // Check if object has nested property
  static has(obj: Record<string, unknown>, path: string): boolean {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object' || !(key in current)) {
        return false;
      }
      current = current[key] as Record<string, unknown>;
    }
    
    return true;
  }

  // Pick specific properties from object
  static pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  // Omit specific properties from object
  static omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }
}

// Create default logger instance
export const logger = new Logger();

// Export utility classes as default instances for convenience
export const fs = FileSystemUtils;
export const str = StringUtils;
export const arr = ArrayUtils;
export const obj = ObjectUtils;