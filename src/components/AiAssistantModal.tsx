import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Lightbulb,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { GitHubRepo } from '../types/github';
import { requestAIAnalysis } from '../services/aiService';

interface AiAssistantModalProps {
  repo: GitHubRepo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  repo,
  isOpen,
  onClose,
}) => {
  const [activeAction, setActiveAction] = useState<
    'summarize_repo' | 'security_audit' | 'generate_readme' | 'tech_stack_detection' | 'custom'
  >('summarize_repo');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !repo) return null;

  const handleGenerate = async (action = activeAction) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestAIAnalysis({
        action,
        repoData: {
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          open_issues_count: repo.open_issues_count,
          topics: repo.topics,
          license: repo.license,
          archived: repo.archived,
          owner: { login: repo.owner.login } as any,
        },
        customPrompt: action === 'custom' ? customPrompt : undefined,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'AI generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#080d19] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Repository Intelligence</span>
                <span className="text-xs font-mono font-normal text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Architectural breakdown, security auditing, and tech stack analysis for <strong className="text-white">{repo.name}</strong>
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

        {/* Action Tabs Bar */}
        <div className="px-6 py-3 bg-[#0a101f] border-b border-slate-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveAction('summarize_repo');
              handleGenerate('summarize_repo');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAction === 'summarize_repo'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Architecture & Health</span>
          </button>

          <button
            onClick={() => {
              setActiveAction('security_audit');
              handleGenerate('security_audit');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAction === 'security_audit'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Security & Hygiene Audit</span>
          </button>

          <button
            onClick={() => {
              setActiveAction('generate_readme');
              handleGenerate('generate_readme');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAction === 'generate_readme'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Generate README.md</span>
          </button>

          <button
            onClick={() => {
              setActiveAction('tech_stack_detection');
              handleGenerate('tech_stack_detection');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAction === 'tech_stack_detection'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tech Stack Detection</span>
          </button>

          <button
            onClick={() => setActiveAction('custom')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeAction === 'custom'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Custom Prompt</span>
          </button>
        </div>

        {/* Custom prompt input if selected */}
        {activeAction === 'custom' && (
          <div className="px-6 py-3 bg-[#0d1424] border-b border-slate-800 flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. How does this repository handle state management and caching?"
              className="flex-1 px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleGenerate('custom')}
              disabled={loading || !customPrompt.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Ask
            </button>
          </div>
        )}

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans text-sm text-slate-200">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-xs">Analyzing repository with Gemini 3.8 Flash...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Generated Analysis
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Output'}</span>
                </button>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-slate-200 font-sans text-sm">
                {result}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <p>Click any analysis tab above to run instant Gemini insights on this repository.</p>
              <button
                onClick={() => handleGenerate('summarize_repo')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Run Architecture & Health Summary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
