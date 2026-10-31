import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/LoadingState";
import { ArrowLeft, Copy, Check, Share2, Download } from "lucide-react";

interface SocialMediaPostsFlowProps {
  adCopy: any;
  productName?: string;
  onBack: () => void;
  onNext: () => void;
}

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

export default function SocialMediaPostsFlow({ adCopy, productName, onBack, onNext }: SocialMediaPostsFlowProps) {
  const [posts, setPosts] = useState<SocialPost | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const generatePosts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName || "Premium Product",
          headline: adCopy.headline,
          description: adCopy.description,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate posts");

      const data = await response.json();
      setPosts(data);

      // Generate banner image
      const bannerResponse = await fetch("/api/social/banner-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName || "Premium Product",
          headline: adCopy.headline,
          description: adCopy.description,
        }),
      });

      if (bannerResponse.ok) {
        const bannerData = await bannerResponse.json();
        setBannerImage(bannerData.bannerImage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadBanner = async () => {
    if (!bannerImage) {
      console.error("No banner image available");
      return;
    }
    try {
      const link = document.createElement("a");
      link.href = bannerImage;
      link.download = `${productName || "social"}-banner.jpg`;
      link.click();
    } catch (err) {
      console.error("Failed to download banner:", err);
    }
  };

  const downloadBannerAsImage = async () => {
    if (!bannerRef.current) return;
    try {
      // Try using html2canvas if available
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = async () => {
        const html2canvas = (window as any).html2canvas;
        if (html2canvas) {
          const canvas = await html2canvas(bannerRef.current, {
            backgroundColor: "#ffffff",
            scale: 2,
          });
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${productName || "social"}-banner.png`;
          link.click();
        } else {
          downloadBanner();
        }
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error("Failed to download banner as image:", err);
      // Fallback
      downloadBanner();
    }
  };

  const formatTwitterPost = (post: SocialPost["twitter"]) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(" ");
    return `${post.content}\n\n${hashtags}`;
  };

  const formatInstagramPost = (post: SocialPost["instagram"]) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(" ");
    return `${post.caption}\n\n${hashtags}\n\n${post.call_to_action}`;
  };

  const formatLinkedInPost = (post: SocialPost["linkedin"]) => {
    const hashtags = post.hashtags.map(tag => `#${tag}`).join(" ");
    return `${post.content}\n\n${hashtags}\n\n${post.call_to_action}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Share2 className="w-8 h-8 text-pink-500" />
            Social Media Posts & Banner Ad
          </h1>
          <p className="text-gray-400">Professional banner ads with platform-specific posts</p>
        </div>

        {!posts && !loading && (
          <Card className="bg-slate-800 border-2 border-slate-700 shadow-2xl p-8 mb-8">
            <p className="text-gray-300 mb-6">Generate a professional social media banner with platform-specific posts.</p>
            <Button 
              onClick={generatePosts} 
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Generate Banner & Posts
            </Button>
            {error && <p className="text-red-500 mt-4 font-semibold">{error}</p>}
          </Card>
        )}

        {loading && <LoadingState />}

        {posts && (
          <>
            {/* Banner Ad Display - Newspaper Style White Banner */}
            {bannerImage ? (
              <div className="mb-12">
                {/* Main Banner Ad - This is the printable banner */}
                <div ref={bannerRef} className="bg-white border-4 border-black p-16 shadow-2xl rounded-lg">
                  {/* Decorative Top Border */}
                  <div className="mb-8 flex items-center justify-center">
                    <div className="flex gap-3">
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                    </div>
                  </div>

                  {/* Main Headline - Bold and Large */}
                  <h1 className="text-center text-5xl md:text-6xl font-black text-black mb-4 leading-tight tracking-tight">
                    {adCopy.headline}
                  </h1>

                  {/* Subheadline - Italic */}
                  <p className="text-center text-xl md:text-2xl text-gray-800 italic font-light mb-10">
                    {adCopy.description}
                  </p>

                  {/* Decorative Divider */}
                  <div className="border-t-4 border-black my-8"></div>

                  {/* Banner Image - Full Width */}
                  {bannerImage && (
                    <div className="relative rounded-sm overflow-hidden mb-8 border-4 border-black">
                      <img 
                        src={bannerImage} 
                        alt="Social Media Banner Ad" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Decorative Divider */}
                  <div className="border-b-4 border-black my-8"></div>

                  {/* CTA Section */}
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-black text-black mb-4">
                      Ready to get started?
                    </p>
                    <p className="text-base md:text-lg text-gray-700 font-semibold">
                      Share this banner on your social media • Visit our website • Order now
                    </p>
                  </div>
                </div>

                {/* Download Banner Buttons */}
                <div className="flex justify-center my-8 gap-4 flex-wrap">
                  <Button 
                    onClick={downloadBannerAsImage}
                    className="bg-black hover:bg-gray-900 text-white font-black py-3 px-8 border-2 border-black text-lg flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download as PNG
                  </Button>
                  <Button 
                    onClick={downloadBanner}
                    className="bg-gray-700 hover:bg-gray-800 text-white font-black py-3 px-8 border-2 border-gray-800 text-lg flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Original
                  </Button>
                </div>

                {/* Hashtags Section Below Banner */}
                <div className="bg-gray-50 border-b-4 border-black p-8 mt-0">
                  <h3 className="text-sm font-black text-black mb-6 uppercase tracking-widest">
                    📱 Recommended Hashtags
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Twitter Hashtags */}
                    <div>
                      <p className="text-xs font-black text-blue-700 mb-3 uppercase">𝕏 TWITTER</p>
                      <div className="flex flex-wrap gap-2">
                        {posts.twitter.hashtags.map((tag, i) => (
                          <span key={i} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded border border-blue-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Instagram Hashtags */}
                    <div>
                      <p className="text-xs font-black text-pink-700 mb-3 uppercase">📸 INSTAGRAM</p>
                      <div className="flex flex-wrap gap-2">
                        {posts.instagram.hashtags.map((tag, i) => (
                          <span key={i} className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded border border-pink-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* LinkedIn Hashtags */}
                    <div>
                      <p className="text-xs font-black text-blue-700 mb-3 uppercase">💼 LINKEDIN</p>
                      <div className="flex flex-wrap gap-2">
                        {posts.linkedin.hashtags.map((tag, i) => (
                          <span key={i} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded border border-blue-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 p-6 mb-8 rounded">
                <p className="text-yellow-800 font-semibold">Banner image is generating. Please check back in a moment.</p>
              </div>
            )}

            {/* Platform Posts - Grid Layout */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Platform-Specific Posts</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Twitter */}
                <Card className="bg-white border-2 border-gray-300 overflow-hidden shadow-xl">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-lg text-white">𝕏</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Twitter/X</h3>
                        <p className="text-xs text-gray-600">280 Characters</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 min-h-40 mb-4 border-2 border-gray-200">
                      <p className="text-gray-800 text-sm leading-relaxed">{posts.twitter.content}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {posts.twitter.hashtags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">#{tag}</span>
                      ))}
                    </div>

                    <Button
                      onClick={() => copyToClipboard(formatTwitterPost(posts.twitter), "twitter")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      size="sm"
                    >
                      {copied === "twitter" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied === "twitter" ? "Copied!" : "Copy Post"}
                    </Button>
                  </div>
                </Card>

                {/* Instagram */}
                <Card className="bg-white border-2 border-gray-300 overflow-hidden shadow-xl">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                        <span className="text-lg">📸</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Instagram</h3>
                        <p className="text-xs text-gray-600">2,200 Characters</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 min-h-40 mb-4 border-2 border-gray-200">
                      <p className="text-gray-800 text-sm leading-relaxed">{posts.instagram.caption}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {posts.instagram.hashtags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="bg-pink-600 text-white text-xs px-2 py-1 rounded font-semibold">#{tag}</span>
                      ))}
                    </div>

                    <Button
                      onClick={() => copyToClipboard(formatInstagramPost(posts.instagram), "instagram")}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold"
                      size="sm"
                    >
                      {copied === "instagram" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied === "instagram" ? "Copied!" : "Copy Caption"}
                    </Button>
                  </div>
                </Card>

                {/* LinkedIn */}
                <Card className="bg-white border-2 border-gray-300 overflow-hidden shadow-xl">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                        <span className="text-lg">💼</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">LinkedIn</h3>
                        <p className="text-xs text-gray-600">3,000 Characters</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 min-h-40 mb-4 border-2 border-gray-200">
                      <p className="text-gray-800 text-sm leading-relaxed">{posts.linkedin.content}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {posts.linkedin.hashtags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="bg-blue-700 text-white text-xs px-2 py-1 rounded font-semibold">#{tag}</span>
                      ))}
                    </div>

                    <Button
                      onClick={() => copyToClipboard(formatLinkedInPost(posts.linkedin), "linkedin")}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold"
                      size="sm"
                    >
                      {copied === "linkedin" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied === "linkedin" ? "Copied!" : "Copy Post"}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        {posts && (
          <div className="flex gap-4 pt-8">
            <Button 
              onClick={onBack} 
              variant="outline" 
              className="border-2 border-gray-600 text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
