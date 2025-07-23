import { useEffect, useState } from "preact/hooks";
import { Button } from "@suppers/ui-lib";
import SyntaxHighlighter, { CodeFile } from "./SyntaxHighlighter.tsx";

export interface CodeExampleProps {
  code?: string;
  files?: CodeFile[];
  language?: 'tsx' | 'json' | 'javascript' | 'typescript' | 'css' | 'html' | 'jsx' | 'ts';
  title?: string;
  showCopy?: boolean;
  maxHeight?: string;
}

export default function CodeExample({
  code,
  files,
  language = 'tsx',
  title,
  showCopy = true,
  maxHeight = '400px',
}: CodeExampleProps) {
  // If files are provided, use the new SyntaxHighlighter component
  if (files && files.length > 0) {
    return (
      <SyntaxHighlighter
        files={files}
        title={title}
        showCopy={showCopy}
        maxHeight={maxHeight}
      />
    );
  }

  // If no code is provided, show error
  if (!code) {
    return (
      <div class="alert alert-error">
        <span>No code or files provided</span>
      </div>
    );
  }

  // Backward compatibility: convert single code to files format
  const singleFile: CodeFile = {
    filename: `example.${language}`,
    content: code,
    language: language as any,
  };

  return (
    <SyntaxHighlighter
      files={[singleFile]}
      title={title}
      showCopy={showCopy}
      maxHeight={maxHeight}
    />
  );
}