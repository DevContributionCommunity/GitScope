import React, { useMemo } from 'react';
import {
  Star,
  GitFork,
  ExternalLink,
  FolderGit2,
  Sparkles,
  Globe,
  CircleDot,
  Archive,
  GitBranch,
  Bookmark,
  ShieldCheck,
  History,
  Terminal,
  Play,
  FileText,
} from 'lucide-react';
import { GitHubRepo } from '../types/github';
import { detectDeploymentUrl } from '../services/githubApi';

interface RepoCardProps {
  repo: GitHubRepo;
  isBookmarked: boolean;
  onToggleBookmark: (repo: GitHubRepo) => void;
  onExploreCode: (repo: GitHubRepo) => void;
  onAiAnalyze: (repo: GitHubRepo) => void;
  onViewCommits?: (repo: GitHubRepo) => void;
  onCloneRepo?: (repo: GitHubRepo) => void;
  onOpenSandbox?: (repo: GitHubRepo) => void;
  onOpenReadmeStudio?: (repo: GitHubRepo) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({
  repo,
  isBookmarked,
  onToggleBookmark,
  onExploreCode,
  onAiAnalyze,
  onViewCommits,
  onCloneRepo,
  onOpenSandbox,
  onOpenReadmeStudio,
}) => {
  const liveUrl = detectDeploymentUrl(repo);
  const updatedDate = new Date(repo.pushed_at || repo.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate quick health badge
  const healthBadge = useMemo(() => {
    let score = 0;
    if (repo.description) score += 25;
    if (repo.license) score += 25;
    if (repo.topics && repo.topics.length > 0) score += 25;
    const daysSincePush = (Date.now() - new Date(repo.pushed_at || repo.updated_at).getTime()) / (1000 * 3600 * 24);
    if (daysSincePush < 90) score += 25;
    else if (daysSincePush < 180) score += 15;

    if (score >= 90) return { label: 'Health: A+', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
    if (score >= 70) return { label: 'Health: A', color: 'text-emerald-300 bg-emerald-950/40 border-emerald-800/40' };
    if (score >= 50) return { label: 'Health: B', color: 'text-amber-300 bg-amber-950/50 border-amber-800/50' };
    return { label: 'Health: C', color: 'text-slate-400 bg-slate-900 border-slate-800' };
  }, [repo]);

  return (
    <div className="bg-[#0f172a] hover:bg-[#131c33] border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group shadow-sm relative">
      <div className="space-y-3">
        {/* Top title and badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base sm:text-lg font-bold text-white hover:text-indigo-400 transition-colors truncate block"
              >
                {repo.name}
              </a>
              {repo.fork && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  Fork
                </span>
              )}
              {repo.archived && (
                <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                  <Archive className="w-3 h-3" />
                  Archived
                </span>
              )}
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${healthBadge.color}`}>
                {healthBadge.label}
              </span>
            </div>

            {/* Clean unboxed metadata (anti-slop rule) */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-slate-500" />
                <span>{repo.default_branch}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Updated {updatedDate}</span>
              {repo.license && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-[120px]">{repo.license.spdx_id || repo.license.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(repo)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-950/60 text-amber-400 border-amber-700/60'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800'
              }`}
              title={isBookmarked ? 'Remove from Saved Bookmarks' : 'Save to Bookmarks'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* Live demo indicator badge if available */}
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                title={`Live deployment available at: ${liveUrl}`}
              >
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>Demo</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
          {repo.description || 'No description provided for this repository.'}
        </p>

        {/* Topics / Tags */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {repo.topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="text-[11px] font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded-md"
              >
                #{topic}
              </span>
            ))}
            {repo.topics.length > 4 && (
              <span className="text-[11px] font-mono text-slate-500 self-center">
                +{repo.topics.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-5 mt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Left Stats */}
        <div className="flex items-center gap-4 text-slate-400">
          {repo.language && (
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>{repo.language}</span>
            </span>
          )}
          <span className="flex items-center gap-1 hover:text-amber-300 transition-colors">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono tabular-nums text-slate-300">{repo.stargazers_count}</span>
          </span>
          <span className="flex items-center gap-1 hover:text-blue-300 transition-colors">
            <GitFork className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono tabular-nums text-slate-300">{repo.forks_count}</span>
          </span>
          {repo.open_issues_count > 0 && (
            <span className="flex items-center gap-1 text-slate-400">
              <CircleDot className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-mono tabular-nums">{repo.open_issues_count}</span>
            </span>
          )}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto pt-1 sm:pt-0">
          {onCloneRepo && (
            <button
              onClick={() => onCloneRepo(repo)}
              className="p-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Quick Clone & CLI commands"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          )}

          {onViewCommits && (
            <button
              onClick={() => onViewCommits(repo)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
              title="View Commits & History"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Commits</span>
            </button>
          )}

          {onOpenSandbox && (
            <button
              onClick={() => onOpenSandbox(repo)}
              className="p-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Test & run in Sandbox playground"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            </button>
          )}

          {onOpenReadmeStudio && (
            <button
              onClick={() => onOpenReadmeStudio(repo)}
              className="p-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Open README & Badges Studio"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          )}

          <button
            onClick={() => onExploreCode(repo)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Browse file tree, code files and README"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Code</span>
          </button>

          <button
            onClick={() => onAiAnalyze(repo)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-lg transition-colors"
            title="AI Architectural Summary, Security Audit & README generator"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
