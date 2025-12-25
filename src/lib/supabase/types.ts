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
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
