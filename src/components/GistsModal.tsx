import React, { useState, useEffect } from 'react';
import {
  X,
  FileCode2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Calendar,
} from 'lucide-react';
import { fetchUserGists } from '../services/githubApi';

interface GistsModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

export const GistsModal: React.FC<GistsModalProps> = ({
  username,
  isOpen,
  onClose,
}) => {
  const [gists, setGists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && username) {
      loadGists();
    }
  }, [isOpen, username]);

  const loadGists = async () => {
    setLoading(true);
    try {
      const data = await fetchUserGists(username);
      setGists(data);
    } catch {
      setGists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-[85vh] bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#080d19] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Public Gists & Snippets</span>
                <span className="text-xs font-mono text-indigo-400">@{username}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Single-file utilities, scripts, configuration recipes, and code snippets
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-xs">Fetching public gists...</span>
            </div>
          ) : gists.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <FileCode2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300">No public gists found.</p>
              <p className="text-xs text-slate-500">This developer hasn't published any public gists yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gists.map((g) => {
                const files = Object.values(g.files || {}) as any[];
                const firstFile = files[0];

                return (
                  <div
                    key={g.id}
                    className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono">
                          {firstFile?.filename || 'snippet'}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          {g.description || 'No description provided'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopyUrl(g.html_url, g.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700"
                        >
                          {copiedId === g.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === g.id ? 'Copied' : 'Copy Link'}</span>
                        </button>

                        <a
                          href={g.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                      {firstFile?.language && (
                        <span className="text-indigo-400">{firstFile.language}</span>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(g.created_at).toLocaleDateString()}</span>
                      </span>
                      <span>·</span>
                      <span>{files.length} file{files.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
