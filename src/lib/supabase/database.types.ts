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
      application_answers: {
        Row: {
          id: string
          submission_id: string
          question_id: string
          answer_text: string | null
        }
        Insert: {
          id?: string
          submission_id: string
          question_id: string
          answer_text?: string | null
        }
        Update: {
          id?: string
          submission_id?: string
          question_id?: string
          answer_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "application_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "application_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      application_questions: {
        Row: {
          id: string
          application_id: string
          question_text: string
          question_type: 'text' | 'textarea' | 'multiple_choice'
          is_required: boolean
          order: number
          options: Json | null
        }
        Insert: {
          id?: string
          application_id: string
          question_text: string
          question_type: 'text' | 'textarea' | 'multiple_choice'
          is_required?: boolean
          order?: number
          options?: Json | null
        }
        Update: {
          id?: string
          application_id?: string
          question_text?: string
          question_type?: 'text' | 'textarea' | 'multiple_choice'
          is_required?: boolean
          order?: number
          options?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "application_questions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "club_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_interviews: {
        Row: {
          id: string
          submission_id: string
          interview_round: number
          interview_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          interview_round?: number
          interview_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          interview_round?: number
          interview_time?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_interviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "application_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      application_submissions: {
        Row: {
          id: string
          application_id: string
          student_id: string
          submitted_at: string
          status: 'pending' | 'interview' | 'accepted' | 'rejected'
        }
        Insert: {
          id?: string
          application_id: string
          student_id: string
          submitted_at?: string
          status?: 'pending' | 'interview' | 'accepted' | 'rejected'
        }
        Update: {
          id?: string
          application_id?: string
          student_id?: string
          submitted_at?: string
          status?: 'pending' | 'interview' | 'accepted' | 'rejected'
        }
        Relationships: [
          {
            foreignKeyName: "application_submissions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "club_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      club_applications: {
        Row: {
          id: string
          club_id: string
          title: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          title: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          title?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_applications_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_events: {
        Row: {
          club_id: string
          created_at: string
          description: string | null
          event_type: string
          id: string
          location: string
          status: string
          time: string
          title: string | null
        }
        Insert: {
          club_id: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          location?: string
          status?: string
          time: string
          title?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          location?: string
          status?: string
          time?: string
          title?: string | null
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
          application_deadline: string | null
          attandence_required: number
          club_banner_image: string | null
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
          uses_applications: boolean
        }
        Insert: {
          access_code?: string | null
          application_deadline?: string | null
          attandence_required?: number
          club_banner_image?: string | null
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
          uses_applications?: boolean
        }
        Update: {
          access_code?: string | null
          application_deadline?: string | null
          attandence_required?: number
          club_banner_image?: string | null
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
          uses_applications?: boolean
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
          github_url: string | null
          id: string
          instagram_url: string | null
          last_name: string | null
          linkedin_url: string | null
          major: string | null
          portfolio_url: string | null
          resume: string | null
          university_id: string | null
          updated_at: string
          x_url: string | null
        }
        Insert: {
          academic_year?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          major?: string | null
          portfolio_url?: string | null
          resume?: string | null
          university_id?: string | null
          updated_at?: string
          x_url?: string | null
        }
        Update: {
          academic_year?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          major?: string | null
          portfolio_url?: string | null
          resume?: string | null
          university_id?: string | null
          updated_at?: string
          x_url?: string | null
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
          attendance_score: number
          club_id: string
          created_at: string
          is_admin: boolean
          is_owner: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendance_score?: number
          club_id: string
          created_at?: string
          is_admin?: boolean
          is_owner?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendance_score?: number
          club_id?: string
          created_at?: string
          is_admin?: boolean
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
      user_activities: {
        Row: {
          activity: string
          club_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity: string
          club_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity?: string
          club_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      update_own_user_profile: {
        Args: {
          p_academic_year: string
          p_bio: string
          p_first_name: string
          p_github_url: string
          p_instagram_url: string
          p_interest_ids: string[]
          p_last_name: string
          p_linkedin_url: string
          p_major: string
          p_portfolio_url: string
          p_resume: string | null
          p_skill_ids: string[]
          p_x_url: string
        }
        Returns: undefined
      }
      create_application_submission_if_open: {
        Args: { p_application_id: string; p_club_id: string }
        Returns: string
      }
      change_club_member_role: {
        Args: { p_club_id: string; p_role: string; p_user_id: string }
        Returns: undefined
      }
      club_events_can_manage: {
        Args: { p_club_id: string }
        Returns: boolean
      }
      club_events_is_member: {
        Args: { p_club_id: string }
        Returns: boolean
      }
      club_branding_can_manage: {
        Args: { p_club_id: string }
        Returns: boolean
      }
      club_branding_can_manage_object: {
        Args: { object_name: string }
        Returns: boolean
      }
      club_branding_decode_object_path: {
        Args: { encoded_path: string }
        Returns: string
      }
      get_admin_dashboard: {
        Args: { p_club_id: string }
        Returns: Json
      }
      get_club_viewer_state: {
        Args: { p_club_id: string }
        Returns: Json
      }
      get_club_members: {
        Args: { p_club_id: string }
        Returns: {
          academic_year: string | null
          first_name: string | null
          is_owner: boolean
          last_name: string | null
          major: string | null
          title: string
          user_id: string
        }[]
      }
      get_application_review: {
        Args: { p_club_id: string; p_submission_id: string }
        Returns: Json
      }
      get_recent_club_member_activities: {
        Args: { p_club_id: string }
        Returns: {
          activity: string
          created_at: string
          id: string
          user_id: string
        }[]
      }
      review_application_submission: {
        Args: {
          p_club_id: string
          p_interview_time?: string | null
          p_status: string
          p_submission_id: string
        }
        Returns: undefined
      }
      update_club_profile: {
        Args: {
          p_application_deadline: string | null
          p_club_banner_image: string | null
          p_club_id: string
          p_club_image: string | null
          p_description: string | null
          p_name: string
          p_type: string | null
          p_uses_applications: boolean
        }
        Returns: undefined
      }
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
