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
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["application_status"]
          thumbnail_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["application_status"]
          thumbnail_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["application_status"]
          thumbnail_url?: string | null
          updated_at?: string
          website_url?: string | null
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
          parent_id: string | null
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
          parent_id?: string | null
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
          parent_id?: string | null
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
          {
            foreignKeyName: "storage_objects_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "storage_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          application_id: string | null
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          interval: Database["public"]["Enums"]["subscription_interval"]
          is_popular: boolean | null
          metadata: Json | null
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price: number
          sort_order: number | null
          status: Database["public"]["Enums"]["subscription_plan_status"]
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval?: Database["public"]["Enums"]["subscription_interval"]
          is_popular?: boolean | null
          metadata?: Json | null
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price?: number
          sort_order?: number | null
          status?: Database["public"]["Enums"]["subscription_plan_status"]
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval?: Database["public"]["Enums"]["subscription_interval"]
          is_popular?: boolean | null
          metadata?: Json | null
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          price?: number
          sort_order?: number | null
          status?: Database["public"]["Enums"]["subscription_plan_status"]
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          metadata: Json | null
          plan_id: string
          status: Database["public"]["Enums"]["user_subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          metadata?: Json | null
          plan_id: string
          status?: Database["public"]["Enums"]["user_subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          plan_id?: string
          status?: Database["public"]["Enums"]["user_subscription_status"]
          stripe_customer_id?: string | null
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
          status: Database["public"]["Enums"]["user_status"]
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
          status?: Database["public"]["Enums"]["user_status"]
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
          status?: Database["public"]["Enums"]["user_status"]
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
      get_plan_subscriber_count: {
        Args: { plan_id: string }
        Returns: number
      }
      get_user_application_subscriptions: {
        Args: { user_uuid: string }
        Returns: {
          application_id: string
          application_name: string
          current_period_end: string
          features: Json
          plan_id: string
          plan_name: string
          subscription_id: string
        }[]
      }
      get_user_general_subscription: {
        Args: { user_uuid: string }
        Returns: {
          bandwidth_limit: number
          bandwidth_used: number
          current_period_end: string
          plan_id: string
          plan_name: string
          storage_limit: number
          storage_used: number
          subscription_id: string
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
      user_has_application_feature: {
        Args: { app_uuid: string; feature_key_param: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status: "draft" | "pending" | "published" | "archived"
      review_status: "pending" | "approved" | "rejected"
      subscription_interval: "monthly" | "yearly"
      subscription_plan_status: "active" | "inactive" | "archived"
      subscription_plan_type: "general" | "application"
      user_role: "user" | "admin"
      user_status: "active" | "suspended" | "deleted"
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
      application_status: ["draft", "pending", "published", "archived"],
      review_status: ["pending", "approved", "rejected"],
      subscription_interval: ["monthly", "yearly"],
      subscription_plan_status: ["active", "inactive", "archived"],
      subscription_plan_type: ["general", "application"],
      user_role: ["user", "admin"],
      user_status: ["active", "suspended", "deleted"],
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

