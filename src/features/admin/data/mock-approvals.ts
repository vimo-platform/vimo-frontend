import type { Approval } from "@/features/admin/types";

const base = {
  postingTitle: "장애학우 수업 도우미 모집",
  hoursPerSession: 3,
  location: "샬롬관 807호",
  period: "2026.03.13 ~ 2026.06.19 (매주 금요일)",
  startTime: "11:30",
  endTime: "16:30",
};

export const mockApprovals: Approval[] = [
  { id: "ap1", ...base, studentName: "김강대", status: "pending" },
  { id: "ap2", ...base, studentName: "김강대", status: "pending" },
  { id: "ap3", ...base, studentName: "김강대", status: "approved" },
  { id: "ap4", ...base, studentName: "김강대", status: "approved" },
  { id: "ap5", ...base, studentName: "김강대", status: "approved" },
  { id: "ap6", ...base, studentName: "김강대", status: "approved" },
  { id: "ap7", ...base, studentName: "김강대", status: "approved" },
  { id: "ap8", ...base, studentName: "김강대", status: "rejected" },
];
