import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Share2, ExternalLink, Smartphone, Download } from 'lucide-react';
import { GitHubUser, GitHubRepo } from '../types/github';

interface ShareQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: GitHubUser;
  repo?: GitHubRepo | null;
}

export const ShareQrModal: React.FC<ShareQrModalProps> = ({
  isOpen,
  onClose,
  user,
  repo,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState<number>(220);

  if (!isOpen) return null;

  const currentUrl = repo
    ? repo.html_url
    : window.location.href.split('?')[0] + `?user=${encodeURIComponent(user.login)}`;

  const targetTitle = repo ? `${repo.name} by @${user.login}` : `@${user.login} on OpenRepoLens`;
  const targetDesc = repo
    ? repo.description || 'Public GitHub repository explored on OpenRepoLens'
    : user.bio || `Explore all ${user.public_repos} public repositories of @${user.login} on OpenRepoLens`;

  // QR Code URL using high-availability QR image service
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=090e1c&color=818cf8&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: targetTitle,
          text: targetDesc,
          url: currentUrl,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c1224] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#080d1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Scan & Share on Mobile</span>
              </h2>
              <p className="text-xs text-slate-400">
                Instantly scan with any smartphone camera
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center space-y-5">
          {/* Target Info */}
          <div className="w-full text-center space-y-1">
            <h3 className="text-sm font-bold text-white truncate px-2">{targetTitle}</h3>
            <p className="text-xs text-slate-400 line-clamp-2 px-2">{targetDesc}</p>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-[#090e1c] rounded-2xl border border-indigo-500/40 shadow-xl relative group">
            <img
              src={qrImageUrl}
              alt="Scan QR Code"
              className="w-52 h-52 sm:w-56 sm:h-56 rounded-xl object-contain bg-[#090e1c]"
              loading="eager"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
              <span className="text-xs font-mono font-medium text-white px-3 py-1.5 rounded-lg bg-indigo-600/90 shadow">
                Point Camera to Scan
              </span>
            </div>
          </div>

          {/* Device scanning prompt */}
          <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/60 px-3 py-2 rounded-xl text-center">
            <Smartphone className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Open phone camera or QR scanner to inspect this developer profile on mobile</span>
          </div>

          {/* Direct Link Input */}
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full px-3 py-2 bg-[#090d19] border border-slate-700/80 rounded-xl text-xs font-mono text-slate-300 select-all focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                title="Copy shareable URL"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 w-full pt-1">
              <button
                onClick={handleNativeShare}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Share via App</span>
              </button>
              <a
                href={qrImageUrl}
                download={`${user.login}-qr.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors shrink-0"
                title="Download QR code image"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
