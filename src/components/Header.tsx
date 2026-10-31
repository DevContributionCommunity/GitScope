import React from 'react';
import { KeyRound, ShieldCheck, ExternalLink, Globe, Users2 } from 'lucide-react';
import { GitHubRateLimit } from '../types/github';

interface HeaderProps {
  hasToken: boolean;
  rateLimit: GitHubRateLimit | null;
  onOpenTokenModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  deployedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  hasToken,
  rateLimit,
  onOpenTokenModal,
  activeTab,
  setActiveTab,
  deployedCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d1a]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-500/20">
            <span className="font-mono">⌘</span>
          </div>
          <button 
            onClick={() => setActiveTab('explorer')}
            className="text-left group"
          >
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors whitespace-nowrap">
              OpenRepoLens
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'explorer'
                ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Explorer
          </button>
          <button
            onClick={() => setActiveTab('repositories')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'repositories'
                ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Repositories
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'activity'
                ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Heatmap
          </button>
          <button
            onClick={() => setActiveTab('contribute')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'contribute'
                ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <span>Contribute</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-indigo-950/80 text-indigo-300 rounded border border-indigo-800/80">
              PRs
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'sandbox'
                ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <span>Sandbox</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-800/80">
              Live
            </span>
          </button>
          <button
            onClick={() => setActiveTab('deployments')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'deployments'
                ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <span>Live Sites</span>
            {deployedCount > 0 && (
              <span className="font-mono text-[11px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-800/80">
                {deployedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('proposal')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'proposal'
                ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Proposal
          </button>
        </nav>

        {/* Zone 3: Primary Action & GitHub Token */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenTokenModal}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
              hasToken
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
            title="Configure GitHub Personal Access Token for 5,000 requests/hour"
          >
            {hasToken ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {hasToken ? 'Token Active' : 'Add Token'}
            </span>
            {rateLimit && (
              <span className="font-mono text-[11px] text-slate-400">
                {rateLimit.remaining}/{rateLimit.limit}
              </span>
            )}
          </button>

          <a
            href="https://github.com/DevContributionCommunity"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <span>Community</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Optional Mobile Quick Filter pill strip */}
      <div className="md:hidden flex items-center gap-2 px-3 py-1.5 border-t border-slate-800/60 bg-[#070b16] text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`py-1 px-2.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'explorer' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-900/60'
          }`}
        >
          Explorer
        </button>
        <button
          onClick={() => setActiveTab('repositories')}
          className={`py-1 px-2.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'repositories' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-900/60'
          }`}
        >
          Repositories
        </button>
        <button
          onClick={() => setActiveTab('contribute')}
          className={`py-1 px-2.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
            activeTab === 'contribute' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-900/60'
          }`}
        >
          <span>PRs & Issues</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`py-1 px-2.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'sandbox' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-900/60'
          }`}
        >
          Sandbox
        </button>
        <button
          onClick={() => setActiveTab('deployments')}
          className={`py-1 px-2.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'deployments' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-900/60'
          }`}
        >
          Live Sites {deployedCount > 0 && `(${deployedCount})`}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`py-1 px-2.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'activity' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-900/60'
          }`}
        >
          Heatmap
        </button>
      </div>
    </header>
  );
};
