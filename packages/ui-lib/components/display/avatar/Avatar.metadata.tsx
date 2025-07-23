import { ComponentMetadata } from "../../types.ts";
import { Avatar } from "./Avatar.tsx";

export const avatarMetadata: ComponentMetadata = {
  name: "Avatar",
  description: "Profile pictures and user representations with various sizes and states",
  category: "Display",
  path: "/components/display/avatar",
  tags: ["profile", "user", "image"],
  examples: ["basic", "sizes", "groups", "placeholder", "ring", "indicator"],
  relatedComponents: ["badge", "indicator", "button"],
  preview: (
    <div class="flex gap-2">
      <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
      <Avatar initials="AB" />
      <Avatar
        online
        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
      />
    </div>
  ),
};
