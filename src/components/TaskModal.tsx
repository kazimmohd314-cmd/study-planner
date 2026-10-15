import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import type { Task, Priority, PreparationCategory, TaskStatus } from '../types';
import { calculateSuggestedPriority } from '../utils/priority';
import { toInputDateTimeValue } from '../utils/date';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completedMinutes' | 'completed'> & { id?: string }) => void;
  initialTask?: Task | null;
  defaultCategory?: PreparationCategory;
  defaultSubjectId?: string;
  defaultTitle?: string;
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultCategory = 'semester_v',
  defaultSubjectId = 'CS301',
  defaultTitle = '',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PreparationCategory>(defaultCategory);
  const [subjectId, setSubjectId] = useState(defaultSubjectId);
  const [priority, setPriority] = useState<Priority>('High');
  const [priorityReason, setPriorityReason] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [deadline, setDeadline] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setCategory(initialTask.category);
      setSubjectId(initialTask.subjectId);
      setPriority(initialTask.priority);
      setPriorityReason(initialTask.priorityReason || '');
      setStatus(initialTask.status);
      setDeadline(initialTask.deadline || '');
      setPlannedDate(initialTask.plannedDate || '');
      setEstimatedMinutes(initialTask.estimatedMinutes);
      setNotes(initialTask.notes || '');
    } else {
      setTitle(defaultTitle);
      setCategory(defaultCategory);
      setSubjectId(defaultSubjectId);
      const d = new Date();
      d.setHours(19, 0, 0, 0);
      setDeadline(toInputDateTimeValue(d));
      setPlannedDate(d.toISOString().split('T')[0]);
      setEstimatedMinutes(45);
      setNotes('');
      setStatus('todo');

      // Calculate initial suggested priority
      const suggestion = calculateSuggestedPriority({
        deadline: toInputDateTimeValue(d),
      });
      setPriority(suggestion.priority);
      setPriorityReason(suggestion.reason);
    }
    setError('');
  }, [initialTask, isOpen, defaultCategory, defaultSubjectId, defaultTitle]);

  if (!isOpen) return null;

  const handleDeadlineChange = (val: string) => {
    setDeadline(val);
    const suggestion = calculateSuggestedPriority({
      deadline: val,
      manualImportance: priority,
    });
    setPriority(suggestion.priority);
    setPriorityReason(suggestion.reason);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      category,
      subjectId: subjectId.trim() || 'General',
      priority,
      priorityReason,
      status,
      deadline: deadline || undefined,
      plannedDate: plannedDate || (deadline ? deadline.split('T')[0] : undefined),
      estimatedMinutes: Number(estimatedMinutes) || 30,
      actualTimeSpentMinutes: initialTask?.actualTimeSpentMinutes || 0,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity text-left">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10 animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-slate-800">
              {initialTask ? 'Edit Study Task' : 'New Study Task'}
            </h2>
            <p className="text-xs text-slate-500">Plan tasks for Semester V, Backend, GATE, or Placement</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Revise Dijkstra's algorithm & solve 2 GATE PYQs"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-xs sm:text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preparation Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'semester_v' as PreparationCategory, label: 'Semester V Theory' },
                { id: 'additional_theory' as PreparationCategory, label: 'Additional Theory (Backend)' },
                { id: 'gate' as PreparationCategory, label: 'GATE CSE' },
                { id: 'placement' as PreparationCategory, label: 'Placements' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    if (cat.id === 'semester_v') setSubjectId('CS301');
                    else if (cat.id === 'additional_theory') setSubjectId('CS336');
                    else if (cat.id === 'gate') setSubjectId('Algorithms');
                    else setSubjectId('Quantitative Aptitude');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                    category === cat.id
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject / Course Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subject Name / Course Code
            </label>
            <input
              type="text"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="e.g. CS301 (DAA), CS336 (Backend), TOC, Quant"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
            />
          </div>

          {/* Priority with Explanation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Priority Level
              </label>
              {priorityReason && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                  {priorityReason}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['Critical', 'High', 'Medium', 'Low'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                let activeClass = 'bg-slate-100 text-slate-700 border-slate-300';
                if (p === 'Critical') activeClass = 'bg-rose-500 text-white border-rose-500';
                if (p === 'High') activeClass = 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200';
                if (p === 'Medium') activeClass = 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200';
                if (p === 'Low') activeClass = 'bg-slate-100 text-slate-700 border-slate-300';

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPriority(p);
                      setPriorityReason(`Manually set to ${p}`);
                    }}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      isSelected ? activeClass : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Target Deadline</span>
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => handleDeadlineChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
            />
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Planned Duration (Minutes)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {DURATION_PRESETS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setEstimatedMinutes(dur)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    estimatedMinutes === dur
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dur >= 60 ? `${dur / 60}h` : `${dur}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes & Key Topics (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Important formulas, question numbers, textbook reference..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
