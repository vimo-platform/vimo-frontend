import { apiRequest } from '@/api/client';
import { mockParticipants } from '@/features/admin/data/mock-participants';
import type { Participant, ParticipantStatus } from '@/features/admin/types';

type ApiParticipant = {
  applicationId?: number;
  studentId?: string;
  name?: string;
  Major?: string;
  student?: ApiParticipantProfile;
  account?: ApiParticipantProfile;
  user?: ApiParticipantProfile;
  status?: string;
};

type ApiParticipantProfile = {
  studentId?: string;
  name?: string;
};

const USE_MOCK_ADMIN_API = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN_API === 'true';

const MAJOR_LABELS: Record<string, string> = {
  SOCIAL_WELFARE: '사회복지학과',
  COMPUTER_SCIENCE: '컴퓨터공학부',
  LIBERAL_STUDIES: '자유전공학부',
  SENIOR_BUSINESS: '시니어비즈니스학과',
  COMMERCE: '글로벌경영학부',
  LAW_PUBLIC_ADMINISTRATION_TAXATION: '법행정세무학부',
  CULTURE_CONTENTS: '문화콘텐츠학과',
  INTERNATIONAL_AREA_STUDIES: '국제지역학부',
  CHINESE_CONTENTS_BUSINESS: '중국콘텐츠비즈니스학과',
  CHRISTIAN_COMMUNICATION: '기독교커뮤니케이션학과',
  AI_CONVERGENCE_ENGINEERING: 'AI융합공학부',
  ELECTRONICS_SEMICONDUCTOR_ENGINEERING: '전자반도체공학부',
  REAL_ESTATE_CONSTRUCTION: '부동산건설학부',
  DESIGN: '디자인학부',
  PHYSICAL_EDUCATION: '스포츠복지학과',
  MUSIC: '음악학과',
  EDUCATION: '교육학과',
  EARLY_CHILDHOOD_EDUCATION: '유아교육과',
  ELEMENTARY_SPECIAL_EDUCATION: '초등특수교육과',
  SECONDARY_SPECIAL_EDUCATION: '중등특수교육과',
};

const EMPTY_DEPARTMENT_LABELS = new Set([
  'NONE',
  'NULL',
  'UNKNOWN',
  '학과 정보 없음',
  '학과정보없음',
  '학과 없음',
  '학과없음',
]);

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
    name: getParticipantName(data),
    department: getParticipantDepartment(data),
    status: normalizeStatus(data.status),
  };
}

function getParticipantName(data: ApiParticipant) {
  return (
    data.name ??
    data.student?.name ??
    data.account?.name ??
    data.user?.name ??
    data.studentId ??
    data.student?.studentId ??
    data.account?.studentId ??
    data.user?.studentId ??
    ''
  );
}

function getParticipantDepartment(data: ApiParticipant) {
  return formatMajorLabel(data.Major) ?? '학과 정보 없음';
}

function formatMajorLabel(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();
  const upperValue = normalizedValue.toUpperCase();

  if (
    !normalizedValue ||
    EMPTY_DEPARTMENT_LABELS.has(upperValue) ||
    EMPTY_DEPARTMENT_LABELS.has(normalizedValue)
  ) {
    return null;
  }

  return MAJOR_LABELS[upperValue] ?? normalizedValue;
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
