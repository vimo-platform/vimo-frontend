import { apiRequest } from '@/api/client';
import { mockApprovals } from '@/features/admin/data/mock-approvals';
import type { Approval, ApprovalStatus } from '@/features/admin/types';

type ApiVolunteerListItem = {
  id?: number;
  title?: string;
  volunteerDate?: string;
};

type ApiApplicant = {
  applicationId?: number;
  studentId?: string;
  status?: string;
};

let approvals: Approval[] = [];

const USE_MOCK_ADMIN_API = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN_API === 'true';

export async function fetchApprovals(): Promise<Approval[]> {
  if (USE_MOCK_ADMIN_API) {
    approvals = [...mockApprovals];
    return [...approvals];
  }

  try {
    const volunteers = await apiRequest<ApiVolunteerListItem[]>('/api/v1/admin/volunteers');
    const applicantGroups = await Promise.all(
      volunteers
        .filter((volunteer) => typeof volunteer.id === 'number')
        .map(async (volunteer) => {
          const applicants = await apiRequest<ApiApplicant[]>(
            `/api/v1/admin/volunteers/${volunteer.id}/application`,
          );

          return applicants.map((applicant) => normalizeApproval(volunteer, applicant));
        }),
    );

    approvals = applicantGroups.flat();
  } catch {
    approvals = [];
  }

  return [...approvals];
}

export async function setApprovalStatus(
  id: string,
  status: ApprovalStatus,
): Promise<void> {
  if (!USE_MOCK_ADMIN_API && isNumericId(id)) {
    if (status === 'approved') {
      await apiRequest<void>(`/api/v1/admin/volunteers/applications/${id}/approve`, {
        method: 'PATCH',
      });
    }

    if (status === 'rejected') {
      await apiRequest<void>(`/api/v1/admin/volunteers/applications/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: '관리자 반려' }),
      });
    }
  }

  approvals = approvals.map((approval) =>
    approval.id === id ? { ...approval, status } : approval,
  );
}

function normalizeApproval(volunteer: ApiVolunteerListItem, applicant: ApiApplicant): Approval {
  return {
    id: String(applicant.applicationId ?? ''),
    postingTitle: volunteer.title ?? '',
    hoursPerSession: 0,
    location: '',
    period: volunteer.volunteerDate ?? '',
    startTime: '',
    endTime: '',
    studentName: applicant.studentId ?? '',
    status: normalizeApprovalStatus(applicant.status),
  };
}

function normalizeApprovalStatus(status?: string): ApprovalStatus {
  if (status === 'APPROVED' || status === 'ATTENDED' || status === 'COMPLETED') {
    return 'approved';
  }

  if (status === 'REJECTED' || status === 'ABSENT') {
    return 'rejected';
  }

  return 'pending';
}

function isNumericId(id: string) {
  return /^\d+$/.test(id);
}
