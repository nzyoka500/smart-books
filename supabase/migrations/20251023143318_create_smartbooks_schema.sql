/*
  # SmartBooks AI - Intelligent Accounting Assistant Schema

  ## Overview
  This migration creates the complete database schema for SmartBooks AI, an intelligent 
  accounting assistant for MSMEs that tracks transactions, manages receipts, and provides 
  AI-powered financial insights.

  ## New Tables
  
  ### 1. `profiles`
  Extended user profile information linked to Supabase auth.users
  - `id` (uuid, FK to auth.users) - User ID from authentication
  - `full_name` (text) - User's full name
  - `business_name` (text, nullable) - Optional business/company name
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `transactions`
  Records all financial transactions (income and expenses)
  - `id` (uuid, PK) - Unique transaction identifier
  - `user_id` (uuid, FK) - Owner of the transaction
  - `amount` (numeric) - Transaction amount (positive values)
  - `type` (text) - Transaction type: 'income' or 'expense'
  - `category` (text) - Transaction category (e.g., 'supplies', 'sales', 'utilities')
  - `description` (text) - Transaction description/notes
  - `transaction_date` (date) - Date when transaction occurred
  - `receipt_id` (uuid, FK, nullable) - Optional link to uploaded receipt
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `receipts`
  Stores uploaded receipt information and extracted data
  - `id` (uuid, PK) - Unique receipt identifier
  - `user_id` (uuid, FK) - Owner of the receipt
  - `file_path` (text) - Storage path to receipt image
  - `extracted_text` (text, nullable) - Full text extracted from receipt (mock AI)
  - `extracted_amount` (numeric, nullable) - Amount detected by AI
  - `extracted_date` (date, nullable) - Date detected by AI
  - `confidence_score` (numeric, nullable) - AI confidence level (0-1)
  - `created_at` (timestamptz) - Upload timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Authenticated users required for all operations
  
  ### Policies Created
  
  #### profiles table:
  - SELECT: Users can view their own profile
  - INSERT: Users can create their own profile
  - UPDATE: Users can update their own profile
  
  #### transactions table:
  - SELECT: Users can view their own transactions
  - INSERT: Users can create transactions for themselves
  - UPDATE: Users can update their own transactions
  - DELETE: Users can delete their own transactions
  
  #### receipts table:
  - SELECT: Users can view their own receipts
  - INSERT: Users can upload receipts for themselves
  - DELETE: Users can delete their own receipts

  ## Indexes
  - Indexed foreign keys for optimal query performance
  - Indexed transaction_date for date-range queries
  - Indexed transaction type and category for filtering

  ## Important Notes
  1. All monetary amounts stored as NUMERIC(10,2) for precision
  2. Transactions link to auth.uid() for automatic user association
  3. Receipt extraction fields simulate Google Cloud Vision API responses
  4. Default timestamps use now() for automatic tracking
  5. Cascading deletes ensure data integrity when users are removed
*/

-- Create profiles table for extended user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  business_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  description text DEFAULT '',
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  receipt_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  extracted_text text,
  extracted_amount numeric(10,2),
  extracted_date date,
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for receipt_id in transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_receipt_id_fkey'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_receipt_id_fkey 
    FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Receipts policies
CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own receipts"
  ON receipts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
  ON receipts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);