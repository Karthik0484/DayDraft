
-- Add date field to daily_logs table
ALTER TABLE public.daily_logs 
ADD COLUMN log_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Create index on log_date for better query performance
CREATE INDEX idx_daily_logs_date ON public.daily_logs(user_id, log_date);
