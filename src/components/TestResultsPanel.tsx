import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Play,
  RotateCcw,
  Plus,
  Terminal
} from 'lucide-react';
import { TestCase, TestCaseExecutionResult } from '../types';
import { sounds } from '../utils/sounds';

interface TestResultsPanelProps {
  testCases: TestCase[];
  testResults: TestCaseExecutionResult[] | null;
  isRunning: boolean;
  statusMessage?: string | null;
  onRunTests: () => void;
  onAddCustomTestCase: (input: string, expected: string) => void;
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({
  testCases,
  testResults,
  isRunning,
  statusMessage,
  onRunTests,
  onAddCustomTestCase,
}) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [customExpected, setCustomExpected] = useState<string>('');

  const allPassed = testResults && testResults.length > 0 && testResults.every((r) => r.passed);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    sounds.playPop(550);
    onAddCustomTestCase(customInput, customExpected || 'Custom Output');
    setCustomInput('');
    setCustomExpected('');
    setShowAddCustom(false);
  };

  const currentTestCase = testCases[selectedCaseIdx] || testCases[0];
  const currentResult = testResults ? testResults[selectedCaseIdx] : null;

  return (
    <div className="h-full flex flex-col bg-slate-900/90 border-t border-slate-800 text-slate-200 text-xs overflow-hidden select-none">
      {/* Header Bar */}
      <div className="px-4 py-2.5 border-b border-slate-800/90 bg-slate-950/80 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Test Suite</span>
          </div>

          {testResults && (
            <div className="flex items-center gap-2 ml-1">
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                  allPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {allPassed ? '🎉 All Tests Passed' : '⚠️ Some Tests Failed'}
              </motion.span>
              <span className="text-slate-400 font-mono text-[11px]">
                ({testResults.filter((r) => r.passed).length}/{testResults.length})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              sounds.playPop(520);
              setShowAddCustom(!showAddCustom);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Case</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playPop(680);
              onRunTests();
            }}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Tests</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="border-b border-slate-800 bg-slate-950/50 px-4 py-2 text-[10px] text-slate-400">
        Runs the editor as a complete stdin/stdout program in an isolated Judge0 worker. Function-only snippets need a runnable entry point; input and expected output must be plain stdin/stdout text.
      </div>

      {/* Custom Case Drawer */}
      <AnimatePresence>
        {showAddCustom && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddCustom}
            className="p-3.5 bg-slate-950 border-b border-slate-800 space-y-2.5 shadow-inner"
          >
            <div className="font-bold text-slate-200 text-xs">Add Custom Test Case</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Input Arguments:</label>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. nums = [1, 2, 3], target = 5"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Expected Output (Optional):</label>
                <input
                  type="text"
                  value={customExpected}
                  onChange={(e) => setCustomExpected(e.target.value)}
                  placeholder="e.g. [0, 2]"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
              >
                Add Case
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Test Case Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto">
        {testCases.map((tc, idx) => {
          const result = testResults ? testResults[idx] : null;
          return (
            <button
              key={tc.id}
              onClick={() => {
                sounds.playPop(480);
                setSelectedCaseIdx(idx);
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCaseIdx === idx
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {selectedCaseIdx === idx && (
                <motion.div
                  layoutId="testCasePill"
                  className="absolute inset-0 bg-slate-800 rounded-lg border border-slate-700/80 shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {result && (
                  result.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  )
                )}
                <span>Case {idx + 1}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Test Case Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text">
        {statusMessage && (
          <div role="status" className="rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-amber-200">
            {statusMessage}
          </div>
        )}
        {currentTestCase ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">{currentTestCase.label}</span>
              {currentResult && (
                <div className="flex items-center gap-3 font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {currentResult.executionTimeMs} ms
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    {currentResult.memoryMb} MB
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Input:</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-200">
                {currentTestCase.input}
              </div>
            </div>

            {/* Output Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expected Output:</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-emerald-400">
                  {currentTestCase.expected}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actual Output:</span>
                <div
                  className={`p-3 rounded-xl border font-mono ${
                    currentResult
                      ? currentResult.passed
                        ? 'bg-emerald-950/20 border-emerald-700/50 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-700/50 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {currentResult ? currentResult.actualOutput : 'Click "Run Tests" to execute'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-center py-4">No test cases configured</div>
        )}
      </div>
    </div>
  );
};
