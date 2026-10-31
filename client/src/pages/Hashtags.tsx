import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HashtagsCard } from '@/components/HashtagsCard';
import { ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { AdCopy } from '@shared/schema';

interface HashtagsPageProps {
  adCopy: AdCopy;
  campaign: any;
  onBack: () => void;
  onNext: () => void;
}

export function HashtagsPage({ adCopy, campaign, onBack, onNext }: HashtagsPageProps) {
  const [copied, setCopied] = useState(false);
  const hashtagText = adCopy.hashtags?.join(' ') || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(hashtagText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              Next: Generated Images
            </Button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-20">
          <h1 className="text-4xl font-bold mb-8">Hashtags</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HashtagsCard hashtags={adCopy.hashtags} campaign={campaign} delay={0} />
            </div>

            <Card className="p-6 backdrop-blur-xl bg-card/80 border-card-border">
              <h3 className="font-bold mb-4">Copy Hashtags</h3>
              <div className="bg-background/50 p-4 rounded mb-4 max-h-96 overflow-y-auto">
                <p className="text-sm text-muted-foreground break-words">{hashtagText}</p>
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
                    Copy All
                  </>
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
