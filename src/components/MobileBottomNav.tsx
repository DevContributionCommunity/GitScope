import React, { useState } from 'react';
import {
  Compass,
  FolderGit2,
  GitPullRequest,
  Play,
  Activity,
  MoreHorizontal,
  Share2,
  Award,
  Star,
  Users2,
  KeyRound,
  FileCode2,
  Trophy,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenShareQr: () => void;
  onOpenPortfolio: () => void;
  onOpenResume: () => void;
  onOpenNetwork: (tab: 'followers' | 'following') => void;
  onOpenStarred: () => void;
  onOpenGists: () => void;
  onOpenTokenModal: () => void;
  onOpenCareerRadar: () => void;
  onOpenReadmeStudio: () => void;
  deployedCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenShareQr,
  onOpenPortfolio,
  onOpenResume,
  onOpenNetwork,
  onOpenStarred,
  onOpenGists,
  onOpenTokenModal,
  onOpenCareerRadar,
  onOpenReadmeStudio,
  deployedCount = 0,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Slide-up Action Sheet Drawer for "More" tools on mobile */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full bg-[#0d1428] border-t border-slate-700 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Title */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-sm font-bold text-white tracking-wide">Developer Toolbox</span>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Grid of Actions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenShareQr();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center gap-2.5 text-left text-slate-200"
              >
                <Share2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">QR & Share</div>
                  <div className="text-[10px] text-slate-400">Mobile Scanner</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenPortfolio();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center gap-2.5 text-left text-slate-200"
              >
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Portfolio Card</div>
                  <div className="text-[10px] text-slate-400">Shareable snapshot</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenResume();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center gap-2.5 text-left text-slate-200"
              >
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">1-Page Resume</div>
                  <div className="text-[10px] text-slate-400">Printable CV</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenCareerRadar();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center gap-2.5 text-left text-slate-200"
              >
                <Trophy className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Career Radar</div>
                  <div className="text-[10px] text-slate-400">Milestones & DNA</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenReadmeStudio();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center gap-2.5 text-left text-slate-200"
              >
                <FileCode2 className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">README Studio</div>
                  <div className="text-[10px] text-slate-400">Badges & Generator</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenNetwork('followers');
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center gap-2.5 text-left text-slate-200"
              >
                <Users2 className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Social Network</div>
                  <div className="text-[10px] text-slate-400">Followers & Following</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenStarred();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center gap-2.5 text-left text-slate-200"
              >
                <Star className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Starred Repos</div>
                  <div className="text-[10px] text-slate-400">Curated bookmarks</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenGists();
                }}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center gap-2.5 text-left text-slate-200"
              >
                <FileCode2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Public Gists</div>
                  <div className="text-[10px] text-slate-400">Code snippets</div>
                </div>
              </button>
            </div>

            {/* Bottom links */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenTokenModal();
                }}
                className="flex items-center gap-1.5 text-indigo-400 hover:underline py-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Configure Personal Token</span>
              </button>

              <button
                onClick={() => handleTabClick('proposal')}
                className="flex items-center gap-1 text-slate-400 hover:text-white py-1.5"
              >
                <span>Proposal Doc</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Sticky Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d1c]/95 backdrop-blur-lg border-t border-slate-800/90 shadow-2xl px-2 py-1.5 flex items-center justify-around"
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => handleTabClick('explorer')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all ${
            activeTab === 'explorer'
              ? 'text-indigo-400 font-bold bg-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/60'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'explorer' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">Explore</span>
        </button>

        <button
          onClick={() => handleTabClick('repositories')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all ${
            activeTab === 'repositories'
              ? 'text-indigo-400 font-bold bg-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/60'
          }`}
        >
          <FolderGit2 className={`w-5 h-5 ${activeTab === 'repositories' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">Repos</span>
        </button>

        <button
          onClick={() => handleTabClick('contribute')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all relative ${
            activeTab === 'contribute'
              ? 'text-indigo-400 font-bold bg-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/60'
          }`}
        >
          <GitPullRequest className={`w-5 h-5 ${activeTab === 'contribute' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">Contribute</span>
          <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400 ring-2 ring-[#090d1c]" />
        </button>

        <button
          onClick={() => handleTabClick('sandbox')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all ${
            activeTab === 'sandbox'
              ? 'text-indigo-400 font-bold bg-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/60'
          }`}
        >
          <Play className={`w-5 h-5 ${activeTab === 'sandbox' ? 'stroke-[2.5] fill-indigo-400/20' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">Sandbox</span>
        </button>

        <button
          onClick={() => handleTabClick('activity')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all ${
            activeTab === 'activity'
              ? 'text-indigo-400 font-bold bg-indigo-950/40'
              : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/60'
          }`}
        >
          <Activity className={`w-5 h-5 ${activeTab === 'activity' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">Heatmap</span>
        </button>

        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all ${
            isMoreMenuOpen
              ? 'text-indigo-300 font-bold bg-indigo-950/50'
              : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/60'
          }`}
          title="Open more tools and features"
        >
          <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
