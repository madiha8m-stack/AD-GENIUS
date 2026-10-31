import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/LoadingState";

interface NewspaperAdData {
  publication_style: string;
  section: string;
  headline: string;
  subheading: string;
  body_text: string;
  article_content: string;
  key_features: string[];
  call_to_action: string;
  price_point: string;
  border_style: string;
  layout: string;
}

export default function NewspaperAd() {
  const [productName, setProductName] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [adData, setAdData] = useState<NewspaperAdData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateNewspaperAd = async () => {
    if (!productName || !headline || !description) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/newspaper/ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, headline, description }),
      });

      if (!response.ok) throw new Error("Failed to generate newspaper ad");

      const data = await response.json();
      setAdData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Newspaper Ad Generator</h1>
        <p className="text-gray-400 mb-8">Create professional newspaper-style advertisements with 3rd party articles</p>

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
              onClick={generateNewspaperAd}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Generating..." : "Generate Newspaper Ad"}
            </Button>

            {error && <p className="text-red-500">{error}</p>}
          </div>
        </Card>

        {/* Newspaper Display */}
        {loading && <LoadingState />}

        {adData && (
          <div className="bg-white text-black p-12 shadow-2xl" style={{ fontFamily: "Georgia, serif" }}>
            {/* Newspaper Header */}
            <div className="border-b-4 border-black pb-4 mb-6 text-center">
              <h1 className="text-5xl font-bold tracking-wider" style={{ letterSpacing: "0.15em" }}>
                DAINIK JAGRAN
              </h1>
              <p className="text-sm mt-2 text-gray-700">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="flex justify-around mt-2 text-xs text-gray-600">
                <span>VOL. 156</span>
                <span>NO. 45673</span>
                <span>PRICE $1.50</span>
              </div>
            </div>

            {/* Section Label */}
            <div className="mb-6 border-l-4 border-black pl-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">★ {adData.section} ★</p>
            </div>

            {/* Advertisement Container with Border */}
            <div className="border-4 border-black p-8 mb-8 bg-gray-50">
              {/* Ad Headline */}
              <h2 className="text-4xl font-bold text-center mb-2 leading-tight">{adData.headline}</h2>

              {/* Ad Subheading */}
              <p className="text-center text-lg font-semibold text-gray-800 mb-6 italic">{adData.subheading}</p>

              {/* Decorative Separator */}
              <div className="flex justify-center mb-6">
                <span className="text-2xl text-gray-400">✦ ✦ ✦</span>
              </div>

              {/* Advertisement Body */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="text-justify text-sm leading-relaxed">{adData.body_text}</div>

                {/* Key Features Box */}
                <div className="border-2 border-black p-4 bg-white">
                  <h4 className="font-bold mb-3 text-center underline">KEY FEATURES</h4>
                  <ul className="space-y-2 text-sm">
                    {adData.key_features?.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2">▪</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="text-center border-t-2 border-black pt-4">
                <p className="text-lg font-bold">{adData.price_point}</p>
                <p className="text-sm mt-2 font-semibold">{adData.call_to_action}</p>
              </div>
            </div>

            {/* Editorial Article Section */}
            <div className="mb-8">
              <div className="border-b-2 border-black mb-4">
                <h3 className="text-2xl font-bold">FEATURED ARTICLE</h3>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <p className="text-justify text-sm leading-relaxed whitespace-pre-wrap first-letter:font-bold first-letter:text-2xl first-letter:float-left first-letter:mr-1 first-letter:mt-1">
                    {adData.article_content}
                  </p>
                </div>

                {/* Right Column - Additional Info */}
                <div className="border-l-2 border-gray-400 pl-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm uppercase mb-2">Publication Style</h4>
                      <p className="text-xs text-gray-600">{adData.publication_style}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm uppercase mb-2">Layout Style</h4>
                      <p className="text-xs text-gray-600">{adData.layout}</p>
                    </div>

                    <div className="bg-yellow-100 p-3 border border-yellow-400 text-xs">
                      <p className="font-bold mb-1">SPECIAL OFFER</p>
                      <p>Limited time availability. Contact advertiser for details.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-black pt-4 text-center text-xs text-gray-600">
              <p>© 2025 The Daily Tribune | Published by Independent Media Group | All Rights Reserved</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
