/**
 * Subscription database functions for admin operations
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../shared/generated/database-types.ts";
import type {
  CreateSubscriptionPlanData,
  DatabaseSubscriptionPlan,
  DatabaseUserSubscription,
  SubscriptionFilters,
  SubscriptionPlan,
  SubscriptionPlanListResponse,
  SubscriptionStatistics,
  UpdateSubscriptionPlanData,
  UserSubscription,
} from "../types/admin.ts";

type SupabaseClient = ReturnType<typeof createClient<Database>>;

/**
 * Transform database subscription plan to admin interface
 */
function transformSubscriptionPlan(dbPlan: DatabaseSubscriptionPlan): SubscriptionPlan {
  const features = Array.isArray(dbPlan.features) ? dbPlan.features as any[] : [];
  const limits = typeof dbPlan.limits === "object" && dbPlan.limits !== null
    ? dbPlan.limits as any
    : {};

  return {
    id: dbPlan.id,
    name: dbPlan.name,
    description: dbPlan.description,
    price: dbPlan.price,
    currency: dbPlan.currency,
    interval: dbPlan.interval,
    status: dbPlan.status,
    isPopular: dbPlan.is_popular,
    stripePriceId: dbPlan.stripe_price_id,
    features: features.map((feature: any, index: number) => ({
      id: `${dbPlan.id}-feature-${index}`,
      name: feature.name || "",
      description: feature.description || "",
      enabled: feature.enabled || false,
    })),
    limits: {
      applications: limits.applications || 0,
      storage: limits.storage || 0,
      bandwidth: limits.bandwidth || 0,
      customDomains: limits.customDomains || 0,
      apiCalls: limits.apiCalls || 0,
    },
    subscriberCount: 0, // Will be populated separately
    createdAt: dbPlan.created_at,
    updatedAt: dbPlan.updated_at,
  };
}

/**
 * Transform database user subscription to admin interface
 */
function transformUserSubscription(
  dbSubscription: DatabaseUserSubscription,
  plan?: SubscriptionPlan,
): UserSubscription {
  return {
    id: dbSubscription.id,
    userId: dbSubscription.user_id,
    planId: dbSubscription.plan_id,
    plan: plan || {} as SubscriptionPlan, // Will be populated if provided
    status: dbSubscription.status,
    currentPeriodStart: dbSubscription.current_period_start,
    currentPeriodEnd: dbSubscription.current_period_end,
    cancelAtPeriodEnd: dbSubscription.cancel_at_period_end,
    stripeSubscriptionId: dbSubscription.stripe_subscription_id,
    createdAt: dbSubscription.created_at,
    updatedAt: dbSubscription.updated_at,
  };
}

/**
 * Get all subscription plans with filtering and pagination
 */
export async function getSubscriptionPlans(
  supabase: SupabaseClient,
  filters: SubscriptionFilters = {},
): Promise<SubscriptionPlanListResponse> {
  const {
    status,
    interval,
    search,
    limit = 20,
    offset = 0,
    sortBy = "created_at",
    sortOrder = "desc",
  } = filters;

  let query = supabase
    .from("subscription_plans")
    .select("*", { count: "exact" });

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }

  if (interval) {
    query = query.eq("interval", interval);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch subscription plans: ${error.message}`);
  }

  const plans = (data || []).map(transformSubscriptionPlan);

  // Get subscriber counts for each plan
  const planIds = plans.map((plan) => plan.id);
  if (planIds.length > 0) {
    const { data: subscriberCounts } = await supabase
      .from("user_subscriptions")
      .select("plan_id")
      .in("plan_id", planIds)
      .in("status", ["active", "trialing"]);

    const countMap = new Map<string, number>();
    subscriberCounts?.forEach((sub) => {
      countMap.set(sub.plan_id, (countMap.get(sub.plan_id) || 0) + 1);
    });

    plans.forEach((plan) => {
      plan.subscriberCount = countMap.get(plan.id) || 0;
    });
  }

  return {
    plans,
    total: count || 0,
    page: Math.floor(offset / limit) + 1,
    limit,
    hasMore: (count || 0) > offset + limit,
  };
}

/**
 * Get a single subscription plan by ID
 */
export async function getSubscriptionPlan(
  supabase: SupabaseClient,
  planId: string,
): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Plan not found
    }
    throw new Error(`Failed to fetch subscription plan: ${error.message}`);
  }

  const plan = transformSubscriptionPlan(data);

  // Get subscriber count
  const { count } = await supabase
    .from("user_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("plan_id", planId)
    .in("status", ["active", "trialing"]);

  plan.subscriberCount = count || 0;

  return plan;
}

/**
 * Create a new subscription plan
 */
export async function createSubscriptionPlan(
  supabase: SupabaseClient,
  planData: CreateSubscriptionPlanData,
): Promise<SubscriptionPlan> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .insert({
      name: planData.name,
      description: planData.description,
      price: planData.price,
      currency: planData.currency,
      interval: planData.interval,
      status: planData.status || "active",
      is_popular: planData.isPopular || false,
      stripe_price_id: planData.stripePriceId,
      features: planData.features,
      limits: planData.limits,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create subscription plan: ${error.message}`);
  }

  return transformSubscriptionPlan(data);
}

/**
 * Update a subscription plan
 */
export async function updateSubscriptionPlan(
  supabase: SupabaseClient,
  planId: string,
  planData: UpdateSubscriptionPlanData,
): Promise<SubscriptionPlan> {
  const updateData: any = {};

  if (planData.name !== undefined) updateData.name = planData.name;
  if (planData.description !== undefined) updateData.description = planData.description;
  if (planData.price !== undefined) updateData.price = planData.price;
  if (planData.currency !== undefined) updateData.currency = planData.currency;
  if (planData.interval !== undefined) updateData.interval = planData.interval;
  if (planData.status !== undefined) updateData.status = planData.status;
  if (planData.isPopular !== undefined) updateData.is_popular = planData.isPopular;
  if (planData.stripePriceId !== undefined) updateData.stripe_price_id = planData.stripePriceId;
  if (planData.features !== undefined) updateData.features = planData.features;
  if (planData.limits !== undefined) updateData.limits = planData.limits;

  const { data, error } = await supabase
    .from("subscription_plans")
    .update(updateData)
    .eq("id", planId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update subscription plan: ${error.message}`);
  }

  const plan = transformSubscriptionPlan(data);

  // Get subscriber count
  const { count } = await supabase
    .from("user_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("plan_id", planId)
    .in("status", ["active", "trialing"]);

  plan.subscriberCount = count || 0;

  return plan;
}

/**
 * Delete a subscription plan
 */
export async function deleteSubscriptionPlan(
  supabase: SupabaseClient,
  planId: string,
): Promise<void> {
  // Check if plan has active subscribers
  const { count } = await supabase
    .from("user_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("plan_id", planId)
    .in("status", ["active", "trialing"]);

  if (count && count > 0) {
    throw new Error("Cannot delete subscription plan with active subscribers");
  }

  const { error } = await supabase
    .from("subscription_plans")
    .delete()
    .eq("id", planId);

  if (error) {
    throw new Error(`Failed to delete subscription plan: ${error.message}`);
  }
}

/**
 * Get subscription statistics for admin dashboard
 */
export async function getSubscriptionStatistics(
  supabase: SupabaseClient,
): Promise<SubscriptionStatistics> {
  // Get total plans and active plans
  const { data: plansData, error: plansError } = await supabase
    .from("subscription_plans")
    .select("id, name, status, interval, price, currency");

  if (plansError) {
    throw new Error(`Failed to fetch subscription statistics: ${plansError.message}`);
  }

  const totalPlans = plansData?.length || 0;
  const activePlans = plansData?.filter((plan) => plan.status === "active").length || 0;

  // Get all subscriptions with plan details
  const { data: subscriptionsData, error: subscriptionsError } = await supabase
    .from("user_subscriptions")
    .select(`
      *,
      subscription_plans (
        id,
        name,
        price,
        currency,
        interval
      )
    `)
    .in("status", ["active", "trialing"]);

  if (subscriptionsError) {
    throw new Error(`Failed to fetch subscription statistics: ${subscriptionsError.message}`);
  }

  const subscriptions = subscriptionsData || [];
  const totalSubscribers = subscriptions.length;

  // Calculate revenue
  let monthlyRevenue = 0;
  let yearlyRevenue = 0;

  subscriptions.forEach((sub) => {
    const plan = sub.subscription_plans as any;
    if (plan && sub.status === "active") {
      if (plan.interval === "month") {
        monthlyRevenue += plan.price;
      } else if (plan.interval === "year") {
        yearlyRevenue += plan.price;
      }
    }
  });

  // Count plans by interval
  const plansByInterval = {
    monthly: plansData?.filter((plan) => plan.interval === "month").length || 0,
    yearly: plansData?.filter((plan) => plan.interval === "year").length || 0,
  };

  // Count subscribers by plan
  const subscribersByPlan = new Map<string, { planName: string; count: number }>();
  subscriptions.forEach((sub) => {
    const plan = sub.subscription_plans as any;
    if (plan) {
      const existing = subscribersByPlan.get(plan.id) || { planName: plan.name, count: 0 };
      existing.count += 1;
      subscribersByPlan.set(plan.id, existing);
    }
  });

  // Get recent subscriptions (last 10)
  const { data: recentSubscriptionsData } = await supabase
    .from("user_subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  const recentSubscriptions = (recentSubscriptionsData || []).map((sub) => {
    const plan = sub.subscription_plans as any;
    return transformUserSubscription(sub, plan ? transformSubscriptionPlan(plan) : undefined);
  });

  return {
    totalPlans,
    activePlans,
    totalSubscribers,
    monthlyRevenue,
    yearlyRevenue,
    plansByInterval,
    subscribersByPlan: Array.from(subscribersByPlan.entries()).map(([planId, data]) => ({
      planId,
      planName: data.planName,
      subscriberCount: data.count,
    })),
    recentSubscriptions,
  };
}

/**
 * Get user subscriptions with filtering
 */
export async function getUserSubscriptions(
  supabase: SupabaseClient,
  filters: { userId?: string; planId?: string; status?: string; limit?: number; offset?: number } =
    {},
): Promise<UserSubscription[]> {
  const { userId, planId, status, limit = 50, offset = 0 } = filters;

  let query = supabase
    .from("user_subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (planId) {
    query = query.eq("plan_id", planId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch user subscriptions: ${error.message}`);
  }

  return (data || []).map((sub) => {
    const plan = sub.subscription_plans as any;
    return transformUserSubscription(sub, plan ? transformSubscriptionPlan(plan) : undefined);
  });
}
