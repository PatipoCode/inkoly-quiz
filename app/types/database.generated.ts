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
      media_assets: {
        Row: {
          bytes: number | null
          created_at: string
          duration_sec: number | null
          external_url: string | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          owner_id: string
          storage_path: string | null
        }
        Insert: {
          bytes?: number | null
          created_at?: string
          duration_sec?: number | null
          external_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          owner_id: string
          storage_path?: string | null
        }
        Update: {
          bytes?: number | null
          created_at?: string
          duration_sec?: number | null
          external_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          owner_id?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          locale: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          locale?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          locale?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          correct_position: number | null
          created_at: string
          id: string
          is_correct: boolean
          position: number
          question_id: string
          text: string
        }
        Insert: {
          correct_position?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean
          position: number
          question_id: string
          text?: string
        }
        Update: {
          correct_position?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean
          position?: number
          question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answer_type: Database["public"]["Enums"]["answer_type"]
          created_at: string
          id: string
          media_asset_id: string | null
          points: number
          position: number
          question_type: Database["public"]["Enums"]["question_type"]
          reveal_mode: Database["public"]["Enums"]["reveal_mode"]
          stage_id: string
          text: string
          time_limit_sec: number | null
          time_mode: Database["public"]["Enums"]["time_mode"]
          updated_at: string
        }
        Insert: {
          answer_type?: Database["public"]["Enums"]["answer_type"]
          created_at?: string
          id?: string
          media_asset_id?: string | null
          points?: number
          position: number
          question_type?: Database["public"]["Enums"]["question_type"]
          reveal_mode?: Database["public"]["Enums"]["reveal_mode"]
          stage_id: string
          text?: string
          time_limit_sec?: number | null
          time_mode?: Database["public"]["Enums"]["time_mode"]
          updated_at?: string
        }
        Update: {
          answer_type?: Database["public"]["Enums"]["answer_type"]
          created_at?: string
          id?: string
          media_asset_id?: string | null
          points?: number
          position?: number
          question_type?: Database["public"]["Enums"]["question_type"]
          reveal_mode?: Database["public"]["Enums"]["reveal_mode"]
          stage_id?: string
          text?: string
          time_limit_sec?: number | null
          time_mode?: Database["public"]["Enums"]["time_mode"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          content_language: string
          created_at: string
          default_points: number
          description: string
          id: string
          owner_id: string
          tie_break_by_speed: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content_language?: string
          created_at?: string
          default_points?: number
          description?: string
          id?: string
          owner_id?: string
          tie_break_by_speed?: boolean
          title?: string
          updated_at?: string
        }
        Update: {
          content_language?: string
          created_at?: string
          default_points?: number
          description?: string
          id?: string
          owner_id?: string
          tie_break_by_speed?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          created_at: string
          id: string
          position: number
          quiz_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          position: number
          quiz_id: string
          title?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          quiz_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role_claim: { Args: never; Returns: string }
      is_superadmin: { Args: never; Returns: boolean }
    }
    Enums: {
      answer_type:
        | "single_choice"
        | "text_input"
        | "multi_choice"
        | "ordering"
        | "photo"
        | "drawing"
      media_kind: "image" | "gif" | "video" | "audio"
      question_type: "text" | "image" | "collage" | "gif" | "video" | "audio"
      reveal_mode: "after_stage" | "after_question" | "manual"
      time_mode: "unlimited" | "fixed"
      user_role: "superadmin" | "host"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      answer_type: [
        "single_choice",
        "text_input",
        "multi_choice",
        "ordering",
        "photo",
        "drawing",
      ],
      media_kind: ["image", "gif", "video", "audio"],
      question_type: ["text", "image", "collage", "gif", "video", "audio"],
      reveal_mode: ["after_stage", "after_question", "manual"],
      time_mode: ["unlimited", "fixed"],
      user_role: ["superadmin", "host"],
    },
  },
} as const

