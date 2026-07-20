import type { Applicant } from "@/types";

export const mockApplicants: Applicant[] = [
  { id: "a1", name: "김강대", department: "사회복지학과", selected: true },
  {
    id: "a2",
    name: "김강대",
    department: "사회복지학과",
    selected: false,
    cancel: {
      at: "2026. 07. 20. 13:37",
      reason: "개인 일정으로 인해 참여가 어려워 취소합니다.\n죄송합니다.",
    },
  },
  { id: "a3", name: "김강대", department: "인공지능학과", selected: false },
  { id: "a4", name: "김강대", department: "디자인학과", selected: true },
  { id: "a5", name: "김강대", department: "사회복지학과", selected: true },
  { id: "a6", name: "김강대", department: "심리학과", selected: false },
  { id: "a7", name: "김강대", department: "체육학과", selected: true },
  { id: "a8", name: "김강대", department: "유아교육과", selected: true },
];

// 선착순 공고는 지원 순서대로 자동 확정
export const mockFcfsApplicants: Applicant[] = [
  { id: "f1", name: "양강대", department: "사회복지학과", selected: true },
  { id: "f2", name: "김강대", department: "사회복지학과", selected: true },
  { id: "f3", name: "이강대", department: "사회복지학과", selected: true },
  { id: "f4", name: "온강대", department: "사회복지학과", selected: true },
  { id: "f5", name: "박강대", department: "사회복지학과", selected: true },
];
