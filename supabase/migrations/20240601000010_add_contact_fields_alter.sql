-- Add contact fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_phone TEXT;
