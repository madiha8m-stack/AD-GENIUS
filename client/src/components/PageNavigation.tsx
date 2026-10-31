import { ChevronRight, Home, FileText, Zap, Video, Newspaper, Image, Hash, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PageType = 'adcopy' | 'abtest' | 'video' | 'newspaper-ad' | 'images' | 'hashtags' | 'social-media-ads' | 'social-media-posts';

interface PageNavigationProps {
  currentPage: PageType;
  onPageSelect: (page: PageType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const pages = [
  { id: 'adcopy', label: 'Ad Copy', icon: FileText, color: 'from-blue-600 to-blue-400' },
  { id: 'abtest', label: 'A/B Test', icon: Zap, color: 'from-yellow-600 to-yellow-400' },
  { id: 'video', label: 'Video Script', icon: Video, color: 'from-red-600 to-red-400' },
  { id: 'newspaper-ad', label: 'Newspaper Ad', icon: Newspaper, color: 'from-amber-600 to-amber-400' },
  { id: 'images', label: 'Generated Images', icon: Image, color: 'from-green-600 to-green-400' },
  { id: 'hashtags', label: 'Hashtags', icon: Hash, color: 'from-purple-600 to-purple-400' },
  { id: 'social-media-ads', label: 'Social Media Ads', icon: Share2, color: 'from-pink-600 to-pink-400' },
  { id: 'social-media-posts', label: 'Social Media Posts', icon: Sparkles, color: 'from-indigo-600 to-indigo-400' },
];

export function PageNavigation({ currentPage, onPageSelect, isOpen, onToggle }: PageNavigationProps) {
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed left-6 top-6 z-50 p-3 rounded-lg bg-slate-800/90 backdrop-blur-xl border border-slate-700 hover:border-slate-600 transition-all shadow-lg hover:shadow-xl group"
        title="Toggle Navigation"
      >
        <ChevronRight className={`w-5 h-5 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Navigation Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Campaign Flow</h2>
              <p className="text-xs text-slate-400">8 Steps</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          {pages.map((page, index) => {
            const Icon = page.icon;
            const isActive = currentPage === page.id;
            return (
              <button
                key={page.id}
                onClick={() => {
                  onPageSelect(page.id as PageType);
                  // Optionally close the menu on selection
                }}
                className={`w-full px-4 py-3 rounded-lg transition-all flex items-center gap-3 group ${
                  isActive
                    ? `bg-gradient-to-r ${page.color} text-white shadow-lg`
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/10 group-hover:bg-white/20 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Step {index + 1}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-white"></span>}
                  </div>
                  <p className="text-xs opacity-75">{page.label}</p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900/95 backdrop-blur">
          <p className="text-xs text-slate-400 text-center">
            Current: <span className="text-slate-300 font-semibold capitalize">{currentPage}</span>
          </p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
