import React, { useState } from 'react';
import {
  Briefcase,
  Calculator,
  Brain,
  MessageSquare,
  Code,
  Search,
  Plus,
  RotateCcw,
} from 'lucide-react';
import type { PlacementTopic, PlacementSection, TopicStatus } from '../types';
import { sounds } from '../utils/sound';

interface PlacementViewProps {
  placementSyllabus: PlacementTopic[];
  onUpdatePlacementSyllabus: (updated: PlacementTopic[]) => void;
  onCreateTaskFromTopic: (sectionName: string, topicTitle: string, topicId: string) => void;
  onScheduleRevision: (topic: PlacementTopic, sectionName: string) => void;
}

export const PlacementView: React.FC<PlacementViewProps> = ({
  placementSyllabus,
  onUpdatePlacementSyllabus,
  onCreateTaskFromTopic,
  onScheduleRevision,
}) => {
  const [activeSection, setActiveSection] = useState<PlacementSection>('quant');
  const [searchQuery, setSearchQuery] = useState('');

  const sections: { id: PlacementSection; title: string; icon: any; color: string; desc: string }[] = [
    { id: 'quant', title: 'Quantitative Aptitude', icon: Calculator, color: 'text-indigo-600', desc: 'Percentages, P&L, Time & Work, TSD, Probability' },
    { id: 'reasoning', title: 'Logical Reasoning', icon: Brain, color: 'text-purple-600', desc: 'Series, Blood Relations, Syllogisms, Seating Arrangements, DI' },
    { id: 'verbal', title: 'Verbal Ability', icon: MessageSquare, color: 'text-emerald-600', desc: 'Grammar, Reading Comprehension, Sentence Correction' },
    { id: 'technical', title: 'Technical Prep', icon: Code, color: 'text-cyan-600', desc: 'C/C++, OOP, DBMS, OS, Networks, System Design & Interview' },
  ];

  const currentTopics = placementSyllabus.filter((t) => t.section === activeSection);

  const totalTopics = placementSyllabus.length;
  const completedTopics = placementSyllabus.filter((t) => t.status === 'completed').length;
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const totalQuestionsSolved = placementSyllabus.reduce((acc, t) => acc + t.questionsSolved, 0);

  const handleUpdateTopic = (topicId: string, updates: Partial<PlacementTopic>) => {
    sounds.playClick();
    const updated = placementSyllabus.map((t) => (t.id === topicId ? { ...t, ...updates } : t));
    onUpdatePlacementSyllabus(updated);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-800 text-white rounded-3xl p-5 shadow-md">
        <div className="flex items-center gap-2 text-cyan-200 text-xs font-bold uppercase tracking-wider mb-1">
          <Briefcase className="w-4 h-4 text-amber-300" />
          <span>College Placement & Corporate Prep</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">Placement Training Portal</h2>
        <p className="text-xs text-cyan-100/90 mt-1 max-w-md">
          Structured roadmap from absolute beginner aptitude to advanced technical interview readiness.
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-[10px] text-cyan-200 font-bold uppercase block">
              Placement Roadmap
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black">{overallProgress}%</span>
              <span className="text-[11px] text-cyan-100">
                {completedTopics} of {totalTopics} completed
              </span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                style={{ width: `${overallProgress}%` }}
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-[10px] text-cyan-200 font-bold uppercase block">
              Practice Questions Solved
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-black">{totalQuestionsSolved}</span>
              <span className="text-[11px] text-cyan-100">Across all 4 modules</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (totalQuestionsSolved / 150) * 100)}%` }}
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sections.map((sec) => {
          const isSelected = activeSection === sec.id;
          const Icon = sec.icon;
          const secTopics = placementSyllabus.filter((t) => t.section === sec.id);
          const done = secTopics.filter((t) => t.status === 'completed').length;
          const pct = secTopics.length > 0 ? Math.round((done / secTopics.length) * 100) : 0;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveSection(sec.id);
              }}
              className={`p-3 rounded-2xl border text-left transition-all touch-manipulation flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-900 shadow-xs ring-2 ring-cyan-200'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {pct}%
                </span>
              </div>
              <div>
                <span className="text-xs font-bold block leading-tight">{sec.title}</span>
                <span className="text-[10px] text-slate-400">
                  {done}/{secTopics.length} topics
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${sections.find((s) => s.id === activeSection)?.title} topics...`}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Topics List with beginner order and questions practice */}
      <div className="space-y-3">
        {currentTopics
          .filter((t) => {
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              return (
                t.title.toLowerCase().includes(q) ||
                t.subtopics.some((st) => st.toLowerCase().includes(q))
              );
            }
            return true;
          })
          .sort((a, b) => a.beginnerOrder - b.beginnerOrder)
          .map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Order #{topic.beginnerOrder}
                  </span>
                  <h4
                    className={`text-sm font-bold mt-1 ${
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

              {/* Questions practice tracker & actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Questions Solved:
                  </span>
                  <div className="flex items-center gap-1 bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-lg border border-cyan-200/60 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTopic(topic.id, {
                          questionsSolved: Math.max(0, topic.questionsSolved - 1),
                        })
                      }
                      className="px-1 hover:text-cyan-950"
                    >
                      -
                    </button>
                    <span>{topic.questionsSolved}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTopic(topic.id, {
                          questionsSolved: topic.questionsSolved + 1,
                        })
                      }
                      className="px-1 hover:text-cyan-950"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onScheduleRevision(
                        topic,
                        sections.find((s) => s.id === activeSection)?.title || 'Placements'
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-600" />
                    <span>Revise</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onCreateTaskFromTopic(
                        sections.find((s) => s.id === activeSection)?.title || 'Placements',
                        topic.title,
                        topic.id
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200"
                  >
                    <Plus className="w-3 h-3 text-cyan-700" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
