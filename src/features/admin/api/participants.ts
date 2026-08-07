import { apiRequest } from '@/api/client';
import { mockParticipants } from '@/features/admin/data/mock-participants';
import type { Participant, ParticipantStatus } from '@/features/admin/types';

type ApiParticipant = {
  applicationId?: number;
  studentId?: string;
  name?: string;
  department?: string;
  departmentName?: string;
  status?: string;
};

const USE_MOCK_ADMIN_API = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN_API === 'true';

export async function fetchParticipants(postingId: string): Promise<Participant[]> {
  if (USE_MOCK_ADMIN_API) {
    return mockParticipants;
  }

  try {
    const data = await apiRequest<ApiParticipant[]>(
      `/api/v1/admin/volunteers/${postingId}/live-status`,
    );

    return data.map(normalizeParticipant);
  } catch {
    return [];
  }
}

function normalizeParticipant(data: ApiParticipant): Participant {
  return {
    id: String(data.applicationId ?? data.studentId ?? ''),
    name: data.name ?? data.studentId ?? '',
    department: data.departmentName ?? data.department ?? '',
    status: normalizeStatus(data.status),
  };
}

function normalizeStatus(status?: string): ParticipantStatus {
  if (status === 'ATTENDED' || status === 'ONGOING') {
    return 'ongoing';
  }

  if (status === 'COMPLETED' || status === 'CERTIFIED' || status === 'APPROVED') {
    return 'done';
  }

  return 'none';
}
