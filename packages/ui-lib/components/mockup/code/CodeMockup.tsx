import { BaseComponentProps } from "../../types.ts";

export interface CodeMockupProps extends BaseComponentProps {
  /** Code content to display */
  code?: string;
  /** Programming language for syntax highlighting */
  language?: "javascript" | "typescript" | "python" | "html" | "css" | "json" | "bash" | "sql";
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Code mockup variant */
  variant?: "default" | "dark" | "terminal";
  /** File name/title */
  filename?: string;
  /** Click handler for the mockup */
  onMockupClick?: () => void;
  /** Copy to clipboard handler */
  onCopy?: (code: string) => void;
}

export function CodeMockup({
  code = "console.log('Hello World!');",
  language = "javascript",
  showLineNumbers = false,
  variant = "default",
  filename,
  class: className,
  ...props
}: CodeMockupProps) {
  // Build mockup classes
  const mockupClasses = [
    "mockup-code",
    variant === "dark" && "bg-neutral text-neutral-content",
    variant === "terminal" && "bg-black text-green-400",
    className,
  ].filter(Boolean).join(" ");

  // Split code into lines for display
  const codeLines = code.split("\n");

  return (
    <div className={mockupClasses} {...props}>
      {filename && (
        <div className="px-4 py-2 bg-base-300 border-b text-sm font-medium">
          {filename}
        </div>
      )}
      <div className="p-4">
        {codeLines.map((line, index) => (
          <pre
            key={index}
            className="text-sm"
            data-prefix={showLineNumbers
              ? (index + 1).toString()
              : variant === "terminal"
              ? "$"
              : ""}
          >
            <code>{line}</code>
          </pre>
        ))}
      </div>
    </div>
  );
}
