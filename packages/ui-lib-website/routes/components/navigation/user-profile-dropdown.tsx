import { type PageProps } from "fresh";
import { ComponentPageTemplate, UserProfileDropdown } from "@suppers/ui-lib";

export default function UserProfileDropdownDemo(props: PageProps) {
  if (props.state) {
    (props.state as any).title = "UserProfileDropdown - DaisyUI Component Library";
  }

  const mockUser = {
    id: "1",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    display_name: "John Doe",
    avatar_url: null,
  };

  const examples = [
    {
      title: "User Profile Dropdown",
      description: "Profile dropdown with avatar and menu options",
      code: `<UserProfileDropdown
  user={user}
  onLogout={() => console.log('Logout')}
  onProfile={() => console.log('Profile')}
/>`,
      preview: (
        <div class="flex gap-4">
          <UserProfileDropdown
            user={mockUser}
            onLogout={() => console.log("Logout")}
            onProfile={() => console.log("Profile")}
          />
        </div>
      ),
    },
  ];

  return (
    <ComponentPageTemplate
      title="UserProfileDropdown"
      description="User profile dropdown with avatar, user information, and customizable menu options"
      category="Navigation"
      examples={examples}
    />
  );
}
