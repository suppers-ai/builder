import { useEffect, useState } from "preact/hooks";
import { UpdateUserData, type User } from "@suppers/auth-client";
import { ProfileCard, Progress, Button, Alert, Loading } from "@suppers/ui-lib";
import { getCurrentTheme, applyTheme } from "@suppers/shared/utils";
import { HardDrive, Crown, LogOut, Wifi } from "lucide-preact";
import { getAuthClient } from "../lib/auth.ts";

// Get the profile auth client (direct Supabase connection)
const authClient = getAuthClient();

interface StorageInfo {
  used: number;
  limit: number;
  percentage: number;
  remaining: number;
  fileCount: number;
  maxFileSize: number;
  objectTypes?: Record<string, number>;
}

interface BandwidthInfo {
  used: number;
  limit: number;
  percentage: number;
  remaining: number;
}

export default function ProfilePageIsland() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [bandwidthInfo, setBandwidthInfo] = useState<BandwidthInfo | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);

  // Fetch storage information
  const fetchStorageInfo = async (targetUser?: User) => {
    const userToUse = targetUser || user;
    if (!userToUse) return;
    
    try {
      setStorageLoading(true);
      
      const accessToken = await authClient.getAccessToken();
      if (!accessToken) {
        console.error("No access token available for storage request");
        return;
      }

      // Call the centralized storage API
      const response = await fetch('http://127.0.0.1:54321/functions/v1/api/v1/storage/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userToUse.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStorageInfo(data.storage);
          setBandwidthInfo(data.bandwidth);
        }
      }
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
    } finally {
      setStorageLoading(false);
    }
  };

  const handleUpgrade = () => {
    alert("Coming soon! Upgrade options will be available in a future update.");
  };

  useEffect(() => {
    // Initialize auth client
    const initAuth = async () => {
      try {
        console.log("🔍 ProfilePageIsland: Initializing auth client");
        await authClient.initialize();
        const currentUser = await authClient.getUser();
        console.log("🔍 ProfilePageIsland: Auth client initialized, user:", currentUser);
        setUser(currentUser);
        
        // Apply user's theme if available
        if (currentUser) {
          const userTheme = getCurrentTheme(currentUser);
          applyTheme(userTheme);
        }
        
        setLoading(false);
        
        // Fetch storage info after user is loaded
        if (currentUser) {
          fetchStorageInfo(currentUser);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setError("Failed to initialize authentication");
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth events
    const handleAuthEvent = async (event: string, data: any) => {
      console.log("🔍 ProfilePageIsland: Auth event received:", event, data);
      if (event === "login") {
        const user = data?.user || await authClient.getUser();
        console.log("🔍 ProfilePageIsland: Setting user after login:", user);
        setUser(user);
        
        // Apply user's theme
        if (user) {
          const userTheme = getCurrentTheme(user);
          applyTheme(userTheme);
        }
      } else if (event === "logout") {
        console.log("🔍 ProfilePageIsland: Clearing user after logout");
        setUser(null);
        
        // Reset to system/default theme when logged out
        const defaultTheme = getCurrentTheme(null);
        applyTheme(defaultTheme);
      }
      // else if (event === "profile_change") {
      //   console.log("🔍 ProfilePageIsland: Profile changed, updating user:", data);
      //   const updatedUser = data || await authClient.getUser();
      //   setUser(updatedUser);
        
      //   // Apply updated user theme
      //   if (updatedUser) {
      //     const userTheme = getCurrentTheme(updatedUser);
      //     applyTheme(userTheme);
      //   }
      // }
    };

    authClient.addEventListener("login", handleAuthEvent);
    authClient.addEventListener("logout", handleAuthEvent);
    // authClient.addEventListener("profile_change", handleAuthEvent);

    // Listen for postMessage events from other applications (cross-origin profile updates)
    const handlePostMessage = async (event: MessageEvent) => {
      console.log('🎯 ProfilePageIsland: Received postMessage:', event.data, 'from origin:', event.origin);
      
      if (event.data.type === 'SUPPERS_PROFILE_UPDATED') {
        console.log('🎯 ProfilePageIsland: Profile was updated in another application, refreshing...');
        
        // Fetch fresh user data from database to stay in sync
        try {
          const refreshedUser = await authClient.getUser();
          if (refreshedUser) {
            console.log('🎯 ProfilePageIsland: Setting refreshed user data:', refreshedUser);
            setUser(refreshedUser);
            
            // Apply theme if it changed
            const userTheme = getCurrentTheme(refreshedUser);
            applyTheme(userTheme);
          }
        } catch (error) {
          console.error('🎯 ProfilePageIsland: Failed to refresh user data:', error);
        }
      }
    };

    // Add postMessage listener
    window.addEventListener('message', handlePostMessage);

    return () => {
      authClient.removeEventListener("login", handleAuthEvent);
      authClient.removeEventListener("logout", handleAuthEvent);
      // authClient.removeEventListener("profile_change", handleAuthEvent);
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

  // Handle profile update
  const handleUpdateProfile = async (data: UpdateUserData) => {
    try {
      setError(null);
      setSuccess(null);
      
      const result = await authClient.updateUser(data);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      } else {
        setSuccess("Profile updated successfully!");
        
        // Fetch fresh user data from database after successful update
        const refreshedUser = await authClient.getUser();
        if (refreshedUser) {
          console.log('🎯 ProfilePageIsland: Profile updated, setting fresh user data:', refreshedUser);
          setUser(refreshedUser);
          
          // Apply theme if it changed
          const userTheme = getCurrentTheme(refreshedUser);
          applyTheme(userTheme);
          
          // Notify other applications about the profile update via postMessage
          // This will reach any parent windows or popups that opened this profile page
          try {
            const message = {
              type: 'SUPPERS_PROFILE_UPDATED',
              data: { user: refreshedUser }
            };
            
            // Send to parent window if this is an iframe/popup
            if (window.parent && window.parent !== window) {
              window.parent.postMessage(message, '*');
              console.log('🎯 ProfilePageIsland: Sent profile update to parent window');
            }
            
            // Send to opener window if this was opened as a popup
            if (window.opener) {
              window.opener.postMessage(message, '*');
              console.log('🎯 ProfilePageIsland: Sent profile update to opener window');
            }
          } catch (error) {
            console.error('🎯 ProfilePageIsland: Failed to send profile update message:', error);
          }
        }
        
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Handle avatar upload
  const handleUploadAvatar = async (file: File) => {
    try {
      setError(null);
      setSuccess(null);
      
      // Create a form data object for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // For now, just show that upload is triggered
      // In a real implementation, you'd upload to your storage provider
      console.log("Avatar upload triggered for file:", file.name);
      throw new Error("Avatar upload not yet implemented");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload avatar";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Handle password change
  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      setSuccess(null);
      
      // Password change would typically use Supabase auth
      // For now, show not implemented
      console.log("Password change triggered");
      throw new Error("Password change not yet implemented");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change password";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      // Redirect after logout
      if (window.opener) {
        window.close();
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Sign out error:", err);
      setError("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="loading loading-lg"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <h1 class="text-2xl font-bold mb-4">Authentication Required</h1>
          <p class="text-base-content/70 mb-6">
            Please sign in to access your profile settings.
          </p>
          <a href="/auth/login" class="btn btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div class="container mx-auto p-4">
      <div class="max-w-md mx-auto space-y-6">
        <ProfileCard
          user={user as any} // Type conversion for compatibility
          isLoading={loading}
          error={error}
          success={success}
          onUpdateProfile={handleUpdateProfile}
          onUploadAvatar={handleUploadAvatar}
          onChangePassword={handleChangePassword}
          // Detect if we're in popup mode
          isPopupMode={!!window.opener}
          parentOrigin={(() => {
            if (!window.opener) return undefined;
            const referrer = document.referrer;
            const origin = referrer ? new URL(referrer).origin : "*";
            console.log('🎨 ProfilePageIsland: Popup mode detected, referrer:', referrer, 'origin:', origin);
            return origin;
          })()}
          onPopupClose={() => {
            if (window.opener) {
              window.close();
            }
          }}
        />
        
        {/* Usage Section */}
        <div class="card bg-base-100 border border-base-200">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <HardDrive class="w-5 h-5" />
              <h3 class="card-title text-lg">Usage</h3>
            </div>
            
            {storageLoading ? (
              <div class="flex items-center justify-center py-4">
                <Loading size="sm" />
              </div>
            ) : storageInfo && bandwidthInfo ? (
              <div class="space-y-6">
                {/* Storage Usage */}
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="font-medium">Storage</span>
                    <span>{storageInfo.fileCount} files</span>
                  </div>
                  <div class="flex justify-between text-sm mb-2">
                    <span>Used: {Math.round(storageInfo.used / (1024 * 1024))}MB</span>
                    <span>Limit: {Math.round(storageInfo.limit / (1024 * 1024))}MB</span>
                  </div>
                  <Progress value={storageInfo.percentage} max={100} class="w-full" />
                </div>
                
                {/* Bandwidth Usage */}
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="font-medium">Bandwidth</span>
                    <span class="text-xs text-base-content/60">(Monthly)</span>
                  </div>
                  <div class="flex justify-between text-sm mb-2">
                    <span>Used: {Math.round(bandwidthInfo.used / (1024 * 1024))}MB</span>
                    <span>Limit: {Math.round(bandwidthInfo.limit / (1024 * 1024))}MB</span>
                  </div>
                  <Progress value={bandwidthInfo.percentage} max={100} class="w-full" />
                </div>
                
                <div class="flex justify-between items-center pt-4 border-t border-base-200">
                  <div class="text-sm">
                    <div class="font-medium">Free Plan</div>
                    <div class="text-base-content/60">
                      {Math.round(storageInfo.limit / (1024 * 1024))}MB storage • {Math.round(bandwidthInfo.limit / (1024 * 1024))}MB monthly bandwidth
                    </div>
                  </div>
                  <Button 
                    color="primary" 
                    size="sm" 
                    onClick={handleUpgrade}
                    class="flex items-center gap-2"
                  >
                    <Crown class="w-4 h-4" />
                    Upgrade
                  </Button>
                </div>
              </div>
            ) : (
              <Alert color="warning">
                <div class="text-sm">
                  Unable to load usage information. Please try refreshing the page.
                </div>
              </Alert>
            )}
          </div>
        </div>
        
        {/* Sign Out Section */}
        <div class="card bg-base-100 border border-base-200">
          <div class="card-body">
            <div class="text-center mb-4">
              <h3 class="card-title text-lg text-base-content">Account Actions</h3>
            </div>
            <Button 
              color="error" 
              variant="outline"
              onClick={handleSignOut}
              class="w-full flex items-center justify-center gap-2"
            >
              <LogOut class="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
