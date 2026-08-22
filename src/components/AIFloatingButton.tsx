import React from 'react';
import { Sparkles, Bot, MessageSquare } from 'lucide-react';

interface AIFloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        id="floating-ai-support-btn"
        onClick={onClick}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white rounded-full shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-300/30"
        title="Open Live AI Network Question Support Chat"
        aria-label="Open AI Network Support Chat"
      >
        {/* Pulsing beacon badge */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>

        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
            AI Support
            <Sparkles className="w-3 h-3 text-cyan-200 animate-pulse" />
          </span>
          <span className="text-[10px] text-cyan-100 font-medium leading-none">
            Live Question Solve
          </span>
        </div>
      </button>
    </div>
  );
};
