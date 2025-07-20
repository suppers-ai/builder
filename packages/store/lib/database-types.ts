export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          middle_names: string | null;
          last_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          middle_names?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          middle_names?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          template_id: string;
          configuration: Json;
          status: "draft" | "pending" | "published" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          template_id: string;
          configuration: Json;
          status?: "draft" | "pending" | "published" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          template_id?: string;
          configuration?: Json;
          status?: "draft" | "pending" | "published" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_access: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          access_level: "read" | "write" | "admin";
          granted_at: string;
          granted_by: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          access_level: "read" | "write" | "admin";
          granted_at?: string;
          granted_by: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string;
          access_level?: "read" | "write" | "admin";
          granted_at?: string;
          granted_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_access_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_access_granted_by_fkey";
            columns: ["granted_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_access_application_id_fkey";
            columns: ["application_id"];
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      oauth_codes: {
        Row: {
          id: string;
          code: string;
          client_id: string;
          redirect_uri: string;
          scope: string;
          state: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          client_id: string;
          redirect_uri: string;
          scope: string;
          state?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          client_id?: string;
          redirect_uri?: string;
          scope?: string;
          state?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      oauth_tokens: {
        Row: {
          id: string;
          access_token: string;
          refresh_token: string | null;
          client_id: string;
          user_id: string | null;
          scope: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          access_token: string;
          refresh_token?: string | null;
          client_id: string;
          user_id?: string | null;
          scope: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          access_token?: string;
          refresh_token?: string | null;
          client_id?: string;
          user_id?: string | null;
          scope?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oauth_tokens_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      oauth_clients: {
        Row: {
          id: string;
          client_id: string;
          client_secret: string;
          name: string;
          description: string | null;
          redirect_uris: string[];
          allowed_scopes: string[];
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          client_secret: string;
          name: string;
          description?: string | null;
          redirect_uris: string[];
          allowed_scopes: string[];
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          client_secret?: string;
          name?: string;
          description?: string | null;
          redirect_uris?: string[];
          allowed_scopes?: string[];
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oauth_clients_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      application_reviews: {
        Row: {
          id: string;
          application_id: string;
          reviewer_id: string;
          action: "approved" | "rejected";
          feedback: string | null;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          reviewer_id: string;
          action: "approved" | "rejected";
          feedback?: string | null;
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          reviewer_id?: string;
          action?: "approved" | "rejected";
          feedback?: string | null;
          reviewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_reviews_application_id_fkey";
            columns: ["application_id"];
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "application_reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_themes: {
        Row: {
          id: string;
          name: string;
          label: string;
          description: string | null;
          variables: Json;
          created_by: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          label: string;
          description?: string | null;
          variables: Json;
          created_by: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          label?: string;
          description?: string | null;
          variables?: Json;
          created_by?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "custom_themes_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
