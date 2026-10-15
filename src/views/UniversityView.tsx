import React, { useState } from 'react';
import {
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  RotateCcw,
  Edit3,
} from 'lucide-react';
import type {
  UniversitySubject,
  SyllabusTopic,
  TopicStatus,
  ConfidenceLevel,
  Priority,
} from '../types';
import { sounds } from '../utils/sound';

interface UniversityViewProps {
  universitySyllabus: UniversitySubject[];
  onUpdateSyllabus: (updated: UniversitySubject[]) => void;
  onCreateTaskFromTopic: (subject: UniversitySubject, topic: SyllabusTopic) => void;
  onScheduleRevision: (topic: SyllabusTopic, subjectTitle: string) => void;
}

export const UniversityView: React.FC<UniversityViewProps> = ({
  universitySyllabus,
  onUpdateSyllabus,
  onCreateTaskFromTopic,
  onScheduleRevision,
}) => {
  const [activeTab, setActiveTab] = useState<'semester_v' | 'additional_theory'>('semester_v');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('CS301');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'CS301-1': true,
    'CS336-1': true,
  });
  const [editingNotesTopicId, setEditingNotesTopicId] = useState<string | null>(null);

  // Filter subjects by active category
  const activeSubjects = universitySyllabus.filter((s) => s.category === activeTab);

  // Fallback selected subject if changed tab
  const currentSubject =
    activeSubjects.find((s) => s.code === selectedSubjectCode) || activeSubjects[0];

  const toggleUnit = (unitKey: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitKey]: !prev[unitKey] }));
  };

  // Update a single topic
  const handleUpdateTopic = (
    subjectCode: string,
    topicId: string,
    updates: Partial<SyllabusTopic>
  ) => {
    sounds.playClick();
    const updatedSyllabus = universitySyllabus.map((subj) => {
      if (subj.code !== subjectCode) return subj;

      const updatedUnits = subj.units.map((unit) => {
        const updatedTopics = unit.topics.map((t) => {
          if (t.id !== topicId) return t;

          const updatedTopic = { ...t, ...updates };
          // If status set to completed, set completed date
          if (updates.status === 'completed' && !t.completedDate) {
            updatedTopic.completedDate = new Date().toISOString().split('T')[0];
          } else if (updates.status && updates.status !== 'completed') {
            updatedTopic.completedDate = undefined;
          }
          return updatedTopic;
        });

        return { ...unit, topics: updatedTopics };
      });

      return { ...subj, units: updatedUnits };
    });

    onUpdateSyllabus(updatedSyllabus);
  };

  // Calculate completion percentage for a subject
  const getSubjectProgress = (subject: UniversitySubject) => {
    let total = 0;
    let completed = 0;
    subject.units.forEach((u) => {
      u.topics.forEach((t) => {
        total++;
        if (t.status === 'completed') completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Calculate Category Progress
  const semVSubjects = universitySyllabus.filter((s) => s.category === 'semester_v');
  const semVTotalTopics = semVSubjects.reduce(
    (acc, s) => acc + s.units.reduce((uAcc, u) => uAcc + u.topics.length, 0),
    0
  );
  const semVCompletedTopics = semVSubjects.reduce(
    (acc, s) =>
      acc +
      s.units.reduce(
        (uAcc, u) => uAcc + u.topics.filter((t) => t.status === 'completed').length,
        0
      ),
    0
  );
  const semVProgress =
    semVTotalTopics > 0 ? Math.round((semVCompletedTopics / semVTotalTopics) * 100) : 0;

  const backendSubject = universitySyllabus.find((s) => s.code === 'CS336');
  const backendProgress = backendSubject ? getSubjectProgress(backendSubject) : 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-700 text-white rounded-3xl p-5 shadow-md">
        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
          <GraduationCap className="w-4 h-4 text-amber-300" />
          <span>Integral University, Lucknow • Session 2026-27</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">University Theory Syllabus</h2>
        <p className="text-xs text-indigo-100/90 mt-1 max-w-md">
          Syllabus extracted from official syllabus document. Theory subjects organized by Units and Topics with topic-level tracking.
        </p>

        {/* Category Completion Summary Badges */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-[10px] text-indigo-200 font-bold uppercase block">
              Semester V Theory (5 Subjects)
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black">{semVProgress}%</span>
              <span className="text-[11px] text-indigo-100">
                {semVCompletedTopics} of {semVTotalTopics} topics
              </span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                style={{ width: `${semVProgress}%` }}
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-[10px] text-teal-200 font-bold uppercase block">
              Additional Theory (Backend CS336)
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black">{backendProgress}%</span>
              <span className="text-[11px] text-teal-100">Year II, Sem III</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                style={{ width: `${backendProgress}%` }}
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs: Semester V vs Additional Theory Subjects */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('semester_v');
            const firstSemV = universitySyllabus.find((s) => s.category === 'semester_v');
            if (firstSemV) setSelectedSubjectCode(firstSemV.code);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all touch-manipulation ${
            activeTab === 'semester_v'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Semester V Theory ({semVSubjects.length})
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('additional_theory');
            setSelectedSubjectCode('CS336');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all touch-manipulation ${
            activeTab === 'additional_theory'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Additional Theory Subjects (Backend)
        </button>
      </div>

      {/* Subject Pills (Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {activeSubjects.map((subj) => {
          const isSelected = currentSubject?.code === subj.code;
          const prog = getSubjectProgress(subj);

          return (
            <button
              key={subj.code}
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedSubjectCode(subj.code);
              }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all touch-manipulation flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono">{subj.code}</span>
              <span className="font-normal opacity-90 truncate max-w-[120px]">
                {subj.title.split(' ')[0]}...
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {prog}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Subject Overview Card */}
      {currentSubject && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {currentSubject.code}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {currentSubject.category === 'additional_theory'
                    ? 'Additional Theory (Year II, Semester III)'
                    : `Year ${currentSubject.year}, Semester ${currentSubject.semester}`}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  L:{currentSubject.lecture} T:{currentSubject.tutorial} P:{currentSubject.practical} C:{currentSubject.credits}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-800 mt-1">
                {currentSubject.title}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-slate-800">
                {getSubjectProgress(currentSubject)}%
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">Done</span>
            </div>
          </div>

          {/* Search within subject */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search units, topics or subtopics..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Units and Topics Accordion List */}
      {currentSubject && (
        <div className="space-y-3">
          {currentSubject.units.map((unit) => {
            const unitKey = `${currentSubject.code}-${unit.unitNumber}`;
            const isExpanded = expandedUnits[unitKey] ?? false;

            // Filter topics by search query if any
            const visibleTopics = unit.topics.filter(
              (t) =>
                !searchQuery.trim() ||
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.subtopics.some((st) => st.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (searchQuery.trim() && visibleTopics.length === 0) return null;

            const unitCompletedCount = unit.topics.filter((t) => t.status === 'completed').length;
            const unitTotalCount = unit.topics.length;
            const unitPercent =
              unitTotalCount > 0 ? Math.round((unitCompletedCount / unitTotalCount) * 100) : 0;

            return (
              <div
                key={unitKey}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                {/* Unit Header */}
                <button
                  type="button"
                  onClick={() => toggleUnit(unitKey)}
                  className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                      U{unit.unitNumber}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                        Unit {unit.unitNumber}: {unit.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {unit.contactHours} Contact Hrs {unit.mappedCO ? `• ${unit.mappedCO}` : ''} •{' '}
                        {unitCompletedCount}/{unitTotalCount} Topics ({unitPercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Topics Container */}
                {isExpanded && (
                  <div className="p-4 space-y-3 divide-y divide-slate-100">
                    {visibleTopics.map((topic) => (
                      <div key={topic.id} className="pt-3 first:pt-0 space-y-2.5">
                        {/* Title and Status Check */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h5
                              className={`text-xs sm:text-sm font-bold ${
                                topic.status === 'completed'
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-800'
                              }`}
                            >
                              {topic.title}
                            </h5>

                            {/* Subtopics Pill Cloud */}
                            {topic.subtopics && topic.subtopics.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {topic.subtopics.map((st, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                                  >
                                    {st}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quick Status Toggle */}
                          <select
                            value={topic.status}
                            onChange={(e) =>
                              handleUpdateTopic(currentSubject.code, topic.id, {
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

                        {/* Interactive Controls Bar: Confidence, Priority, Revision, Task */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            {/* Confidence Selector */}
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Conf:
                              </span>
                              <select
                                value={topic.confidence}
                                onChange={(e) =>
                                  handleUpdateTopic(currentSubject.code, topic.id, {
                                    confidence: e.target.value as ConfidenceLevel,
                                  })
                                }
                                className="text-[10px] font-semibold bg-slate-100 rounded-md px-1.5 py-0.5 border-none outline-none text-slate-700"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>

                            {/* Priority Selector */}
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Priority:
                              </span>
                              <select
                                value={topic.priority}
                                onChange={(e) =>
                                  handleUpdateTopic(currentSubject.code, topic.id, {
                                    priority: e.target.value as Priority,
                                  })
                                }
                                className="text-[10px] font-semibold bg-slate-100 rounded-md px-1.5 py-0.5 border-none outline-none text-slate-700"
                              >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>

                            {/* Question Count increment */}
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateTopic(currentSubject.code, topic.id, {
                                  questionPracticeCount: topic.questionPracticeCount + 1,
                                })
                              }
                              className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 hover:bg-indigo-100"
                              title="Click to add practice question solved"
                            >
                              Practice: {topic.questionPracticeCount} Qs
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5">
                            {/* Schedule Revision */}
                            <button
                              type="button"
                              onClick={() => onScheduleRevision(topic, currentSubject.title)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-600" />
                              <span>Revise</span>
                            </button>

                            {/* Create Daily Task */}
                            <button
                              type="button"
                              onClick={() => onCreateTaskFromTopic(currentSubject, topic)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg border border-indigo-200"
                            >
                              <Plus className="w-3 h-3 text-indigo-600" />
                              <span>Add Task</span>
                            </button>

                            {/* Notes Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setEditingNotesTopicId(
                                  editingNotesTopicId === topic.id ? null : topic.id
                                )
                              }
                              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              title="Add or view study notes"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Notes Input Area if opened */}
                        {editingNotesTopicId === topic.id && (
                          <div className="pt-1.5 animate-in fade-in duration-150">
                            <textarea
                              rows={2}
                              value={topic.notes || ''}
                              onChange={(e) =>
                                handleUpdateTopic(currentSubject.code, topic.id, {
                                  notes: e.target.value,
                                })
                              }
                              placeholder="Personal study notes, important theorem formulas, or exam tips for this topic..."
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
