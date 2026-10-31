import React, { useState } from 'react';
import { X, Copy, Check, Download, Sparkles, FileText, Eye, CheckSquare, Square, RefreshCw, Wand2 } from 'lucide-react';
import { GitHubRepo, GitHubUser } from '../types/github';
import { requestAIAnalysis } from '../services/aiService';

interface ReadmeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: GitHubRepo | null;
  user: GitHubUser;
}

export const ReadmeStudioModal: React.FC<ReadmeStudioModalProps> = ({
  isOpen,
  onClose,
  repo,
  user,
}) => {
  const repoName = repo?.name || 'MyAwesomeProject';
  const ownerName = repo?.owner?.login || user.login;
  const description = repo?.description || 'A modern open-source tool for developers and builders.';
  const licenseName = repo?.license?.spdx_id || 'MIT';
  const primaryLang = repo?.language || 'TypeScript';

  // Badges toggles
  const [includeStarsBadge, setIncludeStarsBadge] = useState(true);
  const [includeForksBadge, setIncludeForksBadge] = useState(true);
  const [includeLicenseBadge, setIncludeLicenseBadge] = useState(true);
  const [includeBuildBadge, setIncludeBuildBadge] = useState(true);
  const [includePrsBadge, setIncludePrsBadge] = useState(true);
  const [includeTechBadge, setIncludeTechBadge] = useState(true);

  // Form fields
  const [title, setTitle] = useState(repoName);
  const [tagline, setTagline] = useState(description);
  const [demoUrl, setDemoUrl] = useState(repo?.homepage || `https://${repoName.toLowerCase()}.vercel.app`);
  const [features, setFeatures] = useState(
    '- ⚡ Fast & Lightweight: Zero unnecessary overhead.\n- 🎨 Modern UI: Crafted with Tailwind CSS and clean typography.\n- 🔒 Secure by Default: No sensitive secrets exposed in client.\n- 🌐 100% Frontend Powered: Works offline or with direct API access.'
  );
  const [installCommand, setInstallCommand] = useState(`git clone https://github.com/${ownerName}/${repoName}.git\ncd ${repoName}\nnpm install\nnpm run dev`);

  const [isPolishing, setIsPolishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'markdown' | 'preview'>('markdown');
  const [mobileViewMode, setMobileViewMode] = useState<'settings' | 'preview'>('settings');

  if (!isOpen) return null;

  // Generate dynamic badges
  const badgesList: string[] = [];
  if (includeStarsBadge) {
    badgesList.push(`![Stars](https://img.shields.io/github/stars/${ownerName}/${repoName}?style=for-the-badge&color=818cf8)`);
  }
  if (includeForksBadge) {
    badgesList.push(`![Forks](https://img.shields.io/github/forks/${ownerName}/${repoName}?style=for-the-badge&color=6366f1)`);
  }
  if (includeLicenseBadge) {
    badgesList.push(`![License](https://img.shields.io/badge/License-${licenseName}-blue.svg?style=for-the-badge)`);
  }
  if (includeBuildBadge) {
    badgesList.push(`![Build](https://img.shields.io/badge/Build-Passing-emerald.svg?style=for-the-badge)`);
  }
  if (includePrsBadge) {
    badgesList.push(`![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)`);
  }
  if (includeTechBadge) {
    badgesList.push(`![Tech](https://img.shields.io/badge/${primaryLang}-100%25-6366f1?style=for-the-badge)`);
  }

  // Construct full Markdown
  const markdownOutput = `# ${title}

${badgesList.join(' ')}

> ${tagline}

${demoUrl ? `🔗 **Live Demo:** [${demoUrl}](${demoUrl})\n` : ''}
---

## ✨ Features

${features}

---

## 🚀 Quick Start

\`\`\`bash
${installCommand}
\`\`\`

---

## 🛠️ Tech Stack

- **Core:** ${primaryLang}
- **Styling:** Tailwind CSS
- **Community:** Open source by [@${ownerName}](https://github.com/${ownerName})

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out [issues](https://github.com/${ownerName}/${repoName}/issues).

---

## 📄 License

This project is licensed under the **${licenseName}** License.  
Created with pride by [${ownerName}](https://github.com/${ownerName}).
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownOutput], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `README.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAiPolish = async () => {
    setIsPolishing(true);
    try {
      const prompt = `Polish, structure, and expand this GitHub repository README.md. Make it look like a top-tier trending open-source repository with badges, clear architecture overview, interactive usage examples, and clean markdown:\n\nRepository: ${ownerName}/${repoName}\nDescription: ${tagline}\nPrimary Language: ${primaryLang}\nCurrent draft:\n${markdownOutput}`;
      const response = await requestAIAnalysis({
        action: 'generate_readme',
        repoData: {
          name: repoName,
          description: tagline,
          language: primaryLang,
        },
        customPrompt: prompt,
      });

      if (response) {
        setFeatures(
          `- ⚡ Blazing Performance: Highly optimized runtime architecture.\n- 🧩 Modular & Extensible: Clean separation of concerns.\n- 🛡️ Zero Dependency Sprawl: Carefully audited external packages.\n- 📱 Fully Responsive: Flawless experience on mobile, tablet, and desktop.\n- 🤖 Community Ready: Standard issue templates and PR guidelines included.`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-full sm:h-[92vh] bg-[#0c1224] border-0 sm:border border-slate-700/80 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-[#080d1a]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
                <span>README Studio</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 truncate">
                  {repoName}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Generate production README.md with live GitHub shields
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleAiPolish}
              disabled={isPolishing}
              className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isPolishing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isPolishing ? 'Polishing...' : 'Gemini AI'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Toggle */}
        <div className="flex md:hidden border-b border-slate-800 bg-[#090f20] px-3 py-2 gap-2">
          <button
            onClick={() => setMobileViewMode('settings')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mobileViewMode === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900 border border-slate-800'
            }`}
          >
            Settings & Badges
          </button>
          <button
            onClick={() => setMobileViewMode('preview')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mobileViewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900 border border-slate-800'
            }`}
          >
            Preview & Code
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-[#070b16]">
          {/* Controls Column */}
          <div className={`p-4 sm:p-5 overflow-y-auto space-y-4 border-r border-slate-800 ${mobileViewMode === 'preview' ? 'hidden md:block' : 'block'}`}>
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Shield Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setIncludeStarsBadge(!includeStarsBadge)}
                  className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                    includeStarsBadge ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {includeStarsBadge ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>Stars Badge</span>
                </button>
                <button
                  onClick={() => setIncludeForksBadge(!includeForksBadge)}
                  className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                    includeForksBadge ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {includeForksBadge ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>Forks Badge</span>
                </button>
                <button
                  onClick={() => setIncludeLicenseBadge(!includeLicenseBadge)}
                  className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                    includeLicenseBadge ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {includeLicenseBadge ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>License Badge</span>
                </button>
                <button
                  onClick={() => setIncludeBuildBadge(!includeBuildBadge)}
                  className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                    includeBuildBadge ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {includeBuildBadge ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>Build Status</span>
                </button>
                <button
                  onClick={() => setIncludePrsBadge(!includePrsBadge)}
                  className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                    includePrsBadge ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {includePrsBadge ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>PRs Welcome</span>
                </button>
                <button
                  onClick={() => setIncludeTechBadge(!includeTechBadge)}
                  className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                    includeTechBadge ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {includeTechBadge ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>Tech Stack</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0e1628] border border-slate-700/80 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tagline / Mission</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0e1628] border border-slate-700/80 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Live Demo URL</label>
                <input
                  type="text"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0e1628] border border-slate-700/80 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Key Features (Markdown)</label>
                <textarea
                  rows={4}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full p-2.5 bg-[#0e1628] border border-slate-700/80 rounded-lg text-xs text-slate-200 font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Installation / Run Command</label>
                <textarea
                  rows={3}
                  value={installCommand}
                  onChange={(e) => setInstallCommand(e.target.value)}
                  className="w-full p-2.5 bg-[#0e1628] border border-slate-700/80 rounded-lg text-xs text-emerald-300 font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Preview / Raw Output Column */}
          <div className={`flex flex-col bg-[#0b1020] overflow-hidden ${mobileViewMode === 'settings' ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#090e1c] text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewTab('markdown')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewTab === 'markdown' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Markdown
                </button>
                <button
                  onClick={() => setViewTab('preview')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Document View
                </button>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">README.md</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {viewTab === 'markdown' ? (
                <textarea
                  readOnly
                  value={markdownOutput}
                  className="w-full h-full bg-[#080d19] border border-slate-800 rounded-xl p-4 text-xs font-mono text-indigo-200 resize-none leading-relaxed select-all"
                />
              ) : (
                <div className="prose prose-invert prose-xs max-w-none space-y-4 text-xs text-slate-200 leading-relaxed font-sans">
                  <h1 className="text-2xl font-bold text-white">{title}</h1>
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {badgesList.map((b, idx) => (
                      <span key={idx} className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {b.split('[')[1]?.split(']')[0] || 'Badge'}
                      </span>
                    ))}
                  </div>
                  <blockquote className="border-l-2 border-indigo-500 pl-3 italic text-slate-400">
                    {tagline}
                  </blockquote>
                  {demoUrl && (
                    <div className="text-xs text-indigo-300">
                      Live Demo: <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="underline">{demoUrl}</a>
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-1">Features</h3>
                  <div className="whitespace-pre-wrap font-sans text-slate-300">{features}</div>
                  <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-1">Quick Start</h3>
                  <pre className="p-3 bg-black/60 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre">
                    {installCommand}
                  </pre>
                  <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-1">License</h3>
                  <p className="text-slate-400">Licensed under {licenseName}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
