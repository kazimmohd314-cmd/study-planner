export const formatDeadline = (dateString: string): { text: string; isOverdue: boolean; isToday: boolean } => {
  if (!dateString) return { text: 'No deadline', isOverdue: false, isToday: false };

  const deadline = new Date(dateString);
  const now = new Date();

  // If date parsing failed
  if (isNaN(deadline.getTime())) {
    return { text: dateString, isOverdue: false, isToday: false };
  }

  const isOverdue = deadline.getTime() < now.getTime();

  const isToday =
    deadline.getDate() === now.getDate() &&
    deadline.getMonth() === now.getMonth() &&
    deadline.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    deadline.getDate() === tomorrow.getDate() &&
    deadline.getMonth() === tomorrow.getMonth() &&
    deadline.getFullYear() === tomorrow.getFullYear();

  const timeStr = deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return { text: `Today at ${timeStr}`, isOverdue, isToday: true };
  }
  if (isTomorrow) {
    return { text: `Tomorrow at ${timeStr}`, isOverdue: false, isToday: false };
  }

  const dateStr = deadline.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  return { text: `${dateStr}, ${timeStr}`, isOverdue, isToday: false };
};

export const toInputDateTimeValue = (d: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getDayName = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};
