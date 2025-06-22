
import { CheckCircle, Clock, FileText, Link as LinkIcon, DollarSign } from 'lucide-react';

interface Task {
  id: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

interface File {
  id: string;
  created_at: string;
}

interface Link {
  id: string;
  created_at: string;
}

interface SpendingLog {
  id: string;
  amount: number;
  spend_date: string;
}

interface DashboardStatsProps {
  tasks: Task[];
  files: File[];
  links: Link[];
  spendingLogs?: SpendingLog[];
}

const DashboardStats = ({ tasks, files, links, spendingLogs = [] }: DashboardStatsProps) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todayTasks = tasks.filter(task => 
    task.created_at.startsWith(today)
  ).length;
  
  const completedTasks = tasks.filter(task => 
    task.status === 'completed'
  ).length;
  
  const inProgressTasks = tasks.filter(task => 
    task.status === 'in-progress'
  ).length;

  const todaySpending = spendingLogs
    .filter(log => log.spend_date === today)
    .reduce((sum, log) => sum + parseFloat(log.amount.toString()), 0);

  const stats = [
    {
      name: 'Completed Tasks',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Files Uploaded',
      value: files.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Links Saved',
      value: links.length,
      icon: LinkIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Today\'s Spending',
      value: `$${todaySpending.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
