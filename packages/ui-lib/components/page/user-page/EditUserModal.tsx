import { useEffect, useState } from "preact/hooks";
import { UserAvatar } from "../../display/avatar/UserAvatar.tsx";
import { Button } from "../../action/button/Button.tsx";
import { Input } from "../../input/input/Input.tsx";
import { Modal } from "../../action/modal/Modal.tsx";
import { Alert } from "../../feedback/alert/Alert.tsx";
import type { AuthUser } from "@suppers/shared";

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
    <Modal open={isOpen} onClose={onClose} title="Edit User" class="max-w-md">
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
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
            First Name *
          </label>
          <Input
            type="text"
            id="firstName"
            value={formData.firstName}
            onInput={(e) => handleInputChange("firstName", (e.target as HTMLInputElement).value)}
            class="w-full"
            color={errors.firstName ? "error" : undefined}
            placeholder="Enter your first name"
            disabled={isLoading}
            bordered
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>

        {/* Middle Names */}
        <div>
          <label htmlFor="middleNames" className="block text-sm font-medium text-slate-700 mb-2">
            Middle Names
          </label>
          <Input
            type="text"
            id="middleNames"
            value={formData.middleNames}
            onInput={(e) => handleInputChange("middleNames", (e.target as HTMLInputElement).value)}
            class="w-full"
            color={errors.middleNames ? "error" : undefined}
            placeholder="Enter your middle names"
            disabled={isLoading}
            bordered
          />
          {errors.middleNames && <p className="mt-1 text-sm text-red-600">{errors.middleNames}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
            Last Name *
          </label>
          <Input
            type="text"
            id="lastName"
            value={formData.lastName}
            onInput={(e) => handleInputChange("lastName", (e.target as HTMLInputElement).value)}
            class="w-full"
            color={errors.lastName ? "error" : undefined}
            placeholder="Enter your last name"
            disabled={isLoading}
            bordered
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-2">
            Display Name *
          </label>
          <Input
            type="text"
            id="displayName"
            value={formData.displayName}
            onInput={(e) => handleInputChange("displayName", (e.target as HTMLInputElement).value)}
            class="w-full"
            color={errors.displayName ? "error" : undefined}
            placeholder="Enter your display name"
            disabled={isLoading}
            bordered
          />
          {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>}
        </div>

        {/* Avatar URL */}
        <div>
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700 mb-2">
            Avatar URL (Optional)
          </label>
          <Input
            type="url"
            id="avatarUrl"
            value={formData.avatarUrl}
            onInput={(e) => handleAvatarUrlChange((e.target as HTMLInputElement).value)}
            class="w-full"
            color={errors.avatarUrl ? "error" : undefined}
            placeholder="Enter your avatar URL"
            disabled={isLoading}
            bordered
          />
          {errors.avatarUrl && <p className="mt-1 text-sm text-red-600">{errors.avatarUrl}</p>}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <Alert type="error" class="mb-4">
            {errors.submit}
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-base-300">
          <Button
            type="submit"
            disabled={isLoading}
            color="primary"
            class="flex-1"
            loading={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            class="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditUserModal;
