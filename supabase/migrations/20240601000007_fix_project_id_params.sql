-- Convert project IDs to UUID format in all tables
ALTER TABLE projects ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE milestones ALTER COLUMN project_id TYPE UUID USING project_id::UUID;
ALTER TABLE invoices ALTER COLUMN project_id TYPE UUID USING project_id::UUID;
ALTER TABLE expenses ALTER COLUMN project_id TYPE UUID USING project_id::UUID;

-- Add UUID validation trigger
CREATE OR REPLACE FUNCTION validate_uuid() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NOT NULL AND NOT NEW.id::TEXT ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'Invalid UUID format';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to projects table
DROP TRIGGER IF EXISTS validate_project_uuid ON projects;
CREATE TRIGGER validate_project_uuid
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION validate_uuid();
