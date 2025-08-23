import { useEffect, useState } from "preact/hooks";
import { Alert, Button, Card, Loading, Progress } from "@suppers/ui-lib";
import { ArrowBigLeft, ArrowLeft, Calendar, Check, Crown, Zap } from "lucide-preact";
import { getAuthClient } from "../lib/auth.ts";

const authClient = getAuthClient();

interface GeneralSubscription {
  subscriptionId: string;
  planId: string;
  planName: string;
  storageLimit: number;
  bandwidthLimit: number;
  storageUsed: number;
  bandwidthUsed: number;
  currentPeriodEnd: string;
}

interface ApplicationSubscription {
  subscriptionId: string;
  planId: string;
  planName: string;
  applicationId: string;
  applicationName: string;
  currentPeriodEnd: string;
  features: Array<{
    key: string;
    name: string;
    description?: string;
    enabled: boolean;
    value?: any;
  }>;
}

interface SubscriptionsData {
  generalSubscription?: GeneralSubscription;
  applicationSubscriptions: ApplicationSubscription[];
}

export default function SubscriptionsViewIsland() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user subscriptions
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = await authClient.getAccessToken();
      if (!accessToken) {
        throw new Error("No access token available");
      }

      const user = await authClient.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Call the API to get user subscriptions
      const response = await fetch(
        "http://127.0.0.1:54321/functions/v1/api/v1/users/subscriptions",
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "X-User-ID": user.id,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch subscriptions: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSubscriptions({
          generalSubscription: data.generalSubscription || undefined,
          applicationSubscriptions: data.applicationSubscriptions || [],
        });
      } else {
        throw new Error(data.error || "Failed to load subscriptions");
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      setError(err instanceof Error ? err.message : "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculatePercentage = (used: number, limit: number): number => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div class="container mx-auto p-4">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center justify-center py-8">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="container mx-auto p-4">
        <div class="max-w-4xl mx-auto">
          <Alert color="error" class="mb-6">
            <div class="text-sm">{error}</div>
          </Alert>
          <Button onClick={fetchSubscriptions} color="primary" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div class="container mx-auto p-4 relative">
      <div class="max-w-4xl mx-auto">
        {/* Floating Back Button */}
        <div class="fixed top-4 left-4 z-10">
          <Button
            variant="outline"
            color="primary"
            size="sm"
            onClick={() => {
              // navigate to profile
              globalThis.location.href = "/profile";
            }}
            class="shadow-md hover:shadow-lg rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <ArrowLeft class="w-5 h-5" />
          </Button>
        </div>

        <Card class="p-8 space-y-8 mt-16">
          {/* General Subscription */}
          <div>
            <h2 class="text-xl font-semibold text-base-content mb-6 flex items-center gap-2">
              <Crown class="w-5 h-5" />
              General Subscription
            </h2>

            {subscriptions?.generalSubscription
              ? (
                <div class="p-6 border border-base-300 rounded-lg bg-base-50">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="text-lg font-semibold text-base-content">
                        {subscriptions.generalSubscription.planName}
                      </h3>
                      <div class="flex items-center gap-2 text-sm text-base-content/60 mt-1">
                        <Calendar class="w-4 h-4" />
                        Renews {formatDate(subscriptions.generalSubscription.currentPeriodEnd)}
                      </div>
                    </div>
                    <Button color="primary" variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>

                  <div class="grid md:grid-cols-2 gap-6">
                    {/* Storage Usage */}
                    <div>
                      <div class="flex justify-between text-sm mb-2">
                        <span class="font-medium">Storage</span>
                        <span>
                          {formatBytes(subscriptions.generalSubscription.storageUsed)} /
                          {formatBytes(subscriptions.generalSubscription.storageLimit)}
                        </span>
                      </div>
                      <Progress
                        value={calculatePercentage(
                          subscriptions.generalSubscription.storageUsed,
                          subscriptions.generalSubscription.storageLimit,
                        )}
                        max={100}
                        class="w-full"
                      />
                    </div>

                    {/* Bandwidth Usage */}
                    <div>
                      <div class="flex justify-between text-sm mb-2">
                        <span class="font-medium">Bandwidth (Monthly)</span>
                        <span>
                          {formatBytes(subscriptions.generalSubscription.bandwidthUsed)} /
                          {formatBytes(subscriptions.generalSubscription.bandwidthLimit)}
                        </span>
                      </div>
                      <Progress
                        value={calculatePercentage(
                          subscriptions.generalSubscription.bandwidthUsed,
                          subscriptions.generalSubscription.bandwidthLimit,
                        )}
                        max={100}
                        class="w-full"
                      />
                    </div>
                  </div>
                </div>
              )
              : (
                <div class="p-6 border border-base-300 rounded-lg bg-base-50 text-center">
                  <div class="text-base-content/60 mb-4">
                    <Crown class="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No general subscription found</p>
                    <p class="text-sm">You're currently on the default free tier</p>
                  </div>
                  <Button color="primary">
                    Upgrade to Pro
                  </Button>
                </div>
              )}
          </div>

          {/* Application Subscriptions */}
          <div>
            <h2 class="text-xl font-semibold text-base-content mt-6 mb-6 flex items-center gap-2">
              <Zap class="w-5 h-5" />
              Application Subscriptions
            </h2>

            {subscriptions?.applicationSubscriptions &&
                subscriptions.applicationSubscriptions.length > 0
              ? (
                <div class="grid gap-6">
                  {subscriptions.applicationSubscriptions.map((appSub) => (
                    <div
                      key={appSub.subscriptionId}
                      class="p-6 border border-base-300 rounded-lg bg-base-50"
                    >
                      <div class="flex justify-between items-start mb-4">
                        <div>
                          <h3 class="text-lg font-semibold text-base-content">
                            {appSub.planName}
                          </h3>
                          <p class="text-base-content/70">{appSub.applicationName}</p>
                          <div class="flex items-center gap-2 text-sm text-base-content/60 mt-1">
                            <Calendar class="w-4 h-4" />
                            Renews {formatDate(appSub.currentPeriodEnd)}
                          </div>
                        </div>
                        <Button color="primary" variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>

                      {appSub.features && appSub.features.length > 0 && (
                        <div>
                          <h4 class="font-medium text-base-content mb-2">Features</h4>
                          <div class="grid gap-2">
                            {appSub.features.map((feature) => (
                              <div key={feature.key} class="flex items-center gap-2 text-sm">
                                <Check
                                  class={`w-4 h-4 ${
                                    feature.enabled ? "text-success" : "text-base-content/30"
                                  }`}
                                />
                                <span
                                  class={feature.enabled
                                    ? "text-base-content"
                                    : "text-base-content/50"}
                                >
                                  {feature.name}
                                </span>
                                {feature.description && (
                                  <span class="text-base-content/60">- {feature.description}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
              : (
                <div class="p-6 border border-base-300 rounded-lg bg-base-50 text-center">
                  <div class="text-base-content/60 mb-4">
                    <Zap class="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No application subscriptions found</p>
                    <p class="text-sm">Subscribe to application-specific features when available</p>
                  </div>
                </div>
              )}
          </div>
        </Card>
      </div>
    </div>
  );
}
