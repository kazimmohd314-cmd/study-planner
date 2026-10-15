import React from 'react';
import { LayoutDashboard, CheckSquare, Timer, BarChart3 } from 'lucide-react';
import { sounds } from '../utils/sound';

export type TabType = 'dashboard' | 'tasks' | 'pomodoro' | 'progress';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  pendingCount: number;
  isTimerRunning: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingCount,
  isTimerRunning,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Home',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks' as TabType,
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: 'pomodoro' as TabType,
      label: 'Focus',
      icon: Timer,
      badge: isTimerRunning ? '•' : null,
      isTimer: true,
    },
    {
      id: 'progress' as TabType,
      label: 'Stats',
      icon: BarChart3,
      badge: null,
    },
  ];

  const handleTabClick = (tabId: TabType) => {
    sounds.playClick();
    onChangeTab(tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200 touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Badge indicator */}
                {tab.badge !== null && !tab.isTimer && (
                  <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {tab.badge}
                  </span>
                )}

                {/* Pulsing timer indicator */}
                {tab.isTimer && isTimerRunning && (
                  <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                )}
              </div>

              <span className="text-[10px] mt-1 tracking-tight">
                {tab.label}
              </span>

              {/* Active bar indicator */}
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
