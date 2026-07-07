import {format, isThisYear, isToday, isTomorrow, isYesterday} from 'date-fns';

/**
 * Formats a reminder's ISO timestamp into a short, human-friendly label:
 * "Today 20:00", "Tomorrow 09:00", "Yesterday 08:30", "Mar 4, 14:00" or
 * "Mar 4 2027, 14:00" for other years.
 */
export function formatReminderTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const time = format(date, 'HH:mm');

  if (isToday(date)) {
    return `Today ${time}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow ${time}`;
  }
  if (isYesterday(date)) {
    return `Yesterday ${time}`;
  }

  const day = isThisYear(date)
    ? format(date, 'MMM d')
    : format(date, 'MMM d yyyy');
  return `${day}, ${time}`;
}
