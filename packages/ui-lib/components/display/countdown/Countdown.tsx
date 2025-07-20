import { BaseComponentProps } from "../../types.ts";

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export interface CountdownProps extends BaseComponentProps {
  targetDate?: string | Date;
  showLabels?: boolean;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  // Controlled mode props
  timeLeft?: TimeLeft;
  onComplete?: () => void;
  onTick?: (timeLeft: TimeLeft) => void;
}

export function Countdown({
  class: className = "",
  targetDate,
  showLabels = true,
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  size = "md",
  timeLeft,
  id,
  ...props
}: CountdownProps) {
  // Use controlled mode if timeLeft is provided, otherwise calculate from targetDate
  let currentTimeLeft: TimeLeft;

  if (timeLeft) {
    // Controlled mode - use provided timeLeft
    currentTimeLeft = timeLeft;
  } else if (targetDate) {
    // Uncontrolled mode - calculate from targetDate
    const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
    const now = new Date();
    const timeDiff = Math.max(0, target.getTime() - now.getTime());

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    const totalSeconds = Math.floor(timeDiff / 1000);

    currentTimeLeft = { days, hours, minutes, seconds, totalSeconds };
  } else {
    // Fallback - all zeros
    currentTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const fontSizeClasses = {
    xs: "font-mono text-xs",
    sm: "font-mono text-sm",
    md: "font-mono text-2xl",
    lg: "font-mono text-4xl",
    xl: "font-mono text-6xl",
  };

  return (
    <div class={`flex gap-2 ${className}`} id={id} {...props}>
      {showDays && (
        <div class="flex flex-col items-center">
          <span class={`${fontSizeClasses[size]} font-bold`}>
            {currentTimeLeft.days.toString().padStart(2, "0")}
          </span>
          {showLabels && <span class={`${textSizeClasses[size]} text-base-content/70`}>days</span>}
        </div>
      )}

      {showDays && (showHours || showMinutes || showSeconds) && (
        <span class={`${fontSizeClasses[size]} font-bold text-base-content/50`}>:</span>
      )}

      {showHours && (
        <div class="flex flex-col items-center">
          <span class={`${fontSizeClasses[size]} font-bold`}>
            {currentTimeLeft.hours.toString().padStart(2, "0")}
          </span>
          {showLabels && <span class={`${textSizeClasses[size]} text-base-content/70`}>hours</span>}
        </div>
      )}

      {showHours && (showMinutes || showSeconds) && (
        <span class={`${fontSizeClasses[size]} font-bold text-base-content/50`}>:</span>
      )}

      {showMinutes && (
        <div class="flex flex-col items-center">
          <span class={`${fontSizeClasses[size]} font-bold`}>
            {currentTimeLeft.minutes.toString().padStart(2, "0")}
          </span>
          {showLabels && (
            <span class={`${textSizeClasses[size]} text-base-content/70`}>minutes</span>
          )}
        </div>
      )}

      {showMinutes && showSeconds && (
        <span class={`${fontSizeClasses[size]} font-bold text-base-content/50`}>:</span>
      )}

      {showSeconds && (
        <div class="flex flex-col items-center">
          <span class={`${fontSizeClasses[size]} font-bold`}>
            {currentTimeLeft.seconds.toString().padStart(2, "0")}
          </span>
          {showLabels && (
            <span class={`${textSizeClasses[size]} text-base-content/70`}>seconds</span>
          )}
        </div>
      )}
    </div>
  );
}
