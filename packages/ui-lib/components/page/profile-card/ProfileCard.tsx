import { useState, useRef } from "preact/hooks";
import { BaseComponentProps } from "../../types.ts";
import { Button } from "../../action/button/Button.tsx";
import { Input } from "../../input/input/Input.tsx";
import { PasswordInput } from "../../input/password-input/PasswordInput.tsx";
import { Alert } from "../../feedback/alert/Alert.tsx";
import { Loading } from "../../feedback/loading/Loading.tsx";
import { Select } from "../../input/select/Select.tsx";
import { Avatar } from "../../display/avatar/Avatar.tsx";
import { Card } from "../../display/card/Card.tsx";

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar_url?: string;
    theme?: string;
  };
  created_at?: string;
}

export interface ProfileCardProps extends BaseComponentProps {
  user: User | null;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  onUpdateProfile?: (data: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    theme?: string;
  }) => Promise<void>;
  onUploadAvatar?: (file: File) => Promise<void>;
  onSignOut?: () => void;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function ProfileCard({
  class: className = "",
  user,
  isLoading = false,
  error,
  success,
  onUpdateProfile,
  onUploadAvatar,
  onSignOut,
  onChangePassword,
  id,
  ...props
}: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(user?.user_metadata?.theme || "light");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    firstName: user?.user_metadata?.firstName || "",
    lastName: user?.user_metadata?.lastName || "",
    displayName: user?.user_metadata?.displayName || "",
    theme: user?.user_metadata?.theme || "light",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Available themes
  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "cupcake", label: "Cupcake" },
    { value: "bumblebee", label: "Bumblebee" },
    { value: "emerald", label: "Emerald" },
    { value: "corporate", label: "Corporate" },
    { value: "synthwave", label: "Synthwave" },
    { value: "retro", label: "Retro" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "valentine", label: "Valentine" },
    { value: "halloween", label: "Halloween" },
    { value: "garden", label: "Garden" },
    { value: "forest", label: "Forest" },
    { value: "aqua", label: "Aqua" },
    { value: "lofi", label: "Lo-Fi" },
    { value: "pastel", label: "Pastel" },
    { value: "fantasy", label: "Fantasy" },
    { value: "wireframe", label: "Wireframe" },
    { value: "black", label: "Black" },
    { value: "luxury", label: "Luxury" },
    { value: "dracula", label: "Dracula" },
    { value: "cmyk", label: "CMYK" },
    { value: "autumn", label: "Autumn" },
    { value: "business", label: "Business" },
    { value: "acid", label: "Acid" },
    { value: "lemonade", label: "Lemonade" },
    { value: "night", label: "Night" },
    { value: "coffee", label: "Coffee" },
    { value: "winter", label: "Winter" },
    { value: "dim", label: "Dim" },
    { value: "nord", label: "Nord" },
    { value: "sunset", label: "Sunset" },
  ];

  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    if (onUpdateProfile) {
      await onUpdateProfile(editData);
      // Apply theme immediately
      if (editData.theme !== currentTheme) {
        document.documentElement.setAttribute('data-theme', editData.theme);
        localStorage.setItem('theme', editData.theme);
        setCurrentTheme(editData.theme);
      }
      setIsEditing(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && onUploadAvatar) {
      await onUploadAvatar(file);
    }
  };

  const handlePasswordSubmit = async (e: Event) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    if (onChangePassword) {
      await onChangePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  const getDisplayName = () => {
    if (user?.user_metadata?.displayName) return user.user_metadata.displayName;
    if (user?.user_metadata?.firstName || user?.user_metadata?.lastName) {
      return `${user?.user_metadata?.firstName || ""} ${user?.user_metadata?.lastName || ""}`.trim();
    }
    return user?.email?.split("@")[0] || "User";
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getJoinedDate = () => {
    if (!user?.created_at) return "Recently";
    const date = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years === 1 ? '' : 's'} ago`;
    }
  };

  if (!user) {
    return (
      <div class={`max-w-md mx-auto p-4 ${className}`} id={id} {...props}>
        <div class="bg-base-100 rounded-xl shadow-sm border border-base-200 p-8 text-center">
          <div class="text-base-content/50 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-base-content mb-2">No User Found</h2>
          <p class="text-base-content/60">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div class={`max-w-md mx-auto ${className}`} id={id} {...props}>
      {/* Messages */}
      {error && (
        <Alert color="error" class="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" class="mb-4">
          {success}
        </Alert>
      )}

      {/* Top Navigation Bar */}
      <div class="flex items-center justify-between mb-6">
        <button 
          onClick={() => window.history.back()}
          class="p-2 rounded-lg hover:bg-base-200 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button class="p-2 rounded-lg hover:bg-base-200 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* User Information Section */}
      <div class="flex items-start gap-4 mb-8">
        <div class="flex-shrink-0">
          <button
            type="button"
            onClick={handleAvatarClick}
            class="relative group"
            disabled={isLoading}
          >
            <Avatar
              src={user.user_metadata?.avatar_url}
              alt="Profile"
              initials={getInitials()}
              size="xl"
              class="w-20 h-20 ring-2 ring-base-300"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              class="hidden"
            />
          </button>
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-bold text-base-content truncate">
            {user.user_metadata?.firstName || getDisplayName()}
          </h1>
          <p class="text-sm text-base-content/60 truncate">
            {user.user_metadata?.lastName || ""}
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs text-base-content/60">Joined</p>
          <p class="text-sm font-semibold text-base-content">{getJoinedDate()}</p>
        </div>
      </div>

      {/* Profile Section */}
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-base-content mb-3">Profile</h2>
        <div class="bg-base-100 rounded-lg border border-base-200">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            class="w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <div class="w-3 h-3 rounded-full bg-primary"></div>
              </div>
              <span class="text-base-content font-medium">Manage user</span>
            </div>
            <svg class="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-base-content mb-3">Settings</h2>
        <div class="bg-base-100 rounded-lg border border-base-200 space-y-px">
          <button class="w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.5 19.5a2 2 0 01-2-2v-11a2 2 0 012-2h11a2 2 0 012 2v11a2 2 0 01-2 2h-11z" />
                </svg>
              </div>
              <span class="text-base-content font-medium">Notifications</span>
            </div>
            <svg class="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button class="w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <span class="text-base-content font-medium">Dark Mode</span>
            </div>
            <svg class="w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sign Out Button */}
      <Button
        onClick={onSignOut}
        disabled={isLoading}
        variant="outline"
        color="error"
        wide
        className="w-full"
      >
        Sign Out
      </Button>

      {/* Edit Form Modal */}
      {isEditing && (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="bg-base-100 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-base-content">Edit Profile</h3>
              <button 
                onClick={() => setIsEditing(false)}
                class="p-2 hover:bg-base-200 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-base-content mb-2">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={editData.firstName}
                    onInput={(e) => setEditData(prev => ({ 
                      ...prev, 
                      firstName: (e.target as HTMLInputElement).value 
                    }))}
                    placeholder="Enter first name"
                    size="md"
                    bordered={true}
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-base-content mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={editData.lastName}
                    onInput={(e) => setEditData(prev => ({ 
                      ...prev, 
                      lastName: (e.target as HTMLInputElement).value 
                    }))}
                    placeholder="Enter last name"
                    class="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-base-content mb-2">
                  Display Name
                </label>
                <Input
                  type="text"
                  value={editData.displayName}
                  onInput={(e) => setEditData(prev => ({ 
                    ...prev, 
                    displayName: (e.target as HTMLInputElement).value 
                  }))}
                  placeholder="How you'd like to be displayed"
                  class="w-full"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-base-content mb-2">
                  Theme Preference
                </label>
                <Select
                  value={editData.theme}
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    theme: (e.target as HTMLSelectElement).value 
                  }))}
                  options={themes.map(theme => ({
                    value: theme.value,
                    label: theme.label
                  }))}
                  class="w-full"
                />
              </div>
              
              <div class="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  class="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isLoading}
                  loading={isLoading}
                  class="flex-1"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="bg-base-100 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-base-content">Change Password</h3>
              <button 
                onClick={() => setShowPasswordForm(false)}
                class="p-2 hover:bg-base-200 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-base-content mb-2">
                  Current Password
                </label>
                <PasswordInput
                  value={passwordData.currentPassword}
                  onInput={(e) => setPasswordData(prev => ({ 
                    ...prev, 
                    currentPassword: (e.target as HTMLInputElement).value 
                  }))}
                  placeholder="Enter your current password"
                  class="w-full"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-base-content mb-2">
                  New Password
                </label>
                <PasswordInput
                  value={passwordData.newPassword}
                  onInput={(e) => setPasswordData(prev => ({ 
                    ...prev, 
                    newPassword: (e.target as HTMLInputElement).value 
                  }))}
                  placeholder="Enter your new password"
                  class="w-full"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-base-content mb-2">
                  Confirm New Password
                </label>
                <PasswordInput
                  value={passwordData.confirmPassword}
                  onInput={(e) => setPasswordData(prev => ({ 
                    ...prev, 
                    confirmPassword: (e.target as HTMLInputElement).value 
                  }))}
                  placeholder="Confirm your new password"
                  class="w-full"
                  required
                />
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p class="text-error text-xs mt-1">Passwords do not match</p>
                )}
              </div>
              
              <div class="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  class="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isLoading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.currentPassword || !passwordData.newPassword}
                  loading={isLoading}
                  class="flex-1"
                >
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}