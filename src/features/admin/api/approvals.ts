import { mockApprovals } from "@/features/admin/data/mock-approvals";
import type { Approval, ApprovalStatus } from "@/features/admin/types";

let approvals: Approval[] = [...mockApprovals];

export async function fetchApprovals(): Promise<Approval[]> {
  return [...approvals];
}

export async function setApprovalStatus(
  id: string,
  status: ApprovalStatus,
): Promise<void> {
  approvals = approvals.map((a) => (a.id === id ? { ...a, status } : a));
}
