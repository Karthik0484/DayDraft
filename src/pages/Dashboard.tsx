
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import TaskManager from '@/components/TaskManager';
import PerformanceChart from '@/components/PerformanceChart';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch user tasks
  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user files
  const { data: files = [] } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user links
  const { data: links = [] } = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch spending logs
  const { data: spendingLogs = [] } = useQuery({
    queryKey: ['spending-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spending_logs')
        .select('*')
        .order('spend_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const tasksChannel = supabase
      .channel('tasks-changes')
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

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, [user, refetchTasks]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your productivity today.</p>
        </div>

        {/* Stats Overview */}
        <DashboardStats tasks={tasks} files={files} links={links} spendingLogs={spendingLogs} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Task Manager */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Task Management</h2>
              <TaskManager />
            </div>
          </div>

          {/* Right Column - Activity & Performance */}
          <div className="space-y-8">
            <RecentActivity tasks={tasks} files={files} links={links} />
            <PerformanceChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
