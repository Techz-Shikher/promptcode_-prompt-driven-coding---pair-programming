import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { ChatMessage } from '../types';
import { sounds } from '../utils/sounds';

interface LiveChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  roomTitle?: string;
  connectionStatus?: 'connected' | 'connecting' | 'offline';
}

export const LiveChatDrawer: React.FC<LiveChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  roomTitle,
  connectionStatus = 'offline',
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sounds.playPop(580);
    onSendMessage(inputText);
    setInputText('');
  };

  const handleInsertTag = (tagText: string) => {
    sounds.playPop(480);
    setInputText((prev) => (prev ? `${prev} ${tagText}` : tagText));
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 350 }}
      className="fixed bottom-0 right-0 top-15 w-full sm:w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 shadow-2xl z-40 flex flex-col text-slate-200 text-xs select-none"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800/90 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-indigo-200"/></div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{roomTitle || 'Room chat'}</span>
            </div>
            <div className="text-[11px] text-slate-400">{connectionStatus === 'connected' ? 'Shared room chat · saved to this room' : 'Room chat is disconnected'}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.playPop(420);
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Quick AI Command Pills */}
      <div className="px-3.5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Quick:</span>
        </span>
        <button
          onClick={() => handleInsertTag('@ai explain current algorithm')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
        >
          @ai explain
        </button>
        <button
          onClick={() => handleInsertTag('@ai suggest adversarial test cases')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
        >
          @ai test cases
        </button>
        <button
          onClick={() => handleInsertTag('@ai critique our prompt')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
        >
          @ai critique prompt
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isAi = msg.sender === 'ai';

          return (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-semibold">
                {isAi ? (
                  <span className="text-purple-300 font-bold flex items-center gap-1.5">
                    <img
                      src="/assets/ai_chatbot_mascot.jpg"
                      alt="AI Mascot"
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 rounded-full border border-purple-400/60 object-cover"
                    />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300">PromptCode AI</span>
                  </span>
                ) : (
                  <span>{msg.senderName}</span>
                )}
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-3 rounded-2xl max-w-[90%] text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : isAi
                    ? 'bg-purple-950/70 border border-purple-700/60 text-purple-100 rounded-bl-xs'
                    : 'bg-slate-800 text-slate-200 rounded-bl-xs'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='Type message or "@ai how to prompt this..."'
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 placeholder:text-slate-500 font-normal"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
        </motion.button>
      </form>
    </motion.div>
  );
};
