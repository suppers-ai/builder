import { useEffect, useState } from "preact/hooks";
import { Button } from "@suppers/ui-lib";
import ToastNotification from "./ToastNotification.tsx";
import { copyToClipboard, getClipboardErrorMessage } from "@suppers/shared/utils/clipboard.ts";

export interface CodeFile {
  filename: string;
  content: string;
  language: "tsx" | "ts" | "json" | "javascript" | "typescript" | "css" | "html" | "jsx";
}

interface SyntaxPattern {
  pattern: RegExp;
  className: string;
}

export interface SyntaxHighlighterProps {
  files: CodeFile[];
  title?: string;
  showCopy?: boolean;
  maxHeight?: string;
  defaultFile?: number;
}

// Simple, non-overlapping syntax highlighting patterns
const syntaxPatterns: Record<string, SyntaxPattern[]> = {
  tsx: [
    // Comments
    { pattern: /(\/\*[\s\S]*?\*\/|\/\/.*$)/gm, className: "text-base-content/50 italic" },

    // String literals first to avoid conflicts
    { pattern: /&quot;[^&]*&quot;/g, className: "text-accent" },

    // Complete JSX opening/closing tags for React components (capitalized)
    { pattern: /&lt;\/?[A-Z][a-zA-Z0-9]*[^&]*?&gt;/g, className: "text-info font-semibold" },

    // Complete JSX opening/closing tags for HTML elements (lowercase)
    { pattern: /&lt;\/?[a-z][a-zA-Z0-9-]*[^&]*?&gt;/g, className: "text-secondary" },

    // JavaScript keywords (excluding "class" to avoid HTML class attribute conflicts)
    {
      pattern:
        /\b(import|export|from|as|default|const|let|var|function|interface|type|enum|namespace|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|async|await)\b/g,
      className: "text-primary font-semibold",
    },
  ],
  ts: [
    { pattern: /(\/\*[\s\S]*?\*\/|\/\/.*$)/gm, className: "text-base-content/60" }, // Comments
    {
      pattern:
        /\b(import|export|from|as|default|const|let|var|function|class|interface|type|enum|namespace)\b/g,
      className: "text-primary font-semibold",
    }, // Keywords
    {
      pattern: /\b(string|number|boolean|object|undefined|null|void|any|unknown|never)\b/g,
      className: "text-secondary font-semibold",
    }, // Types
    { pattern: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g, className: "text-accent" }, // Strings
    { pattern: /\b\d+(\.\d+)?\b/g, className: "text-info" }, // Numbers
  ],
  json: [
    { pattern: /"([^"\\]|\\.)*"/g, className: "text-accent" }, // Strings
    { pattern: /\b(true|false|null)\b/g, className: "text-secondary font-semibold" }, // Literals
    { pattern: /\b\d+(\.\d+)?\b/g, className: "text-info" }, // Numbers
  ],
  css: [
    { pattern: /(\/\*[\s\S]*?\*\/)/gm, className: "text-base-content/60" }, // Comments
    { pattern: /([a-zA-Z-]+)(?=\s*:)/g, className: "text-primary" }, // Properties
    { pattern: /:([^;]+);/g, className: "text-accent" }, // Values
    { pattern: /([.#][a-zA-Z-_][a-zA-Z0-9-_]*)/g, className: "text-secondary" }, // Selectors
  ],
  html: [
    { pattern: /(<!--[\s\S]*?-->)/gm, className: "text-base-content/60" }, // Comments
    { pattern: /(<\/?[a-zA-Z][^>]*>)/g, className: "text-secondary" }, // Tags
    { pattern: /([a-zA-Z-]+)(?==)/g, className: "text-primary" }, // Attributes
    { pattern: /"([^"\\]|\\.)*"/g, className: "text-accent" }, // Attribute values
  ],
};

function highlightCode(code: string, language: string): string {
  if (language !== "tsx" && language !== "jsx") {
    // For non-JSX languages, use simple escaping
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // First escape HTML entities
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // Simple JSX-specific highlighting - process tags before strings to avoid conflicts
  let highlighted = escaped;

  // 1. Highlight React Component tags first (capitalized)
  highlighted = highlighted.replace(/&lt;\/?[A-Z][a-zA-Z0-9]*(?:\s[^<>]*?)?&gt;/g, (match) => {
    return `<span class="text-info font-semibold">${match}</span>`;
  });

  // 2. Highlight HTML element tags (lowercase)
  highlighted = highlighted.replace(/&lt;\/?[a-z][a-zA-Z0-9-]*(?:\s[^<>]*?)?&gt;/g, (match) => {
    return `<span class="text-secondary">${match}</span>`;
  });

  // 3. Highlight strings last (after tags to avoid interfering with tag matching)
  highlighted = highlighted.replace(
    /&quot;([^&]*)&quot;/g,
    '<span class="text-accent">&quot;$1&quot;</span>',
  );

  return highlighted;
}

export default function SyntaxHighlighter({
  files,
  title,
  showCopy = true,
  maxHeight = "400px",
  defaultFile = 0,
}: SyntaxHighlighterProps) {
  const [mounted, setMounted] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(defaultFile);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeFile = files[activeFileIndex];

  // Add keyboard shortcut for copying
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl+C (Windows/Linux) or Cmd+C (Mac) is pressed
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        // Only handle if the focus is within our component
        const target = event.target as Element;
        if (target && target.closest(".syntax-highlighter-container")) {
          event.preventDefault();
          handleCopy();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeFile]);

  const handleCopy = async () => {
    if (!activeFile) return;

    const result = await copyToClipboard(activeFile.content);

    if (result.success) {
      setCopied(true);
      setCopyError(false);
      setToastMessage(`${activeFile.filename} copied to clipboard!`);
      setToastType("success");
      setShowToast(true);
    } else {
      setCopyError(true);
      setCopied(false);
      setToastMessage(getClipboardErrorMessage(result.error));
      setToastType("error");
      setShowToast(true);
    }

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
      setCopyError(false);
    }, 2000);
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "tsx":
        return "TSX";
      case "jsx":
        return "JSX";
      case "typescript":
        return "TypeScript";
      case "javascript":
        return "JavaScript";
      case "json":
        return "JSON";
      case "css":
        return "CSS";
      case "html":
        return "HTML";
      case "ts":
        return "TS";
      default:
        return lang.toUpperCase();
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div class="mockup-code">
        <div class="px-4 py-2">
          <div class="h-4 bg-base-300 rounded animate-pulse mb-2"></div>
          <div class="h-4 bg-base-300 rounded animate-pulse mb-2 w-3/4"></div>
          <div class="h-4 bg-base-300 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!activeFile) {
    return (
      <div class="alert alert-error">
        <span>No code files provided</span>
      </div>
    );
  }

  return (
    <>
      <div
        class="relative border border-base-300 rounded-lg overflow-hidden syntax-highlighter-container"
        tabIndex={0}
      >
        {/* Header with title and copy button */}
        {(title || showCopy || files.length > 1) && (
          <div class="flex items-center justify-between bg-base-200 px-4 py-2 border-b border-base-300">
            <div class="flex items-center gap-2">
              {title && <h4 class="text-sm font-semibold">{title}</h4>}
              <span class="badge badge-outline badge-sm">
                {getLanguageLabel(activeFile.language)}
              </span>
            </div>
            {showCopy && (
              <div class="flex items-center gap-2">
                <span class="text-xs text-base-content/60 hidden sm:inline">
                  Ctrl+C
                </span>
                <Button
                  size="sm"
                  variant={copied ? "ghost" : "outline"}
                  color={copied ? "success" : copyError ? "error" : undefined}
                  onClick={handleCopy}
                  class="gap-1"
                  type="button"
                  active={false}
                  loading={false}
                  disabled={false}
                  wide={false}
                  square={false}
                  glass={false}
                  noAnimation={false}
                  circle={false}
                >
                  {copied
                    ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Copied!
                      </>
                    )
                    : copyError
                    ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Failed
                      </>
                    )
                    : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </>
                    )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* File tabs */}
        {files.length > 1 && (
          <div class="flex bg-base-100 border-b border-base-300 overflow-x-auto">
            {files.map((file, index) => (
              <Button
                key={index}
                class={`px-4 py-2 text-sm font-medium border-r border-base-300 hover:bg-base-200 transition-colors whitespace-nowrap bg-transparent border-none rounded-none ${
                  index === activeFileIndex
                    ? "bg-base-200 text-primary border-b-2 border-primary"
                    : "text-base-content/70"
                }`}
                variant="ghost"
                onClick={() => setActiveFileIndex(index)}
              >
                {file.filename}
              </Button>
            ))}
          </div>
        )}

        {/* Code content */}
        <div
          class="bg-base-100 overflow-auto"
          style={{ maxHeight: maxHeight }}
        >
          <pre class="p-4 text-sm leading-relaxed">
            <code
              class={`language-${activeFile.language}`}
              dangerouslySetInnerHTML={{
                __html: highlightCode(activeFile.content, activeFile.language)
              }}
            />
          </pre>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <ToastNotification
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
