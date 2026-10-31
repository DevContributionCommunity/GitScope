import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Building,
  Link as LinkIcon,
  Twitter,
  Calendar,
  Users,
  Star,
  GitFork,
  BookOpen,
  Globe,
  Share2,
  Download,
  ExternalLink,
  Code2,
  Users2,
  Bookmark,
  History,
  FileCode2,
  BookMarked,
  Sparkles,
  Award,
  GitPullRequest,
  Trophy,
  Play,
  FileText,
  QrCode,
} from 'lucide-react';
import { GitHubRepo, GitHubUser, RecentScan } from '../types/github';

interface ProfileHeroProps {
  user: GitHubUser;
  repos: GitHubRepo[];
  onSearch: (username: string) => void;
  isLoading: boolean;
  onOpenPortfolio: () => void;
  onOpenResume: () => void;
  onOpenCompare: () => void;
  onOpenNetwork: (tab: 'followers' | 'following') => void;
  onOpenStarred: () => void;
  onOpenGists: () => void;
  onExportData: (format: 'json' | 'csv') => void;
  recentScans: RecentScan[];
  bookmarkedCount: number;
  onToggleBookmarksFilter: () => void;
  isShowingBookmarksOnly: boolean;
  profileReadme?: string | null;
  onOpenContribute?: () => void;
  onOpenSandbox?: () => void;
  onOpenCareerRadar?: () => void;
  onOpenReadmeStudio?: () => void;
  onOpenShareQr?: () => void;
}

const POPULAR_DEMOS = [
  'DevContributionCommunity',
  'shadcn',
  'torvalds',
  'antfu',
  'gaearon',
  'leerob',
];

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  repos,
  onSearch,
  isLoading,
  onOpenPortfolio,
  onOpenResume,
  onOpenCompare,
  onOpenNetwork,
  onOpenStarred,
  onOpenGists,
  onExportData,
  recentScans,
  bookmarkedCount,
  onToggleBookmarksFilter,
  isShowingBookmarksOnly,
  profileReadme,
  onOpenContribute,
  onOpenSandbox,
  onOpenCareerRadar,
  onOpenReadmeStudio,
  onOpenShareQr,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showProfileReadme, setShowProfileReadme] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  // Calculate metrics
  const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  const liveDemosCount = repos.filter(
    (r) => (r.homepage && r.homepage.startsWith('http')) || (r.description && r.description.includes('vercel.app'))
  ).length;

  // Language count
  const langCounts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });
  const topLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Multi-language';

  return (
    <section className="space-y-6 pt-4 pb-2">
      {/* Search Input Bar */}
      <div className="max-w-3xl mx-auto space-y-3">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search GitHub username (e.g. DevContributionCommunity)..."
            className="w-full pl-10 sm:pl-11 pr-24 sm:pr-32 py-3 sm:py-3.5 bg-[#0e1628] border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm md:text-base shadow-lg transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-1.5 sm:right-2 px-3 sm:px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isLoading ? (
              'Scanning...'
            ) : (
              <>
                <span className="hidden sm:inline">Scan Profile</span>
                <span className="sm:hidden">Scan</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Suggestions & Recent Scans */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Quick Scan:</span>
            {POPULAR_DEMOS.map((demo) => (
              <button
                key={demo}
                type="button"
                onClick={() => {
                  setSearchInput(demo);
                  onSearch(demo);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  user.login.toLowerCase() === demo.toLowerCase()
                    ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                @{demo}
              </button>
            ))}
          </div>

          {recentScans.length > 0 && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <History className="w-3 h-3 text-slate-500" />
              <span>Recent:</span>
              <div className="flex items-center gap-1">
                {recentScans.slice(0, 3).map((s) => (
                  <button
                    key={s.login}
                    onClick={() => {
                      setSearchInput(s.login);
                      onSearch(s.login);
                    }}
                    className="hover:text-indigo-300 underline font-mono text-[11px]"
                  >
                    {s.login}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Developer Profile Header Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* User info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={user.avatar_url}
                alt={user.login}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-slate-700 object-cover shadow-md bg-slate-800"
              />
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-indigo-600 text-[10px] font-bold text-white rounded-md tracking-wider uppercase">
                Public
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {user.name || user.login}
                </h1>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-mono text-indigo-400 hover:text-indigo-300"
                >
                  <span>@{user.login}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {user.bio && (
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Metadata row with clickable followers/following (as user requested!) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 pt-1">
                {user.company && (
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.company}</span>
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.location}</span>
                  </span>
                )}
                {user.blog && (
                  <a
                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-400 hover:underline"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{user.blog.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {user.twitter_username && (
                  <a
                    href={`https://twitter.com/${user.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sky-400 hover:underline"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>@{user.twitter_username}</span>
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                </span>

                {/* Followers and Following Clickable Buttons */}
                <span className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenNetwork('followers')}
                    className="inline-flex items-center gap-1 hover:text-indigo-300 transition-colors text-slate-300 underline decoration-indigo-500/40 font-medium"
                    title="Click to view all followers & scan any of them!"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono tabular-nums text-white font-bold">{user.followers}</span>
                    <span>followers</span>
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => onOpenNetwork('following')}
                    className="inline-flex items-center gap-1 hover:text-indigo-300 transition-colors text-slate-300 underline decoration-indigo-500/40 font-medium"
                    title="Click to view all following users & scan any of them!"
                  >
                    <span className="font-mono tabular-nums text-white font-bold">{user.following}</span>
                    <span>following</span>
                  </button>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Share / Export Actions & Comparison */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0 w-full sm:w-auto">
            {onOpenShareQr && (
              <button
                onClick={onOpenShareQr}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600/90 hover:bg-indigo-600 rounded-lg transition-colors shadow-sm"
                title="Scan QR Code on mobile or share developer profile"
              >
                <QrCode className="w-3.5 h-3.5 text-white" />
                <span>QR & Share</span>
              </button>
            )}

            <button
              onClick={() => onOpenNetwork('followers')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Browse and scan followers & following network"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Network</span>
            </button>

            <button
              onClick={onOpenStarred}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Explore repositories starred by this developer"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Starred</span>
            </button>

            <button
              onClick={onOpenGists}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Explore public code gists & snippets"
            >
              <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gists</span>
            </button>

            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Compare side-by-side with another developer"
            >
              <Users2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compare</span>
            </button>

            <button
              onClick={onToggleBookmarksFilter}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                isShowingBookmarksOnly
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="View only bookmarked repos"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Saved ({bookmarkedCount})</span>
            </button>

            {onOpenContribute && (
              <button
                onClick={onOpenContribute}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                title="Good first issues and developer pull requests"
              >
                <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
                <span>PRs & Issues</span>
              </button>
            )}

            {onOpenCareerRadar && (
              <button
                onClick={onOpenCareerRadar}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                title="Milestones timeline & Tech DNA radar"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Career Radar</span>
              </button>
            )}

            {onOpenSandbox && (
              <button
                onClick={onOpenSandbox}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                title="Open live code playground sandbox"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                <span>Sandbox</span>
              </button>
            )}

            {onOpenReadmeStudio && (
              <button
                onClick={onOpenReadmeStudio}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                title="Generate professional README with shields badges"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>README Studio</span>
              </button>
            )}

            <button
              onClick={onOpenPortfolio}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600/90 hover:bg-indigo-600 rounded-lg transition-colors shadow-sm"
              title="Generate a clean shareable developer portfolio card"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </button>

            <button
              onClick={onOpenResume}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Generate and print a 1-page Developer Resume / CV"
            >
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>CV / Resume</span>
            </button>

            <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-900/60">
              <button
                onClick={() => onExportData('json')}
                className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-r border-slate-800 flex items-center gap-1"
                title="Export scanned repositories to JSON"
              >
                <Download className="w-3 h-3 text-slate-400" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => onExportData('csv')}
                className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Export scanned repositories to CSV"
              >
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile README Drawer if detected */}
        {profileReadme && (
          <div className="pt-2">
            <button
              onClick={() => setShowProfileReadme(!showProfileReadme)}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 py-1"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>{showProfileReadme ? 'Hide' : 'Show'} GitHub Profile README ({user.login}/{user.login})</span>
            </button>
            {showProfileReadme && (
              <div className="mt-3 p-4 rounded-xl bg-[#090d19] border border-slate-800 text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {profileReadme}
              </div>
            )}
          </div>
        )}

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 border-t border-slate-800/80">
          <div className="bg-[#0b1020] rounded-xl p-3 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Repositories</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {repos.length}
              {user.public_repos > repos.length && (
                <span className="text-xs text-slate-500 font-normal ml-1">/ {user.public_repos}</span>
              )}
            </div>
          </div>

          <div className="bg-[#0b1020] rounded-xl p-3 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Stars</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
              {totalStars.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0b1020] rounded-xl p-3 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <GitFork className="w-3.5 h-3.5 text-blue-400" />
              <span>Total Forks</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {totalForks.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0b1020] rounded-xl p-3 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Primary Tech</span>
            </div>
            <div className="text-lg font-bold text-emerald-300 truncate">
              {topLanguage}
            </div>
          </div>

          <div className="bg-[#0b1020] rounded-xl p-3 border border-slate-800/60 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              <span>Live Deployed</span>
            </div>
            <div className="text-xl font-bold font-mono text-violet-300 tabular-nums">
              {liveDemosCount} projects
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
