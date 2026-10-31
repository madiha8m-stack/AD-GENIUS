import { Button } from '@/components/ui/button';
import { VisualPromptsCard } from '@/components/VisualPromptsCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { AdCopy } from '@shared/schema';

interface VisualPromptsPageProps {
  adCopy: AdCopy;
  onBack: () => void;
  onNext?: () => void;
}

export function VisualPromptsPage({ adCopy, onBack, onNext }: VisualPromptsPageProps) {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-background">
      <div className="relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 pt-6 pb-6">
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="ml-auto px-4 py-2 rounded-lg bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 flex items-center gap-2">
              <span className="text-sm font-semibold text-green-400">✓ Campaign Complete</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-20">
          <h1 className="text-4xl font-bold mb-8">Visual Prompts</h1>
          <VisualPromptsCard prompts={adCopy.visualPrompts} delay={100} />
        </div>
      </div>
    </div>
  );
}
