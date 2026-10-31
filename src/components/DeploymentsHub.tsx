import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle,
  Plus,
  Search,
} from 'lucide-react';
import { GitHubRepo } from '../types/github';
import { detectDeploymentUrl } from '../services/githubApi';

interface DeploymentsHubProps {
  repos: GitHubRepo[];
  onExploreCode: (repo: GitHubRepo) => void;
}

export const DeploymentsHub: React.FC<DeploymentsHubProps> = ({
  repos,
  onExploreCode,
}) => {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [search, setSearch] = useState('');

  // Collect all repos that have live deployment URLs
  const deployedRepos = repos.filter((r) => !!detectDeploymentUrl(r));

  const filteredDeployed = deployedRepos.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  const activeUrl = selectedRepo ? detectDeploymentUrl(selectedRepo) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <span>Live Project & Deployment Explorer ({deployedRepos.length})</span>
          </h2>
          <p className="text-xs text-slate-400">
            Automatically discovered GitHub Pages, Vercel, Netlify, and custom domain deployments
          </p>
        </div>

        <div className="w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search live projects..."
            className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {deployedRepos.length === 0 ? (
        <div className="p-12 text-center bg-[#0f172a] border border-slate-800 rounded-2xl text-slate-400 space-y-2">
          <Globe className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No live deployment links detected yet</h4>
          <p className="text-xs max-w-md mx-auto">
            This developer's repositories haven't linked a homepage or known deployment URL (GitHub Pages, Vercel, Netlify).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of deployed sites */}
          <div className="space-y-3 lg:col-span-1 max-h-[600px] overflow-y-auto pr-1">
            {filteredDeployed.map((repo) => {
              const url = detectDeploymentUrl(repo)!;
              const isSelected = selectedRepo?.id === repo.id;

              return (
                <div
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50'
                      : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{repo.name}</h4>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {repo.description || 'Open source web deployment'}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-emerald-400 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Preview Canvas */}
          <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-2xl flex flex-col overflow-hidden h-[600px]">
            {selectedRepo && activeUrl ? (
              <>
                {/* Canvas Toolbar */}
                <div className="px-5 py-3 bg-[#0a101f] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold text-white truncate">{selectedRepo.name}</span>
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px]">{activeUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setDeviceView('desktop')}
                      className={`p-1.5 rounded transition-colors ${
                        deviceView === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Desktop view"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeviceView('tablet')}
                      className={`p-1.5 rounded transition-colors ${
                        deviceView === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tablet view"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeviceView('mobile')}
                      className={`p-1.5 rounded transition-colors ${
                        deviceView === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mobile view"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Device Frame */}
                <div className="flex-1 bg-[#070b16] p-4 flex items-center justify-center overflow-auto">
                  <div
                    className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 h-full flex flex-col ${
                      deviceView === 'mobile'
                        ? 'w-[375px]'
                        : deviceView === 'tablet'
                        ? 'w-[768px]'
                        : 'w-full'
                    }`}
                  >
                    <iframe
                      src={activeUrl}
                      title={selectedRepo.name}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      className="w-full flex-1 border-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 p-6 text-center">
                <Globe className="w-12 h-12 text-slate-700" />
                <p className="text-sm font-medium text-slate-300">
                  Select a project from the left to launch an interactive live preview.
                </p>
                <p className="text-xs text-slate-500 max-w-sm">
                  You can inspect the application across Desktop, Tablet, and Mobile viewport frames.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
