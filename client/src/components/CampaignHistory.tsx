import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Campaign } from '@shared/schema';

interface CampaignHistoryProps {
  onLoadCampaign: (campaign: Campaign) => void;
}

export function CampaignHistory({ onLoadCampaign }: CampaignHistoryProps) {
  const { toast } = useToast();

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
    refetchInterval: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: 'Campaign Deleted',
        description: 'The campaign has been removed from history.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete campaign',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p className="text-sm">Loading campaigns...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="p-6 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No saved campaigns yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Generate and save your first campaign to see it here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {campaigns.map((campaign: Campaign) => (
          <Card
            key={campaign.id}
            className="p-4 cursor-pointer backdrop-blur-xl bg-card/80 border-card-border hover-elevate active-elevate-2 transition-all"
            onClick={() => onLoadCampaign(campaign)}
            data-testid={`campaign-history-${campaign.id}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                {campaign.productName}
              </h4>
              <Button
                size="sm"
                variant="ghost"
                data-testid={`button-delete-campaign-${campaign.id}`}
                onClick={(e) => handleDelete(e, campaign.id)}
                className="hover-elevate active-elevate-2 flex-shrink-0 h-7 w-7 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs capitalize">
                {campaign.tone}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
