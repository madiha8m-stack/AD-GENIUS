import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Hash } from 'lucide-react';
import type { AdCampaign } from '@shared/schema';

interface HashtagsCardProps {
  hashtags: string[];
  campaign?: AdCampaign;
  delay?: number;
}

export function HashtagsCard({ hashtags, campaign, delay = 0 }: HashtagsCardProps) {
  const downloadJSON = () => {
    if (!campaign) return;
    
    const dataStr = JSON.stringify(campaign, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ad-campaign-${campaign.productName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      className="p-8 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      data-testid="card-hashtags"
    >
      <h3 className="text-2xl font-bold text-foreground mb-6">Hashtags & Export</h3>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Hash className="w-4 h-4" />
            <span>Recommended Hashtags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((hashtag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1.5 text-sm font-medium"
                data-testid={`hashtag-${index}`}
              >
                #{hashtag}
              </Badge>
            ))}
          </div>
        </div>

        {campaign && (
          <div className="pt-4 border-t border-border">
            <Button
              onClick={downloadJSON}
              data-testid="button-download-json"
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Complete Campaign (JSON)
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
