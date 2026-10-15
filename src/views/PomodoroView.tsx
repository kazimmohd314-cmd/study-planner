import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type {
  Task,
  PomodoroMode,
  PomodoroSettings,
  StudySessionLog,
  PreparationCategory,
} from '../types';
import { sounds } from '../utils/sound';
import { getSavedTimerState, saveTimerState } from '../utils/storage';

interface PomodoroViewProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectActiveTask: (taskId: string | null) => void;
  onPomodoroComplete: (
    taskId: string | null,
    minutes: number,
    category: PreparationCategory,
    subjectId: string
  ) => void;
  settings: PomodoroSettings;
  onUpdateSettings: (newSettings: PomodoroSettings) => void;
  sessions: StudySessionLog[];
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onPomodoroComplete,
  settings,
  onUpdateSettings,
  sessions,
}) => {
  const [mode, setMode] = useState<PomodoroMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(settings.pomodoro * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState<number>(0);
  const isCompletingRef = useRef<boolean>(false);

  // Restore saved timer state safely if present
  useEffect(() => {
    const saved = getSavedTimerState();
    if (saved && saved.timeLeft > 0) {
      setMode(saved.mode);
      setTimeLeft(saved.timeLeft);
      if (saved.activeTaskId) {
        onSelectActiveTask(saved.activeTaskId);
      }
    }
  }, []);

  // Save timer state periodically so refreshes restore accurately
  useEffect(() => {
    saveTimerState({
      mode,
      timeLeft,
      isRunning,
      activeTaskId,
      lastUpdatedTimestamp: Date.now(),
    });
  }, [mode, timeLeft, isRunning, activeTaskId]);

  const totalSeconds =
    mode === 'pomodoro'
      ? settings.pomodoro * 60
      : mode === 'shortBreak'
      ? settings.shortBreak * 60
      : settings.longBreak * 60;

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Mode change
  const handleModeChange = (newMode: PomodoroMode) => {
    sounds.playClick();
    setIsRunning(false);
    setMode(newMode);
    isCompletingRef.current = false;
    if (newMode === 'pomodoro') setTimeLeft(settings.pomodoro * 60);
    else if (newMode === 'shortBreak') setTimeLeft(settings.shortBreak * 60);
    else setTimeLeft(settings.longBreak * 60);
  };

  // Timer Tick
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isRunning && timeLeft === 0 && !isCompletingRef.current) {
      // Genuinely finished!
      isCompletingRef.current = true;
      setIsRunning(false);

      if (settings.soundEnabled) {
        sounds.playPomodoroComplete();
      }

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore
      }

      if (mode === 'pomodoro') {
        const minutes = settings.pomodoro;
        setSessionsCompletedToday((prev) => prev + 1);

        const category: PreparationCategory = activeTask?.category || 'semester_v';
        const subjectId: string = activeTask?.subjectId || 'CS301';

        onPomodoroComplete(activeTaskId, minutes, category, subjectId);

        // Switch to break
        if ((sessionsCompletedToday + 1) % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(settings.longBreak * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(settings.shortBreak * 60);
        }
      } else {
        // Break finished
        setMode('pomodoro');
        setTimeLeft(settings.pomodoro * 60);
      }
      isCompletingRef.current = false;
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, settings, activeTaskId, activeTask, sessionsCompletedToday, onPomodoroComplete]);

  const togglePlay = () => {
    sounds.playClick();
    setIsRunning(!isRunning);
  };

  // Discard / Reset without counting time
  const handleResetOrDiscard = () => {
    sounds.playClick();
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    isCompletingRef.current = false;
    saveTimerState(null);
  };

  const skipTimer = () => {
    sounds.playClick();
    setIsRunning(false);
    isCompletingRef.current = false;
    if (mode === 'pomodoro') {
      setMode('shortBreak');
      setTimeLeft(settings.shortBreak * 60);
    } else {
      setMode('pomodoro');
      setTimeLeft(settings.pomodoro * 60);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = 100 - progressRatio * 100;

  // Genuine study time today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const genuineTodayMinutes = sessions
    .filter((s) => s.timestamp.startsWith(todayDateStr))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Focus Timer</h2>
          <p className="text-xs text-slate-500">
            {mode === 'pomodoro' ? 'Deep work mode (No distractions)' : 'Recovery break'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
            sounds.playClick();
          }}
          className={`p-2.5 rounded-2xl border transition-all ${
            settings.soundEnabled
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
              : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}
          title={settings.soundEnabled ? 'Mute chime' : 'Enable chime'}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Mode Selector */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1">
        {[
          { id: 'pomodoro' as PomodoroMode, label: 'Pomodoro', dur: `${settings.pomodoro}m` },
          { id: 'shortBreak' as PomodoroMode, label: 'Short Break', dur: `${settings.shortBreak}m` },
          { id: 'longBreak' as PomodoroMode, label: 'Long Break', dur: `${settings.longBreak}m` },
        ].map((tab) => {
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleModeChange(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center ${
                isActive ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-semibold text-slate-400">{tab.dur}</span>
            </button>
          );
        })}
      </div>

      {/* Circular Timer Display */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        {isRunning && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none" />}

        <div className="relative w-60 h-60 flex items-center justify-center my-2">
          <svg className="w-60 h-60 -rotate-90 transform" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={mode === 'pomodoro' ? '#4f46e5' : '#10b981'}
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={(strokeDashoffset * 276.46) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-linear"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight tabular-nums">
              {timeFormatted}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mt-1">
              {mode === 'pomodoro' ? 'Focused Study' : 'Rest Break'}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Cycle #{(sessionsCompletedToday % 4) + 1} of 4
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-3 w-full">
          <button
            type="button"
            onClick={handleResetOrDiscard}
            className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-all"
            title="Reset / Discard session"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all ${
              isRunning ? 'bg-amber-500 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-300'
            }`}
          >
            {isRunning ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={skipTimer}
            className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-all"
            title="Skip cycle"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Discard Note */}
        {isRunning && (
          <span className="text-[11px] text-slate-400 mt-3 block">
            Press ↺ to discard this session without recording incomplete time.
          </span>
        )}
      </div>

      {/* Link Focus to Task */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span>Link Focus Session to Task</span>
          </label>
          {activeTask && (
            <button
              type="button"
              onClick={() => onSelectActiveTask(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={activeTaskId || ''}
          onChange={(e) => onSelectActiveTask(e.target.value || null)}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
        >
          <option value="">-- General Study Session (No specific task) --</option>
          {tasks
            .filter((t) => !t.completed)
            .map((t) => (
              <option key={t.id} value={t.id}>
                [{t.category.toUpperCase()}] {t.title} ({t.estimatedMinutes}m)
              </option>
            ))}
        </select>

        {activeTask && (
          <div className="text-xs bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
            <span className="font-semibold text-slate-800 truncate">{activeTask.title}</span>
            <span className="text-[11px] font-bold text-indigo-700">
              {activeTask.actualTimeSpentMinutes}m spent
            </span>
          </div>
        )}
      </div>

      {/* Genuine Summary Stats */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 block">Genuine Focus Time Today</span>
          <span className="text-[11px] text-slate-400">Strictly finished sessions only</span>
        </div>
        <span className="text-lg font-black text-indigo-600">
          {(genuineTodayMinutes / 60).toFixed(1)} hrs ({genuineTodayMinutes}m)
        </span>
      </div>
    </div>
  );
};
