import { apiRequest } from '@/api/client';
import { mockApplicants, mockFcfsApplicants } from '@/features/admin/data/mock-applicants';
import type { Applicant } from '@/features/admin/types';

type ApiApplicant = {
  applicationId?: number;
  studentId?: string;
  status?: string;
  appliedAt?: string;
};

const USE_MOCK_ADMIN_API = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN_API === 'true';

export async function fetchApplicants(postingId: string): Promise<Applicant[]> {
  if (USE_MOCK_ADMIN_API) {
    return mockApplicants;
  }

  if (isNumericId(postingId)) {
    try {
      const data = await apiRequest<ApiApplicant[]>(
        `/api/v1/admin/volunteers/${postingId}/application`,
      );

      return data.map(normalizeApplicant);
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

      return data.map(normalizeApplicant);
    } catch {
      return [];
    }
  }

  return [];
}

// 신청 채택(선발): PENDING -> APPROVED
export async function approveApplicant(applicationId: string): Promise<void> {
  if (USE_MOCK_ADMIN_API || !isNumericId(applicationId)) {
    return;
  }

  await apiRequest<void>(`/api/v1/admin/volunteers/applications/${applicationId}/approve`, {
    method: 'PATCH',
  });
}

// 신청 반려: PENDING -> REJECTED
export async function rejectApplicant(applicationId: string, reason = '관리자 반려'): Promise<void> {
  if (USE_MOCK_ADMIN_API || !isNumericId(applicationId)) {
    return;
  }

  await apiRequest<void>(`/api/v1/admin/volunteers/applications/${applicationId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

function normalizeApplicant(data: ApiApplicant): Applicant {
  return {
    id: String(data.applicationId ?? data.studentId ?? ''),
    name: data.studentId ?? '',
    department: data.status ?? '',
    selected: data.status === 'APPROVED' || data.status === 'ATTENDED' || data.status === 'COMPLETED',
  };
}

function isNumericId(id: string) {
  return /^\d+$/.test(id);
}
