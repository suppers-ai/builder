import { useEffect, useState } from "preact/hooks";
import { PaymentsApiClient } from "../lib/api-client/payments-api.ts";
import { getAuthClient } from "../lib/auth.ts";

export function useApi() {
  const [apiClient, setApiClient] = useState<PaymentsApiClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initApi = async () => {
      try {
        setLoading(true);

        const authClient = getAuthClient();
        await authClient.initialize();

        // Check if user is authenticated
        const user = await authClient.getUser();
        setIsAuthenticated(!!user);

        // Create API client
        const client = new PaymentsApiClient(authClient);
        setApiClient(client);
      } catch (error) {
        console.error("❌ Failed to initialize API client:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initApi();
  }, []);

  return { apiClient, loading, isAuthenticated };
}
