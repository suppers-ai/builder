import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { ChevronDown, LogOut, Settings, Shield, User } from "lucide-preact";
import { UserAvatar } from "../../display/avatar/UserAvatar.tsx";
import { Dropdown } from "../../action/dropdown/Dropdown.tsx";
import type { AuthUser } from "../../../../shared/types/auth.ts";
import { TypeMappers } from "../../../../shared/utils/type-mappers.ts";

export interface UserProfileDropdownProps {
  user: AuthUser;
  onLogout?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onAdmin?: () => void;
  showAdmin?: boolean;
  profileHref?: string;
  settingsHref?: string;
  adminHref?: string;
  class?: string;
  children?: ComponentChildren;
}

export function UserProfileDropdown({
  user,
  onLogout,
  onProfile,
  onSettings,
  onAdmin,
  showAdmin = false,
  profileHref = "/profile",
  settingsHref = "/settings",
  adminHref = "/admin",
  class: className = "",
  children,
}: UserProfileDropdownProps) {
  const getDisplayName = () => TypeMappers.getDisplayName(user);
  const getDisplayEmail = () => user.email;

  const handleMenuItemClick = (callback?: () => void, href?: string) => {
    if (callback) {
      callback();
    } else if (href) {
      globalThis.location.href = href;
    }
  };

  const dropdownContent = (
    <ul class="menu dropdown-content z-[1] p-2 shadow-2xl bg-base-100 rounded-box w-64 border border-base-300">
      <li class="menu-title px-4 py-2">
        <div class="flex flex-col items-start w-full">
          <span class="font-semibold text-base-content truncate w-full">{getDisplayName()}</span>
          <span class="text-xs text-base-content/70 truncate w-full">{getDisplayEmail()}</span>
        </div>
      </li>
      <div class="divider my-1"></div>

      <li>
        <a
          href={profileHref}
          onClick={(e) => {
            if (onProfile) {
              e.preventDefault();
              onProfile();
            }
          }}
          class="flex items-center gap-3"
        >
          <User size={16} />
          Profile
        </a>
      </li>

      <li>
        <a
          href={settingsHref}
          onClick={(e) => {
            if (onSettings) {
              e.preventDefault();
              onSettings();
            }
          }}
          class="flex items-center gap-3"
        >
          <Settings size={16} />
          Settings
        </a>
      </li>

      {showAdmin && (
        <li>
          <a
            href={adminHref}
            onClick={(e) => {
              if (onAdmin) {
                e.preventDefault();
                onAdmin();
              }
            }}
            class="flex items-center gap-3"
          >
            <Shield size={16} />
            Admin
          </a>
        </li>
      )}

      {children}

      <div class="divider my-1"></div>

      <li>
        <a
          onClick={(e) => {
            e.preventDefault();
            if (onLogout) {
              onLogout();
            }
          }}
          class="flex items-center gap-3 text-error hover:bg-error/10"
        >
          <LogOut size={16} />
          Logout
        </a>
      </li>
    </ul>
  );

  return (
    <Dropdown
      class={`dropdown-end ${className}`}
      trigger={
        <label
          tabIndex={0}
          class="btn btn-ghost btn-circle avatar flex items-center gap-2 pl-2 pr-2 w-auto min-w-0"
        >
          <UserAvatar user={user} size="sm" />
          <span class="hidden sm:inline text-sm font-medium truncate max-w-24">
            {getDisplayName()}
          </span>
          <ChevronDown size={14} class="opacity-60" />
        </label>
      }
    >
      {dropdownContent}
    </Dropdown>
  );
}
