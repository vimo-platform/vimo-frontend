import { apiRequest } from '@/api/client';

import { mockVolunteerPosts } from './mock';
import type { VolunteerPost, VolunteerStatus } from './types';

type VolunteerSummaryResponse = {
  id: number;
  title: string;
  category: string;
  location: string;
  startAt: string;
  endAt: string;
  status: VolunteerStatus;
};

type VolunteerDetailResponse = VolunteerSummaryResponse & {
  description: string;
  capacity: number;
};

type ApplicationResponse = {
  volunteerId: number;
  status: 'PENDING' | string;
};

const USE_MOCK_VOLUNTEERS = process.env.EXPO_PUBLIC_USE_MOCK_VOLUNTEERS !== 'false';

export async function getVolunteerPosts(): Promise<VolunteerPost[]> {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(mockVolunteerPosts);
  }

  try {
    const data = await apiRequest<VolunteerSummaryResponse[]>('/api/v1/volunteers');

    return data.map(normalizePost);
  } catch {
    return delay(mockVolunteerPosts);
  }
}

export async function getVolunteerPostById(id: number): Promise<VolunteerPost | null> {
  if (USE_MOCK_VOLUNTEERS) {
    return mockVolunteerPosts.find((post) => post.id === id) ?? null;
  }

  try {
    const data = await apiRequest<VolunteerDetailResponse>(`/api/v1/volunteers/${id}`);

    return normalizePost(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes('공고를 찾을 수 없습니다')) {
      return null;
    }

    return mockVolunteerPosts.find((post) => post.id === id) ?? null;
  }
}

export function createVolunteerApplication(volunteerId: number) {
  if (USE_MOCK_VOLUNTEERS) {
    return delay({ volunteerId, status: 'PENDING' });
  }

  return apiRequest<ApplicationResponse>(`/api/v1/volunteers/${volunteerId}/application`, {
    method: 'POST',
  }).catch(() => ({ volunteerId, status: 'PENDING' }));
}

export function deleteVolunteerApplication(volunteerId: number) {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(undefined);
  }

  return apiRequest<void>(`/api/v1/volunteers/${volunteerId}/application`, {
    method: 'DELETE',
  }).catch(() => undefined);
}

function normalizePost(post: VolunteerSummaryResponse | VolunteerDetailResponse): VolunteerPost {
  const start = parseDateTime(post.startAt);
  const end = parseDateTime(post.endAt);
  const capacity = 'capacity' in post ? post.capacity : 0;

  return {
    id: post.id,
    title: post.title,
    organization: post.category,
    location: post.location,
    category: post.category,
    startDate: start.date,
    endDate: end.date,
    startTime: start.time,
    endTime: end.time,
    recruitmentEndDate: start.date,
    neededCount: capacity,
    appliedCount: 0,
    creditHours: getCreditHours(post.startAt, post.endAt),
    status: post.status,
    participationCondition: '정기 참여 가능자 우대',
    cancelPolicy: '취소 불가',
    guideTitle: '모집 안내',
    description: 'description' in post ? post.description : '',
    requirements: [],
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

function delay<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 250);
  });
}
