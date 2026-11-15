import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  GitBranch,
  Terminal,
  Activity,
  Server,
  Code2,
  Copy,
  Check,
  X,
  Play,
  Github,
  Layers,
  Shield,
  Send,
  Download
} from 'lucide-react';
import { sounds } from '../utils/sounds';

interface DevIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevIntegrationsModal: React.FC<DevIntegrationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'api' | 'vscode' | 'github' | 'monitoring' | 'audit'>('api');
  const [copied, setCopied] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('/api/prompt/execute');
  const [apiPayload, setApiPayload] = useState(
    JSON.stringify(
      {
        prompt: 'Solve Two Sum in O(N) using single pass hash map with the 7 canonical DSA sections',
        problemTitle: 'Two Sum',
        language: 'typescript',
        mode: 'solve',
      },
      null,
      2
    )
  );

  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isCallingApi, setIsCallingApi] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    sounds.playPop(520);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestApi = async () => {
    setIsCallingApi(true);
    sounds.playPop(480);
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: apiPayload,
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
      sounds.playSuccess();
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsCallingApi(false);
    }
  };

  const vsCodeSnippet = `{
  "7-Section DSA Prompt": {
    "prefix": "dsa7",
    "body": [
      "Solve the DSA question \\"\${1:ProblemTitle}\\" strictly using the 7-section format:",
      "1. Restating the problem: Clarify input, output, constraints, and objective.",
      "2. Naming the technique: Specify algorithmic technique (e.g. Dynamic Programming, Two Pointers).",
      "3. Key observations: Invariants, monotonicity, or structural subproblems.",
      "4. The algorithm: Step-by-step procedural logic without code syntax.",
      "5. Correctness arguments: Loop invariant proof why this never fails.",
      "6. Complexity analyses: Big-O worst-case Time & Space derivation.",
      "7. Potential pitfalls: Overflow, empty arrays, duplicate values, edge traps."
    ],
    "description": "Inserts the canonical PromptCode 7-Section DSA Prompt standard"
  }
}`;

  const githubActionsYaml = `name: PromptCode Quality
on: [push, pull_request, workflow_dispatch]
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - run: npm audit --audit-level=high
      - run: npm run secret-scan`;

  const auditLogs = [
    { id: 1, action: 'PROMPT_EXECUTE', user: 'Driver (User)', time: '2 mins ago', status: 'SUCCESS_200', details: 'Two Sum 7-Section breakdown' },
    { id: 2, action: 'CODE_REVIEW', user: 'Sarah Jenkins', time: '8 mins ago', status: 'APPROVED', details: 'Interactive review score: 92/100' },
    { id: 3, action: 'RATE_LIMITER_CHECK', user: 'System Worker', time: '14 mins ago', status: 'BURST_ALLOWED', details: 'Capacity=5, refillRate=2 tok/s' },
    { id: 4, action: 'CUSTOM_IMPORT', user: 'Driver (User)', time: '22 mins ago', status: 'SAVED', details: 'Trapping Rain Water (Hard)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl max-h-[88vh] bg-[#0c101d] border border-[#1e2a47] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#172033] bg-[#090d18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <GitBranch className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-sans">
                  Developer Integrations & Infrastructure Suite
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Repository tools
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Local VS Code extension and GitHub Actions checks, plus the API console.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playPop(420);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-6 mt-3 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-xs text-amber-200">
          The repository includes a local VS Code extension and quality/security workflow. Telemetry and audit tabs below are sample previews; the API console sends a real request to this server.
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-[#172033] bg-[#0b0f19] text-xs overflow-x-auto">
          <button
            onClick={() => {
              sounds.playPop(480);
              setActiveTab('api');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'api' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Public API Console</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(500);
              setActiveTab('vscode');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vscode' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>VS Code Extension</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(520);
              setActiveTab('github');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'github' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub CI/CD</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(540);
              setActiveTab('monitoring');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'monitoring' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Telemetry</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(560);
              setActiveTab('audit');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audit' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit Logs</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 select-text">
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 bg-purple-950/60 text-purple-300 border border-purple-500/40 rounded-lg">
                  POST
                </span>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="flex-1 bg-[#080c16] border border-[#1e2a47] rounded-xl px-3 py-1.5 text-xs font-mono text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestApi}
                  disabled={isCallingApi}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{isCallingApi ? 'Dispatching...' : 'Send Request'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 mb-1">Request Payload (JSON):</div>
                  <textarea
                    value={apiPayload}
                    onChange={(e) => setApiPayload(e.target.value)}
                    rows={10}
                    className="w-full bg-[#080c16] border border-[#1c2946] rounded-xl p-3 text-xs font-mono text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-400 mb-1">Response Inspector:</div>
                  <div className="w-full h-[224px] bg-[#060a14] border border-[#1c2946] rounded-xl p-3 text-xs font-mono text-emerald-300 overflow-y-auto">
                    {apiResponse ? (
                      <pre>{apiResponse}</pre>
                    ) : (
                      <span className="text-slate-600">Click "Send Request" to test endpoint live...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vscode' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">PromptCode VS Code Extension</h3>
                  <p className="text-[11px] text-slate-400">
                    Open <code>integrations/vscode-promptcode</code> in VS Code and press <code>F5</code>. The extension drafts prompts locally and never uploads selected source.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(vsCodeSnippet)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Snippet</span>
                </button>
              </div>

              <div className="relative rounded-xl bg-[#080c16] border border-[#1c2946] p-4 font-mono text-xs text-slate-200">
                <pre className="overflow-x-auto leading-relaxed">{vsCodeSnippet}</pre>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">GitHub Actions Automated CI/CD Workflow</h3>
                  <p className="text-[11px] text-slate-400">
                    The repository already includes <code>.github/workflows/quality.yml</code>. This preview shows the core checks; the committed workflow also scans dependencies and secrets with read-only permissions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(githubActionsYaml)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Workflow YAML</span>
                </button>
              </div>

              <div className="relative rounded-xl bg-[#080c16] border border-[#1c2946] p-4 font-mono text-xs text-slate-200">
                <pre className="overflow-x-auto leading-relaxed">{githubActionsYaml}</pre>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#090e1c] border border-[#1b2640] text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Status</div>
                  <div className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>HEALTHY</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Port 3000 Node / Express</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090e1c] border border-[#1b2640] text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Latency</div>
                  <div className="text-xl font-bold text-white">42ms</div>
                  <div className="text-[10px] text-emerald-400">Sub-second local bridge</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090e1c] border border-[#1b2640] text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tokens Cached</div>
                  <div className="text-xl font-bold text-purple-400">142,800</div>
                  <div className="text-[10px] text-slate-500">Redis cache simulator</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090e1c] border border-[#1b2640] text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Error Rate</div>
                  <div className="text-xl font-bold text-emerald-400">0.00%</div>
                  <div className="text-[10px] text-slate-500">Zero active faults</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-white">Immutable Security Audit Trail</div>

              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#090e1c] border border-[#18233a] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.action}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {log.status}
                        </span>
                        <span className="text-[10px] text-slate-500">{log.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{log.details}</p>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">{log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
