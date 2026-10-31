import React, { useMemo } from 'react';
import { X, Award, Calendar, Compass, Code2, Sparkles, Star, GitFork, Milestone, Trophy, ArrowRight, ExternalLink } from 'lucide-react';
import { GitHubRepo, GitHubUser } from '../types/github';

interface CareerRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: GitHubUser;
  repos: GitHubRepo[];
}

export const CareerRadarModal: React.FC<CareerRadarModalProps> = ({
  isOpen,
  onClose,
  user,
  repos,
}) => {
  if (!isOpen) return null;

  // Chronological sort
  const chronologicalRepos = [...repos].sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const firstRepo = chronologicalRepos[0];
  const newestRepo = chronologicalRepos[chronologicalRepos.length - 1];

  // Most starred repo
  const mostStarred = [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))[0];
  const mostForked = [...repos].sort((a, b) => (b.forks_count || 0) - (a.forks_count || 0))[0];

  // Repos by year
  const yearlyCount: Record<string, number> = {};
  repos.forEach((r) => {
    const year = new Date(r.created_at).getFullYear().toString();
    yearlyCount[year] = (yearlyCount[year] || 0) + 1;
  });

  const peakYear = Object.entries(yearlyCount).sort((a, b) => b[1] - a[1])[0];

  // Language Breakdown & Tech DNA
  const langBytes: Record<string, number> = {};
  let totalSize = 0;
  repos.forEach((r) => {
    if (r.language) {
      langBytes[r.language] = (langBytes[r.language] || 0) + (r.size || 100);
      totalSize += (r.size || 100);
    }
  });

  const sortedLangs = Object.entries(langBytes)
    .map(([lang, size]) => ({
      name: lang,
      percentage: totalSize > 0 ? Math.round((size / totalSize) * 100) : 0,
      sizeKb: size,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Categorization
  const domains = {
    Frontend: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Vue', 'Svelte'],
    Backend: ['Python', 'Go', 'Java', 'Ruby', 'PHP', 'C#'],
    Systems: ['C', 'C++', 'Rust', 'Zig', 'Assembly'],
    Mobile: ['Swift', 'Kotlin', 'Dart'],
    DevOps: ['Shell', 'Dockerfile', 'HCL'],
  };

  const domainScores: Record<string, number> = {
    Frontend: 0,
    Backend: 0,
    Systems: 0,
    Mobile: 0,
    DevOps: 0,
  };

  repos.forEach((r) => {
    if (!r.language) return;
    for (const [dom, list] of Object.entries(domains)) {
      if (list.includes(r.language)) {
        domainScores[dom] += 1;
      }
    }
  });

  const topDomain = Object.entries(domainScores).sort((a, b) => b[1] - a[1])[0];

  // Archetype
  let archetypeTitle = 'Versatile Open-Source Builder';
  let archetypeDescription = 'Maintains balanced activity across multiple repositories and technologies.';

  if (topDomain && topDomain[0] === 'Frontend') {
    archetypeTitle = 'Full-Stack Web & Interface Architect';
    archetypeDescription = 'Specialized in modern client-side architectures, component systems, and web tools.';
  } else if (topDomain && topDomain[0] === 'Systems') {
    archetypeTitle = 'Systems & High-Performance Engineer';
    archetypeDescription = 'Focuses on compiled, low-level, or high-throughput computing architectures.';
  } else if (topDomain && topDomain[0] === 'Backend') {
    archetypeTitle = 'Backend Services & Cloud Developer';
    archetypeDescription = 'Excels in server architectures, API design, and distributed data pipelines.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] bg-[#0c1224] border-0 sm:border border-slate-700/80 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-[#080d1a]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 border border-indigo-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate">
                <span>Career Radar & DNA</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 truncate">
                  @{user.login}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Developer journey, milestones timeline & domain radar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Developer Archetype Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Detected Technical Archetype</span>
              </div>
              <h3 className="text-lg font-bold text-white">{archetypeTitle}</h3>
              <p className="text-xs text-slate-300 max-w-xl">{archetypeDescription}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-slate-400">Primary Domain</div>
              <div className="text-base font-bold font-mono text-indigo-400">{topDomain ? topDomain[0] : 'Generalist'}</div>
            </div>
          </div>

          {/* Key Landmark Milestones Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#10172c] border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Milestone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Genesis Project</span>
              </div>
              <div className="text-sm font-bold text-white truncate" title={firstRepo?.name}>
                {firstRepo?.name || 'Initial Project'}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {firstRepo ? new Date(firstRepo.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#10172c] border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Highest Starred</span>
              </div>
              <div className="text-sm font-bold text-amber-300 truncate" title={mostStarred?.name}>
                {mostStarred?.name || 'Project'}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {mostStarred?.stargazers_count?.toLocaleString()} stars
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#10172c] border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <GitFork className="w-3.5 h-3.5 text-blue-400" />
                <span>Top Collaborative</span>
              </div>
              <div className="text-sm font-bold text-blue-300 truncate" title={mostForked?.name}>
                {mostForked?.name || 'Project'}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {mostForked?.forks_count?.toLocaleString()} forks
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#10172c] border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Peak Creation Year</span>
              </div>
              <div className="text-sm font-bold text-emerald-300">
                {peakYear ? peakYear[0] : new Date().getFullYear()}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {peakYear ? `${peakYear[1]} projects shipped` : ''}
              </div>
            </div>
          </div>

          {/* Evolutionary Timeline */}
          <div className="p-5 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Milestone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Repository Evolution Timeline ({chronologicalRepos.length} Milestones)</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {chronologicalRepos.slice(0, 10).map((r, idx) => (
                <div key={r.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#090e1c]" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {r.name}
                      </span>
                      {r.language && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {r.language}
                        </span>
                      )}
                      {r.stargazers_count > 0 && (
                        <span className="font-mono text-[10px] text-amber-400 flex items-center gap-0.5">
                          ★ {r.stargazers_count}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{r.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tech DNA Radar & Languages */}
          <div className="p-5 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Language Distribution & Code Volume</span>
            </h3>

            <div className="space-y-3">
              {sortedLangs.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="font-mono text-slate-400">
                      {item.percentage}% ({Math.round(item.sizeKb / 1024)} MB)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
