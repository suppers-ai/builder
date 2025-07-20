import { useEffect, useState } from "preact/hooks";
import { Button } from "@suppers/ui-lib";

export interface CodeExampleProps {
  code: string;
  language?: 'tsx' | 'json' | 'javascript' | 'typescript' | 'css' | 'html';
  title?: string;
  showCopy?: boolean;
  maxHeight?: string;
}

export default function CodeExample({
  code,
  language = 'tsx',
  title,
  showCopy = true,
  maxHeight = '400px',
}: CodeExampleProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    try {
      // Try using the modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setCopyError(false);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setCopyError(false);
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (error) {
      console.error('Failed to copy code:', error);
      setCopyError(true);
      setCopied(false);
    }

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
      setCopyError(false);
    }, 2000);
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

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'tsx': return 'TSX';
      case 'jsx': return 'JSX';
      case 'typescript': return 'TypeScript';
      case 'javascript': return 'JavaScript';
      case 'json': return 'JSON';
      case 'css': return 'CSS';
      case 'html': return 'HTML';
      default: return lang.toUpperCase();
    }
  };

  return (
    <div class="relative">
      {/* Header with title and copy button */}
      {(title || showCopy) && (
        <div class="flex items-center justify-between bg-base-200 px-4 py-2 rounded-t-lg border-b border-base-300">
          <div class="flex items-center gap-2">
            {title && (
              <h4 class="text-sm font-semibold">{title}</h4>
            )}
            <span class="badge badge-outline badge-sm">
              {getLanguageLabel(language)}
            </span>
          </div>
          {showCopy && (
            <Button
              size="sm"
              variant={copied ? "ghost" : "outline"}
              color={copied ? "success" : copyError ? "error" : undefined}
              onClick={handleCopy}
              class="gap-1"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : copyError ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Failed
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Code content */}
      <div 
        class="mockup-code overflow-auto"
        style={{ maxHeight: maxHeight }}
      >
        <pre class="px-4 py-2">
          <code class={`language-${language} text-sm`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}