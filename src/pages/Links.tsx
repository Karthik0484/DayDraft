
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import DashboardHeader from '@/components/DashboardHeader';
import LinkManager from '@/components/LinkManager';

const Links = () => {
  const { user } = useAuth();

  // Fetch user links
  const { data: links = [], refetch: refetchLinks } = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const linksChannel = supabase
      .channel('links-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'links',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          refetchLinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(linksChannel);
    };
  }, [user, refetchLinks]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Links</h1>
          <p className="text-gray-600 mt-2">Save and organize your important links.</p>
        </div>

        <LinkManager links={links} />
      </div>
    </div>
  );
};

export default Links;
