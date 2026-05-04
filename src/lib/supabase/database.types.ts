export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      club_announcements: {
        Row: {
          id: string
          club_id: string
          user_id: string
          title: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          title: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          user_id?: string
          title?: string
          body?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_announcements_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_announcements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_interests: {
        Row: {
          club_id: string
          created_at: string
          interest_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          interest_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          interest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_interests_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interest_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      club_skills: {
        Row: {
          club_id: string
          created_at: string
          skill_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          skill_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_skills_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          access_code: string | null
          created_at: string
          description: string | null
          history: string | null
          id: string
          member_count: number | null
          name: string | null
          type: string | null
          university_id: string | null
          updated_at: string
          club_image: string | null
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          description?: string | null
          history?: string | null
          id?: string
          member_count?: number | null
          name?: string | null
          type?: string | null
          university_id?: string | null
          updated_at?: string
          club_image?: string | null
        }
        Update: {
          access_code?: string | null
          created_at?: string
          description?: string | null
          history?: string | null
          id?: string
          member_count?: number | null
          name?: string | null
          type?: string | null
          university_id?: string | null
          updated_at?: string
          club_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      club_projects: {
        Row: {
          id: string
          club_id: string
          created_at: string
          description: string | null
          title: string | null
        }
        Insert: {
          id?: string
          club_id: string
          created_at?: string
          description?: string | null
          title?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          created_at?: string
          description?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_projects_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_events: {
        Row: {
          id: string
          club_id: string
          created_at: string
          title: string | null
          description: string | null
          time: string
        }
        Insert: {
          id?: string
          club_id: string
          created_at?: string
          title?: string | null
          description?: string | null
          time: string
        }
        Update: {
          id?: string
          club_id?: string
          created_at?: string
          title?: string | null
          description?: string | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_year: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          major: string | null
          university_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          major?: string | null
          university_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          major?: string | null
          university_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          country: string | null
          email_domain: string | null
          id: string
          name: string | null
          slug: string
          website_url: string | null
        }
        Insert: {
          country?: string | null
          email_domain?: string | null
          id?: string
          name?: string | null
          slug: string
          website_url?: string | null
        }
        Update: {
          country?: string | null
          email_domain?: string | null
          id?: string
          name?: string | null
          slug?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string
          interest_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          interest_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          interest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interest_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          club_id: string
          created_at: string
          is_owner: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          is_owner?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          is_owner?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          created_at: string
          skill_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          skill_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_tags"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
