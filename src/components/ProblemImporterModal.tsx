import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Download,
  Sparkles,
  BookOpen,
  Code2,
  Check,
  AlertCircle,
  FolderPlus,
  Package,
  FileCode,
  Trash2,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { Problem, ProblemCategory, Difficulty, SupportedLanguage, ProblemPack } from '../types';
import { CURATED_PACKS } from '../data/problems';
import {
  saveCustomProblem,
  deleteCustomProblem,
  importProblemPack,
  exportProblemsAsJSON,
  exportProblemAsMarkdown
} from '../utils/customProblems';
import { sounds } from '../utils/sounds';

interface ProblemImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemSelected: (problem: Problem) => void;
  customProblems: Problem[];
  onProblemsUpdated: () => void;
  activeProblem: Problem;
}

export const ProblemImporterModal: React.FC<ProblemImporterModalProps> = ({
  isOpen,
  onClose,
  onProblemSelected,
  customProblems,
  onProblemsUpdated,
  activeProblem,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual' | 'packs' | 'json' | 'my-library'>('ai');

  // AI Import State
  const [rawText, setRawText] = useState('');
  const [targetCategory, setTargetCategory] = useState<ProblemCategory>('solve');
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('typescript');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Problem | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Manual Builder State
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<ProblemCategory>('solve');
  const [manualDifficulty, setManualDifficulty] = useState<Difficulty>('Medium');
  const [manualTags, setManualTags] = useState('Array, Hash Table');
  const [manualDescription, setManualDescription] = useState('');
  const [manualInputExample, setManualInputExample] = useState('nums = [2, 7, 11, 15], target = 9');
  const [manualOutputExample, setManualOutputExample] = useState('[0, 1]');
  const [manualConstraints, setManualConstraints] = useState('1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9');
  const [manualStarterCode, setManualStarterCode] = useState(
    'export function solveProblem(input: any): any {\n  // Implement solution\n  return null;\n}'
  );

  // JSON Import State
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Success Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // 1. AI Parse Handler
  const handleAiParse = async () => {
    if (!rawText.trim()) {
      setParseError('Please paste problem text first.');
      return;
    }

    setIsParsing(true);
    setParseError(null);
    sounds.playPop(520);

    try {
      const res = await fetch('/api/problem/import-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          targetCategory,
          language: targetLanguage,
        }),
      });

      if (!res.ok) throw new Error('Failed to parse problem');
      const data: Problem = await res.json();
      setParsedPreview(data);
      sounds.playSuccess();
    } catch (err: any) {
      console.error(err);
      setParseError('Could not parse problem. Check your network or try pasting clearer problem text.');
    } finally {
      setIsParsing(false);
    }
  };

  // Save AI Parsed Problem
  const handleSaveParsedPreview = () => {
    if (!parsedPreview) return;
    saveCustomProblem(parsedPreview);
    onProblemsUpdated();
    sounds.playSuccess();
    showNotification(`Saved "${parsedPreview.title}" to your problem bank!`);
    onProblemSelected(parsedPreview);
    onClose();
  };

  // 2. Manual Form Save Handler
  const handleSaveManual = () => {
    if (!manualTitle.trim()) {
      showNotification('Title is required');
      return;
    }

    const slug = manualTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `custom-${Date.now()}`;

    const tags = manualTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const constraints = manualConstraints
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    const newProb: Problem = {
      id: slug,
      title: manualTitle.trim(),
      category: manualCategory,
      difficulty: manualDifficulty,
      acceptance: '50.0%',
      tags: tags.length > 0 ? tags : ['General'],
      learningObjective: `Master optimal algorithm design and 7-section prompt breakdown for ${manualTitle}.`,
      promptLearningTarget: `Enforce boundary edge cases and time-complexity invariants for ${manualTitle}.`,
      description: manualDescription.trim() || `Solve ${manualTitle} with optimal asymptotic complexity.`,
      examples: [
        {
          input: manualInputExample.trim(),
          output: manualOutputExample.trim(),
          explanation: 'Standard test case',
        },
      ],
      constraints: constraints.length > 0 ? constraints : ['Handle boundary edge cases'],
      starterCode: {
        typescript: manualStarterCode,
        python: `# Python implementation\ndef solution(input):\n    return None`,
        cpp: `// C++ implementation\nauto solution(auto input) {\n    return 0;\n}`,
        java: `class Solution {\n    public Object solve(Object input) {\n        return null;\n    }\n}`,
        go: `package main\nfunc solve(input interface{}) interface{} {\n    return nil\n}`,
      },
      testCases: [
        {
          id: 'tc1',
          input: manualInputExample.trim(),
          expected: manualOutputExample.trim(),
          label: 'Primary test case',
        },
      ],
      recommendedPrompt: `Solve the DSA question "${manualTitle.trim()}" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.`,
      promptTips: [
        'Strictly mandates the 7 canonical DSA sections.',
        'Demands loop invariant proof and boundary edge case disclosure.',
        'Forces optimal asymptotic Big-O derivation.',
      ],
      isCustom: true,
      importedAt: new Date().toISOString(),
      source: 'Manual Entry',
    };

    saveCustomProblem(newProb);
    onProblemsUpdated();
    sounds.playSuccess();
    showNotification(`Created "${newProb.title}"!`);
    onProblemSelected(newProb);
    onClose();
  };

  // 3. Pack Import Handler
  const handleImportPack = (pack: ProblemPack) => {
    sounds.playPop(580);
    const { added } = importProblemPack(pack);
    onProblemsUpdated();
    sounds.playSuccess();
    showNotification(`Imported pack "${pack.title}" (${added} new problems added)!`);
    if (pack.problems.length > 0) {
      onProblemSelected(pack.problems[0]);
    }
  };

  // 4. JSON Import Handler
  const handleImportJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonText);
      const items: Problem[] = Array.isArray(parsed) ? parsed : [parsed];

      let count = 0;
      for (const item of items) {
        if (!item.title || !item.id) {
          throw new Error('Each problem must have at least "id" and "title"');
        }
        saveCustomProblem({
          ...item,
          category: item.category || 'solve',
          difficulty: item.difficulty || 'Medium',
          acceptance: item.acceptance || '50.0%',
          tags: item.tags || ['Custom'],
          learningObjective: item.learningObjective || `Master prompt-driven problem solving for ${item.title}.`,
          description: item.description || '',
          examples: item.examples || [],
          constraints: item.constraints || [],
          starterCode: item.starterCode || {
            typescript: '// starter code',
            python: '# starter code',
            cpp: '// starter code',
            java: '// starter code',
            go: '// starter code',
          },
          testCases: item.testCases || [],
          recommendedPrompt:
            item.recommendedPrompt ||
            `Solve the DSA question "${item.title}" strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.`,
          promptTips: item.promptTips || ['Follow 7 canonical DSA sections.'],
          isCustom: true,
          importedAt: new Date().toISOString(),
          source: 'JSON Import',
        });
        count++;
      }

      onProblemsUpdated();
      sounds.playSuccess();
      showNotification(`Successfully imported ${count} problem(s) from JSON!`);
      if (items.length > 0) {
        onProblemSelected(items[0]);
      }
      setJsonText('');
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON format');
    }
  };

  // Delete custom problem
  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop(420);
    deleteCustomProblem(id);
    onProblemsUpdated();
    showNotification('Problem removed from your library');
  };

  // Load sample LeetCode problem for testing AI parser
  const handleLoadSample = (sampleType: 'trapping' | 'lru' | 'course') => {
    sounds.playPop(480);
    if (sampleType === 'trapping') {
      setRawText(`42. Trapping Rain Water (Hard)
Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

Example 1:
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.

Example 2:
Input: height = [4,2,0,3,2,5]
Output: 9

Constraints:
n == height.length
1 <= n <= 2 * 10^4
0 <= height[i] <= 10^5`);
      setTargetCategory('solve');
    } else if (sampleType === 'course') {
      setRawText(`210. Course Schedule II (Medium)
There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.

Return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.

Example 1:
Input: numCourses = 2, prerequisites = [[1,0]]
Output: [0,1]
Explanation: There are a total of 2 courses to take. To take course 1 you should have finished course 0. So the correct course order is [0,1].

Constraints:
1 <= numCourses <= 2000
0 <= prerequisites.length <= numCourses * (numCourses - 1)`);
      setTargetCategory('solve');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl max-h-[90vh] bg-[#0c101d] border border-[#1e2a47] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#172033] bg-[#090d18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <FolderPlus className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-sans">
                  Problem Bank Expansion & Custom Importer
                </h2>
                <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-500/30">
                  {customProblems.length} Custom
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Import problems from LeetCode / competitive platforms, create custom challenges, or install curated packs.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playPop(420);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#162035] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-950/60 border-b border-emerald-500/30 px-6 py-2 text-xs font-semibold text-emerald-300 flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-[#172033] bg-[#0b0f19] text-xs overflow-x-auto">
          <button
            onClick={() => {
              sounds.playPop(480);
              setActiveTab('ai');
            }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-purple-600/30 text-white border border-purple-500/50 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>⚡ AI Smart Parse</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(500);
              setActiveTab('manual');
            }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-purple-600/30 text-white border border-purple-500/50 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Manual Builder</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(520);
              setActiveTab('packs');
            }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'packs'
                ? 'bg-purple-600/30 text-white border border-purple-500/50 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Curated Packs ({CURATED_PACKS.length})</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(540);
              setActiveTab('json');
            }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'json'
                ? 'bg-purple-600/30 text-white border border-purple-500/50 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>JSON & Export</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop(560);
              setActiveTab('my-library');
            }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ml-auto ${
              activeTab === 'my-library'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/50 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>My Problems ({customProblems.length})</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 select-text">
          {/* TAB 1: AI SMART PARSE */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">Paste Any Problem Text</div>
                  <p className="text-slate-300 leading-relaxed">
                    Paste raw text from LeetCode, Codeforces, HackerRank, GeeksforGeeks, an interview document, or your homework.
                    PromptCode AI will automatically structure it, create test cases, generate starter code in 5 languages, and craft the canonical 7-section DSA prompt.
                  </p>
                </div>
              </div>

              {/* Sample Shortcuts */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Quick Sample:</span>
                <button
                  type="button"
                  onClick={() => handleLoadSample('trapping')}
                  className="px-2.5 py-1 rounded-lg bg-[#162035] hover:bg-[#1f2d4a] text-cyan-300 transition-colors cursor-pointer text-[11px]"
                >
                  Trapping Rain Water (Hard)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('course')}
                  className="px-2.5 py-1 rounded-lg bg-[#162035] hover:bg-[#1f2d4a] text-cyan-300 transition-colors cursor-pointer text-[11px]"
                >
                  Course Schedule II (Medium)
                </button>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Raw Problem Statement or Markdown:</label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Example:\n\n128. Longest Consecutive Sequence\nGiven an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\nYou must write an algorithm that runs in O(n) time.\n\nExample 1:\nInput: nums = [100,4,200,1,3,2]\nOutput: 4\nExplanation: The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.\n\nConstraints:\n0 <= nums.length <= 10^5`}
                  rows={8}
                  className="w-full bg-[#080c16] border border-[#1e2a47] rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-all leading-relaxed"
                />
              </div>

              {/* Category & Language Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Target Mode / Category:</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value as ProblemCategory)}
                    className="w-full bg-[#0e1424] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="solve">⚡ Solve (DSA Algorithm Problem)</option>
                    <option value="debug">🐛 Debugging Lab (Buggy Code Fix)</option>
                    <option value="develop">💻 System Dev (Architecture Contract)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Starter Code Language:</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
                    className="w-full bg-[#0e1424] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (std::vector)</option>
                    <option value="java">Java (Solution class)</option>
                    <option value="go">Go (golang)</option>
                  </select>
                </div>
              </div>

              {parseError && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                disabled={isParsing || !rawText.trim()}
                onClick={handleAiParse}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Parsing & Generating 7-Section DSA Specification...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-pink-300" />
                    <span>⚡ Parse with AI & Formulate 7-Section Prompt</span>
                  </>
                )}
              </button>

              {/* Parsed Preview Card */}
              {parsedPreview && (
                <div className="p-4 rounded-xl bg-[#090e1c] border border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1a253d] pb-2.5">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{parsedPreview.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {parsedPreview.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Tags: {parsedPreview.tags.join(' · ')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveParsedPreview}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/40 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save & Open Problem</span>
                    </button>
                  </div>

                  {/* 7 Section Prompt Preview */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                      Generated 7-Section DSA Prompt:
                    </span>
                    <div className="p-2.5 rounded-lg bg-[#070b14] border border-[#1b253b] text-slate-300 font-mono text-[11px] leading-relaxed">
                      "{parsedPreview.recommendedPrompt}"
                    </div>
                  </div>

                  {/* Test Cases Count */}
                  <div className="text-xs text-slate-400">
                    Generated {parsedPreview.testCases.length} verified test cases and starter templates for 5 languages.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL BUILDER */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Problem Title:</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Valid Palindrome II"
                    className="w-full bg-[#080c16] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Difficulty:</label>
                  <select
                    value={manualDifficulty}
                    onChange={(e) => setManualDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-[#0e1424] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category:</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as ProblemCategory)}
                    className="w-full bg-[#0e1424] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="solve">⚡ Solve (DSA Algorithm Problem)</option>
                    <option value="debug">🐛 Debugging Lab</option>
                    <option value="develop">💻 System Dev</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Tags (comma-separated):</label>
                  <input
                    type="text"
                    value={manualTags}
                    onChange={(e) => setManualTags(e.target.value)}
                    placeholder="e.g. Two Pointers, String, Greedy"
                    className="w-full bg-[#080c16] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description (Markdown):</label>
                <textarea
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Describe the problem, input/output requirements, and return type..."
                  rows={4}
                  className="w-full bg-[#080c16] border border-[#1e2a47] rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Primary Example Input:</label>
                  <input
                    type="text"
                    value={manualInputExample}
                    onChange={(e) => setManualInputExample(e.target.value)}
                    placeholder="nums = [1, 2, 3], target = 3"
                    className="w-full bg-[#080c16] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Primary Example Output:</label>
                  <input
                    type="text"
                    value={manualOutputExample}
                    onChange={(e) => setManualOutputExample(e.target.value)}
                    placeholder="[0, 2]"
                    className="w-full bg-[#080c16] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Starter Code (TypeScript):</label>
                <textarea
                  value={manualStarterCode}
                  onChange={(e) => setManualStarterCode(e.target.value)}
                  rows={4}
                  className="w-full bg-[#080c16] border border-[#1e2a47] rounded-xl p-3 text-xs font-mono text-slate-200 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveManual}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save Custom Problem & Generate 7-Section Prompt</span>
              </button>
            </div>
          )}

          {/* TAB 3: CURATED PACKS */}
          {activeTab === 'packs' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Install curated, interview-tested problem sets directly into your library. All problems include 7-section prompt templates, starter code, and verified test cases.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CURATED_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="p-4 rounded-xl bg-[#090e1c] border border-[#1c2946] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30">
                          {pack.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {pack.problems.length} Problems
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5">{pack.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pack.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {pack.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded bg-[#131b2e] text-slate-300 border border-[#1f2e4e]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleImportPack(pack)}
                      className="w-full py-2 px-3 rounded-lg bg-[#1a253d] hover:bg-purple-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-purple-300" />
                      <span>Import Pack to Library</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: JSON & EXPORT */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              {/* Export Buttons */}
              <div className="p-3.5 rounded-xl bg-[#090e1c] border border-[#1c2946] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white">Export Study Materials</div>
                  <div className="text-[11px] text-slate-400">
                    Download problems as JSON or export the active problem as a Markdown 7-Section Cheatsheet.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop(520);
                      exportProblemsAsJSON([...customProblems]);
                      showNotification('Exported problems JSON!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#141d33] hover:bg-[#1e2c4d] text-cyan-300 font-semibold text-xs border border-[#23355a] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop(560);
                      exportProblemAsMarkdown(activeProblem);
                      showNotification(`Exported "${activeProblem.title}" study sheet!`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 font-semibold text-xs border border-purple-500/40 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Export Active MD</span>
                  </button>
                </div>
              </div>

              {/* JSON Paste Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Import Problem(s) from JSON:
                </label>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder={`[\n  {\n    "id": "my-custom-algo",\n    "title": "My Custom Algorithm",\n    "category": "solve",\n    "difficulty": "Medium",\n    "tags": ["Array"],\n    "description": "...",\n    "examples": [{ "input": "...", "output": "..." }]\n  }\n]`}
                  rows={8}
                  className="w-full bg-[#080c16] border border-[#1e2a47] rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              <button
                type="button"
                disabled={!jsonText.trim()}
                onClick={handleImportJson}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>Parse & Save JSON Problem(s)</span>
              </button>
            </div>
          )}

          {/* TAB 5: MY PROBLEMS */}
          {activeTab === 'my-library' && (
            <div className="space-y-3">
              {customProblems.length === 0 ? (
                <div className="p-8 text-center space-y-2 border border-dashed border-[#1c2946] rounded-xl">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-300">No custom problems imported yet</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Use the <strong>AI Smart Parse</strong> tab or <strong>Curated Packs</strong> to import your first DSA questions into your personal bank.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Try AI Smart Parse</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {customProblems.map((prob) => (
                    <div
                      key={prob.id}
                      onClick={() => {
                        sounds.playPop(520);
                        onProblemSelected(prob);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-[#090e1c] border border-[#1b2742] hover:border-purple-500/60 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                            {prob.title}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              prob.difficulty === 'Easy'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : prob.difficulty === 'Medium'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {prob.tags.join(' · ')} • Source: {prob.source || 'Custom'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playPop(540);
                            exportProblemAsMarkdown(prob);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162035] transition-colors cursor-pointer"
                          title="Export as Markdown Cheatsheet"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustom(prob.id, e)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete from custom library"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
