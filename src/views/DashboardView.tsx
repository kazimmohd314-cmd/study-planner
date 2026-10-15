import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  RotateCcw,
  GraduationCap,
  Layers,
  BookOpen,
  Briefcase,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import type {
  Task,
  MainNavView,
  UniversitySubject,
  GateSubject,
  PlacementTopic,
  RevisionScheduleItem,
  StudySessionLog,
} from '../types';
import { TaskCard } from '../components/TaskCard';
import { formatDeadline } from '../utils/date';

interface DashboardViewProps {
  tasks: Task[];
  sessions: StudySessionLog[];
  universitySyllabus: UniversitySubject[];
  gateSyllabus: GateSubject[];
  placementSyllabus: PlacementTopic[];
  revisions: RevisionScheduleItem[];
  streakInfo: { currentStreak: number; bestStreak: number; activeDaysCount: number };
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onNavigateView: (view: MainNavView) => void;
  onOpenNewTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  sessions,
  universitySyllabus,
  gateSyllabus,
  placementSyllabus,
  revisions,
  streakInfo,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onNavigateView,
  onOpenNewTask,
}) => {
  // Filter today's tasks
  const todayTasks = tasks.filter((t) => {
    const { isToday, isOverdue } = formatDeadline(t.deadline || '');
    return isToday || (isOverdue && !t.completed);
  });

  const todayCompletedCount = todayTasks.filter((t) => t.completed).length;
  const todayTotalCount = todayTasks.length;
  const todayProgressPercent =
    todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  // Revisions due today
  const todayStr = new Date().toISOString().split('T')[0];
  const revisionsDueCount = revisions.filter((r) => r.dueDate <= todayStr).length;

  // Genuine study time today
  const genuineTodayMinutes = sessions
    .filter((s) => s.timestamp.startsWith(todayStr))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Separate progress calculations
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

  const gateTotal = gateSyllabus.reduce((acc, s) => acc + s.topics.length, 0);
  const gateDone = gateSyllabus.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.status === 'completed').length,
    0
  );
  const gatePct = gateTotal > 0 ? Math.round((gateDone / gateTotal) * 100) : 0;

  const placementTotal = placementSyllabus.length;
  const placementDone = placementSyllabus.filter((t) => t.status === 'completed').length;
  const placementPct =
    placementTotal > 0 ? Math.round((placementDone / placementTotal) * 100) : 0;

  // Top pending task for today
  const nextUpTask = todayTasks.find((t) => !t.completed) || tasks.find((t) => !t.completed);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 text-left">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-5 shadow-lg shadow-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>3rd Year CSE • Study Planner</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-300/30 px-2.5 py-1 rounded-full text-xs font-extrabold">
            <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>{streakInfo.currentStreak} Day Streak</span>
          </div>
        </div>

        <h2 className="text-xl font-extrabold tracking-tight mt-1">
          {getGreeting()}, Scholar!
        </h2>
        <p className="text-xs text-indigo-100/90 mt-1 max-w-sm">
          {todayTotalCount - todayCompletedCount > 0
            ? `${todayTotalCount - todayCompletedCount} tasks remaining for today. Focus on foundational concepts first.`
            : 'All scheduled tasks for today are completed! Keep up the consistency.'}
        </p>

        {/* Circular Progress & Today's Metric */}
        <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-indigo-950/60"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 transition-all duration-500 ease-out"
                  strokeDasharray={`${todayProgressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black text-white">
                {todayProgressPercent}%
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-white block">Today's Tasks</span>
              <span className="text-[11px] text-indigo-200">
                {todayCompletedCount} of {todayTotalCount} completed
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-black text-white block">
              {(genuineTodayMinutes / 60).toFixed(1)} hrs
            </span>
            <span className="text-[11px] text-indigo-200">Actual Focused</span>
          </div>
        </div>
      </div>

      {/* Revision Alert Banner if revisions due */}
      {revisionsDueCount > 0 && (
        <div
          onClick={() => onNavigateView('revision')}
          className="bg-amber-50 border border-amber-300 rounded-3xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100/60 transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                {revisionsDueCount} Spaced Revision{revisionsDueCount > 1 ? 's' : ''} Due Today
              </span>
              <span className="text-[11px] text-amber-700">
                Review now before forgetting sets in.
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-700" />
        </div>
      )}

      {/* Quick Launch Focus Card (if a pending task exists) */}
      {nextUpTask && (
        <div className="bg-white rounded-3xl p-4 border border-indigo-100 shadow-2xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
              Priority Focus Target
            </span>
            <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
              {nextUpTask.title}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              {nextUpTask.subjectId} • {nextUpTask.estimatedMinutes}m target
            </span>
          </div>

          <button
            type="button"
            onClick={() => onStartFocus(nextUpTask)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all touch-manipulation"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Focus</span>
          </button>
        </div>
      )}

      {/* 4 Preparation Area Quick Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1 mb-2">
          Preparation Areas
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Semester V */}
          <div
            onClick={() => onNavigateView('university')}
            className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs cursor-pointer hover:border-indigo-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-indigo-700">{semVPct}%</span>
            </div>
            <span className="text-xs font-bold text-slate-800 block">Semester V Theory</span>
            <span className="text-[10px] text-slate-400">{semVDone}/{semVTotal} topics</span>
          </div>

          {/* Backend */}
          <div
            onClick={() => onNavigateView('university')}
            className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs cursor-pointer hover:border-emerald-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-emerald-700">{backendPct}%</span>
            </div>
            <span className="text-xs font-bold text-slate-800 block">Backend (CS336)</span>
            <span className="text-[10px] text-slate-400">Additional Theory (Sem III)</span>
          </div>

          {/* GATE CSE */}
          <div
            onClick={() => onNavigateView('gate')}
            className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs cursor-pointer hover:border-purple-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-purple-700">{gatePct}%</span>
            </div>
            <span className="text-xs font-bold text-slate-800 block">GATE CSE (11 Subj)</span>
            <span className="text-[10px] text-slate-400">{gateDone}/{gateTotal} topics</span>
          </div>

          {/* Placements */}
          <div
            onClick={() => onNavigateView('placement')}
            className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs cursor-pointer hover:border-cyan-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-cyan-700">{placementPct}%</span>
            </div>
            <span className="text-xs font-bold text-slate-800 block">Placements Portal</span>
            <span className="text-[10px] text-slate-400">{placementDone}/{placementTotal} topics</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Today's Schedule</h3>
            <span className="text-xs text-slate-500">
              {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} planned
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenNewTask}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStartFocus={onStartFocus}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-dashed border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No pending tasks for today</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Add a new task or explore the University, GATE, and Placement portals to plan your study targets.
            </p>
            <button
              type="button"
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Today's Task</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
