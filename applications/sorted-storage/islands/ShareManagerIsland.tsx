/**
 * ShareManagerIsland - Interactive component for managing file and folder sharing
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useEffect, useState } from "preact/hooks";
import { AlertTriangle, Check, Clock, Copy, Link, Mail, Share, Users, X } from "lucide-preact";
import type { ShareInfo, ShareOptions, StorageObject } from "../types/storage.ts";
import {
  copyShareLink,
  createEmailShare,
  createShareLink,
  formatExpiryDate,
  getShareInfo,
  isShareExpired,
  revokeShareLink,
} from "../lib/sharing-utils.ts";

interface ShareManagerProps {
  storageObject: StorageObject;
  isOpen: boolean;
  onClose: () => void;
  onShareCreated?: (shareInfo: ShareInfo) => void;
  onShareRevoked?: () => void;
}

export default function ShareManagerIsland({
  storageObject,
  isOpen,
  onClose,
  onShareCreated,
  onShareRevoked,
}: ShareManagerProps) {
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"link" | "email">("link");

  // Email sharing state
  const [emailList, setEmailList] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Share options state
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    allowDownload: true,
  });

  useEffect(() => {
    if (isOpen && storageObject.share_token) {
      loadShareInfo();
    }
  }, [isOpen, storageObject.share_token]);

  const loadShareInfo = async () => {
    try {
      const info = await getShareInfo(storageObject);
      setShareInfo(info);
    } catch (err) {
      console.error("Failed to load share info:", err);
    }
  };

  const handleCreateShare = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newShareInfo = await createShareLink(storageObject, shareOptions);
      setShareInfo(newShareInfo);
      setSuccess("Share link created successfully!");
      onShareCreated?.(newShareInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await revokeShareLink(storageObject);
      setShareInfo(null);
      setSuccess("Share link revoked successfully!");
      onShareRevoked?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke share link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareInfo) return;

    const success = await copyShareLink(shareInfo.url);
    if (success) {
      setSuccess("Link copied to clipboard!");
    } else {
      setError("Failed to copy link to clipboard");
    }
  };

  const handleEmailShare = async () => {
    if (!emailList.trim()) {
      setError("Please enter at least one email address");
      return;
    }

    setEmailLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const emails = emailList
        .split(/[,\n]/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const result = await createEmailShare(
        storageObject,
        emails,
        emailMessage.trim() || undefined,
      );

      if (result.success) {
        setSuccess(`Email share sent to ${emails.length} recipient(s)!`);
        setEmailList("");
        setEmailMessage("");
      } else {
        setError(result.error || "Failed to send email share");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email share");
    } finally {
      setEmailLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  const isExpired = shareInfo && shareInfo.expiresAt && isShareExpired(shareInfo.expiresAt);

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-base-100 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div class="flex items-center justify-between p-6 border-b border-base-300">
          <div class="flex items-center gap-3">
            <Share class="w-6 h-6 text-primary" />
            <div>
              <h2 class="text-xl font-semibold">Share {storageObject.object_type}</h2>
              <p class="text-sm text-base-content/60 truncate max-w-48">
                {storageObject.metadata?.custom_name || storageObject.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            class="btn btn-ghost btn-sm btn-circle"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div class="p-6">
          {/* Tabs */}
          <div class="tabs tabs-boxed mb-6">
            <button
              class={`tab ${activeTab === "link" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("link")}
            >
              <Link class="w-4 h-4 mr-2" />
              Share Link
            </button>
            <button
              class={`tab ${activeTab === "email" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("email")}
            >
              <Mail class="w-4 h-4 mr-2" />
              Email Share
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div class="alert alert-error mb-4">
              <AlertTriangle class="w-5 h-5" />
              <span>{error}</span>
              <button onClick={clearMessages} class="btn btn-ghost btn-sm">
                <X class="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div class="alert alert-success mb-4">
              <Check class="w-5 h-5" />
              <span>{success}</span>
              <button onClick={clearMessages} class="btn btn-ghost btn-sm">
                <X class="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Link Sharing Tab */}
          {activeTab === "link" && (
            <div class="space-y-4">
              {shareInfo
                ? (
                  <div class="space-y-4">
                    {/* Share Link Display */}
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Share Link</span>
                      </label>
                      <div class="join">
                        <input
                          type="text"
                          value={shareInfo.url}
                          readonly
                          class={`input input-bordered join-item flex-1 ${
                            isExpired ? "input-error" : ""
                          }`}
                        />
                        <button
                          onClick={handleCopyLink}
                          class="btn btn-primary join-item"
                          disabled={!!isExpired}
                        >
                          <Copy class="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Share Info */}
                    <div class="stats shadow w-full">
                      <div class="stat">
                        <div class="stat-figure text-primary">
                          <Clock class="w-6 h-6" />
                        </div>
                        <div class="stat-title">Status</div>
                        <div
                          class={`stat-value text-sm ${isExpired ? "text-error" : "text-success"}`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </div>
                        <div class="stat-desc">
                          {shareInfo.expiresAt && formatExpiryDate(shareInfo.expiresAt)}
                        </div>
                      </div>
                      <div class="stat">
                        <div class="stat-figure text-secondary">
                          <Users class="w-6 h-6" />
                        </div>
                        <div class="stat-title">Access Count</div>
                        <div class="stat-value text-sm">{shareInfo.accessCount}</div>
                        <div class="stat-desc">Total views</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div class="flex gap-2">
                      <button
                        onClick={handleRevokeShare}
                        class="btn btn-error flex-1"
                        disabled={loading}
                      >
                        {loading ? <span class="loading loading-spinner loading-sm"></span> : (
                          "Revoke Access"
                        )}
                      </button>
                    </div>
                  </div>
                )
                : (
                  <div class="space-y-4">
                    {/* Share Options */}
                    <div class="form-control">
                      <label class="label cursor-pointer">
                        <span class="label-text">Allow downloads</span>
                        <input
                          type="checkbox"
                          class="checkbox checkbox-primary"
                          checked={shareOptions.allowDownload}
                          onChange={(e) =>
                            setShareOptions({
                              ...shareOptions,
                              allowDownload: (e.target as HTMLInputElement).checked,
                            })}
                        />
                      </label>
                    </div>

                    {/* Create Share Button */}
                    <button
                      onClick={handleCreateShare}
                      class="btn btn-primary w-full"
                      disabled={loading}
                    >
                      {loading ? <span class="loading loading-spinner loading-sm"></span> : (
                        <>
                          <Link class="w-4 h-4 mr-2" />
                          Create Share Link
                        </>
                      )}
                    </button>
                  </div>
                )}
            </div>
          )}

          {/* Email Sharing Tab */}
          {activeTab === "email" && (
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Email addresses</span>
                  <span class="label-text-alt">Separate with commas or new lines</span>
                </label>
                <textarea
                  class="textarea textarea-bordered h-24"
                  placeholder="user@example.com, another@example.com"
                  value={emailList}
                  onInput={(e) => setEmailList((e.target as HTMLTextAreaElement).value)}
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Personal message (optional)</span>
                </label>
                <textarea
                  class="textarea textarea-bordered h-20"
                  placeholder="Add a personal message..."
                  value={emailMessage}
                  onInput={(e) => setEmailMessage((e.target as HTMLTextAreaElement).value)}
                />
              </div>

              <button
                onClick={handleEmailShare}
                class="btn btn-primary w-full"
                disabled={emailLoading || !emailList.trim()}
              >
                {emailLoading ? <span class="loading loading-spinner loading-sm"></span> : (
                  <>
                    <Mail class="w-4 h-4 mr-2" />
                    Send Email Share
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
