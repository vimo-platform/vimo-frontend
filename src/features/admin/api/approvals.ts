import { apiRequest } from '@/api/client';
import { fetchMyPostings } from '@/features/admin/api/postings';
import type { Approval, ApprovalStatus, Posting } from '@/features/admin/types';

type ApiApplicant = {
  applicationId?: number;
  studentId?: string;
  status?: string;
};

let approvals: Approval[] = [];

// 승인 화면에는 봉사 종료(checkout) 이후 관리자 최종 인증 대상만 노출한다.
const POST_CHECKOUT_STATUSES = new Set(['COMPLETED', 'CERTIFIED', 'CERTIFICATION_REJECTED']);

export async function fetchApprovals(): Promise<Approval[]> {
  try {
    const postings = await fetchMyPostings();
    const applicantGroups = await Promise.all(
      postings
        .filter((posting) => /^\d+$/.test(posting.id))
        .map(async (posting) => {
          const applicants = await apiRequest<ApiApplicant[]>(
            `/api/v1/admin/volunteers/${posting.id}/application`,
          ).catch(() => [] as ApiApplicant[]);

          return applicants
            .filter((applicant) => applicant.status && POST_CHECKOUT_STATUSES.has(applicant.status))
            .map((applicant) => normalizeApproval(posting, applicant));
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
  reason = '관리자 반려',
): Promise<void> {
  if (isNumericId(id)) {
    if (status === 'approved') {
      await apiRequest<void>(
        `/api/v1/admin/volunteers/applications/${id}/certification-approve`,
        { method: 'PATCH' },
      );
    }

    if (status === 'rejected') {
      await apiRequest<void>(
        `/api/v1/admin/volunteers/applications/${id}/certification-reject`,
        { method: 'PATCH', body: JSON.stringify({ reason }) },
      );
    }
  }

  approvals = approvals.map((approval) =>
    approval.id === id ? { ...approval, status } : approval,
  );
}

function normalizeApproval(posting: Posting, applicant: ApiApplicant): Approval {
  return {
    id: String(applicant.applicationId ?? ''),
    postingTitle: posting.title,
    hoursPerSession: posting.hoursPerSession,
    location: posting.location,
    period: posting.period,
    startTime: posting.startTime,
    endTime: posting.endTime,
    studentName: applicant.studentId ?? '',
    status: normalizeApprovalStatus(applicant.status),
  };
}

function normalizeApprovalStatus(status?: string): ApprovalStatus {
  if (status === 'CERTIFIED') {
    return 'approved';
  }

  if (status === 'CERTIFICATION_REJECTED') {
    return 'rejected';
  }

  return 'pending';
}

function isNumericId(id: string) {
  return /^\d+$/.test(id);
}
