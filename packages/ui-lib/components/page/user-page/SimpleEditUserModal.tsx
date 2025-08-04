import { useState } from "preact/hooks";
import { Button } from "../../action/button/Button.tsx";
import { Input } from "../../input/input/Input.tsx";
import { Modal } from "../../action/modal/Modal.tsx";
import type { AuthUser } from "@suppers/shared";

interface SimpleEditUserModalProps {
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

export function SimpleEditUserModal({ user, isOpen, onClose, onSave }: SimpleEditUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    displayName: user?.display_name || "",
    avatarUrl: user?.avatar_url || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title="Edit User" class="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            First Name
          </label>
          <Input
            type="text"
            value={formData.firstName}
            onInput={(e) => handleInputChange("firstName", (e.target as HTMLInputElement).value)}
            class="w-full"
            placeholder="Enter first name"
            disabled={loading}
            bordered
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Last Name
          </label>
          <Input
            type="text"
            value={formData.lastName}
            onInput={(e) => handleInputChange("lastName", (e.target as HTMLInputElement).value)}
            class="w-full"
            placeholder="Enter last name"
            disabled={loading}
            bordered
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Display Name
          </label>
          <Input
            type="text"
            value={formData.displayName}
            onInput={(e) => handleInputChange("displayName", (e.target as HTMLInputElement).value)}
            class="w-full"
            placeholder="Enter display name"
            disabled={loading}
            bordered
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Avatar URL
          </label>
          <Input
            type="url"
            value={formData.avatarUrl}
            onInput={(e) => handleInputChange("avatarUrl", (e.target as HTMLInputElement).value)}
            class="w-full"
            placeholder="Enter avatar URL"
            disabled={loading}
            bordered
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            color="primary"
            class="flex-1"
            loading={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
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
