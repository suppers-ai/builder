import { useState } from "preact/hooks";
import { Application } from "../payment/application.ts";
import { useApplications } from "../hooks/useApplications.ts";

interface ApplicationFormProps {
  application?: Application;
  onSave?: (application: Application) => void;
  onCancel?: () => void;
}

export default function ApplicationForm({ application, onSave, onCancel }: ApplicationFormProps) {
  const { createApplication, updateApplication, error } = useApplications();

  const [formData, setFormData] = useState({
    name: application?.name || "",
    description: application?.description || "",
    display_entities_with_tags: application?.display_entities_with_tags || [],
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (application) {
        result = await updateApplication(application.id, formData);
      } else {
        result = await createApplication(formData);
      }

      if (result) {
        onSave?.(result);
      }
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.displayPlaceWithTags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        display_entities_with_tags: [
          ...(prev.display_entities_with_tags as string[] || []),
          tagInput.trim(),
        ],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      display_entities_with_tags: (prev.display_entities_with_tags as string[] || []).filter((
        t: string,
      ) => t !== tag),
    }));
  };

  return (
    <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6">
        {application ? "Edit Application" : "Create New Application"}
      </h2>

      {error && (
        <div class="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} class="space-y-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Name *</span>
          </label>
          <input
            type="text"
            class="input input-bordered"
            value={formData.name}
            onInput={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: (e.target as HTMLInputElement).value,
              }))}
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea
            class="textarea textarea-bordered"
            rows={4}
            value={formData.description}
            onInput={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: (e.target as HTMLTextAreaElement).value,
              }))}
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Place Tags to Display</span>
            <span class="label-text-alt">
              Places with these tags will be available in this application
            </span>
          </label>
          <div class="flex gap-2 mb-2">
            <input
              type="text"
              class="input input-bordered flex-1"
              placeholder="Add a tag (e.g., accommodation, hotel, restaurant)"
              value={tagInput}
              onInput={(e) => setTagInput((e.target as HTMLInputElement).value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <button
              type="button"
              class="btn btn-primary"
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              Add
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            {(formData.display_entities_with_tags as string[] || []).map((tag: string) => (
              <span key={tag} class="badge badge-secondary gap-2">
                {tag}
                <button
                  type="button"
                  class="btn btn-ghost btn-xs"
                  onClick={() =>
                    removeTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {formData.displayPlaceWithTags.length === 0 && (
            <div class="text-sm text-gray-500 mt-2">
              No tags specified - all places will be available
            </div>
          )}
        </div>

        <div class="flex gap-4 justify-end">
          <button
            type="button"
            class="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? "Saving..." : (application ? "Update Application" : "Create Application")}
          </button>
        </div>
      </form>
    </div>
  );
}
