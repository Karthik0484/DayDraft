
import { useState } from 'react';
import { Calendar, Image, FileText, Video, Youtube, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyLogCardProps {
  log: {
    id: string;
    title: string;
    description: string | null;
    log_date: string;
    image_url: string | null;
    file_url: string | null;
    file_name: string | null;
    file_size: number | null;
    video_url: string | null;
    video_type: string | null;
    created_at: string;
  };
  onUpdate: () => void;
}

const DailyLogCard = ({ log, onUpdate }: DailyLogCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
  };

  const deleteLog = async () => {
    if (!confirm('Are you sure you want to delete this daily log entry?')) return;

    try {
      // Delete files from storage if they exist
      if (log.image_url) {
        const imagePath = log.image_url.split('/daily-logs/')[1];
        if (imagePath) {
          await supabase.storage.from('daily-logs').remove([imagePath]);
        }
      }

      if (log.file_url) {
        const filePath = log.file_url.split('/daily-logs/')[1];
        if (filePath) {
          await supabase.storage.from('daily-logs').remove([filePath]);
        }
      }

      if (log.video_url && log.video_type === 'upload') {
        const videoPath = log.video_url.split('/daily-logs/')[1];
        if (videoPath) {
          await supabase.storage.from('daily-logs').remove([videoPath]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', log.id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Daily log entry has been deleted successfully.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{log.title}</h3>
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(log.log_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span>•</span>
            <span>Created {new Date(log.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
        <button
          onClick={deleteLog}
          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      {log.description && (
        <div className="mb-4">
          <p className={`text-gray-700 ${!showFullDescription && log.description.length > 200 ? 'line-clamp-3' : ''}`}>
            {log.description}
          </p>
          {log.description.length > 200 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-purple-600 hover:text-purple-700 text-sm mt-1"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Attachments */}
      <div className="space-y-4">
        {/* Image */}
        {log.image_url && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Image className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Image</span>
            </div>
            <img
              src={log.image_url}
              alt="Daily log image"
              className="rounded-lg max-w-full h-64 object-cover"
            />
          </div>
        )}

        {/* File */}
        {log.file_url && log.file_name && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Document</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{log.file_name}</p>
                {log.file_size && (
                  <p className="text-sm text-gray-500">{formatFileSize(log.file_size)}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <a
                  href={log.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </a>
                <a
                  href={log.file_url}
                  download
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Download
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Video */}
        {log.video_url && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {log.video_type === 'youtube' ? (
                <Youtube className="w-4 h-4 text-red-500" />
              ) : (
                <Video className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {log.video_type === 'youtube' ? 'YouTube Video' : 'Video'}
              </span>
            </div>
            {log.video_type === 'youtube' ? (
              <iframe
                src={getYouTubeEmbedUrl(log.video_url)}
                className="w-full h-64 rounded-lg"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <video
                src={log.video_url}
                controls
                className="w-full h-64 rounded-lg"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLogCard;
