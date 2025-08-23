import { useEffect, useState } from "preact/hooks";
import { useApi } from "./useApi.ts";
import {
  CreateEntityRequest,
  Entity,
  EntityUpdateData,
  UpdateEntityRequest,
} from "@suppers/shared";

export function useEntities() {
  const { apiClient, loading: apiLoading } = useApi();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntities = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.entities.getEntities();
      setEntities(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entities");
    } finally {
      setLoading(false);
    }
  };

  const createNewEntity = async (entityData: CreateEntityRequest) => {
    if (!apiClient) return null;

    try {
      setError(null);
      const response = await apiClient.entities.createEntity(entityData);
      await fetchEntities(); // Refresh the list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entity");
      return null;
    }
  };

  const updateEntity = async (id: string, entityData: UpdateEntityRequest) => {
    if (!apiClient) return null;

    try {
      setError(null);
      const response = await apiClient.entities.updateEntity(id, entityData);
      await fetchEntities(); // Refresh the list
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update entity");
      return null;
    }
  };

  const deleteEntity = async (id: string) => {
    if (!apiClient) return false;

    try {
      setError(null);
      await apiClient.entities.deleteEntity(id);
      await fetchEntities(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entity");
      return false;
    }
  };

  const connectToApplication = async (entityId: string, applicationId: string) => {
    if (!apiClient) return false;

    try {
      setError(null);
      await apiClient.entities.connectEntityToApplication(entityId, applicationId);
      await fetchEntities(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect entity to application");
      return false;
    }
  };

  const disconnectFromApplication = async (entityId: string, applicationId: string) => {
    if (!apiClient) return false;

    try {
      setError(null);
      await apiClient.entities.disconnectEntityFromApplication(entityId, applicationId);
      await fetchEntities(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect entity from application");
      return false;
    }
  };

  const getEntitiesForApplication = async (applicationId: string) => {
    if (!apiClient) return [];

    try {
      setError(null);
      const response = await apiClient.entities.getEntitiesForApplication(applicationId);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entities for application");
      return [];
    }
  };

  useEffect(() => {
    if (apiClient && !apiLoading) {
      fetchEntities();
    }
  }, [apiClient, apiLoading]);

  return {
    entities,
    loading,
    error,
    fetchEntities,
    createEntity: createNewEntity,
    updateEntity,
    deleteEntity,
    connectToApplication,
    disconnectFromApplication,
    getEntitiesForApplication,
  };
}
