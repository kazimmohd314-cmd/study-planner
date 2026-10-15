import React from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  BookOpen,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';
import type {
  Task,
  StudySessionLog,
  UniversitySubject,
  GateSubject,
  PlacementTopic,
} from '../types';

interface ProgressViewProps {
  tasks: Task[];
  sessions: StudySessionLog[];
  universitySyllabus: UniversitySubject[];
  gateSyllabus: GateSubject[];
  placementSyllabus: PlacementTopic[];
  streakInfo: { currentStreak: number; bestStreak: number; activeDaysCount: number };
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  tasks,
  sessions,
  universitySyllabus,
  gateSyllabus,
  placementSyllabus,
  streakInfo,
}) => {
  // 1. Separate Progress Calculations
  // Semester V
  const semVSubjects = universitySyllabus.filter((s) => s.category === 'semester_v');
  const semVTotal = semVSubjects.reduce(
    (acc, s) => acc + s.units.reduce((uAcc, u) => uAcc + u.topics.length, 0),
    0
  );
  const semVDone = semVSubjects.reduce(
    (acc, s) =>
      acc +
      s.units.reduce((uAcc, u) => uAcc + u.topics.filter((t) => t.status === 'completed').length, 0),
    0
  );
  const semVPct = semVTotal > 0 ? Math.round((semVDone / semVTotal) * 100) : 0;

  // Additional Theory (Backend CS336)
  const backendSubj = universitySyllabus.find((s) => s.code === 'CS336');
  const backendTotal = backendSubj
    ? backendSubj.units.reduce((acc, u) => acc + u.topics.length, 0)
    : 0;
  const backendDone = backendSubj
    ? backendSubj.units.reduce(
        (acc, u) => acc + u.topics.filter((t) => t.status === 'completed').length,
        0
      )
    : 0;
  const backendPct = backendTotal > 0 ? Math.round((backendDone / backendTotal) * 100) : 0;

  // GATE CSE
  const gateTotal = gateSyllabus.reduce((acc, s) => acc + s.topics.length, 0);
  const gateDone = gateSyllabus.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.status === 'completed').length,
    0
  );
  const gatePct = gateTotal > 0 ? Math.round((gateDone / gateTotal) * 100) : 0;

  // Placements
  const placementTotal = placementSyllabus.length;
  const placementDone = placementSyllabus.filter((t) => t.status === 'completed').length;
  const placementPct =
    placementTotal > 0 ? Math.round((placementDone / placementTotal) * 100) : 0;

  // 2. Genuine Focus Time (Sum of finished sessions)
  const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Planned Time across all created tasks
  const totalPlannedMinutes = tasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const totalPlannedHours = (totalPlannedMinutes / 60).toFixed(1);

  // Completed Tasks
  const completedTasks = tasks.filter((t) => t.completed).length;

  // 3. Weekly Bar Data (Past 7 Days strictly from genuine sessions)
  const now = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateFormatted = d.toISOString().split('T')[0];
    return { dayStr, dateFormatted };
  });

  const dailyData = past7Days.map(({ dayStr, dateFormatted }) => {
    const dayMinutes = sessions
      .filter((s) => s.timestamp.startsWith(dateFormatted))
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      day: dayStr,
      date: dateFormatted,
      minutes: dayMinutes,
    };
  });

  const maxMinutesInWeek = Math.max(...dailyData.map((d) => d.minutes), 60);

  return (
    <div className="space-y-4 animate-in fade-in duration-200 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-md">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4 text-amber-300" />
          <span>Verified Study Analytics</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Progress & Analytics</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Strictly calculated from genuine finished sessions and verified task completions.
            </p>
          </div>

          {/* Genuine Streak */}
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-2xl text-xs font-black">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{streakInfo.currentStreak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* KPI Cards: Genuine Focus Time vs Planned Time */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-2xs">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="text-base font-black text-slate-800 block">
            {totalFocusHours} hrs
          </span>
          <span className="text-[10px] font-semibold text-slate-400">Actual Focused</span>
        </div>

        <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-2xs">
          <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="text-base font-black text-slate-800 block">
            {totalPlannedHours} hrs
          </span>
          <span className="text-[10px] font-semibold text-slate-400">Planned Time</span>
        </div>

        <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-2xs">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-base font-black text-slate-800 block">
            {completedTasks}/{tasks.length}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">Tasks Solved</span>
        </div>
      </div>

      {/* 4 Separate Preparation Area Progress Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">
            Syllabus Completion by Preparation Area
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Semester V, Additional Backend, GATE, and Placements tracked independently
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Semester V */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Semester V Theory Subjects (5 Subjects)</span>
              </span>
              <span className="font-black text-indigo-700">
                {semVPct}% ({semVDone}/{semVTotal} topics)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${semVPct}%` }}
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Additional Theory: Backend */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Additional Theory: Full Stack Backend (CS336)</span>
              </span>
              <span className="font-black text-emerald-700">
                {backendPct}% ({backendDone}/{backendTotal} topics)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${backendPct}%` }}
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* GATE CSE */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>GATE CSE (11 Core Subjects)</span>
              </span>
              <span className="font-black text-purple-700">
                {gatePct}% ({gateDone}/{gateTotal} topics)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${gatePct}%` }}
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Placements */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-cyan-600" />
                <span>College Placement Preparation</span>
              </span>
              <span className="font-black text-cyan-700">
                {placementPct}% ({placementDone}/{placementTotal} topics)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${placementPct}%` }}
                className="h-full bg-cyan-600 rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Focused Time Bar Chart */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              Weekly Focused Minutes (Past 7 Days)
            </h3>
            <span className="text-[11px] text-slate-400">
              Recorded only when Pomodoro sessions legitimately finish
            </span>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
            {totalFocusMinutes} min total
          </span>
        </div>

        {/* Bars Container */}
        <div className="h-36 flex items-end justify-between gap-2 pt-6 pb-2 px-1 border-b border-slate-100">
          {dailyData.map((d, idx) => {
            const heightPercent =
              d.minutes > 0 ? Math.max(Math.round((d.minutes / maxMinutesInWeek) * 100), 10) : 4;
            const isToday = idx === 6;

            return (
              <div key={d.day + idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.minutes}m
                </span>

                <div className="w-full max-w-[26px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      d.minutes > 0
                        ? isToday
                          ? 'bg-indigo-600 shadow-xs'
                          : 'bg-indigo-400'
                        : 'bg-slate-200'
                    }`}
                  />
                </div>

                <span
                  className={`text-[10px] font-bold ${
                    isToday ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Genuine Sessions Log */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800">Recent Completed Focus Sessions</h3>
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions
              .slice(-5)
              .reverse()
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200/60"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {s.subjectId} • {s.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    +{s.durationMinutes} min
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No completed focus sessions yet. Start a session in the Focus Timer tab to record genuine study time.
          </div>
        )}
      </div>
    </div>
  );
};
