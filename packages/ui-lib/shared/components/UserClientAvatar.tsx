import type { AuthUser } from "@packages/auth-client";

interface UserClientAvatarProps {
  user: AuthUser;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserClientAvatar({ user, size = "md", className = "" }: UserClientAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
  };

  const getDisplayName = () => {
    if (user.display_name) {
      return user.display_name;
    }

    if (user.name) {
      return user.name;
    }

    const parts = [user.first_name, user.last_name].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(" ");
    }

    return user.email.split("@")[0];
  };

  const getInitials = () => {
    const displayName = getDisplayName();
    return displayName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={getDisplayName()}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${
        sizeClasses[size]
      } rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${className}`}
    >
      {getInitials()}
    </div>
  );
}

export default UserClientAvatar;
