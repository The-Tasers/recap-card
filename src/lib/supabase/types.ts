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
      recaps: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          mood: 'great' | 'good' | 'okay' | 'low' | 'rough';
          photo_url: string | null;
          blocks: Json | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          text: string;
          mood: 'great' | 'good' | 'okay' | 'low' | 'rough';
          photo_url?: string | null;
          blocks?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          text?: string;
          mood?: 'great' | 'good' | 'okay' | 'low' | 'rough';
          photo_url?: string | null;
          blocks?: Json | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
