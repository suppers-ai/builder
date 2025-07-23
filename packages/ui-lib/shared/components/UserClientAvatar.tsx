import type { AuthUser } from "@suppers/shared/types/auth.ts";
import { TypeMappers } from "@suppers/shared/utils/type-mappers.ts";

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

  const getDisplayName = () => TypeMappers.getDisplayName(user);
  const getInitials = () => TypeMappers.getInitials(user as any);

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
      className={`${sizeClasses[size]
        } rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${className}`}
    >
      {getInitials()}
    </div>
  );
}

export default UserClientAvatar;
