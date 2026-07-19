import { mockSessions } from "@/features/admin/data/mock-sessions";
import type { Session } from "@/features/admin/types";

export async function fetchSessions(_date: string): Promise<Session[]> {
  // TODO: GET /sessions?date=YYYY-MM-DD — 지금은 날짜와 무관하게 같은 mock 반환
  return mockSessions;
}
