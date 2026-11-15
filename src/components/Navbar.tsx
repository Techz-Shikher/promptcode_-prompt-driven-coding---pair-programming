import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  Terminal,
  Bug,
  Cpu,
  GraduationCap,
  Sparkles,
  Search,
  Bell,
  Settings,
  Play,
  ChevronDown,
  RotateCcw,
  MessageSquare,
  Volume2,
  VolumeX,
  UserCheck,
  FolderPlus,
  GitCompare,
  TrendingUp,
  Database,
  Trophy,
  Atom,
  Layers,
  GitBranch,
  Workflow,
  X,
  Check,
  User,
  LogIn
} from 'lucide-react';
import { Problem, ProblemCategory } from '../types';
import { sounds } from '../utils/sounds';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'ai' | 'collab' | 'system';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '7-Section Prompt Engine Active',
    desc: 'DSA strictness enforced: Problem, Invariants, Proof & Pitfalls.',
    time: '2m ago',
    read: false,
    type: 'ai',
  },
  {
    id: 'notif-2',
    title: 'Collaboration rooms',
    desc: 'Create a room or join teammates with an invite code from Tools.',
    time: '10m ago',
    read: false,
    type: 'collab',
  },
  {
    id: 'notif-3',
    title: 'Daily Challenge Unlocked',
    desc: 'Earn +150 XP by solving LRU Cache with O(1) invariants.',
    time: '1h ago',
    read: false,
    type: 'system',
  },
  {
    id: 'notif-4',
    title: 'Prompt Analytics & Radar',
    desc: 'All 7 prompt engineering skill metrics calibrated.',
    time: '2h ago',
    read: true,
    type: 'system',
  },
];

interface NavbarProps {
  activeCategory: ProblemCategory;
  onSelectCategory: (category: ProblemCategory) => void;
  onOpenReview: () => void;
  onToggleChat: () => void;
  unreadChatCount: number;
  onOpenAcademy: () => void;
  onOpenOptimizer: () => void;
  onOpenImporter?: () => void;
  totalProblemsCount?: number;
  onOpenCompare?: () => void;
  onOpenAnalytics?: () => void;
  onOpenWorkflows?: () => void;
  onOpenRooms?: () => void;
  onOpenSqlApi?: () => void;
  onOpenMultiModel?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenQuantum?: () => void;
  onOpenDevIntegrations?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
  allProblems?: Problem[];
  onSelectProblem?: (problem: Problem) => void;
  userName?: string;
  userAvatar?: string;
  onRunTests: () => void;
  isRunningTests: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenReview,
  onToggleChat,
  unreadChatCount,
  onOpenAcademy,
  onOpenOptimizer,
  onOpenImporter,
  totalProblemsCount,
  onOpenCompare,
  onOpenAnalytics,
  onOpenWorkflows,
  onOpenRooms,
  onOpenSqlApi,
  onOpenMultiModel,
  onOpenLeaderboard,
  onOpenQuantum,
  onOpenDevIntegrations,
  onOpenSettings,
  onOpenAuth,
  allProblems = [],
  onSelectProblem,
  userName = 'S. Driver',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80',
  onRunTests,
  isRunningTests,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sounds.playPop(520);
  };

  const handleCategoryClick = (cat: ProblemCategory) => {
    sounds.playPop(480);
    onSelectCategory(cat);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sounds.playPop(480);
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsToolsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter problems for search
  const filteredSearchProblems = searchQuery.trim()
    ? allProblems.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allProblems.slice(0, 6);

  const handleSelectSearchResult = (p: Problem) => {
    sounds.playPop(520);
    if (onSelectProblem) onSelectProblem(p);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const markAllNotificationsAsRead = () => {
    sounds.playPop(480);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    sounds.playPop(420);
    setNotifications([]);
  };

  return (
    <header className="bg-[#070b15]/95 backdrop-blur-md border-b border-[#172033] text-slate-100 sticky top-0 z-40 select-none px-3.5 h-16 flex items-center justify-between gap-3 overflow-visible">
      {/* Left: Brand Logo & Tagline */}
      <div className="flex items-center gap-2.5 shrink-0">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => sounds.playPop(520)}
        >
          {/* Logo icon with glowing cyan/purple border */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0e172a] border border-[#2b395d] flex items-center justify-center shadow-lg shadow-indigo-950/60 relative group shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-500 p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-[#090e1c] rounded-[7px] flex items-center justify-center text-cyan-300 font-black text-xs sm:text-sm tracking-tighter">
                &lt;/&gt;
              </div>
            </div>
            <div className="absolute -bottom-0.5 w-5 h-1 bg-cyan-400/60 blur-[2px] rounded-full" />
          </div>

          {/* Brand Name & Subtitle */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-sans">
                PromptCode
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#271948] text-purple-300 border border-purple-500/50 shadow-xs">
                IDE 2.0
              </span>
            </div>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-medium tracking-wide">
              Code • Learn • Solve • Grow
            </span>
          </div>
        </motion.div>
      </div>

      {/* Center: Mode Switcher & Tools */}
      <div className="flex items-center gap-1.5 overflow-visible">
        {/* Scrollable category buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[32vw] md:max-w-[40vw] lg:max-w-none scrollbar-none py-1">
          {/* 1. Solve (DSA) Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCategoryClick('solve')}
          className={`shrink-0 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'solve'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 text-white font-bold shadow-lg shadow-indigo-600/30 border border-purple-400/40 ring-1 ring-purple-400/30'
              : 'bg-[#0e1424] hover:bg-[#151e36] text-slate-300 border border-[#1e2a47]'
          }`}
        >
          <span className="text-amber-300 text-xs sm:text-sm">⚡</span>
          <div className="flex flex-col text-left leading-tight">
            <span className="font-bold text-xs">Solve</span>
            <span className="text-[9px] sm:text-[10px] text-purple-200 opacity-90 font-medium">(DSA)</span>
          </div>
        </motion.button>

        {/* 2. Debugging Lab Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCategoryClick('debug')}
          className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'debug'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-lg shadow-amber-600/30 border border-amber-400/40'
              : 'bg-[#0e1424] hover:bg-[#151e36] text-slate-300 border border-[#1e2a47]'
          }`}
        >
          <Bug className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Debugging Lab</span>
          <span className="md:hidden">Debug</span>
        </motion.button>

        {/* 3. System Dev Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCategoryClick('develop')}
          className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'develop'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 border border-emerald-400/40'
              : 'bg-[#0e1424] hover:bg-[#151e36] text-slate-300 border border-[#1e2a47]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">System Dev</span>
          <span className="md:hidden">System</span>
        </motion.button>

        {/* 4. Prompt Academy Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sounds.playPop(520);
            onOpenAcademy();
          }}
          className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0e1424] hover:bg-[#151e36] text-slate-300 hover:text-white border border-[#1e2a47] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">Prompt Academy</span>
          <span className="lg:hidden">Academy</span>
        </motion.button>

        {/* 5. Prompt Optimizer Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sounds.playPop(560);
            onOpenOptimizer();
          }}
          className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0e1424] hover:bg-[#151e36] text-slate-300 hover:text-white border border-[#1e2a47] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span className="hidden lg:inline">Prompt Optimizer</span>
          <span className="lg:hidden">Optimizer</span>
        </motion.button>

        {/* 6. Problem Bank & Importer Button */}
        {onOpenImporter && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sounds.playPop(540);
              onOpenImporter();
            }}
            className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900 hover:to-indigo-900 text-purple-200 hover:text-white border border-purple-500/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            title="Import custom problems, install curated packs, or manage library"
          >
            <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline">Problem Bank</span>
              <span className="sm:hidden">Bank</span>
              {totalProblemsCount !== undefined && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {totalProblemsCount}
                </span>
              )}
            </div>
          </motion.button>
        )}
        </div>

        {/* Labs & Tools Dropdown (Outside scroll container so dropdown is fully visible) */}
        <div ref={toolsMenuRef} className="relative shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sounds.playPop(500);
              setIsToolsMenuOpen(!isToolsMenuOpen);
            }}
            className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-[#0e1424] hover:bg-[#151e36] text-slate-300 hover:text-white border border-[#1e2a47] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Tools & Labs</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          {isToolsMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#090e1c] border border-[#1f2e4e] rounded-xl shadow-2xl p-2 z-50 space-y-1 text-xs select-none">
              {onOpenCompare && (
                <button
                  onClick={() => {
                    sounds.playPop(520);
                    setIsToolsMenuOpen(false);
                    onOpenCompare();
                  }}
                  className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <GitCompare className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-bold">Prompt A/B Comparison</div>
                    <div className="text-[10px] text-slate-500">Benchmark 2 prompts & diffs</div>
                  </div>
                </button>
              )}

              {onOpenAnalytics && (
                <button
                  onClick={() => {
                    sounds.playPop(520);
                    setIsToolsMenuOpen(false);
                    onOpenAnalytics();
                  }}
                  className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">Prompt Skill Analytics</div>
                    <div className="text-[10px] text-slate-500">Radar breakdown & history</div>
                  </div>
                </button>
              )}

              {onOpenWorkflows && (
                <button onClick={() => { sounds.playPop(520); setIsToolsMenuOpen(false); onOpenWorkflows(); }} className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors">
                  <Workflow className="w-4 h-4 text-indigo-400" />
                  <div><div className="font-bold">Development Workflows</div><div className="text-[10px] text-slate-500">Save, resume, and inspect run history</div></div>
                </button>
              )}

              {onOpenRooms && (
                <button onClick={() => { sounds.playPop(520); setIsToolsMenuOpen(false); onOpenRooms(); }} className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <div><div className="font-bold">Collaboration rooms</div><div className="text-[10px] text-slate-500">Share code and chat with your team</div></div>
                </button>
              )}

              {onOpenMultiModel && (
                <button
                  onClick={() => {
                    sounds.playPop(520);
                    setIsToolsMenuOpen(false);
                    onOpenMultiModel();
                  }}
                  className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-bold">Multi-Model & Agents</div>
                    <div className="text-[10px] text-slate-500">Switch 5 LLMs & 3-agent swarm</div>
                  </div>
                </button>
              )}

              {onOpenSqlApi && (
                <button
                  onClick={() => {
                    sounds.playPop(520);
                    setIsToolsMenuOpen(false);
                    onOpenSqlApi();
                  }}
                  className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Database className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold">SQL & API Assistant</div>
                    <div className="text-[10px] text-slate-500">Index advisor & OpenAPI 3.0</div>
                  </div>
                </button>
              )}

              {onOpenLeaderboard && (
                <button
                  onClick={() => {
                    sounds.playPop(520);
                    setIsToolsMenuOpen(false);
                    onOpenLeaderboard();
                  }}
                  className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Trophy className="w-4 h-4 text-pink-400" />
                  <div>
                    <div className="font-bold">Leaderboard & Challenges</div>
                    <div className="text-[10px] text-slate-500">Global rank & daily XP</div>
                  </div>
                </button>
              )}

              {onOpenQuantum && (
                <button
                  onClick={() => {
                    sounds.playPop(520);
                    setIsToolsMenuOpen(false);
                    onOpenQuantum();
                  }}
                  className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Atom className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-bold">Optional Research Bench</div>
                    <div className="text-[10px] text-slate-500">Reproducible classical baseline</div>
                  </div>
                </button>
              )}

              {onOpenDevIntegrations && (
                <button
                  onClick={() => {
                    sounds.playPop(520);
                    setIsToolsMenuOpen(false);
                    onOpenDevIntegrations();
                  }}
                  className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-bold">Dev Integrations & Health</div>
                    <div className="text-[10px] text-slate-500">Public API, VS Code & logs</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Search, Notifications, Profile, Settings, Run */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Search Bar Capsule with Live Dropdown */}
        <div ref={searchContainerRef} className="relative hidden md:block">
          <div
            onClick={() => {
              setIsSearchOpen(true);
              searchInputRef.current?.focus();
            }}
            className="flex items-center gap-2 bg-[#0e1424] border border-[#1e2a47] rounded-full px-3 py-1.5 text-xs text-slate-400 w-44 lg:w-56 focus-within:w-64 focus-within:border-indigo-500/60 focus-within:text-slate-200 transition-all cursor-text"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search problems, tags..."
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500 w-full"
            />
            {searchQuery ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <kbd className="text-[10px] text-slate-500 bg-[#162035] px-1.5 py-0.5 rounded border border-[#23314f] shrink-0">
                Ctrl K
              </kbd>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-[#090e1c] border border-[#1f2e4e] rounded-xl shadow-2xl p-2 z-50 space-y-1 text-xs select-none">
              <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-400 border-b border-[#172033] mb-1">
                <span className="font-bold text-slate-300">
                  {searchQuery ? `Results for "${searchQuery}"` : 'Quick Problems & Bank'}
                </span>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredSearchProblems.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No matching problems found. Try another keyword.
                  </div>
                ) : (
                  filteredSearchProblems.map((p) => {
                    const diffColor =
                      p.difficulty === 'Easy'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : p.difficulty === 'Medium'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectSearchResult(p)}
                        className="w-full p-2 rounded-lg text-left hover:bg-[#131b2e] text-slate-300 hover:text-white flex items-center justify-between gap-2 cursor-pointer transition-colors"
                      >
                        <div className="truncate">
                          <div className="font-bold text-xs truncate">{p.title}</div>
                          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                            <span className="capitalize">{p.category}</span>
                            <span>•</span>
                            <span className="truncate">{p.tags.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${diffColor}`}>
                          {p.difficulty}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell with Interactive Dropdown */}
        <div ref={notifRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              sounds.playPop(500);
              setIsNotificationsOpen(!isNotificationsOpen);
            }}
            className="relative p-2 rounded-full bg-[#0e1424] border border-[#1e2a47] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Notifications & Activity"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 shadow-sm shadow-pink-500/80 animate-pulse" />
            )}
          </motion.button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#090e1c] border border-[#1f2e4e] rounded-xl shadow-2xl p-3 z-50 space-y-2 text-xs select-none">
              <div className="flex items-center justify-between pb-2 border-b border-[#172033]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-slate-400 hover:text-purple-300 cursor-pointer"
                  >
                    Mark read
                  </button>
                  <span>•</span>
                  <button
                    onClick={clearNotifications}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500">
                    No new notifications. All caught up!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border transition-colors ${
                        n.read
                          ? 'bg-[#0a0f1d] border-[#162035] opacity-75'
                          : 'bg-purple-950/20 border-purple-500/30 ring-1 ring-purple-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-full bg-[#0e1424] border border-[#1e2a47] text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute sound FX' : 'Enable sound FX'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* User Profile & Account Switcher / Login Chip (Click to open AuthModal) */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            sounds.playPop(540);
            if (onOpenAuth) {
              onOpenAuth();
            }
          }}
          className="flex items-center gap-2 bg-[#0e1424] hover:bg-[#131b2e] border border-[#1e2a47] hover:border-purple-500/60 px-2.5 py-1.5 rounded-full cursor-pointer transition-all shadow-xs"
          title="Account, Login & Profile (Click to manage)"
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-5 h-5 rounded-full ring-1 ring-purple-400/70 object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-bold">
              <User className="w-3 h-3" />
            </div>
          )}
          <span className="text-xs font-semibold text-amber-300">
            {userName}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60 shrink-0" />
          <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:inline-block" />
        </motion.div>

        {/* Settings Gear Button (Opens SettingsModal) */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            sounds.playPop(520);
            if (onOpenSettings) {
              onOpenSettings();
            }
          }}
          className="p-2 rounded-full bg-[#0e1424] hover:bg-[#131b2e] border border-[#1e2a47] hover:border-purple-500/60 text-slate-300 hover:text-white transition-colors cursor-pointer group"
          title="IDE Preferences & Settings (Font, Strictness, AI Model, Audio)"
        >
          <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
        </motion.button>

        {/* Prominent Cyan-Blue Run Button */}
        <motion.button
          id="btn-run-tests"
          whileHover={{ scale: 1.04, y: -0.5 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            sounds.playPop(700);
            onRunTests();
          }}
          disabled={isRunningTests}
          className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#00d2ff] via-[#00a6ff] to-[#0066ff] hover:opacity-95 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer select-none shrink-0"
        >
          {isRunningTests ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-white" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-white" />
              <span className="text-xs sm:text-sm">Run</span>
              <ChevronDown className="w-3 h-3 text-cyan-200 hidden sm:inline-block" />
            </>
          )}
        </motion.button>
      </div>
    </header>
  );
};
