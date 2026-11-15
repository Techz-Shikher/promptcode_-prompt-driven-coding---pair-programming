import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Lightbulb,
  Target,
  Copy,
  Check,
  FolderPlus,
  Search,
  ListFilter,
  CheckCircle2,
  Filter,
  X,
  RotateCcw,
  CheckSquare
} from 'lucide-react';
import { Problem, Difficulty } from '../types';
import { sounds } from '../utils/sounds';
import { ProblemProgress } from '../utils/problemProgress';

interface ProblemPanelProps {
  problems: Problem[];
  activeProblem: Problem;
  onSelectProblem: (problem: Problem) => void;
  onUseRecommendedPrompt: (prompt: string) => void;
  onOpenImporter?: () => void;
  problemProgress?: Record<string, ProblemProgress>;
}

export function getDifficultyColor(diff: Difficulty) {
  switch (diff) {
    case 'Easy':
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
      };
    case 'Medium':
      return {
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
      };
    case 'Hard':
      return {
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
        text: 'text-rose-400',
        dot: 'bg-rose-400',
      };
  }
}

export function getProblemStatus(problem: Problem, progressMap?: Record<string, ProblemProgress>) {
  const saved = progressMap?.[problem.id];
  const totalCount = saved?.totalCount || problem.testCases?.length || 3;
  const passedCount = saved ? saved.passedCount : 0;
  const isCompleted = saved ? saved.isCompleted : false;
  const percentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return {
    passedCount,
    totalCount,
    isCompleted,
    percentage,
  };
}

export const ProblemPanel: React.FC<ProblemPanelProps> = ({
  problems,
  activeProblem,
  onSelectProblem,
  onUseRecommendedPrompt,
  onOpenImporter,
  problemProgress = {},
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'details' | 'guide' | 'examples'>('details');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDiffDropdownOpen, setIsDiffDropdownOpen] = useState(false);
  const [isHeaderDiffOpen, setIsHeaderDiffOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const diffDropdownRef = useRef<HTMLDivElement>(null);
  const headerDiffRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (diffDropdownRef.current && !diffDropdownRef.current.contains(event.target as Node)) {
        setIsDiffDropdownOpen(false);
      }
      if (headerDiffRef.current && !headerDiffRef.current.contains(event.target as Node)) {
        setIsHeaderDiffOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute counts per difficulty
  const difficultyCounts = useMemo(() => {
    const counts = { All: problems.length, Easy: 0, Medium: 0, Hard: 0 };
    for (const p of problems) {
      if (counts[p.difficulty] !== undefined) {
        counts[p.difficulty]++;
      }
    }
    return counts;
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch =
        !searchFilter.trim() ||
        p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase())) ||
        p.difficulty.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [problems, searchFilter, selectedDifficulty]);

  const currentIndex = problems.findIndex((p) => p.id === activeProblem.id);
  const handlePrev = () => {
    if (currentIndex > 0) {
      sounds.playPop(480);
      onSelectProblem(problems[currentIndex - 1]);
    }
  };
  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      sounds.playPop(520);
      onSelectProblem(problems[currentIndex + 1]);
    }
  };

  const handleCopyPrompt = () => {
    sounds.playPop(640);
    navigator.clipboard.writeText(activeProblem.recommendedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSelectDifficulty = (diff: Difficulty | 'All') => {
    sounds.playPop(500);
    setSelectedDifficulty(diff);
    setIsDiffDropdownOpen(false);
    setIsHeaderDiffOpen(false);
  };

  const activeDiffColors = getDifficultyColor(activeProblem.difficulty);
  const activeStatus = getProblemStatus(activeProblem, problemProgress);

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] border-r border-[#172033] text-slate-200 overflow-hidden select-none">
      {/* Header: Prev/Next, Custom Problem Dropdown Trigger, Difficulty Filter Dropdown, Import Button */}
      <div className="p-2.5 sm:p-3 border-b border-[#172033] bg-[#0c101d] flex items-center justify-between gap-1.5 sm:gap-2 relative z-20">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0" ref={dropdownRef}>
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer shrink-0"
            title="Previous Problem"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Custom Problem Dropdown Trigger */}
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => {
                sounds.playPop(480);
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="w-full bg-[#090d18] hover:bg-[#11182c] border border-[#1e2a47] rounded-lg px-2 sm:px-2.5 py-1 text-xs font-bold text-white outline-none cursor-pointer flex items-center justify-between gap-1.5 sm:gap-2 transition-colors max-w-[210px]"
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                {activeProblem.isCustom && <span className="text-[10px]">✨</span>}
                <span className="truncate">{activeProblem.title}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  isDropdownOpen ? 'rotate-180 text-purple-400' : ''
                }`}
              />
            </button>

            {/* Custom Dropdown Menu with Difficulty Filter and Problem List */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1.5 w-80 bg-[#090e1c] border border-[#1f2e4e] rounded-xl shadow-2xl p-2.5 z-50 space-y-2 select-none"
                >
                  {/* Search Bar inside Dropdown */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#060a14] rounded-lg border border-[#18233c] text-xs">
                    <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter problems..."
                      className="w-full bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500"
                      autoFocus
                    />
                    {searchFilter && (
                      <button onClick={() => setSearchFilter('')} className="text-slate-500 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Difficulty Filter Chips within Quick Dropdown */}
                  <div className="flex items-center justify-between gap-1 pt-0.5 pb-1 border-b border-[#172033] text-[10px]">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Filter className="w-3 h-3 text-cyan-400" />
                      <span>Difficulty:</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => {
                        const isSelected = selectedDifficulty === diff;
                        return (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => handleSelectDifficulty(diff)}
                            className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                              isSelected
                                ? diff === 'Easy'
                                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                                  : diff === 'Medium'
                                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                                  : diff === 'Hard'
                                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                                  : 'bg-purple-600 text-white'
                                : 'bg-[#0f172a] text-slate-400 hover:text-white'
                            }`}
                          >
                            {diff}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Problem Items with Mini Progress Bars */}
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5 select-none">
                    {filteredProblems.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-500 space-y-1">
                        <div>No {selectedDifficulty !== 'All' ? selectedDifficulty : ''} problems found.</div>
                        {selectedDifficulty !== 'All' && (
                          <button
                            onClick={() => setSelectedDifficulty('All')}
                            className="text-purple-400 hover:text-purple-300 text-[11px] underline cursor-pointer"
                          >
                            Show all difficulties
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredProblems.map((p) => {
                        const diffColors = getDifficultyColor(p.difficulty);
                        const isSelected = p.id === activeProblem.id;
                        const status = getProblemStatus(p, problemProgress);

                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              sounds.playPop(520);
                              onSelectProblem(p);
                              setIsDropdownOpen(false);
                            }}
                            className={`p-2 rounded-lg text-xs flex flex-col gap-1.5 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-purple-950/60 border border-purple-500/50 text-white font-bold'
                                : 'hover:bg-[#131b2e] text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex items-center gap-1.5 truncate">
                                {status.isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : isSelected ? (
                                  <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                                ) : (
                                  <div className={`w-1.5 h-1.5 rounded-full ${diffColors.dot} shrink-0`} />
                                )}
                                <span className="truncate">{p.title}</span>
                              </div>

                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border uppercase shrink-0 ${diffColors.badge}`}
                              >
                                {p.difficulty}
                              </span>
                            </div>

                            {/* Dropdown Mini Progress Bar */}
                            <div className="flex items-center gap-2 text-[10px]">
                              <div className="flex-1 bg-[#12192a] h-1 rounded-full overflow-hidden border border-[#1b2640]/70">
                                <div
                                  className={`h-full rounded-full ${
                                    status.isCompleted
                                      ? 'bg-emerald-400'
                                      : status.passedCount > 0
                                      ? 'bg-cyan-400'
                                      : 'bg-transparent'
                                  }`}
                                  style={{ width: `${status.percentage}%` }}
                                />
                              </div>
                              <span
                                className={`text-[9px] font-mono shrink-0 ${
                                  status.isCompleted
                                    ? 'text-emerald-400 font-bold'
                                    : status.passedCount > 0
                                    ? 'text-cyan-300'
                                    : 'text-slate-500'
                                }`}
                              >
                                {status.passedCount}/{status.totalCount} tests ({status.percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex >= problems.length - 1}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer shrink-0"
            title="Next Problem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Header Controls: Difficulty Filter Dropdown & Import Button */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Header Difficulty Filter Dropdown */}
          <div className="relative shrink-0" ref={headerDiffRef}>
            <button
              onClick={() => {
                sounds.playPop(480);
                setIsHeaderDiffOpen(!isHeaderDiffOpen);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                selectedDifficulty === 'All'
                  ? 'bg-[#0f172a] hover:bg-[#16223b] text-slate-300 border-[#1e2a47]'
                  : selectedDifficulty === 'Easy'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                  : selectedDifficulty === 'Medium'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30'
              }`}
              title="Toggle problem difficulty filter (Easy, Medium, Hard)"
            >
              <Filter className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>{selectedDifficulty === 'All' ? 'Difficulty' : selectedDifficulty}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isHeaderDiffOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Header Difficulty Menu */}
            <AnimatePresence>
              {isHeaderDiffOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-[#090e1c] border border-[#1f2e4e] rounded-xl shadow-2xl p-1.5 z-50 space-y-1 text-xs select-none"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#172033] mb-1">
                    Filter by Difficulty
                  </div>
                  {[
                    { key: 'All', label: 'All Difficulties', color: 'text-slate-300', dot: 'bg-slate-400' },
                    { key: 'Easy', label: 'Easy', color: 'text-emerald-400', dot: 'bg-emerald-400' },
                    { key: 'Medium', label: 'Medium', color: 'text-amber-400', dot: 'bg-amber-400' },
                    { key: 'Hard', label: 'Hard', color: 'text-rose-400', dot: 'bg-rose-400' },
                  ].map((item) => {
                    const isSelected = selectedDifficulty === item.key;
                    const count = difficultyCounts[item.key as keyof typeof difficultyCounts];

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSelectDifficulty(item.key as any)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-purple-950/60 border border-purple-500/40 text-white font-bold'
                            : 'hover:bg-[#131b2e] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                          <span className={item.color}>{item.label}</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#162035] text-slate-400">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Import / Custom Bank Button */}
          {onOpenImporter && (
            <button
              onClick={() => {
                sounds.playPop(520);
                onOpenImporter();
              }}
              className="px-2 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              title="Open Custom Problem Importer & Problem Bank"
            >
              <FolderPlus className="w-3 h-3 text-purple-400" />
              <span className="hidden sm:inline">Import</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs: Problem Cards List | Problem Details | 7-Section Guide | Examples */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[#172033] bg-[#090d18] text-xs overflow-x-auto">
        <button
          onClick={() => {
            sounds.playPop(460);
            setActiveTab('list');
          }}
          className={`px-2.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'list'
              ? 'bg-[#261b47] text-white border border-purple-500/50 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5 text-cyan-400" />
          <span>All Problems ({problems.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop(480);
            setActiveTab('details');
          }}
          className={`px-2.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'details'
              ? 'bg-[#261b47] text-white border border-purple-500/50 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>Details</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop(520);
            setActiveTab('guide');
          }}
          className={`px-2.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'guide'
              ? 'bg-[#261b47] text-white border border-purple-500/50 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>
            {activeProblem.category === 'debug'
              ? 'Debugging Guide'
              : activeProblem.category === 'develop'
              ? 'System Guide'
              : '7-Section Guide'}
          </span>
        </button>

        <button
          onClick={() => {
            sounds.playPop(540);
            setActiveTab('examples');
          }}
          className={`px-2.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeTab === 'examples'
              ? 'bg-[#261b47] text-white border border-purple-500/50 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Examples ({activeProblem.testCases.length})</span>
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
        {/* TAB 1: ALL PROBLEM CARDS (With Visual Progress Bars on Every Card) */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            {/* Search and Difficulty Filtering Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {/* Search Bar Input */}
                <div className="flex-1 flex items-center gap-2 bg-[#090e1c] border border-[#1c2a47] rounded-xl px-3 py-1.5 text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search problems, topics, tags..."
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="text-slate-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Difficulty Filter Dropdown Trigger Button */}
                <div className="relative shrink-0" ref={diffDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop(480);
                      setIsDiffDropdownOpen(!isDiffDropdownOpen);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      selectedDifficulty === 'All'
                        ? 'bg-[#0f172a] hover:bg-[#16223b] text-slate-300 border-[#1e2a47]'
                        : selectedDifficulty === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : selectedDifficulty === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedDifficulty === 'All' ? 'All Difficulties' : selectedDifficulty}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-slate-400 font-mono">
                      {difficultyCounts[selectedDifficulty]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        isDiffDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Difficulty Filter Dropdown Menu */}
                  <AnimatePresence>
                    {isDiffDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        className="absolute right-0 top-full mt-1.5 w-52 bg-[#090e1c] border border-[#1f2e4e] rounded-xl shadow-2xl p-1.5 z-50 space-y-1 text-xs select-none"
                      >
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#172033] mb-1">
                          Filter by Difficulty
                        </div>

                        {[
                          { key: 'All', label: 'All Difficulties', color: 'text-slate-300', dot: 'bg-slate-400' },
                          { key: 'Easy', label: 'Easy', color: 'text-emerald-400', dot: 'bg-emerald-400' },
                          { key: 'Medium', label: 'Medium', color: 'text-amber-400', dot: 'bg-amber-400' },
                          { key: 'Hard', label: 'Hard', color: 'text-rose-400', dot: 'bg-rose-400' },
                        ].map((item) => {
                          const isSelected = selectedDifficulty === item.key;
                          const count = difficultyCounts[item.key as keyof typeof difficultyCounts];

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleSelectDifficulty(item.key as any)}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-950/60 border border-purple-500/40 text-white font-bold'
                                  : 'hover:bg-[#131b2e] text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                                <span className={item.color}>{item.label}</span>
                              </div>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#162035] text-slate-400">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Status Row: Results count + Quick Reset button if filtered */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>
                  Showing <strong className="text-white">{filteredProblems.length}</strong> of{' '}
                  <strong className="text-white">{problems.length}</strong> problems
                  {selectedDifficulty !== 'All' && (
                    <span className="ml-1 text-purple-300 font-semibold">({selectedDifficulty})</span>
                  )}
                </span>

                {(selectedDifficulty !== 'All' || searchFilter) && (
                  <button
                    onClick={() => {
                      sounds.playPop(440);
                      setSelectedDifficulty('All');
                      setSearchFilter('');
                    }}
                    className="text-purple-400 hover:text-purple-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Problem Cards List with Visual Progress Bars */}
            <div className="space-y-2.5 select-none">
              {filteredProblems.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-[#090e1c] border border-[#172238] space-y-2">
                  <div className="text-sm font-bold text-slate-300">
                    No {selectedDifficulty !== 'All' ? selectedDifficulty : ''} problems match your filter
                  </div>
                  <p className="text-xs text-slate-500">
                    Try selecting another difficulty level or resetting your search keyword.
                  </p>
                  <button
                    onClick={() => {
                      sounds.playPop(480);
                      setSelectedDifficulty('All');
                      setSearchFilter('');
                    }}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    View All Problems ({problems.length})
                  </button>
                </div>
              ) : (
                filteredProblems.map((p) => {
                  const isSelected = p.id === activeProblem.id;
                  const diffColors = getDifficultyColor(p.difficulty);
                  const status = getProblemStatus(p, problemProgress);

                  return (
                    <motion.div
                      key={p.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        sounds.playPop(520);
                        onSelectProblem(p);
                        setActiveTab('details');
                      }}
                      className={`p-3.5 rounded-xl transition-all cursor-pointer flex flex-col gap-2.5 ${
                        isSelected
                          ? 'bg-[#151c31] border border-purple-500/60 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/30'
                          : 'bg-[#090e1c] border border-[#172238] hover:border-[#2a3c61] hover:bg-[#0d1427]'
                      }`}
                    >
                      {/* Top Row: Problem Title + Colored Difficulty Tag */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {p.isCustom && (
                            <span
                              className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 shrink-0 font-semibold"
                              title="Custom Imported Problem"
                            >
                              Custom
                            </span>
                          )}
                          <h4
                            className={`text-xs font-bold leading-snug truncate ${
                              isSelected ? 'text-white' : 'text-slate-200'
                            }`}
                          >
                            {p.title}
                          </h4>
                        </div>

                        {/* Colored Difficulty Tag */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider shrink-0 shadow-xs ${diffColors.badge}`}
                        >
                          {p.difficulty}
                        </span>
                      </div>

                      {/* Visual Test Completion Progress Bar */}
                      <div className="space-y-1 bg-[#060a14]/60 p-2 rounded-lg border border-[#162035]/80">
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 font-medium">
                            {status.isCompleted ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Passed ({status.passedCount}/{status.totalCount} tests)</span>
                              </span>
                            ) : status.passedCount > 0 ? (
                              <span className="text-cyan-300 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                                <span>In Progress ({status.passedCount}/{status.totalCount} tests)</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                                <span>Tests Unattempted (0/{status.totalCount})</span>
                              </span>
                            )}
                          </div>

                          <span
                            className={`font-mono text-[10px] font-bold ${
                              status.isCompleted
                                ? 'text-emerald-400'
                                : status.passedCount > 0
                                ? 'text-cyan-300'
                                : 'text-slate-500'
                            }`}
                          >
                            {status.percentage}%
                          </span>
                        </div>

                        {/* Visual Progress Bar Track */}
                        <div className="w-full bg-[#12192a] h-1.5 rounded-full overflow-hidden border border-[#1b2640]/70 relative">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              status.isCompleted
                                ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-sm shadow-emerald-500/50'
                                : status.passedCount > 0
                                ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 shadow-sm shadow-cyan-500/40'
                                : 'bg-transparent'
                            }`}
                            style={{
                              width: `${Math.max(status.percentage, status.passedCount > 0 ? 8 : 0)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Bottom Metadata Row: Acceptance, Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-amber-400/90 font-semibold">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>{p.acceptance}</span>
                        </span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span className="truncate">{p.tags.slice(0, 3).join(', ')}</span>
                        {isSelected && (
                          <span className="ml-auto text-[10px] font-bold text-purple-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROBLEM DETAILS */}
        {activeTab === 'details' && (
          <>
            {/* Metadata & Tag Row */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Colored Difficulty Tag */}
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${activeDiffColors.badge}`}
              >
                {activeProblem.difficulty}
              </span>

              {activeProblem.isCustom && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                  <span>✨ Custom Import</span>
                </span>
              )}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#201815] text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Acceptance {activeProblem.acceptance}</span>
              </span>
              {activeProblem.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0f172a] text-cyan-300 border border-[#1e2e4f] text-[10px]"
                >
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            {/* Visual Test Completion Progress Banner for Active Problem */}
            <div className="p-3 rounded-xl bg-[#090e1c] border border-[#172238] flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  {activeStatus.isCompleted ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>All Tests Passed (Solved)</span>
                    </span>
                  ) : activeStatus.passedCount > 0 ? (
                    <span className="text-cyan-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Tests In Progress</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>Tests Not Yet Run</span>
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs font-bold text-slate-300">
                  <span
                    className={
                      activeStatus.isCompleted
                        ? 'text-emerald-400'
                        : activeStatus.passedCount > 0
                        ? 'text-cyan-300'
                        : 'text-slate-400'
                    }
                  >
                    {activeStatus.passedCount} / {activeStatus.totalCount} Tests
                  </span>{' '}
                  <span className="text-slate-500">({activeStatus.percentage}%)</span>
                </div>
              </div>

              {/* Active Problem Visual Progress Bar */}
              <div className="w-full bg-[#12192a] h-2 rounded-full overflow-hidden border border-[#1b2640]/70">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeStatus.isCompleted
                      ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-sm shadow-emerald-500/40'
                      : activeStatus.passedCount > 0
                      ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 shadow-sm shadow-cyan-500/30'
                      : 'bg-transparent'
                  }`}
                  style={{
                    width: `${Math.max(activeStatus.percentage, activeStatus.passedCount > 0 ? 8 : 0)}%`,
                  }}
                />
              </div>
            </div>

            {/* Prompt Learning Target Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#18122c]/70 to-indigo-950/40 border border-purple-500/40 shadow-lg shadow-purple-950/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                  <Lightbulb className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span className="text-white">Prompt Learning Target</span>
                </div>
                <div className="w-6 h-6 rounded-full border border-purple-400/50 flex items-center justify-center text-purple-300">
                  <Target className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                {activeProblem.promptLearningTarget || activeProblem.learningObjective}
              </p>
            </div>

            {/* Dynamic Problem Description */}
            <div className="text-slate-300 text-xs leading-relaxed space-y-2 whitespace-pre-line">
              {activeProblem.description}
            </div>

            {/* Primary Example Section */}
            {activeProblem.examples && activeProblem.examples.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Primary Example
                </div>
                <div className="p-3 rounded-xl bg-[#090e1c] border border-[#172238] space-y-1 font-mono text-[11px]">
                  <div className="text-slate-300">
                    <span className="text-slate-500 font-bold">Input: </span>
                    {activeProblem.examples[0].input}
                  </div>
                  <div className="text-cyan-300">
                    <span className="text-slate-500 font-bold">Output: </span>
                    {activeProblem.examples[0].output}
                  </div>
                  {activeProblem.examples[0].explanation && (
                    <div className="text-slate-400 font-sans text-xs pt-0.5">
                      <span className="text-slate-500 font-bold font-mono text-[11px]">Explanation: </span>
                      {activeProblem.examples[0].explanation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Constraints */}
            {activeProblem.constraints && activeProblem.constraints.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Constraints & Bounds
                </div>
                <ul className="space-y-1 text-[11px] text-slate-400 font-mono">
                  {activeProblem.constraints.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-400">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* TAB 3: CATEGORY-AWARE GUIDE */}
        {activeTab === 'guide' && (() => {
          const guide =
            activeProblem.category === 'debug'
              ? {
                  promptHeader: 'Standard Root-Cause Debugging Prompt',
                  badge: '5-Step Root-Cause Discipline',
                  buttonText: 'Insert Root-Cause Debugging Prompt',
                  sectionTitle: 'The 5 Essential Debugging Disciplines',
                  icon: '🐛',
                  steps: [
                    { num: '1', title: 'Failing Trace & Symptom', desc: 'Isolate the failing input, expected output, and actual freeze/crash trace.' },
                    { num: '2', title: 'Violated Invariant', desc: 'Identify which boundary condition or loop termination assumption failed.' },
                    { num: '3', title: 'Dry-Run State Table', desc: 'Step through variable updates (pointers, indices) right up to failure.' },
                    { num: '4', title: 'Minimal Semantics-Preserving Fix', desc: 'Formulate the surgical bug fix without modifying external caller contracts.' },
                    { num: '5', title: 'Regression & Adversarial Safety', desc: 'Verify against empty collections, duplicates, and extreme bounds.' },
                  ],
                }
              : activeProblem.category === 'develop'
              ? {
                  promptHeader: 'Production System Architecture Prompt',
                  badge: 'Enterprise Blueprint',
                  buttonText: 'Insert Architecture Blueprint Prompt',
                  sectionTitle: 'The 5 Essential System Dev Sections',
                  icon: '🏗️',
                  steps: [
                    { num: '1', title: 'Requirements & SLOs', desc: 'Define throughput, latency target (p99), storage durability, and SLAs.' },
                    { num: '2', title: 'Data Model & Schema', desc: 'Design normalized relational or document models, indexing, and types.' },
                    { num: '3', title: 'Component Architecture', desc: 'Trace request lifecycle, cache tiering, and asynchronous queues.' },
                    { num: '4', title: 'Concurrency & Locking', desc: 'Eliminate race conditions, deadlocks, and enforce atomic updates.' },
                    { num: '5', title: 'Failure Modes & Scaling', desc: 'Circuit breakers, exponential backoff, and horizontal partitioning.' },
                  ],
                }
              : {
                  promptHeader: 'Standard 7-Section DSA Prompt',
                  badge: 'Canonical Format',
                  buttonText: 'Insert 7-Section DSA Prompt',
                  sectionTitle: 'The 7 Essential DSA Sections',
                  icon: '🎯',
                  steps: [
                    { num: '1', title: 'Restating the Problem', desc: 'Inputs, outputs, bounds, invariants, and domain constraints.' },
                    { num: '2', title: 'Naming the Technique', desc: 'Exact algorithmic paradigm (e.g. Dynamic Programming, Two Pointers).' },
                    { num: '3', title: 'Key Observations', desc: 'Monotonicity, lookup invariant, or mathematical properties.' },
                    { num: '4', title: 'The Algorithm', desc: 'High-level, step-by-step description without code syntax.' },
                    { num: '5', title: 'Correctness Arguments', desc: 'Inductive proof or loop invariant verifying why it never fails.' },
                    { num: '6', title: 'Complexity Analyses', desc: 'Asymptotic worst-case Time & Space Big-O derivation.' },
                    { num: '7', title: 'Potential Pitfalls', desc: 'Edge cases, overflow, duplicate values, and common bug traps.' },
                  ],
                };

          return (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/30 to-purple-950/30 border border-pink-700/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-pink-300 text-xs">{guide.promptHeader}</span>
                    <span className="px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/30">
                      {guide.badge}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-[11px] text-pink-400 hover:text-white cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090d18] border border-pink-900/40 text-slate-200 font-mono text-[11px] leading-relaxed">
                  "{activeProblem.recommendedPrompt}"
                </div>
                <button
                  onClick={() => onUseRecommendedPrompt(activeProblem.recommendedPrompt)}
                  className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>{guide.buttonText}</span>
                </button>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{guide.icon}</span>
                  <span>{guide.sectionTitle}</span>
                </div>
                <div className="space-y-1.5">
                  {guide.steps.map((sec) => (
                    <div key={sec.num} className="p-2 rounded-xl bg-[#0a0f1d] border border-[#162238] flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {sec.num}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-white text-[11px]">{sec.title}</div>
                        <div className="text-slate-400 text-[10px] leading-tight">{sec.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeProblem.promptTips && activeProblem.promptTips.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Targeted Prompt Tips
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 text-purple-200 text-xs space-y-1">
                    {activeProblem.promptTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-purple-400">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 4: EXAMPLES */}
        {activeTab === 'examples' && (
          <div className="space-y-3">
            {activeProblem.testCases.map((tc, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#090e1c] border border-[#172238] space-y-1 font-mono text-[11px]">
                <div className="text-xs font-bold text-slate-400 font-sans mb-1 flex items-center justify-between">
                  <span>Example {idx + 1}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{tc.label}</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Input: </span>
                  {tc.input}
                </div>
                <div className="text-emerald-400">
                  <span className="text-slate-500">Expected: </span>
                  {tc.expected}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
