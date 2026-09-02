import { apiRequest } from '@/services/common/client';

import type { VolunteerSchedule } from '@/types/join/types';

type UserVolunteerResponse = {
  volunteerId: number;
  title: string;
  category?: string;
  location: string;
  startAt: string;
  endAt: string;
  applicationStatus: 'APPROVED' | 'ATTENDED' | 'COMPLETED' | string;
};

export async function getMyVolunteerSchedules(): Promise<VolunteerSchedule[]> {
  let data: UserVolunteerResponse[] = [];

  try {
    data = await apiRequest<UserVolunteerResponse[]>('/api/v1/users/me/volunteers');
  } catch {
    data = [];
  }

  try {
    const applications = await apiRequest<UserVolunteerResponse[]>('/api/v1/users/me/applications');
    data = mergeScheduleSources(data, applications);
  } catch {
    // 참여 예정 조회 API가 현재 진행 중인 일정까지 포함하면 추가 병합 없이 그대로 사용한다.
  }

  return data
    .filter((item) => item.applicationStatus === 'APPROVED' || item.applicationStatus === 'ATTENDED')
    .map(mapScheduleResponse);
}

function mergeScheduleSources(
  schedules: UserVolunteerResponse[],
  applications: UserVolunteerResponse[],
) {
  const scheduleMap = new Map<number, UserVolunteerResponse>();

  schedules.forEach((schedule) => {
    scheduleMap.set(schedule.volunteerId, schedule);
  });

  applications.forEach((application) => {
    scheduleMap.set(application.volunteerId, {
      ...scheduleMap.get(application.volunteerId),
      ...application,
    });
  });

  return Array.from(scheduleMap.values());
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
    repeatWeekday: getRepeatWeekday(item.startAt, item.endAt),
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

function getRepeatWeekday(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    return undefined;
  }

  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return days >= 8 ? start.getDay() : undefined;
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
