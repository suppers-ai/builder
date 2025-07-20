import { BaseComponentProps, SizeProps } from "../../types.ts";

export interface DiffProps extends BaseComponentProps, SizeProps {
  oldContent: string;
  newContent: string;
  oldLabel?: string;
  newLabel?: string;
  showLabels?: boolean;
  type?: "unified" | "split";
  // Controlled mode props
  editMode?: boolean;
  onContentChange?: (oldContent: string, newContent: string) => void;
  onEditModeToggle?: () => void;
  onReset?: () => void;
}

export function Diff({
  class: className = "",
  oldContent,
  newContent,
  oldLabel = "Before",
  newLabel = "After",
  showLabels = true,
  type = "unified",
  size = "md",
  editMode = false,
  onContentChange,
  onEditModeToggle,
  onReset,
  id,
  ...props
}: DiffProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const diffClasses = [
    "diff",
    sizeClasses[size],
    className,
  ].filter(Boolean).join(" ");

  const handleContentChange = (old: string, new_: string) => {
    onContentChange?.(old, new_);
  };

  if (editMode) {
    return (
      <div class={`card bg-base-100 shadow-lg ${className}`} id={id} {...props}>
        <div class="card-body">
          <div class="flex justify-between items-center mb-4">
            <h3 class="card-title">Edit Content</h3>
            <div class="flex gap-2">
              <button
                class="btn btn-primary btn-sm"
                onClick={onEditModeToggle}
              >
                Preview Diff
              </button>
              <button
                class="btn btn-outline btn-sm"
                onClick={onReset}
              >
                Reset
              </button>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">{oldLabel}</span>
              </label>
              <textarea
                class="textarea textarea-bordered h-48 font-mono text-sm"
                value={oldContent}
                onChange={(e) =>
                  handleContentChange((e.target as HTMLTextAreaElement).value, newContent)}
                placeholder="Enter old content..."
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">{newLabel}</span>
              </label>
              <textarea
                class="textarea textarea-bordered h-48 font-mono text-sm"
                value={newContent}
                onChange={(e) =>
                  handleContentChange(oldContent, (e.target as HTMLTextAreaElement).value)}
                placeholder="Enter new content..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "split") {
    return (
      <div class={`${diffClasses} relative`} id={id} {...props}>
        {onEditModeToggle && (
          <button
            class="btn btn-ghost btn-sm absolute top-2 right-2 z-10"
            onClick={onEditModeToggle}
          >
            ✏️ Edit
          </button>
        )}

        <div class="diff-item-1">
          {showLabels && (
            <div class="diff-resizer font-semibold p-2 bg-red-50 text-red-700 border-b border-red-200">
              {oldLabel}
            </div>
          )}
          <pre class="diff-resizer bg-red-50 text-red-900 p-4 whitespace-pre-wrap overflow-auto max-h-96">
            {oldContent}
          </pre>
        </div>
        <div class="diff-item-2">
          {showLabels && (
            <div class="diff-resizer font-semibold p-2 bg-green-50 text-green-700 border-b border-green-200">
              {newLabel}
            </div>
          )}
          <pre class="diff-resizer bg-green-50 text-green-900 p-4 whitespace-pre-wrap overflow-auto max-h-96">
            {newContent}
          </pre>
        </div>
      </div>
    );
  }

  // Unified diff view (default)
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");

  return (
    <div class={`${diffClasses} mockup-code bg-base-200 relative`} id={id} {...props}>
      {onEditModeToggle && (
        <button
          class="btn btn-ghost btn-sm absolute top-2 right-2 z-10"
          onClick={onEditModeToggle}
        >
          ✏️ Edit
        </button>
      )}

      {showLabels && (
        <div class="flex">
          <div class="flex-1 text-center p-2 bg-red-100 text-red-700 font-semibold border-b">
            {oldLabel}
          </div>
          <div class="flex-1 text-center p-2 bg-green-100 text-green-700 font-semibold border-b">
            {newLabel}
          </div>
        </div>
      )}

      <div class="space-y-1 p-4">
        {/* Show removed lines */}
        {oldLines.map((line: string, index: number) => (
          <pre
            key={`old-${index}`}
            class="bg-red-50 text-red-900 px-2 py-1 rounded border-l-4 border-red-400"
          >
            <span class="text-red-600 mr-2">-</span>{line}
          </pre>
        ))}

        {/* Show added lines */}
        {newLines.map((line: string, index: number) => (
          <pre
            key={`new-${index}`}
            class="bg-green-50 text-green-900 px-2 py-1 rounded border-l-4 border-green-400"
          >
            <span class="text-green-600 mr-2">+</span>{line}
          </pre>
        ))}
      </div>
    </div>
  );
}
