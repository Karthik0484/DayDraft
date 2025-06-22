
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Link as LinkIcon, 
  BookOpen, 
  BarChart3, 
  Search,
  DollarSign,
  LogOut,
  User
} from 'lucide-react';

const DashboardHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">ProductivityHub</h1>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Tasks</span>
              </button>
              
              <button
                onClick={() => navigate('/calendar')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </button>
              
              <button
                onClick={() => navigate('/files')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Files</span>
              </button>
              
              <button
                onClick={() => navigate('/links')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Links</span>
              </button>
              
              <button
                onClick={() => navigate('/daily-logs')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Daily Logs</span>
              </button>

              <button
                onClick={() => navigate('/spending')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>Spending</span>
              </button>
              
              <button
                onClick={() => navigate('/analytics')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              
              <button
                onClick={() => navigate('/search')}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span>{user?.user_metadata?.full_name || user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
