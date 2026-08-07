import { apiRequest } from '@/api/client';
import { fetchMyPostings } from '@/features/admin/api/postings';
import { mockApprovals } from '@/features/admin/data/mock-approvals';
import type { Approval, ApprovalStatus, Posting } from '@/features/admin/types';

type ApiApplicant = {
  applicationId?: number;
  studentId?: string;
  status?: string;
};

let approvals: Approval[] = [];

const USE_MOCK_ADMIN_API = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN_API === 'true';

// 승인 화면에는 "봉사 종료(체크아웃) 이후" 건만 노출한다.
// 상태 흐름: PENDING(신청) → APPROVED(채택) → ATTENDED(체크인) → COMPLETED(체크아웃) → CERTIFIED/CERTIFICATION_REJECTED
const POST_CHECKOUT_STATUSES = new Set(['COMPLETED', 'CERTIFIED', 'CERTIFICATION_REJECTED']);

export async function fetchApprovals(): Promise<Approval[]> {
  if (USE_MOCK_ADMIN_API) {
    approvals = [...mockApprovals];
    return [...approvals];
  }

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
  if (!USE_MOCK_ADMIN_API && isNumericId(id)) {
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

  // COMPLETED: 봉사 종료 후 인증 승인 대기
  return 'pending';
}

function isNumericId(id: string) {
  return /^\d+$/.test(id);
}
