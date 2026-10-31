import { useState } from 'react';
import { Link } from 'wouter';
import { ThreeBackground } from '@/components/ThreeBackground';
import { CustomCursor } from '@/components/CustomCursor';
import { PageNavigation } from '@/components/PageNavigation';
import { AdCopyPage } from './AdCopy';
import { ABTestPage } from './ABTest';
import NewspaperAdFlow from './NewspaperAdFlow';
import { GeneratedImagesPage } from './GeneratedImages';
import { HashtagsPage } from './Hashtags';
import { default as VideoScriptPage } from './VideoScript';
import SocialMediaAds from './SocialMediaAds';
import SocialMediaPostsFlow from './SocialMediaPostsFlow';
import { BatchImageVideoGenerator } from '@/components/BatchImageVideoGenerator';
import { Button } from '@/components/ui/button';
import { X, Zap, Newspaper, Share2 } from 'lucide-react';
import type { Tone, AdCopy } from '@shared/schema';

type PageType = 'adcopy' | 'abtest' | 'video' | 'newspaper-ad' | 'images' | 'hashtags' | 'social-media-ads' | 'social-media-posts';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('adcopy');
  const [showBatchGenerator, setShowBatchGenerator] = useState(false);
  const [showPageNav, setShowPageNav] = useState(false);
  
  const [campaign, setCampaign] = useState<{
    adCopy: AdCopy;
    productName: string;
    tone: Tone;
  } | null>(null);

  const handleLoadCampaign = (data: any) => {
    setCampaign(data);
    setCurrentPage('adcopy');
  };

  const handleAdCopyNext = (data: typeof campaign) => {
    setCampaign(data);
    setCurrentPage('abtest');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ThreeBackground />
      <CustomCursor />

      {/* Page Navigation Menu */}
      <PageNavigation 
        currentPage={currentPage} 
        onPageSelect={setCurrentPage}
        isOpen={showPageNav}
        onToggle={() => setShowPageNav(!showPageNav)}
      />

      {/* Navigation Buttons */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <Link href="/newspaper-ad">
          <Button
            variant="outline"
            className="bg-card/90 backdrop-blur-xl border-card-border shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-500/30"
          >
            <Newspaper className="w-4 h-4 mr-2" />
            Newspaper Ad
          </Button>
        </Link>

        <Link href="/social-media-ads">
          <Button
            variant="outline"
            className="bg-card/90 backdrop-blur-xl border-card-border shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Social Media Ads
          </Button>
        </Link>

        <Button
          onClick={() => setShowBatchGenerator(!showBatchGenerator)}
          variant="outline"
          className="bg-card/90 backdrop-blur-xl border-card-border shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30"
        >
          {showBatchGenerator ? <X className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
          {showBatchGenerator ? 'Close' : 'Batch Generator'}
        </Button>
      </div>

      {/* Batch Generator Modal */}
      {showBatchGenerator && (
        <div className="fixed inset-0 z-40 bg-background overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto">
            <BatchImageVideoGenerator campaign={campaign} />
          </div>
        </div>
      )}

      {/* Page Navigation */}
      {!showBatchGenerator && (
        <>
          {/* Show Ad Copy for initial generation or if on adcopy page */}
          {(!campaign || currentPage === 'adcopy') && (
            <AdCopyPage 
              onNext={(data) => {
                setCampaign(data);
                setCurrentPage('abtest');
              }}
            />
          )}

          {/* Require campaign data for other pages, redirect to adcopy if missing */}
          {campaign && (
            <>
              {currentPage === 'abtest' && (
                <ABTestPage 
                  adCopy={campaign.adCopy}
                  onBack={() => setCurrentPage('adcopy')}
                  onNext={() => setCurrentPage('video')}
                />
              )}
              {currentPage === 'video' && (
                <VideoScriptPage 
                  adCopy={campaign.adCopy}
                  productName={campaign.productName}
                  onBack={() => setCurrentPage('abtest')}
                  onNext={() => setCurrentPage('newspaper-ad')}
                />
              )}
              {currentPage === 'newspaper-ad' && (
                <NewspaperAdFlow 
                  adCopy={campaign.adCopy}
                  productName={campaign.productName}
                  onBack={() => setCurrentPage('video')}
                  onNext={() => setCurrentPage('images')}
                />
              )}
              {currentPage === 'images' && (
                <GeneratedImagesPage 
                  adCopy={campaign.adCopy}
                  onBack={() => setCurrentPage('newspaper-ad')}
                  onNext={() => setCurrentPage('hashtags')}
                />
              )}
              {currentPage === 'hashtags' && (
                <HashtagsPage 
                  adCopy={campaign.adCopy}
                  campaign={campaign}
                  onBack={() => setCurrentPage('images')}
                  onNext={() => setCurrentPage('social-media-ads')}
                />
              )}
              {currentPage === 'social-media-ads' && (
                <SocialMediaAds 
                  onBack={() => setCurrentPage('hashtags')}
                />
              )}
              {currentPage === 'social-media-posts' && (
                <SocialMediaPostsFlow 
                  adCopy={campaign.adCopy}
                  productName={campaign.productName}
                  onBack={() => setCurrentPage('social-media-ads')}
                  onNext={() => undefined}
                />
              )}
            </>
          )}

          {/* Fallback to Ad Copy if trying to access other pages without campaign */}
          {!campaign && currentPage !== 'adcopy' && (
            <AdCopyPage 
              onNext={handleAdCopyNext}
            />
          )}
        </>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border py-3 px-6 z-40">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © 2025 Adgenous — Built with ❤ by Priyanshu
        </div>
      </footer>
    </div>
  );
}
