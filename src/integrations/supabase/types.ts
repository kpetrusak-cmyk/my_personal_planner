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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      budget_entries: {
        Row: {
          amount: number
          category: string
          id: string
          label: string
          month_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          id?: string
          label?: string
          month_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          id?: string
          label?: string
          month_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_tracker: {
        Row: {
          activity: string
          date_key: string
          duration: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity?: string
          date_key: string
          duration?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity?: string
          date_key?: string
          duration?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_tracker: {
        Row: {
          date_key: string
          done: boolean
          habit_color: string
          habit_index: number
          habit_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          date_key: string
          done?: boolean
          habit_color?: string
          habit_index: number
          habit_name?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          date_key?: string
          done?: boolean
          habit_color?: string
          habit_index?: number
          habit_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_tracker: {
        Row: {
          date_key: string
          id: string
          mood_index: number
          updated_at: string
          user_id: string
        }
        Insert: {
          date_key: string
          id?: string
          mood_index?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          date_key?: string
          id?: string
          mood_index?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planner_entries: {
        Row: {
          date_key: string
          field_name: string
          id: string
          page_type: string
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          date_key: string
          field_name: string
          id?: string
          page_type: string
          updated_at?: string
          user_id: string
          value?: string
        }
        Update: {
          date_key?: string
          field_name?: string
          id?: string
          page_type?: string
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      planner_todos: {
        Row: {
          date_key: string
          done: boolean
          id: string
          item_index: number
          page_type: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          date_key: string
          done?: boolean
          id?: string
          item_index: number
          page_type: string
          text?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          date_key?: string
          done?: boolean
          id?: string
          item_index?: number
          page_type?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          theme_preference: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          theme_preference?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          theme_preference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sleep_tracker: {
        Row: {
          date_key: string
          hours: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          date_key: string
          hours?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          date_key?: string
          hours?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_blocks: {
        Row: {
          activity: string
          color: string
          date_key: string
          end_time: string
          id: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity?: string
          color?: string
          date_key: string
          end_time: string
          id?: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity?: string
          color?: string
          date_key?: string
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
