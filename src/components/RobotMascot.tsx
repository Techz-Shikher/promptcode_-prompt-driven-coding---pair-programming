import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../utils/sounds';

import { ProblemCategory } from '../types';

interface RobotMascotProps {
  className?: string;
  onClick?: () => void;
  onAskPrompt?: (promptText: string) => void;
  bubbleText?: string;
  size?: 'sm' | 'md' | 'lg';
  category?: ProblemCategory;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({
  className = '',
  onClick,
  onAskPrompt,
  bubbleText: initialBubbleText,
  size = 'md',
  category = 'solve',
}) => {
  const quotesByCategory: Record<ProblemCategory, string[]> = {
    debug: [
      'Ready to isolate root causes & fix bugs!',
      'Try: "Identify root cause and write minimal fix..."',
      'Trace infinite loops, off-by-one errors & boundary bugs!',
      'Adversarial edge testing & invariant validation!',
      'Root-cause prompt: Invariant + Trace + Fix!',
      'Ask me to dry-run the failing execution trace!',
    ],
    develop: [
      'Ready for system architecture & design!',
      'Try: "Design thread-safe concurrent architecture..."',
      'API contracts, schemas & high-throughput scaling!',
      'Design for fault tolerance & minimal latency!',
      'System blueprint: Requirements + Schema + Concurrency!',
    ],
    solve: [
      'Ready for 7-section DSA solving!',
      'Try: "1. Restate, 2. Technique, 3. Invariants..."',
      '7-Section format: Algorithm + Proof + Pitfalls!',
      'Need Big-O Time & Space analyses?',
      'I can spot edge cases & pitfalls for you!',
      'Prompt-driven algorithmic problem solving!',
    ],
  };

  const quotes = quotesByCategory[category] || quotesByCategory.solve;

  const [quoteIdx, setQuoteIdx] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [expression, setExpression] = useState<'happy' | 'wink' | 'star' | 'smart'>('happy');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Automatic gentle blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  const currentQuote = initialBubbleText || quotes[quoteIdx];

  const handleMascotClick = () => {
    sounds.playToodleBoop();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);

    // Cycle expressions and quotes
    const exprs: Array<'happy' | 'wink' | 'star' | 'smart'> = ['happy', 'wink', 'star', 'smart'];
    const nextExpr = exprs[(exprs.indexOf(expression) + 1) % exprs.length];
    setExpression(nextExpr);
    setQuoteIdx((prev) => (prev + 1) % quotes.length);

    if (onClick) onClick();
  };

  const handleUsePrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop(560);
    if (onAskPrompt) {
      onAskPrompt(currentQuote.replace(/^Try asking for |^Say: "/, '').replace(/"$/, ''));
    }
  };

  const sizeDimensions = {
    sm: { w: 120, h: 120 },
    md: { w: 180, h: 180 },
    lg: { w: 220, h: 220 },
  }[size];

  return (
    <div
      onClick={handleMascotClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex flex-col items-center justify-center select-none cursor-pointer group ${className}`}
      title="Click PromptCode AI Chatbot to change expression & prompt hints!"
    >
      {/* Ambient Cosmic Glow (Transparent & Seamless - No Square Box) */}
      <div className="absolute w-48 h-48 bg-gradient-to-tr from-cyan-500/20 via-purple-600/20 to-pink-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      {/* Floating Interactive Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        key={currentQuote}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute -top-7 z-30 pointer-events-auto"
      >
        <div
          onClick={handleUsePrompt}
          className="relative bg-gradient-to-r from-[#1c1236]/95 via-[#291752]/95 to-[#171030]/95 border border-purple-400/50 hover:border-cyan-400/70 text-purple-100 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-2xl shadow-xl shadow-purple-950/80 backdrop-blur-md flex items-center gap-1.5 transition-all group/bubble"
        >
          <span>{currentQuote}</span>
          <span className="text-pink-400 text-xs animate-pulse">✦</span>
          {/* Bubble Tail Pointer */}
          <div className="absolute -bottom-1 left-7 w-2.5 h-2.5 bg-[#1c1236] border-r border-b border-purple-400/50 rotate-45 transform" />
        </div>
      </motion.div>

      {/* Ambient Floating Sparkle Particles */}
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5], y: [0, -4, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-2 left-6 text-cyan-300 text-xs font-bold pointer-events-none"
      >
        ✦
      </motion.span>
      <motion.span
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4], x: [0, 4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-12 right-2 text-pink-400 text-[11px] pointer-events-none"
      >
        ✦
      </motion.span>
      <motion.span
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-6 left-8 text-purple-400 text-xs pointer-events-none"
      >
        ✦
      </motion.span>

      {/* Seamless Floating 3D Vector Chatbot Character (Zero square borders, 100% transparent canvas) */}
      <motion.div
        animate={
          isClicked
            ? { y: [0, -18, 0], rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }
            : isHovered
            ? { y: [0, -9, 0], rotate: [0, 2, -2, 0] }
            : { y: [0, -7, 0], rotate: [0, 1.2, -1.2, 0] }
        }
        transition={{
          duration: isClicked ? 0.6 : isHovered ? 2.5 : 4,
          repeat: isClicked ? 1 : Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,210,255,0.35)] group-hover:drop-shadow-[0_18px_36px_rgba(168,85,247,0.5)] transition-all"
        style={{ width: sizeDimensions.w, height: sizeDimensions.h }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Shading Gradients */}
            <radialGradient id="robotHead" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#e2edfd" />
              <stop offset="85%" stopColor="#9cb8e6" />
              <stop offset="100%" stopColor="#6884b8" />
            </radialGradient>

            <radialGradient id="visorGlass" cx="50%" cy="36%" r="65%">
              <stop offset="0%" stopColor="#1a2238" />
              <stop offset="70%" stopColor="#0b0f1d" />
              <stop offset="100%" stopColor="#04060c" />
            </radialGradient>

            <linearGradient id="neonHeadphone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>

            <linearGradient id="bodyChassis" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#d2e3fb" />
              <stop offset="100%" stopColor="#759ad4" />
            </linearGradient>

            <linearGradient id="jetFlame" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#00f0ff" />
              <stop offset="75%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>

            {/* Neon Glow Filters */}
            <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* 3D Orbiting Ring Around Robot */}
          <ellipse
            cx="100"
            cy="142"
            rx="56"
            ry="18"
            transform="rotate(-15 100 142)"
            stroke="url(#orbitGlow)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            fill="none"
            className="animate-spin"
            style={{ transformOrigin: '100px 142px', animationDuration: '14s' }}
          />

          {/* Bottom Plasma Thruster Flame (Pulsing Jet Engine) */}
          <g transform="translate(100, 154)">
            {/* Outer Flame Cone */}
            <path
              d="M-14 0 C-10 18 0 34 0 34 C0 34 10 18 14 0 Z"
              fill="url(#jetFlame)"
              filter="url(#cyanGlow)"
              opacity="0.9"
            >
              <animate
                attributeName="d"
                values="M-14 0 C-10 18 0 34 0 34 C0 34 10 18 14 0 Z; M-15 0 C-12 24 0 42 0 42 C0 42 12 24 15 0 Z; M-14 0 C-10 18 0 34 0 34 C0 34 10 18 14 0 Z"
                dur="0.6s"
                repeatCount="indefinite"
              />
            </path>
            {/* Inner White-Hot Core */}
            <path
              d="M-6 0 C-4 10 0 20 0 20 C0 10 4 10 6 0 Z"
              fill="#ffffff"
              filter="url(#cyanGlow)"
            >
              <animate
                attributeName="d"
                values="M-6 0 C-4 10 0 20 0 20 C0 10 4 10 6 0 Z; M-7 0 C-5 14 0 26 0 26 C0 14 5 14 7 0 Z; M-6 0 C-4 10 0 20 0 20 C0 10 4 10 6 0 Z"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </path>
            {/* Thrust Sparkles */}
            <circle cx="-3" cy="28" r="1.5" fill="#00f0ff" opacity="0.8" />
            <circle cx="4" cy="32" r="1.2" fill="#d946ef" opacity="0.8" />
          </g>

          {/* Left Floating Arm */}
          <g filter="url(#softShadow)">
            <ellipse
              cx="54"
              cy="132"
              rx="10"
              ry="20"
              transform="rotate(-25 54 132)"
              fill="url(#bodyChassis)"
            />
            {/* Arm Joint Band */}
            <ellipse
              cx="51"
              cy="128"
              rx="8.5"
              ry="3"
              transform="rotate(-25 51 128)"
              fill="#1e293b"
            />
          </g>

          {/* Torso / Body Chassis */}
          <path
            d="M74 116 C74 110 126 110 126 116 L132 150 C132 158 68 158 68 150 Z"
            fill="url(#bodyChassis)"
            filter="url(#softShadow)"
          />

          {/* Chest Reactor Core: Circular glowing badge with </> */}
          <circle cx="100" cy="136" r="14" fill="#0f172a" stroke="#00f0ff" strokeWidth="2" filter="url(#cyanGlow)" />
          <circle cx="100" cy="136" r="11" fill="#0369a1" opacity="0.4" />
          {/* </> Code Symbol on Chest */}
          <text
            x="100"
            y="140"
            textAnchor="middle"
            fill="#00f0ff"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
            filter="url(#cyanGlow)"
          >
            &lt;/&gt;
          </text>

          {/* Right Waving Hand & Arm */}
          <g filter="url(#softShadow)">
            <ellipse
              cx="148"
              cy="120"
              rx="10"
              ry="22"
              transform={isHovered || isClicked ? 'rotate(45 148 120)' : 'rotate(30 148 120)'}
              fill="url(#bodyChassis)"
              style={{ transition: 'transform 0.3s ease' }}
            />
            {/* Hand Palm with gentle wave */}
            <circle
              cx={isHovered || isClicked ? '162' : '158'}
              cy={isHovered || isClicked ? '106' : '108'}
              r="7"
              fill="url(#bodyChassis)"
              style={{ transition: 'all 0.3s ease' }}
            />
          </g>

          {/* Headband of Headphones (Curved Cyber Arc) */}
          <path
            d="M52 74 C52 38 148 38 148 74"
            stroke="url(#neonHeadphone)"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
            filter="url(#softShadow)"
          />

          {/* Left Earcup */}
          <g>
            <ellipse cx="48" cy="84" rx="9" ry="16" fill="url(#neonHeadphone)" filter="url(#cyanGlow)" />
            <ellipse cx="48" cy="84" rx="6" ry="12" fill="#0d1424" />
            {/* Terminal prompt symbol '>_' on earcup */}
            <text x="46" y="87" fill="#00f0ff" fontSize="9" fontWeight="bold" fontFamily="monospace">
              &gt;_
            </text>
            {/* Sound Equalizer Waves pulsing beside ear */}
            <line x1="33" y1="80" x2="33" y2="88" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="y1" values="80;76;80" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="y2" values="88;92;88" dur="0.8s" repeatCount="indefinite" />
            </line>
            <line x1="30" y1="82" x2="30" y2="86" stroke="#d946ef" strokeWidth="1.8" strokeLinecap="round">
              <animate attributeName="y1" values="82;78;82" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="y2" values="86;90;86" dur="0.6s" repeatCount="indefinite" />
            </line>
          </g>

          {/* Right Earcup */}
          <g>
            <ellipse cx="152" cy="84" rx="9" ry="16" fill="url(#neonHeadphone)" filter="url(#cyanGlow)" />
            <ellipse cx="152" cy="84" rx="6" ry="12" fill="#0d1424" />
            {/* Terminal prompt symbol on right earcup */}
            <text x="149" y="87" fill="#00f0ff" fontSize="9" fontWeight="bold" fontFamily="monospace">
              &gt;
            </text>
            {/* Equalizer on right */}
            <line x1="167" y1="80" x2="167" y2="88" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="y1" values="80;75;80" dur="0.7s" repeatCount="indefinite" />
              <animate attributeName="y2" values="88;93;88" dur="0.7s" repeatCount="indefinite" />
            </line>
          </g>

          {/* Robot Head (Spherical 3D Capsule Chassis) */}
          <rect
            x="56"
            y="52"
            width="88"
            height="72"
            rx="36"
            fill="url(#robotHead)"
            filter="url(#softShadow)"
          />

          {/* Head Specular Highlight (Glossy Sheen Arc) */}
          <path
            d="M72 58 Q100 52 128 58"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Deep Visor Screen (Obsidian Curved Glass) */}
          <rect
            x="64"
            y="60"
            width="72"
            height="54"
            rx="26"
            fill="url(#visorGlass)"
            stroke="#1c253d"
            strokeWidth="1.5"
          />

          {/* Visor Specular Reflection */}
          <path
            d="M74 65 Q100 62 126 65"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Glowing Animated Eyes & Face Expressions */}
          {isBlinking ? (
            /* Closed Blinking Eyes - - */
            <g filter="url(#cyanGlow)">
              <line x1="77" y1="86" x2="91" y2="86" stroke="#00f0ff" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="109" y1="86" x2="123" y2="86" stroke="#00f0ff" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : expression === 'happy' ? (
            /* Friendly Happy Smiling Arcs ^ ^ */
            <g filter="url(#cyanGlow)">
              <path
                d="M77 88 Q84 80 91 88"
                stroke="#00f0ff"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M109 88 Q116 80 123 88"
                stroke="#00f0ff"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : expression === 'wink' ? (
            /* Playful Wink ^ - */
            <g filter="url(#cyanGlow)">
              <path
                d="M77 88 Q84 80 91 88"
                stroke="#00f0ff"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <line x1="109" y1="88" x2="123" y2="88" stroke="#00f0ff" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : expression === 'star' ? (
            /* Starry Coding Eyes ✦ ✦ */
            <g filter="url(#cyanGlow)">
              <text x="84" y="90" textAnchor="middle" fill="#00f0ff" fontSize="13" fontWeight="bold">
                ✦
              </text>
              <text x="116" y="90" textAnchor="middle" fill="#00f0ff" fontSize="13" fontWeight="bold">
                ✦
              </text>
            </g>
          ) : (
            /* Smart Analysis Eyes > < */
            <g filter="url(#cyanGlow)">
              <path d="M78 84 L88 88 L78 92" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M122 84 L112 88 L122 92" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* Cute Soft Blush Marks under eyes */}
          <ellipse cx="80" cy="97" rx="4" ry="2" fill="#00d2ff" opacity="0.45" />
          <ellipse cx="120" cy="97" rx="4" ry="2" fill="#00d2ff" opacity="0.45" />

          {/* Smiling Mouth */}
          <path
            d="M95 96 Q100 100 105 96"
            stroke="#00f0ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#cyanGlow)"
          />
        </svg>
      </motion.div>

      {/* Interactive Companion Action Strip under Mascot */}
      <div className="flex items-center gap-2 mt-1 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMascotClick();
          }}
          className="px-2.5 py-0.5 rounded-full bg-[#161f38] hover:bg-[#212e52] border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
        >
          <span>✨ Say Hi</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onAskPrompt) {
              sounds.playPop(520);
              if (category === 'debug') {
                onAskPrompt(
                  'Act as a Senior Debugger. In the provided code, identify the exact root cause of the bug, explain which invariant was violated, and provide the corrected code.'
                );
              } else if (category === 'develop') {
                onAskPrompt(
                  'Design a robust, scalable system architecture for this service with API contracts, data model, and concurrency guarantees.'
                );
              } else {
                onAskPrompt(
                  'Solve this DSA question strictly using the 7-section format: 1. Restating the problem, 2. Naming the technique, 3. Key observations, 4. The algorithm, 5. Correctness arguments, 6. Complexity analyses, 7. Potential pitfalls.'
                );
              }
            }
          }}
          className="px-2.5 py-0.5 rounded-full bg-[#241640] hover:bg-[#341d5e] border border-purple-500/40 text-purple-200 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
        >
          {category === 'debug' ? (
            <span>🔍 Root Cause & Fix</span>
          ) : category === 'develop' ? (
            <span>🏗️ Architecture Prompt</span>
          ) : (
            <span>🎯 7-Section Prompt</span>
          )}
        </button>
      </div>
    </div>
  );
};

export const CyberWaveGraphic: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 500 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="waveSoft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <path
        d="M0 140 C120 180 200 40 320 120 C380 160 450 110 500 130"
        stroke="url(#waveCyanBlue)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 150 C140 170 210 60 330 110 C400 140 460 90 500 110"
        stroke="url(#waveSoft)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        fill="none"
      />
      <path
        d="M0 130 C100 150 180 80 300 135 C380 170 440 130 500 145"
        stroke="#00d2ff"
        strokeWidth="1"
        strokeOpacity="0.3"
        fill="none"
      />

      <circle cx="160" cy="110" r="2.5" fill="#00f0ff" opacity="0.8" />
      <circle cx="280" cy="90" r="3" fill="#38bdf8" opacity="0.9" />
      <circle cx="360" cy="135" r="2" fill="#818cf8" opacity="0.7" />
      <circle cx="430" cy="115" r="2" fill="#c084fc" opacity="0.6" />
    </svg>
  );
};
