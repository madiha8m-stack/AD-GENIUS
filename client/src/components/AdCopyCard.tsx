import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { AdCopy } from '@shared/schema';

interface AdCopyCardProps {
  adCopy: AdCopy;
  delay?: number;
}

export function AdCopyCard({ adCopy, delay = 0 }: AdCopyCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card
      className="p-8 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 lg:col-span-2 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      data-testid="card-ad-copy"
    >
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Main Ad Copy</h3>
        <Button
          size="sm"
          variant="ghost"
          data-testid="button-copy-all"
          onClick={() => copyToClipboard(
            `${adCopy.headline}\n\n${adCopy.description}\n\n${adCopy.callToAction}`,
            'all'
          )}
          className="hover-elevate active-elevate-2"
        >
          {copied === 'all' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Headline</span>
            <Button
              size="sm"
              variant="ghost"
              data-testid="button-copy-headline"
              onClick={() => copyToClipboard(adCopy.headline, 'headline')}
              className="h-8 hover-elevate active-elevate-2"
            >
              {copied === 'headline' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <p className="text-2xl font-bold text-foreground leading-tight" data-testid="text-headline">
            {adCopy.headline}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</span>
            <Button
              size="sm"
              variant="ghost"
              data-testid="button-copy-description"
              onClick={() => copyToClipboard(adCopy.description, 'description')}
              className="h-8 hover-elevate active-elevate-2"
            >
              {copied === 'description' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed" data-testid="text-description">
            {adCopy.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Call to Action</span>
            <Button
              size="sm"
              variant="ghost"
              data-testid="button-copy-cta"
              onClick={() => copyToClipboard(adCopy.callToAction, 'cta')}
              className="h-8 hover-elevate active-elevate-2"
            >
              {copied === 'cta' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <p className="text-base text-muted-foreground" data-testid="text-cta">
            {adCopy.callToAction}
          </p>
        </div>
      </div>
    </Card>
  );
}
