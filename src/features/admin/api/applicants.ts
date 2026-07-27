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
