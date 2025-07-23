/**
 * Clipboard utility functions with fallback support
 */

export interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  try {
    // Try using the modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } else {
      // Fallback for older browsers or non-secure contexts
      return fallbackCopyToClipboard(text);
    }
  } catch (error) {
    console.error("Clipboard API failed:", error);
    // Try fallback method
    return fallbackCopyToClipboard(text);
  }
}

/**
 * Fallback copy method using document.execCommand
 */
function fallbackCopyToClipboard(text: string): ClipboardResult {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make the textarea invisible but still focusable
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    textArea.setAttribute("readonly", "");

    document.body.appendChild(textArea);

    // Focus and select the text
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    // Try to copy
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true };
    } else {
      return {
        success: false,
        error: "Copy command failed. Please copy manually.",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Copy failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Check if clipboard API is available
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && window.isSecureContext) ||
    document.queryCommandSupported?.("copy") === true;
}

/**
 * Get user-friendly error message for clipboard failures
 */
export function getClipboardErrorMessage(error?: string): string {
  if (!error) {
    return "Failed to copy to clipboard";
  }

  if (error.includes("not allowed")) {
    return "Clipboard access not allowed. Please copy manually.";
  }

  if (error.includes("not supported")) {
    return "Clipboard not supported in this browser. Please copy manually.";
  }

  return error;
}
