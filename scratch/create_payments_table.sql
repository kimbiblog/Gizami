-- Run this in your Supabase SQL Editor
-- Creates the payments table for PayUnit Mobile Money transactions

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  transaction_id text UNIQUE NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'XAF',
  gateway text NOT NULL,  -- CM_ORANGE | CM_MTN
  status text NOT NULL DEFAULT 'pending',  -- pending | paid | failed
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by transaction_id (used by webhook)
CREATE INDEX IF NOT EXISTS payments_transaction_id_idx ON public.payments (transaction_id);

-- Index for user payment history
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments (user_id);

-- RLS: Students can read their own payments; server (service role) writes
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access (used by API routes via supabase admin client)
-- No INSERT/UPDATE policy needed here because we always use the service role key from the server
