import { mockParticipants } from "@/features/admin/data/mock-participants";
import type { Participant } from "@/features/admin/types";

export async function fetchParticipants(_postingId: string): Promise<Participant[]> {
  return mockParticipants;
}
