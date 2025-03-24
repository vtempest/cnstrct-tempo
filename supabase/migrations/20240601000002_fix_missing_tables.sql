-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  client TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  due_date DATE,
  budget DECIMAL(12,2),
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create milestones table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not-started',
  due_date DATE,
  amount DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for milestones
CREATE POLICY "Users can view milestones for their projects"
  ON public.milestones
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can insert milestones for their projects"
  ON public.milestones
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can update milestones for their projects"
  ON public.milestones
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can delete milestones for their projects"
  ON public.milestones
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()));

-- Create policies for invoices
CREATE POLICY "Users can view invoices for their projects"
  ON public.invoices
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = invoices.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can insert invoices for their projects"
  ON public.invoices
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = invoices.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can update invoices for their projects"
  ON public.invoices
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = invoices.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can delete invoices for their projects"
  ON public.invoices
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = invoices.project_id AND projects.user_id = auth.uid()));

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
