import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Square,
  Search,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Layers,
  Code2,
  Cpu,
  GitBranch,
  Users,
  Server,
  Atom,
  CheckCircle2,
  X,
  ArrowRight,
  TrendingUp,
  Filter
} from 'lucide-react';
import {
  MASTER_CHECKLIST,
  ChecklistItem,
  ChecklistCategory,
  loadChecklistOverrides,
  saveChecklistOverride,
  resetChecklistOverrides,
} from '../data/masterChecklist';
import { sounds } from '../utils/sounds';

interface MasterChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchFeature: (actionKey: string) => void;
}

const CATEGORY_ICONS: Record<ChecklistCategory, React.ComponentType<{ className?: string }>> = {
  'Prompt Engineering': Sparkles,
  'AI Coding': Code2,
  'Advanced AI': Cpu,
  'Developer Integrations': GitBranch,
  'Collaboration': Users,
  'Infrastructure': Server,
  'Research Extensions': Atom,
};

export const MasterChecklistModal: React.FC<MasterChecklistModalProps> = ({
  isOpen,
  onClose,
  onLaunchFeature,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChecklistCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() => loadChecklistOverrides());

  if (!isOpen) return null;

  // Compute completed status combining defaults with user overrides
  const itemsWithState = useMemo(() => {
    return MASTER_CHECKLIST.map((item) => {
      const isOverridden = overrides[item.id] !== undefined;
      const isDone = isOverridden ? overrides[item.id] : item.status === 'completed';
      return {
        ...item,
        isDone,
      };
    });
  }, [overrides]);

  const totalCount = itemsWithState.length;
  const completedCount = itemsWithState.filter((i) => i.isDone).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const categories: ChecklistCategory[] = [
    'Prompt Engineering',
    'AI Coding',
    'Advanced AI',
    'Developer Integrations',
    'Collaboration',
    'Infrastructure',
    'Research Extensions',
  ];

  const filteredItems = useMemo(() => {
    return itemsWithState.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
          ? item.isDone
          : !item.isDone;

      return matchSearch && matchCat && matchStatus;
    });
  }, [itemsWithState, searchQuery, selectedCategory, statusFilter]);

  const handleToggle = (id: string, currentVal: boolean) => {
    sounds.playPop(currentVal ? 460 : 640);
    const updated = saveChecklistOverride(id, !currentVal);
    setOverrides({ ...updated });
  };

  const handleReset = () => {
    sounds.playPop(420);
    resetChecklistOverrides();
    setOverrides({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl h-[88vh] bg-[#0b0f19] border border-[#1e2a47] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header Bar */}
        <div className="p-4 sm:px-6 border-b border-[#172033] bg-[#090d18] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1.5px] flex items-center justify-center shadow-lg shadow-purple-950/50">
              <div className="w-full h-full bg-[#090e1c] rounded-[9px] flex items-center justify-center text-purple-300 font-black">
                <CheckSquare className="w-5 h-5 text-purple-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-sans">
                  PromptCode Master Checklist
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  55 Total Modules
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track and test all 55 features across Prompt Engineering, AI Coding, Advanced AI, Integrations & Research.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg bg-[#141d33] hover:bg-[#1c2a4a] text-slate-300 text-xs font-semibold border border-[#23355a] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset checklist overrides to original states"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset</span>
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

        {/* Hero Progress Banner */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-purple-950/30 via-[#10172b] to-indigo-950/30 border-b border-[#172033] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{completedCount}</span>
              <span className="text-sm font-semibold text-slate-400">/ {totalCount} completed</span>
            </div>

            <div className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              {progressPercent}% Complete
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full sm:w-72 bg-[#090d18] border border-[#1e2a47] rounded-full h-3 overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full"
            />
          </div>

          {/* Status Segment Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#090d18] border border-[#172033] rounded-xl text-xs shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Done ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Remaining ({totalCount - completedCount})
            </button>
          </div>
        </div>

        {/* Filter Bar: Category Tabs + Search */}
        <div className="px-6 py-2.5 border-b border-[#172033] bg-[#0c101d] flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => {
                sounds.playPop(480);
                setSelectedCategory('All');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-[#12192b] text-slate-400 hover:text-slate-200'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const countInCat = itemsWithState.filter((i) => i.category === cat).length;
              const doneInCat = itemsWithState.filter((i) => i.category === cat && i.isDone).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    sounds.playPop(500);
                    setSelectedCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white font-bold shadow-xs'
                      : 'bg-[#12192b] text-slate-400 hover:text-slate-200 border border-[#1b2640]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                  <span className="text-[10px] opacity-80">
                    ({doneInCat}/{countInCat})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features..."
              className="w-full bg-[#080c16] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="mx-4 sm:mx-6 mt-3 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-xs text-amber-200">
          This is a product feature catalog. Its bundled completion badges are example metadata and do not verify that a service is implemented.
        </div>

        {/* Scrollable Checklist Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 select-text">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No matching checklist features found.
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = CATEGORY_ICONS[item.category];

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.003 }}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    item.isDone
                      ? 'bg-[#0a0f1d] border-[#1e2e4e] hover:border-purple-500/50'
                      : 'bg-[#080c16] border-[#172033] hover:border-slate-700 opacity-80'
                  }`}
                >
                  {/* Left: Checkbox + Name + Description */}
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id, item.isDone)}
                      className="mt-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title={item.isDone ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {item.isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            item.isDone ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {item.name}
                        </span>

                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                          <Icon className="w-3 h-3 text-slate-400" />
                          <span>{item.category}</span>
                        </span>

                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {item.launchAction && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop(520);
                          onClose();
                          onLaunchFeature(item.launchAction!);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#141d33] hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 hover:border-purple-400 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Launch & Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
