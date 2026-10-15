import React from 'react';
import { Download, RefreshCw, WifiOff, Sparkles, X } from 'lucide-react';
import { usePwa } from '../hooks/usePwa';

interface PwaBannerProps {
  onDismiss?: () => void;
}

export const PwaBanner: React.FC<PwaBannerProps> = () => {
  const { isInstallable, isOffline, needRefresh, installApp, updateApp } = usePwa();
  const [dismissed, setDismissed] = React.useState(false);

  // 1. Offline Banner
  if (isOffline) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Offline mode active: all your tasks, syllabus, and study timers work uninterrupted locally.</span>
        </div>
      </div>
    );
  }

  // 2. Service Worker Update Ready Banner
  if (needRefresh) {
    return (
      <div className="bg-indigo-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md shadow-indigo-200 animate-in slide-in-from-top">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>New update available! Refresh to get the latest features.</span>
        </div>
        <button
          type="button"
          onClick={updateApp}
          className="ml-3 px-3 py-1 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Update Now</span>
        </button>
      </div>
    );
  }

  // 3. Android Chrome Install Banner (if installable and not dismissed)
  if (isInstallable && !dismissed) {
    return (
      <div className="mx-4 mt-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-3.5 shadow-lg shadow-indigo-200/50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold tracking-tight truncate">Install Study Planner</h4>
            <p className="text-[11px] text-indigo-100 truncate">Add to your Android home screen for instant offline access</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={installApp}
            className="px-3 py-1.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-extrabold shadow-xs active:scale-95 transition-all"
          >
            Install
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
