import { ApiResponse, BaseApiClient } from "../base-api-client.ts";
import type {
  CreateSubscriptionPlanData,
  SubscriptionFilters,
  SubscriptionPlan,
  SubscriptionPlanListResponse,
  SubscriptionStatistics,
  UpdateSubscriptionPlanData,
  UserSubscription,
} from "../../../types/admin.ts";

export class SubscriptionApiClient extends BaseApiClient {
  async getSubscriptionPlans(
    filters: SubscriptionFilters = {},
  ): Promise<ApiResponse<SubscriptionPlanListResponse>> {
    try {
      const queryString = this.buildQueryParams({
        status: filters.status,
        interval: filters.interval,
        search: filters.search,
        limit: filters.limit,
        offset: filters.offset,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      });

      const endpoint = `/subscriptions/plans${queryString ? `?${queryString}` : ""}`;
      return await this.makeRequest<SubscriptionPlanListResponse>(endpoint);
    } catch (error) {
      console.error("Failed to fetch subscription plans:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to fetch subscription plans",
      };
    }
  }

  async getSubscriptionPlan(planId: string): Promise<ApiResponse<SubscriptionPlan>> {
    return await this.makeRequest<SubscriptionPlan>(`/subscriptions/plans/${planId}`);
  }

  async createSubscriptionPlan(
    planData: CreateSubscriptionPlanData,
  ): Promise<ApiResponse<SubscriptionPlan>> {
    return await this.makeRequest<SubscriptionPlan>("/subscriptions/plans", {
      method: "POST",
      body: JSON.stringify(planData),
    });
  }

  async updateSubscriptionPlan(
    planId: string,
    planData: UpdateSubscriptionPlanData,
  ): Promise<ApiResponse<SubscriptionPlan>> {
    return await this.makeRequest<SubscriptionPlan>(`/subscriptions/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(planData),
    });
  }

  async deleteSubscriptionPlan(planId: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/subscriptions/plans/${planId}`, {
      method: "DELETE",
    });
  }

  async updateSubscriptionPlanStatus(
    planId: string,
    status: string,
  ): Promise<ApiResponse<SubscriptionPlan>> {
    return await this.makeRequest<SubscriptionPlan>(`/subscriptions/plans/${planId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async searchSubscriptionPlans(
    query: string,
    limit: number = 20,
  ): Promise<ApiResponse<SubscriptionPlan[]>> {
    const queryString = this.buildQueryParams({ search: query, limit });
    return await this.makeRequest<SubscriptionPlan[]>(`/subscriptions/plans/search?${queryString}`);
  }

  async getSubscriptionStatistics(): Promise<ApiResponse<SubscriptionStatistics>> {
    return await this.makeRequest<SubscriptionStatistics>("/subscriptions/statistics");
  }

  async getUserSubscriptions(filters: {
    userId?: string;
    planId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<UserSubscription[]>> {
    try {
      const queryString = this.buildQueryParams({
        user_id: filters.userId,
        plan_id: filters.planId,
        status: filters.status,
        limit: filters.limit,
        offset: filters.offset,
      });

      const endpoint = `/subscriptions/users${queryString ? `?${queryString}` : ""}`;
      return await this.makeRequest<UserSubscription[]>(endpoint);
    } catch (error) {
      console.error("Failed to fetch user subscriptions:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to fetch user subscriptions",
      };
    }
  }

  async getSubscriptionPlanSubscriberCount(
    planId: string,
  ): Promise<ApiResponse<{ count: number }>> {
    return await this.makeRequest<{ count: number }>(
      `/subscriptions/plans/${planId}/subscribers/count`,
    );
  }

  async getSubscriptionPlanSubscribers(
    planId: string,
    filters: { limit?: number; offset?: number } = {},
  ): Promise<ApiResponse<UserSubscription[]>> {
    const queryString = this.buildQueryParams(filters);
    const endpoint = `/subscriptions/plans/${planId}/subscribers${
      queryString ? `?${queryString}` : ""
    }`;
    return await this.makeRequest<UserSubscription[]>(endpoint);
  }

  async createUserSubscription(subscriptionData: {
    userId: string;
    planId: string;
    status?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  }): Promise<ApiResponse<UserSubscription>> {
    return await this.makeRequest<UserSubscription>("/subscriptions/users", {
      method: "POST",
      body: JSON.stringify(subscriptionData),
    });
  }

  async updateUserSubscription(
    subscriptionId: string,
    updateData: {
      planId?: string;
      status?: string;
      currentPeriodEnd?: string;
      cancelAtPeriodEnd?: boolean;
    },
  ): Promise<ApiResponse<UserSubscription>> {
    return await this.makeRequest<UserSubscription>(`/subscriptions/users/${subscriptionId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async cancelUserSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
  ): Promise<ApiResponse<UserSubscription>> {
    return await this.makeRequest<UserSubscription>(
      `/subscriptions/users/${subscriptionId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({ cancel_at_period_end: cancelAtPeriodEnd }),
      },
    );
  }

  async reactivateUserSubscription(subscriptionId: string): Promise<ApiResponse<UserSubscription>> {
    return await this.makeRequest<UserSubscription>(
      `/subscriptions/users/${subscriptionId}/reactivate`,
      {
        method: "POST",
      },
    );
  }

  async getRevenueAnalytics(filters: {
    startDate?: string;
    endDate?: string;
    interval?: "day" | "week" | "month" | "year";
  } = {}): Promise<
    ApiResponse<{
      monthlyRecurringRevenue: number;
      yearlyRecurringRevenue: number;
      revenueByPlan: { planId: string; planName: string; revenue: number }[];
      revenueOverTime: { date: string; revenue: number }[];
    }>
  > {
    const queryString = this.buildQueryParams({
      start_date: filters.startDate,
      end_date: filters.endDate,
      interval: filters.interval,
    });

    const endpoint = `/subscriptions/analytics/revenue${queryString ? `?${queryString}` : ""}`;
    return await this.makeRequest(endpoint);
  }

  async getChurnAnalytics(filters: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<
    ApiResponse<{
      churnRate: number;
      canceledSubscriptions: number;
      totalSubscriptions: number;
      churnByPlan: { planId: string; planName: string; churnRate: number }[];
      churnReasons: { reason: string; count: number }[];
    }>
  > {
    const queryString = this.buildQueryParams({
      start_date: filters.startDate,
      end_date: filters.endDate,
    });

    const endpoint = `/subscriptions/analytics/churn${queryString ? `?${queryString}` : ""}`;
    return await this.makeRequest(endpoint);
  }

  async exportSubscriptionData(filters: {
    planId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<{ downloadUrl: string }>> {
    const queryString = this.buildQueryParams({
      plan_id: filters.planId,
      status: filters.status,
      start_date: filters.startDate,
      end_date: filters.endDate,
    });

    const endpoint = `/subscriptions/export${queryString ? `?${queryString}` : ""}`;
    return await this.makeRequest<{ downloadUrl: string }>(endpoint, {
      method: "POST",
    });
  }

  async syncStripeSubscriptions(): Promise<ApiResponse<{ synced: number; errors: string[] }>> {
    return await this.makeRequest<{ synced: number; errors: string[] }>(
      "/subscriptions/sync/stripe",
      {
        method: "POST",
      },
    );
  }
}
