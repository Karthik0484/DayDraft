
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, FileText, Link as LinkIcon, CheckSquare, Filter } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

const Search = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['search-tasks', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && debouncedQuery.length > 0 && (searchType === 'all' || searchType === 'tasks'),
  });

  // Search files
  const { data: files = [] } = useQuery({
    queryKey: ['search-files', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .ilike('file_name', `%${debouncedQuery}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && debouncedQuery.length > 0 && (searchType === 'all' || searchType === 'files'),
  });

  // Search links
  const { data: links = [] } = useQuery({
    queryKey: ['search-links', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .or(`title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%,url.ilike.%${debouncedQuery}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && debouncedQuery.length > 0 && (searchType === 'all' || searchType === 'links'),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'deferred':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const totalResults = tasks.length + files.length + links.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search</h1>
          <p className="text-gray-600 mt-2">Search across all your tasks, files, and links.</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, files, links..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="all">All</option>
              <option value="tasks">Tasks</option>
              <option value="files">Files</option>
              <option value="links">Links</option>
            </select>
          </div>
        </div>

        {/* Search Results */}
        {debouncedQuery && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results for "{debouncedQuery}"
              </h2>
              <span className="text-sm text-gray-600">
                {totalResults} result{totalResults !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Tasks Results */}
            {(searchType === 'all' || searchType === 'tasks') && tasks.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Tasks ({tasks.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Results */}
            {(searchType === 'all' || searchType === 'files') && files.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Files ({files.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{file.file_name}</h4>
                          <p className="text-sm text-gray-500">
                            {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links Results */}
            {(searchType === 'all' || searchType === 'links') && links.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Links ({links.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {links.map((link) => (
                    <div key={link.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <LinkIcon className="w-6 h-6 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{link.title}</h4>
                          <p className="text-sm text-gray-500">{new URL(link.url).hostname}</p>
                        </div>
                      </div>
                      {link.description && (
                        <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(link.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && (
              <div className="text-center py-12">
                <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No results found for "{debouncedQuery}"</p>
              </div>
            )}
          </div>
        )}

        {!debouncedQuery && (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Start typing to search across your tasks, files, and links.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
