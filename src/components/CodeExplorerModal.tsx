import React, { useState, useEffect } from 'react';
import {
  X,
  Folder,
  FileText,
  ChevronRight,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  BookOpen,
  ArrowLeft,
  FileCode,
  Search,
  Loader2,
  AlertCircle,
  GitCommit,
  Users,
  Package,
  Tag,
  CircleDot,
  Play,
} from 'lucide-react';
import { GitHubContentItem, GitHubRepo } from '../types/github';
import {
  fetchFileRaw,
  fetchRepoContents,
  fetchRepoReadme,
  fetchRepoCommits,
  fetchRepoContributors,
  fetchManifestSnippet,
  fetchRepoReleases,
  fetchRepoIssues,
} from '../services/githubApi';
import { requestAIAnalysis } from '../services/aiService';

interface CodeExplorerModalProps {
  repo: GitHubRepo | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'files' | 'readme' | 'commits' | 'contributors' | 'manifest' | 'releases' | 'issues';
  onOpenInSandbox?: (code: string, language?: string) => void;
}

export const CodeExplorerModal: React.FC<CodeExplorerModalProps> = ({
  repo,
  isOpen,
  onClose,
  initialTab = 'files',
  onOpenInSandbox,
}) => {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<GitHubContentItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<GitHubContentItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [readmeData, setReadmeData] = useState<{ content: string; name: string } | null>(null);
  const [viewMode, setViewMode] = useState<
    'files' | 'readme' | 'commits' | 'contributors' | 'manifest' | 'releases' | 'issues'
  >(initialTab);

  // Data states
  const [commits, setCommits] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [manifestContent, setManifestContent] = useState<string | null>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // AI Code review inside the explorer
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [mobileFileView, setMobileFileView] = useState<'tree' | 'code'>('tree');

  useEffect(() => {
    if (isOpen && repo) {
      setCurrentPath('');
      setSelectedFile(null);
      setFileContent('');
      setAiExplanation(null);
      setMobileFileView('tree');
      setViewMode(initialTab);
      loadDirectory('');
      loadReadme();
      loadCommits();
      loadContributors();
      loadManifest();
      loadReleases();
      loadIssues();
    }
  }, [isOpen, repo, initialTab]);

  const loadDirectory = async (path: string) => {
    if (!repo) return;
    setLoading(true);
    setError(null);
    try {
      const contents = await fetchRepoContents(repo.owner.login, repo.name, path);
      setItems(contents);
      setCurrentPath(path);
      setSelectedFile(null);
      setFileContent('');
      setAiExplanation(null);
      setMobileFileView('tree');
    } catch (err: any) {
      setError(err.message || 'Failed to load repository directory.');
    } finally {
      setLoading(false);
    }
  };

  const loadReadme = async () => {
    if (!repo) return;
    const rm = await fetchRepoReadme(repo.owner.login, repo.name);
    setReadmeData(rm);
  };

  const loadCommits = async () => {
    if (!repo) return;
    setSubLoading(true);
    try {
      const c = await fetchRepoCommits(repo.owner.login, repo.name, 25);
      setCommits(c);
    } catch {
      setCommits([]);
    } finally {
      setSubLoading(false);
    }
  };

  const loadContributors = async () => {
    if (!repo) return;
    try {
      const contr = await fetchRepoContributors(repo.owner.login, repo.name, 20);
      setContributors(contr);
    } catch {
      setContributors([]);
    }
  };

  const loadManifest = async () => {
    if (!repo) return;
    try {
      const m = await fetchManifestSnippet(repo.owner.login, repo.name);
      setManifestContent(m);
    } catch {
      setManifestContent(null);
    }
  };

  const loadReleases = async () => {
    if (!repo) return;
    try {
      const rel = await fetchRepoReleases(repo.owner.login, repo.name);
      setReleases(rel);
    } catch {
      setReleases([]);
    }
  };

  const loadIssues = async () => {
    if (!repo) return;
    try {
      const iss = await fetchRepoIssues(repo.owner.login, repo.name);
      setIssues(iss);
    } catch {
      setIssues([]);
    }
  };

  const handleItemClick = async (item: GitHubContentItem) => {
    if (item.type === 'dir') {
      loadDirectory(item.path);
    } else {
      setSelectedFile(item);
      setMobileFileView('code');
      setFileLoading(true);
      setAiExplanation(null);
      try {
        if (item.download_url) {
          const content = await fetchFileRaw(item.download_url);
          setFileContent(content);
        } else {
          setFileContent('// File preview is binary or unavailable for direct raw download.');
        }
      } catch (err: any) {
        setFileContent(`// Error reading file: ${err.message}`);
      } finally {
        setFileLoading(false);
      }
    }
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    loadDirectory(parts.join('/'));
  };

  const handleCopyCode = () => {
    let textToCopy = '';
    if (viewMode === 'readme') textToCopy = readmeData?.content || '';
    else if (viewMode === 'manifest') textToCopy = manifestContent || '';
    else textToCopy = fileContent;

    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const content = viewMode === 'readme' ? readmeData?.content || '' : fileContent;
    const filename = viewMode === 'readme' ? 'README.md' : selectedFile?.name || 'file.txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExplainWithAi = async (customAction = 'explain_code') => {
    const codeSnippet =
      viewMode === 'manifest'
        ? manifestContent || ''
        : fileContent;

    if (!codeSnippet && customAction === 'explain_code') return;
    setAiLoading(true);
    setAiExplanation(null);
    try {
      const result = await requestAIAnalysis({
        action: customAction as any,
        repoData: {
          name: repo?.name,
          description: repo?.description,
          language: repo?.language,
          topics: repo?.topics,
        },
        codeSnippet: codeSnippet.slice(0, 8000),
        language: selectedFile?.name?.split('.').pop() || repo?.language || 'typescript',
      });
      setAiExplanation(result);
    } catch (err: any) {
      setAiExplanation('AI Analysis could not complete: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen || !repo) return null;

  const pathParts = currentPath ? currentPath.split('/') : [];
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-full sm:h-[92vh] bg-[#0c1222] border-0 sm:border border-slate-700/80 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Explorer Header */}
        <div className="px-5 py-3.5 bg-[#080d19] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">{repo.full_name}</span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {repo.default_branch}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                In-browser Code, Releases, Commits & Dependencies Explorer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="px-5 py-2 bg-[#090f1e] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setViewMode('files')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'files'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Source Files</span>
            </button>

            {readmeData && (
              <button
                onClick={() => setViewMode('readme')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  viewMode === 'readme'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>README</span>
              </button>
            )}

            <button
              onClick={() => setViewMode('commits')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'commits'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Commits ({commits.length})</span>
            </button>

            <button
              onClick={() => setViewMode('releases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'releases'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Releases ({releases.length})</span>
            </button>

            <button
              onClick={() => setViewMode('issues')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'issues'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Issues & PRs ({issues.length})</span>
            </button>

            <button
              onClick={() => setViewMode('contributors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'contributors'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Contributors ({contributors.length})</span>
            </button>

            {manifestContent && (
              <button
                onClick={() => setViewMode('manifest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  viewMode === 'manifest'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Dependencies</span>
              </button>
            )}
          </div>

          {viewMode === 'files' && (
            <div className="relative w-44 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search folder..."
                className="w-full pl-8 pr-3 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Breadcrumb row for files mode */}
        {viewMode === 'files' && (
          <div className="px-5 py-2 bg-[#0a101f] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => loadDirectory('')}
              className="text-indigo-400 hover:underline font-mono font-semibold"
            >
              {repo.name}
            </button>
            {pathParts.map((part, index) => {
              const subPath = pathParts.slice(0, index + 1).join('/');
              return (
                <React.Fragment key={subPath}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <button
                    onClick={() => loadDirectory(subPath)}
                    className="text-slate-300 hover:text-indigo-300 font-mono"
                  >
                    {part}
                  </button>
                </React.Fragment>
              );
            })}
            {selectedFile && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-emerald-400 font-mono font-medium">{selectedFile.name}</span>
              </>
            )}
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* FILES VIEW */}
          {viewMode === 'files' && (
            <>
              {/* Left: File Tree / List Sidebar */}
              <div className={`w-full md:w-80 border-r border-slate-800 bg-[#090e1b] flex flex-col shrink-0 overflow-hidden ${
                mobileFileView === 'code' ? 'hidden md:flex' : 'flex-1 md:h-auto'
              }`}>
                <div className="p-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Files & Directories</span>
                  {currentPath && (
                    <button
                      onClick={handleGoUp}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Up</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {loading ? (
                    <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Loading files...</span>
                    </div>
                  ) : error ? (
                    <div className="p-4 text-xs text-rose-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500 text-center">No files found.</div>
                  ) : (
                    filteredItems.map((item) => {
                      const isSelected = selectedFile?.sha === item.sha;
                      return (
                        <button
                          key={item.sha}
                          onClick={() => handleItemClick(item)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left font-mono ${
                            isSelected
                              ? 'bg-indigo-600/30 text-white border border-indigo-500/50'
                              : 'text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {item.type === 'dir' ? (
                              <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">{item.name}</span>
                          </div>
                          {item.type !== 'dir' && (
                            <span className="text-[10px] text-slate-500 ml-2 shrink-0 tabular-nums">
                              {item.size ? `${(item.size / 1024).toFixed(1)}k` : ''}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right: Code Viewer */}
              <div className={`flex-1 flex flex-col bg-[#0b1020] overflow-hidden ${
                mobileFileView === 'tree' ? 'hidden md:flex' : 'flex'
              }`}>
                <div className="px-4 sm:px-5 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 text-xs bg-[#080d19]">
                  <div className="flex items-center gap-2 text-slate-300 font-mono min-w-0">
                    <button
                      onClick={() => setMobileFileView('tree')}
                      className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 shrink-0"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Files</span>
                    </button>
                    {selectedFile ? (
                      <span className="font-semibold text-white truncate">{selectedFile.name}</span>
                    ) : (
                      <span className="text-slate-400 truncate">Select any file from the list to view code</span>
                    )}
                  </div>

                  {selectedFile && (
                    <div className="flex items-center gap-2">
                      {onOpenInSandbox && (
                        <button
                          onClick={() => {
                            const ext = selectedFile.name.split('.').pop()?.toLowerCase();
                            const lang = ext === 'css' ? 'css' : ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx' ? 'javascript' : 'html';
                            onOpenInSandbox(fileContent, lang);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md font-medium text-xs shadow-sm transition-colors"
                          title="Open and run this code inside the Live Sandbox"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run in Sandbox</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleExplainWithAi('explain_code')}
                        disabled={aiLoading}
                        className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium text-xs shadow-sm transition-colors disabled:opacity-50"
                        title="Explain architecture, bugs, and best practices with Gemini"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{aiLoading ? 'Explaining...' : 'Explain with AI'}</span>
                      </button>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleDownloadFile}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Explanation Drawer */}
                {aiExplanation && (
                  <div className="bg-indigo-950/40 border-b border-indigo-900/60 p-4 max-h-48 overflow-y-auto space-y-2 text-xs text-indigo-100">
                    <div className="flex items-center justify-between font-semibold text-indigo-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Gemini AI Explanation
                      </span>
                      <button onClick={() => setAiExplanation(null)} className="text-indigo-400 hover:text-white">
                        Close
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed font-sans text-slate-200">
                      {aiExplanation}
                    </div>
                  </div>
                )}

                {/* Code Content Container */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 font-mono text-xs">
                  {fileLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      <span>Fetching file content...</span>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex">
                      <div className="select-none text-right pr-4 text-slate-600 font-mono text-xs border-r border-slate-800 shrink-0">
                        {fileContent.split('\n').map((_, i) => (
                          <div key={i} className="leading-5">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <pre className="pl-4 overflow-x-auto text-slate-200 leading-5">
                        <code>{fileContent}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 py-16">
                      <Folder className="w-12 h-12 text-slate-700" />
                      <p className="text-sm font-sans">
                        Browse the file tree on the left and select any file to read its source code.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* README VIEW */}
          {viewMode === 'readme' && (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 font-sans text-slate-200 text-sm leading-relaxed max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">README.md</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white rounded-lg"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed">
                {readmeData?.content || 'No README file found.'}
              </div>
            </div>
          )}

          {/* COMMITS VIEW */}
          {viewMode === 'commits' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-white">Recent Git Commits</span>
                <span>Branch: {repo.default_branch}</span>
              </div>

              {subLoading ? (
                <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span>Loading commit history...</span>
                </div>
              ) : commits.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No commits found or API access limited.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/70">
                  {commits.map((c) => (
                    <div key={c.sha} className="py-3 flex items-start justify-between gap-4 text-xs">
                      <div className="flex items-start gap-3">
                        {c.author?.avatar_url ? (
                          <img
                            src={c.author.avatar_url}
                            alt=""
                            className="w-6 h-6 rounded-full border border-slate-700 mt-0.5"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                            {c.commit?.author?.name?.[0] || 'C'}
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="font-medium text-white">{c.commit?.message}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span>{c.author?.login || c.commit?.author?.name}</span>
                            <span>·</span>
                            <span>
                              {new Date(c.commit?.author?.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={c.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-indigo-400 hover:underline shrink-0 bg-slate-900 px-2 py-1 rounded border border-slate-800"
                      >
                        {c.sha.slice(0, 7)}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RELEASES VIEW */}
          {viewMode === 'releases' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Repository Releases & Tags</span>
                <span className="text-[11px] font-mono text-slate-400">{releases.length} releases</span>
              </div>

              {releases.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  No published releases found for this repository.
                </div>
              ) : (
                <div className="space-y-4">
                  {releases.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-5 rounded-xl bg-[#0a101f] border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono font-bold text-xs">
                              {rel.tag_name}
                            </span>
                            <h4 className="text-sm font-bold text-white">{rel.name || rel.tag_name}</h4>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Published on {new Date(rel.published_at).toLocaleDateString()}
                          </span>
                        </div>

                        <a
                          href={rel.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-indigo-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
                        >
                          <span>View on GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {rel.body && (
                        <div className="p-3 bg-[#070b16] rounded-lg text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                          {rel.body}
                        </div>
                      )}

                      {rel.zipball_url && (
                        <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                          <a
                            href={rel.zipball_url}
                            className="text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Source code (zip)</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ISSUES VIEW */}
          {viewMode === 'issues' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-semibold text-white">Issues & Pull Requests</span>
                <span className="text-slate-400 font-mono">State: All</span>
              </div>

              {issues.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  No open or closed issues found for this repository.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/70">
                  {issues.map((iss) => (
                    <div key={iss.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              iss.state === 'open'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                                : 'bg-purple-950/80 text-purple-300 border border-purple-800/80'
                            }`}
                          >
                            {iss.state}
                          </span>
                          <a
                            href={iss.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-white hover:text-indigo-400 truncate block"
                          >
                            {iss.title}
                          </a>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>#{iss.number}</span>
                          <span>·</span>
                          <span>opened by {iss.user?.login}</span>
                          <span>·</span>
                          <span>{new Date(iss.created_at).toLocaleDateString()}</span>
                        </div>

                        {iss.labels && iss.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {iss.labels.map((lbl: any) => (
                              <span
                                key={lbl.id}
                                className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300"
                              >
                                {lbl.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <a
                        href={iss.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-white shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONTRIBUTORS VIEW */}
          {viewMode === 'contributors' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h4 className="text-sm font-bold text-white">Repository Contributors</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {contributors.map((contr) => (
                  <a
                    key={contr.id}
                    href={contr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#0a101f] border border-slate-800 hover:border-indigo-500 rounded-xl flex items-center gap-3 transition-colors group"
                  >
                    <img
                      src={contr.avatar_url}
                      alt={contr.login}
                      className="w-10 h-10 rounded-xl border border-slate-700 object-cover"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-white group-hover:text-indigo-300 text-xs truncate">
                        @{contr.login}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {contr.contributions} contributions
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* MANIFEST / TECH STACK VIEW */}
          {viewMode === 'manifest' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Package / Dependency Manifest</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExplainWithAi('tech_stack_detection')}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'Analyzing...' : 'AI Stack Breakdown'}</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white rounded-lg"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {aiExplanation && (
                <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-4 text-xs text-indigo-100 whitespace-pre-wrap leading-relaxed">
                  <div className="font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Technology Stack Detection
                  </div>
                  {aiExplanation}
                </div>
              )}

              <pre className="p-4 bg-[#080d19] border border-slate-800 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto">
                <code>{manifestContent}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
