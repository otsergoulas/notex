import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          subscription_tier: string | null;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          subscription_tier?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          subscription_tier?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          category: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          category?: string | null;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          content?: string;
          category?: string | null;
          position?: number;
          created_at?: string;
        };
      };
      images: {
        Row: {
          id: string;
          document_id: string;
          storage_path: string;
          extracted_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          storage_path: string;
          extracted_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          storage_path?: string;
          extracted_text?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
