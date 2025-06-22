
-- Create a table for daily logs
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  video_url TEXT,
  video_type TEXT, -- 'upload' or 'youtube'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own logs
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own logs
CREATE POLICY "Users can view their own daily logs" 
  ON public.daily_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own logs
CREATE POLICY "Users can create their own daily logs" 
  ON public.daily_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own logs
CREATE POLICY "Users can update their own daily logs" 
  ON public.daily_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own logs
CREATE POLICY "Users can delete their own daily logs" 
  ON public.daily_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for daily logs files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('daily-logs', 'daily-logs', true);

-- Create storage policies for daily logs bucket
CREATE POLICY "Users can upload their own daily logs files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'daily-logs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own daily logs files"
ON storage.objects FOR SELECT
USING (bucket_id = 'daily-logs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own daily logs files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'daily-logs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own daily logs files"
ON storage.objects FOR DELETE
USING (bucket_id = 'daily-logs' AND auth.uid()::text = (storage.foldername(name))[1]);
