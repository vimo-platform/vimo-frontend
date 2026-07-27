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

const USE_MOCK_VOLUNTEERS = process.env.EXPO_PUBLIC_USE_MOCK_VOLUNTEERS === 'true';

export async function getVolunteerPosts(): Promise<VolunteerPost[]> {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(mockVolunteerPosts);
  }

  try {
    return await fetchVolunteers();
  } catch {
    return [];
  }
}

export async function getVolunteerPostById(id: number): Promise<VolunteerPost | null> {
  if (USE_MOCK_VOLUNTEERS) {
    return mockVolunteerPosts.find((post) => post.id === id) ?? null;
  }

  try {
    return await fetchVolunteerDetail(id);
  } catch {
    return null;
  }
}

export function createVolunteerApplication(volunteerId: number) {
  if (USE_MOCK_VOLUNTEERS) {
    return delay({ volunteerId, status: 'PENDING' });
  }

  return applyVolunteer(volunteerId);
}

export function deleteVolunteerApplication(
  volunteerId: number,
  payload?: { cancelReason?: string },
) {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(undefined);
  }

  return cancelVolunteerApplication(volunteerId, payload);
}

export function updateVolunteerFavorite(volunteerId: number, isFavorite: boolean) {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(undefined);
  }

  return isFavorite ? favoriteVolunteer(volunteerId) : unfavoriteVolunteer(volunteerId);
}

export function submitVolunteerActivityCertification(volunteerId: number) {
  if (USE_MOCK_VOLUNTEERS) {
    return delay(undefined);
  }

  return submitVolunteerCertification(volunteerId);
}

export async function getMyCertificationStatusRecords() {
  if (USE_MOCK_VOLUNTEERS) {
    return delay([]);
  }

  return fetchMyCertifications()
    .then((records) =>
      records.map((record) => ({
        volunteerId: record.volunteerId,
        status: record.status ?? record.applicationStatus,
        rejectedAt: record.rejectedAt,
        rejectedReason:
          record.certificationRejectReason ?? record.rejectedReason ?? record.rejectReason,
      })),
    )
    .catch(() => []);
}

function delay<T>(value: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), 250);
  });
}
