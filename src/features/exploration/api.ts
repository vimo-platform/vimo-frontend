import {
  applyVolunteer,
  cancelVolunteerApplication,
  favoriteVolunteer,
  fetchMyCertifications,
  fetchVolunteerDetail,
  fetchVolunteers,
  submitVolunteerCertification,
  unfavoriteVolunteer,
} from '@/api/volunteers';

import { mockVolunteerPosts } from './mock';
import type { VolunteerPost } from './types';

const USE_MOCK_VOLUNTEERS = process.env.EXPO_PUBLIC_USE_MOCK_VOLUNTEERS !== 'false';

export async function getVolunteerPosts(): Promise<VolunteerPost[]> {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(mockVolunteerPosts);
  }

  try {
    return await fetchVolunteers();
  } catch {
    return delay(mockVolunteerPosts);
  }
}

export async function getVolunteerPostById(id: number): Promise<VolunteerPost | null> {
  if (USE_MOCK_VOLUNTEERS) {
    return mockVolunteerPosts.find((post) => post.id === id) ?? null;
  }

  try {
    return await fetchVolunteerDetail(id);
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

  return applyVolunteer(volunteerId).catch(() => ({ volunteerId, status: 'PENDING' }));
}

export function deleteVolunteerApplication(
  volunteerId: number,
  payload?: { cancelReason?: string },
) {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(undefined);
  }

  return cancelVolunteerApplication(volunteerId, payload).catch(() => undefined);
}

export function updateVolunteerFavorite(volunteerId: number, isFavorite: boolean) {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(undefined);
  }

  const request = isFavorite ? favoriteVolunteer(volunteerId) : unfavoriteVolunteer(volunteerId);

  return request.catch(() => undefined);
}

export function submitVolunteerActivityCertification(volunteerId: number) {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(undefined);
  }

  return submitVolunteerCertification(volunteerId).catch(() => undefined);
}

export async function getMyCertificationStatusRecords() {
  if (USE_MOCK_VOLUNTEERS) {
    return delay([]);
  }

  return fetchMyCertifications()
    .then((records) =>
      records.map((record) => ({
        volunteerId: record.volunteerId,
        status: record.status,
        rejectedAt: record.rejectedAt,
        rejectedReason: record.rejectedReason,
      })),
    )
    .catch(() => []);
}

function delay<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 250);
  });
}
