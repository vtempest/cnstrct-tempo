-- Add location column to projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                  WHERE table_name='projects' AND column_name='location') THEN
        ALTER TABLE projects ADD COLUMN location TEXT;
    END IF;
END $$;