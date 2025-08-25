/**
 * ShareListIsland - Component for displaying and managing shares
 * Shows all active shares for a storage object
 */

import { useEffect, useState } from "preact/hooks";
import { User, Mail, Globe, Clock, Trash2, Edit2, Shield } from "lucide-preact";
import type { StorageObject } from "../types/storage.ts";
import { getObjectShares, updateShare, removeShare } from "../lib/storage-api.ts";

interface ShareListProps {
  storageObject: StorageObject;
  isOpen: boolean;
  onClose: () => void;
}

interface Share {
  id: string;
  shared_with_user_id?: string;
  shared_with_email?: string;
  permission_level: "view" | "edit" | "admin";
  inherit_to_children: boolean;
  share_token?: string;
  is_public: boolean;
  expires_at?: string;
  created_at: string;
  created_by: string;
}

export default function ShareListIsland({
  storageObject,
  isOpen,
  onClose,
}: ShareListProps) {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingShare, setEditingShare] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && storageObject.id) {
      loadShares();
    }
  }, [isOpen, storageObject.id]);

  const loadShares = async () => {
    setLoading(true);
    try {
      const shareList = await getObjectShares(storageObject.id);
      setShares(shareList);
    } catch (err) {
      setError("Failed to load shares");
      console.error("Error loading shares:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (shareId: string, newLevel: "view" | "edit" | "admin") => {
    try {
      await updateShare(shareId, { permissionLevel: newLevel });
      await loadShares();
    } catch (err) {
      setError("Failed to update permission");
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!confirm("Are you sure you want to remove this share?")) return;
    
    try {
      await removeShare(shareId);
      await loadShares();
    } catch (err) {
      setError("Failed to remove share");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getPermissionColor = (level: string) => {
    switch (level) {
      case "admin": return "badge-error";
      case "edit": return "badge-warning";
      case "view": return "badge-info";
      default: return "badge-ghost";
    }
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-base-100 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div class="flex items-center justify-between p-6 border-b border-base-300">
          <h2 class="text-xl font-semibold flex items-center gap-2">
            <Shield class="w-6 h-6 text-primary" />
            Manage Shares for "{storageObject.name}"
          </h2>
          <button onClick={onClose} class="btn btn-ghost btn-sm">✕</button>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div class="flex justify-center p-8">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          ) : shares.length === 0 ? (
            <div class="text-center p-8 text-base-content/60">
              <Shield class="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No active shares for this {storageObject.object_type}</p>
            </div>
          ) : (
            <div class="space-y-4">
              {shares.map((share) => (
                <div key={share.id} class="card bg-base-200 shadow-sm">
                  <div class="card-body p-4">
                    <div class="flex items-start justify-between">
                      <div class="flex items-start gap-3">
                        {/* Icon */}
                        <div class="mt-1">
                          {share.is_public ? (
                            <Globe class="w-5 h-5 text-success" />
                          ) : share.shared_with_email ? (
                            <Mail class="w-5 h-5 text-info" />
                          ) : (
                            <User class="w-5 h-5 text-primary" />
                          )}
                        </div>
                        
                        {/* Share Info */}
                        <div class="flex-1">
                          <div class="font-medium">
                            {share.is_public ? (
                              "Public Link"
                            ) : share.shared_with_email ? (
                              share.shared_with_email
                            ) : (
                              "User Share"
                            )}
                          </div>
                          
                          <div class="flex items-center gap-4 mt-2 text-sm">
                            {/* Permission Level */}
                            {editingShare === share.id ? (
                              <select
                                class="select select-bordered select-sm"
                                value={share.permission_level}
                                onChange={(e) => {
                                  handleUpdatePermission(share.id, (e.target as HTMLSelectElement).value as any);
                                  setEditingShare(null);
                                }}
                              >
                                <option value="view">View</option>
                                <option value="edit">Edit</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <div class="flex items-center gap-2">
                                <span class={`badge ${getPermissionColor(share.permission_level)}`}>
                                  {share.permission_level}
                                </span>
                                <button
                                  onClick={() => setEditingShare(share.id)}
                                  class="btn btn-ghost btn-xs"
                                >
                                  <Edit2 class="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            
                            {/* Expiry */}
                            {share.expires_at && (
                              <div class="flex items-center gap-1 text-base-content/60">
                                <Clock class="w-4 h-4" />
                                <span>Expires {formatDate(share.expires_at)}</span>
                              </div>
                            )}
                            
                            {/* Inheritance */}
                            {share.inherit_to_children && storageObject.object_type === "folder" && (
                              <span class="badge badge-ghost badge-sm">
                                Inherited
                              </span>
                            )}
                          </div>
                          
                          {/* Share Link */}
                          {share.is_public && share.share_token && (
                            <div class="mt-2">
                              <input
                                type="text"
                                value={`${window.location.origin}/share/${share.share_token}`}
                                readonly
                                class="input input-bordered input-sm w-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <button
                        onClick={() => handleRemoveShare(share.id)}
                        class="btn btn-ghost btn-sm text-error"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {error && (
            <div class="alert alert-error mt-4">
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}