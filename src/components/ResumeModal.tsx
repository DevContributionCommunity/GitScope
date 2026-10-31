import React from 'react';
import {
  X,
  Printer,
  ExternalLink,
  Star,
  GitFork,
  Briefcase,
  MapPin,
  Mail,
  Globe,
  Award,
} from 'lucide-react';
import { GitHubRepo, GitHubUser } from '../types/github';

interface ResumeModalProps {
  user: GitHubUser;
  repos: GitHubRepo[];
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  user,
  repos,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
  const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);

  // Group languages
  const langCounts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });
  const topLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[92vh] bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#080d19] border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Developer Resume & CV Generator</h3>
              <p className="text-xs text-slate-400">
                Print-ready single page developer curriculum vitae generated from public GitHub data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Resume Sheet Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#070b16]">
          <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl space-y-6 font-sans">
            {/* CV Header */}
            <div className="border-b border-slate-200 pb-6 flex items-start justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {user.name || user.login}
                </h1>
                <p className="text-sm font-semibold text-indigo-600 font-mono">
                  Software Engineer & Open Source Contributor
                </p>
                {user.bio && (
                  <p className="text-xs text-slate-600 pt-1 leading-relaxed max-w-xl">
                    {user.bio}
                  </p>
                )}
              </div>

              <img
                src={user.avatar_url}
                alt=""
                className="w-20 h-20 rounded-xl border border-slate-300 object-cover shrink-0"
              />
            </div>

            {/* Contact & Links Bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 pb-2">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  github.com/{user.login}
                </a>
              </span>
              {user.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.location}</span>
                </span>
              )}
              {user.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </span>
              )}
              {user.company && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.company}</span>
                </span>
              )}
            </div>

            {/* Summary Metrics Strip */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Stars</span>
                <strong className="text-base font-bold text-slate-900 font-mono">{totalStars.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Total Forks</span>
                <strong className="text-base font-bold text-slate-900 font-mono">{totalForks.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Public Repos</span>
                <strong className="text-base font-bold text-slate-900 font-mono">{repos.length}</strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Community</span>
                <strong className="text-base font-bold text-slate-900 font-mono">{user.followers} followers</strong>
              </div>
            </div>

            {/* Technical Skills & Languages */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Technical Stack & Core Languages
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {topLanguages.map(([lang, count]) => (
                  <span
                    key={lang}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-medium"
                  >
                    {lang} ({count} repo{count > 1 ? 's' : ''})
                  </span>
                ))}
              </div>
            </div>

            {/* Featured Open Source Projects */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Featured Open Source Projects
              </h2>

              <div className="space-y-3 pt-1">
                {topRepos.map((r) => (
                  <div key={r.id} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="font-bold text-slate-900">{r.name}</strong>
                        {r.language && (
                          <span className="text-[11px] text-slate-500 font-mono">[{r.language}]</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
                        <span>★ {r.stargazers_count}</span>
                        <span>🍴 {r.forks_count}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {r.description || 'Open source software repository.'}
                    </p>
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline font-mono"
                    >
                      {r.html_url}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer notice */}
            <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Verified Open Source Portfolio · Generated via OpenRepoLens (DevContributionCommunity)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
