import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Play, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { AdCopy } from '@shared/schema';

interface GeneratedBatch {
  images: any[];
  caption: string;
  videoUrl?: string;
}

interface BatchImageVideoGeneratorProps {
  campaign?: {
    adCopy: AdCopy;
    productName: string;
    tone: string;
  } | null;
}

export function BatchImageVideoGenerator({ campaign }: BatchImageVideoGeneratorProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState(
    campaign?.adCopy?.description || 
    `Beautiful ${campaign?.productName || 'product'} photography`
  );
  const [caption, setCaption] = useState(
    campaign?.adCopy?.headline || 'Amazing Product'
  );
  const [batch, setBatch] = useState<GeneratedBatch | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImages, setShowImages] = useState(false);

  const generateImagesMutation = useMutation({
    mutationFn: async () => {
      if (!prompt.trim()) {
        throw new Error('Please enter a prompt');
      }
      console.log('[BATCH] Sending request to generate 10 images...');
      console.log('[BATCH] Prompt:', prompt);
      console.log('[BATCH] Campaign data:', campaign);
      
      const response = await apiRequest<any>('POST', '/api/batch/generate-images-video', {
        prompt: prompt,
        caption: caption,
        productName: campaign?.productName,
        tone: campaign?.tone,
        headline: campaign?.adCopy?.headline,
        description: campaign?.adCopy?.description,
        visualPrompts: campaign?.adCopy?.visualPrompts || [],
      });
      console.log('[BATCH] Response received:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('[BATCH] Success! Generated', data.images?.length, 'images');
      setBatch({
        images: data.images || [],
        caption: data.caption || caption,
      });
      setShowImages(true);
      setSelectedImage(0);
      toast({
        title: 'Success!',
        description: `Generated ${data.images?.length || 10} images using DALL-E 3`,
      });
    },
    onError: (error: Error) => {
      console.error('[BATCH] Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate images',
        variant: 'destructive',
      });
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: async () => {
      if (!batch?.images) throw new Error('No images available');
      console.log('[BATCH] Creating video from', batch.images.length, 'images...');
      const response = await apiRequest<any>('POST', '/api/batch/create-video', {
        images: batch.images,
        caption: batch.caption,
      });
      console.log('[BATCH] Video created:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('[BATCH] Video created successfully');
      setBatch((prev) => (prev ? { ...prev, videoUrl: data.videoUrl } : prev));
      toast({
        title: 'Video Created!',
        description: 'Your slideshow is ready',
      });
    },
    onError: (error: Error) => {
      console.error('[BATCH] Video error:', error);
      toast({
        title: 'Video Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (showImages && batch) {
    return (
      <div className="w-full min-h-screen bg-background p-8">
        <Button
          onClick={() => {
            setShowImages(false);
            setBatch(null);
          }}
          variant="outline"
          className="mb-6"
        >
          ← Back to Generator
        </Button>

        <div className="space-y-6">
          {/* Main Image */}
          <Card className="p-6 backdrop-blur-xl bg-card/80 border-card-border">
            <h2 className="text-2xl font-bold mb-4">Generated Images</h2>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black mb-4">
              {batch.images[selectedImage] ? (
                <img
                  src={batch.images[selectedImage]}
                  alt={`Image ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">Loading...</div>
              )}
              <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded text-white">
                {selectedImage + 1}/{batch.images.length}
              </div>

              {/* Navigation */}
              <button
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 p-2 rounded"
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setSelectedImage(Math.min(batch.images.length - 1, selectedImage + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 p-2 rounded"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {batch.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition ${
                    selectedImage === idx ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img src={img} alt={`${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </Card>

          {/* Create Video Button */}
          <Card className="p-6 backdrop-blur-xl bg-card/80 border-card-border">
            <Button
              onClick={() => createVideoMutation.mutate()}
              disabled={createVideoMutation.isPending || batch.videoUrl !== undefined}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-600/90 hover:to-emerald-600/90 py-6 text-lg"
            >
              {createVideoMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Video...
                </>
              ) : batch.videoUrl ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Video Complete!
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Create Video from Images
                </>
              )}
            </Button>
          </Card>

          {/* Video Preview */}
          {batch.videoUrl && (
            <Card className="p-6 backdrop-blur-xl bg-card/80 border-card-border">
              <h3 className="text-2xl font-bold mb-4">Your Video</h3>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black mb-4">
                <video src={batch.videoUrl} controls className="w-full h-full" />
              </div>
              <Button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = batch.videoUrl!;
                  a.download = 'slideshow.mp4';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Video
              </Button>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto p-8 backdrop-blur-xl bg-card/80 border-card-border">
        <h1 className="text-4xl font-bold mb-2">Image & Video Generator</h1>
        <p className="text-muted-foreground mb-8">Generate 10 professional images and create a beautiful slideshow video</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">What do you want to create?</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. 'Beautiful sunset over mountains', 'Modern office workspace', 'Delicious chocolate cake'"
              className="w-full h-32"
            />
            <p className="text-xs text-muted-foreground mt-2">Be specific for better results</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video Caption</label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="E.g. 'Amazing Product Showcase'"
            />
          </div>

          <Button
            onClick={() => generateImagesMutation.mutate()}
            disabled={generateImagesMutation.isPending || !prompt.trim()}
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 py-6 text-lg"
          >
            {generateImagesMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating 10 Images... This may take a minute
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Generate 10 Images
              </>
            )}
          </Button>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> The more detailed your description, the better the images will be!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
