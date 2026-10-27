import type { ApiApplication } from '@/services/common/volunteers';
import type { VolunteerRecruitType } from '@/types/exploration/types';

export function getApplicationOutcome(
  recruitType: VolunteerRecruitType | undefined,
  application: Pick<ApiApplication, 'status' | 'applicationStatus'> | null | undefined,
): 'confirmed' | 'pending' | 'unknown' {
  const status = (application?.applicationStatus ?? application?.status)?.trim().toUpperCase();

  // A first-come application must never enter the selection waiting screen.
  // APPROVED is authoritative even when cached recruitment metadata is missing or stale.
  if (recruitType === 'fcfs' || status === 'APPROVED') {
    return 'confirmed';
  }

  if (status === 'PENDING') {
    return 'pending';
  }

  return 'unknown';
}
