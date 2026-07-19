import type { Applicant } from "@/features/admin/types";

export const mockApplicants: Applicant[] = [
  { id: "a1", name: "김강대", department: "사회복지학과", selected: true },
  { id: "a2", name: "김강대", department: "컴퓨터공학과", selected: false },
  { id: "a3", name: "김강대", department: "인공지능학과", selected: false },
  { id: "a4", name: "김강대", department: "디자인학과", selected: true },
  { id: "a5", name: "김강대", department: "사회복지학과", selected: true },
  { id: "a6", name: "김강대", department: "심리학과", selected: false },
  { id: "a7", name: "김강대", department: "체육학과", selected: true },
  { id: "a8", name: "김강대", department: "유아교육과", selected: true },
];
