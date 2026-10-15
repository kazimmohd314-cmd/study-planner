import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  BookOpen,
  Briefcase,
  HelpCircle,
  RotateCcw,
  Timer,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import type { MainNavView } from '../types';
import { sounds } from '../utils/sound';

interface NavigationProps {
  activeView: MainNavView;
  onChangeView: (view: MainNavView) => void;
  pendingTasksCount: number;
  revisionsDueCount: number;
  isTimerRunning: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  onChangeView,
  pendingTasksCount,
  revisionsDueCount,
  isTimerRunning,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleSelectView = (view: MainNavView) => {
    sounds.playClick();
    onChangeView(view);
    setIsMoreMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard' as MainNavView, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'tasks' as MainNavView, label: 'My Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : null },
    { id: 'university' as MainNavView, label: 'University', icon: GraduationCap, badge: null },
    { id: 'gate' as MainNavView, label: 'GATE CSE', icon: BookOpen, badge: null },
    { id: 'placement' as MainNavView, label: 'Placements', icon: Briefcase, badge: null },
    { id: 'questions' as MainNavView, label: 'Questions/PYQs', icon: HelpCircle, badge: null },
    { id: 'revision' as MainNavView, label: 'Revision', icon: RotateCcw, badge: revisionsDueCount > 0 ? revisionsDueCount : null },
    { id: 'pomodoro' as MainNavView, label: 'Focus Timer', icon: Timer, isTimer: true, badge: isTimerRunning ? '•' : null },
    { id: 'progress' as MainNavView, label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'settings' as MainNavView, label: 'Settings', icon: Settings, badge: null },
  ];

  // Mobile bottom bar shows 4 primary items + More button
  const mobilePrimaryTabs: { id: MainNavView | 'more'; label: string; icon: any; badge?: number | string | null; isTimer?: boolean }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : null },
    { id: 'university', label: 'Uni Syllabus', icon: GraduationCap },
    { id: 'pomodoro', label: 'Focus', icon: Timer, isTimer: true, badge: isTimerRunning ? '•' : null },
    { id: 'more', label: 'Explore', icon: Menu, badge: revisionsDueCount > 0 ? '!' : null },
  ];

  return (
    <>
      {/* Desktop Navigation Header Bar */}
      <nav className="hidden md:flex items-center gap-1 bg-white border-b border-slate-200 px-6 py-2.5 overflow-x-auto shadow-2xs">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectView(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge !== null && !item.isTimer && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
          {mobilePrimaryTabs.map((tab) => {
            const isMoreTab = tab.id === 'more';
            const isActive = isMoreTab
              ? isMoreMenuOpen || (!['dashboard', 'tasks', 'university', 'pomodoro'].includes(activeView))
              : activeView === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (isMoreTab) {
                    sounds.playClick();
                    setIsMoreMenuOpen(!isMoreMenuOpen);
                  } else {
                    handleSelectView(tab.id as MainNavView);
                  }
                }}
                className={`relative flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-200 touch-manipulation active:scale-95 ${
                  isActive
                    ? 'text-indigo-600 font-extrabold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                    }`}
                  />

                  {tab.badge !== null && !tab.isTimer && (
                    <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                      {tab.badge}
                    </span>
                  )}

                  {tab.isTimer && isTimerRunning && (
                    <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  )}
                </div>

                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                  {tab.label}
                </span>

                {isActive && (
                  <span className="absolute -bottom-1 w-6 h-1 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile "More Sections" Slide-Up Sheet */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setIsMoreMenuOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-5 z-10 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800">
                Study Modules & Tools
              </h3>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {navItems.map((item) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectView(item.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {item.id === 'university' && 'Integral University (Sem V & Backend)'}
                          {item.id === 'gate' && 'Official GATE CSE 11 Subjects'}
                          {item.id === 'placement' && 'Aptitude, Reasoning & Technical Prep'}
                          {item.id === 'questions' && 'Verified PYQs & Practice Tracker'}
                          {item.id === 'revision' && 'Spaced Repetition (1, 3, 7, 14 days)'}
                          {item.id === 'pomodoro' && 'Accurate Study Focus Sessions'}
                          {item.id === 'progress' && 'Genuine Metrics & Analytics'}
                          {item.id === 'settings' && 'Availability, Dark/Light & Data Backup'}
                          {item.id === 'dashboard' && 'Daily Command Center'}
                          {item.id === 'tasks' && 'Daily, Weekly & Categorized Plan'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge !== null && !item.isTimer && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
