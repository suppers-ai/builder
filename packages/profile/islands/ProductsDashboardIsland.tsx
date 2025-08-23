import { useEffect, useState } from "preact/hooks";
import { Button, Card } from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";
import { Package, ShoppingCart, Users, Eye, Heart, TrendingUp, Plus, ArrowLeft } from "lucide-preact";
import EntitiesTab from "./tabs/EntitiesTab.tsx";
import SalesOrdersTab from "./tabs/SalesOrdersTab.tsx";
import DashboardTab from "./tabs/DashboardTab.tsx";

export default function ProductsDashboardIsland() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authClient = getAuthClient();
      await authClient.initialize();
      const currentUser = await authClient.getUser();
      
      if (!currentUser) {
        console.error("User not authenticated");
        globalThis.location.href = "/auth/login";
        return;
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center">
        <div class="text-center">
          <div class="loading loading-spinner loading-lg mb-4"></div>
          <p class="text-base-content/60">Loading products dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-base-200">
      <div class="container mx-auto p-4 relative">
        <div class="max-w-7xl mx-auto">
          {/* Floating Back Button */}
          <div class="fixed top-4 left-4 z-10">
            <Button
              variant="outline"
              color="primary"
              size="sm"
              onClick={() => {
                globalThis.location.href = "/";
              }}
              class="shadow-md hover:shadow-lg rounded-full w-10 h-10 p-0 flex items-center justify-center"
            >
              <ArrowLeft class="w-5 h-5" />
            </Button>
          </div>

          {/* Main Card with Tabs */}
          <Card class="mt-16">
            {/* Tab Navigation */}
            <div class="border-b border-base-300">
              <div class="flex gap-1 px-6 pt-6">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  class={`px-6 py-3 font-medium transition-all relative ${
                    activeTab === "dashboard"
                      ? "text-primary border-b-2 border-primary -mb-[1px]"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <div class="flex items-center gap-2">
                    <TrendingUp class="w-4 h-4" />
                    Dashboard
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("sales")}
                  class={`px-6 py-3 font-medium transition-all relative ${
                    activeTab === "sales"
                      ? "text-primary border-b-2 border-primary -mb-[1px]"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <div class="flex items-center gap-2">
                    <ShoppingCart class="w-4 h-4" />
                    Sales & Orders
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("entities")}
                  class={`px-6 py-3 font-medium transition-all relative ${
                    activeTab === "entities"
                      ? "text-primary border-b-2 border-primary -mb-[1px]"
                      : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <div class="flex items-center gap-2">
                    <Package class="w-4 h-4" />
                    Entities
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div class="p-6">
              {activeTab === "dashboard" && <DashboardTab user={user} />}
              {activeTab === "sales" && <SalesOrdersTab user={user} />}
              {activeTab === "entities" && <EntitiesTab user={user} />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}