-- Check if the projects table exists
DO $$ 
BEGIN
  -- Add UUID validation to the projects table
  ALTER TABLE IF EXISTS projects
  ALTER COLUMN id TYPE UUID USING id::UUID;

  -- Add UUID validation to the milestones table
  ALTER TABLE IF EXISTS milestones
  ALTER COLUMN id TYPE UUID USING id::UUID,
  ALTER COLUMN project_id TYPE UUID USING project_id::UUID;

  -- Add UUID validation to the invoices table
  ALTER TABLE IF EXISTS invoices
  ALTER COLUMN id TYPE UUID USING id::UUID,
  ALTER COLUMN project_id TYPE UUID USING project_id::UUID;

  -- Add UUID validation to the expenses table
  ALTER TABLE IF EXISTS expenses
  ALTER COLUMN id TYPE UUID USING id::UUID,
  ALTER COLUMN project_id TYPE UUID USING project_id::UUID;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
    -- Continue execution even if an error occurs
END $$;