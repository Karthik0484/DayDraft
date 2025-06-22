
import { TrendingUp, Calendar, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PerformanceChart = () => {
  const { user } = useAuth();

  // Fetch tasks data
  const { data: tasks = [] } = useQuery({
    queryKey: ['performance-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch files data
  const { data: files = [] } = useQuery({
    queryKey: ['performance-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch links data
  const { data: links = [] } = useQuery({
    queryKey: ['performance-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Process data for the last 7 days
  const getLast7DaysData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at).toISOString().split('T')[0];
        return taskDate === dateStr;
      }).length;
      
      const dayFiles = files.filter(file => {
        const fileDate = new Date(file.created_at).toISOString().split('T')[0];
        return fileDate === dateStr;
      }).length;
      
      const dayLinks = links.filter(link => {
        const linkDate = new Date(link.created_at).toISOString().split('T')[0];
        return linkDate === dateStr;
      }).length;
      
      last7Days.push({
        day: dayName,
        tasks: dayTasks,
        files: dayFiles,
        links: dayLinks
      });
    }
    
    return last7Days;
  };

  const weeklyData = getLast7DaysData();
  const maxTasks = Math.max(...weeklyData.map(d => d.tasks)) || 1;

  // Calculate totals
  const totalTasks = tasks.length;
  const totalFiles = files.length;
  const totalLinks = links.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  // Find most productive day
  const mostProductiveDay = weeklyData.reduce((prev, current) => 
    (prev.tasks > current.tasks) ? prev : current
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Weekly Performance</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Last 7 days</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{completedTasks}</div>
          <div className="text-sm text-purple-600 font-medium">Tasks Completed</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalFiles}</div>
          <div className="text-sm text-blue-600 font-medium">Files Uploaded</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{totalLinks}</div>
          <div className="text-sm text-green-600 font-medium">Links Saved</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Daily Task Creation</span>
        </h3>
        
        <div className="flex items-end space-x-2 h-32">
          {weeklyData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col justify-end h-24 mb-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-500 ease-out"
                  style={{ height: `${maxTasks > 0 ? (data.tasks / maxTasks) * 100 : 0}%` }}
                >
                  {data.tasks > 0 && (
                    <div className="text-white text-xs font-medium text-center pt-1">
                      {data.tasks}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium">{data.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-purple-600">Productivity Insights</span>
        </div>
        <p className="text-sm text-gray-600">
          {mostProductiveDay.tasks > 0 
            ? `Your most productive day this week was ${mostProductiveDay.day} with ${mostProductiveDay.tasks} tasks created. Keep up the momentum! 🚀`
            : "Start creating tasks to see your productivity insights! 📈"
          }
        </p>
      </div>
    </div>
  );
};

export default PerformanceChart;
