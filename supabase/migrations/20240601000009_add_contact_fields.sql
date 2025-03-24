-- Add contact fields to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Don't add to realtime publication again as it's already there
-- The error was likely because projects is already part of the publication