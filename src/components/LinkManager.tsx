
import { useState } from 'react';
import { Plus, ExternalLink, Trash2, Tag, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface LinkManagerProps {
  links: any[];
}

const LinkManager = ({ links }: LinkManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [newLink, setNewLink] = useState({
    url: '',
    title: '',
    description: '',
    tags: '',
  });

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: async (linkData: any) => {
      const { data, error } = await supabase
        .from('links')
        .insert([{
          ...linkData,
          user_id: user!.id,
          tags: linkData.tags.filter((tag: string) => tag.trim() !== ''),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setShowNewLinkForm(false);
      setNewLink({ url: '', title: '', description: '', tags: '' });
      toast({
        title: "Link added",
        description: "Your link has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add link. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({
        title: "Link deleted",
        description: "Your link has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteLink = (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      deleteLinkMutation.mutate(linkId);
    }
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLink.url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL.",
        variant: "destructive",
      });
      return;
    }

    const tags = newLink.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    createLinkMutation.mutate({
      url: newLink.url,
      title: newLink.title || null,
      description: newLink.description || null,
      tags,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Links</h2>
        <button 
          onClick={() => setShowNewLinkForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Link</span>
        </button>
      </div>

      {/*Links List */}
      <div className="space-y-4">
        {links.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No links yet. Add your first link to get started!</p>
          </div>
        ) : (
          links.map((link) => (
            <div 
              key={link.id}
              className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <ExternalLink className="w-4 h-4 text-purple-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
                        {link.title || 'Untitled Link'}
                      </h3>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{link.url}</p>
                    {link.description && (
                      <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-3">
                      {/* Tags */}
                      {link.tags && link.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <div className="flex space-x-1">
                            {link.tags.map((tag: string, index: number) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <span className="text-xs text-gray-500">
                        {new Date(link.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Link Form Modal */}
      {showNewLinkForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Link</h3>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input 
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
                <input 
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Enter link title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea 
                  rows={3}
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Enter link description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
                <input 
                  type="text"
                  value={newLink.tags}
                  onChange={(e) => setNewLink({ ...newLink, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Enter tags separated by commas"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewLinkForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createLinkMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  {createLinkMutation.isPending ? 'Adding...' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkManager;
