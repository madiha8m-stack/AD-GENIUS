import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { VariationsCard } from '@/components/VariationsCard';
import { ComparisonView } from '@/components/ComparisonView';
import { ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';
import type { AdCopy } from '@shared/schema';

interface ABTestPageProps {
  adCopy: AdCopy;
  onBack: () => void;
  onNext: () => void;
}

export function ABTestPage({ adCopy, onBack, onNext }: ABTestPageProps) {
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
              Next: Hashtags
            </Button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-20">
          <h1 className="text-4xl font-bold mb-8">A/B Test Variations</h1>
          <VariationsCard variations={adCopy.variations} delay={100} />
          
          <div className="mt-12">
            <ComparisonView adCopy={adCopy} onClose={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
