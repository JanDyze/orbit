// Types for the `orbit` schema, in the shape `supabase gen types` writes. Written by hand to match
// supabase/migrations/20261002000000_orbit_init.sql; once that's applied, regenerate with
//   npx supabase gen types typescript --project-id <ref> --schema orbit > lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  orbit: {
    Tables: {
      allowed_users: {
        Row: { created_at: string; user_id: string };
        Insert: { created_at?: string; user_id: string };
        Update: { created_at?: string; user_id?: string };
        Relationships: [];
      };
      birthday_log: {
        Row: {
          celebrated: boolean;
          created_at: string;
          gift_note: string | null;
          gifted: boolean;
          greeted: boolean;
          id: string;
          notes: string | null;
          person_id: string;
          prayed: boolean;
          updated_at: string;
          user_id: string;
          year: number;
        };
        Insert: {
          celebrated?: boolean;
          created_at?: string;
          gift_note?: string | null;
          gifted?: boolean;
          greeted?: boolean;
          id?: string;
          notes?: string | null;
          person_id: string;
          prayed?: boolean;
          updated_at?: string;
          user_id?: string;
          year: number;
        };
        Update: {
          celebrated?: boolean;
          created_at?: string;
          gift_note?: string | null;
          gifted?: boolean;
          greeted?: boolean;
          id?: string;
          notes?: string | null;
          person_id?: string;
          prayed?: boolean;
          updated_at?: string;
          user_id?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "birthday_log_person_fk";
            columns: ["person_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      gift_ideas: {
        Row: { created_at: string; given: boolean; id: string; idea: string; person_id: string; user_id: string };
        Insert: { created_at?: string; given?: boolean; id?: string; idea: string; person_id: string; user_id?: string };
        Update: { created_at?: string; given?: boolean; id?: string; idea?: string; person_id?: string; user_id?: string };
        Relationships: [
          {
            foreignKeyName: "gift_ideas_person_fk";
            columns: ["person_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      people: {
        Row: {
          birth_day: number;
          birth_month: number;
          birth_year: number | null;
          created_at: string;
          id: string;
          name: string;
          nicknames: string[];
          notes: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          birth_day: number;
          birth_month: number;
          birth_year?: number | null;
          created_at?: string;
          id?: string;
          name: string;
          nicknames?: string[];
          notes?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          birth_day?: number;
          birth_month?: number;
          birth_year?: number | null;
          created_at?: string;
          id?: string;
          name?: string;
          nicknames?: string[];
          notes?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      birthday_calendar: {
        Args: { p_today: string; p_user_id?: string };
        Returns: Database["orbit"]["CompositeTypes"]["birthday_row"][];
      };
      birthday_in_year: {
        Args: { p_day: number; p_month: number; p_year: number };
        Returns: string;
      };
      is_allowed: { Args: never; Returns: boolean };
      last_birthday: {
        Args: { p_day: number; p_month: number; p_today: string };
        Returns: string;
      };
      next_birthday: {
        Args: { p_day: number; p_month: number; p_today: string };
        Returns: string;
      };
      pending_birthdays: {
        Args: { p_days_back?: number; p_today: string; p_user_id?: string };
        Returns: Database["orbit"]["CompositeTypes"]["birthday_row"][];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: {
      birthday_row: {
        person_id: string | null;
        name: string | null;
        birth_month: number | null;
        birth_day: number | null;
        birth_year: number | null;
        next_birthday: string | null;
        days_until: number | null;
        turning: number | null;
        last_birthday: string | null;
        days_since: number | null;
        occasion_date: string | null;
        occasion_year: number | null;
        occasion_age: number | null;
        nicknames: string[] | null;
      };
    };
  };
};
