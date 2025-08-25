import { useState, useEffect } from "preact/hooks";
import { Button, Input, Logo } from "@suppers/ui-lib";
import type { StorageObject } from "../types/storage.ts";
import { storageApi } from "../lib/storage-api.ts";
import { getAuthClient, getCurrentUserId } from "../lib/auth.ts";
import ContextMenu from "../components/ContextMenu.tsx";
import EmojiPicker from "../components/EmojiPicker.tsx";
import SimpleAuthButton from "./SimpleAuthButton.tsx";
import ShareManagerIsland from "./ShareManagerIsland.tsx";
import ShareListIsland from "./ShareListIsland.tsx";

interface SortedStorageLayoutProps {
  initialPath?: string;
}

export default function SortedStorageLayout({ initialPath = "" }: SortedStorageLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<StorageObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null, name: string }>>([
    { id: null, name: "Home" }
  ]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: StorageObject } | null>(null);
  const [storageUsed, setStorageUsed] = useState({ used: 0, total: 15000 }); // MB
  const [userStorageLimit, setUserStorageLimit] = useState<number>(15000); // MB, default 15GB
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderTree, setFolderTree] = useState<StorageObject[]>([]);
  const [homeExpanded, setHomeExpanded] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<StorageObject | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    display_date: "",
    emoji: ""
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareListModalOpen, setShareListModalOpen] = useState(false);
  const [sharingItem, setSharingItem] = useState<StorageObject | null>(null);
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadStorageData();
      loadFolderTree();
    }
  }, [isAuthenticated, currentFolderId]);

  const checkAuth = async () => {
    try {
      const authClient = getAuthClient();
      const session = await authClient.getSession();
      const userId = getCurrentUserId();

      if (session && userId) {
        setIsAuthenticated(true);
        // Use getUser instead of getCurrentUser
        const userData = await authClient.getUser();
        setUser(userData || { id: userId, email: session.user?.email });
        
        // Set storage limit from user data if available
        if (userData?.storage_limit) {
          setUserStorageLimit(userData.storage_limit / (1024 * 1024)); // Convert bytes to MB
        }
        if (userData?.storage_used) {
          setStorageUsed(prev => ({ ...prev, used: userData.storage_used / (1024 * 1024) }));
        }

        // Navigate to dashboard if on home page
        if (window.location.pathname === '/') {
          window.location.href = '/dashboard';
        }
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

      // Calculate storage used
      const totalSize = data.reduce((sum, item) => sum + (item.file_size || 0), 0);
      setStorageUsed(prev => ({ ...prev, used: Math.round(totalSize / (1024 * 1024)) }));

      setError(null);
    } catch (err: any) {
      console.error("Failed to load storage:", err);
      setError(err?.message || "Failed to load storage");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolderTree = async () => {
    try {
      // Load all folders for the tree view
      const allItems = await storageApi.getStorageObjects();
      const folders = allItems.filter(item => item.object_type === "folder");
      setFolderTree(folders);
    } catch (err: any) {
      console.error("Failed to load folder tree:", err);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      await storageApi.createFolder(folderName, currentFolderId || undefined);
      await loadStorageData();
    } catch (err: any) {
      setError(err?.message || "Failed to create folder");
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
      } catch (err: any) {
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
        setError(`Failed to delete: ${err.message || err}`);
      }
    }
  };

  const handleShare = (item: StorageObject) => {
    setSharingItem(item);
    setShareModalOpen(true);
  };

  const handleViewShares = (item: StorageObject) => {
    setSharingItem(item);
    setShareListModalOpen(true);
  };

  const handleEdit = (item: StorageObject) => {
    if (item.object_type === "folder") {
      setEditingFolder(item);
      setEditFormData({
        name: item.name,
        description: item.metadata?.description || "",
        display_date: item.metadata?.display_date || "",
        emoji: item.metadata?.emoji || ""
      });
      setEditModalOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingFolder) return;

    try {
      await storageApi.updateStorageObject(editingFolder.id, {
        name: editFormData.name,
        metadata: {
          ...editingFolder.metadata,
          description: editFormData.description,
          display_date: editFormData.display_date,
          emoji: editFormData.emoji
        }
      });
      setEditModalOpen(false);
      setEditingFolder(null);
      await loadStorageData();
      await loadFolderTree();
    } catch (err: any) {
      setError(`Failed to update folder: ${err.message || err}`);
    }
  };

  const handleDownload = async (item: StorageObject) => {
    if (item.object_type === "folder") {
      setError("Folder download not yet supported");
      return;
    }

    try {
      const authClient = getAuthClient();
      const accessToken = await authClient.getAccessToken();
      const apiUrl = "http://localhost:54321/functions/v1";
      const downloadUrl = `${apiUrl}/api/v1/storage/sorted-storage/${item.file_path}`;

      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err: any) {
      setError(`Failed to download: ${err.message || err}`);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredItems.filter(item => item.object_type === "folder");
  const files = filteredItems.filter(item => item.object_type === "file");

  // Separate media files
  const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'mp4', 'webm'];
  const mediaFiles = files.filter(file => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ext && mediaExtensions.includes(ext);
  });
  const regularFiles = files.filter(file => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return !ext || !mediaExtensions.includes(ext);
  });

  const storagePercentage = Math.min(100, (storageUsed.used / storageUsed.total) * 100);

  if (!isAuthenticated) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-base-300">
        <div class="card bg-base-100 shadow-xl p-8">
          <h2 class="text-2xl font-bold text-base-content mb-4">Sign in to access your storage</h2>
          <SimpleAuthButton />
        </div>
      </div>
    );
  }

  return (
    <div class="flex h-screen bg-base-300 overflow-hidden">
      {/* Sidebar */}
      <aside class="w-72 bg-base-300 flex flex-col">
        {/* Logo and Search */}
        <div class="pt-6 pl-4 pr-0 pb-4 flex items-center gap-8">
          <Logo
            variant="long"
            class="h-8"
            lightSrc="/logos/long_light.svg"
            darkSrc="/logos/long_dark.svg"
          />
          <button
            onClick={() => setShowSearchModal(true)}
            class="flex-1 relative text-left"
          >
            <div class="w-full pl-8 pr-2 py-1.5 text-sm bg-base-200 border border-base-300 rounded-lg hover:border-primary transition-colors cursor-pointer">
              <span class="text-base-content/50">Search...</span>
            </div>
            <svg
              class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Navigation Card */}
        <div class="pl-4 pr-0 flex-1 flex flex-col">
          <div class="bg-base-200 rounded-xl p-4 flex-1 flex flex-col">
            {/* Folder Tree Navigation */}
            <nav class="space-y-1 flex-1 overflow-y-auto">
              {/* Home */}
              <div
                class={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                  currentFolderId === null ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-300 text-base-content'
                }`}
              >
                <div
                  onClick={() => setHomeExpanded(!homeExpanded)}
                  class="p-0.5 hover:bg-base-300 rounded cursor-pointer"
                >
                  <svg 
                    class={`w-3 h-3 transition-transform ${homeExpanded ? 'rotate-90' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <button 
                  onClick={() => {
                    setCurrentFolderId(null);
                    setBreadcrumbs([{ id: null, name: "Home" }]);
                  }}
                  class="flex-1 flex items-center gap-2 text-left"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span class="flex-1">Home</span>
                </button>
              </div>
              
              {/* Folder Tree - Only show when Home is expanded */}
              {homeExpanded && (
                <div class="ml-4">
                  {folderTree.filter(folder => !folder.parent_folder_id).map((folder) => (
                    <div key={folder.id}>
                      <div
                        class={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                          currentFolderId === folder.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-300 text-base-content'
                        }`}
                      >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolder(folder.id);
                      }}
                      class="p-0.5 hover:bg-base-300 rounded cursor-pointer"
                    >
                      <svg 
                        class={`w-3 h-3 transition-transform ${expandedFolders.has(folder.id) ? 'rotate-90' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <button
                      onClick={() => navigateToFolder(folder)}
                      class="flex-1 flex items-center gap-2 text-left"
                    >
                      {folder.metadata?.emoji ? (
                        <span class="text-base">{folder.metadata.emoji}</span>
                      ) : (
                        <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                        </svg>
                      )}
                      <span class="flex-1 text-sm">{folder.name}</span>
                    </button>
                  </div>
                  
                  {/* Sub-folders */}
                  {expandedFolders.has(folder.id) && (
                    <div class="ml-4">
                      {folderTree.filter(subFolder => subFolder.parent_folder_id === folder.id).map((subFolder) => (
                        <button
                          key={subFolder.id}
                          onClick={() => navigateToFolder(subFolder)}
                          class={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                            currentFolderId === subFolder.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-300 text-base-content'
                          }`}
                        >
                          <div class="w-3"></div>
                          {subFolder.metadata?.emoji ? (
                            <span class="text-base">{subFolder.metadata.emoji}</span>
                          ) : (
                            <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                            </svg>
                          )}
                          <span class="flex-1 text-left text-sm">{subFolder.name}</span>
                        </button>
                      ))}
                    </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </nav>

            {/* Spacer */}
            <div class="flex-1"></div>

            {/* Storage Card */}
            <div class="mt-4 p-3 bg-base-300 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-base-content">Used Space</span>
                <button class="text-xs text-primary font-semibold hover:underline cursor-pointer">
                  UPGRADE
                </button>
              </div>
              <div class="w-full bg-base-100 rounded-full h-2 mb-2">
                <div 
                  class="bg-primary h-2 rounded-full transition-all duration-300"
                  style={`width: ${Math.min(100, (storageUsed.used / userStorageLimit) * 100)}%`}
                ></div>
              </div>
              <div class="text-xs text-base-content/70">
                {(storageUsed.used / 1024).toFixed(2)}GB of {(userStorageLimit / 1024).toFixed(0)}GB
              </div>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div class="p-4 border-t border-base-200">
          <SimpleAuthButton />
        </div>
      </aside>

      {/* Main Content */}
      <div class="flex-1 flex flex-col p-6">
        <div class="card bg-base-100 shadow-xl flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header class="border-b border-base-200 px-6 py-4">
            <div class="flex items-center justify-between">
              {/* Breadcrumbs */}
              <div class="flex items-center gap-3">
                {/* Back Button - Only show when not at home */}
                {currentFolderId && (
                  <button 
                    onClick={() => {
                      // Go to parent folder or home
                      if (breadcrumbs.length > 1) {
                        navigateToBreadcrumb(breadcrumbs.length - 2);
                      } else {
                        navigateToBreadcrumb(0);
                      }
                    }}
                    class="btn btn-ghost btn-sm btn-circle"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                {/* Home Link */}
                <button 
                  onClick={() => navigateToBreadcrumb(0)} 
                  class="text-base-content/70 hover:text-base-content transition-colors font-medium"
                >
                  Home
                </button>
                
                {/* Parent Folders Dropdown - Only show when we have parent folders */}
                {currentFolderId && breadcrumbs.length > 2 && (
                  <>
                    <svg class="w-4 h-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    
                    <div class="dropdown dropdown-bottom">
                      <button tabIndex={0} class="btn btn-ghost btn-xs">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="2"/>
                          <circle cx="12" cy="12" r="2"/>
                          <circle cx="19" cy="12" r="2"/>
                        </svg>
                      </button>
                      <div tabIndex={0} class="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200">
                        {breadcrumbs.slice(1, -1).map((crumb, index) => (
                          <button
                            key={index}
                            onClick={() => navigateToBreadcrumb(index + 1)}
                            class="w-full text-left px-3 py-2 hover:bg-base-200 rounded-lg transition-colors text-sm"
                          >
                            {crumb.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                {/* Current Folder Name */}
                {currentFolderId && breadcrumbs.length > 1 && (
                  <>
                    <svg class="w-4 h-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span class="text-base-content font-semibold">
                      {breadcrumbs[breadcrumbs.length - 1].name}
                    </span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div class="flex items-center gap-2">
                {currentFolderId && (
                  <button 
                    onClick={() => {
                      const currentFolder = folderTree.find(item => item.id === currentFolderId);
                      if (currentFolder) handleEdit(currentFolder);
                    }}
                    class="btn btn-ghost btn-sm"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Folder
                  </button>
                )}
                <button class="btn btn-ghost btn-sm">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684 0m2.684 0a3 3 0 01-2.684 0M6.316 10.658a3 3 0 100 2.684" />
                  </svg>
                  Share
                </button>
                <button 
                  onClick={() => setNewItemModalOpen(true)}
                  class="btn btn-primary btn-sm"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div class="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div class="flex items-center justify-center h-96">
                <div class="text-center">
                  <div class="loading loading-spinner loading-lg text-primary"></div>
                  <p class="mt-4 text-base-content/60">Loading your files...</p>
                </div>
              </div>
            ) : error ? (
              <div class="alert alert-error">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            ) : (
              <div class="space-y-8">
                {/* Folders Section */}
                {folders.length > 0 && (
                  <section>
                    <h3 class="text-sm font-medium text-base-content/60 mb-3">Folders</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          class="bg-base-200 rounded-lg p-4 cursor-pointer hover:bg-base-300 transition-colors group relative"
                          onDblClick={() => navigateToFolder(folder)}
                          onContextMenu={(e) => handleContextMenu(e, folder)}
                        >
                          <div class="flex flex-col items-center">
                            {folder.metadata?.emoji ? (
                              <div class="text-4xl mb-2">{folder.metadata.emoji}</div>
                            ) : (
                              <svg class="w-12 h-12 text-primary mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
                              </svg>
                            )}
                            <div class="text-sm text-base-content text-center truncate w-full">{folder.name}</div>
                            {folder.metadata?.display_date && (
                              <div class="text-xs text-base-content/60 mt-1">{folder.metadata.display_date}</div>
                            )}
                          </div>
                          <button class="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-circle">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Files Section */}
                {regularFiles.length > 0 && (
                  <section>
                    <h3 class="text-sm font-medium text-base-content/60 mb-3">Files</h3>
                    <div class="grid grid-cols-1 gap-2">
                      {regularFiles.map((file) => (
                        <div
                          key={file.id}
                          class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer group"
                          onContextMenu={(e) => handleContextMenu(e, file)}
                        >
                          <svg class="w-8 h-8 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div class="flex-1">
                            <div class="font-medium text-base-content">{file.name}</div>
                            <div class="text-xs text-base-content/60">
                              {formatFileSize(file.file_size || 0)} • Modified {new Date(file.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                          <button class="p-2 opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-circle">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Media Section */}
                {mediaFiles.length > 0 && (
                  <section>
                    <h3 class="text-sm font-medium text-base-content/60 mb-3">Media</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {mediaFiles.map((file) => (
                        <div
                          key={file.id}
                          class="bg-base-200 rounded-lg overflow-hidden cursor-pointer hover:bg-base-300 transition-colors group"
                          onContextMenu={(e) => handleContextMenu(e, file)}
                        >
                          <div class="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <span class="text-3xl">
                              {file.mime_type?.startsWith('image/') ? '🖼️' :
                                file.mime_type?.startsWith('video/') ? '🎬' : '🎵'}
                            </span>
                          </div>
                          <div class="p-2">
                            <div class="text-xs text-base-content truncate">{file.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty State */}
                {filteredItems.length === 0 && (
                  <div class="flex flex-col items-center justify-center h-96">
                    <svg class="w-24 h-24 text-base-content/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 class="text-xl font-semibold mb-2 text-base-content">
                      {searchQuery ? "No matching files or folders" : "This folder is empty"}
                    </h3>
                    <p class="text-base-content/60 mb-6">
                      {searchQuery ? "Try a different search term" : "Create a folder or upload files to get started"}
                    </p>
                    {!searchQuery && (
                      <div class="flex gap-3">
                        <button onClick={handleCreateFolder} class="btn btn-primary">
                          Create Folder
                        </button>
                        <button onClick={handleUploadFile} class="btn btn-ghost">
                          Upload Files
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
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
            {
              label: "Share",
              icon: "🔗",
              action: () => handleShare(contextMenu.item)
            },
            {
              label: "Manage Shares",
              icon: "🔐",
              action: () => handleViewShares(contextMenu.item)
            },
            contextMenu.item.object_type === "folder" ? {
              label: "Edit Settings",
              icon: "⚙️",
              action: () => handleEdit(contextMenu.item)
            } : null,
            {
              label: "Rename",
              icon: "✏️",
              action: () => handleRename(contextMenu.item)
            },
            {
              label: "Download",
              icon: "⬇️",
              action: () => handleDownload(contextMenu.item)
            },
            {
              label: "Delete",
              icon: "🗑️",
              action: () => handleDelete(contextMenu.item)
            }
          ].filter(Boolean)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div class="modal modal-open">
          <div class="modal-box max-w-2xl">
            <h3 class="font-bold text-lg mb-4">Search Files</h3>

            {/* Search Input */}
            <div class="relative mb-4">
              <input
                type="text"
                placeholder="Type to search files and folders..."
                value={searchQuery}
                onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                class="input input-bordered w-full pl-10"
                autoFocus
              />
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Results */}
            <div class="max-h-96 overflow-y-auto">
              {searchQuery ? (
                filteredItems.length > 0 ? (
                  <div class="space-y-2">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.object_type === "folder") {
                            navigateToFolder(item);
                          }
                          setShowSearchModal(false);
                          setSearchQuery("");
                        }}
                        class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors text-left"
                      >
                        {item.object_type === "folder" ? (
                          item.metadata?.emoji ? (
                            <span class="text-xl">{item.metadata.emoji}</span>
                          ) : (
                            <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
                            </svg>
                          )
                        ) : (
                          <svg class="w-5 h-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        <div class="flex-1">
                          <div class="font-medium">{item.name}</div>
                          <div class="text-xs text-base-content/60">
                            {item.object_type === "folder" ? "Folder" : formatFileSize(item.file_size || 0)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div class="text-center py-8 text-base-content/60">
                    No files or folders found matching "{searchQuery}"
                  </div>
                )
              ) : (
                <div class="text-center py-8 text-base-content/60">
                  Start typing to search...
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div class="modal-action">
              <button
                class="btn btn-ghost"
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery("");
                }}
              >
                Close
              </button>
            </div>
          </div>
          <div
            class="modal-backdrop bg-black/50"
            onClick={() => {
              setShowSearchModal(false);
              setSearchQuery("");
            }}
          ></div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {editModalOpen && editingFolder && (
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Edit Folder Settings</h3>
            
            <div class="space-y-4">
              {/* Folder Name */}
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Folder Name</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onInput={(e) => setEditFormData({...editFormData, name: (e.target as HTMLInputElement).value})}
                  class="input input-bordered w-full"
                  placeholder="Enter folder name"
                />
              </div>

              {/* Description */}
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Description</span>
                </label>
                <textarea
                  value={editFormData.description}
                  onInput={(e) => setEditFormData({...editFormData, description: (e.target as HTMLTextAreaElement).value})}
                  class="textarea textarea-bordered w-full"
                  placeholder="Enter folder description"
                  rows={3}
                />
              </div>

              {/* Display Date */}
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Display Date</span>
                </label>
                <input
                  type="date"
                  value={editFormData.display_date}
                  onInput={(e) => setEditFormData({...editFormData, display_date: (e.target as HTMLInputElement).value})}
                  class="input input-bordered w-full"
                />
              </div>

              {/* Emoji Picker */}
              <EmojiPicker
                value={editFormData.emoji}
                onChange={(emoji) => setEditFormData({...editFormData, emoji})}
                placeholder="Select an emoji for this folder"
              />
              {editFormData.emoji && (
                <div class="mt-2 p-4 bg-base-200 rounded-lg text-center">
                  <span class="text-4xl">{editFormData.emoji}</span>
                  <p class="text-sm text-base-content/60 mt-2">This will replace the folder icon</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div class="modal-action">
              <button
                class="btn btn-ghost"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingFolder(null);
                }}
              >
                Cancel
              </button>
              <button
                class="btn btn-primary"
                onClick={handleSaveEdit}
                disabled={!editFormData.name.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
          <div
            class="modal-backdrop bg-black/50"
            onClick={() => {
              setEditModalOpen(false);
              setEditingFolder(null);
            }}
          ></div>
        </div>
      )}

      {/* New Item Modal */}
      {newItemModalOpen && (
        <div class="modal modal-open">
          <div class="modal-box max-w-md">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg">Add Item</h3>
              <button
                onClick={() => setNewItemModalOpen(false)}
                class="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              {/* Folder Option */}
              <button
                onClick={() => {
                  setNewItemModalOpen(false);
                  handleCreateFolder();
                }}
                class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer p-6 text-center"
              >
                <div class="flex flex-col items-center gap-3">
                  <svg class="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span class="font-medium">folder</span>
                </div>
              </button>

              {/* File Option */}
              <button
                onClick={() => {
                  setNewItemModalOpen(false);
                  handleUploadFile();
                }}
                class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer p-6 text-center"
              >
                <div class="flex flex-col items-center gap-3">
                  <svg class="w-12 h-12 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="font-medium">file</span>
                </div>
              </button>
            </div>
          </div>
          <div
            class="modal-backdrop bg-black/50"
            onClick={() => setNewItemModalOpen(false)}
          ></div>
        </div>
      )}

      {/* Share Modal */}
      {sharingItem && (
        <ShareManagerIsland
          storageObject={sharingItem}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSharingItem(null);
          }}
          onShareCreated={() => {
            // Optional: refresh the list or show a success message
          }}
          onShareRevoked={() => {
            // Optional: refresh the list or show a success message
          }}
        />
      )}

      {/* Share List Modal */}
      {sharingItem && (
        <ShareListIsland
          storageObject={sharingItem}
          isOpen={shareListModalOpen}
          onClose={() => {
            setShareListModalOpen(false);
            setSharingItem(null);
          }}
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