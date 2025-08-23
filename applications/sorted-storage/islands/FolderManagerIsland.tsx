/**
 * Folder management island for folder operations
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { useCallback, useEffect, useState } from "preact/hooks";
import { storageApi } from "../lib/storage-api.ts";
import { ItemMetadataEditor } from "../components/ItemMetadataEditor.tsx";
import type {
  BreadcrumbItem,
  FolderStructure,
  StorageMetadata,
  StorageObject,
} from "../types/storage.ts";
import type { StorageError } from "../types/errors.ts";
import { Alert, Button, Card, Input, Loading, Modal } from "@suppers/ui-lib";

interface FolderManagerProps {
  currentFolderId?: string;
  onFolderCreated?: (folder: StorageObject) => void;
  onFolderUpdated?: (folder: StorageObject) => void;
  onFolderDeleted?: (folderId: string) => void;
  onNavigate?: (folderId: string | null) => void;
  className?: string;
}

interface FolderManagerState {
  // Data
  currentFolder: StorageObject | null;
  folderStructure: FolderStructure | null;

  // UI State
  isLoading: boolean;
  error: StorageError | null;

  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;

  // Form states
  folderToEdit: StorageObject | null;
  folderToDelete: StorageObject | null;
  createFormData: {
    name: string;
    description: string;
    emoji: string;
  };
}

export default function FolderManagerIsland({
  currentFolderId,
  onFolderCreated,
  onFolderUpdated,
  onFolderDeleted,
  onNavigate,
  className = "",
}: FolderManagerProps) {
  const [state, setState] = useState<FolderManagerState>({
    currentFolder: null,
    folderStructure: null,
    isLoading: false,
    error: null,
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    folderToEdit: null,
    folderToDelete: null,
    createFormData: {
      name: "",
      description: "",
      emoji: "📁",
    },
  });

  // Load folder structure when currentFolderId changes
  useEffect(() => {
    if (currentFolderId !== undefined) {
      loadFolderStructure(currentFolderId);
    }
  }, [currentFolderId]);

  // Load folder structure
  const loadFolderStructure = useCallback(async (folderId?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const structure = await storageApi.getFolderStructure(folderId || undefined);

      setState((prev) => ({
        ...prev,
        folderStructure: structure,
        currentFolder: structure?.folder || null,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to load folder structure:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as StorageError,
      }));
    }
  }, []);

  // Create folder handler
  const handleCreateFolder = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showCreateModal: true,
      createFormData: {
        name: "",
        description: "",
        emoji: "📁",
      },
    }));
  }, []);

  // Submit create folder
  const submitCreateFolder = useCallback(async () => {
    const { name, description, emoji } = state.createFormData;

    if (!name.trim()) {
      setState((prev) => ({
        ...prev,
        error: {
          type: "validation",
          message: "Folder name is required",
          recoverable: true,
          timestamp: new Date().toISOString(),
        },
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const metadata: Partial<StorageMetadata> = {
        description: description.trim() || undefined,
        emoji: emoji || "📁",
        custom_name: name.trim(),
      };

      const newFolder = await storageApi.createFolder(
        name.trim(),
        currentFolderId || undefined,
        metadata,
      );

      setState((prev) => ({
        ...prev,
        showCreateModal: false,
        isLoading: false,
        createFormData: {
          name: "",
          description: "",
          emoji: "📁",
        },
      }));

      // Reload folder structure
      await loadFolderStructure(currentFolderId);

      // Notify parent component
      onFolderCreated?.(newFolder);
    } catch (error) {
      console.error("Failed to create folder:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as StorageError,
      }));
    }
  }, [state.createFormData, currentFolderId, loadFolderStructure, onFolderCreated]);

  // Edit folder handler
  const handleEditFolder = useCallback((folder: StorageObject) => {
    setState((prev) => ({
      ...prev,
      folderToEdit: folder,
      showEditModal: true,
    }));
  }, []);

  // Submit folder edit
  const submitEditFolder = useCallback(async (updatedMetadata: StorageMetadata) => {
    if (!state.folderToEdit) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const updatedFolder = await storageApi.updateStorageObject(
        state.folderToEdit.id,
        {
          name: updatedMetadata.custom_name || state.folderToEdit.name,
          metadata: updatedMetadata,
        },
      );

      setState((prev) => ({
        ...prev,
        showEditModal: false,
        folderToEdit: null,
        isLoading: false,
      }));

      // Reload folder structure
      await loadFolderStructure(currentFolderId);

      // Notify parent component
      onFolderUpdated?.(updatedFolder);
    } catch (error) {
      console.error("Failed to update folder:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as StorageError,
      }));
    }
  }, [state.folderToEdit, currentFolderId, loadFolderStructure, onFolderUpdated]);

  // Delete folder handler
  const handleDeleteFolder = useCallback((folder: StorageObject) => {
    setState((prev) => ({
      ...prev,
      folderToDelete: folder,
      showDeleteModal: true,
    }));
  }, []);

  // Submit folder deletion
  const submitDeleteFolder = useCallback(async () => {
    if (!state.folderToDelete) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await storageApi.deleteStorageObject(state.folderToDelete.id);

      setState((prev) => ({
        ...prev,
        showDeleteModal: false,
        folderToDelete: null,
        isLoading: false,
      }));

      // Reload folder structure
      await loadFolderStructure(currentFolderId);

      // Notify parent component
      onFolderDeleted?.(state.folderToDelete.id);
    } catch (error) {
      console.error("Failed to delete folder:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as StorageError,
      }));
    }
  }, [state.folderToDelete, currentFolderId, loadFolderStructure, onFolderDeleted]);

  // Navigation handler
  const handleNavigateToFolder = useCallback((folder: StorageObject) => {
    onNavigate?.(folder.id);
  }, [onNavigate]);

  // Navigate to parent folder
  const handleNavigateUp = useCallback(() => {
    if (state.currentFolder?.parent_id) {
      onNavigate?.(state.currentFolder.parent_id);
    } else {
      onNavigate?.(null); // Navigate to root
    }
  }, [state.currentFolder, onNavigate]);

  // Form handlers
  const updateCreateFormData = useCallback(
    (field: keyof typeof state.createFormData, value: string) => {
      setState((prev) => ({
        ...prev,
        createFormData: {
          ...prev.createFormData,
          [field]: value,
        },
      }));
    },
    [],
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Cancel modals
  const cancelCreateModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showCreateModal: false,
      createFormData: {
        name: "",
        description: "",
        emoji: "📁",
      },
    }));
  }, []);

  const cancelEditModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showEditModal: false,
      folderToEdit: null,
    }));
  }, []);

  const cancelDeleteModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showDeleteModal: false,
      folderToDelete: null,
    }));
  }, []);

  return (
    <div class={`folder-manager ${className}`}>
      {/* Error Display */}
      {state.error && (
        <Alert class="alert-error mb-4">
          <div class="flex justify-between items-center">
            <span>{state.error.message}</span>
            <Button class="btn-sm btn-ghost" onClick={clearError}>
              ✕
            </Button>
          </div>
        </Alert>
      )}

      {/* Folder Actions */}
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          {/* Up Navigation Button */}
          {state.currentFolder && state.currentFolder.id !== "root" && (
            <Button
              class="btn-ghost btn-sm"
              onClick={handleNavigateUp}
              disabled={state.isLoading}
            >
              ↑ Up
            </Button>
          )}

          {/* Current Folder Info */}
          {state.currentFolder && (
            <div class="flex items-center gap-2">
              <span class="text-lg">
                {state.currentFolder.metadata.emoji || "📁"}
              </span>
              <span class="font-medium">
                {state.currentFolder.metadata.custom_name || state.currentFolder.name}
              </span>
              {state.folderStructure && (
                <span class="text-sm text-base-content/70">
                  ({state.folderStructure.itemCount} items)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div class="flex items-center gap-2">
          <Button
            class="btn-primary btn-sm"
            onClick={handleCreateFolder}
            disabled={state.isLoading}
          >
            📁 New Folder
          </Button>

          {state.currentFolder && state.currentFolder.id !== "root" && (
            <>
              <Button
                class="btn-outline btn-sm"
                onClick={() => handleEditFolder(state.currentFolder!)}
                disabled={state.isLoading}
              >
                ✏️ Edit
              </Button>

              <Button
                class="btn-error btn-sm"
                onClick={() => handleDeleteFolder(state.currentFolder!)}
                disabled={state.isLoading}
              >
                🗑️ Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Folder Contents */}
      {state.isLoading && (
        <div class="flex justify-center py-8">
          <Loading size="lg" />
        </div>
      )}

      {state.folderStructure && !state.isLoading && (
        <div class="space-y-2">
          {/* Folders */}
          {state.folderStructure.children
            .filter((item) => item.object_type === "folder")
            .map((folder) => (
              <Card key={folder.id} class="p-4 hover:bg-base-200 cursor-pointer transition-colors">
                <div class="flex items-center justify-between">
                  <div
                    class="flex items-center gap-3 flex-1"
                    onClick={() =>
                      handleNavigateToFolder(folder)}
                  >
                    <span class="text-2xl">
                      {folder.metadata.emoji || "📁"}
                    </span>
                    <div class="flex-1">
                      <div class="font-medium">
                        {folder.metadata.custom_name || folder.name}
                      </div>
                      {folder.metadata.description && (
                        <div class="text-sm text-base-content/70">
                          {folder.metadata.description}
                        </div>
                      )}
                      <div class="text-xs text-base-content/50">
                        Created {new Date(folder.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <Button
                      class="btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFolder(folder);
                      }}
                    >
                      ✏️
                    </Button>
                    <Button
                      class="btn-ghost btn-sm text-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder);
                      }}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

          {/* Empty State */}
          {state.folderStructure.children.filter((item) => item.object_type === "folder").length ===
              0 && (
            <div class="text-center py-8">
              <div class="text-4xl mb-2">📁</div>
              <p class="text-base-content/70">No folders in this location</p>
              <Button class="btn-outline btn-sm mt-2" onClick={handleCreateFolder}>
                Create First Folder
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal
        open={state.showCreateModal}
        onClose={cancelCreateModal}
        title="Create New Folder"
      >
        <div class="space-y-4">
          <div>
            <label class="label">
              <span class="label-text">Folder Name *</span>
            </label>
            <Input
              type="text"
              placeholder="Enter folder name"
              value={state.createFormData.name}
              onInput={(e) => updateCreateFormData("name", (e.target as HTMLInputElement).value)}
              class="w-full"
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <Input
              type="text"
              placeholder="Optional description"
              value={state.createFormData.description}
              onInput={(e) =>
                updateCreateFormData("description", (e.target as HTMLInputElement).value)}
              class="w-full"
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text">Emoji</span>
            </label>
            <Input
              type="text"
              placeholder="📁"
              value={state.createFormData.emoji}
              onInput={(e) => updateCreateFormData("emoji", (e.target as HTMLInputElement).value)}
              class="w-full"
            />
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <Button class="btn-ghost" onClick={cancelCreateModal}>
              Cancel
            </Button>
            <Button
              class="btn-primary"
              onClick={submitCreateFolder}
              disabled={!state.createFormData.name.trim() || state.isLoading}
            >
              {state.isLoading ? <Loading size="sm" /> : "Create Folder"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Folder Modal */}
      <Modal
        open={state.showEditModal}
        onClose={cancelEditModal}
        title="Edit Folder"
      >
        {state.folderToEdit && (
          <ItemMetadataEditor
            item={state.folderToEdit}
            isOpen={state.showEditModal}
            onClose={cancelEditModal}
            onSave={submitEditFolder}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={state.showDeleteModal}
        onClose={cancelDeleteModal}
        title="Delete Folder"
      >
        {state.folderToDelete && (
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="text-3xl">
                {state.folderToDelete.metadata.emoji || "📁"}
              </span>
              <div>
                <div class="font-medium">
                  {state.folderToDelete.metadata.custom_name || state.folderToDelete.name}
                </div>
                {state.folderToDelete.metadata.description && (
                  <div class="text-sm text-base-content/70">
                    {state.folderToDelete.metadata.description}
                  </div>
                )}
              </div>
            </div>

            <Alert class="alert-warning">
              <div>
                <h3 class="font-bold">Warning</h3>
                <div class="text-sm">
                  This will permanently delete the folder and all its contents. This action cannot
                  be undone.
                </div>
              </div>
            </Alert>

            <div class="flex justify-end gap-2 pt-4">
              <Button class="btn-ghost" onClick={cancelDeleteModal}>
                Cancel
              </Button>
              <Button
                class="btn-error"
                onClick={submitDeleteFolder}
                disabled={state.isLoading}
              >
                {state.isLoading ? <Loading size="sm" /> : "Delete Folder"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
