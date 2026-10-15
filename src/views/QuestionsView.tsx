import React, { useState } from 'react';
import {
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  QuestionItem,
  PreparationCategory,
  QuestionSource,
  QuestionDifficulty,
  QuestionType,
  AttemptStatus,
} from '../types';
import { sounds } from '../utils/sound';

interface QuestionsViewProps {
  questions: QuestionItem[];
  onUpdateQuestions: (updated: QuestionItem[]) => void;
  onScheduleRevision: (question: QuestionItem) => void;
}

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  questions,
  onUpdateQuestions,
  onScheduleRevision,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Form states for new question
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCategory, setNewCategory] = useState<PreparationCategory>('semester_v');
  const [newSubjectId, setNewSubjectId] = useState('CS301');
  const [newSource, setNewSource] = useState<QuestionSource>('AI-generated practice questions');
  const [newExamName, setNewExamName] = useState('');
  const [newYear, setNewYear] = useState<string>('');
  const [newDifficulty, setNewDifficulty] = useState<QuestionDifficulty>('Medium');
  const [newType, setNewType] = useState<QuestionType>('Subjective');
  const [newMarks, setNewMarks] = useState<string>('2');
  const [newSolution, setNewSolution] = useState('');

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleBookmark = (id: string) => {
    sounds.playClick();
    const updated = questions.map((q) => (q.id === id ? { ...q, isBookmarked: !q.isBookmarked } : q));
    onUpdateQuestions(updated);
  };

  const handleUpdateAttemptStatus = (id: string, status: AttemptStatus) => {
    sounds.playClick();
    const updated = questions.map((q) => (q.id === id ? { ...q, attemptStatus: status } : q));
    onUpdateQuestions(updated);
  };

  const handleDeleteQuestion = (id: string) => {
    sounds.playClick();
    const updated = questions.filter((q) => q.id !== id);
    onUpdateQuestions(updated);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    sounds.playClick();
    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      questionText: newQuestionText.trim(),
      category: newCategory,
      subjectId: newSubjectId.trim(),
      source: newSource,
      examOrCompanyName: newExamName.trim() || undefined,
      year: newYear ? parseInt(newYear, 10) : undefined,
      difficulty: newDifficulty,
      questionType: newType,
      marks: newMarks ? parseInt(newMarks, 10) : undefined,
      attemptStatus: 'unattempted',
      notesAndSolution: newSolution.trim() || undefined,
      isBookmarked: false,
      needsRevision: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateQuestions([newQ, ...questions]);
    setIsAddModalOpen(false);
    setNewQuestionText('');
    setNewSolution('');
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchText = q.questionText.toLowerCase().includes(query);
      const matchSubj = q.subjectId.toLowerCase().includes(query);
      const matchNotes = q.notesAndSolution?.toLowerCase().includes(query);
      if (!matchText && !matchSubj && !matchNotes) return false;
    }

    if (filterCategory !== 'all' && q.category !== filterCategory) return false;

    if (filterSource === 'pyq' && q.source !== 'Official GATE PYQ') return false;
    if (filterSource === 'university' && q.source !== 'University Exam') return false;
    if (filterSource === 'ai' && q.source !== 'AI-generated practice questions') return false;

    if (filterStatus === 'bookmarked' && !q.isBookmarked) return false;
    if (filterStatus === 'incorrect' && q.attemptStatus !== 'incorrect') return false;
    if (filterStatus === 'unattempted' && q.attemptStatus !== 'unattempted') return false;
    if (filterStatus === 'correct' && q.attemptStatus !== 'correct') return false;

    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white rounded-3xl p-5 shadow-md">
        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4 text-amber-300" />
          <span>Questions & Verified PYQ Repository</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Important Questions</h2>
            <p className="text-xs text-indigo-100/90 mt-1 max-w-sm">
              Practice questions and official PYQs with transparent source labelling and error tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-indigo-700 text-xs font-bold shadow-sm hover:bg-indigo-50 active:scale-95 transition-all touch-manipulation"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Source Authenticity Reminder */}
        <div className="mt-3.5 pt-2.5 border-t border-white/20 text-[11px] text-indigo-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>Strict policy: Official GATE PYQs and University questions are clearly differentiated from AI-generated practice questions.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, formulas, topics, or explanations..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'bookmarked', label: '★ Bookmarked' },
            { id: 'incorrect', label: '❌ Mistake Log' },
            { id: 'pyq', label: 'GATE PYQs' },
            { id: 'university', label: 'University Exam' },
            { id: 'ai', label: 'AI Practice' },
          ].map((pill) => {
            const isSelected =
              pill.id === 'all'
                ? filterSource === 'all' && filterStatus === 'all'
                : pill.id === 'bookmarked'
                ? filterStatus === 'bookmarked'
                : pill.id === 'incorrect'
                ? filterStatus === 'incorrect'
                : filterSource === pill.id;

            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  if (pill.id === 'all') {
                    setFilterSource('all');
                    setFilterStatus('all');
                  } else if (pill.id === 'bookmarked' || pill.id === 'incorrect') {
                    setFilterStatus(pill.id);
                  } else {
                    setFilterSource(pill.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Category selector row */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-500">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1 outline-none font-semibold text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="semester_v">Semester V Theory</option>
            <option value="additional_theory">Additional Theory (Backend)</option>
            <option value="gate">GATE CSE</option>
            <option value="placement">Placements</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => {
            const isSolExpanded = expandedSolutions[q.id];

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3"
              >
                {/* Header: Source, Category & Bookmark */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Source Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        q.source === 'Official GATE PYQ'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : q.source === 'University Exam'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : q.source === 'AI-generated practice questions'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {q.source}
                    </span>

                    {/* Exam / Year if verified */}
                    {(q.examOrCompanyName || q.year) && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {q.examOrCompanyName} {q.year ? `'${q.year}` : ''}
                      </span>
                    )}

                    {/* Subject */}
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {q.subjectId}
                    </span>

                    {/* Type and marks */}
                    <span className="text-[10px] font-semibold text-slate-400">
                      {q.questionType} {q.marks ? `(${q.marks} Marks)` : ''}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(q.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    {q.isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Question Body */}
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                  {q.questionText}
                </p>

                {/* Solution if expanded */}
                {isSolExpanded && q.notesAndSolution && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1 animate-in fade-in duration-150">
                    <span className="font-bold text-slate-900 block">Solution & Key Steps:</span>
                    <p className="leading-relaxed whitespace-pre-line">{q.notesAndSolution}</p>
                  </div>
                )}

                {/* Bottom Action Bar: Attempt Status & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  {/* Status Toggle */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Result:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateAttemptStatus(q.id, 'correct')}
                      className={`p-1.5 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                        q.attemptStatus === 'correct'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Correct</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateAttemptStatus(q.id, 'incorrect')}
                      className={`p-1.5 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                        q.attemptStatus === 'incorrect'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Wrong</span>
                    </button>
                  </div>

                  {/* Solution toggle and revision */}
                  <div className="flex items-center gap-1.5">
                    {q.notesAndSolution && (
                      <button
                        type="button"
                        onClick={() => toggleSolution(q.id)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 px-2 py-1"
                      >
                        <span>{isSolExpanded ? 'Hide Solution' : 'View Solution'}</span>
                        {isSolExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onScheduleRevision(q)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-600" />
                      <span>Revise</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No questions found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Add your important university questions, solved GATE PYQs, or practice exercises to track them systematically.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Question</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-extrabold text-slate-800">
              Add Question or PYQ
            </h3>

            <form onSubmit={handleAddQuestion} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter the question problem statement or theorem prompt..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as PreparationCategory)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="semester_v">Semester V Theory</option>
                    <option value="additional_theory">Additional Theory (Backend)</option>
                    <option value="gate">GATE CSE</option>
                    <option value="placement">Placements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject / Code
                  </label>
                  <input
                    type="text"
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    placeholder="e.g. CS301, DAA, TOC, Quant"
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Source
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value as QuestionSource)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="AI-generated practice questions">AI-generated practice questions</option>
                    <option value="Official GATE PYQ">Official GATE PYQ</option>
                    <option value="University Exam">University Exam</option>
                    <option value="Standard Placement Test">Standard Placement Test</option>
                    <option value="Unverified">Unverified Source</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Exam / Company Name
                  </label>
                  <input
                    type="text"
                    value={newExamName}
                    onChange={(e) => setNewExamName(e.target.value)}
                    placeholder="e.g. GATE CS, Integral Univ, TCS"
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year (if verified)
                  </label>
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="e.g. 2023 or 2024"
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as QuestionType)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Subjective">Subjective (University)</option>
                    <option value="MCQ">MCQ (Single Choice)</option>
                    <option value="MSQ">MSQ (Multiple Choice)</option>
                    <option value="NAT">NAT (Numerical Answer)</option>
                    <option value="Coding">Coding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    value={newMarks}
                    onChange={(e) => setNewMarks(e.target.value)}
                    placeholder="e.g. 2 or 5"
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Solution / Explanation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  placeholder="Key derivation steps, final answer, or formula applied..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
