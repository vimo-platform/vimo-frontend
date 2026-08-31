import { apiRequest } from '@/api/client';
import { fetchMyPostings, fetchPosting } from '@/features/admin/api/postings';
import type { Posting, Session, SessionStatus } from '@/features/admin/types';

export type SessionQr = {
  qrToken: string;
  expireTime: number;
};

export async function generateSessionQr(
  volunteerId: string,
  type: 'start' | 'end',
): Promise<SessionQr> {
  return apiRequest<SessionQr>(`/api/v1/admin/volunteers/${volunteerId}/qr-generation`, {
    method: 'POST',
    body: JSON.stringify({ qrType: type === 'end' ? 'END' : 'START' }),
  });
}

export async function fetchSessions(date: string): Promise<Session[]> {
  const data = await fetchSessionCalendar(date);

  return data.sessions;
}

export async function fetchSessionCalendar(
  date: string,
): Promise<{ sessions: Session[]; markedDates: string[] }> {
  try {
    const postings = await fetchMyPostings();
    const activePostings = postings.filter((posting) => posting.status !== 'draft');
    const sessionsForDate = activePostings.filter((posting) =>
      isDateWithinPeriod(date, posting.period),
    );
    const detailedPostings = await Promise.all(
      sessionsForDate.map(async (posting) => {
        const detail = await fetchPosting(posting.id);

        return detail ?? posting;
      }),
    );

    return {
      sessions: detailedPostings.map(postingToSession),
      markedDates: getMarkedDates(activePostings),
    };
  } catch {
    return { sessions: [], markedDates: [] };
  }
}

function postingToSession(posting: Posting): Session {
  return {
    id: posting.id,
    postingId: posting.id,
    title: posting.title,
    hoursPerSession: posting.hoursPerSession,
    location: posting.location,
    period: posting.period,
    startTime: posting.startTime,
    endTime: posting.endTime,
    status: toSessionStatus(posting.status),
  };
}

function toSessionStatus(status: Posting['status']): SessionStatus {
  return status === 'closed' ? 'done' : 'before';
}

function isDateWithinPeriod(date: string, period: string): boolean {
  const [start = '', endRaw = ''] = period.split('~').map((part) => part.trim());

  if (!start) {
    return false;
  }

  const end = endRaw || start;

  return start <= date && date <= end;
}

function getMarkedDates(postings: Posting[]) {
  const keys = new Set<string>();

  postings.forEach((posting) => {
    getPeriodDateKeys(posting.period).forEach((key) => keys.add(key));
  });

  return [...keys];
}

function getPeriodDateKeys(period: string) {
  const [start = '', endRaw = ''] = period.split('~').map((part) => part.trim());

  if (!start) {
    return [];
  }

  const end = endRaw || start;
  const startDate = parseDateKey(start);
  const endDate = parseDateKey(end);

  if (!startDate || !endDate || startDate > endDate) {
    return [];
  }

  const keys: string[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate && keys.length < 370) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.match(/\d+/g) ?? [];

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Number(year), Number(month) - 1, Number(day));
}

function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}
