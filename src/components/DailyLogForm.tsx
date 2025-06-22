
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { X, Upload, Image, FileText, Video, Youtube, Trash2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DailyLogFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const DailyLogForm = ({ onClose, onSuccess }: DailyLogFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [logDate, setLogDate] = useState<Date>(new Date());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocFile(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setVideoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('daily-logs')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('daily-logs')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setSaving(true);
    try {
      let imageUrl = '';
      let fileUrl = '';
      let fileName = '';
      let fileSize = 0;
      let videoUrl = '';
      let videoType = '';

      // Upload image if present
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'images');
      }

      // Upload document if present
      if (docFile) {
        fileUrl = await uploadFile(docFile, 'documents');
        fileName = docFile.name;
        fileSize = docFile.size;
      }

      // Upload video if present
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'videos');
        videoType = 'upload';
      } else if (youtubeUrl.trim()) {
        videoUrl = youtubeUrl;
        videoType = 'youtube';
      }

      // Save to database
      const { error } = await supabase
        .from('daily_logs')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          log_date: format(logDate, 'yyyy-MM-dd'),
          image_url: imageUrl || null,
          file_url: fileUrl || null,
          file_name: fileName || null,
          file_size: fileSize || null,
          video_url: videoUrl || null,
          video_type: videoType || null,
        });

      if (error) throw error;

      toast({
        title: "Daily log saved",
        description: "Your daily log entry has been saved successfully.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">New Daily Log Entry</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !logDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {logDate ? format(logDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={logDate}
                  onSelect={(date) => date && setLogDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you do today?"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your activities, thoughts, and progress..."
              rows={4}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Image className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Upload an image</span>
              </label>
              {imagePreview && (
                <div className="mt-4 relative">
                  <img src={imagePreview} alt="Preview" className="max-w-full h-32 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleDocUpload}
                className="hidden"
                id="doc-upload"
              />
              <label
                htmlFor="doc-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <FileText className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">Upload a document</span>
              </label>
              {docFile && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{docFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setDocFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video
            </label>
            <div className="space-y-4">
              {/* Video File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Video className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload a video</span>
                </label>
                {videoPreview && (
                  <div className="mt-4 relative">
                    <video src={videoPreview} controls className="max-w-full h-32 rounded" />
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* YouTube URL */}
              <div className="flex items-center space-x-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Or paste YouTube URL"
                  disabled={!!videoFile}
                />
              </div>
              {youtubeUrl && getYouTubeEmbedUrl(youtubeUrl) && (
                <div className="mt-2">
                  <iframe
                    src={getYouTubeEmbedUrl(youtubeUrl)}
                    className="w-full h-32 rounded"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !title.trim()}
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyLogForm;
