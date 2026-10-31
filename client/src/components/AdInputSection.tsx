import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Zap } from 'lucide-react';
import type { Tone } from '@shared/schema';

interface AdInputSectionProps {
  onGenerate: (productName: string, tone: Tone) => void;
  isGenerating: boolean;
}

export function AdInputSection({ onGenerate, isGenerating }: AdInputSectionProps) {
  const [productName, setProductName] = useState('');
  const [tone, setTone] = useState<Tone>('professional');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productName.trim()) {
      onGenerate(productName.trim(), tone);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pt-32 pb-20">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Campaign Generator</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
          AD GENIUS
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your product into a complete ad campaign with AI. 
          Generate copy, visuals, and video ads in seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative backdrop-blur-xl bg-card/50 rounded-2xl p-8 border border-card-border shadow-2xl shadow-primary/10">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-blue-500/5 pointer-events-none" />
          
          <div className="relative space-y-6">
            <div className="space-y-3">
              <Label htmlFor="product-name" className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Product Name
              </Label>
              <Input
                id="product-name"
                data-testid="input-product-name"
                placeholder="e.g., Smart Fitness Watch, Eco-Friendly Water Bottle"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="h-14 text-lg bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                disabled={isGenerating}
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="tone" className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Ad Tone
              </Label>
              <Select value={tone} onValueChange={(value) => setTone(value as Tone)} disabled={isGenerating}>
                <SelectTrigger 
                  id="tone" 
                  data-testid="select-tone"
                  className="h-14 text-lg bg-background/50 border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              data-testid="button-generate"
              disabled={isGenerating || !productName.trim()}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-pulse" />
                  Generating Campaign...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Ad Campaign
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
