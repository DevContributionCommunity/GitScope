import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserCheck,
  UserPlus,
  Search,
  ExternalLink,
  Scan,
  Loader2,
  Users2,
  ArrowRight,
} from 'lucide-react';
import { GitHubFollowerUser, GitHubUser } from '../types/github';
import { fetchUserFollowers, fetchUserFollowing } from '../services/githubApi';

interface NetworkModalProps {
  user: GitHubUser;
  isOpen: boolean;
  onClose: () => void;
  onScanUser: (username: string) => void;
  onCompareWith: (username: string) => void;
  initialTab?: 'followers' | 'following';
}

export const NetworkModal: React.FC<NetworkModalProps> = ({
  user,
  isOpen,
  onClose,
  onScanUser,
  onCompareWith,
  initialTab = 'followers',
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<GitHubFollowerUser[]>([]);
  const [following, setFollowing] = useState<GitHubFollowerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadNetworkData();
    }
  }, [isOpen, user.login, initialTab]);

  const loadNetworkData = async () => {
    setLoading(true);
    try {
      const [fData, fgData] = await Promise.all([
        fetchUserFollowers(user.login, 1, 100),
        fetchUserFollowing(user.login, 1, 100),
      ]);
      setFollowers(fData);
      setFollowing(fgData);
    } catch (err) {
      console.warn('Network fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentList = activeTab === 'followers' ? followers : following;
  const filteredList = currentList.filter((item) =>
    item.login.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleSelectUser = (targetUsername: string) => {
    onScanUser(targetUsername);
    onClose();
  };

  const handleCompareUser = (targetUsername: string) => {
    onCompareWith(targetUsername);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-[88vh] bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#080d19] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Developer Network & Connections</span>
                <span className="text-xs font-mono text-indigo-400">@{user.login}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Explore connected developers and click to scan any profile instantly
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

        {/* Tab Switcher & Search Bar */}
        <div className="px-6 py-3 bg-[#0a101f] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('followers')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'followers'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Followers</span>
              <span className="font-mono tabular-nums bg-indigo-950/80 px-1.5 py-0.5 rounded text-[11px]">
                {user.followers}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'following'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Following</span>
              <span className="font-mono tabular-nums bg-indigo-950/80 px-1.5 py-0.5 rounded text-[11px]">
                {user.following}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Filter ${activeTab}...`}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Network Users Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-xs">Fetching network profiles from GitHub...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300">
                {search ? `No ${activeTab} match "${search}"` : `No public ${activeTab} found.`}
              </p>
              <p className="text-xs text-slate-500">
                Rate limits or privacy settings might affect unauthenticated follower listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredList.map((targetUser) => (
                <div
                  key={targetUser.id}
                  className="p-3.5 rounded-xl bg-[#0f172a] hover:bg-[#131c33] border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={targetUser.avatar_url}
                      alt={targetUser.login}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl border border-slate-700 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <a
                        href={targetUser.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-white hover:text-indigo-400 transition-colors truncate block flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="truncate">@{targetUser.login}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                      </a>
                      <span className="text-[10px] font-mono text-slate-500">
                        {targetUser.type || 'User'}
                      </span>
                    </div>
                  </div>

                  {/* Actions for this user */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => handleSelectUser(targetUser.login)}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                      title={`Scan @${targetUser.login} on OpenRepoLens`}
                    >
                      <Scan className="w-3 h-3" />
                      <span>Scan</span>
                    </button>

                    <button
                      onClick={() => handleCompareUser(targetUser.login)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                      title={`Compare @${user.login} with @${targetUser.login}`}
                    >
                      <Users2 className="w-3.5 h-3.5 text-indigo-400" />
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
