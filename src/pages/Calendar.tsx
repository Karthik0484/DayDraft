
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import CalendarEventManager from '@/components/CalendarEventManager';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed' | 'deferred';
  deadline: string;
  created_at: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  event_type: string;
  color: string;
  is_all_day: boolean;
  task_id?: string;
  user_id: string;
}

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch tasks with deadlines
  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['calendar-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  // Fetch calendar events
  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user,
  });

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const tasksChannel = supabase
      .channel('calendar-tasks-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          refetchTasks();
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('calendar-events-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'calendar_events',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          refetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [user, refetchTasks, refetchEvents]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline).toISOString().split('T')[0];
      return taskDate === dateStr;
    });

    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    return { tasks: dayTasks, events: dayEvents };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const { tasks: dayTasks, events: dayEvents } = getItemsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-purple-50 border-purple-300' : ''}`}
        >
          <div className={`font-medium text-sm ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1 mt-1">
            {/* Show events */}
            {dayEvents.slice(0, 1).map(event => (
              <div
                key={event.id}
                className="text-xs px-1 py-0.5 rounded truncate"
                style={{ 
                  backgroundColor: `${event.color}20`,
                  color: event.color,
                  borderLeft: `3px solid ${event.color}`
                }}
              >
                📅 {event.title}
              </div>
            ))}
            {/* Show tasks */}
            {dayTasks.slice(0, dayEvents.length > 0 ? 1 : 2).map(task => (
              <div
                key={task.id}
                className={`text-xs px-1 py-0.5 rounded truncate ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : task.status === 'in-progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : task.status === 'deferred'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                ✓ {task.title}
              </div>
            ))}
            {(dayTasks.length + dayEvents.length) > 2 && (
              <div className="text-xs text-gray-500">+{(dayTasks.length + dayEvents.length) - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedDateItems = selectedDate ? getItemsForDate(selectedDate) : { tasks: [], events: [] };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">View your tasks, events, and deadlines in calendar format.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {renderCalendarDays()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar Event Manager */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                <CalendarEventManager 
                  events={selectedDateItems.events} 
                  selectedDate={selectedDate}
                />
                
                {/* Tasks for selected date */}
                {selectedDateItems.tasks.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Tasks Due</h4>
                    <div className="space-y-2">
                      {selectedDateItems.tasks.map(task => (
                        <div key={task.id} className="p-2 border border-gray-200 rounded-lg">
                          <h5 className="font-medium text-gray-900 text-sm">{task.title}</h5>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : task.status === 'deferred'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
              
              {/* Upcoming Events */}
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="mb-3 last:mb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">📅 {event.title}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Upcoming Tasks */}
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className="mb-3 last:mb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">✓ {task.title}</h4>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : task.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : task.status === 'deferred'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {tasks.length === 0 && events.length === 0 && (
                <p className="text-gray-500 text-sm">No upcoming items.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
