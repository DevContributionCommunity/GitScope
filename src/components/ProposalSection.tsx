import React, { useState } from 'react';
import {
  ExternalLink,
  Mail,
  Youtube,
  Instagram,
  Github,
  CheckCircle,
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Layers,
  Send,
} from 'lucide-react';

export const ProposalSection: React.FC = () => {
  const [vote, setVote] = useState<'GO' | 'IMPROVE' | 'STOP' | null>(() => {
    try {
      return (localStorage.getItem('openrepolens_vote') as any) || null;
    } catch {
      return null;
    }
  });

  const [voteCounts, setVoteCounts] = useState<{ GO: number; IMPROVE: number; STOP: number }>(() => {
    try {
      const stored = localStorage.getItem('openrepolens_vote_counts');
      return stored ? JSON.parse(stored) : { GO: 142, IMPROVE: 38, STOP: 6 };
    } catch {
      return { GO: 142, IMPROVE: 38, STOP: 6 };
    }
  });

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleVote = (decision: 'GO' | 'IMPROVE' | 'STOP') => {
    if (vote === decision) return;
    const updated = { ...voteCounts };
    if (vote) {
      updated[vote] = Math.max(0, updated[vote] - 1);
    }
    updated[decision] = updated[decision] + 1;
    setVote(decision);
    setVoteCounts(updated);
    try {
      localStorage.setItem('openrepolens_vote', decision);
      localStorage.setItem('openrepolens_vote_counts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    // Pre-fill email or save
    const mailto = `mailto:devcontributioncommunity@gmail.com?subject=OpenRepoLens%20Project%20Feedback&body=${encodeURIComponent(
      feedbackText
    )}`;
    window.open(mailto, '_blank');
    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto">
      {/* Hero Proposal Banner */}
      <div className="text-center space-y-4">
        <div className="inline-block text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full">
          DevContributionCommunity Presents
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          OpenRepoLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">Project Proposal</span>
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
          Discover. Explore. Understand. All Public GitHub Repositories in One Place. 100% Frontend · Free & Open Source · Community Driven.
        </p>
      </div>

      {/* Overview & Main Idea Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">01. What is OpenRepoLens?</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            OpenRepoLens is a free and open-source web platform designed to help anyone explore all public repositories of any GitHub developer from a single dashboard. Users simply enter a GitHub username and scan the profile. The platform automatically discovers public repositories and displays their source code, project structure, README, programming languages, and live deployment links.
          </p>
        </div>

        <div className="bg-[#141d33] border border-slate-700/80 rounded-xl p-4 sm:p-5 text-sm text-indigo-200 space-y-1">
          <strong className="text-white block font-semibold">Core Workflow:</strong>
          <p className="text-slate-300">
            Enter a username → Scan → Explore all public projects → View source code & commits → Open live deployed versions.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
            <span>✓ No mandatory account creation</span>
            <span>·</span>
            <span>✓ No custom backend servers</span>
            <span>·</span>
            <span>✓ No server-side database</span>
          </div>
        </div>
      </div>

      {/* Community Decision Voting (Section 15 of document) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">Should We Actually Build This Project?</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Before starting long-term development, we want honest opinions from developers and open source contributors. Cast your community vote:
          </p>
        </div>

        {/* Voting Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleVote('GO')}
            className={`p-5 rounded-xl border text-left transition-all ${
              vote === 'GO'
                ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30'
                : 'bg-[#141d33] border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-emerald-400">GO</span>
              <span className="font-mono text-xs tabular-nums text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded">
                {voteCounts.GO} votes
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Start full development immediately. Genuine developer demand exists and the frontend architecture is practical.
            </p>
          </button>

          <button
            onClick={() => handleVote('IMPROVE')}
            className={`p-5 rounded-xl border text-left transition-all ${
              vote === 'IMPROVE'
                ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-[#141d33] border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-amber-400">IMPROVE</span>
              <span className="font-mono text-xs tabular-nums text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded">
                {voteCounts.IMPROVE} votes
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Improve the feature set and community architecture based on contributor feedback before final release.
            </p>
          </button>

          <button
            onClick={() => handleVote('STOP')}
            className={`p-5 rounded-xl border text-left transition-all ${
              vote === 'STOP'
                ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/30'
                : 'bg-[#141d33] border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-rose-400">STOP</span>
              <span className="font-mono text-xs tabular-nums text-rose-300 font-bold bg-rose-950/80 px-2 py-0.5 rounded">
                {voteCounts.STOP} votes
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Do not build it if existing GitHub profile tools already solve the problem sufficiently.
            </p>
          </button>
        </div>

        {vote && (
          <div className="text-center text-xs text-emerald-400 font-medium pt-1">
            ✓ Your vote for <strong>{vote}</strong> has been recorded! Thank you for participating.
          </div>
        )}
      </div>

      {/* Community Links & Direct Feedback (Section 13 of document) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white">Share Your Opinion Directly</h3>
          <p className="text-xs text-slate-400 mt-1">
            Connect with DevContributionCommunity across all official community channels
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="https://github.com/DevContributionCommunity"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-xl bg-[#141d33] border border-slate-700/80 hover:border-indigo-500 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Github className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">GitHub</h4>
              <p className="text-xs text-slate-400">
                Discuss the proposal, suggest features, report issues, and star the repo.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
              <span>Visit GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="https://www.instagram.com/DevContributionCommunity/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-xl bg-[#141d33] border border-slate-700/80 hover:border-pink-500 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-pink-300">Instagram</h4>
              <p className="text-xs text-slate-400">
                Share your feedback, community updates, and project opinions.
              </p>
            </div>
            <span className="text-xs font-semibold text-pink-400 flex items-center gap-1">
              <span>Visit Instagram</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="https://www.youtube.com/@DevContributionCommunity"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-xl bg-[#141d33] border border-slate-700/80 hover:border-rose-500 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Youtube className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-rose-300">YouTube</h4>
              <p className="text-xs text-slate-400">
                Watch development sessions, project walkthroughs, and tutorials.
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
              <span>Visit YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="mailto:devcontributioncommunity@gmail.com?subject=OpenRepoLens%20Project%20Feedback"
            className="p-5 rounded-xl bg-[#141d33] border border-slate-700/80 hover:border-emerald-500 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">Gmail</h4>
              <p className="text-xs text-slate-400">
                Send technical suggestions, architecture critiques, and direct inquiries.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>Send Email</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </div>

        {/* Feedback Message Form */}
        <form onSubmit={handleSendFeedback} className="pt-4 border-t border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Send Quick Feedback to the Core Community Maintainers:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What feature would you love to see or what would make OpenRepoLens 10x better?"
              className="flex-1 px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!feedbackText.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Feedback</span>
            </button>
          </div>
          {feedbackSent && (
            <p className="text-xs text-emerald-400">
              ✓ Email draft opened to devcontributioncommunity@gmail.com!
            </p>
          )}
        </form>
      </div>

      {/* Questions for Developers (Section 14 of document) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-xl font-bold text-white">10 Core Questions for Developers</h3>
        <p className="text-xs text-slate-400">
          Your genuine critique matters more than simply supporting the idea:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
          {[
            '1. Is this platform actually useful for your daily workflow?',
            '2. Would you use a tool like this to audit new dependencies or developers?',
            '3. Are existing alternatives (GitHub web, Octotree) already sufficient?',
            '4. Is a 100% frontend-only client architecture practical long term?',
            '5. Should source code and branches remain viewable inside the platform?',
            '6. Is automatic live deployment link detection high value for you?',
            '7. Are Gemini and AI explanations genuinely helpful for repos?',
            '8. Which features should be prioritized or pruned?',
            '9. What API rate limit challenges or bottlenecks do you foresee?',
            '10. Would you contribute code or documentation to this open project?',
          ].map((q, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#141d33] border border-slate-800">
              {q}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
