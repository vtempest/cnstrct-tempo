-- This migration fixes the UUID validation issue without altering column types
-- Instead of changing column types (which conflicts with policies), we'll add validation triggers

-- Create a function to validate UUID format before insert/update
CREATE OR REPLACE FUNCTION validate_uuid_format()
RETURNS TRIGGER AS $$
BEGIN
  -- Attempt to cast to UUID to validate format
  BEGIN
    PERFORM NEW.id::uuid;
    RETURN NEW;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'Invalid UUID format for id: %', NEW.id;
  END;
END;
$$ LANGUAGE plpgsql;

-- Add validation triggers to tables that need UUID validation
-- Only if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_project_uuid') THEN
    CREATE TRIGGER validate_project_uuid
    BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION validate_uuid_format();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_milestone_uuid') THEN
    CREATE TRIGGER validate_milestone_uuid
    BEFORE INSERT OR UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION validate_uuid_format();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_invoice_uuid') THEN
    CREATE TRIGGER validate_invoice_uuid
    BEFORE INSERT OR UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION validate_uuid_format();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_expense_uuid') THEN
    CREATE TRIGGER validate_expense_uuid
    BEFORE INSERT OR UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION validate_uuid_format();
  END IF;
END
$$;