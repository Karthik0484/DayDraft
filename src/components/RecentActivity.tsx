
import { CheckCircle, FileText, Link as LinkIcon, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface File {
  id: string;
  file_name: string;
  created_at: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

interface RecentActivityProps {
  tasks: Task[];
  files: File[];
  links: Link[];
}

const RecentActivity = ({ tasks, files, links }: RecentActivityProps) => {
  // Combine and sort all activities
  const activities = [
    ...tasks.slice(0, 3).map(task => ({
      id: task.id,
      type: 'task' as const,
      title: task.title,
      subtitle: `Status: ${task.status}`,
      time: task.created_at,
      icon: task.status === 'completed' ? CheckCircle : Clock,
      color: task.status === 'completed' ? 'text-green-600' : 'text-yellow-600',
    })),
    ...files.slice(0, 2).map(file => ({
      id: file.id,
      type: 'file' as const,
      title: file.file_name,
      subtitle: 'File uploaded',
      time: file.created_at,
      icon: FileText,
      color: 'text-blue-600',
    })),
    ...links.slice(0, 2).map(link => ({
      id: link.id,
      type: 'link' as const,
      title: link.title || 'Untitled Link',
      subtitle: new URL(link.url).hostname,
      time: link.created_at,
      icon: LinkIcon,
      color: 'text-purple-600',
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">{activity.subtitle}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
