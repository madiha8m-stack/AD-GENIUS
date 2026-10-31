import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Video as VideoIcon } from 'lucide-react';

interface VideoCardProps {
  videoUrl?: string;
  isLoading: boolean;
  delay?: number;
}

export function VideoCard({ videoUrl, isLoading, delay = 0 }: VideoCardProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  console.log('VideoCard render:', { videoUrl, isLoading, videoLoaded, videoError });
  
  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'ad-video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      className="p-8 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      data-testid="card-video"
      data-video-url={videoUrl}
      data-is-loading={isLoading}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Generated Video</h3>
        {videoUrl && (
          <Button
            size="sm"
            variant="ghost"
            data-testid="button-download-video"
            onClick={handleDownload}
            className="hover-elevate active-elevate-2"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="relative aspect-video rounded-lg overflow-hidden bg-background/50 border border-border">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Generating video ad...</p>
            <p className="text-xs text-muted-foreground/70">This may take 1-2 minutes</p>
          </div>
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-cover"
            data-testid="video-generated"
            onLoadedData={() => {
              console.log('[VideoCard] Video loaded successfully:', videoUrl);
              setVideoLoaded(true);
            }}
            onError={(e) => {
              console.error('[VideoCard] Video failed to load:', videoUrl, e);
              setVideoError(true);
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <VideoIcon className="w-12 h-12 opacity-50" />
            <p className="text-sm">Video will appear here</p>
          </div>
        )}
      </div>
    </Card>
  );
}
