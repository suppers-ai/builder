import { useState, useRef } from "preact/hooks";
import { BaseComponentProps } from "../../types.ts";
import { Button } from "../../action/button/Button.tsx";
import { Input } from "../../input/input/Input.tsx";
import { Alert } from "../../feedback/alert/Alert.tsx";
import { Loading } from "../../feedback/loading/Loading.tsx";
import { Select } from "../../input/select/Select.tsx";

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

  if (!user) {
    return (
      <div class={`max-w-2xl mx-auto p-6 ${className}`} id={id} {...props}>
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
    <div class={`max-w-xl mx-auto p-4 space-y-4 ${className}`} id={id} {...props}>
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

      {/* Profile Card */}
      <div class="bg-base-100 rounded-lg shadow-sm border border-base-200">
        <div class="p-6">
          {/* Header */}
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              {/* Avatar */}
              <div class="relative group">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors relative overflow-hidden"
                  disabled={isLoading}
                >
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      class="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <span class="text-xl font-semibold text-primary">
                      {getInitials()}
                    </span>
                  )}
                  {/* Hover overlay */}
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  class="hidden"
                />
              </div>
              
              {/* User Info */}
              <div>
                <h1 class="text-xl font-semibold text-base-content">
                  {getDisplayName()}
                </h1>
                <p class="text-base-content/60 text-sm">
                  {user.email}
                </p>
                {user.created_at && (
                  <p class="text-base-content/40 text-xs mt-1">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div class="flex items-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
              <Button
                size="sm"
                color="error"
                variant="outline"
                onClick={onSignOut}
                disabled={isLoading}
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleEditSubmit} class="space-y-4 mb-6 pb-6 border-b border-base-200">
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
                    placeholder="First name"
                    size="sm"
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
                    placeholder="Last name"
                    size="sm"
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
                  placeholder="Display name"
                  size="sm"
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
                  size="sm"
                  class="w-full"
                >
                  {themes.map(theme => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </Select>
                <p class="text-xs text-base-content/60 mt-1">
                  Your theme preference will be saved and applied across all apps
                </p>
              </div>
              <div class="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  size="sm"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Security Section */}
          <div class="pt-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-medium text-base-content">Security</h3>
                <p class="text-sm text-base-content/60">Manage your password and security settings</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                disabled={isLoading}
              >
                Change Password
              </Button>
            </div>

            {/* Password Change Form */}
            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} class="space-y-4 mt-4 p-4 bg-base-50 rounded-lg">
                <div>
                  <label class="block text-sm font-medium text-base-content mb-2">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onInput={(e) => setPasswordData(prev => ({ 
                      ...prev, 
                      currentPassword: (e.target as HTMLInputElement).value 
                    }))}
                    placeholder="Current password"
                    size="sm"
                    showPasswordToggle
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-base-content mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onInput={(e) => setPasswordData(prev => ({ 
                      ...prev, 
                      newPassword: (e.target as HTMLInputElement).value 
                    }))}
                    placeholder="New password"
                    size="sm"
                    showPasswordToggle
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-base-content mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onInput={(e) => setPasswordData(prev => ({ 
                      ...prev, 
                      confirmPassword: (e.target as HTMLInputElement).value 
                    }))}
                    placeholder="Confirm new password"
                    size="sm"
                    showPasswordToggle
                    required
                  />
                </div>
                <div class="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    size="sm"
                    disabled={isLoading || passwordData.newPassword !== passwordData.confirmPassword}
                    loading={isLoading}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}