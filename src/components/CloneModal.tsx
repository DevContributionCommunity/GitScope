import React, { useState } from 'react';
import {
  X,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Download,
  Laptop,
} from 'lucide-react';
import { GitHubRepo } from '../types/github';

interface CloneModalProps {
  repo: GitHubRepo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CloneModal: React.FC<CloneModalProps> = ({ repo, isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !repo) return null;

  const cloneCommands = [
    {
      label: 'HTTPS Clone',
      cmd: `git clone ${repo.html_url}.git`,
      key: 'https',
    },
    {
      label: 'Fast Shallow Clone (Depth 1)',
      cmd: `git clone --depth 1 ${repo.html_url}.git`,
      key: 'shallow',
    },
    {
      label: 'GitHub CLI (gh)',
      cmd: `gh repo clone ${repo.full_name}`,
      key: 'gh',
    },
    {
      label: 'npx degit (Clone without .git folder)',
      cmd: `npx degit ${repo.full_name} ${repo.name}-app`,
      key: 'degit',
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const webEditorUrl = `https://github.dev/${repo.full_name}`;
  const zipDownloadUrl = `https://github.com/${repo.full_name}/archive/refs/heads/${repo.default_branch}.zip`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#080d19] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clone & Developer Commands</h3>
              <p className="text-xs text-slate-400">{repo.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick Launch Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={webEditorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-indigo-500 transition-all flex items-center justify-between text-xs text-slate-200 group"
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold group-hover:text-indigo-300">Launch in github.dev</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            <a
              href={zipDownloadUrl}
              className="p-3 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-emerald-500 transition-all flex items-center justify-between text-xs text-slate-200 group"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold group-hover:text-emerald-300">Download ZIP Archive</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>

          {/* Copy-paste CLI commands */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              CLI & Terminal Commands
            </span>

            {cloneCommands.map((c) => (
              <div key={c.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{c.label}</span>
                  <button
                    onClick={() => handleCopy(c.cmd, c.key)}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedKey === c.key ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedKey === c.key ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-[#070b16] border border-slate-800 text-xs font-mono text-slate-300 select-all overflow-x-auto">
                  {c.cmd}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
