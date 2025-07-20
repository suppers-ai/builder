import { ComponentMetadata } from "../../types.ts";
import { Rating } from "./Rating.tsx";

export const ratingMetadata: ComponentMetadata = {
  name: "Rating",
  description: "Star rating input",
  category: "Data Input",
  path: "/components/input/rating",
  tags: ["rating", "stars", "review", "score", "feedback", "evaluation"],
  examples: ["basic", "sizes", "colors", "half-stars", "readonly", "with-mask"],
  relatedComponents: ["form-control", "mask", "stat"],
  preview: (
    <div class="flex flex-col gap-3">
      <Rating value={4} />
      <Rating value={3} mask="heart" size="lg" />
      <Rating value={2.5} half readonly />
    </div>
  ),
};
