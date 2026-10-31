import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RefreshCw, Copy, Check, Download, Terminal, Code2, Eye, Sparkles, Layers } from 'lucide-react';
import { GitHubRepo } from '../types/github';

interface CodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: string;
  repo?: GitHubRepo | null;
}

const TEMPLATES = {
  web_widget: {
    name: 'Interactive UI Widget',
    html: `<div class="p-8 max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-xl text-center space-y-4 font-sans text-slate-100">
  <div class="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-xl font-mono text-xl">🚀</div>
  <h2 class="text-2xl font-bold">OpenRepoLens Sandbox</h2>
  <p class="text-xs text-slate-400">Run client-side JavaScript, Tailwind classes, and DOM logic in real time.</p>
  
  <div class="p-4 bg-slate-800 rounded-xl space-y-2">
    <div class="text-xs text-slate-400 font-mono">Counter Value:</div>
    <div id="counter" class="text-3xl font-mono font-bold text-indigo-400">0</div>
  </div>

  <div class="flex gap-2 justify-center">
    <button id="decBtn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold">-1</button>
    <button id="incBtn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold">+1</button>
    <button id="resetBtn" class="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-sm font-semibold">Reset</button>
  </div>
</div>`,
    css: `body {
  margin: 0;
  padding: 24px;
  background-color: #070b16;
  font-family: system-ui, -apple-system, sans-serif;
}`,
    js: `let count = 0;
const counterEl = document.getElementById('counter');
const incBtn = document.getElementById('incBtn');
const decBtn = document.getElementById('decBtn');
const resetBtn = document.getElementById('resetBtn');

console.log('OpenRepoLens Sandbox initialized successfully!');

incBtn.addEventListener('click', () => {
  count++;
  counterEl.textContent = count;
  console.log('Counter incremented to:', count);
});

decBtn.addEventListener('click', () => {
  count--;
  counterEl.textContent = count;
  console.log('Counter decremented to:', count);
});

resetBtn.addEventListener('click', () => {
  count = 0;
  counterEl.textContent = count;
  console.warn('Counter reset to 0');
});`,
  },
  api_fetcher: {
    name: 'GitHub API Live Tester',
    html: `<div class="max-w-lg mx-auto p-6 bg-slate-900 border border-slate-700 rounded-xl font-sans text-slate-100 space-y-4">
  <h3 class="text-lg font-bold text-indigo-400">GitHub Profile Query Sandbox</h3>
  <div class="flex gap-2">
    <input id="userInp" value="DevContributionCommunity" class="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white" />
    <button id="fetchBtn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg">Fetch</button>
  </div>
  <div id="output" class="p-3 bg-black/60 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto min-h-[100px]">
    Click Fetch to query GitHub REST API...
  </div>
</div>`,
    css: `body { margin: 0; padding: 20px; background: #0b1020; }`,
    js: `const btn = document.getElementById('fetchBtn');
const inp = document.getElementById('userInp');
const out = document.getElementById('output');

btn.addEventListener('click', async () => {
  const user = inp.value.trim();
  out.textContent = 'Loading @' + user + '...';
  console.log('Fetching GitHub API for:', user);
  try {
    const res = await fetch('https://api.github.com/users/' + user);
    const data = await res.json();
    out.textContent = JSON.stringify({
      login: data.login,
      name: data.name,
      public_repos: data.public_repos,
      followers: data.followers,
      bio: data.bio
    }, null, 2);
    console.log('Fetch successful for:', data.login);
  } catch(e) {
    out.textContent = 'Error: ' + e.message;
    console.error('Fetch failed:', e);
  }
});`,
  },
  algorithm_runner: {
    name: 'Algorithm Benchmarker',
    html: `<div class="max-w-lg mx-auto p-6 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-sans space-y-4">
  <h3 class="text-lg font-bold text-emerald-400">Fibonacci & Benchmark Runner</h3>
  <p class="text-xs text-slate-400">Tests JavaScript execution speed in browser isolate.</p>
  <button id="runBtn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg">Run Benchmark (N=35)</button>
  <div id="benchLog" class="p-3 bg-black/60 rounded-lg text-xs font-mono text-slate-300">Ready to compute...</div>
</div>`,
    css: `body { margin: 0; padding: 20px; background: #070b16; }`,
    js: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

document.getElementById('runBtn').addEventListener('click', () => {
  const logEl = document.getElementById('benchLog');
  logEl.textContent = 'Computing fib(35)...';
  console.log('Starting Fibonacci benchmark...');
  const t0 = performance.now();
  const val = fib(35);
  const t1 = performance.now();
  const dur = (t1 - t0).toFixed(2);
  logEl.innerHTML = 'Result: <b>' + val + '</b><br>Time Taken: <b>' + dur + ' ms</b>';
  console.log('Completed in ' + dur + 'ms with result:', val);
});`,
  },
};

export const CodeSandboxModal: React.FC<CodeSandboxModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  initialLanguage,
  repo,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlCode, setHtmlCode] = useState(TEMPLATES.web_widget.html);
  const [cssCode, setCssCode] = useState(TEMPLATES.web_widget.css);
  const [jsCode, setJsCode] = useState(TEMPLATES.web_widget.js);
  const [logs, setLogs] = useState<Array<{ type: 'log' | 'warn' | 'error'; message: string; time: string }>>([]);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'preview'>('split');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load custom code if provided
  useEffect(() => {
    if (!isOpen) return;

    if (initialCode) {
      if (initialLanguage === 'css') {
        setCssCode(initialCode);
        setActiveCodeTab('css');
      } else if (initialLanguage === 'javascript' || initialLanguage === 'typescript') {
        setJsCode(initialCode);
        setActiveCodeTab('js');
      } else {
        setHtmlCode(initialCode);
        setActiveCodeTab('html');
      }
    }
  }, [isOpen, initialCode, initialLanguage]);

  // Run the sandbox inside iframe
  const runCode = () => {
    if (!iframeRef.current) return;

    // Listen for iframe console messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'openrepolens-sandbox-console') {
        const time = new Date().toLocaleTimeString();
        setLogs((prev) => [
          ...prev.slice(-30),
          { type: event.data.type, message: event.data.args.join(' '), time },
        ]);
      }
    };

    window.removeEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);

    const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${cssCode}</style>
  <script>
    (function() {
      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;

      function post(type, args) {
        window.parent.postMessage({
          source: 'openrepolens-sandbox-console',
          type: type,
          args: Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a))
        }, '*');
      }

      console.log = function(...args) { post('log', args); origLog.apply(console, args); };
      console.warn = function(...args) { post('warn', args); origWarn.apply(console, args); };
      console.error = function(...args) { post('error', args); origError.apply(console, args); };

      window.onerror = function(msg, url, line) {
        post('error', ['Error on line ' + line + ': ' + msg]);
      };
    })();
  </script>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch(err) {
      console.error('Runtime error:', err.message);
    }
  </script>
</body>
</html>`;

    iframeRef.current.srcdoc = doc;
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        runCode();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, htmlCode, cssCode, jsCode]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const combined = `<!-- OpenRepoLens Sandbox Export -->\n<style>\n${cssCode}\n</style>\n${htmlCode}\n<script>\n${jsCode}\n</script>`;
    navigator.clipboard.writeText(combined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>OpenRepoLens Sandbox Export</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${cssCode}</style>
</head>
<body>
${htmlCode}
<script>
${jsCode}
</script>
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openrepolens-sandbox-${repo?.name || 'project'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadTemplate = (key: keyof typeof TEMPLATES) => {
    const t = TEMPLATES[key];
    setHtmlCode(t.html);
    setCssCode(t.css);
    setJsCode(t.js);
    setLogs([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-full sm:h-[92vh] bg-[#0c1224] border-0 sm:border border-slate-700/80 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-800 bg-[#080d1a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>In-Browser Code Playground & Runner</span>
                {repo && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                    {repo.name}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">
                Interactive real-time HTML, Tailwind CSS, & JavaScript environment with in-app console logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runCode}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="Re-run code"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Copy all code to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Download standalone HTML file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Template presets */}
        <div className="px-4 sm:px-5 py-2 border-b border-slate-800 bg-[#0a1020] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none py-0.5">
            <span className="text-slate-400 text-[11px] mr-1 font-medium shrink-0">Presets:</span>
            <button
              onClick={() => loadTemplate('web_widget')}
              className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
            >
              Interactive Counter
            </button>
            <button
              onClick={() => loadTemplate('api_fetcher')}
              className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
            >
              GitHub API Tester
            </button>
            <button
              onClick={() => loadTemplate('algorithm_runner')}
              className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
            >
              Algorithm Runner
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Code Only
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Preview Only
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-[#070b16]">
          {/* Editor Column */}
          {(viewMode === 'split' || viewMode === 'code') && (
            <div className={`flex flex-col border-r border-slate-800 ${viewMode === 'code' ? 'col-span-2' : ''}`}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#090e1c]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveCodeTab('html')}
                    className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                      activeCodeTab === 'html'
                        ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('css')}
                    className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                      activeCodeTab === 'css'
                        ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    CSS
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('js')}
                    className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                      activeCodeTab === 'js'
                        ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    JavaScript
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Tailwind CSS enabled</span>
              </div>

              <div className="flex-1 p-3">
                {activeCodeTab === 'html' && (
                  <textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full bg-[#080d19] border border-slate-800 rounded-lg p-3 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    placeholder="<!-- Write HTML and Tailwind classes here -->"
                  />
                )}
                {activeCodeTab === 'css' && (
                  <textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full bg-[#080d19] border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    placeholder="/* Custom CSS */"
                  />
                )}
                {activeCodeTab === 'js' && (
                  <textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full bg-[#080d19] border border-slate-800 rounded-lg p-3 text-xs font-mono text-amber-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    placeholder="// JavaScript code"
                  />
                )}
              </div>
            </div>
          )}

          {/* Live Preview & Console Output Column */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className={`flex flex-col bg-[#0b1020] ${viewMode === 'preview' ? 'col-span-2' : ''}`}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#090e1c] text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real-time Sandbox Preview</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">Active</span>
              </div>

              <div className="flex-1 bg-white relative">
                <iframe
                  ref={iframeRef}
                  title="code-sandbox-runner"
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-modals allow-same-origin"
                />
              </div>

              {/* Console Logger Drawer */}
              <div className="h-40 border-t border-slate-800 bg-[#070b16] flex flex-col">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80 bg-[#090d19] text-[11px]">
                  <span className="text-slate-400 font-mono flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span>Console Output ({logs.length})</span>
                  </span>
                  <button
                    onClick={() => setLogs([])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Clear logs
                  </button>
                </div>
                <div className="flex-1 p-2.5 overflow-y-auto font-mono text-xs space-y-1">
                  {logs.length === 0 ? (
                    <div className="text-slate-600 text-[11px] italic">Console is clear. console.log calls will appear here.</div>
                  ) : (
                    logs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`text-[11px] leading-relaxed flex items-start gap-2 ${
                          log.type === 'error'
                            ? 'text-rose-400'
                            : log.type === 'warn'
                            ? 'text-amber-300'
                            : 'text-emerald-300'
                        }`}
                      >
                        <span className="text-slate-600 text-[10px] shrink-0">[{log.time}]</span>
                        <span className="font-semibold shrink-0 uppercase text-[9px] px-1 rounded bg-slate-800">
                          {log.type}
                        </span>
                        <span className="break-all">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
