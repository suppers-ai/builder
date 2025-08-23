import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { getCurrentUser, getCurrentUserId, getAuthClient } from "../lib/auth.ts";
import { storageApi } from "../lib/storage-api.ts";
import type { StorageObject } from "../types/storage.ts";
import { Button } from "@suppers/ui-lib";

export default function StorageDashboardIsland() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<StorageObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authClient = getAuthClient();
      const authenticated = authClient.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = await getCurrentUser();
        setUser(userData);
        console.log("User authenticated:", userData);
      }
    };
    
    checkAuth();
  }, []);

  // Load storage data when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log("Authenticated user detected, loading storage data");
      loadStorageData();
    }
  }, [isAuthenticated, user]);

  const loadStorageData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Loading storage data...");
      const data = await storageApi.getStorageObjects(currentFolderId || undefined);
      console.log("Loaded items:", data);
      setItems(data);
    } catch (err: any) {
      console.error("Failed to load storage:", err);
      let errorMessage = "Failed to load storage";
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        // Check if message is a string or object
        if (typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err.message?.message) {
          errorMessage = err.message.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;
    
    try {
      await storageApi.createFolder(folderName, currentFolderId || undefined);
      await loadStorageData();
    } catch (err: any) {
      console.error("Failed to create folder:", err);
      let errorMessage = "Failed to create folder";
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        // Check if message is a string or object
        if (typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err.message?.message) {
          errorMessage = err.message.message;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleUploadFile = () => {
    alert("File upload will be implemented soon");
  };

  const handleRefresh = () => {
    loadStorageData();
  };

  const navigateToFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    loadStorageData();
  };

  const goBack = () => {
    setCurrentFolderId(null);
    loadStorageData();
  };

  if (!isAuthenticated) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-4">Please log in</h2>
          <p class="text-gray-600">You need to be logged in to access storage</p>
        </div>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="loading loading-spinner loading-lg"></div>
          <p class="mt-4">Loading your storage...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="container mx-auto p-4">
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-2">Your Storage Dashboard</h1>
        <p class="text-gray-600">Welcome back! Manage your files and folders here.</p>
      </div>

      {error && (
        <div class="alert alert-error mb-4">
          <span>{error}</span>
          <button onClick={() => setError(null)} class="btn btn-sm btn-ghost">✕</button>
        </div>
      )}

      <div class="flex gap-2 mb-6">
        {currentFolderId && (
          <Button onClick={goBack} class="btn-outline btn-sm">
            ← Back
          </Button>
        )}
        <Button onClick={handleCreateFolder} class="btn-primary btn-sm">
          📁 New Folder
        </Button>
        <Button onClick={handleUploadFile} class="btn-primary btn-sm">
          📤 Upload Files
        </Button>
        <Button onClick={handleRefresh} class="btn-outline btn-sm" disabled={isLoading}>
          🔄 Refresh
        </Button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <div class="col-span-full text-center py-12">
            <div class="text-6xl mb-4">📁</div>
            <h3 class="text-lg font-semibold mb-2">This folder is empty</h3>
            <p class="text-gray-600 mb-4">
              Start by creating a folder or uploading some files.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              class="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => item.object_type === "folder" && navigateToFolder(item.id)}
            >
              <div class="card-body">
                <div class="text-4xl mb-2">
                  {item.object_type === "folder" ? "📁" : "📄"}
                </div>
                <h2 class="card-title text-sm">{item.name}</h2>
                <p class="text-xs text-gray-500">
                  {item.object_type === "folder" ? "Folder" : `File (${item.file_size || 0} bytes)`}
                </p>
                <div class="card-actions justify-end mt-2">
                  <button class="btn btn-xs btn-ghost">⋮</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isLoading && items.length > 0 && (
        <div class="fixed bottom-4 right-4 bg-base-100 shadow-lg rounded-lg p-4">
          <div class="loading loading-spinner loading-sm"></div>
          <span class="ml-2">Updating...</span>
        </div>
      )}
    </div>
  );
}