import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';

export function PostGeneratorCard({ productName, tone, adCopy, delay = 100 }: any) {
  const [post, setPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePost = async () => {
    setLoading(true);
    try {
      const payload: any = {};
      if (productName) payload.productName = productName;
      if (tone) payload.tone = tone;
      if (adCopy) payload.adCopy = adCopy;

      const result = await apiRequest<{ post: string }>('POST', '/api/post/generate', payload);
      setPost(result.post);
    } catch (err: any) {
      setPost('Failed to generate post: ' + (err?.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="p-4 backdrop-blur-xl bg-card/80 border-card-border rounded-2xl shadow-md animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-lg font-semibold mb-2">Social Post</h3>
      <p className="text-sm text-muted-foreground mb-3">Generate a short social post based on the ad copy.</p>

      <div className="mb-3">
        <Button onClick={generatePost} disabled={loading} className="w-full">
          {loading ? 'Generating...' : 'Generate Post'}
        </Button>
      </div>

      {post && (
        <div className="mt-2 p-3 bg-card/80 border border-border rounded-lg text-sm break-words">
          {post}
        </div>
      )}
    </Card>
  );
}
