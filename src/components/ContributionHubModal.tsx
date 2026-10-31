import React, { useState, useEffect } from 'react';
import { X, GitPullRequest, HelpCircle, CheckCircle2, Clock, AlertCircle, ExternalLink, Filter, Search, Sparkles, FolderGit2 } from 'lucide-react';
import { GitHubRepo, GitHubUser } from '../types/github';
import { fetchUserPullRequests, fetchUserGoodFirstIssues } from '../services/githubApi';

interface ContributionHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: GitHubUser;
  repos: GitHubRepo[];
  onScanUser: (username: string) => void;
}

export const ContributionHubModal: React.FC<ContributionHubModalProps> = ({
  isOpen,
  onClose,
  user,
  repos,
  onScanUser,
}) => {
  const [activeTab, setActiveTab] = useState<'issues' | 'prs' | 'health'>('issues');
  const [issues, setIssues] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      fetchUserGoodFirstIssues(user.login),
      fetchUserPullRequests(user.login),
    ]).then(([issuesData, prsData]) => {
      if (isMounted) {
        setIssues(issuesData);
        setPrs(prsData);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, user.login]);

  if (!isOpen) return null;

  // Filtered issues
  const filteredIssues = issues.filter((i) => {
    const q = filterQuery.toLowerCase();
    return !q || i.title.toLowerCase().includes(q) || (i.repository_url && i.repository_url.toLowerCase().includes(q));
  });

  // Filtered PRs
  const filteredPrs = prs.filter((p) => {
    const q = filterQuery.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || (p.repository_url && p.repository_url.toLowerCase().includes(q));
  });

  // Health audit for user's repositories
  const repoHealthMetrics = repos.slice(0, 15).map((r) => {
    let score = 40; // Base score
    const perks: string[] = [];
    const missing: string[] = [];

    if (r.description && r.description.length > 15) {
      score += 15;
      perks.push('Rich Description');
    } else {
      missing.push('Detailed Description');
    }

    if (r.license) {
      score += 20;
      perks.push(`License: ${r.license.spdx_id || r.license.name}`);
    } else {
      missing.push('Open Source License');
    }

    if (r.topics && r.topics.length > 0) {
      score += 15;
      perks.push(`${r.topics.length} Discoverability Topics`);
    } else {
      missing.push('Repository Topics/Tags');
    }

    if (r.homepage) {
      score += 10;
      perks.push('Live Homepage URL');
    }

    return {
      repo: r,
      score: Math.min(score, 100),
      perks,
      missing,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] bg-[#0d1326] border-0 sm:border border-slate-700/80 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-[#090e1c]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <GitPullRequest className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate">
                <span>Contribution Hub</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 truncate">
                  @{user.login}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Good First Issues, Open Source PRs & Audit
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

        {/* Tab Controls & Filter */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800/80 bg-[#0b1020] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'issues'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Good First Issues</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {issues.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('prs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'prs'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Developer's Public PRs</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {prs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'health'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Repo Health Audit</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by title or repository..."
              className="w-full sm:w-60 pl-8 pr-3 py-1.5 bg-[#0e1628] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Querying GitHub API for issues and pull requests...</p>
            </div>
          ) : activeTab === 'issues' ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/60 text-xs text-indigo-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Ready to contribute? These are active public issues tagged with <code className="text-indigo-300 font-mono">good first issue</code> or <code className="text-indigo-300 font-mono">help wanted</code>. Click any item to jump directly to the GitHub issue thread.
                </span>
              </div>

              {filteredIssues.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No issues found matching your filter.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 rounded-xl bg-[#10172c] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            {issue.state.toUpperCase()}
                          </span>
                          <span className="text-slate-500 text-xs font-mono">#{issue.number || issue.id}</span>
                          {issue.labels?.map((lbl: any) => (
                            <span
                              key={lbl.id || lbl.name}
                              className="font-mono text-[10px] px-2 py-0.5 rounded border"
                              style={{
                                backgroundColor: `#${lbl.color}15`,
                                borderColor: `#${lbl.color}40`,
                                color: `#${lbl.color}`,
                              }}
                            >
                              {lbl.name}
                            </span>
                          ))}
                        </div>
                        <h4 className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors">
                          <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                            {issue.title}
                          </a>
                        </h4>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span className="font-mono text-slate-300">
                            {issue.repository_url?.split('/').slice(-2).join('/') || user.login}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(issue.created_at).toLocaleDateString()}
                          </span>
                          <span>·</span>
                          <span>{issue.comments} comments</span>
                        </div>
                      </div>

                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <span>View Issue</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'prs' ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-900/60 text-xs text-violet-200 flex items-start gap-2.5">
                <GitPullRequest className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>
                  Public pull requests authored by <strong className="text-white">@{user.login}</strong> across GitHub repositories, highlighting their open-source collaboration history and merged contributions.
                </span>
              </div>

              {filteredPrs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No pull requests found for this developer.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredPrs.map((pr) => {
                    const isMerged = !!pr.pull_request?.merged_at;
                    const isOpen = pr.state === 'open';

                    return (
                      <div
                        key={pr.id}
                        className="p-4 rounded-xl bg-[#10172c] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                                isMerged
                                  ? 'bg-purple-950/80 text-purple-300 border border-purple-800/80'
                                  : isOpen
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              <GitPullRequest className="w-3 h-3" />
                              {isMerged ? 'MERGED' : isOpen ? 'OPEN' : 'CLOSED'}
                            </span>
                            <span className="text-slate-500 text-xs font-mono">#{pr.number || pr.id}</span>
                            {pr.labels?.map((lbl: any) => (
                              <span
                                key={lbl.id || lbl.name}
                                className="font-mono text-[10px] px-2 py-0.5 rounded border"
                                style={{
                                  backgroundColor: `#${lbl.color}15`,
                                  borderColor: `#${lbl.color}40`,
                                  color: `#${lbl.color}`,
                                }}
                              >
                                {lbl.name}
                              </span>
                            ))}
                          </div>

                          <h4 className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors">
                            <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                              {pr.title}
                            </a>
                          </h4>

                          <div className="text-xs text-slate-400 flex items-center gap-3">
                            <span className="font-mono text-indigo-300">
                              {pr.repository_url?.split('/').slice(-2).join('/') || 'github-repo'}
                            </span>
                            <span>·</span>
                            <span>Updated {new Date(pr.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <span>Inspect PR</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-xs text-emerald-200">
                Auditing contribution readiness across top repositories: checks presence of Open Source License, meaningful descriptions, and topics.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {repoHealthMetrics.map((item) => (
                  <div
                    key={item.repo.id}
                    className="p-4 rounded-xl bg-[#10172c] border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <FolderGit2 className="w-4 h-4 text-indigo-400" />
                          <span>{item.repo.name}</span>
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {item.repo.description || 'No description provided.'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                            item.score >= 80
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                              : item.score >= 60
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : 'bg-rose-950/80 text-rose-300 border-rose-800'
                          }`}
                        >
                          {item.score}% Health
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400">Present:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.perks.map((p, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-900/60 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {p}
                          </span>
                        ))}
                      </div>

                      {item.missing.length > 0 && (
                        <>
                          <div className="text-[11px] font-semibold text-slate-400 pt-1">Recommended to Add:</div>
                          <div className="flex flex-wrap gap-1">
                            {item.missing.map((m, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-900/60 flex items-center gap-1"
                              >
                                <AlertCircle className="w-2.5 h-2.5" />
                                {m}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
