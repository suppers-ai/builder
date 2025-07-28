import { UserAvatar } from "./UserAvatar.tsx";

export const componentMetadata = {
  component: UserAvatar,
  category: "Display",
  name: "UserAvatar", 
  description: "Avatar component specifically designed for displaying user profile images and initials",
  props: {
    user: {
      type: "AuthUser",
      required: true,
      description: "User object containing avatar_url, name, email etc."
    },
    size: {
      type: '"xs" | "sm" | "md" | "lg" | "xl"',
      default: '"md"',
      description: "Size of the avatar"
    },
    ring: {
      type: "boolean",
      default: "false", 
      description: "Whether to show a ring around the avatar"
    },
    online: {
      type: "boolean",
      default: "false",
      description: "Show online status indicator"
    },
    offline: {
      type: "boolean", 
      default: "false",
      description: "Show offline status indicator"
    }
  },
  examples: [
    {
      name: "Basic User Avatar",
      code: `<UserAvatar user={user} />`,
      props: {
    }
  },
    {
      name: "Large User Avatar with Ring",
      code: `<UserAvatar user={user} size="lg" ring />`,
      props: {
    }
  },
    {
      name: "Online Status Avatar",
      code: `<UserAvatar user={user} online />`,
      props: {}
        }
      ]
};