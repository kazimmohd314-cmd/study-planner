import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Clock,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';
import type { UserSettings, Priority } from '../types';
import { exportFullBackup, importFullBackup, resetAllAppData } from '../utils/storage';
import { sounds } from '../utils/sound';
import { usePwa } from '../hooks/usePwa';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onDataImported: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onDataImported,
}) => {
  const [dailyHours, setDailyHours] = useState(settings.dailyAvailabilityHours);
  const [pomodoroMins, setPomodoroMins] = useState(settings.pomodoro.pomodoro);
  const [shortBreakMins, setShortBreakMins] = useState(settings.pomodoro.shortBreak);
  const [longBreakMins, setLongBreakMins] = useState(settings.pomodoro.longBreak);
  const [uniExamDate, setUniExamDate] = useState(settings.universityExamDate || '');
  const [gateExamDate, setGateExamDate] = useState(settings.gateExamDate || '');
  const [placementTargetDate, setPlacementTargetDate] = useState(settings.placementTargetDate || '');
  const [defaultPriority, setDefaultPriority] = useState<Priority>(settings.defaultPriority || 'High');
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme || 'light');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // PWA State & Installation
  const { isInstallable, isInstalled, isOffline, needRefresh, installApp, updateApp } = usePwa();
  const [updateCheckStatus, setUpdateCheckStatus] = useState<string | null>(null);

  const handleCheckForUpdates = async () => {
    sounds.playClick();
    setUpdateCheckStatus('Checking for latest version...');
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          setTimeout(() => {
            setUpdateCheckStatus('Study Planner is up to date with the latest build!');
          }, 600);
        } else {
          setUpdateCheckStatus('Service Worker registered.');
        }
      } catch {
        setUpdateCheckStatus('Update check complete.');
      }
    } else {
      setUpdateCheckStatus('Service Worker not supported in this browser.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    const updated: UserSettings = {
      ...settings,
      dailyAvailabilityHours: Number(dailyHours) || 4,
      pomodoro: {
        ...settings.pomodoro,
        pomodoro: Number(pomodoroMins) || 25,
        shortBreak: Number(shortBreakMins) || 5,
        longBreak: Number(longBreakMins) || 15,
      },
      universityExamDate: uniExamDate,
      gateExamDate: gateExamDate,
      placementTargetDate: placementTargetDate,
      defaultPriority,
      theme,
    };
    onUpdateSettings(updated);
    setImportStatus({ type: 'success', message: 'Settings successfully saved!' });
  };

  const handleExportBackup = () => {
    sounds.playClick();
    const jsonStr = exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFullBackup(content);
      if (res.success) {
        sounds.playTaskCompleted();
        setImportStatus({ type: 'success', message: res.message });
        onDataImported();
      } else {
        setImportStatus({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to completely clear all data? This cannot be undone.')) {
      resetAllAppData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 text-left">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Preferences & Data</h2>
            <p className="text-xs text-slate-500">Configure your study targets, intervals, and backups</p>
          </div>
        </div>

        {importStatus && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* Availability & Targets */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Study Availability & Exam Milestones</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Study Availability (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Used to prevent unrealistic daily workloads.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Task Priority
              </label>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value as Priority)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                App Theme
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Light Theme
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Dark Theme
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                University Exam Target Date
              </label>
              <input
                type="date"
                value={uniExamDate}
                onChange={(e) => setUniExamDate(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                GATE CSE Target Date
              </label>
              <input
                type="date"
                value={gateExamDate}
                onChange={(e) => setGateExamDate(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Placement Drives Start Date
              </label>
              <input
                type="date"
                value={placementTargetDate}
                onChange={(e) => setPlacementTargetDate(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pomodoro Durations */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Focus & Break Durations</span>
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Focus (min)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={pomodoroMins}
                onChange={(e) => setPomodoroMins(Number(e.target.value))}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Short Break (min)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreakMins}
                onChange={(e) => setShortBreakMins(Number(e.target.value))}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Long Break (min)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreakMins}
                onChange={(e) => setLongBreakMins(Number(e.target.value))}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-center font-bold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all touch-manipulation"
        >
          Save Configuration
        </button>
      </form>
      {/* PWA App Installation & Offline Engine */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>Progressive Web App (PWA)</span>
          </h3>
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              isInstalled
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            {isInstalled ? 'Installed App Mode' : 'Web Browser Mode'}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Study Planner runs as a standalone Android app with full offline capabilities, instant launch from your home screen, and isolated storage.
        </p>

        {/* Install Button / Instructions */}
        {isInstallable && (
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-indigo-950">Android Install Ready</p>
              <p className="text-[11px] text-indigo-700">Add icon to home screen and app drawer</p>
            </div>
            <button
              type="button"
              onClick={installApp}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>
        )}

        {!isInstalled && !isInstallable && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">How to install manually on Android Chrome:</p>
            <p>1. Open Chrome menu (tap the three dots <span className="font-bold">⋮</span> in top right).</p>
            <p>2. Tap <span className="font-bold">"Install app"</span> or <span className="font-bold">"Add to Home screen"</span>.</p>
            <p>3. Confirm installation. The app icon will appear on your device launcher.</p>
          </div>
        )}

        {/* Network & Update Details */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2">
            {isOffline ? (
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Network</span>
              <span className="text-xs font-bold text-slate-700 truncate block">
                {isOffline ? 'Offline (Cached)' : 'Online (Connected)'}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Storage</span>
              <span className="text-xs font-bold text-slate-700 truncate block">
                100% Local Device
              </span>
            </div>
          </div>
        </div>

        {/* Update Checker Button */}
        <div className="pt-1 flex flex-col gap-2">
          {needRefresh ? (
            <button
              type="button"
              onClick={updateApp}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Update Ready — Tap to Reload</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCheckForUpdates}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Check for App Updates</span>
            </button>
          )}

          {updateCheckStatus && (
            <p className="text-[11px] text-center font-semibold text-indigo-600 animate-in fade-in">
              {updateCheckStatus}
            </p>
          )}
        </div>
      </div>

      {/* Data Backup and LocalStorage Privacy */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Download className="w-4 h-4 text-indigo-500" />
          <span>Data Storage & Backups</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your data is stored 100% locally in your device's browser localStorage. It is private, runs offline, and does not depend on cloud servers. Export periodic backups to keep your syllabus progress safe.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>

          <label className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-rose-500 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Erase All Data & Reset Installation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
