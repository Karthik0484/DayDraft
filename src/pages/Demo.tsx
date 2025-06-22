
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import TaskManager from '../components/TaskManager';
import PerformanceChart from '../components/PerformanceChart';

const Demo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">DayDraft Demo</span>
              </div>
            </div>
            <Link
              to="/signup"
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Experience DayDraft in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our interactive demo to see how DayDraft can transform your productivity workflow.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Task Manager Demo */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Task Management</h2>
              <p className="text-gray-600">
                Create, organize, and track your tasks with our intuitive interface.
              </p>
            </div>
            <TaskManager />
          </div>

          {/* Performance Analytics Demo */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Performance Analytics</h2>
              <p className="text-gray-600">
                Visualize your productivity with beautiful charts and insights.
              </p>
            </div>
            <PerformanceChart />
          </div>
        </div>

        {/* File and Link Management Preview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">File Management</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">PDF</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">project-proposal.pdf</p>
                  <p className="text-sm text-gray-500">Uploaded 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">DOC</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">meeting-notes.docx</p>
                  <p className="text-sm text-gray-500">Uploaded 1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Link Bookmarks</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xs">🔗</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">React Documentation</p>
                  <p className="text-sm text-gray-500">react.dev</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-xs">🔗</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Design Inspiration</p>
                  <p className="text-sm text-gray-500">dribbble.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their daily workflow with DayDraft.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;
