import { apiRequest } from '@/api/client';
import { mockApplicants, mockFcfsApplicants } from '@/features/admin/data/mock-applicants';
import type { Applicant } from '@/features/admin/types';

type ApiApplicant = {
  applicationId?: number;
  volunteerId?: number;
  studentId?: string;
  studentName?: string;
  name?: string;
  department?: string;
  departmentName?: string;
  major?: string;
  majorName?: string;
  studentDepartment?: string;
  studentDepartmentName?: string;
  studentMajor?: string;
  studentMajorName?: string;
  introduction?: string;
  status?: string;
  appliedAt?: string;
};

type ApiCancellationNotice = {
  studentId?: string;
  studentName?: string;
  name?: string;
  department?: string;
  departmentName?: string;
  major?: string;
  majorName?: string;
  studentDepartment?: string;
  studentDepartmentName?: string;
  studentMajor?: string;
  studentMajorName?: string;
  reason?: string;
  canceledAt?: string;
};

const USE_MOCK_ADMIN_API = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN_API === 'true';

const MAJOR_LABELS: Record<string, string> = {
  SOCIAL_WELFARE: '사회복지학과',
  COMPUTER_SCIENCE: '컴퓨터공학과',
};

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
  return data.studentName ?? data.name ?? data.studentId ?? '';
}

function getApplicantDepartment(data: ApiApplicant | ApiCancellationNotice) {
  return (
    [
      data.majorName,
      data.major,
      data.studentMajorName,
      data.studentMajor,
      data.departmentName,
      data.department,
      data.studentDepartmentName,
      data.studentDepartment,
    ]
      .map(formatMajorLabel)
      .find((department) => department !== null) ?? '학과 정보 없음'
  );
}

function formatMajorLabel(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();
  const upperValue = normalizedValue.toUpperCase();

  if (!normalizedValue || upperValue === 'NONE' || upperValue === 'NULL') {
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
