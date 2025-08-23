import { ComponentChildren } from "preact";
import { BaseComponentProps, ColorProps } from "../../types.ts";
import { Skeleton } from "../../feedback/skeleton/Skeleton.tsx";

export interface MetricCardProps extends BaseComponentProps, ColorProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ComponentChildren;
  loading?: boolean;
  formatter?: "currency" | "number" | "percentage" | "none";
  currency?: string;
  locale?: string;
  onClick?: () => void;
}

export function MetricCard({
  class: className = "",
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  loading = false,
  formatter = "none",
  currency = "USD",
  locale = "en-US",
  onClick,
  id,
  ...props
}: MetricCardProps) {
  // Value formatting
  const formatValue = (val: string | number) => {
    if (formatter === "none") return val;

    const numValue = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(numValue)) return val;

    switch (formatter) {
      case "currency":
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 0,
        }).format(numValue);
      case "number":
        return new Intl.NumberFormat(locale).format(numValue);
      case "percentage":
        return `${numValue}%`;
      default:
        return val;
    }
  };

  const cardClasses = [
    "card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow",
    onClick ? "cursor-pointer hover:shadow-lg" : "",
    className,
  ].filter(Boolean).join(" ");

  if (loading) {
    return (
      <div class={cardClasses} id={id} {...props}>
        <div class="card-body p-4 sm:p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-6 sm:h-8 w-16" />
              <Skeleton class="h-3 w-24" />
            </div>
            {icon && <Skeleton class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class={cardClasses} id={id} onClick={onClick} {...props}>
      <div class="card-body p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-sm font-medium text-base-content/70 mb-1">
              {title}
            </h3>
            <p class="text-xl sm:text-2xl font-bold text-base-content mb-1">
              {formatValue(value)}
            </p>
            {subtitle && (
              <p class="text-xs text-base-content/50">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div
              class={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-${color}/10 text-${color}`}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
