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
  try {
    const postings = await fetchMyPostings();
    const sessionsForDate = postings.filter(
      (posting) => posting.status !== 'draft' && isDateWithinPeriod(date, posting.period),
    );
    const detailedPostings = await Promise.all(
      sessionsForDate.map(async (posting) => {
        const detail = await fetchPosting(posting.id);

        return detail ?? posting;
      }),
    );

    return detailedPostings.map(postingToSession);
  } catch {
    return [];
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
