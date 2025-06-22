
-- Create calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  event_type TEXT DEFAULT 'event',
  color TEXT DEFAULT '#3B82F6',
  is_all_day BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for calendar events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar events
CREATE POLICY "Users can view their own calendar events" 
  ON public.calendar_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events" 
  ON public.calendar_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" 
  ON public.calendar_events 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" 
  ON public.calendar_events 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create analytics table to store user activity data
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'task_created', 'file_uploaded', 'link_saved', 'calendar_event_created'
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user analytics
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user analytics
CREATE POLICY "Users can view their own analytics" 
  ON public.user_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" 
  ON public.user_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX idx_user_analytics_created_at ON public.user_analytics(created_at);

-- Create a function to automatically log analytics events
CREATE OR REPLACE FUNCTION public.log_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the event based on the table
  IF TG_TABLE_NAME = 'tasks' THEN
    INSERT INTO public.user_analytics (user_id, event_type, event_data)
    VALUES (NEW.user_id, 'task_created', jsonb_build_object(
      'task_id', NEW.id,
      'title', NEW.title,
      'status', NEW.status
    ));
  ELSIF TG_TABLE_NAME = 'files' THEN
    INSERT INTO public.user_analytics (user_id, event_type, event_data)
    VALUES (NEW.user_id, 'file_uploaded', jsonb_build_object(
      'file_id', NEW.id,
      'file_name', NEW.file_name,
      'file_size', NEW.file_size
    ));
  ELSIF TG_TABLE_NAME = 'links' THEN
    INSERT INTO public.user_analytics (user_id, event_type, event_data)
    VALUES (NEW.user_id, 'link_saved', jsonb_build_object(
      'link_id', NEW.id,
      'title', NEW.title,
      'url', NEW.url
    ));
  ELSIF TG_TABLE_NAME = 'calendar_events' THEN
    INSERT INTO public.user_analytics (user_id, event_type, event_data)
    VALUES (NEW.user_id, 'calendar_event_created', jsonb_build_object(
      'event_id', NEW.id,
      'title', NEW.title,
      'event_type', NEW.event_type
    ));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically log analytics events
CREATE TRIGGER trigger_log_task_analytics
  AFTER INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.log_analytics_event();

CREATE TRIGGER trigger_log_file_analytics
  AFTER INSERT ON public.files
  FOR EACH ROW EXECUTE FUNCTION public.log_analytics_event();

CREATE TRIGGER trigger_log_link_analytics
  AFTER INSERT ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.log_analytics_event();

CREATE TRIGGER trigger_log_calendar_analytics
  AFTER INSERT ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.log_analytics_event();
