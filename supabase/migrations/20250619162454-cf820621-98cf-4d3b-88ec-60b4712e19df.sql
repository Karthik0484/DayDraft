
-- Create a table for money spending tracking
CREATE TABLE public.spending_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Food', 'Travel', 'Bills', 'Shopping', 'Others')),
  description TEXT,
  spend_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own spending
ALTER TABLE public.spending_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own spending logs
CREATE POLICY "Users can view their own spending logs" 
  ON public.spending_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own spending logs
CREATE POLICY "Users can create their own spending logs" 
  ON public.spending_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own spending logs
CREATE POLICY "Users can update their own spending logs" 
  ON public.spending_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own spending logs
CREATE POLICY "Users can delete their own spending logs" 
  ON public.spending_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index on spend_date for better query performance
CREATE INDEX idx_spending_logs_date ON public.spending_logs(user_id, spend_date);

-- Create index on category for analytics queries
CREATE INDEX idx_spending_logs_category ON public.spending_logs(user_id, category);
