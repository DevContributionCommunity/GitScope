import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, AlertCircle, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';
import { checkRateLimit, getStoredToken, saveStoredToken } from '../services/githubApi';
import { GitHubRateLimit } from '../types/github';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenUpdated: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose, onTokenUpdated }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<GitHubRateLimit | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredToken();
      setTokenInput(current);
      setError(null);
      if (current) {
        testToken(current);
      } else {
        setSuccessInfo(null);
      }
    }
  }, [isOpen]);

  const testToken = async (tokenToTest: string) => {
    setLoading(true);
    setError(null);
    try {
      const rate = await checkRateLimit(tokenToTest);
      setSuccessInfo(rate);
    } catch (err: any) {
      setError(err.message || 'Token verification failed. Check if token is valid.');
      setSuccessInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      saveStoredToken('');
      onTokenUpdated();
      onClose();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rate = await checkRateLimit(tokenInput.trim());
      saveStoredToken(tokenInput.trim());
      setSuccessInfo(rate);
      onTokenUpdated();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError('Invalid token or GitHub rejected authorization: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    saveStoredToken('');
    setTokenInput('');
    setSuccessInfo(null);
    setError(null);
    onTokenUpdated();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e1628] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0a101f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">GitHub API Authentication</h3>
              <p className="text-xs text-slate-400">Increase rate limits from 60/hr to 5,000/hr</p>
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
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Personal Access Token (Classic or Fine-grained)
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_xxxx"
              className="w-full px-3.5 py-2.5 text-sm bg-[#070b16] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
            <p className="text-[12px] text-slate-400">
              Token is kept only in your browser's <span className="font-mono text-slate-300">localStorage</span> and never stored on any server.
            </p>
          </div>

          {/* Rate limit status display */}
          {successInfo && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Authenticated GitHub Session
                </span>
                <span className="font-mono tabular-nums text-emerald-200">
                  {successInfo.remaining} / {successInfo.limit} requests left
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/80">
                Resets at {new Date(successInfo.reset * 1000).toLocaleTimeString()}
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Guide box */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-200">How to get a free read-only token:</span>
              <a
                href="https://github.com/settings/tokens?type=beta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
              >
                <span>GitHub Settings</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
              <li>Visit GitHub Developer Settings → Personal Access Tokens.</li>
              <li>Generate a new token with public read access (no write scope needed).</li>
              <li>Paste here to enjoy fast, unthrottled scanning of large repositories!</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {tokenInput ? (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Token</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Validating...' : 'Save & Verify'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
