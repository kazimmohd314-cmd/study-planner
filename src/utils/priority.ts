import type { Priority, ConfidenceLevel } from '../types';

export interface PrioritySuggestion {
  priority: Priority;
  reason: string;
}

export const calculateSuggestedPriority = (params: {
  deadline?: string;
  confidence?: ConfidenceLevel;
  isRevisionDue?: boolean;
  isOverdue?: boolean;
  manualImportance?: Priority;
  hasIncompletePrerequisites?: boolean;
  prerequisiteNames?: string[];
}): PrioritySuggestion => {
  const {
    deadline,
    confidence = 'medium',
    isRevisionDue = false,
    manualImportance,
    hasIncompletePrerequisites = false,
    prerequisiteNames = [],
  } = params;

  // 1. If prerequisites are incomplete, advise completing foundations first
  if (hasIncompletePrerequisites && prerequisiteNames.length > 0) {
    return {
      priority: 'Low',
      reason: `Foundational prerequisite pending: ${prerequisiteNames[0]}. Complete prerequisites first for better retention.`,
    };
  }

  // 2. Deadline proximity checks
  if (deadline) {
    const deadlineTime = new Date(deadline).getTime();
    const now = Date.now();
    const hoursLeft = (deadlineTime - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) {
      return {
        priority: 'Critical',
        reason: 'Overdue deadline. Immediate attention recommended.',
      };
    }
    if (hoursLeft <= 24) {
      return {
        priority: 'Critical',
        reason: `Target deadline is within ${Math.ceil(hoursLeft)} hours.`,
      };
    }
    if (hoursLeft <= 72) {
      return {
        priority: 'High',
        reason: `Deadline due within 3 days (${Math.ceil(hoursLeft / 24)} days remaining).`,
      };
    }
  }

  // 3. Spaced repetition revision due
  if (isRevisionDue) {
    return {
      priority: 'High',
      reason: 'Spaced repetition revision is due today to prevent memory decay.',
    };
  }

  // 4. Low confidence topic
  if (confidence === 'low') {
    return {
      priority: 'High',
      reason: 'Marked as low confidence. Extra concept review and practice needed.',
    };
  }

  // 5. User selected manual importance
  if (manualImportance) {
    return {
      priority: manualImportance,
      reason: `Set manually to ${manualImportance}.`,
    };
  }

  return {
    priority: 'Medium',
    reason: 'Standard scheduled study target in your learning sequence.',
  };
};
