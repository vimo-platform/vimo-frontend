import { apiRequest } from '@/services/common/client';
import type { Participant, ParticipantStatus } from '@/types/admin';

type ApiParticipant = {
  applicationId?: number;
  studentId?: string;
  studentName?: string;
  majorName?: string;
  Major?: string;
  status?: string;
};

type LiveStatusDetailResponse = {
  summary?: {
    totalApplicants?: number;
    attendedCount?: number;
    absentCount?: number;
  };
  participants?: ApiParticipant[];
};

const MAJOR_LABELS: Record<string, string> = {
  SOCIAL_WELFARE: '사회복지학과',
  COMPUTER_SCIENCE: '컴퓨터공학부',
};

export async function fetchParticipants(postingId: string): Promise<Participant[]> {
  try {
    const [liveStatus, participantProfiles] = await Promise.all([
      apiRequest<LiveStatusDetailResponse>(
        `/api/v1/admin/volunteers/${postingId}/live-status`,
      ),
      fetchParticipantProfiles(postingId),
    ]);
    const profileByApplicationId = new Map(
      participantProfiles
        .filter((profile) => typeof profile.applicationId === 'number')
        .map((profile) => [profile.applicationId, profile]),
    );
    const profileByStudentId = new Map(
      participantProfiles
        .filter((profile) => profile.studentId)
        .map((profile) => [profile.studentId, profile]),
    );

    return (liveStatus.participants ?? []).map((participant) =>
      normalizeParticipant(
        participant,
        (typeof participant.applicationId === 'number'
          ? profileByApplicationId.get(participant.applicationId)
          : undefined) ??
          (participant.studentId
            ? profileByStudentId.get(participant.studentId)
            : undefined),
      ),
    );
  } catch {
    return [];
  }
}

async function fetchParticipantProfiles(postingId: string): Promise<ApiParticipant[]> {
  try {
    return await apiRequest<ApiParticipant[]>(
      `/api/v1/admin/volunteers/${postingId}/application`,
    );
  } catch {
    return [];
  }
}

function normalizeParticipant(data: ApiParticipant, profile?: ApiParticipant): Participant {
  return {
    id: String(data.applicationId ?? data.studentId ?? ''),
    name: data.studentName ?? profile?.studentName ?? data.studentId ?? '',
    department:
      data.majorName ??
      profile?.majorName ??
      formatMajorLabel(data.Major ?? profile?.Major) ??
      '학과 정보 없음',
    status: normalizeStatus(data.status ?? profile?.status),
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

  if (status === 'COMPLETED' || status === 'CERTIFIED') {
    return 'done';
  }

  return 'none';
}
