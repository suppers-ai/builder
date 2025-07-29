/**
 * Application Manager Island
 * Manages generated applications with list, download, and delete functionality
 */

import { useSignal, useSignalEffect } from "@preact/signals";
import { Table, Button, Badge, Alert, Modal, Card } from "@suppers/ui-lib";
import { compilerService } from "../lib/compiler-service.ts";
import type { GenerationResult } from "@suppers/shared";

export interface GeneratedApplication {
  name: string;
  path: string;
  createdAt: Date;
  size: string;
  status: "ready" | "error" | "missing";
  downloadUrl?: string;
}

export interface ApplicationManagerProps {
  /** Callback when user wants to create a new application */
  onCreateNew?: () => void;
  /** Callback when application list changes */
  onApplicationsChange?: (applications: GeneratedApplication[]) => void;
}

export default function ApplicationManager({
  onCreateNew,
  onApplicationsChange,
}: ApplicationManagerProps) {
  const applications = useSignal<GeneratedApplication[]>([]);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const deleteModal = useSignal<{ open: boolean; app?: GeneratedApplication }>({ open: false });
  const downloadingApps = useSignal<Set<string>>(new Set());

  // Load applications on mount
  useSignalEffect(() => {
    loadApplications();
  });

  // Notify parent when applications change
  useSignalEffect(() => {
    onApplicationsChange?.(applications.value);
  });

  const loadApplications = async () => {
    try {
      loading.value = true;
      error.value = null;

      // Get list of generated applications
      const apps = await getGeneratedApplications();
      applications.value = apps;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load applications";
    } finally {
      loading.value = false;
    }
  };

  const getGeneratedApplications = async (): Promise<GeneratedApplication[]> => {
    const apps: GeneratedApplication[] = [];
    const basePath = "apps/generated";

    try {
      // Check if the generated apps directory exists
      const entries = Deno.readDir(basePath);
      
      for await (const entry of entries) {
        if (entry.isDirectory) {
          const appPath = `${basePath}/${entry.name}`;
          
          try {
            const stat = await Deno.stat(appPath);
            const size = await getDirectorySize(appPath);
            
            apps.push({
              name: entry.name,
              path: appPath,
              createdAt: stat.mtime || new Date(),
              size: formatFileSize(size),
              status: "ready",
            });
          } catch (error) {
            // If we can't stat the directory, mark it as error
            apps.push({
              name: entry.name,
              path: appPath,
              createdAt: new Date(),
              size: "Unknown",
              status: "error",
            });
          }
        }
      }
    } catch (error) {
      // If the directory doesn't exist, return empty array
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }

    // Sort by creation date (newest first)
    return apps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getDirectorySize = async (path: string): Promise<number> => {
    let size = 0;
    
    try {
      for await (const entry of Deno.readDir(path)) {
        const entryPath = `${path}/${entry.name}`;
        
        if (entry.isDirectory) {
          size += await getDirectorySize(entryPath);
        } else {
          const stat = await Deno.stat(entryPath);
          size += stat.size;
        }
      }
    } catch (error) {
      // If we can't read the directory, return 0
      console.warn(`Could not calculate size for ${path}:`, error);
    }
    
    return size;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleDownload = async (app: GeneratedApplication) => {
    try {
      downloadingApps.value = new Set([...downloadingApps.value, app.name]);

      // Create a mock GenerationResult for the download
      const result: GenerationResult = {
        success: true,
        applicationName: app.name,
        outputPath: app.path,
      };

      const downloadUrl = await compilerService.createDownloadUrl(result);
      
      // In a real implementation, this would trigger a file download
      // For now, we'll just show the path
      alert(`Download URL: ${downloadUrl}\n\nIn a real implementation, this would download the application as a ZIP file.`);
      
    } catch (error) {
      alert(`Failed to create download: ${error instanceof Error ? error.message : error}`);
    } finally {
      downloadingApps.value = new Set([...downloadingApps.value].filter(name => name !== app.name));
    }
  };

  const handleDelete = async (app: GeneratedApplication) => {
    try {
      const success = await compilerService.cleanupApplication(app.name);
      
      if (success) {
        // Remove from list
        applications.value = applications.value.filter(a => a.name !== app.name);
        deleteModal.value = { open: false };
      } else {
        alert("Failed to delete application. Please try again.");
      }
    } catch (error) {
      alert(`Failed to delete application: ${error instanceof Error ? error.message : error}`);
    }
  };

  const getStatusBadge = (status: GeneratedApplication["status"]) => {
    switch (status) {
      case "ready":
        return <Badge variant="success">Ready</Badge>;
      case "error":
        return <Badge variant="error">Error</Badge>;
      case "missing":
        return <Badge variant="warning">Missing</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading.value) {
    return (
      <Card>
        <div class="card-body">
          <div class="flex items-center justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
            <span class="ml-3">Loading applications...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (error.value) {
    return (
      <Card>
        <div class="card-body">
          <Alert variant="error">
            <div>
              <h4 class="font-semibold">Failed to Load Applications</h4>
              <p class="text-sm mt-1">{error.value}</p>
            </div>
          </Alert>
          
          <div class="card-actions justify-end mt-4">
            <Button variant="ghost" onClick={loadApplications}>
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold">Generated Applications</h2>
          <p class="text-base-content/70 mt-1">
            Manage your generated applications
          </p>
        </div>
        
        {onCreateNew && (
          <Button variant="primary" onClick={onCreateNew}>
            Create New Application
          </Button>
        )}
      </div>

      {/* Applications List */}
      {applications.value.length === 0 ? (
        <Card>
          <div class="card-body text-center py-12">
            <div class="text-6xl mb-4">📱</div>
            <h3 class="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p class="text-base-content/70 mb-6">
              You haven't generated any applications yet. Create your first application to get started.
            </p>
            
            {onCreateNew && (
              <Button variant="primary" onClick={onCreateNew}>
                Create Your First Application
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div class="card-body">
            <Table>
              <thead>
                <tr>
                  <th>Application Name</th>
                  <th>Status</th>
                  <th>Size</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.value.map((app) => (
                  <tr key={app.name}>
                    <td>
                      <div>
                        <div class="font-medium">{app.name}</div>
                        <div class="text-sm text-base-content/70">{app.path}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td class="text-sm">{app.size}</td>
                    <td class="text-sm">{formatDate(app.createdAt)}</td>
                    <td>
                      <div class="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={app.status !== "ready" || downloadingApps.value.has(app.name)}
                          onClick={() => handleDownload(app)}
                        >
                          {downloadingApps.value.has(app.name) ? (
                            <>
                              <span class="loading loading-spinner loading-xs mr-1"></span>
                              Downloading...
                            </>
                          ) : (
                            "Download"
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="error"
                          onClick={() => deleteModal.value = { open: true, app }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.value.open}
        onClose={() => deleteModal.value = { open: false }}
      >
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Delete Application</h3>
          
          <p class="mb-6">
            Are you sure you want to delete "{deleteModal.value.app?.name}"? 
            This action cannot be undone and will permanently remove all generated files.
          </p>
          
          <div class="modal-action">
            <Button
              variant="ghost"
              onClick={() => deleteModal.value = { open: false }}
            >
              Cancel
            </Button>
            
            <Button
              variant="error"
              onClick={() => deleteModal.value.app && handleDelete(deleteModal.value.app)}
            >
              Delete Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}