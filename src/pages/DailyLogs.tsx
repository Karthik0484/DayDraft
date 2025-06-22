
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, FileText } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import DailyLogForm from '@/components/DailyLogForm';
import DailyLogCard from '@/components/DailyLogCard';

const DailyLogs = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['daily-logs', refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <span>Daily Logs</span>
            </h1>
            <p className="text-gray-600 mt-2">Document your daily activities and thoughts.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Log</span>
          </button>
        </div>

        {/* Log Form Modal */}
        {showForm && (
          <DailyLogForm 
            onClose={() => setShowForm(false)} 
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Logs Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">No logs yet</h3>
            <p className="text-gray-400 mb-4">Start documenting your daily activities</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Log</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map((log) => (
              <DailyLogCard
                key={log.id}
                log={{
                  id: log.id,
                  title: log.title,
                  description: log.description,
                  log_date: log.created_at.split('T')[0], // Use created_at as log_date
                  image_url: log.image_url,
                  file_url: log.file_url,
                  file_name: log.file_name,
                  file_size: log.file_size,
                  video_url: log.video_url,
                  video_type: log.video_type,
                  created_at: log.created_at,
                }}
                onUpdate={() => setRefreshKey(prev => prev + 1)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLogs;
