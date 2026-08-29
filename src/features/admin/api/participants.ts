import { apiRequest } from '@/api/client';
import type { Participant, ParticipantStatus } from '@/features/admin/types';

type ApiParticipant = {
  applicationId?: number;
  studentId?: string;
  studentName?: string;
  majorName?: string;
  Major?: string;
  status?: string;
};

const MAJOR_LABELS: Record<string, string> = {
  SOCIAL_WELFARE: '사회복지학과',
  COMPUTER_SCIENCE: '컴퓨터공학부',
};

export async function fetchParticipants(postingId: string): Promise<Participant[]> {
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
    name: data.studentName ?? data.studentId ?? '',
    department: data.majorName ?? formatMajorLabel(data.Major) ?? '학과 정보 없음',
    status: normalizeStatus(data.status),
  };
}

function formatMajorLabel(value?: string | null) {
  if (!value) {
    return null;
  }

  return MAJOR_LABELS[value] ?? value;
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
