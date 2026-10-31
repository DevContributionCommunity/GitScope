import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  GitFork,
  ExternalLink,
  Scan,
  Loader2,
  FolderGit2,
  Search,
} from 'lucide-react';
import { GitHubRepo } from '../types/github';
import { fetchUserStarred } from '../services/githubApi';

interface StarredModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onScanUser: (username: string) => void;
  onExploreCode: (repo: GitHubRepo) => void;
}

export const StarredModal: React.FC<StarredModalProps> = ({
  username,
  isOpen,
  onClose,
  onScanUser,
  onExploreCode,
}) => {
  const [starredRepos, setStarredRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen && username) {
      loadStarred();
    }
  }, [isOpen, username]);

  const loadStarred = async () => {
    setLoading(true);
    try {
      const data = await fetchUserStarred(username, 1, 60);
      setStarredRepos(data);
    } catch (err) {
      console.warn('Failed to fetch starred repos', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = starredRepos.filter((r) => {
    const q = search.toLowerCase().trim();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      r.owner.login.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[88vh] bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#080d19] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Starred Projects by @{username}</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  ({starredRepos.length} discovered)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Discover technologies, tools, and inspirations favorited by this developer
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

        {/* Search */}
        <div className="px-6 py-3 bg-[#0a101f] border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search starred projects or owners..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* List of starred repos */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs">Fetching starred projects...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Star className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300">No starred repositories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((repo) => (
                <div
                  key={repo.id}
                  className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={repo.owner.avatar_url}
                          alt=""
                          className="w-5 h-5 rounded-md border border-slate-700"
                        />
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-white hover:text-indigo-400 truncate"
                        >
                          {repo.full_name}
                        </a>
                      </div>
                      <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{repo.stargazers_count}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">
                      {repo.description || 'No description provided'}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
                      {repo.language && <span className="text-indigo-300">{repo.language}</span>}
                      <span>·</span>
                      <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        onScanUser(repo.owner.login);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                      title={`Scan @${repo.owner.login} profile`}
                    >
                      <Scan className="w-3 h-3 text-indigo-400" />
                      <span>Scan @{repo.owner.login}</span>
                    </button>

                    <button
                      onClick={() => {
                        onExploreCode(repo);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <FolderGit2 className="w-3 h-3" />
                      <span>Code</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
