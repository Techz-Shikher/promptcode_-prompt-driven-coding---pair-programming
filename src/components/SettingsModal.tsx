import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  X,
  Check,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  Cpu,
  Code2,
  Sliders,
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../utils/sounds';

export interface AppSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  fontFamily: 'JetBrains Mono' | 'Fira Code' | 'Menlo';
  defaultModel: string;
  temperature: number;
  promptStrictness: 'strict_7_section' | 'concise' | 'flexible';
  soundEnabled: boolean;
  soundVolume: number;
  confettiEnabled: boolean;
}

const SETTINGS_STORAGE_KEY = 'promptcode_user_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  fontFamily: 'JetBrains Mono',
  defaultModel: 'gemini-3.8-flash',
  temperature: 0.2,
  promptStrictness: 'strict_7_section',
  soundEnabled: true,
  soundVolume: 80,
  confettiEnabled: true,
};

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // no-op
  }
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'ai' | 'prompt' | 'audio'>('editor');
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadStoredSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    sounds.playPop(520);
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveStoredSettings(updated);
    if (onSettingsChanged) onSettingsChanged(updated);

    if (key === 'soundEnabled') {
      sounds.enabled = value as boolean;
    }

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1500);
  };

  const handleResetDefaults = () => {
    sounds.playPop(440);
    setSettings(DEFAULT_SETTINGS);
    saveStoredSettings(DEFAULT_SETTINGS);
    sounds.enabled = DEFAULT_SETTINGS.soundEnabled;
    if (onSettingsChanged) onSettingsChanged(DEFAULT_SETTINGS);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl max-h-[88vh] bg-[#0c101d] border border-[#1e2a47] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#172033] bg-[#090d18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-sans">
                  PromptCode IDE Preferences & Settings
                </h2>
                {savedFeedback && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Configure editor typography, AI generation strictness, default foundation model, and audio FX.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-2.5 py-1.5 rounded-lg bg-[#141d33] hover:bg-[#1d2a4a] text-slate-300 text-xs font-semibold border border-[#23355a] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset all settings to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

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
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-[#172033] bg-[#0b0f19] text-xs">
          <button
            onClick={() => {
              sounds.playPop(480);
              setActiveTab('editor');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'editor' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Editor</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(500);
              setActiveTab('ai');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Model & Generation</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(520);
              setActiveTab('prompt');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'prompt' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>7-Section DSA Strictness</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(540);
              setActiveTab('audio');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'audio' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audio & FX</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 select-text">
          {/* TAB 1: CODE EDITOR */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#090e1c] border border-[#1b2640] space-y-2">
                  <label className="text-xs font-bold text-white block">Font Family:</label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => updateSetting('fontFamily', e.target.value as any)}
                    className="w-full bg-[#060a14] border border-[#1c2946] rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="JetBrains Mono">JetBrains Mono (Recommended)</option>
                    <option value="Fira Code">Fira Code (Ligatures)</option>
                    <option value="Menlo">Menlo / Monaco (System Mono)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Monospace typography for editor & diff panels.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090e1c] border border-[#1b2640] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">Font Size:</label>
                    <span className="text-xs font-bold text-cyan-300">{settings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="11"
                    max="18"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>11px (Compact)</span>
                    <span>13px (Default)</span>
                    <span>18px (Large)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#090e1c] border border-[#1b2640] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Tab Indentation</div>
                    <div className="text-[10px] text-slate-400">Spaces per indent</div>
                  </div>
                  <select
                    value={settings.tabSize}
                    onChange={(e) => updateSetting('tabSize', Number(e.target.value))}
                    className="bg-[#060a14] border border-[#1c2946] rounded-lg px-2 py-1 text-xs text-white outline-none"
                  >
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#090e1c] border border-[#1b2640] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Soft Word Wrap</div>
                    <div className="text-[10px] text-slate-400">Wrap long lines</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.wordWrap}
                    onChange={(e) => updateSetting('wordWrap', e.target.checked)}
                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#090e1c] border border-[#1b2640] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Line Numbers</div>
                    <div className="text-[10px] text-slate-400">Display gutter</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.lineNumbers}
                    onChange={(e) => updateSetting('lineNumbers', e.target.checked)}
                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI MODEL & GENERATION */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#090e1c] border border-[#1b2640] space-y-2">
                <label className="text-xs font-bold text-white block">AI model selection</label>
                <p className="text-xs text-slate-400">Choose an available provider model from the model routing panel. The server uses AI_DEFAULT_MODEL when no browser preference is set.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#090e1c] border border-[#1b2640] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Generation Temperature</div>
                    <div className="text-[10px] text-slate-400">Lower = more deterministic & rigorous algorithm logic</div>
                  </div>
                  <span className="text-xs font-bold text-cyan-300 font-mono">{settings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => updateSetting('temperature', Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: 7-SECTION STRICTNESS */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-bold text-white">Canonical 7-Section DSA Discipline</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The standard enforced across PromptCode IDE for all DSA problem-solving prompts:
                  1. Restate Problem, 2. Technique, 3. Invariants, 4. Algorithm Walkthrough, 5. Correctness Proof, 6. Complexity, 7. Pitfalls.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'strict_7_section',
                    title: 'Strict Canonical 7-Section Standard (Recommended)',
                    desc: 'Enforces complete 7-section breakdown on all DSA questions. Zero code fluff.',
                  },
                  {
                    id: 'concise',
                    title: 'Concise Mode',
                    desc: 'Produces algorithm steps and Big-O complexity with minimal narrative text.',
                  },
                  {
                    id: 'flexible',
                    title: 'Flexible Prompting',
                    desc: 'Allows freeform prompting without enforcing the 7-section rubric.',
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => updateSetting('promptStrictness', opt.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      settings.promptStrictness === opt.id
                        ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/30'
                        : 'bg-[#090e1c] border-[#18233a] hover:border-slate-600'
                    }`}
                  >
                    <div className="mt-0.5">
                      {settings.promptStrictness === opt.id ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{opt.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIO & FX */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#090e1c] border border-[#1b2640] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Audio Sound Effects</div>
                  <div className="text-[10px] text-slate-400">Play mechanical pops and success chimes</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  className="w-5 h-5 accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#090e1c] border border-[#1b2640] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Confetti Celebrations</div>
                  <div className="text-[10px] text-slate-400">Burst confetti cannons when all test cases pass</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.confettiEnabled}
                  onChange={(e) => updateSetting('confettiEnabled', e.target.checked)}
                  className="w-5 h-5 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
