-- Add missing columns to projects table
ALTER TABLE IF EXISTS public.projects
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Fix user_id column type to match auth.users.id
ALTER TABLE IF EXISTS public.projects
ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
