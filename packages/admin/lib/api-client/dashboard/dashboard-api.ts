import { ApiResponse, BaseApiClient } from "../base-api-client.ts";

export class DashboardApiClient extends BaseApiClient {
  async getDashboardMetrics(): Promise<ApiResponse<any>> {
    return await this.makeRequest<any>("/dashboard");
  }
}
