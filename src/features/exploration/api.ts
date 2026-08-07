import {
  applyVolunteer,
  cancelVolunteerApplication,
  favoriteVolunteer,
  fetchMyCertifications,
  fetchVolunteerDetail,
  fetchVolunteers,
  unfavoriteVolunteer,
} from '@/api/volunteers';

import type { VolunteerPost } from './types';

export async function getVolunteerPosts(): Promise<VolunteerPost[]> {
  try {
    return await fetchVolunteers();
  } catch {
    return [];
  }
}

export async function getVolunteerPostById(id: number): Promise<VolunteerPost | null> {
  try {
    return await fetchVolunteerDetail(id);
  } catch {
    return null;
  }
}

export function createVolunteerApplication(volunteerId: number) {
  return applyVolunteer(volunteerId);
}

export function deleteVolunteerApplication(
  volunteerId: number,
  payload?: { cancelReason?: string },
) {
  return cancelVolunteerApplication(volunteerId, payload);
}

export function updateVolunteerFavorite(volunteerId: number, isFavorite: boolean) {
  return isFavorite ? favoriteVolunteer(volunteerId) : unfavoriteVolunteer(volunteerId);
}

export async function getMyCertificationStatusRecords() {
  return fetchMyCertifications()
    .then((records) =>
      records.map((record) => ({
        volunteerId: record.volunteerId,
        status: String(record.status ?? record.applicationStatus ?? ''),
        rejectedAt: record.rejectedAt,
        rejectedReason:
          record.certificationRejectReason ?? record.rejectReason,
      })),
    )
    .catch(() => []);
}
