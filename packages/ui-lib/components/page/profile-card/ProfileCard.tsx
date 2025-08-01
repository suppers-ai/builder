import { useState, useRef, useEffect } from "preact/hooks";
import { BaseComponentProps } from "../../types.ts";
import { Button } from "../../action/button/Button.tsx";
import { Input } from "../../input/input/Input.tsx";
import { PasswordInput } from "../../input/password-input/PasswordInput.tsx";
import { Toast } from "../../feedback/toast/Toast.tsx";
import { Avatar } from "../../display/avatar/Avatar.tsx";
import { GlobalThemeController } from "../../action/theme-controller/ThemeController.tsx";
import { ChevronDown, Palette } from "lucide-preact";

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
  // Database fields (from users table)
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  theme_id?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
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
  }) => Promise<{ success?: boolean, error?: string }>;
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
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(user?.user_metadata?.theme || "light");
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editData, setEditData] = useState({
    firstName: user?.user_metadata?.firstName || "",
    lastName: user?.user_metadata?.lastName || "",
    displayName: user?.user_metadata?.displayName || "",
    theme: user?.user_metadata?.theme || user?.theme_id || "light",
  });

  // Update editData when user data changes
  useEffect(() => {
    setEditData({
      firstName: user?.user_metadata?.firstName || user?.first_name || "",
      lastName: user?.user_metadata?.lastName || user?.last_name || "",
      displayName: user?.user_metadata?.displayName || user?.display_name || "",
      theme: user?.user_metadata?.theme || user?.theme_id || "light",
    });
  }, [user]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Add toast function
  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  // Remove toast function
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Show toasts when error or success changes (only if they're provided as props)
  if (error && !toasts.some(t => t.message === error)) {
    addToast(error, "error");
  }
  if (success && !toasts.some(t => t.message === success)) {
    addToast(success, "success");
  }

  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    if (onUpdateProfile) {
      try {
        await onUpdateProfile(editData).then((res) => {
          if (res.success) {
            addToast("Profile updated successfully!", "success");
          } else {
            addToast(res.error || "Failed to update profile", "error");
          }
        });
        // Apply theme immediately
        // if (editData.theme !== currentTheme) {
        //   document.documentElement.setAttribute('data-theme', editData.theme);
        //   localStorage.setItem('theme', editData.theme);
        //   setCurrentTheme(editData.theme);
        // }
        setIsEditing(false);
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Failed to update profile", "error");
      }
    }
  };

  const handleEditClick = () => {
    // Update form data with current user data when opening edit mode
    setEditData({
      firstName: user?.user_metadata?.firstName || user?.first_name || "",
      lastName: user?.user_metadata?.lastName || user?.last_name || "",
      displayName: user?.user_metadata?.displayName || user?.display_name || "",
      theme: user?.user_metadata?.theme || user?.theme_id || "light",
    });
    setIsEditing(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && onUploadAvatar) {
      try {
        await onUploadAvatar(file);
        addToast("Avatar updated successfully!", "success");
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Failed to upload avatar", "error");
      }
    }
  };

  const handlePasswordSubmit = async (e: Event) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }
    if (onChangePassword) {
      try {
        await onChangePassword(passwordData.currentPassword, passwordData.newPassword);
        addToast("Password updated successfully!", "success");
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Failed to update password", "error");
      }
    }
  };

  const getDisplayName = () => {
    // Check metadata first, then database fields
    if (user?.user_metadata?.displayName) return user.user_metadata.displayName;
    if (user?.display_name) return user.display_name;
    
    // Check for firstName/lastName in metadata
    if (user?.user_metadata?.firstName || user?.user_metadata?.lastName) {
      return `${user?.user_metadata?.firstName || ""} ${user?.user_metadata?.lastName || ""}`.trim();
    }
    
    // Check for first_name/last_name in database
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
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
      <div class={`${className}`} id={id} {...props}>
        <div class="text-center">
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
    <div class={`bg-base-100 rounded-xl shadow-xl border border-base-200 overflow-hidden ${className}`} id={id} {...props}>
      {/* Toast Container */}
      <div class="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            dismissible={true}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Logo Section */}
      <div class="text-center p-6 border-b border-base-200">
        <img
          src={currentTheme === "dark" ? "/logos/long_dark.png" : "/logos/long_light.png"}
          alt="Suppers"
          class="h-8 mx-auto"
        />
      </div>

      {/* User Header Section */}
      <div class="flex items-center justify-between p-6 mb-6">
        <div class="flex items-center gap-4">
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
              size="lg"
              class="w-12 h-12"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              class="hidden"
            />
          </button>
          <div>
            <p class="text-sm text-base-content/60">Welcome</p>
            <h1 class="text-lg font-bold text-base-content">{getDisplayName()}</h1>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div class="space-y-px">
        {/* User Profile */}
        <button 
                          onClick={handleEditClick}
          class="w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors border-b border-base-200"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center">
              <svg class="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="text-base-content font-medium">User Profile</span>
          </div>
          <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Change Password */}
        <button 
          onClick={() => setShowPasswordForm(true)}
          class="w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors border-b border-base-200"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center">
              <svg class="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span class="text-base-content font-medium">Change Password</span>
          </div>
          <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Theme Controller */}
        <button
          onClick={() => setShowThemeModal(true)}
          class="w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors border-b border-base-200"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center">
              <Palette size={16} class="text-base-content/70" />
            </div>
            <span class="text-base-content font-medium">Theme</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-base-content/70 capitalize">{currentTheme}</span>
            <ChevronDown size={16} class="text-base-content/50" />
          </div>
        </button>
        
      {/* Theme Modal */}
      {showThemeModal && (
        <div
          class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowThemeModal(false);
            }
          }}
        >
          <GlobalThemeController
            showButton={false}
            onThemeChange={async (newTheme) => {
              setCurrentTheme(newTheme);
              // setEditData(prev => ({ ...prev, theme: newTheme }));
              
              // Save theme immediately
              if (onUpdateProfile) {
                try {
                  await onUpdateProfile({ theme: newTheme });
                  addToast("Theme updated successfully!", "success");
                } catch (error) {
                  addToast(error instanceof Error ? error.message : "Failed to update theme", "error");
                }
              }
              
              setShowThemeModal(false);
            }}
            onClose={() => setShowThemeModal(false)}
          />
        </div>
      )}
      </div>

      {/* Logout Button */}
      <div class="p-6 pt-4">
        <button
          onClick={onSignOut}
          disabled={isLoading}
          class="w-full py-3 px-4 border border-error text-error hover:bg-error hover:text-error-content rounded-lg transition-colors font-medium"
        >
          Sign Out
        </button>
      </div>

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