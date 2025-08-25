import { useState, useEffect } from "preact/hooks";
import { 
  Button, 
  Card, 
  Dropdown, 
  Input, 
  Modal,
  Badge,
  Alert,
  EmptyState,
  LoadingButton,
  ErrorState,
  MetricCard,
  SearchModal,
  ShareModal,
  CustomSidebar
} from "@suppers/ui-lib";
import type { StorageObject } from "../types/storage.ts";
import { storageApi } from "../lib/storage-api.ts";
import { getAuthClient, getCurrentUserId } from "../lib/auth.ts";
import ContextMenu from "../components/ContextMenu.tsx";
import SimpleAuthButton from "./SimpleAuthButton.tsx";
import config from "../../../config.ts";

interface ViewMode {
  type: "list" | "grid";
}

export default function DashboardLayout() {
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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShareItem, setSelectedShareItem] = useState<StorageObject | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id: string | null, name: string}>>([
    { id: null, name: "Home" }
  ]);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, item: StorageObject} | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Sidebar configuration
  const sidebarConfig = {
    sections: [
      {
        id: "navigation",
        title: "Navigation",
        defaultOpen: true,
        links: [
          {
            name: "My Drive",
            path: "#my-drive"
          },
          {
            name: "Recent",
            path: "#recent"
          },
          {
            name: "Starred",
            path: "#starred"
          },
          {
            name: "Trash",
            path: "#trash"
          }
        ]
      }
    ]
  };

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

  const handleUploadFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      try {
        setIsLoading(true);
        for (const file of Array.from(files)) {
          await storageApi.uploadFile(file, {
            currentFolderId: currentFolderId || undefined,
          });
        }
        await loadStorageData();
        setShowNewMenu(false);
      } catch (err: any) {
        console.error("Failed to upload files:", err);
        setError(`Failed to upload files: ${err.message || err}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    input.click();
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

  const handleRename = async (item: StorageObject) => {
    const newName = prompt("Enter new name:", item.name);
    if (newName && newName !== item.name) {
      try {
        await storageApi.updateStorageObject(item.id, { name: newName });
        await loadStorageData();
      } catch (err: any) {
        console.error("Failed to rename:", err);
        setError(`Failed to rename: ${err.message || err}`);
      }
    }
  };

  const handleDelete = async (item: StorageObject) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await storageApi.deleteStorageObject(item.id);
        await loadStorageData();
      } catch (err: any) {
        console.error("Failed to delete:", err);
        setError(`Failed to delete: ${err.message || err}`);
      }
    }
  };

  const handleShare = (item: StorageObject) => {
    setSelectedShareItem(item);
    setShowShareModal(true);
  };

  const handleDownload = async (item: StorageObject) => {
    if (item.object_type === "folder") {
      setError("Folder download not yet supported");
      return;
    }
    
    try {
      // Create a download link
      const authClient = getAuthClient();
      const accessToken = await authClient.getAccessToken();
      const apiUrl = config.apiUrl || "http://localhost:54321/functions/v1";
      const downloadUrl = `${apiUrl}/api/v1/storage/sorted-storage/${item.file_path}`;
      
      // Create a temporary link with auth
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.name;
      link.target = '_blank';
      
      // Add auth header via fetch and blob
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      link.href = blobUrl;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err: any) {
      console.error("Failed to download:", err);
      setError(`Failed to download: ${err.message || err}`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchModal(false);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredItems.filter(item => item.object_type === "folder");
  const files = filteredItems.filter(item => item.object_type === "file");
  
  // Separate media files from regular files
  const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'mp4', 'webm', 'mp3', 'wav'];
  const mediaFiles = files.filter(file => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ext && mediaExtensions.includes(ext);
  });
  const regularFiles = files.filter(file => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return !ext || !mediaExtensions.includes(ext);
  });

  // Calculate storage metrics
  const totalFiles = files.length;
  const totalFolders = folders.length;
  const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
  const storageUsedPercent = (totalSize / (25 * 1024 * 1024 * 1024)) * 100; // Assuming 25GB limit

  if (!isAuthenticated) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <Card class="p-8">
          <ErrorState
            title="Authentication Required"
            description="You need to be logged in to access storage"
            icon="🔐"
          />
        </Card>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header class="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div class="flex items-center justify-between">
          {/* Breadcrumbs */}
          <div class="flex items-center gap-2">
            <button onClick={() => navigateToBreadcrumb(0)} class="text-gray-400 hover:text-white">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} class="flex items-center">
                <span class="text-gray-500 mx-2">›</span>
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  class="text-gray-300 hover:text-white"
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div class="flex items-center gap-3">
            <Button
              variant={isEditMode ? "primary" : "ghost"}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              class="text-gray-300 hover:text-white"
            >
              <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              EDIT
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareModal(true)}
              class="text-gray-300 hover:text-white"
            >
              <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684 0m2.684 0a3 3 0 01-2.684 0M6.316 10.658a3 3 0 100 2.684" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              SHARE
            </Button>
            <Dropdown
              trigger={
                <Button variant="primary" size="sm" class="bg-orange-500 hover:bg-orange-600">
                  <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  NEW
                </Button>
              }
            >
              <div class="py-2 bg-gray-800 border border-gray-700 rounded-lg min-w-[200px]">
                <button
                  onClick={handleCreateFolder}
                  class="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3 text-gray-300"
                >
                  <span>📁</span>
                  <span>New Folder</span>
                </button>
                <button
                  onClick={handleUploadFile}
                  class="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3 text-gray-300"
                >
                  <span>📄</span>
                  <span>New File</span>
                </button>
              </div>
            </Dropdown>
            <div class="ml-4 border-l border-gray-700 pl-4">
              <SimpleAuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div class="p-6">
        {isLoading ? (
          <div class="flex items-center justify-center h-96">
            <div class="text-center">
              <div class="loading loading-spinner loading-lg"></div>
              <p class="mt-4 text-gray-400">Loading your files...</p>
            </div>
          </div>
        ) : error ? (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : (
          <div class="space-y-8">
            {/* Media Section */}
            {mediaFiles.length > 0 && (
              <section>
                <h2 class="text-lg font-semibold mb-4 text-gray-300">Media</h2>
                <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      class="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
                      onContextMenu={(e) => handleContextMenu(e, file)}
                    >
                      <div class="aspect-square bg-gray-700 flex items-center justify-center">
                        {file.mime_type?.startsWith('image/') ? (
                          <span class="text-4xl">🖼️</span>
                        ) : file.mime_type?.startsWith('video/') ? (
                          <span class="text-4xl">🎬</span>
                        ) : (
                          <span class="text-4xl">🎵</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Files Section */}
            {regularFiles.length > 0 && (
              <section>
                <h2 class="text-lg font-semibold mb-4 text-gray-300">Files</h2>
                <div class="space-y-2">
                  {regularFiles.map((file) => (
                    <div
                      key={file.id}
                      class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      onContextMenu={(e) => handleContextMenu(e, file)}
                    >
                      <span class="text-2xl">📄</span>
                      <div class="flex-1">
                        <div class="font-medium text-gray-200">{file.name}</div>
                        <div class="text-sm text-gray-500">
                          {formatFileSize(file.file_size || 0)} • Modified {new Date(file.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button class="p-2 hover:bg-gray-600 rounded">
                        <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Folders Section */}
            {folders.length > 0 && (
              <section>
                <h2 class="text-lg font-semibold mb-4 text-gray-300">Folders</h2>
                <div class="space-y-2">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      onDblClick={() => navigateToFolder(folder)}
                      onContextMenu={(e) => handleContextMenu(e, folder)}
                    >
                      <span class="text-2xl">📁</span>
                      <div class="flex-1">
                        <div class="font-medium text-gray-200">{folder.name}</div>
                        <div class="text-sm text-gray-500">
                          Modified {new Date(folder.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button class="p-2 hover:bg-gray-600 rounded">
                        <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <EmptyState
                title={searchQuery ? "No matching files or folders" : "This folder is empty"}
                description={searchQuery ? "Try a different search term" : "Create a folder or upload files to get started"}
                icon="📁"
                action={
                  !searchQuery && (
                    <Button variant="primary" onClick={handleCreateFolder}>
                      Create New Folder
                    </Button>
                  )
                }
              />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
        placeholder="Search files and folders..."
      />

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedShareItem(null);
          }}
          onShare={(shareData: any) => {
            console.log("Share data:", shareData);
            alert(`Sharing ${selectedShareItem?.name || "items"} - Coming soon!`);
            setShowShareModal(false);
            setSelectedShareItem(null);
          }}
        />
      )}

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
            {
              label: "divider",
              action: () => {},
              divider: true
            },
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
            {
              label: "divider",
              action: () => {},
              divider: true
            },
            {
              label: "Download",
              icon: "⬇️",
              action: () => handleDownload(contextMenu.item)
            },
            {
              label: "divider",
              action: () => {},
              divider: true
            },
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