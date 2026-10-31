import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { AdInputSection } from '@/components/AdInputSection';
import { AdCopyCard } from '@/components/AdCopyCard';
import { LoadingState } from '@/components/LoadingState';
import { Save, ArrowRight } from 'lucide-react';
import type { Tone, AdCopy } from '@shared/schema';

interface AdCopyPageProps {
  onNext: (data: { adCopy: AdCopy; productName: string; tone: Tone }) => void;
}

export function AdCopyPage({ onNext }: AdCopyPageProps) {
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<{ productName: string; tone: Tone; adCopy: AdCopy } | null>(null);

  const adMutation = useMutation({
    mutationFn: async ({ productName, tone }: { productName: string; tone: Tone }) => {
      const data = await apiRequest<AdCopy>('POST', '/api/ad/generate', { productName, tone });
      return { productName, tone, adCopy: data };
    },
    onSuccess: (data) => {
      setCampaign(data);
      toast({
        title: 'Ad Copy Generated!',
        description: 'Your campaign copy is ready.',
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

  const isGenerating = adMutation.isPending;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="relative z-10">
        <AdInputSection 
          onGenerate={(productName, tone) => adMutation.mutate({ productName, tone })}
          isGenerating={isGenerating}
        />

        {isGenerating && <LoadingState />}

        {campaign && !isGenerating && (
          <>
            <div className="w-full max-w-7xl mx-auto px-6 pb-6">
              <Button
                onClick={() => onNext(campaign)}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Next: A/B Testing
              </Button>
            </div>

            <div className="w-full max-w-7xl mx-auto px-6 pb-20">
              <AdCopyCard adCopy={campaign.adCopy} delay={100} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
