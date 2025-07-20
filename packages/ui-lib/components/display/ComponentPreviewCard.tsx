import { ExternalLink } from "lucide-preact";

export interface ComponentPreviewCardProps {
  name: string;
  description: string;
  path: string;
  category: string;
  preview: any;
  color?: string;
}

export function ComponentPreviewCard({
  name,
  description,
  path,
  category,
  preview,
  color = "primary",
}: ComponentPreviewCardProps) {
  return (
    <div class="card bg-base-100 border border-base-300 shadow-lg card-micro group">
      {/* Preview Area */}
      <div class="relative bg-gradient-to-br from-base-200/50 to-base-300/30 p-6 min-h-[200px] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div class="absolute inset-0 opacity-5">
          <div
            class="absolute inset-0"
            style={{
              backgroundImage:
                `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          >
          </div>
        </div>

        {/* Component Preview */}
        <div class="relative z-10 scale-75 group-hover:scale-90 transition-transform duration-300">
          {preview}
        </div>

        {/* Category Badge */}
        <div class="absolute top-4 left-4">
          <div class={`badge badge-${color} badge-sm font-medium`}>
            {category}
          </div>
        </div>
      </div>

      {/* Content */}
      <div class="card-body p-6">
        <h3 class="card-title text-lg font-semibold group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p class="text-sm text-base-content/70 line-clamp-2">
          {description}
        </p>

        <div class="card-actions justify-between items-center mt-4">
          <a
            href={path}
            class="btn btn-sm btn-primary btn-micro group-hover:btn-secondary"
          >
            View Details
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
