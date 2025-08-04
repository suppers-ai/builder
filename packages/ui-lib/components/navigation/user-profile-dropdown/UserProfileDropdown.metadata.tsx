import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const userProfileDropdownExamples: ComponentExample[] = [
  {
    title: "Basic User Profile Dropdown",
    description: "Simple user profile dropdown with standard menu items",
    props: {
      user: {
        "name": "John Doe",
        email: "john@example.com",
        avatar: "https://via.placeholder.com/32",
      },
      items: [
        {
          label: "Profile",
          href: "/profile",
        },
        {
          label: "Settings",
          href: "/settings",
        },
        {
          label: "Logout",
          href: "/logout",
        },
      ],
    },
  },
  {
    title: "Admin User Dropdown",
    description: "User dropdown with admin access",
    props: {
      user: {
        "name": "John Doe",
        email: "john@example.com",
        avatar: "https://via.placeholder.com/32",
      },
      items: [
        {
          label: "Profile",
          href: "/profile",
        },
        {
          label: "Settings",
          href: "/settings",
        },
        {
          label: "Logout",
          href: "/logout",
        },
      ],
    },
  },
  {
    title: "Custom Handlers Dropdown",
    description: "User dropdown with custom navigation handlers",
    props: {
      user: {
        "name": "John Doe",
        email: "john@example.com",
        avatar: "https://via.placeholder.com/32",
      },
      items: [
        {
          label: "Profile",
          href: "/profile",
        },
        {
          label: "Settings",
          href: "/settings",
        },
        {
          label: "Logout",
          href: "/logout",
        },
      ],
    },
  },
  {
    title: "Custom Menu Items",
    description: "User dropdown with additional custom menu items",
    props: {
      user: {
        "name": "John Doe",
        email: "john@example.com",
        avatar: "https://via.placeholder.com/32",
      },
      items: [
        {
          label: "Profile",
          href: "/profile",
        },
        {
          label: "Settings",
          href: "/settings",
        },
        {
          label: "Logout",
          href: "/logout",
        },
      ],
    },
  },
];

const userProfileDropdownProps: ComponentProp[] = [
  {
    name: "user",
    type: "AuthUser",
    description: "User object containing profile information",
    required: true,
  },
  {
    name: "onLogout",
    type: "() => void",
    description: "Callback when logout is clicked",
  },
  {
    name: "onProfile",
    type: "() => void",
    description: "Callback when profile menu item is clicked",
  },
  {
    name: "onSettings",
    type: "() => void",
    description: "Callback when settings menu item is clicked",
  },
  {
    name: "onAdmin",
    type: "() => void",
    description: "Callback when admin menu item is clicked",
  },
  {
    name: "showAdmin",
    type: "boolean",
    description: "Whether to show admin menu item",
    default: "false",
  },
  {
    name: "profileHref",
    type: "string",
    description: "URL for profile page navigation",
    default: "/profile",
  },
  {
    name: "settingsHref",
    type: "string",
    description: "URL for settings page navigation",
    default: "/settings",
  },
  {
    name: "adminHref",
    type: "string",
    description: "URL for admin page navigation",
    default: "/admin",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
  {
    name: "children",
    type: "ComponentChildren",
    description: "Additional menu items to insert before logout",
  },
];

export const userProfileDropdownMetadata: ComponentMetadata = {
  name: "UserProfileDropdown",
  description: "User profile dropdown menu with avatar, user info, and common navigation actions",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/user-profile-dropdown",
  tags: ["user", "profile", "dropdown", "menu", "avatar", "auth"],
  relatedComponents: ["dropdown", "avatar", "menu"],
  interactive: true,
  preview: (
    <div class="dropdown dropdown-end">
      <label class="btn btn-ghost btn-circle avatar flex items-center gap-2 pl-2 pr-2 w-auto">
        <div class="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm">
          JD
        </div>
        <span class="text-sm font-medium">John Doe</span>
        <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7">
          </path>
        </svg>
      </label>
    </div>
  ),
  examples: userProfileDropdownExamples,
  props: userProfileDropdownProps,
  variants: ["basic", "with-admin", "custom-items"],
  useCases: ["User authentication", "App navigation", "Account management", "Admin panels"],
  usageNotes: [
    "Requires an AuthUser object with user profile information",
    "Shows user avatar, name, and email in the dropdown header",
    "Provides standard menu items: Profile, Settings, and Logout",
    "Admin menu item only shows when showAdmin is true",
    "Custom menu items can be added through children prop",
    "Use callback handlers for custom navigation logic",
    "Automatically handles responsive display of user name",
  ],
};
