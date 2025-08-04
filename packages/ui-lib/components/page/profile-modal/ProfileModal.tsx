import { useEffect, useRef, useState } from "preact/hooks";
import { BaseComponentProps } from "../../types.ts";
import { Button } from "../../action/button/Button.tsx";
import { Input } from "../../input/input/Input.tsx";
import { PasswordInput } from "../../input/password-input/PasswordInput.tsx";
import { Toast } from "../../feedback/toast/Toast.tsx";
import { Avatar } from "../../display/avatar/Avatar.tsx";
import { GlobalThemeController } from "../../action/theme-controller/ThemeController.tsx";
import { TypeMappers } from "@suppers/shared/utils/type-mappers.ts";
import { ChevronDown, Palette, X } from "lucide-preact";
import { User } from "../profile-card/ProfileCard.tsx";

export interface ProfileModalProps extends BaseComponentProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  isMobile?: boolean;
  onUpdateProfile?: (data: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    theme?: string;
  }) => Promise<{ success?: boolean; error?: string }>;
  onUploadAvatar?: (file: File) => Promise<void>;
  onSignOut?: () => void;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  // Real-time sync options
  enableRealTimeSync?: boolean;
  syncSource?: string;
  isPopupMode?: boolean;
  parentOrigin?: string;
  onPopupClose?: () => void;
  onProfileChange?: (change: any) => void;
}

export function ProfileModal({
  class: className = "",
  user,
  isOpen,
  onClose,
  isLoading = false,
  error,
  success,
  isMobile = false,
  onUpdateProfile,
  onUploadAvatar,
  onSignOut,
  onChangePassword,
  enableRealTimeSync = false,
  syncSource,
  isPopupMode = false,
  parentOrigin,
  onPopupClose,
  onProfileChange,
  id,
  ...props
}: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(user?.user_metadata?.theme || "light");
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: "success" | "error" }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle click outside to close modal (only on desktop)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isMobile && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMobile]);

  // Handle orientation change on mobile
  useEffect(() => {
    const handleOrientationChange = () => {
      // Force a re-render to adjust layout
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.style.height = `${window.innerHeight}px`;
        }
      }, 100);
    };

    if (isMobile) {
      window.addEventListener("orientationchange", handleOrientationChange);
      window.addEventListener("resize", handleOrientationChange);
    }

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, [isMobile]);

  // Add toast function
  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  // Remove toast function
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Show toasts when error or success changes
  if (error && !toasts.some((t) => t.message === error)) {
    addToast(error, "error");
  }
  if (success && !toasts.some((t) => t.message === success)) {
    addToast(success, "success");
  }

  const handleClose = () => {
    if (isPopupMode && onPopupClose) {
      onPopupClose();
    } else {
      onClose();
    }
  };

  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    if (onUpdateProfile) {
      try {
        const result = await onUpdateProfile(editData);
        if (result.success) {
          addToast("Profile updated successfully!", "success");

          // Broadcast profile change if real-time sync is enabled
          if (enableRealTimeSync && onProfileChange) {
            onProfileChange({
              type: "profile",
              data: { user: editData },
              timestamp: Date.now(),
              source: syncSource || "profile-modal",
              userId: user?.id || "",
            });
          }

          // Communicate with parent window if in popup mode
          if (isPopupMode && parentOrigin && window.parent) {
            window.parent.postMessage({
              type: "profile-updated",
              data: editData,
            }, parentOrigin);
          }
        } else {
          addToast(result.error || "Failed to update profile", "error");
        }
        setIsEditing(false);
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Failed to update profile", "error");
      }
    }
  };

  const handleEditClick = () => {
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

        // Broadcast avatar change if real-time sync is enabled
        if (enableRealTimeSync && onProfileChange) {
          onProfileChange({
            type: "avatar",
            data: { avatarUrl: URL.createObjectURL(file) },
            timestamp: Date.now(),
            source: syncSource || "profile-modal",
            userId: user?.id || "",
          });
        }

        // Communicate with parent window if in popup mode
        if (isPopupMode && parentOrigin && window.parent) {
          window.parent.postMessage({
            type: "avatar-updated",
            data: { avatarUrl: URL.createObjectURL(file) },
          }, parentOrigin);
        }
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

  const handleThemeChange = async (newTheme: string) => {
    setCurrentTheme(newTheme);

    // Save theme immediately
    if (onUpdateProfile) {
      try {
        await onUpdateProfile({ theme: newTheme });
        addToast("Theme updated successfully!", "success");

        // Broadcast theme change if real-time sync is enabled
        if (enableRealTimeSync && onProfileChange) {
          onProfileChange({
            type: "theme",
            data: { theme: newTheme },
            timestamp: Date.now(),
            source: syncSource || "profile-modal",
            userId: user?.id || "",
          });
        }

        // Communicate with parent window if in popup mode
        if (isPopupMode && parentOrigin && window.parent) {
          window.parent.postMessage({
            type: "theme-updated",
            data: { theme: newTheme },
          }, parentOrigin);
        }
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : "Failed to update theme",
          "error",
        );
      }
    }

    setShowThemeModal(false);
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();

      // Broadcast sign out if real-time sync is enabled
      if (enableRealTimeSync && onProfileChange) {
        onProfileChange({
          type: "signOut",
          data: { reason: "user-initiated" },
          timestamp: Date.now(),
          source: syncSource || "profile-modal",
          userId: user?.id || "",
        });
      }

      // Communicate with parent window if in popup mode
      if (isPopupMode && parentOrigin && window.parent) {
        window.parent.postMessage({
          type: "sign-out",
        }, parentOrigin);
      }
    }
  };

  // Use centralized utilities for consistent user display
  const displayName = user ? TypeMappers.getDisplayName(user as any) : "User";
  const initials = user ? TypeMappers.getInitials(user as any) : "U";

  if (!isOpen) return null;

  if (!user) {
    return (
      <div
        class={`fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 ${className}`}
      >
        <div
          ref={modalRef}
          class={`bg-base-100 rounded-xl p-6 w-full max-w-md ${
            isMobile ? "h-full max-w-none rounded-none" : "max-h-[90vh]"
          } overflow-y-auto`}
        >
          <div class="text-center">
            <div class="text-base-content/50 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-base-content mb-2">No User Found</h2>
            <p class="text-base-content/60 mb-4">Please log in to view your profile.</p>
            <Button onClick={handleClose} variant="outline" class="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      class={`fixed inset-0 bg-black/50 z-[100] flex items-center justify-center ${
        isMobile ? "p-0" : "p-4"
      } ${className}`}
      id={id}
      {...props}
    >
      {/* Toast Container */}
      <div class="fixed top-4 right-4 z-[110] space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            dismissible={true}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div
        ref={modalRef}
        class={`bg-base-100 shadow-xl border border-base-200 overflow-hidden ${
          isMobile ? "w-full h-full rounded-none" : "rounded-xl w-full max-w-md max-h-[90vh]"
        } overflow-y-auto`}
        style={isMobile ? { height: `${window.innerHeight}px` } : {}}
      >
        {/* Header with close button */}
        <div class="flex items-center justify-between p-4 border-b border-base-200 bg-base-100 sticky top-0 z-10">
          <div class="flex items-center gap-3">
            <img
              src={currentTheme === "dark" ? "/logos/long_dark.png" : "/logos/long_light.png"}
              alt="Suppers"
              class="h-6"
            />
            {isPopupMode && <span class="text-sm text-base-content/60">Profile</span>}
          </div>
          <Button
            onClick={handleClose}
            class={`p-2 hover:bg-base-200 rounded-lg transition-colors bg-transparent border-none ${
              isMobile ? "touch-manipulation min-h-[44px] min-w-[44px]" : ""
            }`}
            type="button"
          >
            <X size={isMobile ? 24 : 20} />
          </Button>
        </div>

        {/* User Header Section */}
        <div class="flex items-center justify-between p-6 mb-6">
          <div class="flex items-center gap-4">
            <Button
              type="button"
              onClick={handleAvatarClick}
              class={`relative group p-0 bg-transparent border-none hover:bg-transparent ${
                isMobile ? "touch-manipulation" : ""
              }`}
              disabled={isLoading}
            >
              <Avatar
                src={user.user_metadata?.avatar_url}
                alt="Profile"
                initials={initials}
                size="lg"
                class={`${isMobile ? "w-16 h-16" : "w-12 h-12"}`}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                class="hidden"
              />
            </Button>
            <div>
              <p class="text-sm text-base-content/60">Welcome</p>
              <h1 class={`font-bold text-base-content ${isMobile ? "text-xl" : "text-lg"}`}>
                {displayName}
              </h1>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div class="space-y-px">
          {/* User Profile */}
          <Button
            onClick={handleEditClick}
            class={`w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors border-b border-base-200 bg-transparent border-none justify-start rounded-none ${
              isMobile ? "touch-manipulation min-h-[56px]" : ""
            }`}
            type="button"
          >
            <div class="flex items-center gap-3">
              <div
                class={`rounded-full bg-base-200 flex items-center justify-center ${
                  isMobile ? "w-10 h-10" : "w-8 h-8"
                }`}
              >
                <svg
                  class={`text-base-content/60 ${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span class={`text-base-content font-medium ${isMobile ? "text-lg" : ""}`}>
                User Profile
              </span>
            </div>
            <svg
              class={`text-primary ${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>

          {/* Change Password */}
          <Button
            onClick={() => setShowPasswordForm(true)}
            class={`w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors border-b border-base-200 bg-transparent border-none justify-start rounded-none ${
              isMobile ? "touch-manipulation min-h-[56px]" : ""
            }`}
            type="button"
          >
            <div class="flex items-center gap-3">
              <div
                class={`rounded-full bg-base-200 flex items-center justify-center ${
                  isMobile ? "w-10 h-10" : "w-8 h-8"
                }`}
              >
                <svg
                  class={`text-base-content/60 ${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <span class={`text-base-content font-medium ${isMobile ? "text-lg" : ""}`}>
                Change Password
              </span>
            </div>
            <svg
              class={`text-primary ${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>

          {/* Theme Controller */}
          <Button
            onClick={() => setShowThemeModal(true)}
            class={`w-full flex items-center justify-between p-4 hover:bg-base-200 transition-colors border-b border-base-200 bg-transparent border-none justify-start rounded-none ${
              isMobile ? "touch-manipulation min-h-[56px]" : ""
            }`}
            type="button"
          >
            <div class="flex items-center gap-3">
              <div
                class={`rounded-full bg-base-200 flex items-center justify-center ${
                  isMobile ? "w-10 h-10" : "w-8 h-8"
                }`}
              >
                <Palette size={isMobile ? 20 : 16} class="text-base-content/70" />
              </div>
              <span class={`text-base-content font-medium ${isMobile ? "text-lg" : ""}`}>
                Theme
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class={`text-base-content/70 capitalize ${isMobile ? "text-base" : "text-sm"}`}>
                {currentTheme}
              </span>
              <ChevronDown size={isMobile ? 20 : 16} class="text-base-content/50" />
            </div>
          </Button>

          {/* Theme Modal */}
          {showThemeModal && (
            <div
              class="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowThemeModal(false);
                }
              }}
            >
              <GlobalThemeController
                showButton={false}
                onThemeChange={handleThemeChange}
                onClose={() => setShowThemeModal(false)}
              />
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div class="p-6 pt-4">
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline"
            color="error"
            class={`w-full ${isMobile ? "touch-manipulation min-h-[48px] text-lg" : ""}`}
          >
            Sign Out
          </Button>
        </div>

        {/* Edit Form Modal */}
        {isEditing && (
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[130]">
            <div
              class={`bg-base-100 rounded-xl p-6 w-full max-h-[90vh] overflow-y-auto ${
                isMobile ? "max-w-none h-full rounded-none" : "max-w-md"
              }`}
            >
              <div class="flex items-center justify-between mb-6">
                <h3 class={`font-semibold text-base-content ${isMobile ? "text-xl" : "text-lg"}`}>
                  Edit Profile
                </h3>
                <Button
                  onClick={() => setIsEditing(false)}
                  class={`p-2 hover:bg-base-200 rounded-lg transition-colors bg-transparent border-none ${
                    isMobile ? "touch-manipulation min-h-[44px] min-w-[44px]" : ""
                  }`}
                  type="button"
                >
                  <X size={isMobile ? 24 : 20} />
                </Button>
              </div>

              <form onSubmit={handleEditSubmit} class="space-y-4">
                <div class={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
                  <div>
                    <label
                      class={`block font-medium text-base-content mb-2 ${
                        isMobile ? "text-base" : "text-sm"
                      }`}
                    >
                      First Name
                    </label>
                    <Input
                      type="text"
                      value={editData.firstName}
                      onInput={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          firstName: (e.target as HTMLInputElement).value,
                        }))}
                      placeholder="Enter first name"
                      size={isMobile ? "lg" : "md"}
                      bordered={true}
                      class={`w-full ${isMobile ? "touch-manipulation" : ""}`}
                    />
                  </div>
                  <div>
                    <label
                      class={`block font-medium text-base-content mb-2 ${
                        isMobile ? "text-base" : "text-sm"
                      }`}
                    >
                      Last Name
                    </label>
                    <Input
                      type="text"
                      value={editData.lastName}
                      onInput={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          lastName: (e.target as HTMLInputElement).value,
                        }))}
                      placeholder="Enter last name"
                      size={isMobile ? "lg" : "md"}
                      class={`w-full ${isMobile ? "touch-manipulation" : ""}`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    class={`block font-medium text-base-content mb-2 ${
                      isMobile ? "text-base" : "text-sm"
                    }`}
                  >
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={editData.displayName}
                    onInput={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        displayName: (e.target as HTMLInputElement).value,
                      }))}
                    placeholder="How you'd like to be displayed"
                    size={isMobile ? "lg" : "md"}
                    class={`w-full ${isMobile ? "touch-manipulation" : ""}`}
                  />
                </div>

                <div class="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    class={`flex-1 ${isMobile ? "touch-manipulation min-h-[48px] text-lg" : ""}`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isLoading}
                    loading={isLoading}
                    class={`flex-1 ${isMobile ? "touch-manipulation min-h-[48px] text-lg" : ""}`}
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
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[130]">
            <div
              class={`bg-base-100 rounded-xl p-6 w-full max-h-[90vh] overflow-y-auto ${
                isMobile ? "max-w-none h-full rounded-none" : "max-w-md"
              }`}
            >
              <div class="flex items-center justify-between mb-6">
                <h3 class={`font-semibold text-base-content ${isMobile ? "text-xl" : "text-lg"}`}>
                  Change Password
                </h3>
                <Button
                  onClick={() => setShowPasswordForm(false)}
                  class={`p-2 hover:bg-base-200 rounded-lg transition-colors bg-transparent border-none ${
                    isMobile ? "touch-manipulation min-h-[44px] min-w-[44px]" : ""
                  }`}
                  type="button"
                >
                  <X size={isMobile ? 24 : 20} />
                </Button>
              </div>

              <form onSubmit={handlePasswordSubmit} class="space-y-4">
                <div>
                  <label
                    class={`block font-medium text-base-content mb-2 ${
                      isMobile ? "text-base" : "text-sm"
                    }`}
                  >
                    Current Password
                  </label>
                  <PasswordInput
                    value={passwordData.currentPassword}
                    onInput={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: (e.target as HTMLInputElement).value,
                      }))}
                    placeholder="Enter your current password"
                    size={isMobile ? "lg" : "md"}
                    class={`w-full ${isMobile ? "touch-manipulation" : ""}`}
                    required
                  />
                </div>
                <div>
                  <label
                    class={`block font-medium text-base-content mb-2 ${
                      isMobile ? "text-base" : "text-sm"
                    }`}
                  >
                    New Password
                  </label>
                  <PasswordInput
                    value={passwordData.newPassword}
                    onInput={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: (e.target as HTMLInputElement).value,
                      }))}
                    placeholder="Enter your new password"
                    size={isMobile ? "lg" : "md"}
                    class={`w-full ${isMobile ? "touch-manipulation" : ""}`}
                    required
                  />
                </div>
                <div>
                  <label
                    class={`block font-medium text-base-content mb-2 ${
                      isMobile ? "text-base" : "text-sm"
                    }`}
                  >
                    Confirm New Password
                  </label>
                  <PasswordInput
                    value={passwordData.confirmPassword}
                    onInput={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: (e.target as HTMLInputElement).value,
                      }))}
                    placeholder="Confirm your new password"
                    size={isMobile ? "lg" : "md"}
                    class={`w-full ${isMobile ? "touch-manipulation" : ""}`}
                    required
                  />
                  {passwordData.confirmPassword &&
                    passwordData.newPassword !== passwordData.confirmPassword && (
                    <p class="text-error text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <div class="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    class={`flex-1 ${isMobile ? "touch-manipulation min-h-[48px] text-lg" : ""}`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isLoading ||
                      passwordData.newPassword !== passwordData.confirmPassword ||
                      !passwordData.currentPassword || !passwordData.newPassword}
                    loading={isLoading}
                    class={`flex-1 ${isMobile ? "touch-manipulation min-h-[48px] text-lg" : ""}`}
                  >
                    Update
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
