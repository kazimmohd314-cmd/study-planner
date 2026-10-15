import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  BookOpen,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import type {
  Task,
  Priority,
  UserSettings,
} from '../types';
import { TaskCard } from '../components/TaskCard';
import { formatDeadline } from '../utils/date';
import { sounds } from '../utils/sound';

interface TasksViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onOpenNewTask: () => void;
  onRescheduleOverdue: () => void;
  settings: UserSettings;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onOpenNewTask,
  onRescheduleOverdue,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'all'>('day');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'today' | 'overdue' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'duration'>('deadline');
  const [showFilters, setShowFilters] = useState(false);

  // Today's total planned workload
  const todayTasks = tasks.filter((t) => {
    const { isToday } = formatDeadline(t.deadline || '');
    return isToday && !t.completed;
  });
  const todayPlannedMinutes = todayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const todayPlannedHours = (todayPlannedMinutes / 60).toFixed(1);
  const maxAvailableHours = settings.dailyAvailabilityHours || 4;
  const isOverloaded = Number(todayPlannedHours) > maxAvailableHours;

  const overdueCount = tasks.filter((t) => {
    const { isOverdue } = formatDeadline(t.deadline || '');
    return isOverdue && !t.completed;
  }).length;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchSubj = task.subjectId.toLowerCase().includes(q);
          const matchNotes = task.notes?.toLowerCase().includes(q);
          if (!matchTitle && !matchSubj && !matchNotes) return false;
        }

        if (categoryFilter !== 'all' && task.category !== categoryFilter) {
          return false;
        }

        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }

        const deadlineInfo = formatDeadline(task.deadline || '');

        if (viewMode === 'day') {
          // In Day view, show today's tasks and pending overdue
          if (!deadlineInfo.isToday && !(deadlineInfo.isOverdue && !task.completed)) {
            return false;
          }
        } else if (viewMode === 'week') {
          // In Week view, show tasks within 7 days
          if (task.deadline) {
            const diffDays =
              (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            if (diffDays > 7 || diffDays < -7) return false;
          }
        }

        if (statusFilter === 'pending' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;
        if (statusFilter === 'today' && !deadlineInfo.isToday) return false;
        if (statusFilter === 'overdue' && (!deadlineInfo.isOverdue || task.completed)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'priority') {
          const weights: Record<Priority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'duration') {
          return b.estimatedMinutes - a.estimatedMinutes;
        }
        return 0;
      });
  }, [tasks, searchQuery, viewMode, categoryFilter, priorityFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200 text-left">
      {/* Title & Add Button */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Study Tasks</h2>
          <p className="text-xs text-slate-500">
            {filteredTasks.length} of {tasks.length} tasks matching criteria
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Workload Limit Warning (if daily planned > configured availability) */}
      {isOverloaded && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Workload Warning:</span> Today's planned tasks equal{' '}
            <span className="font-bold">{todayPlannedHours} hrs</span>, exceeding your configured{' '}
            {maxAvailableHours} hrs daily availability. Consider rescheduling lower priority items.
          </div>
        </div>
      )}

      {/* Reschedule Overdue Banner if overdue tasks exist */}
      {overdueCount > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-bold text-rose-900">
              {overdueCount} unfinished task{overdueCount > 1 ? 's' : ''} overdue
            </span>
          </div>

          <button
            type="button"
            onClick={onRescheduleOverdue}
            className="flex items-center gap-1 text-[11px] font-bold bg-white text-rose-700 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl border border-rose-200 shadow-2xs transition-all"
          >
            <RotateCw className="w-3 h-3 text-rose-600" />
            <span>Reschedule to Today</span>
          </button>
        </div>
      )}

      {/* View Switcher: Day, Week, All */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setViewMode('day');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'day' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Today's Plan
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setViewMode('week');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'week' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Weekly View
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setViewMode('all');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          All Tasks
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, notes, formulas..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-2xl border transition-all ${
            showFilters || categoryFilter !== 'all' || priorityFilter !== 'all'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white rounded-3xl p-4 border border-indigo-100 shadow-2xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Filter Options
            </span>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setPriorityFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Preparation Area
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="all">All Preparation Areas</option>
                <option value="semester_v">Semester V Theory</option>
                <option value="additional_theory">Additional (Backend)</option>
                <option value="gate">GATE CSE</option>
                <option value="placement">Placements</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Sort Tasks By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
              >
                <option value="deadline">Target Deadline (Urgent First)</option>
                <option value="priority">Priority (Critical & High First)</option>
                <option value="duration">Estimated Study Duration</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStartFocus={onStartFocus}
            />
          ))
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No matching study tasks</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {viewMode === 'day'
                ? "No tasks scheduled for today. You're completely up to date!"
                : 'No tasks match the active filters.'}
            </p>
            <button
              type="button"
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Study Task</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
