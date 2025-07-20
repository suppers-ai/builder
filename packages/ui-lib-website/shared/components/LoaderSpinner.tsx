// No React import needed for simple components

// Pure CSS spinner component without external dependencies

interface LoaderSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoaderSpinner({
  size = "md",
  className = "",
  text,
}: LoaderSpinnerProps) {
  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "loading-sm";
      case "lg":
        return "loading-lg";
      default:
        return "loading-md";
    }
  };

  return (
    <div class={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <span class={`loading loading-spinner ${getSizeClass(size)}`}></span>
      {text && <p class="text-sm text-base-content/70">{text}</p>}
    </div>
  );
}

export default LoaderSpinner;
