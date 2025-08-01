import { BaseComponentProps } from "../../types.ts";
import { Loading } from "../../feedback/loading/Loading.tsx";
import { EditUserModal } from "./EditUserModal.tsx";
import { UserAvatar } from "../../display/avatar/UserAvatar.tsx";
import type { Application, User } from "../../../shared/lib/api-helpers.ts";
import { TypeMappers } from "@suppers/shared/utils";

interface UserStats {
  totalApplications: number;
  publishedApplications: number;
  draftApplications: number;
  pendingApplications: number;
  recentApplications: Application[];
}

export interface UserPageProps extends BaseComponentProps {
  user: User | null;
  isLoading: boolean;
  showEditModal: boolean;
  isSigningOut: boolean;
  userStats: UserStats;
  isLoadingStats: boolean;
  isAdmin: boolean;
  onShowEditModal: () => void;
  onHideEditModal: () => void;
  onSignOut: () => void;
  onEditModalSave: () => void;
  onUpdateUser: (data: {
    firstName?: string;
    middleNames?: string;
    lastName?: string;
    displayName?: string;
    avatarUrl?: string;
    email?: string;
  }) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  // Additional customization props
  pageTitle?: string;
  showStats?: boolean;
  showAdminBadge?: boolean;
}

export function UserPage({
  class: className = "",
  user,
  isLoading,
  showEditModal,
  isSigningOut,
  userStats,
  isLoadingStats,
  isAdmin,
  onShowEditModal,
  onHideEditModal,
  onSignOut,
  onEditModalSave,
  onUpdateUser,
  onDeleteAccount,
  pageTitle = "User Profile",
  showStats = true,
  showAdminBadge = true,
  id,
  ...props
}: UserPageProps) {
  const getFullName = () => {
    if (!user) return "User";
    return TypeMappers.getDisplayName(user);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (isLoading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <Loading size="lg" variant="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <h1 class="text-2xl font-bold mb-4">User Not Found</h1>
          <p class="text-slate-600 mb-4">Please log in to view your account.</p>
          <a
            href="/login"
            class="btn btn-primary text-white px-4 py-2 rounded-md"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div class={`container mx-auto px-4 py-8 max-w-6xl ${className}`}>
      {/* Header */}
      <div class="bg-base-100 rounded-lg shadow-xl border border-base-300 mb-6">
        <div class="p-6">
          <div class="flex items-center gap-6">
            <UserAvatar user={TypeMappers.userToAuthUser(user)} size="lg" />
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-2xl font-bold text-slate-900">
                  {getFullName()}
                </h1>
                {isAdmin && (
                  <span class="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    🔑 Admin
                  </span>
                )}
                <span
                  class={`text-sm font-medium px-2.5 py-0.5 rounded ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role === "admin" ? "👨‍💼 Administrator" : "👤 User"}
                </span>
              </div>
              <p class="text-slate-600 mb-3">{user.email}</p>
              <div class="flex items-center gap-3 flex-wrap">
                <button
                  onClick={onShowEditModal}
                  class="btn btn-primary text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  ✏️ Edit Profile
                </button>
                <a
                  href="/my-applications"
                  class="btn btn-success text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  📱 My Applications
                </a>
                {isAdmin && (
                  <a
                    href="/admin"
                    class="btn btn-secondary text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    🔧 Admin Panel
                  </a>
                )}
                <button
                  onClick={onSignOut}
                  disabled={isSigningOut}
                  class="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSigningOut
                    ? (
                      <>
                        <Loading size="sm" variant="spinner" />
                        Signing Out...
                      </>
                    )
                    : (
                      <>
                        🚪 Sign Out
                      </>
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-base-100 rounded-lg shadow-xl border border-base-300 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">📱</span>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-slate-900">Total Apps</h3>
              {isLoadingStats
                ? <div class="animate-pulse bg-slate-200 h-8 w-16 rounded"></div>
                : <p class="text-3xl font-bold text-blue-600">{userStats.totalApplications}</p>}
            </div>
          </div>
        </div>

        <div class="bg-base-100 rounded-lg shadow-xl border border-base-300 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">🚀</span>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-slate-900">Published</h3>
              {isLoadingStats
                ? <div class="animate-pulse bg-slate-200 h-8 w-16 rounded"></div>
                : <p class="text-3xl font-bold text-green-600">{userStats.publishedApplications}
                </p>}
            </div>
          </div>
        </div>

        <div class="bg-base-100 rounded-lg shadow-xl border border-base-300 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">⏳</span>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-slate-900">Pending</h3>
              {isLoadingStats
                ? <div class="animate-pulse bg-slate-200 h-8 w-16 rounded"></div>
                : <p class="text-3xl font-bold text-orange-600">{userStats.pendingApplications}</p>}
            </div>
          </div>
        </div>

        <div class="bg-base-100 rounded-lg shadow-xl border border-base-300 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">📝</span>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-slate-900">Drafts</h3>
              {isLoadingStats
                ? <div class="animate-pulse bg-slate-200 h-8 w-16 rounded"></div>
                : <p class="text-3xl font-bold text-slate-600">{userStats.draftApplications}</p>}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-base-100 rounded-lg shadow-xl border border-base-300">
            <div class="p-6">
              <h2 class="text-lg font-semibold text-slate-900 mb-4">
                Personal Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">
                    First Name
                  </label>
                  <p class="text-slate-900">
                    {user.first_name || "Not provided"}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">
                    Last Name
                  </label>
                  <p class="text-slate-900">
                    {user.last_name || "Not provided"}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">
                    Middle Names
                  </label>
                  <p class="text-slate-900">
                    {user.middle_names || "Not provided"}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">
                    Display Name
                  </label>
                  <p class="text-slate-900">
                    {user.display_name || "Not provided"}
                  </p>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <p class="text-slate-900">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div class="bg-base-100 rounded-lg shadow-xl border border-base-300">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-slate-900">
                  Recent Applications
                </h2>
                <a
                  href="/my-applications"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All →
                </a>
              </div>
              {isLoadingStats
                ? (
                  <div class="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} class="animate-pulse flex items-center space-x-3">
                        <div class="bg-slate-200 h-10 w-10 rounded"></div>
                        <div class="flex-1">
                          <div class="bg-slate-200 h-4 w-3/4 rounded mb-2"></div>
                          <div class="bg-slate-200 h-3 w-1/2 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : userStats.recentApplications.length === 0
                ? (
                  <div class="text-center py-8 text-slate-500">
                    <div class="text-4xl mb-2">📱</div>
                    <p>No applications yet</p>
                    <p class="text-sm">Create your first application to get started.</p>
                    <a
                      href="/my-applications"
                      class="mt-3 inline-block btn btn-primary text-white px-4 py-2 rounded-md font-medium"
                    >
                      Create Application
                    </a>
                  </div>
                )
                : (
                  <div class="space-y-3">
                    {userStats.recentApplications.map((app) => (
                      <div
                        key={app.id}
                        class="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg"
                      >
                        <div class="flex-shrink-0">
                          <span class="text-2xl">
                            {app.status === "published"
                              ? "🚀"
                              : app.status === "pending"
                              ? "⏳"
                              : "📝"}
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <h3 class="text-sm font-medium text-slate-900 truncate">
                            {app.name}
                          </h3>
                          <div class="flex items-center space-x-2 text-xs text-slate-500">
                            <span
                              class={`px-2 py-0.5 rounded-full ${
                                app.status === "published"
                                  ? "bg-green-100 text-green-800"
                                  : app.status === "pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : app.status === "draft"
                                  ? "bg-slate-100 text-slate-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {app.status}
                            </span>
                            <span>•</span>
                            <span>{formatRelativeTime(app.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div class="space-y-6">
          {/* Account Details */}
          <div class="bg-base-100 rounded-lg shadow-xl border border-base-300">
            <div class="p-6">
              <h2 class="text-lg font-semibold text-slate-900 mb-4">
                Account Details
              </h2>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">
                    Account Created
                  </label>
                  <p class="text-slate-900 text-sm">
                    {formatDate(user.created_at)}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">
                    Last Updated
                  </label>
                  <p class="text-slate-900 text-sm">
                    {formatDate(user.updated_at)}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">
                    User ID
                  </label>
                  <p class="text-slate-500 text-xs font-mono break-all">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div class="bg-base-100 rounded-lg shadow-xl border border-base-300">
            <div class="p-6">
              <h2 class="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h2>
              <div class="space-y-3">
                <a
                  href="/"
                  class="flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span class="text-xl">🏠</span>
                  <div>
                    <h3 class="font-medium text-slate-900 text-sm">Browse Apps</h3>
                    <p class="text-xs text-slate-600">Discover published applications</p>
                  </div>
                </a>
                <button
                  onClick={onShowEditModal}
                  class="w-full flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <span class="text-xl">⚙️</span>
                  <div>
                    <h3 class="font-medium text-slate-900 text-sm">Edit Profile</h3>
                    <p class="text-xs text-slate-600">Update your information</p>
                  </div>
                </button>
                <a
                  href="/my-applications"
                  class="flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span class="text-xl">📱</span>
                  <div>
                    <h3 class="font-medium text-slate-900 text-sm">Manage Apps</h3>
                    <p class="text-xs text-slate-600">Create and edit your applications</p>
                  </div>
                </a>
                {isAdmin && (
                  <a
                    href="/admin"
                    class="flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span class="text-xl">🔧</span>
                    <div>
                      <h3 class="font-medium text-slate-900 text-sm">Admin Panel</h3>
                      <p class="text-xs text-slate-600">Review pending applications</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div class="bg-base-100 rounded-lg shadow-xl border border-base-300">
            <div class="p-6">
              <h2 class="text-lg font-semibold text-slate-900 mb-4">
                Security & Privacy
              </h2>
              <div class="space-y-3">
                <button
                  onClick={() =>
                    alert(
                      "Password change functionality coming soon! For now, use the sign out and password reset flow.",
                    )}
                  class="w-full flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <span class="text-xl">🔒</span>
                  <div>
                    <h3 class="font-medium text-slate-900 text-sm">Change Password</h3>
                    <p class="text-xs text-slate-600">Update your password</p>
                  </div>
                </button>
                <button
                  onClick={() => alert("Two-factor authentication coming soon!")}
                  class="w-full flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <span class="text-xl">🛡️</span>
                  <div>
                    <h3 class="font-medium text-slate-900 text-sm">Two-Factor Auth</h3>
                    <p class="text-xs text-slate-600">Enable 2FA security</p>
                  </div>
                </button>
                <button
                  onClick={onDeleteAccount}
                  class="w-full flex items-center gap-3 p-3 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  <span class="text-xl">❌</span>
                  <div>
                    <h3 class="font-medium text-sm">Delete Account</h3>
                    <p class="text-xs">Permanently delete your account</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <EditUserModal
          user={TypeMappers.userToAuthUser(user)}
          isOpen={showEditModal}
          onClose={onHideEditModal}
          onSave={onUpdateUser}
        />
      )}
    </div>
  );
}
