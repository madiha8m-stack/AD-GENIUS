import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface VariationsCardProps {
  variations: string[];
  delay?: number;
}

export function VariationsCard({ variations, delay = 0 }: VariationsCardProps) {
  const [copied, setCopied] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card
      className="p-8 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      data-testid="card-variations"
    >
      <h3 className="text-2xl font-bold text-foreground mb-6">A/B Test Variations</h3>
      <div className="space-y-4">
        {variations.map((variation, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-background/50 border border-border hover-elevate active-elevate-2 transition-all"
            data-testid={`variation-${index}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Badge variant="secondary" className="mb-2">
                  Variation {index + 1}
                </Badge>
                <p className="text-sm text-foreground leading-relaxed">{variation}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                data-testid={`button-copy-variation-${index}`}
                onClick={() => copyToClipboard(variation, index)}
                className="hover-elevate active-elevate-2 flex-shrink-0"
              >
                {copied === index ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
