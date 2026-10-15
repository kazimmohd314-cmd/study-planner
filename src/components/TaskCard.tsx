import React, { useState } from 'react';
import {
  Check,
  Clock,
  Calendar,
  AlertTriangle,
  Pencil,
  Trash2,
  Timer,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Task } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { formatDeadline } from '../utils/date';
import { sounds } from '../utils/sound';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStartFocus?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartFocus,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const deadlineInfo = formatDeadline(task.deadline || '');

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      sounds.playTaskCompleted();
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Ignore
      }
    }
    onToggleComplete(task);
  };

  const getCategoryBadge = () => {
    switch (task.category) {
      case 'semester_v':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Semester V Theory
          </span>
        );
      case 'additional_theory':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Additional (Backend)
          </span>
        );
      case 'gate':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            GATE CSE
          </span>
        );
      case 'placement':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
            Placement Prep
          </span>
        );
    }
  };

  return (
    <div
      className={`group relative rounded-3xl border transition-all duration-200 bg-white shadow-2xs hover:shadow-sm text-left ${
        task.completed
          ? 'border-slate-200/80 bg-slate-50/70 opacity-80'
          : deadlineInfo.isOverdue
          ? 'border-rose-300 ring-1 ring-rose-100'
          : 'border-slate-200/90 hover:border-indigo-200'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Top: Checkbox, Title & Action */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleCheckboxClick}
            aria-label={task.completed ? 'Mark task pending' : 'Mark task completed'}
            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
              task.completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 hover:border-indigo-500 bg-white'
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm sm:text-base font-bold text-slate-800 leading-snug break-words ${
                task.completed ? 'line-through text-slate-400 font-normal' : ''
              }`}
            >
              {task.title}
            </h3>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {getCategoryBadge()}
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {task.subjectId}
              </span>
              <PriorityBadge priority={task.priority} size="sm" />

              {/* Priority reason button */}
              {task.priorityReason && (
                <button
                  type="button"
                  onClick={() => setShowReason(!showReason)}
                  className="text-[10px] font-medium text-slate-400 hover:text-indigo-600 inline-flex items-center gap-0.5"
                  title="Why is this prioritized?"
                >
                  <Info className="w-3 h-3" />
                  <span>Why</span>
                </button>
              )}

              {/* Duration badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{task.estimatedMinutes}m target</span>
              </span>

              {/* Actual study time logged */}
              {task.actualTimeSpentMinutes > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  <Timer className="w-3 h-3 text-indigo-500" />
                  <span>{task.actualTimeSpentMinutes}m focused</span>
                </span>
              )}
            </div>

            {/* Priority Reason Popup */}
            {showReason && task.priorityReason && (
              <div className="mt-2 text-[11px] bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200/70 leading-relaxed">
                <span className="font-bold">Prioritization reason:</span> {task.priorityReason}
              </div>
            )}

            {/* Deadline */}
            {task.deadline && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div
                  className={`inline-flex items-center gap-1.5 font-medium ${
                    task.completed
                      ? 'text-slate-400'
                      : deadlineInfo.isOverdue
                      ? 'text-rose-600 font-bold'
                      : deadlineInfo.isToday
                      ? 'text-amber-600 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {deadlineInfo.isOverdue && !task.completed ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>
                    {deadlineInfo.isOverdue && !task.completed
                      ? `Overdue: ${deadlineInfo.text}`
                      : deadlineInfo.text}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            {task.notes && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-xs text-indigo-600 font-semibold inline-flex items-center gap-0.5"
                >
                  {showNotes ? 'Hide notes' : 'View notes'}
                  {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {showNotes && (
                  <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed break-words whitespace-pre-line">
                    {task.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
          {!task.completed && onStartFocus && (
            <button
              type="button"
              onClick={() => onStartFocus(task)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 transition-all"
            >
              <Timer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Focus Timer</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Edit task"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
