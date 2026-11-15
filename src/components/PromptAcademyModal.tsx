import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Code2,
  Bug,
  Cpu,
  Award
} from 'lucide-react';
import { PROMPT_ACADEMY_LESSONS } from '../data/lessons';
import { PromptAcademyLesson } from '../types';
import { DoodleBadge, DoodleSparkle, SquiggleUnderline } from './DoodleAssets';
import { sounds } from '../utils/sounds';

interface PromptAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPracticeProblem: (problemId: string, recommendedPrompt: string) => void;
  isSignedIn: boolean;
  onSignIn: () => void;
  focusLessonId?: string | null;
}

export const PromptAcademyModal: React.FC<PromptAcademyModalProps> = ({
  isOpen,
  onClose,
  onSelectPracticeProblem,
  isSignedIn,
  onSignIn,
  focusLessonId,
}) => {
  const [activeLessonId, setActiveLessonId] = useState<string>(PROMPT_ACADEMY_LESSONS[0].id);
  const [assessment, setAssessment] = useState<Array<{ id: number; question: string; options: string[] }>>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [assessmentProgress, setAssessmentProgress] = useState<{ attempts: number; bestScore: number; completedAt: string | null } | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<{ lessonId: string; title: string; completed: boolean; attempts?: number } | null>(null);
  const [submission, setSubmission] = useState<{ score: number; correctCount: number; questionCount: number; explanations: Array<{ correct: boolean; explanation: string }>; recommendation: { lessonId: string | null; title: string | null; reason: string } } | null>(null);
  const [assessmentError, setAssessmentError] = useState('');
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  useEffect(() => {
    if (isOpen && focusLessonId && PROMPT_ACADEMY_LESSONS.some((lesson) => lesson.id === focusLessonId)) setActiveLessonId(focusLessonId);
  }, [isOpen, focusLessonId]);

  useEffect(() => {
    if (!isOpen || !isSignedIn) return;
    let active = true;
    setAssessmentError(''); setSubmission(null); setAnswers({});
    Promise.all([
      fetch(`/api/learning/lessons/${activeLessonId}/assessment`, { credentials: 'same-origin' }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
      fetch('/api/learning/challenge/today', { credentials: 'same-origin' }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    ]).then(([assessmentData, challengeData]) => {
      if (!active) return;
      setAssessment(assessmentData.questions); setAssessmentProgress(assessmentData.progress); setDailyChallenge(challengeData.challenge);
    }).catch((error) => { if (active) setAssessmentError(error instanceof Error ? error.message : 'Could not load this assessment.'); });
    return () => { active = false; };
  }, [isOpen, isSignedIn, activeLessonId]);

  if (!isOpen) return null;
  const activeLesson = PROMPT_ACADEMY_LESSONS.find((l) => l.id === activeLessonId) || PROMPT_ACADEMY_LESSONS[0];

  const submitAssessment = async () => {
    if (assessment.length === 0 || assessment.some((question) => answers[question.id] === undefined)) return;
    setSubmittingAssessment(true); setAssessmentError('');
    try {
      const isChallenge = dailyChallenge?.lessonId === activeLessonId;
      const response = await fetch(`/api/learning/lessons/${activeLessonId}/assessment`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: assessment.map((question) => answers[question.id]), dailyChallenge: isChallenge }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not submit assessment.');
      setSubmission(data); setAssessmentProgress(data.progress);
      if (isChallenge && data.score >= 0) setDailyChallenge((current) => current ? { ...current, completed: true } : current);
    } catch (error) { setAssessmentError(error instanceof Error ? error.message : 'Could not submit assessment.'); }
    finally { setSubmittingAssessment(false); }
  };

  const getCategoryIcon = (category: PromptAcademyLesson['category']) => {
    switch (category) {
      case 'DSA':
        return <Code2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Debugging':
        return <Bug className="w-3.5 h-3.5 text-amber-400" />;
      case 'Development':
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <GraduationCap className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="p-4.5 border-b border-slate-800 bg-slate-950/85 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Prompt Engineering Academy</h2>
                <DoodleBadge variant="purple" tilt={-1}>
                  Prompt-First Coding
                </DoodleBadge>
              </div>
              <p className="text-xs text-slate-400">
                Learn to solve DSA questions, debug code, and build software using prompts only
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.playPop(420);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Modal Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Lessons Navigation Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/80 border-r border-slate-800 p-3.5 space-y-1.5 overflow-y-auto shrink-0 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>Curriculum Modules</span>
              <DoodleSparkle size={12} color="#a855f7" />
            </div>
            {PROMPT_ACADEMY_LESSONS.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => {
                  sounds.playPop(480);
                  setActiveLessonId(lesson.id);
                }}
                className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-2.5 cursor-pointer ${
                  activeLessonId === lesson.id
                    ? 'bg-purple-950/70 border border-purple-700/70 text-white shadow-sm'
                    : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 text-purple-300">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 font-semibold">
                    {getCategoryIcon(lesson.category)}
                    <span>{lesson.category}</span>
                    <span className="text-[9px] text-purple-300 px-1 rounded bg-purple-900/40">
                      {lesson.level}
                    </span>
                  </div>
                  <div className="font-bold truncate text-xs">{lesson.title}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Lesson Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs select-text">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {activeLesson.category} Mastery • {activeLesson.level}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">{activeLesson.title}</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{activeLesson.summary}</p>
              <SquiggleUnderline color="#c084fc" className="w-32 h-2.5 mt-1" />
            </div>

            {/* Bad Prompt vs Good Prompt Contrast Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Bad Prompt */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 text-xs">
                  <XCircle className="w-4 h-4" />
                  <span>The Amateur Mistake (Prompt)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-900/30 text-rose-200 font-mono text-[11px] leading-relaxed">
                  "{activeLesson.badPromptExample}"
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  <strong className="text-rose-300">Why it fails: </strong>
                  {activeLesson.whyItFails}
                </p>
              </div>

              {/* Elite Prompt */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/50 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The Master Developer Prompt</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-900/30 text-emerald-200 font-mono text-[11px] leading-relaxed">
                  "{activeLesson.elitePromptExample}"
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  <strong className="text-emerald-300">Why it triumphs: </strong>
                  {activeLesson.whyItWins}
                </p>
              </div>
            </div>

            {/* Key Principles Checklist */}
            <div className="space-y-2.5">
              <div className="font-bold text-slate-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Prompt Formulation Principles:</span>
              </div>
              <div className="space-y-2">
                {activeLesson.keyPrinciples.map((principle, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2.5 text-xs shadow-xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{principle}</span>
                  </div>
                ))}
              </div>
            </div>

            <section className="rounded-2xl border border-indigo-800/60 bg-indigo-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div><h4 className="font-bold text-white">Knowledge check</h4><p className="text-[11px] text-slate-400">Server-scored assessment. Pass with at least 2 of 3 correct.</p></div>
                {assessmentProgress && <span className="text-[10px] text-indigo-200">Best {assessmentProgress.bestScore}% · {assessmentProgress.attempts} attempt(s)</span>}
              </div>
              {!isSignedIn ? <div className="text-xs text-slate-300">Sign in to take assessments and save learning progress. <button onClick={onSignIn} className="ml-1 text-indigo-300 underline">Sign in</button></div> : <>
                {assessment.map((item, index) => <div key={item.id} className="space-y-1.5"><p className="text-xs font-semibold text-slate-200">{index + 1}. {item.question}</p><div className="grid gap-1.5">{item.options.map((option, optionIndex) => <button key={optionIndex} disabled={Boolean(submission)} onClick={() => setAnswers((current) => ({ ...current, [item.id]: optionIndex }))} className={`rounded-lg border p-2 text-left text-[11px] ${answers[item.id] === optionIndex ? 'border-indigo-400 bg-indigo-900/40 text-white' : 'border-slate-800 bg-slate-950/60 text-slate-300'} disabled:opacity-80`}>{option}</button>)}</div></div>)}
                {assessmentError && <p role="alert" className="text-xs text-red-300">{assessmentError}</p>}
                {submission && <div className={`rounded-lg p-3 text-xs ${submission.score >= 67 ? 'bg-emerald-950/50 text-emerald-200' : 'bg-amber-950/50 text-amber-200'}`}><strong>{submission.score}% · {submission.correctCount}/{submission.questionCount} correct.</strong> {submission.score >= 67 ? 'Lesson complete. Your progress is saved.' : 'Review the explanations and try again.'}<div className="mt-2 space-y-1">{submission.explanations.map((item, index) => <p key={index}>{index + 1}. {item.correct ? 'Correct: ' : 'Review: '}{item.explanation}</p>)}</div><p className="mt-2">{submission.recommendation.reason}</p>{submission.recommendation.lessonId && submission.recommendation.lessonId !== activeLessonId ? <button onClick={() => setActiveLessonId(submission.recommendation.lessonId!)} className="mt-2 rounded-lg bg-emerald-700 px-3 py-1.5 font-semibold text-white">Continue: {submission.recommendation.title}</button> : submission.recommendation.lessonId === activeLessonId ? <button onClick={() => { setSubmission(null); setAnswers({}); }} className="mt-2 rounded-lg bg-amber-700 px-3 py-1.5 font-semibold text-white">Retry assessment</button> : null}</div>}
                {dailyChallenge?.lessonId === activeLessonId && <p className="text-[11px] text-amber-200">Today’s featured challenge · {dailyChallenge.completed ? 'completed' : 'submitting this assessment records your challenge result'}.</p>}
                {!submission && <button disabled={submittingAssessment || assessment.length === 0 || assessment.some((item) => answers[item.id] === undefined)} onClick={() => void submitAssessment()} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">{submittingAssessment ? 'Checking…' : 'Submit assessment'}</button>}
              </>}
            </section>

            {/* Practice Problem Action Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-800/60 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div>
                <div className="font-bold text-white text-xs">Practice This Prompt Technique Right Now</div>
                <div className="text-[11px] text-slate-300">
                  Loads the recommended challenge problem into your workspace.
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  sounds.playSuccess();
                  onSelectPracticeProblem(
                    activeLesson.practiceChallengeId,
                    activeLesson.elitePromptExample
                  );
                  onClose();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                <span>Launch Practice Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
