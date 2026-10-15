export type PreparationCategory =
  | 'semester_v'
  | 'additional_theory'
  | 'gate'
  | 'placement';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TopicStatus = 'not_started' | 'in_progress' | 'completed';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type RevisionStatus = 'none' | 'due' | 'revised';

export interface SyllabusTopic {
  id: string;
  subjectCode: string;
  unitNumber: number;
  title: string;
  subtopics: string[];
  status: TopicStatus;
  confidence: ConfidenceLevel;
  priority: Priority;
  plannedDate?: string;
  completedDate?: string;
  revisionStatus: RevisionStatus;
  notes?: string;
  questionPracticeCount: number;
}

export interface SyllabusUnit {
  unitNumber: number;
  title: string;
  contactHours: number;
  mappedCO?: string;
  topics: SyllabusTopic[];
}

export interface UniversitySubject {
  code: string;
  title: string;
  year: string;
  semester: string;
  category: 'semester_v' | 'additional_theory';
  credits: number;
  lecture: number;
  tutorial: number;
  practical: number;
  color: string;
  bgColor: string;
  borderColor: string;
  units: SyllabusUnit[];
  isLab?: boolean;
}

export interface GateTopic {
  id: string;
  title: string;
  subtopics: string[];
  beginnerOrder: number;
  prerequisites: string[];
  status: TopicStatus;
  confidence: ConfidenceLevel;
  notes?: string;
  pyqCount: number;
  completedPyqs: number;
}

export interface GateSubject {
  id: string;
  title: string;
  description: string;
  beginnerOrder: number;
  color: string;
  bgColor: string;
  borderColor: string;
  topics: GateTopic[];
}

export type PlacementSection = 'quant' | 'reasoning' | 'verbal' | 'technical';

export interface PlacementTopic {
  id: string;
  section: PlacementSection;
  title: string;
  subtopics: string[];
  beginnerOrder: number;
  status: TopicStatus;
  confidence: ConfidenceLevel;
  questionsSolved: number;
  accuracyRate: number; // 0 to 100
  avgTimeSeconds?: number;
  notes?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  category: PreparationCategory;
  subjectId: string; // Course code (e.g., 'CS301') or Gate subject id or Placement section
  unitNumber?: number;
  topicId?: string;
  priority: Priority;
  priorityReason?: string;
  estimatedMinutes: number;
  actualTimeSpentMinutes: number;
  deadline?: string;
  plannedDate?: string;
  status: TaskStatus;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  notes?: string;
  isRevision?: boolean;
}

export type QuestionSource =
  | 'Official GATE PYQ'
  | 'University Exam'
  | 'AI-generated practice questions'
  | 'Standard Placement Test'
  | 'Unverified';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'MCQ' | 'MSQ' | 'NAT' | 'Subjective' | 'Coding';
export type AttemptStatus = 'unattempted' | 'correct' | 'incorrect';

export interface QuestionItem {
  id: string;
  questionText: string;
  category: PreparationCategory;
  subjectId: string;
  unitNumber?: number;
  topicId?: string;
  source: QuestionSource;
  examOrCompanyName?: string;
  year?: number;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  marks?: number;
  attemptStatus: AttemptStatus;
  timeTakenSeconds?: number;
  notesAndSolution?: string;
  isBookmarked: boolean;
  needsRevision: boolean;
  createdAt: string;
}

export type RevisionDifficultyRating = 'Easy' | 'Moderate' | 'Difficult';

export interface RevisionHistoryEntry {
  date: string;
  rating: RevisionDifficultyRating;
  nextIntervalDays: number;
}

export interface RevisionScheduleItem {
  id: string;
  targetId: string; // Topic ID or Question ID
  targetTitle: string;
  category: PreparationCategory;
  subjectId: string;
  intervalStage: number; // 0 (1d), 1 (3d), 2 (7d), 3 (14d)
  dueDate: string; // YYYY-MM-DD
  isOverdue: boolean;
  lastRevisedDate?: string;
  history: RevisionHistoryEntry[];
}

export type PomodoroMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  pomodoro: number; // minutes
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
}

export interface SavedPomodoroTimerState {
  mode: PomodoroMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  activeTaskId: string | null;
  lastUpdatedTimestamp: number;
}

export interface StudySessionLog {
  id: string;
  taskId?: string;
  topicId?: string;
  category: PreparationCategory;
  subjectId: string;
  durationMinutes: number; // Genuine finished focus minutes only
  timestamp: string; // ISO string
}

export interface UserSettings {
  dailyAvailabilityHours: number;
  preferredStudyDays: string[];
  pomodoro: PomodoroSettings;
  theme: 'light' | 'dark';
  universityExamDate?: string;
  gateExamDate?: string;
  placementTargetDate?: string;
  revisionIntervals: number[]; // [1, 3, 7, 14]
  defaultPriority: Priority;
}

export type MainNavView =
  | 'dashboard'
  | 'tasks'
  | 'university'
  | 'gate'
  | 'placement'
  | 'questions'
  | 'revision'
  | 'pomodoro'
  | 'progress'
  | 'settings';
