import { BaseComponentProps, SizeProps } from "../../types.ts";

export interface RatingProps extends BaseComponentProps, SizeProps {
  value?: number;
  max?: number;
  readonly?: boolean;
  half?: boolean;
  mask?: "star" | "star-2" | "heart";
  // Controlled mode props
  hoverValue?: number;
  onChange?: (value: number) => void;
  onHover?: (value: number) => void;
  onMouseLeave?: () => void;
}

export function Rating({
  class: className = "",
  size = "md",
  value = 0,
  max = 5,
  readonly = false,
  half = false,
  mask = "star",
  hoverValue,
  onChange,
  onHover,
  onMouseLeave,
  id,
  ...props
}: RatingProps) {
  const ratingClasses = [
    "rating",
    size === "xs" ? "rating-xs" : "",
    size === "sm" ? "rating-sm" : "",
    size === "lg" ? "rating-lg" : "",
    half ? "rating-half" : "",
    className,
  ].filter(Boolean).join(" ");

  const maskClass = mask === "star-2"
    ? "mask-star-2"
    : mask === "heart"
    ? "mask-heart"
    : "mask-star";

  // Use controlled mode if handlers are provided
  const isControlled = !!(onChange || onHover);
  const currentValue = hoverValue !== undefined ? hoverValue : value;

  const handleClick = (newValue: number) => {
    if (!readonly && onChange) {
      onChange(newValue);
    }
  };

  const handleMouseEnter = (newValue: number) => {
    if (!readonly && onHover) {
      onHover(newValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly && onMouseLeave) {
      onMouseLeave();
    }
  };

  const renderStars = () => {
    const stars = [];

    // Add hidden radio for 0 rating
    stars.push(
      <input
        key="empty"
        type="radio"
        name={`rating-${id || "default"}`}
        class="rating-hidden"
        checked={currentValue === 0}
        readOnly={readonly}
        onChange={isControlled && !readonly ? () => handleClick(0) : undefined}
      />,
    );

    for (let i = 1; i <= max; i++) {
      if (half) {
        // Half star implementation
        const halfValue = i - 0.5;
        stars.push(
          <input
            key={`${i}-half`}
            type="radio"
            name={`rating-${id || "default"}`}
            class={`bg-orange-400 mask ${maskClass}`}
            checked={currentValue === halfValue}
            readOnly={readonly}
            onChange={isControlled && !readonly ? () => handleClick(halfValue) : undefined}
            onMouseEnter={isControlled && !readonly ? () => handleMouseEnter(halfValue) : undefined}
            onMouseLeave={isControlled && !readonly ? handleMouseLeave : undefined}
          />,
        );
      }

      stars.push(
        <input
          key={i}
          type="radio"
          name={`rating-${id || "default"}`}
          class={`bg-orange-400 mask ${maskClass}`}
          checked={currentValue === i}
          readOnly={readonly}
          onChange={isControlled && !readonly ? () => handleClick(i) : undefined}
          onMouseEnter={isControlled && !readonly ? () => handleMouseEnter(i) : undefined}
          onMouseLeave={isControlled && !readonly ? handleMouseLeave : undefined}
        />,
      );
    }

    return stars;
  };

  return (
    <div class={ratingClasses} id={id} {...props}>
      {renderStars()}
    </div>
  );
}
