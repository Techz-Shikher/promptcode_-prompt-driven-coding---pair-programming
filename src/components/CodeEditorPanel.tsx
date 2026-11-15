import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileCode,
  Plus,
  ChevronDown,
  Play,
  Sun,
  Bot
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { sounds } from '../utils/sounds';

interface CodeEditorPanelProps {
  code: string;
  onChangeCode: (newCode: string) => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onResetCode: () => void;
  readOnly?: boolean;
  aiGeneratedCode: string | null;
  onApplyAiCode: () => void;
  onDiscardAiCode: () => void;
  onToggleChat?: () => void;
  onQuickAskAi?: () => void;
  onOpenCodingAssistant?: () => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  code,
  onChangeCode,
  language,
  onChangeLanguage,
  onResetCode,
  readOnly = false,
  aiGeneratedCode,
  onApplyAiCode,
  onDiscardAiCode,
  onToggleChat,
  onQuickAskAi,
  onOpenCodingAssistant,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeLine, setActiveLine] = useState<number>(4);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = code.split('\n');

  const handleCopy = () => {
    sounds.playPop(640);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChangeCode(newCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="relative h-full flex flex-col bg-[#070b16] text-slate-200 overflow-hidden border-r border-[#172033] select-none">
      {/* Top Bar: Active Tab, Add Tab, Language Selector */}
      <div className="px-3 pt-2.5 pb-0 border-b border-[#172033] bg-[#0a0e1c] flex items-center justify-between gap-3 text-xs">
        {/* Left: Tab items */}
        <div className="flex items-center gap-2">
          {/* Solution.ts active tab with glowing border */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#201c47] border-t border-l border-r border-purple-500/50 rounded-t-xl text-white font-mono text-xs font-semibold shadow-inner">
            <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center">
              TS
            </span>
            <span>Solution.ts</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
          </div>

          {/* Plus icon to add tab */}
          <button
            onClick={() => sounds.playPop(480)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="New Scratch Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Language Pill Dropdown */}
        <div className="relative flex items-center pb-1">
          <div className="flex items-center gap-1.5 bg-[#0e1628] border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded-xl text-xs font-semibold">
            <span className="w-3.5 h-3.5 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center">
              TS
            </span>
            <select
              value={language}
              disabled={readOnly}
              onChange={(e) => {
                sounds.playPop(520);
                onChangeLanguage(e.target.value as SupportedLanguage);
              }}
              className="bg-transparent text-cyan-300 outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="typescript" className="bg-[#0b1020] text-white">TypeScript</option>
              <option value="python" className="bg-[#0b1020] text-white">Python</option>
              <option value="cpp" className="bg-[#0b1020] text-white">C++</option>
              <option value="java" className="bg-[#0b1020] text-white">Java</option>
              <option value="go" className="bg-[#0b1020] text-white">Go</option>
            </select>
            <ChevronDown className="w-3 h-3 text-cyan-300 pointer-events-none -ml-3" />
          </div>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="relative flex-1 flex overflow-hidden bg-[#070b16]">
        {/* Line Numbers */}
        <div className="w-12 py-4 pl-3 pr-2 select-none text-right font-mono text-xs text-slate-600 bg-[#070b16] shrink-0 border-r border-[#141b2e] space-y-1">
          {lines.map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-end gap-1 ${
                i + 1 === activeLine ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <span>{i + 1}</span>
              {i + 1 === activeLine && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
          ))}
        </div>

        {/* Code Canvas / Interactive Area */}
        <div className="relative flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed">
          {/* Floating Ask AI Button in upper right of editor */}
          <div className="absolute top-4 right-6 z-20 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { sounds.playPop(520); onOpenCodingAssistant?.(); }}
              className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-[#102030] px-3 py-1 font-sans text-xs text-cyan-200 shadow-lg cursor-pointer"
            ><Bot className="h-3 w-3" /><span className="font-semibold">Explain · Debug · Tests</span></motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.playPop(560);
                if (onQuickAskAi) onQuickAskAi();
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1438] hover:bg-[#251b4f] border border-purple-500/50 text-purple-200 text-xs rounded-full shadow-lg shadow-purple-950/40 cursor-pointer font-sans"
            >
              <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
              <span className="font-semibold text-xs">Ask AI</span>
              <kbd className="text-[10px] text-purple-300 bg-[#2b1d55] px-1 py-0.2 rounded border border-purple-400/30 ml-0.5">
                Ctrl I
              </kbd>
            </motion.button>
          </div>

          {/* Actual Editable Textarea overlaid on styled backdrop */}
          <textarea
            ref={textareaRef}
            value={code}
            readOnly={readOnly}
            onChange={(e) => {
              onChangeCode(e.target.value);
              const curLine = e.target.value.substr(0, e.target.selectionStart).split('\n').length;
              setActiveLine(curLine);
            }}
            onKeyDown={readOnly ? undefined : handleKeyDown}
            onClick={(e) => {
              const curLine = code.substr(0, e.currentTarget.selectionStart).split('\n').length;
              setActiveLine(curLine);
            }}
            spellCheck={false}
            className="w-full h-full bg-transparent text-slate-100 placeholder:text-slate-600 resize-none outline-none font-mono text-xs leading-relaxed selection:bg-purple-600/40 relative z-10"
          />
        </div>

        {/* Vertical Action Rail Strip (right edge) */}
        <div className="w-11 bg-[#090d18] border-l border-[#172033] py-4 flex flex-col items-center gap-4 shrink-0 z-20">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => sounds.playPop(520)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Step-by-Step Code Walkthrough"
          >
            <Play className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => sounds.playPop(480)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Editor Brightness & Theme"
          >
            <Sun className="w-4 h-4" />
          </motion.button>

          {/* Glowing Purple Spherical Orb Button */}
          <div className="mt-auto">
            <motion.button
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                sounds.playToodleBoop();
                if (onToggleChat) onToggleChat();
              }}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-600/50 cursor-pointer flex items-center justify-center animate-pulse"
              title="Open AI Companion & Pair Chat"
            >
              <div className="w-full h-full rounded-full bg-[#160d2b] flex items-center justify-center text-purple-200">
                <Bot className="w-3.5 h-3.5 text-purple-300" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Status Bar at Bottom of Editor */}
      <div className="px-3 py-1.5 border-t border-[#172033] bg-[#090d18] text-[11px] text-slate-400 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span>Ln {activeLine}, Col 1</span>
          <span>•</span>
          <span>Spaces: 2</span>
          <span>•</span>
          <span>UTF-8</span>
          <span>•</span>
          <span className="capitalize">{language}</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
          <span>Local editor · not synchronized</span>
        </div>
      </div>
    </div>
  );
};
