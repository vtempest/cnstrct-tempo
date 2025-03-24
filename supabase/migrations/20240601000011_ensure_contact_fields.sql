-- Ensure contact fields exist in projects table
DO $$
BEGIN
    -- Add contact_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'contact_name') THEN
        ALTER TABLE projects ADD COLUMN contact_name TEXT;
    END IF;

    -- Add contact_email if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'contact_email') THEN
        ALTER TABLE projects ADD COLUMN contact_email TEXT;
    END IF;

    -- Add contact_phone if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'contact_phone') THEN
        ALTER TABLE projects ADD COLUMN contact_phone TEXT;
    END IF;
END
$$;