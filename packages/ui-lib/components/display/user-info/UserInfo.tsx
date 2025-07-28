import { AuthUser } from "@suppers/auth-client";
import { UserAvatar } from "../avatar/UserAvatar.tsx";
import { Dropdown } from "../../action/dropdown/Dropdown.tsx";
import { TypeMappers } from "@suppers/shared/utils/type-mappers.ts";
import { UserInfoProps } from "./UserInfo.schema.ts";
import { Settings } from "lucide-preact";

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: any;
}

export function UserInfo({
  user,
  dropdownItems = [],
  class: className = ""
}: UserInfoProps) {
  // Handle undefined user case
  if (!user) {
    return (
      <div className={`bg-base-200 rounded-lg p-4 flex items-center space-x-3 ${className}`}>
        <div className="text-base-content/50">No user data available</div>
      </div>
    );
  }

  const displayName = TypeMappers.getDisplayName(user);

  return (
    <div className={`bg-base-200 rounded-lg p-4 flex items-center space-x-3 ${className}`}>
      <UserAvatar
        user={user}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base-content text-lg truncate">
          {displayName}
        </h3>
        {user?.email && (
          <p className="text-sm text-base-content/70 truncate">
            {user.email}
          </p>
        )}
      </div>
      {dropdownItems.length > 0 && (
        <Dropdown
          trigger={
            <button className="btn btn-ghost btn-circle">
              <Settings size={20} />
            </button>
          }
          content={
            <>
              {dropdownItems.map((item, index) => (
                <li key={index}>
                  <button 
                    onClick={item.onClick}
                    className="flex items-center gap-2 w-full"
                  >
                    {item.icon && <item.icon size={16} />}
                    {item.label}
                  </button>
                </li>
              ))}
            </>
          }
          position="bottom-end"
        />
      )}
    </div>
  );
}

export default UserInfo;