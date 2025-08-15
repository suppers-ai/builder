export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      application_reviews: {
        Row: {
          application_id: string
          feedback: string | null
          id: string
          reviewed_at: string
          reviewer_id: string
          status: Database["public"]["Enums"]["review_status"]
        }
        Insert: {
          application_id: string
          feedback?: string | null
          id?: string
          reviewed_at?: string
          reviewer_id: string
          status: Database["public"]["Enums"]["review_status"]
        }
        Update: {
          application_id?: string
          feedback?: string | null
          id?: string
          reviewed_at?: string
          reviewer_id?: string
          status?: Database["public"]["Enums"]["review_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          configuration: Json
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          slug: string
          status: Database["public"]["Enums"]["application_status"]
          template_id: string | null
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          slug: string
          status?: Database["public"]["Enums"]["application_status"]
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["application_status"]
          template_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          admin_email: string
          admin_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          description: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          session_id: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          admin_email: string
          admin_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          description: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          admin_email?: string
          admin_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          description?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      custom_themes: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          theme_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          theme_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          theme_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      storage_objects: {
        Row: {
          application_id: string | null
          created_at: string
          file_path: string
          file_size: number
          id: string
          is_public: boolean
          metadata: Json
          mime_type: string
          name: string
          object_type: string
          share_token: string | null
          shared_with_emails: string[] | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          file_path: string
          file_size: number
          id?: string
          is_public?: boolean
          metadata?: Json
          mime_type: string
          name: string
          object_type: string
          share_token?: string | null
          shared_with_emails?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          file_path?: string
          file_size?: number
          id?: string
          is_public?: boolean
          metadata?: Json
          mime_type?: string
          name?: string
          object_type?: string
          share_token?: string | null
          shared_with_emails?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_objects_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          description: string
          features: Json
          id: string
          interval: Database["public"]["Enums"]["subscription_interval"]
          is_popular: boolean
          limits: Json
          name: string
          price: number
          status: Database["public"]["Enums"]["subscription_plan_status"]
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description: string
          features?: Json
          id?: string
          interval: Database["public"]["Enums"]["subscription_interval"]
          is_popular?: boolean
          limits?: Json
          name: string
          price: number
          status?: Database["public"]["Enums"]["subscription_plan_status"]
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string
          features?: Json
          id?: string
          interval?: Database["public"]["Enums"]["subscription_interval"]
          is_popular?: boolean
          limits?: Json
          name?: string
          price?: number
          status?: Database["public"]["Enums"]["subscription_plan_status"]
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_access: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          application_id: string
          granted_at: string
          granted_by: string
          id: string
          user_id: string
        }
        Insert: {
          access_level: Database["public"]["Enums"]["access_level"]
          application_id: string
          granted_at?: string
          granted_by: string
          id?: string
          user_id: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          application_id?: string
          granted_at?: string
          granted_by?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_access_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["user_subscription_status"]
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status: Database["public"]["Enums"]["user_subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["user_subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bandwidth_limit: number
          bandwidth_used: number
          created_at: string
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          storage_limit: number
          storage_used: number
          stripe_customer_id: string | null
          theme_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bandwidth_limit?: number
          bandwidth_used?: number
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          storage_limit?: number
          storage_used?: number
          stripe_customer_id?: string | null
          theme_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bandwidth_limit?: number
          bandwidth_used?: number
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          storage_limit?: number
          storage_used?: number
          stripe_customer_id?: string | null
          theme_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_audit_log: {
        Args: {
          p_action: Database["public"]["Enums"]["audit_action"]
          p_admin_email: string
          p_admin_user_id: string
          p_after_data?: Json
          p_before_data?: Json
          p_description?: string
          p_error_message?: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_resource_id?: string
          p_resource_name?: string
          p_resource_type: string
          p_session_id?: string
          p_success?: boolean
          p_user_agent?: string
        }
        Returns: string
      }
      get_audit_log_stats: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_audit_logs: {
        Args: {
          p_action?: Database["public"]["Enums"]["audit_action"]
          p_admin_user_id?: string
          p_end_date?: string
          p_limit?: number
          p_offset?: number
          p_resource_id?: string
          p_resource_type?: string
          p_start_date?: string
        }
        Returns: {
          action: Database["public"]["Enums"]["audit_action"]
          admin_email: string
          admin_user_id: string
          after_data: Json
          before_data: Json
          created_at: string
          description: string
          error_message: string
          id: string
          ip_address: unknown
          metadata: Json
          resource_id: string
          resource_name: string
          resource_type: string
          session_id: string
          success: boolean
          user_agent: string
        }[]
      }
      get_plan_subscriber_count: {
        Args: { plan_id: string }
        Returns: number
      }
      get_user_subscription: {
        Args: { user_id: string }
        Returns: {
          cancel_at_period_end: boolean
          current_period_end: string
          current_period_start: string
          id: string
          plan_currency: string
          plan_id: string
          plan_interval: Database["public"]["Enums"]["subscription_interval"]
          plan_name: string
          plan_price: number
          status: Database["public"]["Enums"]["user_subscription_status"]
        }[]
      }
      increment_user_bandwidth: {
        Args: { bandwidth_delta: number; user_id: string }
        Returns: undefined
      }
      increment_user_storage: {
        Args: { size_delta: number; user_id: string }
        Returns: undefined
      }
      reset_monthly_bandwidth: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      access_level: "read" | "write" | "admin"
      application_status: "draft" | "pending" | "published" | "archived"
      audit_action:
        | "user_created"
        | "user_updated"
        | "user_deleted"
        | "user_role_changed"
        | "user_status_changed"
        | "application_created"
        | "application_updated"
        | "application_deleted"
        | "application_status_changed"
        | "application_reviewed"
        | "subscription_plan_created"
        | "subscription_plan_updated"
        | "subscription_plan_deleted"
        | "subscription_plan_status_changed"
        | "user_subscription_created"
        | "user_subscription_updated"
        | "user_subscription_cancelled"
        | "admin_login"
        | "admin_logout"
        | "bulk_operation"
        | "system_configuration_changed"
      review_status: "pending" | "approved" | "rejected"
      subscription_interval: "month" | "year"
      subscription_plan_status: "active" | "inactive" | "archived"
      user_role: "user" | "admin"
      user_subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "unpaid"
        | "trialing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      access_level: ["read", "write", "admin"],
      application_status: ["draft", "pending", "published", "archived"],
      audit_action: [
        "user_created",
        "user_updated",
        "user_deleted",
        "user_role_changed",
        "user_status_changed",
        "application_created",
        "application_updated",
        "application_deleted",
        "application_status_changed",
        "application_reviewed",
        "subscription_plan_created",
        "subscription_plan_updated",
        "subscription_plan_deleted",
        "subscription_plan_status_changed",
        "user_subscription_created",
        "user_subscription_updated",
        "user_subscription_cancelled",
        "admin_login",
        "admin_logout",
        "bulk_operation",
        "system_configuration_changed",
      ],
      review_status: ["pending", "approved", "rejected"],
      subscription_interval: ["month", "year"],
      subscription_plan_status: ["active", "inactive", "archived"],
      user_role: ["user", "admin"],
      user_subscription_status: [
        "active",
        "canceled",
        "past_due",
        "unpaid",
        "trialing",
      ],
    },
  },
} as const

