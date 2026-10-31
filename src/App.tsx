import React, { useState, useEffect, useMemo } from 'react';
import {
  Header,
} from './components/Header';
import { TokenModal } from './components/TokenModal';
import { ProfileHero } from './components/ProfileHero';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { RepoCard } from './components/RepoCard';
import { CodeExplorerModal } from './components/CodeExplorerModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ProposalSection } from './components/ProposalSection';
import { PortfolioModal } from './components/PortfolioModal';
import { CompareModal } from './components/CompareModal';
import { DeploymentsHub } from './components/DeploymentsHub';
import { NetworkModal } from './components/NetworkModal';
import { StarredModal } from './components/StarredModal';
import { GistsModal } from './components/GistsModal';
import { CloneModal } from './components/CloneModal';
import { ResumeModal } from './components/ResumeModal';
import { ContributionHubModal } from './components/ContributionHubModal';
import { CodeSandboxModal } from './components/CodeSandboxModal';
import { ReadmeStudioModal } from './components/ReadmeStudioModal';
import { CareerRadarModal } from './components/CareerRadarModal';
import { ShareQrModal } from './components/ShareQrModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import {
  checkRateLimit,
  fetchAllUserRepos,
  fetchGitHubUser,
  fetchUserEvents,
  fetchProfileReadme,
  getStoredToken,
  DEMO_USER,
  DEMO_REPOS,
  detectDeploymentUrl,
  getBookmarkedRepos,
  toggleBookmarkRepo,
  getRecentScans,
  addRecentScan,
} from './services/githubApi';
import { GitHubEvent, GitHubRateLimit, GitHubRepo, GitHubUser, RecentScan } from './types/github';
import {
  Search,
  Filter,
  Grid,
  List,
  Sparkles,
  Layers,
  ArrowUpDown,
  AlertTriangle,
  RefreshCw,
  FolderGit2,
  Globe,
  Loader2,
  Bookmark,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<GitHubUser>(DEMO_USER);
  const [repos, setRepos] = useState<GitHubRepo[]>(DEMO_REPOS);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [rateLimit, setRateLimit] = useState<GitHubRateLimit | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [profileReadme, setProfileReadme] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('explorer');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // New Modals for Network, Starred, Gists, and Clone
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [networkInitialTab, setNetworkInitialTab] = useState<'followers' | 'following'>('followers');
  const [isStarredModalOpen, setIsStarredModalOpen] = useState(false);
  const [isGistsModalOpen, setIsGistsModalOpen] = useState(false);
  const [selectedRepoForClone, setSelectedRepoForClone] = useState<GitHubRepo | null>(null);

  // Modals for Code Explorer & AI Assistant
  const [selectedRepoForCode, setSelectedRepoForCode] = useState<GitHubRepo | null>(null);
  const [codeModalInitialTab, setCodeModalInitialTab] = useState<'files' | 'readme' | 'commits' | 'contributors' | 'manifest'>('files');
  const [selectedRepoForAi, setSelectedRepoForAi] = useState<GitHubRepo | null>(null);

  // New High-Utility Features
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);
  const [sandboxInitialCode, setSandboxInitialCode] = useState<string | undefined>(undefined);
  const [sandboxInitialLanguage, setSandboxInitialLanguage] = useState<string | undefined>(undefined);
  const [sandboxRepo, setSandboxRepo] = useState<GitHubRepo | null>(null);

  const [isReadmeStudioModalOpen, setIsReadmeStudioModalOpen] = useState(false);
  const [selectedRepoForReadme, setSelectedRepoForReadme] = useState<GitHubRepo | null>(null);

  const [isCareerRadarModalOpen, setIsCareerRadarModalOpen] = useState(false);
  const [isShareQrModalOpen, setIsShareQrModalOpen] = useState(false);
  const [selectedRepoForShare, setSelectedRepoForShare] = useState<GitHubRepo | null>(null);

  // Bookmarks and Recent Scans
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => {
    const list = getBookmarkedRepos();
    return new Set(list.map((b) => b.id));
  });
  const [isShowingBookmarksOnly, setIsShowingBookmarksOnly] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScan[]>(() => getRecentScans());

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtering & Sorting
  const [repoSearch, setRepoSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [repoTypeFilter, setRepoTypeFilter] = useState<'all' | 'source' | 'fork' | 'archived' | 'live_demo'>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated' | 'name'>('stars');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Check token and rate limit on mount
  useEffect(() => {
    refreshAuthStatus();
    handleScanUser('DevContributionCommunity', true);
  }, []);

  const refreshAuthStatus = async () => {
    const token = getStoredToken();
    setHasToken(!!token);
    try {
      const rate = await checkRateLimit();
      setRateLimit(rate);
    } catch {
      // Ignore initial rate limit check failure
    }
  };

  const handleScanUser = async (username: string, fallbackToDemo = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const userData = await fetchGitHubUser(username);
      setCurrentUser(userData);
      addRecentScan(userData);
      setRecentScans(getRecentScans());

      const [reposData, eventsData, readme] = await Promise.all([
        fetchAllUserRepos(username),
        fetchUserEvents(username),
        fetchProfileReadme(username),
      ]);

      setRepos(reposData);
      setEvents(eventsData);
      setProfileReadme(readme);
      refreshAuthStatus();
    } catch (err: any) {
      console.warn('Scan user error:', err);
      if (err.message === 'RATE_LIMIT_EXCEEDED') {
        setErrorMessage(
          'GitHub API rate limit exceeded for unauthenticated requests (60/hr). Add a free GitHub Personal Access Token in the top-right to get 5,000/hr, or explore our built-in demo datasets below!'
        );
      } else {
        setErrorMessage(err.message || 'Failed to scan developer profile.');
      }

      if (fallbackToDemo || username.toLowerCase() === 'devcontributioncommunity') {
        setCurrentUser(DEMO_USER);
        setRepos(DEMO_REPOS);
        setProfileReadme(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = (repo: GitHubRepo) => {
    toggleBookmarkRepo(repo);
    const updated = new Set(bookmarkedIds);
    if (updated.has(repo.id)) {
      updated.delete(repo.id);
    } else {
      updated.add(repo.id);
    }
    setBookmarkedIds(updated);
  };

  const handleOpenNetwork = (tab: 'followers' | 'following') => {
    setNetworkInitialTab(tab);
    setIsNetworkModalOpen(true);
  };

  const handleOpenSandbox = (repo?: GitHubRepo | null, code?: string, lang?: string) => {
    setSandboxRepo(repo || null);
    setSandboxInitialCode(code);
    setSandboxInitialLanguage(lang);
    setIsSandboxModalOpen(true);
  };

  const handleOpenReadmeStudio = (repo: GitHubRepo) => {
    setSelectedRepoForReadme(repo);
    setIsReadmeStudioModalOpen(true);
  };

  // Distinct languages for dropdown
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).sort();
  }, [repos]);

  // Filtered and sorted repos
  const filteredRepos = useMemo(() => {
    let result = repos.filter((r) => {
      // Bookmarks only check
      if (isShowingBookmarksOnly && !bookmarkedIds.has(r.id)) {
        return false;
      }

      // Search
      const q = repoSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.topics && r.topics.some((t) => t.toLowerCase().includes(q)));

      // Language
      const matchesLang = selectedLanguage === 'all' || r.language === selectedLanguage;

      // Type filter
      let matchesType = true;
      if (repoTypeFilter === 'source') matchesType = !r.fork;
      else if (repoTypeFilter === 'fork') matchesType = r.fork;
      else if (repoTypeFilter === 'archived') matchesType = r.archived;
      else if (repoTypeFilter === 'live_demo') {
        matchesType = !!detectDeploymentUrl(r);
      }

      return matchesSearch && matchesLang && matchesType;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (sortBy === 'forks') return (b.forks_count || 0) - (a.forks_count || 0);
      if (sortBy === 'updated') {
        return new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime();
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [repos, repoSearch, selectedLanguage, repoTypeFilter, sortBy, isShowingBookmarksOnly, bookmarkedIds]);

  const deployedCount = useMemo(() => {
    return repos.filter((r) => !!detectDeploymentUrl(r)).length;
  }, [repos]);

  // Export handlers
  const handleExportData = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(repos, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `openrepolens-${currentUser.login}-repos.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['Name', 'Description', 'Language', 'Stars', 'Forks', 'Open Issues', 'Created At', 'Updated At', 'GitHub URL', 'Live Demo URL'];
      const rows = repos.map((r) => [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`,
        `"${r.language || ''}"`,
        r.stargazers_count,
        r.forks_count,
        r.open_issues_count,
        r.created_at,
        r.updated_at,
        `"${r.html_url}"`,
        `"${detectDeploymentUrl(r) || ''}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `openrepolens-${currentUser.login}-repos.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col selection:bg-indigo-600/30">
      {/* Top Bar Header */}
      <Header
        hasToken={hasToken}
        rateLimit={rateLimit}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        deployedCount={deployedCount}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-8">
        {/* Rate limit warning banner if applicable */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTokenModalOpen(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
              >
                Add Free GitHub Token
              </button>
              <button
                onClick={() => handleScanUser('DevContributionCommunity', true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors"
              >
                Load Demo Data
              </button>
            </div>
          </div>
        )}

        {/* PROFILE SCANNER & HEADER */}
        {activeTab !== 'proposal' && (
          <ProfileHero
            user={currentUser}
            repos={repos}
            onSearch={handleScanUser}
            isLoading={isLoading}
            onOpenPortfolio={() => setIsPortfolioModalOpen(true)}
            onOpenResume={() => setIsResumeModalOpen(true)}
            onOpenCompare={() => setIsCompareModalOpen(true)}
            onOpenNetwork={handleOpenNetwork}
            onOpenStarred={() => setIsStarredModalOpen(true)}
            onOpenGists={() => setIsGistsModalOpen(true)}
            onExportData={handleExportData}
            recentScans={recentScans}
            bookmarkedCount={bookmarkedIds.size}
            onToggleBookmarksFilter={() => setIsShowingBookmarksOnly(!isShowingBookmarksOnly)}
            isShowingBookmarksOnly={isShowingBookmarksOnly}
            profileReadme={profileReadme}
            onOpenContribute={() => setIsContributionModalOpen(true)}
            onOpenSandbox={() => handleOpenSandbox(repos[0] || null)}
            onOpenCareerRadar={() => setIsCareerRadarModalOpen(true)}
            onOpenReadmeStudio={() => handleOpenReadmeStudio(repos[0] || null)}
            onOpenShareQr={() => {
              setSelectedRepoForShare(null);
              setIsShareQrModalOpen(true);
            }}
          />
        )}

        {/* TAB: EXPLORER (Full Dashboard with Heatmap + Repos) */}
        {activeTab === 'explorer' && (
          <div className="space-y-10">
            {/* Activity Heatmap section */}
            <ActivityHeatmap
              user={currentUser}
              repos={repos}
              events={events}
            />

            {/* Repositories section */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-indigo-400" />
                    <span>
                      {isShowingBookmarksOnly ? 'Bookmarked Repositories' : 'Public Repositories'} ({filteredRepos.length})
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Explore code, commits, live deployments, and AI summaries for all discovered projects
                  </p>
                </div>

                {/* Filter and search controls */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Search inside repos */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      placeholder="Search repos or topics..."
                      className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs w-44 sm:w-56"
                    />
                  </div>

                  {/* Language filter */}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Languages</option>
                    {availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>

                  {/* Type filter */}
                  <select
                    value={repoTypeFilter}
                    onChange={(e) => setRepoTypeFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Types</option>
                    <option value="source">Sources Only</option>
                    <option value="fork">Forks Only</option>
                    <option value="live_demo">With Live Demo 🌐</option>
                    <option value="archived">Archived</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="stars">Most Stars ⭐</option>
                    <option value="forks">Most Forks 🍴</option>
                    <option value="updated">Recently Updated 🕒</option>
                    <option value="name">Name (A-Z)</option>
                  </select>

                  {/* Layout toggle */}
                  <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Grid layout"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="List layout"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Repos Grid / List */}
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <span className="text-xs">Scanning repositories, branches, and commit status...</span>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                  <p className="text-sm font-medium text-white">No repositories match your current filter.</p>
                  <p className="text-xs">Try resetting the language, search query, or type filter.</p>
                  <button
                    onClick={() => {
                      setRepoSearch('');
                      setSelectedLanguage('all');
                      setRepoTypeFilter('all');
                      setIsShowingBookmarksOnly(false);
                    }}
                    className="mt-3 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                      : 'flex flex-col gap-3'
                  }
                >
                  {filteredRepos.map((repo) => (
                    <RepoCard
                      key={repo.id}
                      repo={repo}
                      isBookmarked={bookmarkedIds.has(repo.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onExploreCode={(r) => {
                        setCodeModalInitialTab('files');
                        setSelectedRepoForCode(r);
                      }}
                      onViewCommits={(r) => {
                        setCodeModalInitialTab('commits');
                        setSelectedRepoForCode(r);
                      }}
                      onCloneRepo={(r) => setSelectedRepoForClone(r)}
                      onAiAnalyze={(r) => setSelectedRepoForAi(r)}
                      onOpenSandbox={(r) => handleOpenSandbox(r)}
                      onOpenReadmeStudio={(r) => handleOpenReadmeStudio(r)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB: REPOSITORIES VIEW */}
        {activeTab === 'repositories' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-400" />
                  <span>All Repositories ({filteredRepos.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Direct source code links, license verification, and deployment targets
                </p>
              </div>

              {/* Search & filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <input
                  type="text"
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  placeholder="Filter repositories..."
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs w-44"
                />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                >
                  <option value="all">All Languages</option>
                  {availableLanguages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <select
                  value={repoTypeFilter}
                  onChange={(e) => setRepoTypeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                >
                  <option value="all">All Repos</option>
                  <option value="live_demo">Deployed Sites Only</option>
                  <option value="source">Sources Only</option>
                  <option value="fork">Forks Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRepos.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  isBookmarked={bookmarkedIds.has(repo.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onExploreCode={(r) => {
                    setCodeModalInitialTab('files');
                    setSelectedRepoForCode(r);
                  }}
                  onViewCommits={(r) => {
                    setCodeModalInitialTab('commits');
                    setSelectedRepoForCode(r);
                  }}
                  onCloneRepo={(r) => setSelectedRepoForClone(r)}
                  onAiAnalyze={(r) => setSelectedRepoForAi(r)}
                  onOpenSandbox={(r) => handleOpenSandbox(r)}
                  onOpenReadmeStudio={(r) => handleOpenReadmeStudio(r)}
                />
              ))}
            </div>
          </section>
        )}

        {/* TAB: ACTIVITY HEATMAP VIEW */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <ActivityHeatmap
              user={currentUser}
              repos={repos}
              events={events}
            />
          </div>
        )}

        {/* TAB: CONTRIBUTE & PRs VIEW */}
        {activeTab === 'contribute' && (
          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0c1428] via-[#091022] to-[#060b18] border border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Open Source Contribution Engine</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Find Good First Issues & Developer Pull Requests</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Explore beginner-friendly open issues across public projects, audit repository contribution health, and inspect global PR contributions made by @{currentUser.login}.
                </p>
              </div>
              <button
                onClick={() => setIsContributionModalOpen(true)}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs md:text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                <span>Launch Contribution Inspector</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setIsContributionModalOpen(true)}
                className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition-all space-y-2 group"
              >
                <div className="text-sm font-bold text-white group-hover:text-indigo-400">Good First Issues</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Curated issues with beginner-friendly labels ready for immediate community contribution.
                </p>
              </div>
              <div
                onClick={() => setIsContributionModalOpen(true)}
                className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition-all space-y-2 group"
              >
                <div className="text-sm font-bold text-white group-hover:text-indigo-400">Public PR Tracker</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Global pull requests authored by @{currentUser.login} across open-source repositories.
                </p>
              </div>
              <div
                onClick={() => setIsContributionModalOpen(true)}
                className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition-all space-y-2 group"
              >
                <div className="text-sm font-bold text-white group-hover:text-indigo-400">Repo Health Audit</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated checklist verifying Licenses, Readmes, and community contribution readiness.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CODE SANDBOX VIEW */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0a1524] via-[#07111f] to-[#040914] border border-emerald-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Interactive In-Browser Execution</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Live Code Playground & Sandbox</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Run HTML, Tailwind CSS, and client-side JavaScript in real time with an embedded console logger. Test algorithms, UI snippets, and API fetchers without leaving your browser.
                </p>
              </div>
              <button
                onClick={() => handleOpenSandbox(repos[0] || null)}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs md:text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                <span>Open Fullscreen Playground</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: LIVE DEPLOYMENTS HUB */}
        {activeTab === 'deployments' && (
          <DeploymentsHub
            repos={repos}
            onExploreCode={(r) => {
              setCodeModalInitialTab('files');
              setSelectedRepoForCode(r);
            }}
          />
        )}

        {/* TAB: PROJECT PROPOSAL (DevContributionCommunity document) */}
        {activeTab === 'proposal' && (
          <ProposalSection />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#080d19] py-10 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-white tracking-tight text-sm">OpenRepoLens</span>
            <span>·</span>
            <span>A Project Proposal by <strong className="text-indigo-400">DevContributionCommunity</strong></span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a
              href="https://github.com/DevContributionCommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <span>·</span>
            <a
              href="https://www.instagram.com/DevContributionCommunity/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <span>·</span>
            <a
              href="https://www.youtube.com/@DevContributionCommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              YouTube
            </a>
            <span>·</span>
            <a
              href="mailto:devcontributioncommunity@gmail.com"
              className="hover:text-white transition-colors"
            >
              Gmail Feedback
            </a>
          </div>

          <p className="text-[11px] text-slate-500">
            Free Software · Open Collaboration · 100% Frontend Architecture · Community First
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenUpdated={refreshAuthStatus}
      />

      <CodeExplorerModal
        repo={selectedRepoForCode}
        isOpen={!!selectedRepoForCode}
        onClose={() => setSelectedRepoForCode(null)}
        initialTab={codeModalInitialTab}
        onOpenInSandbox={(code, lang) => handleOpenSandbox(selectedRepoForCode, code, lang)}
      />

      <AiAssistantModal
        repo={selectedRepoForAi}
        isOpen={!!selectedRepoForAi}
        onClose={() => setSelectedRepoForAi(null)}
      />

      <ContributionHubModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        user={currentUser}
        repos={repos}
        onScanUser={(target) => handleScanUser(target)}
      />

      <CodeSandboxModal
        isOpen={isSandboxModalOpen}
        onClose={() => setIsSandboxModalOpen(false)}
        initialCode={sandboxInitialCode}
        initialLanguage={sandboxInitialLanguage}
        repo={sandboxRepo}
      />

      <ReadmeStudioModal
        isOpen={isReadmeStudioModalOpen}
        onClose={() => setIsReadmeStudioModalOpen(false)}
        repo={selectedRepoForReadme}
        user={currentUser}
      />

      <CareerRadarModal
        isOpen={isCareerRadarModalOpen}
        onClose={() => setIsCareerRadarModalOpen(false)}
        user={currentUser}
        repos={repos}
      />

      <PortfolioModal
        user={currentUser}
        repos={repos}
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
      />

      <CompareModal
        currentUser={currentUser}
        currentRepos={repos}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onScanCompareTarget={(target) => handleScanUser(target)}
      />

      <NetworkModal
        user={currentUser}
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        onScanUser={(target) => handleScanUser(target)}
        onCompareWith={(target) => {
          handleScanUser(target);
          setIsCompareModalOpen(true);
        }}
        initialTab={networkInitialTab}
      />

      <StarredModal
        username={currentUser.login}
        isOpen={isStarredModalOpen}
        onClose={() => setIsStarredModalOpen(false)}
        onScanUser={(target) => handleScanUser(target)}
        onExploreCode={(repo) => {
          setCodeModalInitialTab('files');
          setSelectedRepoForCode(repo);
        }}
      />

      <GistsModal
        username={currentUser.login}
        isOpen={isGistsModalOpen}
        onClose={() => setIsGistsModalOpen(false)}
      />

      <CloneModal
        repo={selectedRepoForClone}
        isOpen={!!selectedRepoForClone}
        onClose={() => setSelectedRepoForClone(null)}
      />

      <ResumeModal
        user={currentUser}
        repos={repos}
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />
    </div>
  );
}
