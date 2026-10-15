import React, { useState, useEffect } from 'react';
import type {
  Task,
  UniversitySubject,
  GateSubject,
  PlacementTopic,
  QuestionItem,
  RevisionScheduleItem,
  StudySessionLog,
  UserSettings,
  MainNavView,
  PreparationCategory,
} from './types';
import {
  getStoredTasks,
  saveStoredTasks,
  getStoredUniversitySyllabus,
  saveStoredUniversitySyllabus,
  getStoredGateSyllabus,
  saveStoredGateSyllabus,
  getStoredPlacementSyllabus,
  saveStoredPlacementSyllabus,
  getStoredQuestions,
  saveStoredQuestions,
  getStoredRevisions,
  saveStoredRevisions,
  getStoredSessions,
  addGenuineStudySession,
  getStoredUserSettings,
  saveStoredUserSettings,
  calculateGenuineStreak,
} from './utils/storage';
import { createRevisionScheduleItem } from './utils/revision';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PwaBanner } from './components/PwaBanner';

// Views
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { UniversityView } from './views/UniversityView';
import { GateView } from './views/GateView';
import { PlacementView } from './views/PlacementView';
import { QuestionsView } from './views/QuestionsView';
import { RevisionView } from './views/RevisionView';
import { PomodoroView } from './views/PomodoroView';
import { ProgressView } from './views/ProgressView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  // Primary State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [universitySyllabus, setUniversitySyllabus] = useState<UniversitySubject[]>([]);
  const [gateSyllabus, setGateSyllabus] = useState<GateSubject[]>([]);
  const [placementSyllabus, setPlacementSyllabus] = useState<PlacementTopic[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [revisions, setRevisions] = useState<RevisionScheduleItem[]>([]);
  const [sessions, setSessions] = useState<StudySessionLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getStoredUserSettings());

  // View & UI Navigation
  const [activeView, setActiveView] = useState<MainNavView>('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Default parameters for new task modal opened from a specific topic
  const [taskModalDefaults, setTaskModalDefaults] = useState<{
    category: PreparationCategory;
    subjectId: string;
    title: string;
    topicId?: string;
  }>({
    category: 'semester_v',
    subjectId: 'CS301',
    title: '',
  });

  // Active task linked in Pomodoro
  const [activePomodoroTaskId, setActivePomodoroTaskId] = useState<string | null>(null);

  // Load data on initial mount
  const refreshAllDataFromStorage = () => {
    setTasks(getStoredTasks());
    setUniversitySyllabus(getStoredUniversitySyllabus());
    setGateSyllabus(getStoredGateSyllabus());
    setPlacementSyllabus(getStoredPlacementSyllabus());
    setQuestions(getStoredQuestions());
    setRevisions(getStoredRevisions());
    setSessions(getStoredSessions());
    setSettings(getStoredUserSettings());
  };

  useEffect(() => {
    refreshAllDataFromStorage();

    // Check URL parameters for shortcut navigation (e.g. ?tab=tasks, ?tab=pomodoro, ?tab=revision)
    const params = new URLSearchParams(window.location.search);
    const tabParam = (params.get('tab') || params.get('view')) as MainNavView | null;
    if (tabParam && ['dashboard', 'tasks', 'university', 'gate', 'placement', 'questions', 'revision', 'pomodoro', 'progress', 'settings'].includes(tabParam)) {
      setActiveView(tabParam);
    }
  }, []);

  // Sync state helpers
  const updateTasks = (updated: Task[]) => {
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const updateUniversitySyllabus = (updated: UniversitySubject[]) => {
    setUniversitySyllabus(updated);
    saveStoredUniversitySyllabus(updated);
  };

  const updateGateSyllabus = (updated: GateSubject[]) => {
    setGateSyllabus(updated);
    saveStoredGateSyllabus(updated);
  };

  const updatePlacementSyllabus = (updated: PlacementTopic[]) => {
    setPlacementSyllabus(updated);
    saveStoredPlacementSyllabus(updated);
  };

  const updateQuestions = (updated: QuestionItem[]) => {
    setQuestions(updated);
    saveStoredQuestions(updated);
  };

  const updateRevisions = (updated: RevisionScheduleItem[]) => {
    setRevisions(updated);
    saveStoredRevisions(updated);
  };

  const updateSettings = (updated: UserSettings) => {
    setSettings(updated);
    saveStoredUserSettings(updated);
  };

  // Task Handlers
  const handleToggleComplete = (taskToToggle: Task) => {
    const updated = tasks.map((t) => {
      if (t.id === taskToToggle.id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          status: (nextCompleted ? 'completed' : 'todo') as any,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    updateTasks(updated);
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'completedMinutes' | 'completed'> & { id?: string }
  ) => {
    if (taskData.id) {
      const updated = tasks.map((t) => {
        if (t.id === taskData.id) {
          return {
            ...t,
            title: taskData.title,
            category: taskData.category,
            subjectId: taskData.subjectId,
            priority: taskData.priority,
            priorityReason: taskData.priorityReason,
            status: taskData.status,
            deadline: taskData.deadline,
            plannedDate: taskData.plannedDate,
            estimatedMinutes: taskData.estimatedMinutes,
            notes: taskData.notes,
          };
        }
        return t;
      });
      updateTasks(updated);
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: taskData.title,
        category: taskData.category,
        subjectId: taskData.subjectId,
        topicId: taskModalDefaults.topicId,
        priority: taskData.priority,
        priorityReason: taskData.priorityReason,
        status: 'todo',
        deadline: taskData.deadline,
        plannedDate: taskData.plannedDate,
        estimatedMinutes: taskData.estimatedMinutes,
        actualTimeSpentMinutes: 0,
        completed: false,
        createdAt: new Date().toISOString(),
        notes: taskData.notes,
      };
      updateTasks([newTask, ...tasks]);
    }
  };

  const confirmDeleteTask = () => {
    if (!deletingTask) return;
    const updated = tasks.filter((t) => t.id !== deletingTask.id);
    updateTasks(updated);
    if (activePomodoroTaskId === deletingTask.id) {
      setActivePomodoroTaskId(null);
    }
    setDeletingTask(null);
  };

  const handleRescheduleOverdue = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = tasks.map((t) => {
      if (!t.completed && t.deadline && t.deadline < new Date().toISOString()) {
        const timePart = t.deadline.includes('T') ? t.deadline.split('T')[1] : '19:00';
        return {
          ...t,
          deadline: `${todayStr}T${timePart}`,
          plannedDate: todayStr,
        };
      }
      return t;
    });
    updateTasks(updated);
  };

  // Cross-Module Quick Actions
  const handleCreateTaskFromTopic = (
    category: PreparationCategory,
    subjectTitle: string,
    topicTitle: string,
    topicId: string
  ) => {
    setTaskModalDefaults({
      category,
      subjectId: subjectTitle,
      title: `Study & Practice: ${topicTitle}`,
      topicId,
    });
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleScheduleRevision = (
    targetId: string,
    targetTitle: string,
    category: PreparationCategory,
    subjectId: string
  ) => {
    // Avoid duplicate revision item for same target
    const existing = revisions.find((r) => r.targetId === targetId);
    if (existing) {
      alert(`"${targetTitle}" is already scheduled for revision on ${existing.dueDate}.`);
      return;
    }

    const newItem = createRevisionScheduleItem({
      targetId,
      targetTitle,
      category,
      subjectId,
      customIntervalDays: settings.revisionIntervals[0] || 1,
    });
    updateRevisions([...revisions, newItem]);
    alert(`Added "${targetTitle}" to Spaced Repetition queue (Due in 1 day)!`);
  };

  // Focus Timer Session Completion (Strictly verified)
  const handlePomodoroComplete = (
    taskId: string | null,
    minutes: number,
    category: PreparationCategory,
    subjectId: string
  ) => {
    const newSession = addGenuineStudySession({
      taskId: taskId || undefined,
      category,
      subjectId,
      durationMinutes: minutes,
      timestamp: new Date().toISOString(),
    });
    setSessions((prev) => [...prev, newSession]);

    // If task linked, credit actual focus minutes
    if (taskId) {
      const updated = tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            actualTimeSpentMinutes: (t.actualTimeSpentMinutes || 0) + minutes,
          };
        }
        return t;
      });
      updateTasks(updated);
    }
  };

  // Calculate genuine streak strictly from actual activity
  const streakInfo = calculateGenuineStreak(sessions, tasks);

  // Count pending tasks & due revisions for badge notifications
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const revisionsDueCount = revisions.filter((r) => r.dueDate <= todayStr).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Shell Container: Responsive on Android / Phone screen, elegant frame on desktop */}
      <div className="w-full max-w-lg md:max-w-2xl lg:max-w-4xl bg-slate-50 min-h-screen flex flex-col relative sm:border-x sm:border-slate-200/80 sm:shadow-xl">
        {/* Top Header */}
        <Header
          streakDays={streakInfo.currentStreak}
          onOpenNewTask={() => {
            setTaskModalDefaults({
              category: 'semester_v',
              subjectId: 'CS301',
              title: '',
            });
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
        />

        {/* PWA Offline / Install / Update Notification Banner */}
        <PwaBanner />

        {/* Desktop / Tablet Navigation Bar */}
        <Navigation
          activeView={activeView}
          onChangeView={(v) => setActiveView(v)}
          pendingTasksCount={pendingTasksCount}
          revisionsDueCount={revisionsDueCount}
          isTimerRunning={false}
        />

        {/* Main Active View Container */}
        <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              sessions={sessions}
              universitySyllabus={universitySyllabus}
              gateSyllabus={gateSyllabus}
              placementSyllabus={placementSyllabus}
              revisions={revisions}
              streakInfo={streakInfo}
              onToggleComplete={handleToggleComplete}
              onEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={(t) => setDeletingTask(t)}
              onStartFocus={(t) => {
                setActivePomodoroTaskId(t.id);
                setActiveView('pomodoro');
              }}
              onNavigateView={(v) => setActiveView(v)}
              onOpenNewTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeView === 'tasks' && (
            <TasksView
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={(t) => setDeletingTask(t)}
              onStartFocus={(t) => {
                setActivePomodoroTaskId(t.id);
                setActiveView('pomodoro');
              }}
              onOpenNewTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onRescheduleOverdue={handleRescheduleOverdue}
              settings={settings}
            />
          )}

          {activeView === 'university' && (
            <UniversityView
              universitySyllabus={universitySyllabus}
              onUpdateSyllabus={updateUniversitySyllabus}
              onCreateTaskFromTopic={(subj, topic) =>
                handleCreateTaskFromTopic(subj.category, subj.title, topic.title, topic.id)
              }
              onScheduleRevision={(topic, subjectTitle) =>
                handleScheduleRevision(topic.id, topic.title, 'semester_v', subjectTitle)
              }
            />
          )}

          {activeView === 'gate' && (
            <GateView
              gateSyllabus={gateSyllabus}
              onUpdateGateSyllabus={updateGateSyllabus}
              onCreateTaskFromTopic={(subjTitle, topicTitle, topicId) =>
                handleCreateTaskFromTopic('gate', subjTitle, topicTitle, topicId)
              }
              onScheduleRevision={(topic, subjectTitle) =>
                handleScheduleRevision(topic.id, topic.title, 'gate', subjectTitle)
              }
            />
          )}

          {activeView === 'placement' && (
            <PlacementView
              placementSyllabus={placementSyllabus}
              onUpdatePlacementSyllabus={updatePlacementSyllabus}
              onCreateTaskFromTopic={(secTitle, topicTitle, topicId) =>
                handleCreateTaskFromTopic('placement', secTitle, topicTitle, topicId)
              }
              onScheduleRevision={(topic, sectionTitle) =>
                handleScheduleRevision(topic.id, topic.title, 'placement', sectionTitle)
              }
            />
          )}

          {activeView === 'questions' && (
            <QuestionsView
              questions={questions}
              onUpdateQuestions={updateQuestions}
              onScheduleRevision={(q) =>
                handleScheduleRevision(q.id, q.questionText.slice(0, 50) + '...', q.category, q.subjectId)
              }
            />
          )}

          {activeView === 'revision' && (
            <RevisionView
              revisions={revisions}
              onUpdateRevisions={updateRevisions}
              settings={settings}
            />
          )}

          {activeView === 'pomodoro' && (
            <PomodoroView
              tasks={tasks}
              activeTaskId={activePomodoroTaskId}
              onSelectActiveTask={(id) => setActivePomodoroTaskId(id)}
              onPomodoroComplete={handlePomodoroComplete}
              settings={settings.pomodoro}
              onUpdateSettings={(p) => updateSettings({ ...settings, pomodoro: p })}
              sessions={sessions}
            />
          )}

          {activeView === 'progress' && (
            <ProgressView
              tasks={tasks}
              sessions={sessions}
              universitySyllabus={universitySyllabus}
              gateSyllabus={gateSyllabus}
              placementSyllabus={placementSyllabus}
              streakInfo={streakInfo}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              onDataImported={refreshAllDataFromStorage}
            />
          )}
        </main>

        {/* Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          initialTask={editingTask}
          defaultCategory={taskModalDefaults.category}
          defaultSubjectId={taskModalDefaults.subjectId}
          defaultTitle={taskModalDefaults.title}
        />

        {/* Delete Confirm Modal */}
        <DeleteConfirmModal
          isOpen={!!deletingTask}
          taskTitle={deletingTask?.title || ''}
          onConfirm={confirmDeleteTask}
          onCancel={() => setDeletingTask(null)}
        />
      </div>
    </div>
  );
};

export default App;
