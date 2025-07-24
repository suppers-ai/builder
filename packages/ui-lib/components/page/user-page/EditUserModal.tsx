import { useEffect, useState } from "preact/hooks";
import { Loading } from "../../feedback/loading/Loading.tsx";
import { UserAvatar } from "../../display/avatar/UserAvatar.tsx";
import type { AuthUser } from "@suppers/shared/types/auth.ts";

interface EditUserModalProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: {
      firstName?: string;
      middleNames?: string;
      lastName?: string;
      displayName?: string;
      avatarUrl?: string;
    },
  ) => Promise<void>;
}

export function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    middleNames: "", // AuthUser doesn't have middle_names field
    lastName: user?.last_name || "",
    displayName: user?.display_name || "",
    avatarUrl: user?.avatar_url || "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.first_name || "",
        middleNames: "", // AuthUser doesn't have middle_names field
        lastName: user.last_name || "",
        displayName: user.display_name || "",
        avatarUrl: user.avatar_url || "",
      });
      setAvatarPreview(user.avatar_url || null);
      setErrors({});
    }
  }, [isOpen, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAvatarUrlChange = (value: string) => {
    handleInputChange("avatarUrl", value);
    setAvatarPreview(value || user?.avatar_url || null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    // Avatar URL is optional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSave({
        firstName: formData.firstName || undefined,
        middleNames: formData.middleNames || undefined,
        lastName: formData.lastName || undefined,
        displayName: formData.displayName || undefined,
        avatarUrl: formData.avatarUrl || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      setErrors({ submit: "Failed to update user information. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Edit User</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <UserAvatar
                user={user ? { ...user, avatar_url: avatarPreview || formData.avatarUrl } : user}
                size="lg"
              />
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  handleInputChange("firstName", (e.target as HTMLInputElement).value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your first name"
                disabled={isLoading}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            {/* Middle Names */}
            <div>
              <label htmlFor="middleNames" className="block text-sm font-medium text-gray-700 mb-2">
                Middle Names
              </label>
              <input
                type="text"
                id="middleNames"
                value={formData.middleNames}
                onChange={(e) =>
                  handleInputChange("middleNames", (e.target as HTMLInputElement).value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.middleNames ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your middle names"
                disabled={isLoading}
              />
              {errors.middleNames && (
                <p className="mt-1 text-sm text-red-600">{errors.middleNames}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  handleInputChange("lastName", (e.target as HTMLInputElement).value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your last name"
                disabled={isLoading}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  handleInputChange("displayName", (e.target as HTMLInputElement).value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.displayName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your display name"
                disabled={isLoading}
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
              )}
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL (Optional)
              </label>
              <input
                type="url"
                id="avatarUrl"
                value={formData.avatarUrl}
                onChange={(e) => handleAvatarUrlChange((e.target as HTMLInputElement).value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.avatarUrl ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your avatar URL"
                disabled={isLoading}
              />
              {errors.avatarUrl && <p className="mt-1 text-sm text-red-600">{errors.avatarUrl}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {errors.submit}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading
                  ? (
                    <>
                      <Loading size="sm" variant="spinner" class="mr-2" />
                      Saving...
                    </>
                  )
                  : (
                    "Save Changes"
                  )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
