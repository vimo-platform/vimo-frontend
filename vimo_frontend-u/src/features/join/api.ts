import { apiRequest } from '@/api/client';

import type { VolunteerSchedule } from './types';

type UserVolunteerResponse = {
  volunteerId: number;
  title: string;
  category: string;
  location: string;
  startAt: string;
  endAt: string;
  applicationStatus: 'APPROVED' | 'COMPLETED' | string;
};

export async function getMyVolunteerSchedules(): Promise<VolunteerSchedule[]> {
  const data = await apiRequest<UserVolunteerResponse[]>('/api/v1/users/me/volunteers');

  return data.map((item) => {
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
      status: 'before',
      title: item.title,
      credit: `봉사 인정 시간 : ${formatCredit(hours)} 인정`,
      location: item.location,
    };
  });
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
