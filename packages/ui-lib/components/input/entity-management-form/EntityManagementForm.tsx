import { useState } from "preact/hooks";
import { CreateEntityRequest, Entity, UpdateEntityRequest } from "@suppers/shared";
import { Button, Input, Modal, Textarea } from "../../../mod.ts";

export interface Application {
  id: string;
  name: string;
  status: string;
}

export interface EntityManagementFormProps {
  isOpen: boolean;
  onClose: () => void;
  entity?: Entity;
  applications?: Application[];
  onSave: (data: CreateEntityRequest | UpdateEntityRequest) => Promise<Entity | null>;
  onVariableManagerOpen?: (entityId?: string) => void;
  loading?: boolean;
}

export function EntityManagementForm({
  isOpen,
  onClose,
  entity,
  applications = [],
  onSave,
  onVariableManagerOpen,
  loading = false,
}: EntityManagementFormProps) {
  const [formData, setFormData] = useState({
    name: entity?.name || "",
    description: entity?.description || "",
    tags: entity?.tags || [],
    connected_application_ids: entity?.connected_application_ids || [],
  });

  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    try {
      let submitData;
      if (entity) {
        submitData = {
          name: formData.name,
          description: formData.description,
          tags: formData.tags as string[],
          connected_application_ids: formData.connected_application_ids as string[],
        } as UpdateEntityRequest;
      } else {
        submitData = {
          name: formData.name,
          description: formData.description,
          tags: formData.tags as string[],
          connected_application_ids: formData.connected_application_ids as string[],
        } as CreateEntityRequest;
      }

      const result = await onSave(submitData);
      if (result) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving entity:", error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const toggleApplication = (applicationId: string) => {
    const currentIds = formData.connected_application_ids as string[];
    const isSelected = currentIds.includes(applicationId);

    setFormData({
      ...formData,
      connected_application_ids: isSelected
        ? currentIds.filter((id) => id !== applicationId)
        : [...currentIds, applicationId],
    });
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">
          {entity ? "Edit Entity" : "Create New Entity"}
        </h2>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Entity Name</span>
          </label>
          <Input
            type="text"
            placeholder="Enter entity name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <Textarea
            placeholder="Enter entity description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
            rows={3}
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Tags</span>
          </label>
          <div class="flex gap-2 mb-2">
            <Input
              type="text"
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput((e.target as HTMLInputElement).value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button onClick={addTag} variant="outline" size="sm">
              Add
            </Button>
          </div>
          <div class="flex flex-wrap gap-2">
            {(formData.tags as string[]).map((tag) => (
              <span
                key={tag}
                class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary text-primary-content"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  class="ml-1 text-primary-content hover:text-error"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {applications.length > 0 && (
          <div class="form-control">
            <label class="label">
              <span class="label-text">Connected Applications</span>
            </label>
            <div class="space-y-2">
              {applications.map((app) => (
                <label key={app.id} class="cursor-pointer label">
                  <span class="label-text">{app.name}</span>
                  <input
                    type="checkbox"
                    class="checkbox"
                    checked={(formData.connected_application_ids as string[] || []).includes(
                      app.id,
                    )}
                    onChange={() => toggleApplication(app.id)}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {onVariableManagerOpen && (
          <div class="form-control">
            <label class="label">
              <span class="label-text">Variables</span>
            </label>
            <div class="flex justify-between items-center p-3 border border-base-300 rounded-lg">
              <div>
                <p class="text-sm">Manage custom variables for this entity</p>
                <p class="text-xs text-gray-500">Use in pricing formulas as entity.variable_name</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVariableManagerOpen(entity?.id)}
              >
                Manage Variables
              </Button>
            </div>
          </div>
        )}
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
        >
          {loading ? "Saving..." : (entity ? "Update Entity" : "Create Entity")}
        </Button>
      </div>
    </Modal>
  );
}
