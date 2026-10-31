import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, Users, Target, Eye } from 'lucide-react';
import type { AdCopy } from '@shared/schema';

interface ComparisonViewProps {
  adCopy: AdCopy;
  onClose: () => void;
}

export function ComparisonView({ adCopy, onClose }: ComparisonViewProps) {
  const getMockMetrics = () => {
    const baselineMetrics = {
      ctr: 2.1 + Math.random() * 1.5,
      engagement: 15 + Math.random() * 10,
      conversion: 3.5 + Math.random() * 2,
      views: 10000 + Math.floor(Math.random() * 5000),
    };

    const variantMetrics = adCopy.variations.map(() => ({
      ctr: 2.1 + Math.random() * 1.5,
      engagement: 15 + Math.random() * 10,
      conversion: 3.5 + Math.random() * 2,
      views: 10000 + Math.floor(Math.random() * 5000),
    }));

    return { baselineMetrics, variantMetrics };
  };

  const { baselineMetrics, variantMetrics } = getMockMetrics();

  const MetricCard = ({ icon: Icon, label, value, isWinner }: any) => (
    <div className={`p-3 rounded-lg ${isWinner ? 'bg-primary/10 border border-primary/30' : 'bg-background/50'} transition-all`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        {isWinner && (
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            Winner
          </Badge>
        )}
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );

  const findWinner = (baselineVal: number, variantVals: number[]) => {
    const allVals = [baselineVal, ...variantVals];
    const maxVal = Math.max(...allVals);
    return allVals.indexOf(maxVal);
  };

  const ctrWinner = findWinner(baselineMetrics.ctr, variantMetrics.map(v => v.ctr));
  const engagementWinner = findWinner(baselineMetrics.engagement, variantMetrics.map(v => v.engagement));
  const conversionWinner = findWinner(baselineMetrics.conversion, variantMetrics.map(v => v.conversion));
  const viewsWinner = findWinner(baselineMetrics.views, variantMetrics.map(v => v.views));

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">A/B Test Comparison</h2>
              <p className="text-muted-foreground">Compare performance metrics across variations</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              data-testid="button-close-comparison"
              className="hover-elevate active-elevate-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/10" data-testid="card-baseline">
              <div className="mb-4">
                <Badge className="mb-2">Baseline</Badge>
                <h3 className="text-xl font-bold text-foreground mb-2">{adCopy.headline}</h3>
                <p className="text-sm text-muted-foreground mb-2">{adCopy.description}</p>
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
                  {adCopy.callToAction}
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <MetricCard 
                  icon={TrendingUp} 
                  label="CTR" 
                  value={`${baselineMetrics.ctr.toFixed(2)}%`} 
                  isWinner={ctrWinner === 0}
                />
                <MetricCard 
                  icon={Users} 
                  label="Engagement" 
                  value={`${baselineMetrics.engagement.toFixed(1)}%`} 
                  isWinner={engagementWinner === 0}
                />
                <MetricCard 
                  icon={Target} 
                  label="Conversion" 
                  value={`${baselineMetrics.conversion.toFixed(2)}%`} 
                  isWinner={conversionWinner === 0}
                />
                <MetricCard 
                  icon={Eye} 
                  label="Total Views" 
                  value={baselineMetrics.views.toLocaleString()} 
                  isWinner={viewsWinner === 0}
                />
              </div>
            </Card>

            {adCopy.variations.map((variation, index) => (
              <Card 
                key={index} 
                className="p-6 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/10"
                data-testid={`card-variation-${index}`}
              >
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">Variation {index + 1}</Badge>
                  <h3 className="text-xl font-bold text-foreground mb-2">{variation}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{adCopy.description}</p>
                  <div className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
                    {adCopy.callToAction}
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <MetricCard 
                    icon={TrendingUp} 
                    label="CTR" 
                    value={`${variantMetrics[index].ctr.toFixed(2)}%`} 
                    isWinner={ctrWinner === index + 1}
                  />
                  <MetricCard 
                    icon={Users} 
                    label="Engagement" 
                    value={`${variantMetrics[index].engagement.toFixed(1)}%`} 
                    isWinner={engagementWinner === index + 1}
                  />
                  <MetricCard 
                    icon={Target} 
                    label="Conversion" 
                    value={`${variantMetrics[index].conversion.toFixed(2)}%`} 
                    isWinner={conversionWinner === index + 1}
                  />
                  <MetricCard 
                    icon={Eye} 
                    label="Total Views" 
                    value={variantMetrics[index].views.toLocaleString()} 
                    isWinner={viewsWinner === index + 1}
                  />
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>* Metrics are simulated for demonstration purposes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
