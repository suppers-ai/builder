import { UserInfo } from "./UserInfo.tsx";
import { UserInfoPropsSchema } from "./UserInfo.schema.ts";
import { LogOut, Settings as SettingsIcon, User } from "lucide-preact";

// Mock user data for examples
const mockUser = {
  id: "user_123",
  email: "sarah.jones@example.com",
  first_name: "Sarah",
  last_name: "Jones",
  display_name: "Sarah Jones",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4",
  role: "admin",
  created_at: "2023-01-15T10:30:00Z",
  last_sign_in_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
};

const mockDeveloperUser = {
  id: "user_456",
  email: "alex.dev@example.com",
  first_name: "Alex",
  last_name: "Chen",
  display_name: "Alex Chen",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede",
  role: "developer",
  created_at: "2023-06-20T14:22:00Z",
  last_sign_in_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
};

// Sample dropdown items
const basicDropdownItems = [
  {
    label: "View Profile",
    onClick: () => console.log("View Profile clicked"),
    icon: User,
  },
  {
    label: "Logout",
    onClick: () => console.log("Logout clicked"),
    icon: LogOut,
  },
];

const adminDropdownItems = [
  {
    label: "View Profile",
    onClick: () => console.log("View Profile clicked"),
    icon: User,
  },
  {
    label: "Settings",
    onClick: () => console.log("Settings clicked"),
    icon: SettingsIcon,
  },
  {
    label: "Logout",
    onClick: () => console.log("Logout clicked"),
    icon: LogOut,
  },
];

export const userInfoMetadata = {
  component: UserInfo,
  category: "Display",
  name: "UserInfo",
  path: "/components/display/user-info",
  description: "Compact user information card with avatar, name, email, and settings dropdown menu",
  schema: { schema: UserInfoPropsSchema },
  props: {
    user: {
      type: "AuthUser | null | undefined",
      required: false,
      description: "User object containing profile information",
    },
    dropdownItems: {
      type: "DropdownItem[]",
      required: false,
      description:
        "Array of dropdown menu items for the settings menu. Each item has label, onClick, and optional icon.",
    },
    className: {
      type: "string",
      required: false,
      description: "Additional CSS classes to apply",
    },
  },
  examples: [
    {
      name: "Without Dropdown",
      code: `<UserInfo user={mockUser} />`,
      props: {
        user: mockUser,
      },
    },
    {
      name: "With Basic Dropdown",
      code: `<UserInfo 
  user={mockUser} 
  dropdownItems={[
    {
      label: "View Profile",
      onClick: () => navigate('/profile'),
      icon: User
    },
    {
      label: "Logout", 
      onClick: () => signOut(),
      icon: LogOut
    }
  ]}
/>`,
      props: {
        user: mockUser,
        dropdownItems: basicDropdownItems,
      },
    },
    {
      name: "Admin User with Settings",
      code: `<UserInfo 
  user={mockUser}
  dropdownItems={[
    {
      label: "View Profile",
      onClick: () => navigate('/profile'),
      icon: User
    },
    {
      label: "Settings",
      onClick: () => navigate('/settings'), 
      icon: Settings
    },
    {
      label: "Logout",
      onClick: () => signOut(),
      icon: LogOut
    }
  ]}
/>`,
      props: {
        user: mockUser,
        dropdownItems: adminDropdownItems,
      },
    },
    {
      name: "Developer User",
      code: `<UserInfo 
  user={mockDeveloperUser}
  dropdownItems={basicDropdownItems}
/>`,
      props: {
        user: mockDeveloperUser,
        dropdownItems: basicDropdownItems,
      },
    },
    {
      name: "No User Data",
      code: `<UserInfo user={null} />`,
      props: {
        user: null,
      },
    },
  ],
};
