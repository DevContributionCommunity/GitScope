import React, { useState } from 'react';
import {
  X,
  Users2,
  Star,
  GitFork,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Loader2,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { GitHubRepo, GitHubUser } from '../types/github';
import { fetchAllUserRepos, fetchGitHubUser } from '../services/githubApi';
import { requestAIAnalysis } from '../services/aiService';

interface CompareModalProps {
  currentUser: GitHubUser;
  currentRepos: GitHubRepo[];
  isOpen: boolean;
  onClose: () => void;
  onScanCompareTarget: (username: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  currentUser,
  currentRepos,
  isOpen,
  onClose,
  onScanCompareTarget,
}) => {
  const [targetUsername, setTargetUsername] = useState('antfu');
  const [compareUser, setCompareUser] = useState<GitHubUser | null>(null);
  const [compareRepos, setCompareRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI comparison
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (!isOpen) return null;

  const handleFetchCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUsername.trim()) return;

    setLoading(true);
    setError(null);
    setAiReport(null);
    try {
      const u = await fetchGitHubUser(targetUsername.trim());
      const r = await fetchAllUserRepos(targetUsername.trim(), 2);
      setCompareUser(u);
      setCompareRepos(r);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comparison user.');
    } finally {
      setLoading(false);
    }
  };

  const user1Stars = currentRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const user1Forks = currentRepos.reduce((acc, r) => acc + (r.forks_count || 0), 0);

  const user2Stars = compareRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const user2Forks = compareRepos.reduce((acc, r) => acc + (r.forks_count || 0), 0);

  const handleRunAiComparison = async () => {
    if (!compareUser) return;
    setAiLoading(true);
    try {
      const result = await requestAIAnalysis({
        action: 'compare_repos',
        repoData: {
          name: currentUser.name || currentUser.login,
          description: currentUser.bio || '',
          stargazers_count: user1Stars,
          forks_count: user1Forks,
          language: currentRepos[0]?.language || 'TypeScript',
        },
        compareRepoData: {
          name: compareUser.name || compareUser.login,
          description: compareUser.bio || '',
          stargazers_count: user2Stars,
          forks_count: user2Forks,
          language: compareRepos[0]?.language || 'TypeScript',
        },
      });
      setAiReport(result);
    } catch (err: any) {
      setAiReport('Could not generate comparison: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#080d19] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Multi-Profile Comparison</h3>
              <p className="text-xs text-slate-400">
                Compare repositories, stars, language ecosystem, and community reach side-by-side
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar for target user */}
        <div className="px-6 py-3 bg-[#0a101f] border-b border-slate-800">
          <form onSubmit={handleFetchCompare} className="flex gap-2">
            <input
              type="text"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              placeholder="Enter another GitHub username to compare (e.g. antfu, shadcn, torvalds)..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Comparing...' : 'Compare Developer'}
            </button>
          </form>
          {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {compareUser ? (
            <>
              {/* Profile Comparison Header Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* User 1 */}
                <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-xl border border-indigo-500/40 object-cover"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {currentUser.name || currentUser.login}
                      </h4>
                      <p className="text-xs font-mono text-indigo-400">@{currentUser.login}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{currentUser.bio || 'No bio provided'}</p>
                </div>

                {/* User 2 */}
                <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={compareUser.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-xl border border-violet-500/40 object-cover"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {compareUser.name || compareUser.login}
                      </h4>
                      <p className="text-xs font-mono text-violet-400">@{compareUser.login}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{compareUser.bio || 'No bio provided'}</p>
                </div>
              </div>

              {/* Side-by-Side Metrics Matrix */}
              <div className="p-5 rounded-xl bg-[#0a101f] border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Comparative Metrics
                </h5>
                <div className="divide-y divide-slate-800/80 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="font-mono tabular-nums text-white font-bold w-1/3 text-left">
                      {currentUser.public_repos} repos
                    </span>
                    <span className="text-slate-400 font-semibold w-1/3 text-center">Public Repositories</span>
                    <span className="font-mono tabular-nums text-white font-bold w-1/3 text-right">
                      {compareUser.public_repos} repos
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="font-mono tabular-nums text-amber-300 font-bold w-1/3 text-left">
                      ★ {user1Stars.toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-semibold w-1/3 text-center">Total Stars</span>
                    <span className="font-mono tabular-nums text-amber-300 font-bold w-1/3 text-right">
                      ★ {user2Stars.toLocaleString()}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="font-mono tabular-nums text-blue-300 font-bold w-1/3 text-left">
                      🍴 {user1Forks.toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-semibold w-1/3 text-center">Total Forks</span>
                    <span className="font-mono tabular-nums text-blue-300 font-bold w-1/3 text-right">
                      🍴 {user2Forks.toLocaleString()}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="font-mono tabular-nums text-slate-300 w-1/3 text-left">
                      {currentUser.followers.toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-semibold w-1/3 text-center">Followers</span>
                    <span className="font-mono tabular-nums text-slate-300 w-1/3 text-right">
                      {compareUser.followers.toLocaleString()}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="font-mono text-slate-400 w-1/3 text-left">
                      {new Date(currentUser.created_at).getFullYear()}
                    </span>
                    <span className="text-slate-400 font-semibold w-1/3 text-center">Member Since</span>
                    <span className="font-mono text-slate-400 w-1/3 text-right">
                      {new Date(compareUser.created_at).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Comparison Button & Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Automated Architecture & Output Comparison
                  </span>
                  <button
                    onClick={handleRunAiComparison}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'Analyzing...' : 'Generate AI Comparison Report'}</span>
                  </button>
                </div>

                {aiReport && (
                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {aiReport}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Users2 className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm">
                Enter another GitHub username above and click <strong>Compare Developer</strong> to generate side-by-side analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
