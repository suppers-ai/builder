import { AuthUser } from "@suppers/auth-client";
import { Avatar, AvatarProps } from "./Avatar.tsx";
import { TypeMappers } from "@suppers/shared/utils/type-mappers.ts";

export interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'alt' | 'initials'> {
  user: AuthUser;
}

export function UserAvatar({ user, ...avatarProps }: UserAvatarProps) {
  const displayName = TypeMappers.getDisplayName(user);
  const initials = TypeMappers.getInitials(user as any);

  return (
    <Avatar
      src={user.avatar_url}
      alt={displayName}
      initials={initials}
      {...avatarProps}
    />
  );
}

export default UserAvatar;