import type { VolunteerSchedule } from '../types';

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeek(date: Date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(startOfDay(date), mondayOffset);
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function isSameDay(left: Date, right: Date) {
  return toDateKey(left) === toDateKey(right);
}

export function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getScheduleOccurrenceKeys(schedule: VolunteerSchedule) {
  const keys: string[] = [];
  const endDate = parseDateKey(schedule.endDate);
  let cursor = parseDateKey(schedule.startDate);

  while (cursor <= endDate) {
    if (cursor.getDay() === schedule.repeatWeekday) {
      keys.push(toDateKey(cursor));
    }

    cursor = addDays(cursor, 1);
  }

  return keys;
}

export function isScheduleOnDate(schedule: VolunteerSchedule, date: Date) {
  const target = startOfDay(date);
  const startDate = parseDateKey(schedule.startDate);
  const endDate = parseDateKey(schedule.endDate);

  return target >= startDate && target <= endDate && target.getDay() === schedule.repeatWeekday;
}

export function formatTimeRange(startTime: string, endTime: string, withSpaces: boolean) {
  return withSpaces ? `${startTime} ~ ${endTime}` : `${startTime}~${endTime}`;
}

export function formatDateWithDots(dateKey: string) {
  return dateKey.replaceAll('-', '.');
}

export function getWeekdayLabel(day: number) {
  return ['일', '월', '화', '수', '목', '금', '토'][day] ?? '';
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}
