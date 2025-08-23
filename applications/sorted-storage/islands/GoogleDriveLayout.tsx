import { useState, useEffect } from "preact/hooks";
import { Button } from "@suppers/ui-lib";
import type { StorageObject } from "../types/storage.ts";
import { storageApi } from "../lib/storage-api.ts";
import { getAuthClient, getCurrentUserId } from "../lib/auth.ts";
import ContextMenu from "../components/ContextMenu.tsx";

interface ViewMode {
  type: "list" | "grid";
}

export default function GoogleDriveLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<StorageObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode["type"]>("list");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id: string | null, name: string}>>([
    { id: null, name: "My Drive" }
  ]);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, item: StorageObject} | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadStorageData();
    }
  }, [isAuthenticated, currentFolderId]);

  const checkAuth = async () => {
    try {
      const authClient = getAuthClient();
      const session = await authClient.getSession();
      const userId = getCurrentUserId();
      
      if (session && userId) {
        setIsAuthenticated(true);
        setUser({ id: userId });
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    }
  };

  const loadStorageData = async () => {
    try {
      setIsLoading(true);
      const data = await storageApi.getStorageObjects(currentFolderId || undefined);
      setItems(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load storage:", err);
      let errorMessage = "Failed to load storage";
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
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
      setShowNewMenu(false);
    } catch (err: any) {
      console.error("Failed to create folder:", err);
      let errorMessage = "Failed to create folder";
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
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
    setShowNewMenu(false);
  };

  const navigateToFolder = (folder: StorageObject) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleContextMenu = (e: MouseEvent, item: StorageObject) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleRename = (item: StorageObject) => {
    const newName = prompt("Enter new name:", item.name);
    if (newName && newName !== item.name) {
      // TODO: Implement rename
      alert(`Rename ${item.name} to ${newName} - Coming soon!`);
    }
  };

  const handleDelete = (item: StorageObject) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      // TODO: Implement delete
      alert(`Delete ${item.name} - Coming soon!`);
    }
  };

  const handleShare = (item: StorageObject) => {
    alert(`Share ${item.name} - Coming soon!`);
  };

  const handleDownload = (item: StorageObject) => {
    alert(`Download ${item.name} - Coming soon!`);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredItems.filter(item => item.object_type === "folder");
  const files = filteredItems.filter(item => item.object_type === "file");

  if (!isAuthenticated) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-4">Please log in</h2>
          <p class="text-gray-600">You need to be logged in to access storage</p>
        </div>
      </div>
    );
  }

  return (
    <div class="flex h-screen bg-white">
      {/* Sidebar */}
      <div class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div class="p-4">
          <div class="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              class="w-full bg-white border border-gray-300 rounded-full px-6 py-3 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="font-medium">New</span>
            </button>
            
            {showNewMenu && (
              <div class="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleCreateFolder}
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7c0-1.1.9-2 2-2h4l2 2h8c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>New folder</span>
                </button>
                <hr class="my-2 border-gray-200" />
                <button
                  onClick={handleUploadFile}
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none">
                    <path d="M7 18l5-5 5 5M12 13V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>File upload</span>
                </button>
                <button
                  onClick={handleUploadFile}
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7c0-1.1.9-2 2-2h4l2 2h8c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7z" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 12l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>Folder upload</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <nav class="flex-1 px-2">
          <button class="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-200 rounded-lg text-left">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>My Drive</span>
          </button>
          
          <button class="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-200 rounded-lg text-left">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Recent</span>
          </button>
          
          <button class="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-200 rounded-lg text-left">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Starred</span>
          </button>
          
          <button class="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-200 rounded-lg text-left">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Trash</span>
          </button>
        </nav>
        
        <div class="p-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            <div>Storage used</div>
            <div class="mt-2 bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: 15%"></div>
            </div>
            <div class="mt-1 text-xs">3.5 GB of 25 GB used</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="flex-1 flex flex-col">
        {/* Header */}
        <header class="border-b border-gray-200 px-4 py-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center flex-1 max-w-2xl">
              <button class="p-2 hover:bg-gray-100 rounded-lg">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search in Drive"
                value={searchQuery}
                onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                class="flex-1 px-4 py-2 bg-gray-100 rounded-lg ml-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="flex items-center gap-2 ml-4">
              <button class="p-2 hover:bg-gray-100 rounded-lg">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              
              <div class="flex items-center border-l border-gray-300 pl-2">
                <button
                  onClick={() => setViewMode("list")}
                  class={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  class={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div class="px-4 py-2 flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} class="flex items-center gap-2">
              {index > 0 && <span class="text-gray-400">›</span>}
              <button
                onClick={() => navigateToBreadcrumb(index)}
                class="hover:bg-gray-100 px-2 py-1 rounded"
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div class="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span class="text-red-700">{error}</span>
            <button onClick={() => setError(null)} class="text-red-700 hover:bg-red-100 p-1 rounded">
              ✕
            </button>
          </div>
        )}

        {/* Content Area */}
        <div class="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div class="flex items-center justify-center h-full">
              <div class="text-center">
                <div class="loading loading-spinner loading-lg"></div>
                <p class="mt-4 text-gray-600">Loading your files...</p>
              </div>
            </div>
          ) : viewMode === "list" ? (
            <div class="space-y-1">
              {/* List Header */}
              <div class="flex items-center px-4 py-2 text-sm text-gray-600 border-b">
                <div class="flex-1 flex items-center gap-2">
                  <input type="checkbox" class="rounded" />
                  <span>Name</span>
                </div>
                <div class="w-32">Owner</div>
                <div class="w-32">Last modified</div>
                <div class="w-24">File size</div>
              </div>
              
              {/* Folders */}
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-lg"
                  onDblClick={() => navigateToFolder(folder)}
                  onContextMenu={(e) => handleContextMenu(e, folder)}
                >
                  <div class="flex-1 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(folder.id)}
                      onChange={() => toggleItemSelection(folder.id)}
                      onClick={(e) => e.stopPropagation()}
                      class="rounded"
                    />
                    <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                    </svg>
                    <span class="font-medium">{folder.name}</span>
                  </div>
                  <div class="w-32 text-sm text-gray-600">me</div>
                  <div class="w-32 text-sm text-gray-600">
                    {new Date(folder.updated_at).toLocaleDateString()}
                  </div>
                  <div class="w-24 text-sm text-gray-600">—</div>
                </div>
              ))}
              
              {/* Files */}
              {files.map((file) => (
                <div
                  key={file.id}
                  class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer rounded-lg"
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <div class="flex-1 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(file.id)}
                      onChange={() => toggleItemSelection(file.id)}
                      onClick={(e) => e.stopPropagation()}
                      class="rounded"
                    />
                    <svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <span>{file.name}</span>
                  </div>
                  <div class="w-32 text-sm text-gray-600">me</div>
                  <div class="w-32 text-sm text-gray-600">
                    {new Date(file.updated_at).toLocaleDateString()}
                  </div>
                  <div class="w-24 text-sm text-gray-600">
                    {formatFileSize(file.file_size || 0)}
                  </div>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <div class="text-center py-12">
                  <svg class="w-24 h-24 mx-auto text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                  </svg>
                  <h3 class="mt-4 text-lg font-medium text-gray-900">
                    {searchQuery ? "No matching files or folders" : "This folder is empty"}
                  </h3>
                  <p class="mt-2 text-gray-500">
                    {searchQuery ? "Try a different search term" : "Create a folder or upload files to get started"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div class="grid grid-cols-5 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  class="p-4 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200"
                  onDblClick={() => navigateToFolder(folder)}
                  onContextMenu={(e) => handleContextMenu(e, folder)}
                >
                  <div class="flex justify-center mb-2">
                    <svg class="w-12 h-12 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                    </svg>
                  </div>
                  <div class="text-center text-sm truncate">{folder.name}</div>
                </div>
              ))}
              
              {files.map((file) => (
                <div
                  key={file.id}
                  class="p-4 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200"
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <div class="flex justify-center mb-2">
                    <svg class="w-12 h-12 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <div class="text-center text-sm truncate">{file.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: contextMenu.item.object_type === "folder" ? "Open" : "Preview",
              icon: "👁",
              action: () => {
                if (contextMenu.item.object_type === "folder") {
                  navigateToFolder(contextMenu.item);
                } else {
                  alert(`Preview ${contextMenu.item.name} - Coming soon!`);
                }
              }
            },
            { divider: true },
            {
              label: "Share",
              icon: "🔗",
              action: () => handleShare(contextMenu.item)
            },
            {
              label: "Rename",
              icon: "✏️",
              action: () => handleRename(contextMenu.item)
            },
            { divider: true },
            {
              label: "Download",
              icon: "⬇️",
              action: () => handleDownload(contextMenu.item)
            },
            { divider: true },
            {
              label: "Delete",
              icon: "🗑️",
              action: () => handleDelete(contextMenu.item)
            }
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}