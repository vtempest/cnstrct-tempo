-- Add start_date column to projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                  WHERE table_name='projects' AND column_name='start_date') THEN
        ALTER TABLE projects ADD COLUMN start_date TEXT;
    END IF;
END $$;