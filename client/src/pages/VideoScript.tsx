import { useState } from 'react';
import { ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface VideoScriptProps {
  adCopy: {
    headline: string;
    description: string;
    callToAction: string;
    variations?: string[];
    visualPrompts?: string[];
    hashtags?: string[];
  };
  productName: string;
  onBack: () => void;
  onNext?: () => void;
}

interface VideoScript {
  title: string;
  duration: number;
  scenes: Array<{
    sceneNumber: number;
    duration: number;
    visual: string;
    voiceover: string;
    music: string;
    onscreen_text: string;
  }>;
  music_style: string;
  pacing: string;
  callToAction: string;
}

export default function VideoScriptPage({
  adCopy,
  productName,
  onBack,
  onNext,
}: VideoScriptProps) {
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateVideoScript = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/video/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          headline: adCopy.headline,
          description: adCopy.description,
          callToAction: adCopy.callToAction,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate video script');
      const data = await response.json();
      setVideoScript(data);
    } catch (error) {
      console.error('Error generating video script:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (videoScript) {
      navigator.clipboard.writeText(JSON.stringify(videoScript, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative z-10">
        <div className="w-full max-w-7xl mx-auto px-6 pt-6 pb-6">
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="ml-auto text-2xl font-bold text-white">Video Script Generator</h1>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 pb-12">
          {!videoScript ? (
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <div className="text-center space-y-4">
                <p className="text-slate-300 text-lg">Generate a professional video script in JSON format</p>
                <Button
                  onClick={generateVideoScript}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full"
                >
                  {loading ? 'Generating...' : 'Generate Video Script (JSON)'}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">{videoScript.title}</h2>
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy JSON
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                  <pre className="text-slate-300 text-sm overflow-auto max-h-96 font-mono">
                    {JSON.stringify(videoScript, null, 2)}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Duration</p>
                    <p className="text-white font-semibold">{videoScript.duration}s</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Scenes</p>
                    <p className="text-white font-semibold">{videoScript.scenes.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Music Style</p>
                    <p className="text-white font-semibold">{videoScript.music_style}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Pacing</p>
                    <p className="text-white font-semibold">{videoScript.pacing}</p>
                  </div>
                </div>

                <Button
                  onClick={generateVideoScript}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Generate Another
                </Button>
              </Card>

              <div className="flex gap-3">
                <Button onClick={onBack} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                {onNext && (
                  <Button
                    onClick={onNext}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg ml-auto"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
