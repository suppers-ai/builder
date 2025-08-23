import { useEffect, useState } from "preact/hooks";
import { useApi } from "./useApi.ts";
import { Application, createApplication } from "../payment/application.ts";

export function useApplications() {
  const { apiClient, loading: apiLoading } = useApi();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.applications.getApplications();
      // The API returns { applications: [...] }, so extract the applications array
      setApplications(Array.isArray(response) ? response : (response as any)?.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const createNewApplication = async (applicationData: Partial<Application>) => {
    if (!apiClient) return null;

    try {
      setError(null);
      const application = createApplication(applicationData);
      const response = await apiClient.applications.createApplication(application);
      await fetchApplications(); // Refresh the list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create application");
      return null;
    }
  };

  const updateApplication = async (id: string, applicationData: Partial<Application>) => {
    if (!apiClient) return null;

    try {
      setError(null);
      const response = await apiClient.applications.updateApplication(id, applicationData);
      await fetchApplications(); // Refresh the list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update application");
      return null;
    }
  };

  const deleteApplication = async (id: string) => {
    if (!apiClient) return false;

    try {
      setError(null);
      await apiClient.applications.deleteApplication(id);
      await fetchApplications(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete application");
      return false;
    }
  };

  useEffect(() => {
    if (apiClient && !apiLoading) {
      fetchApplications();
    }
  }, [apiClient, apiLoading]);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication: createNewApplication,
    updateApplication,
    deleteApplication,
  };
}
