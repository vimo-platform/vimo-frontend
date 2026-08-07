import { apiRequest } from '@/api/client';
import { mockApplicants, mockFcfsApplicants } from '@/features/admin/data/mock-applicants';
import type { Applicant } from '@/features/admin/types';

type ApiApplicant = {
  applicationId?: number;
  volunteerId?: number;
  studentId?: string;
  studentName?: string;
  name?: string;
  Major?: string;
  introduction?: string;
  status?: string;
  appliedAt?: string;
  student?: ApiApplicantProfile;
  account?: ApiApplicantProfile;
  user?: ApiApplicantProfile;
};

type ApiCancellationNotice = {
  studentId?: string;
  studentName?: string;
  name?: string;
  Major?: string;
  reason?: string;
  canceledAt?: string;
  student?: ApiApplicantProfile;
  account?: ApiApplicantProfile;
  user?: ApiApplicantProfile;
};

type ApiApplicantProfile = {
  studentId?: string;
  studentName?: string;
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

export async function fetchApplicants(postingId: string): Promise<Applicant[]> {
  if (USE_MOCK_ADMIN_API) {
    return mockApplicants;
  }

  if (isNumericId(postingId)) {
    try {
      const data = await apiRequest<ApiApplicant[]>(
        `/api/v1/admin/volunteers/${postingId}/application`,
      );
      const detailedData = await fetchApplicantDetails(data);
      const cancellations = await fetchCancellationNotices(postingId);

      return mergeApplicantsWithCancellations(detailedData, cancellations);
    } catch {
      return [];
    }
  }

  return [];
}

export async function fetchFcfsApplicants(postingId: string): Promise<Applicant[]> {
  if (USE_MOCK_ADMIN_API) {
    return mockFcfsApplicants;
  }

  if (isNumericId(postingId)) {
    try {
      const data = await apiRequest<ApiApplicant[]>(
        `/api/v1/admin/volunteers/${postingId}/application`,
      );
      const detailedData = await fetchApplicantDetails(data);

      return detailedData.map((applicant) => normalizeApplicant(applicant));
    } catch {
      return [];
    }
  }

  return [];
}

export async function approveApplicant(applicationId: string): Promise<void> {
  if (USE_MOCK_ADMIN_API || !isNumericId(applicationId)) {
    return;
  }

  await apiRequest<void>(`/api/v1/admin/volunteers/applications/${applicationId}/approve`, {
    method: 'PATCH',
  });
}

export async function rejectApplicant(applicationId: string, reason = '관리자 반려'): Promise<void> {
  if (USE_MOCK_ADMIN_API || !isNumericId(applicationId)) {
    return;
  }

  await apiRequest<void>(`/api/v1/admin/volunteers/applications/${applicationId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

async function fetchApplicantDetails(applicants: ApiApplicant[]) {
  return Promise.all(
    applicants.map(async (applicant) => {
      if (typeof applicant.applicationId !== 'number') {
        return applicant;
      }

      try {
        const detail = await apiRequest<ApiApplicant>(
          `/api/v1/admin/volunteers/applications/${applicant.applicationId}`,
        );

        return { ...applicant, ...detail };
      } catch {
        return applicant;
      }
    }),
  );
}

async function fetchCancellationNotices(postingId: string) {
  try {
    return await apiRequest<ApiCancellationNotice[]>(
      `/api/v1/admin/volunteers/${postingId}/cancellations`,
    );
  } catch {
    return [];
  }
}

function mergeApplicantsWithCancellations(
  applicants: ApiApplicant[],
  cancellations: ApiCancellationNotice[],
) {
  const cancellationByStudentId = new Map(
    cancellations
      .filter((cancellation) => cancellation.studentId)
      .map((cancellation) => [cancellation.studentId, cancellation]),
  );
  const normalizedApplicants = applicants.map((applicant) => {
    const cancellation = applicant.studentId
      ? cancellationByStudentId.get(applicant.studentId)
      : undefined;

    if (cancellation?.studentId) {
      cancellationByStudentId.delete(cancellation.studentId);
    }

    return normalizeApplicant(applicant, cancellation);
  });
  const canceledOnlyApplicants = Array.from(cancellationByStudentId.values()).map(
    normalizeCanceledApplicant,
  );

  return [...normalizedApplicants, ...canceledOnlyApplicants];
}

function normalizeApplicant(data: ApiApplicant, cancellation?: ApiCancellationNotice): Applicant {
  return {
    id: String(data.applicationId ?? data.studentId ?? ''),
    name: getApplicantName(data),
    department: getApplicantDepartment(data),
    selected: data.status === 'APPROVED' || data.status === 'ATTENDED' || data.status === 'COMPLETED',
    cancel: cancellation ? normalizeCancellation(cancellation) : undefined,
  };
}

function normalizeCanceledApplicant(cancellation: ApiCancellationNotice): Applicant {
  return {
    id: `canceled-${cancellation.studentId ?? cancellation.canceledAt ?? ''}`,
    name: getApplicantName(cancellation),
    department: getApplicantDepartment(cancellation),
    selected: false,
    cancel: normalizeCancellation(cancellation),
  };
}

function normalizeCancellation(cancellation: ApiCancellationNotice) {
  return {
    at: formatCanceledAt(cancellation.canceledAt),
    reason: cancellation.reason?.trim() || '취소 사유가 없습니다.',
  };
}

function getApplicantName(data: ApiApplicant | ApiCancellationNotice) {
  return (
    data.studentName ??
    data.name ??
    data.student?.studentName ??
    data.student?.name ??
    data.account?.studentName ??
    data.account?.name ??
    data.user?.studentName ??
    data.user?.name ??
    data.studentId ??
    data.student?.studentId ??
    data.account?.studentId ??
    data.user?.studentId ??
    ''
  );
}

function getApplicantDepartment(data: ApiApplicant | ApiCancellationNotice) {
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

function formatCanceledAt(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.replace('T', ' ').slice(0, 16);
  }

  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(
    date.getDate(),
  ).padStart(2, '0')}. ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

function isNumericId(id: string) {
  return /^\d+$/.test(id);
}
