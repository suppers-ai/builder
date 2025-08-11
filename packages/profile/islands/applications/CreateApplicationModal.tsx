import { useState } from "preact/hooks";
import { Button, Card } from "@suppers/ui-lib";
import { X, Plus } from "lucide-preact";
import { api } from "../../lib/applications/api.ts";

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateApplicationModal({ isOpen, onClose, onSuccess }: CreateApplicationModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert name to kebab-case for id
  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const handleNameChange = (name: string) => {
    const generatedId = generateId(name);
    setFormData({
      ...formData,
      name,
      id: generatedId,
    });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!formData.id || !formData.name) {
      setError("ID and name are required");
      return;
    }

    // Validate ID format (kebab-case)
    const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!kebabCaseRegex.test(formData.id)) {
      setError("ID must be in kebab-case format (lowercase letters, numbers, and hyphens)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.applications.create({
        slug: formData.id, // Use the ID field as slug
        name: formData.name,
        description: formData.description || undefined,
        // templateId is optional now
      });
      
      // Reset form and close modal
      setFormData({ id: "", name: "", description: "" });
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Failed to create application:", err);
      if (err instanceof Error && err.message.includes("already exists")) {
        setError("An application with this name already exists. Please choose a different name.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to create application");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ id: "", name: "", description: "" });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card class="w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={loading}
          class="absolute top-4 right-4 p-1 hover:bg-base-200 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>

        {/* Header */}
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-base-content mb-2">Create Application</h2>
          <p class="text-sm text-base-content/70">
            Create a new application with a unique ID and descriptive name.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div class="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
            <p class="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-4">
          {/* Name Input */}
          <div>
            <label for="app-name" class="block text-sm font-medium text-base-content mb-1">
              Name *
            </label>
            <input
              id="app-name"
              type="text"
              value={formData.name}
              onInput={(e) => handleNameChange((e.target as HTMLInputElement).value)}
              placeholder="My Awesome App"
              class="input input-bordered w-full"
              disabled={loading}
              required
            />
          </div>

          {/* ID Input */}
          <div>
            <label for="app-id" class="block text-sm font-medium text-base-content mb-1">
              ID *
            </label>
            <input
              id="app-id"
              type="text"
              value={formData.id}
              onInput={(e) => setFormData({ ...formData, id: (e.target as HTMLInputElement).value })}
              placeholder="my-awesome-app"
              class="input input-bordered w-full font-mono text-sm"
              disabled={loading}
              pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
              title="Must be in kebab-case format (lowercase letters, numbers, and hyphens)"
              required
            />
            <p class="text-xs text-base-content/60 mt-1">
              Unique identifier in kebab-case format
            </p>
          </div>

          {/* Description Input */}
          <div>
            <label for="app-description" class="block text-sm font-medium text-base-content mb-1">
              Description
            </label>
            <textarea
              id="app-description"
              value={formData.description}
              onInput={(e) => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
              placeholder="A brief description of your application..."
              class="textarea textarea-bordered w-full h-20 resize-none"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div class="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              class="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={loading || !formData.name || !formData.id}
              class="flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span class="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus class="w-4 h-4" />
                  Create
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}