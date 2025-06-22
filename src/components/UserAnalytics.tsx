
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Calendar, FileText, Link as LinkIcon, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

const UserAnalytics = () => {
  const { user } = useAuth();

  // Fetch analytics data
  const { data: analyticsData = [], refetch } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AnalyticsData[];
    },
    enabled: !!user,
  });

  // Fetch summary data
  const { data: summaryData } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const [tasksResult, filesResult, linksResult, eventsResult] = await Promise.all([
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
        supabase.from('files').select('*', { count: 'exact', head: true }),
        supabase.from('links').select('*', { count: 'exact', head: true }),
        supabase.from('calendar_events').select('*', { count: 'exact', head: true })
      ]);

      return {
        tasks: tasksResult.count || 0,
        files: filesResult.count || 0,
        links: linksResult.count || 0,
        events: eventsResult.count || 0,
      };
    },
    enabled: !!user,
  });

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const analyticsChannel = supabase
      .channel('analytics-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_analytics',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(analyticsChannel);
    };
  }, [user, refetch]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Process data for charts
  const activityByType = analyticsData.reduce((acc, item) => {
    const type = item.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(activityByType).map(([name, value]) => ({
    name,
    value
  }));

  // Activity over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const activityByDay = last7Days.map(date => {
    const dayActivity = analyticsData.filter(item => 
      item.created_at.split('T')[0] === date
    ).length;
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      activity: dayActivity
    };
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600 mt-2">Track your productivity and activity patterns.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData?.tasks || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData?.files || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Links Saved</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData?.links || 0}</p>
            </div>
            <LinkIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calendar Events</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData?.events || 0}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity by Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Type</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Activity Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activity" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {analyticsData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {analyticsData.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                  {activity.event_data && (
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.event_data.title || activity.event_data.file_name || 'No details'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnalytics;
