import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, X, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/sounds';

// Cute Hand-drawn Squiggle Underline
export const SquiggleUnderline: React.FC<{ color?: string; className?: string }> = ({
  color = '#a855f7',
  className = '',
}) => (
  <svg
    viewBox="0 0 120 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
    preserveAspectRatio="none"
  >
    <motion.path
      d="M2 7C14 2 24 11 36 6C48 1 58 10 70 6C82 2 92 10 104 6C112 3 116 8 118 7"
      stroke={color}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  </svg>
);

// Hand-Drawn Curly Arrow with optional handwritten text label
export const HandDrawnArrow: React.FC<{
  label?: string;
  direction?: 'down-left' | 'down-right' | 'up-right';
  className?: string;
  color?: string;
}> = ({ label, direction = 'down-left', className = '', color = '#ec4899' }) => (
  <div className={`flex items-center gap-1.5 pointer-events-none select-none ${className}`}>
    {direction === 'down-left' && (
      <>
        {label && (
          <span
            className="text-[11px] font-bold tracking-tight italic"
            style={{ color, fontFamily: 'cursive, Comic Sans MS, sans-serif' }}
          >
            {label}
          </span>
        )}
        <svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M3 3C12 2 24 8 26 18M26 18L20 14M26 18L31 12"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
        </svg>
      </>
    )}
    {direction === 'down-right' && (
      <>
        <svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M31 3C22 2 10 8 8 18M8 18L14 14M8 18L3 12"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
        </svg>
        {label && (
          <span
            className="text-[11px] font-bold tracking-tight italic"
            style={{ color, fontFamily: 'cursive, Comic Sans MS, sans-serif' }}
          >
            {label}
          </span>
        )}
      </>
    )}
  </div>
);

// Playful Sticker Badge with hand-drawn aesthetic
export const DoodleBadge: React.FC<{
  children: React.ReactNode;
  variant?: 'amber' | 'emerald' | 'purple' | 'pink' | 'cyan';
  tilt?: number;
  className?: string;
}> = ({ children, variant = 'purple', tilt = -2, className = '' }) => {
  const styles = {
    amber: 'bg-amber-400/15 text-amber-300 border-amber-400/40 shadow-amber-500/10',
    emerald: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40 shadow-emerald-500/10',
    purple: 'bg-purple-400/15 text-purple-300 border-purple-400/40 shadow-purple-500/10',
    pink: 'bg-pink-400/15 text-pink-300 border-pink-400/40 shadow-pink-500/10',
    cyan: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/40 shadow-cyan-500/10',
  };

  return (
    <motion.span
      whileHover={{ scale: 1.08, rotate: tilt * -1.2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      style={{ transform: `rotate(${tilt}deg)` }}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-dashed shadow-xs ${styles[variant]} ${className}`}
    >
      {children}
    </motion.span>
  );
};

// Cute Hand-Drawn Star / Sparkle
export const DoodleSparkle: React.FC<{ className?: string; size?: number; color?: string }> = ({
  className = '',
  size = 18,
  color = '#f59e0b',
}) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 0.95, 1] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    className={`inline-block ${className}`}
  >
    <path d="M12 1L14.5 8.5L22 11L14.5 13.5L12 21L9.5 13.5L2 11L9.5 8.5L12 1Z" />
  </motion.svg>
);

// Interactive Toodle Companion Mascot
interface ToodleCompanionProps {
  mood?: 'happy' | 'thinking' | 'excited' | 'coaching';
  onPromptTip?: () => void;
  className?: string;
}

export const ToodleCompanion: React.FC<ToodleCompanionProps> = ({
  mood = 'happy',
  onPromptTip,
  className = '',
}) => {
  const [showSpeech, setShowSpeech] = useState<boolean>(true);
  const [currentTipIdx, setCurrentTipIdx] = useState<number>(0);
  const [isWiggling, setIsWiggling] = useState<boolean>(false);

  const promptWisdoms = [
    '👋 Hey there! I am Toodle. Ask me to specify O(N) constraints!',
    '💡 Tip: Never write loops manually—prompt for the hash map invariant!',
    '🚀 Sarah & you make a stellar pair! Navigator drives the high-level invariants.',
    '⚡️ Edge-case prompt: "Handle duplicates, empty sets, and negatives!"',
    '🔍 Got a bug? Use @ai explain in chat to trace the off-by-one error.',
  ];

  const handleToodleClick = () => {
    sounds.playToodleBoop();
    setIsWiggling(true);
    setCurrentTipIdx((prev) => (prev + 1) % promptWisdoms.length);
    setShowSpeech(true);
    setTimeout(() => setIsWiggling(false), 500);
    if (onPromptTip) onPromptTip();
  };

  return (
    <div className={`relative flex items-center gap-2 select-none ${className}`}>
      {/* Interactive Speech Bubble */}
      <AnimatePresence>
        {showSpeech && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-2 border-purple-500/50 rounded-2xl px-3 py-1.5 text-xs text-purple-200 shadow-lg shadow-purple-950/50 backdrop-blur-md max-w-xs relative"
          >
            <span className="text-pink-400 font-bold shrink-0">Toodle:</span>
            <span className="text-[11px] font-medium leading-tight text-slate-200">
              {promptWisdoms[currentTipIdx]}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeech(false);
              }}
              className="text-purple-400 hover:text-white p-0.5 rounded-full hover:bg-purple-900/50 ml-1"
              title="Dismiss note"
            >
              <X className="w-3 h-3" />
            </button>
            {/* Bubble arrow pointing right towards Toodle */}
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-950 border-t-2 border-r-2 border-purple-500/50 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toodle Mascot SVG Button */}
      <motion.button
        type="button"
        onClick={handleToodleClick}
        whileHover={{ scale: 1.15, rotate: 6 }}
        whileTap={{ scale: 0.88, rotate: -8 }}
        animate={
          isWiggling
            ? { rotate: [0, -12, 12, -8, 8, 0], y: [0, -6, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          isWiggling
            ? { duration: 0.5 }
            : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
        }
        className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center cursor-pointer border border-white/20 relative group"
        title="I am Toodle! Click me for prompt wisdom"
      >
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Pair programming headphones */}
          <div className="absolute top-1 left-1.5 right-1.5 h-3 border-t-2 border-l-2 border-r-2 border-pink-400 rounded-t-full pointer-events-none" />
          <div className="absolute top-2 -left-0.5 w-1.5 h-2 bg-pink-500 rounded-sm" />
          <div className="absolute top-2 -right-0.5 w-1.5 h-2 bg-pink-500 rounded-sm" />

          {/* Cute robot face */}
          <div className="flex flex-col items-center mt-1">
            {/* Eyes */}
            <div className="flex items-center gap-1.5">
              {mood === 'thinking' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-2 h-2 rounded-full border border-pink-400 border-dashed"
                  />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </>
              ) : mood === 'excited' ? (
                <>
                  <span className="text-[10px] text-pink-400 font-bold leading-none">^</span>
                  <span className="text-[10px] text-pink-400 font-bold leading-none">^</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.05, 0.1] }}
                    className="w-1.5 h-2 rounded-full bg-pink-400 shadow-xs shadow-pink-400"
                  />
                  <motion.div
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.05, 0.1] }}
                    className="w-1.5 h-2 rounded-full bg-amber-400 shadow-xs shadow-amber-400"
                  />
                </>
              )}
            </div>

            {/* Rosy blush cheeks & smile */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1 h-0.5 bg-rose-400/80 rounded-full" />
              <div className="w-2 h-1 border-b-2 border-white rounded-b-full" />
              <span className="w-1 h-0.5 bg-rose-400/80 rounded-full" />
            </div>
          </div>
        </div>

        {/* Pulsing online badge */}
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center">
          <span className="w-1 h-1 rounded-full bg-white animate-ping" />
        </span>
      </motion.button>
    </div>
  );
};
