import type {
  RevisionScheduleItem,
  RevisionDifficultyRating,
  PreparationCategory,
} from '../types';

export const DEFAULT_REVISION_INTERVALS = [1, 3, 7, 14];

export const createRevisionScheduleItem = (params: {
  targetId: string;
  targetTitle: string;
  category: PreparationCategory;
  subjectId: string;
  customIntervalDays?: number;
}): RevisionScheduleItem => {
  const { targetId, targetTitle, category, subjectId, customIntervalDays = 1 } = params;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + customIntervalDays);

  return {
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    targetId,
    targetTitle,
    category,
    subjectId,
    intervalStage: 0,
    dueDate: dueDate.toISOString().split('T')[0],
    isOverdue: false,
    history: [],
  };
};

export const completeRevisionAndReschedule = (
  item: RevisionScheduleItem,
  rating: RevisionDifficultyRating,
  intervals: number[] = DEFAULT_REVISION_INTERVALS
): RevisionScheduleItem => {
  const nowStr = new Date().toISOString().split('T')[0];
  let nextStage = item.intervalStage;
  let nextIntervalDays = intervals[0] || 1;

  if (rating === 'Difficult') {
    // Reset to stage 0 (1 day) if difficult
    nextStage = 0;
    nextIntervalDays = intervals[0] || 1;
  } else if (rating === 'Moderate') {
    // Advance 1 stage
    nextStage = Math.min(item.intervalStage + 1, intervals.length - 1);
    nextIntervalDays = intervals[nextStage] || 3;
  } else if (rating === 'Easy') {
    // Advance 2 stages or max
    nextStage = Math.min(item.intervalStage + 2, intervals.length - 1);
    nextIntervalDays = intervals[nextStage] || 7;
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + nextIntervalDays);

  const updatedHistory = [
    ...item.history,
    {
      date: nowStr,
      rating,
      nextIntervalDays,
    },
  ];

  return {
    ...item,
    intervalStage: nextStage,
    dueDate: nextDueDate.toISOString().split('T')[0],
    lastRevisedDate: nowStr,
    isOverdue: false,
    history: updatedHistory,
  };
};

export const isDateDueTodayOrOverdue = (
  dateStr: string
): { isToday: boolean; isOverdue: boolean } => {
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) {
    return { isToday: true, isOverdue: false };
  }
  return { isToday: false, isOverdue: dateStr < today };
};
