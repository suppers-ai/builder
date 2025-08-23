import { useEffect, useState } from "preact/hooks";
import { Alert, Button } from "../../../components/mod.ts";
import { AlertTriangle, Copy, Download, Globe, Link, Mail, Shield, Users, X } from "lucide-preact";

export interface ShareItem {
  id: string;
  name: string;
  size?: number;
  createdAt: string | Date;
  filePath?: string;
}

export interface ShareModalProps {
  item: ShareItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (item: ShareItem) => void;
  applicationSlug: string;
  apiBaseUrl: string;
  sharePageBaseUrl: string;
  getAuthHeaders: () => Promise<Record<string, string>>;
  formatFileSize?: (bytes: number) => string;
  formatDate?: (date: string | Date) => string;
}

interface ShareUrls {
  publicUrl?: string;
  tokenUrl?: string;
}

interface EmailShareState {
  emails: string;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export default function ShareModal({
  item,
  isOpen,
  onClose,
  onDownload,
  applicationSlug,
  apiBaseUrl,
  sharePageBaseUrl,
  getAuthHeaders,
  formatFileSize = (bytes: number) => `${Math.round(bytes / 1024)} KB`,
  formatDate = (date: string | Date) => new Date(date).toLocaleDateString(),
}: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrls, setShareUrls] = useState<ShareUrls>({});
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [sharedWithEmails, setSharedWithEmails] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"public" | "email">("public");

  // Email sharing state
  const [emailShare, setEmailShare] = useState<EmailShareState>({
    emails: "",
    loading: false,
    error: null,
    success: false,
  });

  // Load current sharing state when modal opens
  useEffect(() => {
    if (isOpen && item) {
      loadCurrentSharingState();
    }
  }, [isOpen, item]);

  // Clear copy success message after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  if (!isOpen || !item) return null;

  const loadCurrentSharingState = async () => {
    try {
      const headers = await getAuthHeaders();
      const filename = item.filePath?.split("/").pop() || item.name;

      // Fetch current sharing state from the database via API
      const response = await fetch(`${apiBaseUrl}/storage/${applicationSlug}/${filename}`, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Get the actual current state from the database
          const dbData = result.data;
          const isCurrentlyPublic = dbData.isPublic || false;
          const currentShareToken = dbData.shareToken || null;
          const currentSharedEmails = dbData.sharedWithEmails || [];

          setIsPublic(isCurrentlyPublic);
          setShareToken(currentShareToken);
          setSharedWithEmails(currentSharedEmails);

          // Generate URLs based on current database state
          const urls: ShareUrls = {};
          if (isCurrentlyPublic) {
            urls.publicUrl = `${sharePageBaseUrl}/share/public/${applicationSlug}/${filename}`;
          }
          if (currentShareToken) {
            urls.tokenUrl = `${sharePageBaseUrl}/share/${currentShareToken}`;
          }
          setShareUrls(urls);
        }
      }
    } catch (err) {
      console.error("Failed to load sharing state:", err);
    }
  };

  const handleShareAction = async (
    action:
      | "create_token"
      | "remove_token"
      | "make_public"
      | "make_private"
      | "make_private_only"
      | "share_with_emails",
    emails?: string[],
  ) => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const filename = item.filePath?.split("/").pop() || item.name;

      const body = { action, ...(emails && { emails }) };

      const response = await fetch(`${apiBaseUrl}/storage/${applicationSlug}/${filename}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Share failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setIsPublic(result.data.isPublic);
        setShareToken(result.data.shareToken);
        setSharedWithEmails(result.data.sharedWithEmails || []);
        setShareUrls(result.data.shareUrls || {});
      } else {
        throw new Error("Failed to update sharing settings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update sharing");
    } finally {
      setLoading(false);
    }
  };

  const validateEmails = (emailsText: string): string[] => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = emailsText.split(/[,\n]/).map((e) => e.trim()).filter(Boolean);
    return emails.filter((email) => emailRegex.test(email));
  };

  const handleEmailShare = async () => {
    const validEmails = validateEmails(emailShare.emails);

    if (validEmails.length === 0) {
      setEmailShare((prev) => ({
        ...prev,
        error: "Please enter at least one valid email address",
      }));
      return;
    }

    setEmailShare((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await handleShareAction("share_with_emails", validEmails);

      setEmailShare((prev) => ({
        ...prev,
        success: true,
        emails: "",
        error: null,
      }));

      // Reload sharing state to get updated emails
      await loadCurrentSharingState();
    } catch (err) {
      setEmailShare((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Email sharing failed",
      }));
    } finally {
      setEmailShare((prev) => ({ ...prev, loading: false }));
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${label} copied!`);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setCopySuccess("Copy failed");
    }
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div class="bg-base-100 p-6 rounded-lg shadow-xl max-w-2xl w-full m-4 relative z-10 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <Shield class="w-5 h-5" />
            Share: {item.name}
          </h3>
          <button
            onClick={onClose}
            class="btn btn-sm btn-ghost btn-circle"
            aria-label="Close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div class="tabs tabs-boxed mb-4">
          <button
            class={`tab ${activeTab === "public" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("public")}
          >
            <Globe class="w-4 h-4 mr-2" />
            Public & Link
          </button>
          <button
            class={`tab ${activeTab === "email" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("email")}
          >
            <Mail class="w-4 h-4 mr-2" />
            Email Share
          </button>
        </div>

        {/* Content Area */}
        <div class="flex-1 overflow-y-auto space-y-4">
          {/* Item Details */}
          <div class="bg-base-200 p-4 rounded-lg space-y-2">
            <div class="flex justify-between">
              <span class="font-medium">Name:</span>
              <span class="text-sm">{item.name}</span>
            </div>
            {item.size && (
              <div class="flex justify-between">
                <span class="font-medium">Size:</span>
                <span class="text-sm">{formatFileSize(item.size)}</span>
              </div>
            )}
            <div class="flex justify-between">
              <span class="font-medium">Created:</span>
              <span class="text-sm">{formatDate(item.createdAt)}</span>
            </div>
          </div>

          {/* Success/Error Messages */}
          {copySuccess && (
            <Alert color="success" class="text-sm">
              <span>{copySuccess}</span>
            </Alert>
          )}

          {error && (
            <Alert color="error">
              <AlertTriangle class="w-4 h-4" />
              <span>{error}</span>
            </Alert>
          )}

          {emailShare.success && (
            <Alert color="success">
              <Mail class="w-4 h-4" />
              <span>Email invitations sent successfully!</span>
            </Alert>
          )}

          {/* Tab Content */}
          {activeTab === "public" && (
            <div class="space-y-4">
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
                      onChange={() =>
                        handleShareAction(isPublic ? "make_private_only" : "make_public")}
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
                          Your {applicationSlug === "recorder" ? "recording" : "painting"}{" "}
                          is public.
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
                          onClick={() => copyToClipboard(shareUrls.publicUrl!, "Public link")}
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
                    variant={shareToken ? "outline" : "primary"}
                    onClick={() => handleShareAction(shareToken ? "remove_token" : "create_token")}
                    disabled={loading}
                  >
                    {shareToken ? "Remove Link" : "Create Link"}
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
                      onClick={() => copyToClipboard(shareUrls.tokenUrl!, "Private link")}
                    >
                      <Copy class="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <p class="text-sm text-base-content/60">
                  Be careful with who you share this link with. Anyone with the link can view this
                  {" "}
                  {applicationSlug === "recorder" ? "recording" : "painting"}.
                </p>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div class="space-y-4">
              <div class="border border-base-300 rounded-lg p-4">
                <h4 class="font-medium mb-3 flex items-center gap-2">
                  <Mail class="w-4 h-4" />
                  Share via Email
                </h4>

                {emailShare.error && (
                  <Alert color="error" class="mb-3">
                    <AlertTriangle class="w-4 h-4" />
                    <span>{emailShare.error}</span>
                  </Alert>
                )}

                <div class="space-y-3">
                  <div>
                    <label class="label">
                      <span class="label-text">Email addresses (comma separated)</span>
                    </label>
                    <textarea
                      class="textarea textarea-bordered w-full"
                      rows={3}
                      placeholder="user@example.com, another@example.com"
                      value={emailShare.emails}
                      onChange={(e) =>
                        setEmailShare((prev) => ({
                          ...prev,
                          emails: (e.target as HTMLTextAreaElement).value,
                          error: null,
                        }))}
                      disabled={emailShare.loading}
                    />
                  </div>

                  <Button
                    class="w-full"
                    onClick={handleEmailShare}
                    disabled={emailShare.loading || !emailShare.emails.trim()}
                  >
                    {emailShare.loading
                      ? (
                        <>
                          <span class="loading loading-spinner loading-sm"></span>
                          Updating...
                        </>
                      )
                      : (
                        <>
                          <Mail class="w-4 h-4" />
                          Share with these emails
                        </>
                      )}
                  </Button>
                </div>

                {/* Current shared emails */}
                {sharedWithEmails.length > 0 && (
                  <div class="mt-4 pt-4 border-t border-base-300">
                    <h5 class="font-medium mb-2 flex items-center gap-2">
                      <Users class="w-4 h-4" />
                      Currently shared with:
                    </h5>
                    <div class="flex flex-wrap gap-1">
                      {sharedWithEmails.map((email, index) => (
                        <span key={index} class="badge badge-info badge-sm">
                          {email}
                        </span>
                      ))}
                    </div>
                    <p class="text-sm text-base-content/60 mt-2">
                      These recipients can access the file using the private link above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-base-300">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
          {onDownload && (
            <Button
              onClick={() => onDownload(item)}
              class="flex items-center gap-2"
            >
              <Download class="w-4 h-4" />
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
