import { useEffect, useState } from "preact/hooks";
import { useAsyncOperation, useModalState, usePageAuth } from "../../shared/hooks/mod.ts";
import { UserPage as UserPageDisplay } from "./components/UserPage.tsx";
import { ApiHelpers } from "../../shared/lib/api-helpers.ts";
import type { Application } from "../../shared/lib/api-helpers.ts";

export interface UserPageProps {
  className?: string;
  // Optional auth prop for testing/mocking
  auth?: {
    dbUser: any;
    updateUser: (data: any) => Promise<void>;
    loading?: boolean;
    signOut: () => Promise<void>;
  };
}

export function UserPage({ className = "", auth }: UserPageProps) {
  // Use page auth hook for authentication handling
  const { user: dbUser, loading, authContext } = usePageAuth({
    auth,
    redirectIfNotAuthenticated: false, // Show auth required message instead
  });

  // Get auth methods from context
  const { updateUser, signOut } = authContext;

  // User stats state
  const [userStats, setUserStats] = useState({
    totalApplications: 0,
    publishedApplications: 0,
    draftApplications: 0,
    pendingApplications: 0,
    recentApplications: [] as Application[],
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal state management
  const editModal = useModalState();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Async operations
  const loadUserStatsOperation = useAsyncOperation({
    onSuccess: (data) => {
      setUserStats(data.stats);
      setIsAdmin(data.isAdmin);
    },
  });

  const updateUserOperation = useAsyncOperation({
    onSuccess: (data) => {
      // Reload stats in case display name changed
      if (data.displayName || data.firstName || data.lastName) {
        loadUserStatsOperation.execute(async () => {
          const applications = await ApiHelpers.getUserApplications(dbUser.id);
          const stats = {
            totalApplications: applications.length,
            publishedApplications: applications.filter((app) => app.status === "published").length,
            draftApplications: applications.filter((app) => app.status === "draft").length,
            pendingApplications: applications.filter((app) => app.status === "pending").length,
            recentApplications: applications.slice(0, 5),
          };
          const adminStatus = await ApiHelpers.isAdmin(dbUser.id);
          return { stats, isAdmin: adminStatus };
        });
      }
    },
  });

  // Load user statistics
  useEffect(() => {
    if (!dbUser) return;

    loadUserStatsOperation.execute(async () => {
      // Check admin status
      const adminStatus = await ApiHelpers.isAdmin(dbUser.id);

      // Get user applications
      const applications = await ApiHelpers.getUserApplications(dbUser.id);

      const stats = {
        totalApplications: applications.length,
        publishedApplications: applications.filter((app) => app.status === "published").length,
        draftApplications: applications.filter((app) => app.status === "draft").length,
        pendingApplications: applications.filter((app) => app.status === "pending").length,
        recentApplications: applications.slice(0, 5), // Most recent 5
      };

      return { stats, isAdmin: adminStatus };
    });
  }, [dbUser]);

  // Handler functions
  const handleUpdateUser = async (data: {
    firstName?: string;
    middleNames?: string;
    lastName?: string;
    displayName?: string;
    avatarUrl?: string;
    email?: string;
  }) => {
    await updateUserOperation.execute(async () => {
      await updateUser?.(data);
      return data;
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut?.();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleShowEditModal = () => {
    editModal.openModal();
  };

  const handleHideEditModal = () => {
    editModal.closeModal();
  };

  const handleEditModalSave = () => {
    editModal.closeModal();
  };

  const handleDeleteAccount = async () => {
    if (!dbUser) return;

    const confirmMessage =
      `Are you sure you want to delete your account? This action cannot be undone.
    
This will permanently delete:
- Your account and profile information
- All your applications (${userStats.totalApplications} applications)
- All associated data

Type "DELETE MY ACCOUNT" to confirm:`;

    const confirmation = prompt(confirmMessage);

    if (confirmation !== "DELETE MY ACCOUNT") {
      alert("Account deletion cancelled. The confirmation text did not match.");
      return;
    }

    try {
      // For now, we'll just sign out - in a real app you'd call a delete API
      alert(
        "Account deletion is not yet implemented. For security reasons, please contact support to delete your account.",
      );
      console.log("Account deletion requested for user:", dbUser.id);
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting your account. Please try again or contact support.");
    }
  };

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show auth required message if no user
  if (!dbUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600">Please log in to view your account.</p>
        </div>
      </div>
    );
  }

  return (
    <UserPageDisplay
      className={className}
      user={dbUser}
      isLoading={loading}
      showEditModal={editModal.isOpen}
      isSigningOut={isSigningOut}
      userStats={userStats}
      isLoadingStats={loadUserStatsOperation.loading}
      isAdmin={isAdmin}
      onShowEditModal={handleShowEditModal}
      onHideEditModal={handleHideEditModal}
      onSignOut={handleSignOut}
      onEditModalSave={handleEditModalSave}
      onUpdateUser={handleUpdateUser}
      onDeleteAccount={handleDeleteAccount}
    />
  );
}

export default UserPage;
