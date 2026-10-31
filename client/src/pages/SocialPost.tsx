import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PostGeneratorCard } from '@/components/PostGeneratorCard';
import { ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';
import type { AdCopy, Tone } from '@shared/schema';

interface SocialPostPageProps {
  adCopy: AdCopy;
  productName: string;
  tone: Tone;
  onBack: () => void;
  onNext: () => void;
}

export function SocialPostPage({ adCopy, productName, tone, onBack, onNext }: SocialPostPageProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [post, setPost] = useState<string>('');

  const postMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest<{ post: string }>('POST', '/api/post/generate', {
        prompt: `Create a social media post for ${productName} with tone ${tone}`,
      });
      return result.post;
    },
    onSuccess: (data) => {
      setPost(data);
      toast({
        title: 'Post Generated!',
        description: 'Your social post is ready to copy.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCopy = () => {
    if (post) {
      navigator.clipboard.writeText(post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Post copied to clipboard',
      });
    }
  };

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
          <h1 className="text-4xl font-bold mb-8">Social Media Post</h1>
          
          <Card className="p-8 backdrop-blur-xl bg-card/80 border-card-border">
            <Button
              onClick={() => postMutation.mutate()}
              disabled={postMutation.isPending}
              className="w-full mb-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-600/90 hover:to-emerald-600/90"
            >
              {postMutation.isPending ? 'Generating...' : 'Generate Social Post'}
            </Button>

            {post && (
              <div className="space-y-4">
                <div className="bg-background/50 p-6 rounded-lg border border-border">
                  <p className="text-foreground whitespace-pre-wrap">{post}</p>
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          <div className="mt-12">
            <PostGeneratorCard productName={productName} tone={tone} adCopy={adCopy} delay={0} />
          </div>
        </div>
      </div>
    </div>
  );
}
