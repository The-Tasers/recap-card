export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ExpectationToneDb =
  | 'calm'
  | 'excited'
  | 'anxious'
  | 'uncertain'
  | 'energized'
  | 'heavy';

export type StateCategoryDb = 'energy' | 'emotion' | 'tension' | 'neutral';

// ============================================================================
// Database Table Types (for use in stores and components)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          rating: number;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          rating: number;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          rating?: number;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      states: {
        Row: {
          id: string;
          label: string;
          category: StateCategoryDb;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          label: string;
          category: StateCategoryDb;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          category?: StateCategoryDb;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      contexts: {
        Row: {
          id: string;
          user_id: string | null;
          label: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          label: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          label?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      people: {
        Row: {
          id: string;
          user_id: string | null;
          label: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          label: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          label?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      days: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          morning_expectation_tone: ExpectationToneDb | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          morning_expectation_tone?: ExpectationToneDb | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          morning_expectation_tone?: ExpectationToneDb | null;
          created_at?: string;
        };
        Relationships: [];
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          day_id: string;
          timestamp: string;
          state_id: string;
          context_id: string;
          person_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_id: string;
          timestamp?: string;
          state_id: string;
          context_id: string;
          person_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day_id?: string;
          timestamp?: string;
          state_id?: string;
          context_id?: string;
          person_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'checkins_day_id_fkey';
            columns: ['day_id'];
            referencedRelation: 'days';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'checkins_state_id_fkey';
            columns: ['state_id'];
            referencedRelation: 'states';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'checkins_person_id_fkey';
            columns: ['person_id'];
            referencedRelation: 'people';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ============================================================================
// Exported Row Types (for use in stores without duplication)
// ============================================================================

export type DbState = Database['public']['Tables']['states']['Row'];
export type DbContext = Database['public']['Tables']['contexts']['Row'];
export type DbPerson = Database['public']['Tables']['people']['Row'];
export type DbDay = Database['public']['Tables']['days']['Row'];
export type DbCheckIn = Database['public']['Tables']['checkins']['Row'];
