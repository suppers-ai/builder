import { useState, useEffect } from "preact/hooks";
import { Button, Alert } from "@suppers-ai/ui-lib";
import { Copy, Download, Globe, Link, Shield, AlertTriangle } from "lucide-preact";
import type { Recording } from "../types/recorder.ts";
import { formatFileSize, formatDate } from "../lib/recorder-utils.ts";

interface ShareModalProps {
  recording: Recording | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (recording: Recording) => void;
}

interface ShareUrls {
  publicUrl?: string;
  tokenUrl?: string;
}

export default function ShareModal({
  recording,
  isOpen,
  onClose,
  onDownload,
}: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrls, setShareUrls] = useState<ShareUrls>({});
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  // Load current sharing state when modal opens
  useEffect(() => {
    if (isOpen && recording) {
      loadCurrentSharingState();
    }
  }, [isOpen, recording]);

  if (!isOpen || !recording) return null;

  const API_BASE_URL = 'http://127.0.0.1:54321/functions/v1/api/v1';

  // Get auth client for making requests
  const getAuthHeaders = async () => {
    const authClient = (await import("../lib/auth.ts")).getAuthClient();
    const accessToken = await authClient.getAccessToken();
    const userId = authClient.getUserId();
    
    if (!accessToken || !userId) {
      throw new Error('Authentication required');
    }
    
    return {
      'Authorization': `Bearer ${accessToken}`,
      'X-User-ID': userId,
      'Content-Type': 'application/json'
    };
  };

  const loadCurrentSharingState = async () => {
    try {
      const headers = await getAuthHeaders();
      const filename = recording.filePath.split('/').pop();
      
      // Fetch current sharing state from the database via API
      const response = await fetch(`${API_BASE_URL}/storage/recorder/${filename}`, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Get the actual current state from the database
          const dbData = result.data;
          const isCurrentlyPublic = dbData.isPublic || false;
          const currentShareToken = dbData.shareToken || null;
          
          setIsPublic(isCurrentlyPublic);
          setShareToken(currentShareToken);
          
          // Generate URLs based on current database state
          const urls: ShareUrls = {};
          if (isCurrentlyPublic) {
            urls.publicUrl = `http://localhost:8002/share/public/recorder/${filename}`;
          }
          if (currentShareToken) {
            urls.tokenUrl = `http://localhost:8002/share/${currentShareToken}`;
          }
          setShareUrls(urls);
        }
      }
    } catch (err) {
      console.error('Failed to load sharing state:', err);
    }
  };

  const handleShareAction = async (action: 'create_token' | 'remove_token' | 'make_public' | 'make_private' | 'make_private_only') => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const filename = recording.filePath.split('/').pop();
      
      const response = await fetch(`${API_BASE_URL}/storage/recorder/${filename}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error(`Share failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setIsPublic(result.data.isPublic);
        setShareToken(result.data.shareToken);
        setShareUrls(result.data.shareUrls || {});
      } else {
        throw new Error('Failed to update sharing settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sharing');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-lg w-full m-4 relative z-10">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield class="w-5 h-5" />
          Share: {recording.name}
        </h3>
        
        <div class="space-y-6">
          {/* Recording Details */}
          <div class="bg-base-200 p-4 rounded-lg space-y-2">
            <div class="flex justify-between">
              <span class="font-medium">Name:</span>
              <span class="text-sm">{recording.name}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Size:</span>
              <span class="text-sm">{formatFileSize(recording.size)}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Created:</span>
              <span class="text-sm">{formatDate(recording.createdAt)}</span>
            </div>
          </div>

          {error && (
            <Alert color="error">
              <AlertTriangle class="w-4 h-4" />
              <span>{error}</span>
            </Alert>
          )}

          {/* Sharing Options */}
          <div class="space-y-4">
            <h4 class="font-medium">Sharing Options</h4>
            
            {/* Public Sharing */}
            <div class="border border-base-300 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <Globe class="w-4 h-4" />
                  <span class="font-medium">Public Access</span>
                </div>
                <label class="flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={() => handleShareAction(isPublic ? 'make_private_only' : 'make_public')}
                    disabled={loading}
                    class="toggle toggle-primary"
                  />
                </label>
              </div>
              
              {isPublic && (
                <>
                  <Alert color="warning" class="mb-3 flex items-center gap-2">
                    <div class="flex items-center gap-2">
                      <AlertTriangle class="w-4 h-4" />
                      <span class="text-sm">
                        Your recording is public.
                      </span>
                    </div>
                  </Alert>
                  
                  {shareUrls.publicUrl && (
                    <div class="flex gap-2">
                      <input
                        type="text"
                        value={shareUrls.publicUrl}
                        readonly
                        class="input input-sm flex-1 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(shareUrls.publicUrl!)}
                      >
                        <Copy class="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              <p class="text-sm text-base-content/60 mt-2">
                Public files can be viewed by anyone with the link and will be cached by browsers.
              </p>
            </div>

            {/* Token-based Sharing */}
            <div class="border border-base-300 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <Link class="w-4 h-4" />
                  <span class="font-medium">Private Link</span>
                </div>
                <Button
                  size="sm"
                  variant={shareToken ? "outline" : "default"}
                  onClick={() => handleShareAction(shareToken ? 'remove_token' : 'create_token')}
                  disabled={loading}
                >
                  {shareToken ? 'Remove Link' : 'Create Link'}
                </Button>
              </div>
              
              {shareToken && shareUrls.tokenUrl && (
                <div class="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={shareUrls.tokenUrl}
                    readonly
                    class="input input-sm flex-1 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(shareUrls.tokenUrl!)}
                  >
                    <Copy class="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              <p class="text-sm text-base-content/60">
                Be careful with who you share this link with. Anyone with the link can view this recording.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div class="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              onClick={() => onDownload(recording)}
              class="flex items-center gap-2"
            >
              <Download class="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}