import { ComponentMetadata } from "../../types.ts";
import { Skeleton } from "./Skeleton.tsx";

export const skeletonMetadata: ComponentMetadata = {
  name: "Skeleton",
  description: "Loading placeholder",
  category: "Feedback",
  path: "/components/feedback/skeleton",
  tags: ["skeleton", "placeholder", "loading", "shimmer", "ghost", "content"],
  examples: ["basic", "circle", "rectangle", "text", "avatar", "card"],
  relatedComponents: ["loading", "avatar", "card"],
  preview: (
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <Skeleton circle width={40} height={40} />
        <div class="flex-1">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton width="100%" height={100} />
    </div>
  ),
};
