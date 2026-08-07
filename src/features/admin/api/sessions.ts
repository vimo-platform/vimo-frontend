import { apiRequest } from '@/api/client';
import { fetchMyPostings } from '@/features/admin/api/postings';
import { mockSessions } from '@/features/admin/data/mock-sessions';
import type { Posting, Session, SessionStatus } from '@/features/admin/types';

const USE_MOCK_ADMIN_API = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN_API === 'true';

export type SessionQr = {
  qrToken: string;
  expireTime: number;
};

// 서버가 발급하는 봉사 출석 QR 토큰 (qrType: START | END, 만료 초 단위)
export async function generateSessionQr(
  volunteerId: string,
  type: 'start' | 'end',
): Promise<SessionQr> {
  if (USE_MOCK_ADMIN_API) {
    return { qrToken: `vimo:${volunteerId}:${type}:${Date.now()}`, expireTime: 60 };
  }

  return apiRequest<SessionQr>(`/api/v1/admin/volunteers/${volunteerId}/qr-generation`, {
    method: 'POST',
    body: JSON.stringify({ qrType: type === 'end' ? 'END' : 'START' }),
  });
}

// 선택한 날짜(date, YYYY-MM-DD)에 진행되는 발행된 공고들을 현장 QR 회차로 반환한다.
export async function fetchSessions(date: string): Promise<Session[]> {
  if (USE_MOCK_ADMIN_API) {
    return mockSessions;
  }

  try {
    const postings = await fetchMyPostings();

    return postings
      .filter((posting) => posting.status !== 'draft' && isDateWithinPeriod(date, posting.period))
      .map(postingToSession);
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

// period("2026-07-29" 또는 "2026-07-29 ~ 2026-07-31")에 date가 포함되는지
function isDateWithinPeriod(date: string, period: string): boolean {
  const [start = '', endRaw = ''] = period.split('~').map((part) => part.trim());

  if (!start) {
    return false;
  }

  const end = endRaw || start;

  return start <= date && date <= end;
}
