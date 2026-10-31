import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/LoadingState";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NewspaperAdFlowProps {
  adCopy: any;
  productName?: string;
  onBack: () => void;
  onNext: () => void;
}

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

export default function NewspaperAdFlow({ adCopy, productName, onBack, onNext }: NewspaperAdFlowProps) {
  const [adData, setAdData] = useState<NewspaperAdData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateNewspaperAd = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/newspaper/ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName || "Premium Product",
          headline: adCopy.headline,
          description: adCopy.description,
        }),
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
        <h1 className="text-4xl font-bold text-white mb-2">Newspaper Ad</h1>
        <p className="text-gray-400 mb-8">Generate a professional newspaper-style advertisement</p>

        {!adData && !loading && (
          <Card className="bg-gray-800/50 border-gray-700 p-8 mb-8">
            <p className="text-gray-300 mb-6">
              Create a newspaper ad based on your ad copy details. Click "Generate" to create the ad.
            </p>
            <Button onClick={generateNewspaperAd} className="bg-blue-600 hover:bg-blue-700 mb-4">
              Generate Newspaper Ad
            </Button>
            {error && <p className="text-red-500">{error}</p>}
          </Card>
        )}

        {loading && <LoadingState />}

        {adData && (
          <div className="bg-white text-black p-12 shadow-2xl mb-8" style={{ fontFamily: "Georgia, serif" }}>
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

            {/* Advertisement Container */}
            <div className="border-4 border-black p-8 mb-8 bg-gray-50">
              <h2 className="text-4xl font-bold text-center mb-2 leading-tight">{adData.headline}</h2>
              <p className="text-center text-lg font-semibold text-gray-800 mb-6 italic">{adData.subheading}</p>
              <div className="flex justify-center mb-6">
                <span className="text-2xl text-gray-400">✦ ✦ ✦</span>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="text-justify text-sm leading-relaxed">{adData.body_text}</div>
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

              <div className="text-center border-t-2 border-black pt-4">
                <p className="text-lg font-bold">{adData.price_point}</p>
                <p className="text-sm mt-2 font-semibold">{adData.call_to_action}</p>
              </div>
            </div>

            {/* Editorial Article */}
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
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {adData && (
          <div className="flex gap-4 justify-between">
            <Button onClick={onBack} variant="outline" className="border-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
              Next: Generated Images
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
