import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Star,
  GitFork,
  ExternalLink,
  Code2,
  Globe,
  Award,
} from 'lucide-react';
import { GitHubRepo, GitHubUser } from '../types/github';

interface PortfolioModalProps {
  user: GitHubUser;
  repos: GitHubRepo[];
  isOpen: boolean;
  onClose: () => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  user,
  repos,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 4);
  const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
  const totalForks = repos.reduce((acc, r) => acc + r.forks_count, 0);

  // Markdown for GitHub profile README
  const markdownSnippet = `### 🚀 Developer Profile: ${user.name || user.login}
${user.bio ? `> ${user.bio}\n` : ''}
- 🌟 **Total Stars:** ${totalStars}
- 🍴 **Total Forks:** ${totalForks}
- 📦 **Public Repositories:** ${repos.length}

#### 🌟 Featured Repositories
${topRepos
  .map(
    (r) =>
      `- [**${r.name}**](${r.html_url}) - ${r.description || 'Open source project'} (⭐ ${r.stargazers_count})`
  )
  .join('\n')}

*Generated with [OpenRepoLens](https://github.com/DevContributionCommunity)*
`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#080d19] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Developer Portfolio Showcase</h3>
              <p className="text-xs text-slate-400">Embeddable card & GitHub Profile README markdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Visual Showcase Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#141e38] to-[#10172e] border border-indigo-500/30 shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl border border-indigo-500/40 object-cover shadow-sm bg-slate-800"
                />
                <div>
                  <h4 className="text-xl font-bold text-white">{user.name || user.login}</h4>
                  <p className="text-xs font-mono text-indigo-400">@{user.login}</p>
                  {user.location && (
                    <p className="text-xs text-slate-400 mt-0.5">{user.location}</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-800/80 px-2 py-1 rounded">
                  OpenRepoLens Verified
                </span>
              </div>
            </div>

            {user.bio && (
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{user.bio}"
              </p>
            )}

            {/* Quick stats strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-center">
              <div className="bg-[#0b1020]/60 p-2 rounded-lg">
                <div className="text-xs text-slate-400">Total Stars</div>
                <div className="text-sm font-bold text-amber-300 font-mono">{totalStars}</div>
              </div>
              <div className="bg-[#0b1020]/60 p-2 rounded-lg">
                <div className="text-xs text-slate-400">Total Forks</div>
                <div className="text-sm font-bold text-blue-300 font-mono">{totalForks}</div>
              </div>
              <div className="bg-[#0b1020]/60 p-2 rounded-lg">
                <div className="text-xs text-slate-400">Public Repos</div>
                <div className="text-sm font-bold text-white font-mono">{repos.length}</div>
              </div>
            </div>

            {/* Top Repos list */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-300 block">Top Highlighted Projects</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topRepos.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-lg bg-[#0b1020]/80 border border-slate-800 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white truncate">{r.name}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {r.description || 'Open source project'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                      {r.language && <span className="text-indigo-300">{r.language}</span>}
                      <span className="flex items-center gap-1 text-amber-300">
                        <Star className="w-3 h-3" />
                        <span>{r.stargazers_count}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Markdown Snippet Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                GitHub Profile README Markdown:
              </label>
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#080d19] border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto max-h-40">
              <code>{markdownSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
