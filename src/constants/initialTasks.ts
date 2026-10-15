import type { Task } from '../types';

export const getInitialTasks = (): Task[] => {
  const now = new Date();
  
  const formatDateTime = (offsetDays: number, hours: number, minutes: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hours, minutes, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${year}-${month}-${day}T${hh}:${mm}`;
  };

  return [
    {
      id: 'task-1',
      title: 'Analyze Asymptotic Growth & Master Theorem (CS301)',
      category: 'semester_v',
      subjectId: 'CS301',
      priority: 'High',
      priorityReason: 'Foundational topic for Unit 1 Exam & GATE Algorithms',
      deadline: formatDateTime(0, 18, 0),
      plannedDate: formatDateTime(0, 18, 0).split('T')[0],
      estimatedMinutes: 60,
      actualTimeSpentMinutes: 0,
      status: 'todo',
      completed: false,
      createdAt: new Date().toISOString(),
      notes: 'Master substitution, iteration, and recursion tree methods.',
    },
    {
      id: 'task-2',
      title: 'Express.js Routing and RESTful API Principles (CS336)',
      category: 'additional_theory',
      subjectId: 'CS336',
      priority: 'High',
      priorityReason: 'Core backend requirement for full stack project',
      deadline: formatDateTime(0, 20, 30),
      plannedDate: formatDateTime(0, 20, 30).split('T')[0],
      estimatedMinutes: 45,
      actualTimeSpentMinutes: 0,
      status: 'todo',
      completed: false,
      createdAt: new Date().toISOString(),
      notes: 'Review HTTP status codes, middleware chaining, and Prisma ORM basics.',
    },
    {
      id: 'task-3',
      title: 'Practice 5 GATE Discrete Mathematics PYQs (Propositional Logic)',
      category: 'gate',
      subjectId: 'Discrete Mathematics',
      priority: 'Critical',
      priorityReason: 'High weightage topic in GATE CSE',
      deadline: formatDateTime(1, 11, 0),
      plannedDate: formatDateTime(1, 11, 0).split('T')[0],
      estimatedMinutes: 45,
      actualTimeSpentMinutes: 0,
      status: 'todo',
      completed: false,
      createdAt: new Date().toISOString(),
      notes: 'Focus on CNF/DNF conversions and quantifiers negation rules.',
    },
  ];
};
