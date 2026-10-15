import React from 'react';
import { BookOpenCheck, Flame, Plus } from 'lucide-react';

interface HeaderProps {
  streakDays: number;
  onOpenNewTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ streakDays, onOpenNewTask }) => {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 tracking-tight leading-none">
              StudyFlow
            </h1>
            <span className="text-[11px] font-semibold text-slate-400">
              {dateFormatted}
            </span>
          </div>
        </div>

        {/* Right side: Streak and Quick Add button */}
        <div className="flex items-center gap-2">
          {/* Streak pill */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/70 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{streakDays}d</span>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={onOpenNewTask}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition-all touch-manipulation active:scale-95"
            aria-label="Add task"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden xs:inline">Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
