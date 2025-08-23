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
    { id: null, name: "My Drive" }
  ]);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, item: StorageObject} | null>(null);

  // Sidebar configuration
  const sidebarConfig = {
    sections: [
      {
        title: "",
        items: [
          {
            id: "my-drive",
            label: "My Drive",
            icon: (
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            ),
            isActive: true,
            onClick: () => {
              setCurrentFolderId(null);
              setBreadcrumbs([{ id: null, name: "My Drive" }]);
            }
          },
          {
            id: "recent",
            label: "Recent",
            icon: (
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            ),
            onClick: () => alert("Recent files - Coming soon!")
          },
          {
            id: "starred",
            label: "Starred",
            icon: (
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            ),
            onClick: () => alert("Starred files - Coming soon!")
          },
          {
            id: "trash",
            label: "Trash",
            icon: (
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            ),
            onClick: () => alert("Trash - Coming soon!")
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
      alert(`Rename ${item.name} to ${newName} - Coming soon!`);
    }
  };

  const handleDelete = (item: StorageObject) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      alert(`Delete ${item.name} - Coming soon!`);
    }
  };

  const handleShare = (item: StorageObject) => {
    setSelectedShareItem(item);
    setShowShareModal(true);
  };

  const handleDownload = (item: StorageObject) => {
    alert(`Download ${item.name} - Coming soon!`);
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
            message="You need to be logged in to access storage"
            icon="🔐"
          />
        </Card>
      </div>
    );
  }

  return (
    <div class="flex h-screen bg-white">
      {/* Sidebar */}
      <div class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div class="p-4">
          <Dropdown
            trigger={
              <Button 
                variant="outline" 
                size="lg"
                class="w-full justify-start gap-3"
              >
                <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span class="font-medium">New</span>
              </Button>
            }
            align="left"
          >
            <div class="py-2 min-w-[200px]">
              <button
                onClick={handleCreateFolder}
                class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
              >
                <span>📁</span>
                <span>New folder</span>
              </button>
              <div class="divider my-1"></div>
              <button
                onClick={handleUploadFile}
                class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
              >
                <span>📤</span>
                <span>File upload</span>
              </button>
              <button
                onClick={handleUploadFile}
                class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
              >
                <span>📁</span>
                <span>Folder upload</span>
              </button>
            </div>
          </Dropdown>
        </div>
        
        <div class="flex-1 px-2">
          <CustomSidebar {...sidebarConfig} />
        </div>
        
        <div class="p-4 border-t border-gray-200">
          <MetricCard
            title="Storage used"
            value={`${formatFileSize(totalSize)}`}
            subtitle={`of 25 GB used`}
            trend={{ value: storageUsedPercent, isPositive: storageUsedPercent < 80 }}
            class="bg-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div class="flex-1 flex flex-col">
        {/* Header */}
        <header class="border-b border-gray-200 px-4 py-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center flex-1 max-w-2xl gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchModal(true)}
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </Button>
              <Input
                type="text"
                placeholder="Search in Drive"
                value={searchQuery}
                onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                class="flex-1"
              />
            </div>
            
            <div class="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </Button>
              
              <div class="flex items-center border-l border-gray-300 pl-2">
                <Button
                  variant={viewMode === "list" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </Button>
                <Button
                  variant={viewMode === "grid" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div class="px-4 py-2 flex items-center gap-2 text-sm">
          <nav class="breadcrumbs">
            <ul>
              {breadcrumbs.map((crumb, index) => (
                <li key={index}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToBreadcrumb(index)}
                  >
                    {crumb.name}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div class="px-4">
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {/* Status Bar */}
        <div class="px-4 py-2 flex items-center justify-between bg-gray-50 border-b">
          <div class="flex items-center gap-4">
            <Badge variant="info">{totalFiles} files</Badge>
            <Badge variant="info">{totalFolders} folders</Badge>
            {selectedItems.size > 0 && (
              <Badge variant="primary">{selectedItems.size} selected</Badge>
            )}
          </div>
          <div class="flex items-center gap-2">
            <LoadingButton
              loading={isLoading}
              onClick={loadStorageData}
              variant="ghost"
              size="sm"
            >
              Refresh
            </LoadingButton>
          </div>
        </div>

        {/* Content Area */}
        <div class="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div class="flex items-center justify-center h-full">
              <Card class="p-8">
                <div class="text-center">
                  <div class="loading loading-spinner loading-lg"></div>
                  <p class="mt-4 text-gray-600">Loading your files...</p>
                </div>
              </Card>
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title={searchQuery ? "No matching files or folders" : "This folder is empty"}
              message={searchQuery ? "Try a different search term" : "Create a folder or upload files to get started"}
              icon="📁"
              action={
                !searchQuery && (
                  <Button variant="primary" onClick={handleCreateFolder}>
                    Create New Folder
                  </Button>
                )
              }
            />
          ) : viewMode === "list" ? (
            <div class="space-y-1">
              {/* List Header */}
              <div class="flex items-center px-4 py-2 text-sm text-gray-600 border-b font-medium">
                <div class="flex-1 flex items-center gap-2">
                  <input type="checkbox" class="checkbox checkbox-sm" />
                  <span>Name</span>
                </div>
                <div class="w-32">Owner</div>
                <div class="w-32">Last modified</div>
                <div class="w-24">File size</div>
              </div>
              
              {/* Folders */}
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onDblClick={() => navigateToFolder(folder)}
                  onContextMenu={(e) => handleContextMenu(e, folder)}
                >
                  <div class="flex-1 flex items-center gap-3">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      checked={selectedItems.has(folder.id)}
                      onChange={() => toggleItemSelection(folder.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span class="text-blue-500">📁</span>
                    <span class="font-medium">{folder.name}</span>
                  </div>
                  <div class="w-32 text-sm text-gray-600">me</div>
                  <div class="w-32 text-sm text-gray-600">
                    {new Date(folder.updated_at).toLocaleDateString()}
                  </div>
                  <div class="w-24 text-sm text-gray-600">—</div>
                </Card>
              ))}
              
              {/* Files */}
              {files.map((file) => (
                <Card
                  key={file.id}
                  class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <div class="flex-1 flex items-center gap-3">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      checked={selectedItems.has(file.id)}
                      onChange={() => toggleItemSelection(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span class="text-gray-500">📄</span>
                    <span>{file.name}</span>
                  </div>
                  <div class="w-32 text-sm text-gray-600">me</div>
                  <div class="w-32 text-sm text-gray-600">
                    {new Date(file.updated_at).toLocaleDateString()}
                  </div>
                  <div class="w-24 text-sm text-gray-600">
                    {formatFileSize(file.file_size || 0)}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  class="p-4 hover:shadow-lg cursor-pointer transition-shadow"
                  onDblClick={() => navigateToFolder(folder)}
                  onContextMenu={(e) => handleContextMenu(e, folder)}
                >
                  <div class="flex justify-center mb-2">
                    <span class="text-5xl text-blue-500">📁</span>
                  </div>
                  <div class="text-center text-sm truncate">{folder.name}</div>
                </Card>
              ))}
              
              {files.map((file) => (
                <Card
                  key={file.id}
                  class="p-4 hover:shadow-lg cursor-pointer transition-shadow"
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <div class="flex justify-center mb-2">
                    <span class="text-5xl text-gray-500">📄</span>
                  </div>
                  <div class="text-center text-sm truncate">{file.name}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
        placeholder="Search files and folders..."
      />

      {showShareModal && selectedShareItem && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedShareItem(null);
          }}
          itemName={selectedShareItem.name}
          onShare={(shareData) => {
            console.log("Share data:", shareData);
            alert(`Sharing ${selectedShareItem.name} - Coming soon!`);
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