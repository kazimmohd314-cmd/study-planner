import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import type { GateSubject, GateTopic, TopicStatus } from '../types';
import { sounds } from '../utils/sound';

interface GateViewProps {
  gateSyllabus: GateSubject[];
  onUpdateGateSyllabus: (updated: GateSubject[]) => void;
  onCreateTaskFromTopic: (subjectTitle: string, topicTitle: string, topicId: string) => void;
  onScheduleRevision: (topic: GateTopic, subjectTitle: string) => void;
}

export const GateView: React.FC<GateViewProps> = ({
  gateSyllabus,
  onUpdateGateSyllabus,
  onCreateTaskFromTopic,
  onScheduleRevision,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('discrete_math');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'completed'>('all');

  const selectedSubject =
    gateSyllabus.find((s) => s.id === selectedSubjectId) || gateSyllabus[0];

  // Overall GATE progress
  const totalGateTopics = gateSyllabus.reduce((acc, s) => acc + s.topics.length, 0);
  const completedGateTopics = gateSyllabus.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.status === 'completed').length,
    0
  );
  const overallGateProgress =
    totalGateTopics > 0 ? Math.round((completedGateTopics / totalGateTopics) * 100) : 0;

  const totalPyqs = gateSyllabus.reduce(
    (acc, s) => acc + s.topics.reduce((tAcc, t) => tAcc + t.pyqCount, 0),
    0
  );
  const completedPyqs = gateSyllabus.reduce(
    (acc, s) => acc + s.topics.reduce((tAcc, t) => tAcc + t.completedPyqs, 0),
    0
  );

  const handleUpdateTopic = (topicId: string, updates: Partial<GateTopic>) => {
    sounds.playClick();
    const updatedSyllabus = gateSyllabus.map((subj) => {
      if (subj.id !== selectedSubject.id) return subj;
      const updatedTopics = subj.topics.map((t) => {
        if (t.id !== topicId) return t;
        return { ...t, ...updates };
      });
      return { ...subj, topics: updatedTopics };
    });
    onUpdateGateSyllabus(updatedSyllabus);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 text-white rounded-3xl p-5 shadow-md">
        <div className="flex items-center gap-2 text-violet-200 text-xs font-bold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>Official GATE CS Syllabus • 11 Core Subjects</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">GATE CSE Preparation</h2>
        <p className="text-xs text-violet-100/90 mt-1 max-w-md">
          Structured in beginner-friendly sequence with clear prerequisite dependencies and verified PYQ tracking.
        </p>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-[10px] text-violet-200 font-bold uppercase block">
              Syllabus Concepts
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black">{overallGateProgress}%</span>
              <span className="text-[11px] text-violet-100">
                {completedGateTopics} / {totalGateTopics} topics
              </span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                style={{ width: `${overallGateProgress}%` }}
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-[10px] text-violet-200 font-bold uppercase block">
              PYQs Practiced
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black">
                {totalPyqs > 0 ? Math.round((completedPyqs / totalPyqs) * 100) : 0}%
              </span>
              <span className="text-[11px] text-violet-100">
                {completedPyqs} / {totalPyqs} solved
              </span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                style={{
                  width: `${totalPyqs > 0 ? (completedPyqs / totalPyqs) * 100 : 0}%`,
                }}
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Beginner-friendly Subject Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {gateSyllabus
          .sort((a, b) => a.beginnerOrder - b.beginnerOrder)
          .map((subj) => {
            const isSelected = selectedSubject?.id === subj.id;
            const completedCount = subj.topics.filter((t) => t.status === 'completed').length;
            const progress =
              subj.topics.length > 0
                ? Math.round((completedCount / subj.topics.length) * 100)
                : 0;

            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedSubjectId(subj.id);
                }}
                className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all touch-manipulation flex items-center gap-2 ${
                  isSelected
                    ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {subj.beginnerOrder}
                </span>
                <span className="truncate max-w-[130px]">{subj.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {progress}%
                </span>
              </button>
            );
          })}
      </div>

      {/* Subject Header & Search */}
      {selectedSubject && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                Beginner Step #{selectedSubject.beginnerOrder} of 11
              </span>
              <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
                {selectedSubject.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedSubject.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search GATE topics or subtopics..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none font-medium"
            >
              <option value="all">All Status</option>
              <option value="not_started">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      )}

      {/* Topics List with Prerequisites & PYQ counters */}
      {selectedSubject && (
        <div className="space-y-3">
          {selectedSubject.topics
            .filter((t) => {
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = t.title.toLowerCase().includes(q);
                const matchSub = t.subtopics.some((st) => st.toLowerCase().includes(q));
                if (!matchTitle && !matchSub) return false;
              }
              if (statusFilter === 'not_started' && t.status === 'completed') return false;
              if (statusFilter === 'completed' && t.status !== 'completed') return false;
              return true;
            })
            .map((topic) => {
              const hasPrereq = topic.prerequisites && topic.prerequisites.length > 0;

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3"
                >
                  {/* Topic Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Topic #{topic.beginnerOrder}
                        </span>
                        {hasPrereq && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>Requires: {topic.prerequisites.join(', ')}</span>
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-bold mt-1.5 ${
                          topic.status === 'completed'
                            ? 'text-slate-400 line-through'
                            : 'text-slate-800'
                        }`}
                      >
                        {topic.title}
                      </h4>

                      {/* Subtopics */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {topic.subtopics.map((st, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <select
                      value={topic.status}
                      onChange={(e) =>
                        handleUpdateTopic(topic.id, {
                          status: e.target.value as TopicStatus,
                        })
                      }
                      className={`text-[11px] font-bold px-2 py-1 rounded-xl border outline-none ${
                        topic.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : topic.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* PYQ Counter and Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    {/* PYQ count */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600">
                        PYQs Solved:
                      </span>
                      <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200/60 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateTopic(topic.id, {
                              completedPyqs: Math.max(0, topic.completedPyqs - 1),
                            })
                          }
                          className="px-1 hover:text-purple-900"
                        >
                          -
                        </button>
                        <span>
                          {topic.completedPyqs} / {topic.pyqCount}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateTopic(topic.id, {
                              completedPyqs: Math.min(topic.pyqCount, topic.completedPyqs + 1),
                            })
                          }
                          className="px-1 hover:text-purple-900"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onScheduleRevision(topic, selectedSubject.title)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-600" />
                        <span>Revise</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onCreateTaskFromTopic(selectedSubject.title, topic.title, topic.id)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200"
                      >
                        <Plus className="w-3 h-3 text-purple-600" />
                        <span>Study Task</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
