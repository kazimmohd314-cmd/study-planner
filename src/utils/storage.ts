import type {
  Task,
  UniversitySubject,
  GateSubject,
  PlacementTopic,
  QuestionItem,
  RevisionScheduleItem,
  StudySessionLog,
  UserSettings,
  SavedPomodoroTimerState,
} from '../types';
import { UNIVERSITY_SYLLABUS } from '../constants/universitySyllabus';
import { GATE_SYLLABUS } from '../constants/gateSyllabus';
import { PLACEMENT_SYLLABUS } from '../constants/placementSyllabus';

// Storage Keys
const TASKS_KEY = 'studyflow_tasks_v2';
const V1_TASKS_KEY = 'studyflow_tasks_v1';
const UNIVERSITY_KEY = 'studyflow_university_v2';
const GATE_KEY = 'studyflow_gate_v2';
const PLACEMENT_KEY = 'studyflow_placement_v2';
const QUESTIONS_KEY = 'studyflow_questions_v2';
const REVISION_KEY = 'studyflow_revision_v2';
const SESSIONS_KEY = 'studyflow_sessions_v2';
const SETTINGS_KEY = 'studyflow_settings_v2';
const TIMER_STATE_KEY = 'studyflow_timer_state_v2';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyAvailabilityHours: 4,
  preferredStudyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  pomodoro: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    soundEnabled: true,
  },
  theme: 'light',
  universityExamDate: '',
  gateExamDate: '',
  placementTargetDate: '',
  revisionIntervals: [1, 3, 7, 14],
  defaultPriority: 'High',
};

// 1. Task Persistence & Safe Migration from v1
export const getStoredTasks = (): Task[] => {
  try {
    const rawV2 = localStorage.getItem(TASKS_KEY);
    if (rawV2) {
      return JSON.parse(rawV2);
    }

    // Check if user had tasks in v1 to migrate without loss
    const rawV1 = localStorage.getItem(V1_TASKS_KEY);
    if (rawV1) {
      const v1Tasks = JSON.parse(rawV1);
      const migrated: Task[] = v1Tasks.map((t: any) => ({
        id: t.id || `task-${Date.now()}`,
        title: t.title || 'Untitled Study Task',
        category:
          t.subject === 'GATE_APTITUDE' || t.subject === 'DSA'
            ? 'gate'
            : t.subject === 'PLACEMENT_PREP'
            ? 'placement'
            : 'semester_v',
        subjectId: t.subject === 'DSA' ? 'CS301' : t.subject || 'CS301',
        priority: t.priority || 'Medium',
        priorityReason: 'Migrated from previous session',
        estimatedMinutes: t.estimatedMinutes || 45,
        actualTimeSpentMinutes: t.completedMinutes || 0,
        deadline: t.deadline || '',
        plannedDate: t.deadline ? t.deadline.split('T')[0] : '',
        status: t.completed ? 'completed' : 'todo',
        completed: !!t.completed,
        completedAt: t.completedAt,
        createdAt: t.createdAt || new Date().toISOString(),
        notes: t.notes || '',
        isRevision: false,
      }));
      saveStoredTasks(migrated);
      return migrated;
    }

    // Fresh install: Empty array of real tasks (Zero fake tasks!)
    return [];
  } catch (err) {
    console.error('Failed to load tasks', err);
    return [];
  }
};

export const saveStoredTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks', err);
  }
};

// 2. University Syllabus Persistence
export const getStoredUniversitySyllabus = (): UniversitySubject[] => {
  try {
    const raw = localStorage.getItem(UNIVERSITY_KEY);
    if (raw) return JSON.parse(raw);
    saveStoredUniversitySyllabus(UNIVERSITY_SYLLABUS);
    return UNIVERSITY_SYLLABUS;
  } catch {
    return UNIVERSITY_SYLLABUS;
  }
};

export const saveStoredUniversitySyllabus = (syllabus: UniversitySubject[]): void => {
  try {
    localStorage.setItem(UNIVERSITY_KEY, JSON.stringify(syllabus));
  } catch (err) {
    console.error('Failed to save university syllabus', err);
  }
};

// 3. GATE Syllabus Persistence
export const getStoredGateSyllabus = (): GateSubject[] => {
  try {
    const raw = localStorage.getItem(GATE_KEY);
    if (raw) return JSON.parse(raw);
    saveStoredGateSyllabus(GATE_SYLLABUS);
    return GATE_SYLLABUS;
  } catch {
    return GATE_SYLLABUS;
  }
};

export const saveStoredGateSyllabus = (syllabus: GateSubject[]): void => {
  try {
    localStorage.setItem(GATE_KEY, JSON.stringify(syllabus));
  } catch (err) {
    console.error('Failed to save GATE syllabus', err);
  }
};

// 4. Placement Syllabus Persistence
export const getStoredPlacementSyllabus = (): PlacementTopic[] => {
  try {
    const raw = localStorage.getItem(PLACEMENT_KEY);
    if (raw) return JSON.parse(raw);
    saveStoredPlacementSyllabus(PLACEMENT_SYLLABUS);
    return PLACEMENT_SYLLABUS;
  } catch {
    return PLACEMENT_SYLLABUS;
  }
};

export const saveStoredPlacementSyllabus = (syllabus: PlacementTopic[]): void => {
  try {
    localStorage.setItem(PLACEMENT_KEY, JSON.stringify(syllabus));
  } catch (err) {
    console.error('Failed to save placement syllabus', err);
  }
};

// 5. Questions and PYQ Persistence
export const getStoredQuestions = (): QuestionItem[] => {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredQuestions = (questions: QuestionItem[]): void => {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save questions', err);
  }
};

// 6. Revision Schedule Persistence
export const getStoredRevisions = (): RevisionScheduleItem[] => {
  try {
    const raw = localStorage.getItem(REVISION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredRevisions = (revisions: RevisionScheduleItem[]): void => {
  try {
    localStorage.setItem(REVISION_KEY, JSON.stringify(revisions));
  } catch (err) {
    console.error('Failed to save revisions', err);
  }
};

// 7. Study Sessions Persistence (Strictly Genuine Activity Only)
export const getStoredSessions = (): StudySessionLog[] => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredSessions = (sessions: StudySessionLog[]): void => {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions', err);
  }
};

export const addGenuineStudySession = (session: Omit<StudySessionLog, 'id'>): StudySessionLog => {
  const current = getStoredSessions();
  const newSession: StudySessionLog = {
    ...session,
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
  };
  const updated = [...current, newSession];
  saveStoredSessions(updated);
  return newSession;
};

// 8. Settings Persistence
export const getStoredUserSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_USER_SETTINGS;
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
};

export const saveStoredUserSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save user settings', err);
  }
};

// 9. Pomodoro Timer State Persistence (for page reloads without false completions)
export const getSavedTimerState = (): SavedPomodoroTimerState | null => {
  try {
    const raw = localStorage.getItem(TIMER_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveTimerState = (state: SavedPomodoroTimerState | null): void => {
  try {
    if (state === null) {
      localStorage.removeItem(TIMER_STATE_KEY);
    } else {
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error('Failed to save timer state', err);
  }
};

// 10. Genuine Streak Calculation
// Computed strictly from actual completed qualifying activity
export const calculateGenuineStreak = (
  sessions: StudySessionLog[],
  tasks: Task[]
): { currentStreak: number; bestStreak: number; activeDaysCount: number } => {
  const activityDates = new Set<string>();

  // Add dates from genuine finished study sessions
  sessions.forEach((s) => {
    if (s.timestamp) {
      activityDates.add(s.timestamp.split('T')[0]);
    }
  });

  // Add dates from genuine completed tasks
  tasks.forEach((t) => {
    if (t.completed && t.completedAt) {
      activityDates.add(t.completedAt.split('T')[0]);
    }
  });

  if (activityDates.size === 0) {
    return { currentStreak: 0, bestStreak: 0, activeDaysCount: 0 };
  }

  // Sort dates descending
  const sortedDates = Array.from(activityDates).sort().reverse();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If most recent active date is neither today nor yesterday, streak is 0
  const mostRecent = sortedDates[0];
  if (mostRecent !== today && mostRecent !== yesterday) {
    return { currentStreak: 0, bestStreak: 1, activeDaysCount: sortedDates.length };
  }

  let currentStreak = 0;
  let checkDate = new Date(mostRecent);

  for (const dStr of sortedDates) {
    const d = new Date(dStr);
    const diffDays = Math.round((checkDate.getTime() - d.getTime()) / 86400000);
    if (diffDays <= 1) {
      currentStreak++;
      checkDate = d;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(currentStreak, 1),
    activeDaysCount: sortedDates.length,
  };
};

// 11. Full Backup Export and Import
export interface FullAppDataBackup {
  version: '2.0';
  exportDate: string;
  tasks: Task[];
  universitySyllabus: UniversitySubject[];
  gateSyllabus: GateSubject[];
  placementSyllabus: PlacementTopic[];
  questions: QuestionItem[];
  revisions: RevisionScheduleItem[];
  sessions: StudySessionLog[];
  settings: UserSettings;
}

export const exportFullBackup = (): string => {
  const data: FullAppDataBackup = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    tasks: getStoredTasks(),
    universitySyllabus: getStoredUniversitySyllabus(),
    gateSyllabus: getStoredGateSyllabus(),
    placementSyllabus: getStoredPlacementSyllabus(),
    questions: getStoredQuestions(),
    revisions: getStoredRevisions(),
    sessions: getStoredSessions(),
    settings: getStoredUserSettings(),
  };
  return JSON.stringify(data, null, 2);
};

export const importFullBackup = (
  jsonString: string
): { success: boolean; message: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid backup file format.' };
    }

    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      saveStoredTasks(parsed.tasks);
    }
    if (parsed.universitySyllabus && Array.isArray(parsed.universitySyllabus)) {
      saveStoredUniversitySyllabus(parsed.universitySyllabus);
    }
    if (parsed.gateSyllabus && Array.isArray(parsed.gateSyllabus)) {
      saveStoredGateSyllabus(parsed.gateSyllabus);
    }
    if (parsed.placementSyllabus && Array.isArray(parsed.placementSyllabus)) {
      saveStoredPlacementSyllabus(parsed.placementSyllabus);
    }
    if (parsed.questions && Array.isArray(parsed.questions)) {
      saveStoredQuestions(parsed.questions);
    }
    if (parsed.revisions && Array.isArray(parsed.revisions)) {
      saveStoredRevisions(parsed.revisions);
    }
    if (parsed.sessions && Array.isArray(parsed.sessions)) {
      saveStoredSessions(parsed.sessions);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      saveStoredUserSettings({ ...DEFAULT_USER_SETTINGS, ...parsed.settings });
    }

    return { success: true, message: 'Backup successfully restored!' };
  } catch (err: any) {
    return { success: false, message: `Failed to parse backup JSON: ${err.message}` };
  }
};

export const resetAllAppData = (): void => {
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(UNIVERSITY_KEY);
  localStorage.removeItem(GATE_KEY);
  localStorage.removeItem(PLACEMENT_KEY);
  localStorage.removeItem(QUESTIONS_KEY);
  localStorage.removeItem(REVISION_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(TIMER_STATE_KEY);
  localStorage.removeItem(V1_TASKS_KEY);
};
