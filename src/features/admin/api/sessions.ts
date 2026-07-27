import { apiRequest } from '@/api/client';
import { mockSessions } from '@/features/admin/data/mock-sessions';
import type { Session, SessionStatus } from '@/features/admin/types';

type ApiTodayVolunteer = {
  id?: number;
  title?: string;
  rewardHours?: number;
  location?: string;
  volunteerDate?: string;
  startTime?: string | { hour?: number; minute?: number };
  endTime?: string | { hour?: number; minute?: number };
  status?: string;
};

const USE_MOCK_ADMIN_API = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN_API === 'true';

export async function fetchSessions(_date: string): Promise<Session[]> {
  if (USE_MOCK_ADMIN_API) {
    return mockSessions;
  }

  try {
    const data = await apiRequest<ApiTodayVolunteer[]>('/api/v1/admin/volunteers/today');
    return data.map(normalizeSession);
  } catch {
    return [];
  }
}

function normalizeSession(data: ApiTodayVolunteer): Session {
  const id = String(data.id ?? '');

  return {
    id,
    postingId: id,
    title: data.title ?? '',
    hoursPerSession: data.rewardHours ?? 0,
    location: data.location ?? '',
    period: data.volunteerDate ?? '',
    startTime: formatTime(data.startTime),
    endTime: formatTime(data.endTime),
    status: normalizeStatus(data.status),
  };
}

function normalizeStatus(status?: string): SessionStatus {
  if (status === 'ONGOING') {
    return 'ongoing';
  }

  if (status === 'COMPLETED' || status === 'CLOSED') {
    return 'done';
  }

  return 'before';
}

function formatTime(time?: ApiTodayVolunteer['startTime']) {
  if (!time) {
    return '';
  }

  if (typeof time === 'string') {
    return time.slice(0, 5);
  }

  return `${String(time.hour ?? 0).padStart(2, '0')}:${String(time.minute ?? 0).padStart(2, '0')}`;
}
