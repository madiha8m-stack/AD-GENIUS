import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageCard } from '@/components/ImageCard';
import { ArrowLeft, ArrowRight, Loader2, Download, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { AdCopy } from '@shared/schema';

interface GeneratedImagesPageProps {
  adCopy: AdCopy;
  onBack: () => void;
  onNext: () => void;
}

export function GeneratedImagesPage({ adCopy, onBack, onNext }: GeneratedImagesPageProps) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  const imageMutation = useMutation({
    mutationFn: async (prompt?: string) => {
      // Use custom prompt if provided, otherwise use description or headline
      const imagePrompt = prompt || customPrompt || adCopy.description || adCopy.headline || 'professional product photography';
      console.log('[IMAGE PAGE] Generating image with prompt:', imagePrompt);
      const result = await apiRequest<any>('POST', '/api/image/generate', { prompt: imagePrompt });
      return result.imageUrl;
    },
    onSuccess: (url) => {
      setImageUrl(url);
      setShowPromptInput(false);
      toast({
        title: 'Image Generated!',
        description: 'Your image is ready. Click Regenerate to try another.',
      });
    },
    onError: (error: Error) => {
      console.error('[IMAGE PAGE] Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    imageMutation.mutate(undefined);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-background">
      <div className="relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 pt-6 pb-6">
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={onNext}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg ml-auto"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Next: Visual Prompts
            </Button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-20">
          <h1 className="text-4xl font-bold mb-8">Generated Images</h1>
          
          {imageMutation.isPending ? (
            <Card className="p-8 backdrop-blur-xl bg-card/80 border-card-border flex items-center justify-center min-h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Generating image...</p>
              </div>
            </Card>
          ) : imageUrl ? (
            <div className="space-y-6">
              <ImageCard imageUrl={imageUrl} isLoading={false} delay={0} />
              <Button
                onClick={() => imageMutation.mutate(undefined)}
                variant="outline"
                className="w-full"
              >
                Regenerate Image
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
