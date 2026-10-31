import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface VisualPromptsCardProps {
  prompts: string[];
  delay?: number;
}

export function VisualPromptsCard({ prompts, delay = 0 }: VisualPromptsCardProps) {
  const [copied, setCopied] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (index: number) => {
    setExpanded((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <Card
      className="p-8 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      data-testid="card-visual-prompts"
    >
      <h3 className="text-2xl font-bold text-foreground mb-6">Visual Creative Prompts</h3>
      <div className="space-y-4">
        {prompts.map((prompt, index) => {
          const isLong = prompt.length > 150;
          const isExpanded = expanded.includes(index);
          const displayText = isLong && !isExpanded ? prompt.slice(0, 150) + '...' : prompt;

          return (
            <div
              key={index}
              className="p-4 rounded-lg bg-background/50 border border-border hover-elevate active-elevate-2 transition-all"
              data-testid={`prompt-${index}`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <ImageIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Prompt {index + 1}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  data-testid={`button-copy-prompt-${index}`}
                  onClick={() => copyToClipboard(prompt, index)}
                  className="hover-elevate active-elevate-2 flex-shrink-0"
                >
                  {copied === index ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-foreground leading-relaxed ml-11">
                {displayText}
              </p>
              {isLong && (
                <button
                  onClick={() => toggleExpand(index)}
                  className="text-xs text-primary hover:text-primary/80 mt-2 ml-11 font-medium"
                  data-testid={`button-expand-${index}`}
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
