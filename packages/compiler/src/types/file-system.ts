// Template types
export type TemplateType = "fresh-basic";

// File operation types for Deno
export interface FileOperation {
  path: string;
  content: string | Uint8Array;
}

export interface DirectoryCopyOptions {
  source: string;
  destination: string;
  exclude?: string[];
}
