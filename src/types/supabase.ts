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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academic_terms: {
        Row: {
          end_date: string | null
          id: string
          is_current: boolean | null
          school_year: string
          semester: string
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          school_year: string
          semester: string
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          school_year?: string
          semester?: string
          start_date?: string | null
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          device_id: string | null
          id: string
          occurrence_id: string | null
          scanned_at: string | null
          scanned_by_officer_id: string | null
          status: Database["public"]["Enums"]["attendance_status_enum"] | null
          student_id: string | null
        }
        Insert: {
          device_id?: string | null
          id?: string
          occurrence_id?: string | null
          scanned_at?: string | null
          scanned_by_officer_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status_enum"] | null
          student_id?: string | null
        }
        Update: {
          device_id?: string | null
          id?: string
          occurrence_id?: string | null
          scanned_at?: string | null
          scanned_by_officer_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status_enum"] | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "authorized_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "event_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_scanned_by_officer_id_fkey"
            columns: ["scanned_by_officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      authorized_devices: {
        Row: {
          authorized_at: string | null
          authorized_by: string | null
          created_at: string | null
          device_model: string | null
          device_uid: string
          id: string
          is_authorized: boolean | null
          officer_id: string | null
          revoked_at: string | null
          status: Database["public"]["Enums"]["device_status_enum"] | null
        }
        Insert: {
          authorized_at?: string | null
          authorized_by?: string | null
          created_at?: string | null
          device_model?: string | null
          device_uid: string
          id?: string
          is_authorized?: boolean | null
          officer_id?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["device_status_enum"] | null
        }
        Update: {
          authorized_at?: string | null
          authorized_by?: string | null
          created_at?: string | null
          device_model?: string | null
          device_uid?: string
          id?: string
          is_authorized?: boolean | null
          officer_id?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["device_status_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "authorized_devices_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorized_devices_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      charge_templates: {
        Row: {
          created_at: string | null
          default_amount: number
          description: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          default_amount: number
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          default_amount?: number
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      event_occurrences: {
        Row: {
          created_at: string | null
          end_time: string
          event_id: string | null
          id: string
          schedule_id: string | null
          session_title: string | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          event_id?: string | null
          id?: string
          schedule_id?: string | null
          session_title?: string | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          event_id?: string | null
          id?: string
          schedule_id?: string | null
          session_title?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_occurrences_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_occurrences_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "event_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      event_schedules: {
        Row: {
          event_id: string | null
          id: string
          recurrence_rule: string | null
          target_all_students: boolean | null
          target_section_ids: string[] | null
          target_year_levels: number[] | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          recurrence_rule?: string | null
          target_all_students?: boolean | null
          target_section_ids?: string[] | null
          target_year_levels?: number[] | null
        }
        Update: {
          event_id?: string | null
          id?: string
          recurrence_rule?: string | null
          target_all_students?: boolean | null
          target_section_ids?: string[] | null
          target_year_levels?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "event_schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nfc_cards: {
        Row: {
          deactivated_at: string | null
          id: string
          issued_at: string | null
          nfc_uid: string
          status: Database["public"]["Enums"]["nfc_status_enum"] | null
          student_id: string | null
        }
        Insert: {
          deactivated_at?: string | null
          id?: string
          issued_at?: string | null
          nfc_uid: string
          status?: Database["public"]["Enums"]["nfc_status_enum"] | null
          student_id?: string | null
        }
        Update: {
          deactivated_at?: string | null
          id?: string
          issued_at?: string | null
          nfc_uid?: string
          status?: Database["public"]["Enums"]["nfc_status_enum"] | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfc_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_items: {
        Row: {
          amount_applied: number
          charge_id: string | null
          id: string
          payment_id: string | null
        }
        Insert: {
          amount_applied: number
          charge_id?: string | null
          id?: string
          payment_id?: string | null
        }
        Update: {
          amount_applied?: number
          charge_id?: string | null
          id?: string
          payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_items_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "student_charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_items_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string | null
          id: string
          payment_source: Database["public"]["Enums"]["payment_source_enum"]
          processed_by: string | null
          reference_no: string | null
          student_id: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_source: Database["public"]["Enums"]["payment_source_enum"]
          processed_by?: string | null
          reference_no?: string | null
          student_id?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_source?: Database["public"]["Enums"]["payment_source_enum"]
          processed_by?: string | null
          reference_no?: string | null
          student_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          student_number: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          last_name: string
          student_number?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          student_number?: string | null
        }
        Relationships: []
      }
      scan_audit_logs: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          occurrence_id: string | null
          scanned_by_officer_id: string | null
          scanned_nfc_uid: string | null
          status_flag: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          occurrence_id?: string | null
          scanned_by_officer_id?: string | null
          scanned_nfc_uid?: string | null
          status_flag: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          occurrence_id?: string | null
          scanned_by_officer_id?: string | null
          scanned_nfc_uid?: string | null
          status_flag?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_audit_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "authorized_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_audit_logs_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "event_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_audit_logs_scanned_by_officer_id_fkey"
            columns: ["scanned_by_officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          id: string
          section_code: string
          term_id: string | null
          year_level: number | null
        }
        Insert: {
          id?: string
          section_code: string
          term_id?: string | null
          year_level?: number | null
        }
        Update: {
          id?: string
          section_code?: string
          term_id?: string | null
          year_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      student_charges: {
        Row: {
          amount: number
          amount_paid: number | null
          event_occurrence_id: string | null
          id: string
          issued_at: string | null
          status: Database["public"]["Enums"]["charge_status_enum"] | null
          student_id: string | null
          template_id: string | null
          title: string
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          event_occurrence_id?: string | null
          id?: string
          issued_at?: string | null
          status?: Database["public"]["Enums"]["charge_status_enum"] | null
          student_id?: string | null
          template_id?: string | null
          title: string
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          event_occurrence_id?: string | null
          id?: string
          issued_at?: string | null
          status?: Database["public"]["Enums"]["charge_status_enum"] | null
          student_id?: string | null
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_charges_event_occurrence_id_fkey"
            columns: ["event_occurrence_id"]
            isOneToOne: false
            referencedRelation: "event_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_charges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_charges_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "charge_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      student_section_history: {
        Row: {
          created_at: string | null
          id: string
          section_id: string | null
          student_id: string | null
          year_level: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          section_id?: string | null
          student_id?: string | null
          year_level: number
        }
        Update: {
          created_at?: string | null
          id?: string
          section_id?: string | null
          student_id?: string | null
          year_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_section_history_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_section_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role_enum"]
          user_id: string | null
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["user_role_enum"]
          user_id?: string | null
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_ledger: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          recorded_by: string | null
          reference_no: string | null
          remarks: string | null
          student_id: string | null
          transaction_type: Database["public"]["Enums"]["ledger_type_enum"]
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          recorded_by?: string | null
          reference_no?: string | null
          remarks?: string | null
          student_id?: string | null
          transaction_type: Database["public"]["Enums"]["ledger_type_enum"]
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          recorded_by?: string | null
          reference_no?: string | null
          remarks?: string | null
          student_id?: string | null
          transaction_type?: Database["public"]["Enums"]["ledger_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "wallet_ledger_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_ledger_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { req_role: Database["public"]["Enums"]["user_role_enum"] }
        Returns: boolean
      }
    }
    Enums: {
      attendance_status_enum: "present" | "late" | "absent" | "excused"
      charge_status_enum: "unpaid" | "partially_paid" | "paid" | "cancelled"
      device_status_enum:
        | "pending"
        | "authorized"
        | "revoked"
        | "lost"
        | "replaced"
      ledger_type_enum:
        | "top_up"
        | "payment"
        | "refund"
        | "adjustment"
        | "reversal"
      nfc_status_enum: "active" | "deactivated" | "lost" | "replaced"
      payment_source_enum: "wallet" | "cash" | "e_wallet"
      user_role_enum: "student" | "csg_officer" | "csg_admin"
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
  public: {
    Enums: {
      attendance_status_enum: ["present", "late", "absent", "excused"],
      charge_status_enum: ["unpaid", "partially_paid", "paid", "cancelled"],
      device_status_enum: [
        "pending",
        "authorized",
        "revoked",
        "lost",
        "replaced",
      ],
      ledger_type_enum: [
        "top_up",
        "payment",
        "refund",
        "adjustment",
        "reversal",
      ],
      nfc_status_enum: ["active", "deactivated", "lost", "replaced"],
      payment_source_enum: ["wallet", "cash", "e_wallet"],
      user_role_enum: ["student", "csg_officer", "csg_admin"],
    },
  },
} as const

