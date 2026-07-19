import type { Session } from "@/features/admin/types";

export const mockSessions: Session[] = [
  {
    id: "s1",
    postingId: "p1",
    title: "장애학우 수업 도우미 모집",
    hoursPerSession: 3,
    location: "샬롬관 807호",
    period: "2026.03.13 ~ 2026.06.19 (매주 금요일)",
    startTime: "11:30",
    endTime: "16:30",
    status: "ongoing",
  },
  {
    id: "s2",
    postingId: "p3",
    title: "야간 자율학습 지도 보조",
    hoursPerSession: 2,
    location: "본관 201호",
    period: "2026.07.01 ~ 2026.08.31 (매주 화요일)",
    startTime: "17:00",
    endTime: "23:00",
    status: "before",
  },
];
