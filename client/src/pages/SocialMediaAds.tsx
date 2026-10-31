import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/LoadingState';
import { Copy, Check, Twitter, Instagram, Linkedin } from 'lucide-react';

interface SocialPost {
  twitter: {
    content: string;
    hashtags: string[];
  };
  instagram: {
    caption: string;
    hashtags: string[];
    call_to_action: string;
  };
  linkedin: {
    content: string;
    hashtags: string[];
    call_to_action: string;
  };
}

export default function SocialMediaAds() {
  const [productName, setProductName] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [posts, setPosts] = useState<SocialPost | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const generatePosts = async () => {
    if (!productName || !headline || !description) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate posts
      const postsResponse = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, headline, description }),
      });

      if (!postsResponse.ok) throw new Error('Failed to generate posts');
      const postsData = await postsResponse.json();
      setPosts(postsData);

      // Generate banner ad
      const bannerResponse = await fetch('/api/social/banner-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, headline, description }),
      });

      if (bannerResponse.ok) {
        const bannerData = await bannerResponse.json();
        setBannerImage(bannerData.bannerImage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatTwitterPost = (post: SocialPost['twitter']) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(' ');
    return `${post.content}\n\n${hashtags}`;
  };

  const formatInstagramPost = (post: SocialPost['instagram']) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(' ');
    return `${post.caption}\n\n${hashtags}\n\n${post.call_to_action}`;
  };

  const formatLinkedInPost = (post: SocialPost['linkedin']) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(' ');
    return `${post.content}\n\n${hashtags}\n\n${post.call_to_action}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Social Media Ad Generator</h1>
        <p className="text-gray-400 mb-8">Create platform-specific posts for Twitter, Instagram, and LinkedIn with banner ads</p>

        {/* Input Section */}
        <Card className="bg-gray-800/50 border-gray-700 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Product Name</label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Premium Coffee Maker"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Headline</label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Brew Perfect Coffee Every Time"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Advanced brewing technology with smart temperature control"
                rows={3}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <Button
              onClick={generatePosts}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Generating...' : 'Generate Social Media Posts & Banner'}
            </Button>

            {error && <p className="text-red-500">{error}</p>}
          </div>
        </Card>

        {loading && <LoadingState />}

        {/* Banner Image Display */}
        {bannerImage && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Banner Ad Image</h2>
            <Card className="bg-gray-800/50 border-gray-700 p-4">
              <img
                src={bannerImage}
                alt="Social Media Banner Ad"
                className="w-full rounded-lg shadow-lg max-h-96 object-cover"
              />
            </Card>
          </div>
        )}

        {/* Social Media Posts Display */}
        {posts && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Twitter Post */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Twitter className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Twitter/X</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4 min-h-32">
                  <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                    {posts.twitter.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {posts.twitter.hashtags.map((tag, i) => (
                    <span key={i} className="text-blue-400 text-xs">#{tag}</span>
                  ))}
                </div>

                <Button
                  onClick={() => copyToClipboard(formatTwitterPost(posts.twitter), 'twitter')}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/20"
                >
                  {copied === 'twitter' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Post
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Instagram Post */}
            <Card className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 border-pink-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Instagram className="w-5 h-5 text-pink-400" />
                <h3 className="text-xl font-bold text-white">Instagram</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4 min-h-32">
                  <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                    {posts.instagram.caption}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {posts.instagram.hashtags.map((tag, i) => (
                    <span key={i} className="text-pink-400 text-xs">#{tag}</span>
                  ))}
                </div>

                <Button
                  onClick={() => copyToClipboard(formatInstagramPost(posts.instagram), 'instagram')}
                  variant="outline"
                  className="w-full border-pink-600 text-pink-400 hover:bg-pink-600/20"
                >
                  {copied === 'instagram' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Caption
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* LinkedIn Post */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-blue-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Linkedin className="w-5 h-5 text-blue-300" />
                <h3 className="text-xl font-bold text-white">LinkedIn</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4 min-h-32">
                  <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                    {posts.linkedin.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {posts.linkedin.hashtags.map((tag, i) => (
                    <span key={i} className="text-blue-300 text-xs">#{tag}</span>
                  ))}
                </div>

                <Button
                  onClick={() => copyToClipboard(formatLinkedInPost(posts.linkedin), 'linkedin')}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-300 hover:bg-blue-600/20"
                >
                  {copied === 'linkedin' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Post
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
