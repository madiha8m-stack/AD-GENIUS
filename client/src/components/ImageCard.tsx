import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageCardProps {
  imageUrl?: string;
  isLoading: boolean;
  delay?: number;
}

export function ImageCard({ imageUrl, isLoading, delay = 0 }: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  console.log('ImageCard render:', { imageUrl, isLoading, imageLoaded, imageError });
  
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'ad-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      className="p-8 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      data-testid="card-image"
      data-image-url={imageUrl}
      data-is-loading={isLoading}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Generated Image</h3>
        {imageUrl && (
          <Button
            size="sm"
            variant="ghost"
            data-testid="button-download-image"
            onClick={handleDownload}
            className="hover-elevate active-elevate-2"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="relative aspect-square rounded-lg overflow-hidden bg-background/50 border border-border">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Generating image...</p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated ad visual"
            className="w-full h-full object-cover"
            data-testid="img-generated"
            onLoad={() => {
              console.log('[ImageCard] Image loaded successfully:', imageUrl);
              setImageLoaded(true);
            }}
            onError={(e) => {
              console.error('[ImageCard] Image failed to load:', imageUrl, e);
              setImageError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <ImageIcon className="w-12 h-12 opacity-50" />
            <p className="text-sm">Image will appear here</p>
          </div>
        )}
      </div>
    </Card>
  );
}
