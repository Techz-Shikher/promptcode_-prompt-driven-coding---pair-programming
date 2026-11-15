import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Cpu,
  CheckCircle2,
  X,
  Gauge
} from 'lucide-react';
import { sounds } from '../utils/sounds';

interface MultiModelRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel: string;
  onSelectModel: (model: string) => void;
}

export const MultiModelRoutingModal: React.FC<MultiModelRoutingModalProps> = ({
  isOpen,
  onClose,
  activeModel,
  onSelectModel,
}) => {
  const [selected, setSelected] = useState(activeModel || 'gemini-3.8-flash');
  const [modelAvailability, setModelAvailability] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;
    setSelected(activeModel);
    fetch('/api/ai/models').then((response) => response.json()).then((data) => {
      const catalog = data.models || [];
      setModelAvailability(Object.fromEntries(catalog.map((model: { id: string; available: boolean }) => [model.id, model.available])));
      const available = catalog.filter((model: { id: string; available: boolean }) => model.available);
      if (!available.some((model: { id: string }) => model.id === activeModel)) {
        const fallback = available.find((model: { id: string }) => model.id === data.defaultModel) || available[0];
        if (fallback) {
          setSelected(fallback.id);
          localStorage.setItem('promptcode.aiModel', fallback.id);
          onSelectModel(fallback.id);
        }
      }
    }).catch(() => setModelAvailability({}));
  }, [isOpen, activeModel]);

  if (!isOpen) return null;

  const models = [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      provider: 'Google AI Studio',
      bestFor: 'Fast general-purpose coding assistance',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'Google AI Studio',
      bestFor: 'More involved coding and reasoning tasks',
    },
    {
      id: 'claude-sonnet-5',
      name: 'Claude Sonnet 5',
      provider: 'Anthropic',
      bestFor: 'Code analysis and implementation assistance',
    },
    {
      id: 'gpt-4.1',
      name: 'GPT-4.1',
      provider: 'OpenAI',
      bestFor: 'General coding and instruction following',
    },
    {
      id: 'deepseek-v4-flash',
      name: 'DeepSeek V4 Flash',
      provider: 'DeepSeek',
      bestFor: 'Coding assistance through the DeepSeek API',
    },
  ];

  const handleApply = (id: string) => {
    if (!modelAvailability[id]) return;
    sounds.playPop(520);
    setSelected(id);
    onSelectModel(id);
    onClose();
  };

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
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-sans">
                  AI Model Routing
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Routing preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Route tasks based on latency vs reasoning depth or trigger collaborative multi-agent deliberation.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 select-text">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-300">
            AI requests use your selected model. Provider credentials stay on the server; a model is selectable only when its provider key is configured.
          </div>

          {/* Smart Routing Mode Toggle */}
          <div className="p-4 rounded-xl bg-[#090e1c] border border-[#1c2946] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-purple-400" />
                <span>Model routing</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Choose the provider and model used by PromptCode AI features. Requests retry transient provider failures and report latency and token usage when returned by the provider.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#060a14] rounded-lg border border-[#172033] text-xs">
              <span className="px-3 py-1 rounded-md font-bold bg-purple-600 text-white">Select model</span>
            </div>
          </div>

          {/* Model Cards Grid */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Available Foundation Models
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {models.map((m) => {
                const isActive = selected === m.id;

                return (
                  <button
                    type="button"
                    key={m.id}
                    disabled={!modelAvailability[m.id]}
                    onClick={() => handleApply(m.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${!modelAvailability[m.id] ? 'opacity-50 cursor-not-allowed bg-[#090e1c] border-[#18233a]' : 'cursor-pointer'} ${
                      isActive
                        ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/40'
                        : 'bg-[#090e1c] border-[#18233a] hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                          <span>{m.name}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/60 px-2 py-0.2 rounded-full border border-purple-500/30">
                          {modelAvailability[m.id] ? 'Available' : 'Key required'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1">{m.provider}</div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{m.bestFor}</p>
                    </div>

                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
