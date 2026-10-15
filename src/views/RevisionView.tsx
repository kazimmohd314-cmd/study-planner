import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import type {
  RevisionScheduleItem,
  RevisionDifficultyRating,
  UserSettings,
} from '../types';
import {
  completeRevisionAndReschedule,
  isDateDueTodayOrOverdue,
  DEFAULT_REVISION_INTERVALS,
} from '../utils/revision';
import { sounds } from '../utils/sound';

interface RevisionViewProps {
  revisions: RevisionScheduleItem[];
  onUpdateRevisions: (updated: RevisionScheduleItem[]) => void;
  settings: UserSettings;
}

export const RevisionView: React.FC<RevisionViewProps> = ({
  revisions,
  onUpdateRevisions,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'due' | 'all' | 'history'>('due');
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');

  const intervals = settings.revisionIntervals || DEFAULT_REVISION_INTERVALS;

  // Classify revisions
  const dueItems = revisions.filter((item) => {
    const { isToday, isOverdue } = isDateDueTodayOrOverdue(item.dueDate);
    return isToday || isOverdue;
  });

  const upcomingItems = revisions.filter((item) => {
    const { isToday, isOverdue } = isDateDueTodayOrOverdue(item.dueDate);
    return !isToday && !isOverdue;
  });

  const totalHistoryCount = revisions.reduce((acc, r) => acc + r.history.length, 0);

  // Complete revision handler
  const handleCompleteRevision = (item: RevisionScheduleItem, rating: RevisionDifficultyRating) => {
    sounds.playTaskCompleted();
    const updatedItem = completeRevisionAndReschedule(item, rating, intervals);
    const updatedList = revisions.map((r) => (r.id === item.id ? updatedItem : r));
    onUpdateRevisions(updatedList);
  };

  // Delete revision item
  const handleDeleteRevision = (id: string) => {
    sounds.playClick();
    onUpdateRevisions(revisions.filter((r) => r.id !== id));
  };

  // Manual reschedule
  const handleSaveReschedule = (item: RevisionScheduleItem) => {
    if (!newDueDate) return;
    sounds.playClick();
    const updated = revisions.map((r) =>
      r.id === item.id ? { ...r, dueDate: newDueDate, isOverdue: false } : r
    );
    onUpdateRevisions(updated);
    setReschedulingId(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white rounded-3xl p-5 shadow-md">
        <div className="flex items-center gap-2 text-amber-100 text-xs font-bold uppercase tracking-wider mb-1">
          <RotateCcw className="w-4 h-4 text-amber-200" />
          <span>Scientific Spaced Repetition</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">Active Revision Manager</h2>
        <p className="text-xs text-amber-100/90 mt-1 max-w-md">
          Configured intervals: {intervals.join(', ')} days. Revisit topics right before the forgetting curve drops.
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
            <span className="text-base font-black block">{dueItems.length}</span>
            <span className="text-[10px] text-amber-200 font-bold uppercase">Due Today</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
            <span className="text-base font-black block">{upcomingItems.length}</span>
            <span className="text-[10px] text-amber-200 font-bold uppercase">Upcoming</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2">
            <span className="text-base font-black block">{totalHistoryCount}</span>
            <span className="text-[10px] text-amber-200 font-bold uppercase">Total Done</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('due');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'due'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Due & Overdue ({dueItems.length})
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('all');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Upcoming ({upcomingItems.length})
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('history');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          History Log
        </button>
      </div>

      {/* List Content */}
      <div className="space-y-3">
        {activeTab === 'due' && (
          <>
            {dueItems.length > 0 ? (
              dueItems.map((item) => {
                const { isOverdue } = isDateDueTodayOrOverdue(item.dueDate);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.subjectId}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOverdue
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isOverdue ? 'Overdue Revision' : 'Due Today'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Stage #{item.intervalStage + 1} ({intervals[item.intervalStage] || 1}d)
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 mt-1.5 leading-snug">
                          {item.targetTitle}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRevision(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                        title="Remove from revision"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Completion with Difficulty feedback */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                        Complete Revision & Rate Retention:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleCompleteRevision(item, 'Easy')}
                          className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all"
                        >
                          🟢 Easy (+2 steps)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompleteRevision(item, 'Moderate')}
                          className="py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-800 border border-amber-200 text-xs font-bold transition-all"
                        >
                          🟡 Moderate (+1 step)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompleteRevision(item, 'Difficult')}
                          className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-800 border border-rose-200 text-xs font-bold transition-all"
                        >
                          🔴 Hard (1 day)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No revisions due today!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Your revision queue is clean. Check the University, GATE, or Placement tabs to add topics for scheduled review.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'all' && (
          <>
            {upcomingItems.length > 0 ? (
              upcomingItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.subjectId}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Due: {item.dueDate}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                        {item.targetTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setReschedulingId(item.id);
                          setNewDueDate(item.dueDate);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                        title="Reschedule"
                      >
                        <CalendarDays className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRevision(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {reschedulingId === item.id && (
                    <div className="pt-2 flex items-center gap-2 border-t border-slate-100 animate-in fade-in">
                      <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="text-xs p-1.5 border border-slate-200 rounded-lg outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveReschedule(item)}
                        className="text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg font-bold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setReschedulingId(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200">
                No upcoming revisions scheduled.
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {revisions.some((r) => r.history.length > 0) ? (
              revisions
                .filter((r) => r.history.length > 0)
                .map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-2"
                  >
                    <span className="text-[10px] font-bold text-slate-400">{r.subjectId}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">{r.targetTitle}</h4>

                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      {r.history.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl"
                        >
                          <span className="font-semibold">{h.date}</span>
                          <span
                            className={`font-bold ${
                              h.rating === 'Easy'
                                ? 'text-emerald-700'
                                : h.rating === 'Moderate'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            Rated: {h.rating} (Next: +{h.nextIntervalDays}d)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <div className="bg-white rounded-3xl p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200">
                No completed revision history yet. Complete due reviews to view retention logs.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
