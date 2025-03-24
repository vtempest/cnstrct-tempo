-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add documents to realtime publication
alter publication supabase_realtime add table documents;

-- Create storage bucket for documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Set up storage policy to allow authenticated users to select their documents
DROP POLICY IF EXISTS "Allow authenticated users to select documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to select documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
