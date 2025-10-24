import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          business_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          business_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          business_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'income' | 'expense';
          category: string;
          description: string;
          transaction_date: string;
          receipt_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: 'income' | 'expense';
          category: string;
          description?: string;
          transaction_date?: string;
          receipt_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: 'income' | 'expense';
          category?: string;
          description?: string;
          transaction_date?: string;
          receipt_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      receipts: {
        Row: {
          id: string;
          user_id: string;
          file_path: string;
          extracted_text: string | null;
          extracted_amount: number | null;
          extracted_date: string | null;
          confidence_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_path: string;
          extracted_text?: string | null;
          extracted_amount?: number | null;
          extracted_date?: string | null;
          confidence_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_path?: string;
          extracted_text?: string | null;
          extracted_amount?: number | null;
          extracted_date?: string | null;
          confidence_score?: number | null;
          created_at?: string;
        };
      };
    };
  };
}
