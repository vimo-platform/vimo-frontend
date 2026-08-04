import { apiRequest } from '@/api/client';

import { mockVolunteerSchedules } from './mock';
import type { VolunteerSchedule } from './types';

type UserVolunteerResponse = {
  volunteerId: number;
  title: string;
  category?: string;
  location: string;
  startAt: string;
  endAt: string;
  applicationStatus: 'APPROVED' | 'ATTENDED' | 'COMPLETED' | string;
};

type UserApplicationResponse = Partial<UserVolunteerResponse> & {
  status?: string;
  volunteer?: Partial<UserVolunteerResponse>;
};

const USE_MOCK_SCHEDULES = process.env.EXPO_PUBLIC_USE_MOCK_SCHEDULES === 'true';

export async function getMyVolunteerSchedules(): Promise<VolunteerSchedule[]> {
  if (USE_MOCK_SCHEDULES) {
    return mockVolunteerSchedules;
  }

  let data: UserVolunteerResponse[] = [];

  try {
    data = await apiRequest<UserVolunteerResponse[]>('/api/v1/users/me/volunteers');
  } catch {
    data = [];
  }

  try {
    const applications = await apiRequest<UserApplicationResponse[]>('/api/v1/users/me/applications');
    data = mergeScheduleSources(data, applications);
  } catch {
    // The participation endpoint may already include every in-progress schedule.
  }

  return data
    .filter((item) => item.applicationStatus === 'APPROVED' || item.applicationStatus === 'ATTENDED')
    .map(mapScheduleResponse);
}

function mergeScheduleSources(
  schedules: UserVolunteerResponse[],
  applications: UserApplicationResponse[],
) {
  const scheduleMap = new Map<number, UserVolunteerResponse>();

  schedules.forEach((schedule) => {
    scheduleMap.set(schedule.volunteerId, schedule);
  });

  applications
    .map(normalizeApplicationSchedule)
    .filter((item): item is UserVolunteerResponse => Boolean(item))
    .forEach((application) => {
      scheduleMap.set(application.volunteerId, {
        ...scheduleMap.get(application.volunteerId),
        ...application,
      });
    });

  return Array.from(scheduleMap.values());
}

function normalizeApplicationSchedule(
  application: UserApplicationResponse,
): UserVolunteerResponse | null {
  const volunteer = application.volunteer ?? {};
  const volunteerId = application.volunteerId ?? volunteer.volunteerId;
  const startAt = application.startAt ?? volunteer.startAt;
  const endAt = application.endAt ?? volunteer.endAt;
  const title = application.title ?? volunteer.title;
  const location = application.location ?? volunteer.location;
  const applicationStatus = application.applicationStatus ?? application.status;

  if (
    typeof volunteerId !== 'number' ||
    !startAt ||
    !endAt ||
    !title ||
    !location ||
    !applicationStatus
  ) {
    return null;
  }

  return {
    volunteerId,
    title,
    category: application.category ?? volunteer.category ?? '',
    location,
    startAt,
    endAt,
    applicationStatus,
  };
}

function mapScheduleResponse(item: UserVolunteerResponse): VolunteerSchedule {
  const start = parseDateTime(item.startAt);
  const end = parseDateTime(item.endAt);
  const hours = getCreditHours(item.startAt, item.endAt);

  return {
    id: item.volunteerId,
    postId: item.volunteerId,
    startDate: start.date,
    endDate: end.date,
    repeatWeekday: new Date(item.startAt).getDay(),
    startTime: start.time,
    endTime: end.time,
    status: item.applicationStatus === 'ATTENDED' ? 'active' : 'before',
    applicationStatus: item.applicationStatus,
    title: item.title,
    credit: `봉사 인정 시간 : ${formatCredit(hours)} 인정`,
    location: item.location,
  };
}

function parseDateTime(value: string) {
  const [date = '', time = ''] = value.split('T');

  return {
    date,
    time: time.slice(0, 5),
  };
}

function getCreditHours(startAt: string, endAt: string) {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.round((end - start) / (1000 * 60 * 60));
}

function formatCredit(hours: number) {
  return hours >= 6 ? `일 최대 ${hours}시간` : `회차당 ${hours}시간`;
}
