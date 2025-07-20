import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export interface StatProps extends BaseComponentProps {
  title?: string;
  value: string | number;
  description?: string;
  figure?: ComponentChildren;
  actions?: ComponentChildren;
  // Controlled mode props
  onClick?: () => void;
  // Interactive features
  loading?: boolean;
  animated?: boolean;
  formatter?: "currency" | "number" | "percentage" | "none";
  currency?: string;
  locale?: string;
}

export interface StatsGroupProps extends BaseComponentProps {
  stats: StatProps[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
  loading?: boolean;
  showControls?: boolean;
  animated?: boolean;
}

export function Stat({
  class: className = "",
  title,
  value,
  description,
  figure,
  actions,
  onClick,
  loading = false,
  animated = false,
  formatter = "none",
  currency = "USD",
  locale = "en-US",
  id,
  ...props
}: StatProps) {
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

  const statClasses = [
    "stat",
    onClick ? "cursor-pointer hover:bg-base-200 transition-colors" : "",
    animated ? "transition-all duration-500" : "",
    loading ? "opacity-50" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class={statClasses} id={id} onClick={onClick} {...props}>
      {figure && (
        <div class="stat-figure text-secondary">
          {figure}
        </div>
      )}

      {title && <div class="stat-title">{title}</div>}

      <div class="stat-value">
        {loading ? (
          <div class="loading loading-spinner loading-sm"></div>
        ) : (
          formatValue(value)
        )}
      </div>

      {description && <div class="stat-desc">{description}</div>}

      {actions && (
        <div class="stat-actions">
          {actions}
        </div>
      )}
    </div>
  );
}

export function StatsGroup({
  class: className = "",
  stats,
  autoRefresh = false,
  refreshInterval = 5000,
  onRefresh,
  loading = false,
  showControls = false,
  animated = false,
  id,
  ...props
}: StatsGroupProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && onRefresh) {
      intervalRef.current = setInterval(() => {
        if (!isRefreshing) {
          setIsRefreshing(true);
          onRefresh();
          setTimeout(() => setIsRefreshing(false), 500);
        }
      }, refreshInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, onRefresh, isRefreshing]);

  const handleRefresh = () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <div class="card bg-base-100 shadow-md mb-4">
        <div class="card-body">
          <h3 class="card-title">Stats Controls</h3>
          <p class="text-base-content/70">
            These stats {autoRefresh ? `update automatically every ${refreshInterval / 1000} seconds` : "can be refreshed manually"}.
            {stats.some(stat => stat.onClick) && " Click on any stat to trigger its action."}
          </p>
          <div class="card-actions justify-center">
            <button
              class="btn btn-primary"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <span class="loading loading-spinner loading-sm"></span>
                  Refreshing...
                </>
              ) : (
                "Refresh Data"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const statsClasses = [
    "stats shadow w-full",
    animated || isRefreshing ? "transition-all duration-500" : "",
    isRefreshing ? "opacity-50 scale-95" : "opacity-100 scale-100",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class="space-y-6">
      {renderControls()}
      <div class={statsClasses} id={id} {...props}>
        {stats.map((stat, index) => (
          <Stat
            key={index}
            loading={loading || isRefreshing}
            animated={animated}
            {...stat}
          />
        ))}
      </div>
    </div>
  );
}
