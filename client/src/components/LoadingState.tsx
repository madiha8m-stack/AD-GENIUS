import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Generating your ad campaign...' }: LoadingStateProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20">
      <Card className="p-12 backdrop-blur-xl bg-card/80 border-card-border shadow-2xl shadow-primary/20">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">{message}</h3>
            <p className="text-muted-foreground">This will only take a few moments</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
