
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, BarChart3, Calendar, Zap, FileText, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DayDraft</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link 
                to="/dashboard"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-purple-300 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your Performance,
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Organized</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Track tasks, manage files, save links, and visualize your productivity with beautiful analytics. 
            Everything you need to stay organized and motivated.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {user ? (
              <Link 
                to="/dashboard"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/signup"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/demo"
                  className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  View Demo
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <CheckCircle className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Smart Task Management</h3>
            <p className="text-slate-300">
              Create, organize, and track tasks with deadlines, tags, and status updates. 
              Never miss an important deadline again.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <FileText className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">File Organization</h3>
            <p className="text-slate-300">
              Upload and organize files with smart tagging. Link files to tasks and 
              access everything from one central location.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <LinkIcon className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Link Management</h3>
            <p className="text-slate-300">
              Save important links with descriptions and tags. Keep all your 
              research and references organized and searchable.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <Calendar className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Calendar Integration</h3>
            <p className="text-slate-300">
              Visualize your productivity over time with calendar views. 
              See patterns and plan your work more effectively.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <BarChart3 className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Performance Analytics</h3>
            <p className="text-slate-300">
              Beautiful charts and insights show your productivity trends. 
              Understand your work patterns and optimize your performance.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <Zap className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Real-time Sync</h3>
            <p className="text-slate-300">
              Your data syncs instantly across all devices. Work seamlessly 
              from anywhere with automatic backups and sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
